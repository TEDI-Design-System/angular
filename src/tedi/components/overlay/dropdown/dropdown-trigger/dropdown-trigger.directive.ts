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

/** Native controls keep their own semantics and keyboard behavior. */
const NATIVE_INTERACTIVE_SELECTOR =
  'button, a[href], input:not([type="hidden"]), select, textarea';

const FOCUSABLE_SELECTOR = `${NATIVE_INTERACTIVE_SELECTOR}, [tabindex]`;

/** Native controls that fire `click` on Space but not on Enter. */
const SPACE_ACTIVATED_SELECTOR = 'input[type="checkbox"], input[type="radio"]';

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

  /** Only a Space press that starts on the trigger may activate it on keyup. */
  private spacePressed = false;

  private readonly hasPopup = computed<DropdownTriggerAriaHasPopup>(() => {
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

      const hasPopup = this.hasPopup();
      if (hasPopup === "false") {
        this.renderer.removeAttribute(el, "aria-haspopup");
      } else {
        this.renderer.setAttribute(el, "aria-haspopup", hasPopup);
      }

      this.renderer.setAttribute(
        el,
        "aria-expanded",
        String(this.dropdown.isOpen()),
      );
    });
  }

  ngAfterViewInit() {
    const el = this.resolveTriggerElement();

    // Non-native triggers need button semantics, but a role or tabindex the
    // consumer set (e.g. `role="checkbox"`) is theirs to keep.
    if (!this.isNativelyInteractive(el)) {
      if (!el.hasAttribute("role")) {
        this.renderer.setAttribute(el, "role", "button");
      }
      if (!el.hasAttribute("tabindex")) {
        this.renderer.setAttribute(el, "tabindex", "0");
      }
    }

    this.triggerElement.set(el);
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
      case "Enter":
        if (!this.handlesKey(event, key)) break;
        // Also keeps Enter on a checkbox from submitting its form.
        event.preventDefault();
        this.dropdown.toggleDropdown();
        break;

      case " ":
        if (!this.handlesKey(event, key)) break;
        // Match button timing and prevent page scrolling.
        event.preventDefault();
        this.spacePressed = true;
        break;

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

      case "Escape":
        event.preventDefault();
        this.dropdown.hideDropdown();
        this.focus();
        break;
    }
  }

  @HostListener("keyup", ["$event"])
  onKeyup(event: KeyboardEvent) {
    if (event.key !== " " || !this.spacePressed) return;

    this.spacePressed = false;
    if (event.target !== this.focusableElement) return;
    this.dropdown.toggleDropdown();
  }

  @HostListener("focusout", ["$event"])
  onFocusout(event: FocusEvent) {
    if (event.target === this.focusableElement) this.spacePressed = false;
  }

  /**
   * Whether the directive must activate the trigger on `key` itself, because the
   * element does not turn that key into a native click: both keys for a generic
   * trigger, Enter for a checkbox or radio. Other native controls handle both.
   */
  private handlesKey(event: KeyboardEvent, key: "Enter" | " "): boolean {
    const el = this.focusableElement;

    // Keys from other controls inside the host are theirs.
    if (event.target !== el) return false;

    if (!this.isNativelyInteractive(el)) return true;

    return key === "Enter" && el.matches(SPACE_ACTIVATED_SELECTOR);
  }

  private isWidgetContent(): boolean {
    return this.dropdown.dropdownContent().isWidget();
  }

  private resolveTriggerElement(): HTMLElement {
    const el = this.host.nativeElement;
    if (this.isNativelyInteractive(el)) return el;
    return el.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? el;
  }

  private isNativelyInteractive(el: HTMLElement): boolean {
    return el.matches(NATIVE_INTERACTIVE_SELECTOR);
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
