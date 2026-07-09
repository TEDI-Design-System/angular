import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { CdkOverlayOrigin } from "@angular/cdk/overlay";
import { DropdownComponent } from "../dropdown.component";

export type DropdownTriggerAriaHasPopup = "menu" | "listbox" | "dialog" | "true";

const FOCUSABLE_SELECTOR = "button, a[href], [tabindex]";

@Directive({
  standalone: true,
  selector: "[tedi-dropdown-trigger]",
  hostDirectives: [CdkOverlayOrigin],
})
export class DropdownTriggerDirective implements AfterViewInit {
  /** Defines the aria-haspopup attribute for the trigger, informing assistive technologies whether it opens a menu or listbox. Improves accessibility by describing the type of popup. */
  readonly ariaHaspopup = input<DropdownTriggerAriaHasPopup>("menu");

  readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly dropdown = inject(DropdownComponent);
  readonly overlayOrigin = inject(CdkOverlayOrigin, { self: true });
  private readonly renderer = inject(Renderer2);

  /**
   * The element that actually receives focus and ARIA semantics. When the directive
   * sits on a native `<button>`/`<a href>` that element is used directly. When it wraps
   * a button component (e.g. `<app-button>` that renders its own native button), the
   * inner focusable element is used instead — otherwise the wrapper and the inner button
   * would both be tab stops, and the ARIA state would land on the wrong element.
   */
  private readonly triggerElement = signal<HTMLElement | null>(null);

  constructor() {
    effect(() => {
      const el = this.triggerElement();
      if (!el) return;

      this.renderer.setAttribute(
        el,
        "id",
        `${this.dropdown.containerId()}_trigger`,
      );
      this.renderer.setAttribute(el, "aria-controls", this.dropdown.containerId());
      this.renderer.setAttribute(el, "aria-haspopup", this.ariaHaspopup());
      this.renderer.setAttribute(
        el,
        "aria-expanded",
        String(this.dropdown.isOpen()),
      );

      if (!this.isNativelyFocusable(el)) {
        this.renderer.setAttribute(el, "role", "button");
        this.renderer.setAttribute(el, "tabindex", "0");
      }
    });
  }

  ngAfterViewInit() {
    this.triggerElement.set(this.resolveTriggerElement());
  }

  focus() {
    this.triggerElement()?.focus();
  }

  /** The element that is actually in the tab order — the resolved interactive
   * element, which may be a button nested inside a wrapping component. */
  get focusableElement(): HTMLElement {
    return this.triggerElement() ?? this.host.nativeElement;
  }

  @HostListener("click")
  onClick() {
    this.dropdown.toggleDropdown();
  }

  @HostListener("keydown", ["$event"])
  onKeydown(event: KeyboardEvent) {
    const key = event.key;

    switch (key) {
      case "ArrowDown":
        event.preventDefault();
        this.openAndFocusFirst();
        break;

      case "ArrowUp":
        event.preventDefault();
        this.openAndFocusLast();
        break;

      case "Escape":
        event.preventDefault();
        this.dropdown.hideDropdown();
        this.focus();
        break;

      case " ":
      case "Enter": {
        // Native <button>/<a href> already synthesise a click on Space/Enter
        // (handled by onClick). For a non-native element promoted to
        // role="button" (e.g. a wrapper around a search field), replicate that
        // activation so the dropdown can be opened from the keyboard — including
        // when focus sits on a control nested inside the trigger.
        const trigger = this.triggerElement();
        if (trigger && !this.isNativelyFocusable(trigger)) {
          event.preventDefault();
          this.dropdown.toggleDropdown();
        }
        break;
      }
    }
  }

  private resolveTriggerElement(): HTMLElement {
    const el = this.host.nativeElement;
    if (this.isNativelyFocusable(el)) return el;
    return el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? el;
  }

  private isNativelyFocusable(el: HTMLElement): boolean {
    return (
      el.tagName === "BUTTON" || (el.tagName === "A" && el.hasAttribute("href"))
    );
  }

  private openAndFocusFirst() {
    if (this.dropdown.isOpen()) {
      this.dropdown.focusFirstItem();
    } else {
      this.dropdown.showDropdown("first");
    }
  }

  private openAndFocusLast() {
    if (this.dropdown.isOpen()) {
      this.dropdown.focusLastItem();
    } else {
      this.dropdown.showDropdown("last");
    }
  }
}
