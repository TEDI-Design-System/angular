import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Renderer2,
  computed,
  effect,
  inject,
  input,
  signal,
} from "@angular/core";
import { CdkOverlayOrigin } from "@angular/cdk/overlay";
import { DropdownComponent } from "../dropdown.component";

export type DropdownTriggerAriaHasPopup =
  "menu" | "listbox" | "dialog" | "true" | "false";

const FOCUSABLE_SELECTOR = "button, a[href], [tabindex]";

@Directive({
  standalone: true,
  selector: "[tedi-dropdown-trigger]",
  hostDirectives: [CdkOverlayOrigin],
})
export class DropdownTriggerDirective implements AfterViewInit {
  /**
   * The `aria-haspopup` value for the trigger, telling assistive technology
   * what kind of popup it opens.
   *
   * Defaults to the content's `dropdownRole`: `menu` for a menu, `listbox` for
   * a listbox, and no attribute for a plain `list`, which ARIA has no
   * `aria-haspopup` token for. `false` also omits the attribute.
   */
  readonly ariaHaspopup = input<DropdownTriggerAriaHasPopup>();

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

  private readonly haspopup = computed<DropdownTriggerAriaHasPopup>(() => {
    const explicit = this.ariaHaspopup();
    if (explicit) return explicit;

    switch (this.dropdown.dropdownContent().dropdownRole()) {
      case "menu":
        return "menu";
      case "listbox":
        return "listbox";
      default:
        return "false";
    }
  });

  constructor() {
    effect(() => {
      const el = this.triggerElement();
      if (!el) return;

      this.renderer.setAttribute(
        el,
        "id",
        `${this.dropdown.containerId()}_trigger`,
      );

      // The panel only exists while open, so a permanent `aria-controls` would
      // point at nothing.
      if (this.dropdown.isOpen()) {
        this.renderer.setAttribute(
          el,
          "aria-controls",
          this.dropdown.containerId(),
        );
      } else {
        this.renderer.removeAttribute(el, "aria-controls");
      }

      const haspopup = this.haspopup();
      if (haspopup === "false") {
        this.renderer.removeAttribute(el, "aria-haspopup");
      } else {
        this.renderer.setAttribute(el, "aria-haspopup", haspopup);
      }

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
        if (!this.isWidgetContent()) break;
        event.preventDefault();
        this.openAndFocusFirst();
        break;

      case "ArrowUp":
        if (!this.isWidgetContent()) break;
        event.preventDefault();
        this.openAndFocusLast();
        break;

      case "Tab":
        // A widget panel is entered with the arrow keys. A plain `list` is not
        // entered at all by default, because the overlay renders it at the end
        // of the document, so tabbing off the trigger has to be redirected.
        if (this.isWidgetContent() || event.shiftKey) break;
        if (!this.dropdown.isOpen()) break;
        if (this.dropdown.focusPanelStart()) event.preventDefault();
        break;

      case "Escape":
        event.preventDefault();
        this.dropdown.hideDropdown();
        this.focus();
        break;
    }
  }

  private isWidgetContent(): boolean {
    return this.dropdown.dropdownContent().isWidget();
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
