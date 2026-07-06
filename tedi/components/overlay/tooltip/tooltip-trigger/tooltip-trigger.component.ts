import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  Renderer2,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { CdkOverlayOrigin } from "@angular/cdk/overlay";
import { TooltipComponent } from "../tooltip.component";

const FOCUSABLE_SELECTOR = "button, a[href], [tabindex]";

@Component({
  selector: "tedi-tooltip-trigger",
  standalone: true,
  template: "<ng-content />",
  styleUrl: "../tooltip.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [CdkOverlayOrigin],
  host: {
    "[class.tedi-tooltip-trigger--clickable]": "tooltip.openWith() === 'click'",
  },
})
export class TooltipTriggerComponent implements AfterContentChecked {
  /**
   * When `false`, the trigger is a pure positioning anchor: it skips making its
   * projected child focusable (no synthesized `tabindex`, focus ring or
   * `aria-describedby`). Use for decorative or externally-controlled origins where
   * focus and ARIA live on another element (e.g. a slider's range input).
   * @default true
   */
  readonly interactive = input(true);

  readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly overlayOrigin = inject(CdkOverlayOrigin, { self: true });
  private renderer = inject(Renderer2);
  readonly tooltip = inject(TooltipComponent);
  private interactiveElement = signal<HTMLElement | null>(null);

  private isTouch = false;

  constructor() {
    effect(() => {
      const element = this.interactiveElement();
      if (!element) return;

      element.setAttribute("aria-describedby", this.tooltip.descriptionId);
    });
  }

  @HostListener("touchstart")
  onTouchStart() {
    this.isTouch = true;
  }

  @HostListener("touchend")
  onTouchEnd() {
    if (this.tooltip.openWith() === "none") return;
    this.tooltip.toggleTooltip();
    setTimeout(() => (this.isTouch = false), 300);
  }

  @HostListener("click")
  onClick() {
    if (this.isTouch) return;

    if (
      this.tooltip.openWith() === "both" ||
      this.tooltip.openWith() === "click"
    ) {
      this.tooltip.toggleTooltip();
    }
  }

  @HostListener("mouseenter")
  onMouseEnter() {
    if (this.isTouch) return;

    if (
      this.tooltip.openWith() === "both" ||
      this.tooltip.openWith() === "hover"
    ) {
      this.tooltip.showTooltip();
    }
  }

  @HostListener("mouseleave")
  onMouseLeave() {
    if (this.isTouch) return;

    if (
      this.tooltip.openWith() === "both" ||
      this.tooltip.openWith() === "hover"
    ) {
      clearTimeout(this.tooltip.hideTimeout);

      this.tooltip.hideTimeout = setTimeout(() => {
        this.tooltip.hideTooltip();
      }, this.tooltip.timeoutDelay());
    }
  }

  @HostListener("focusin")
  onFocusIn() {
    if (this.isTouch) return;

    if (
      this.tooltip.openWith() === "both" ||
      this.tooltip.openWith() === "hover"
    ) {
      this.tooltip.showTooltip();
    }
  }

  @HostListener("focusout")
  onFocusOut() {
    if (this.isTouch) return;
    if (this.tooltip.isContentHovered()) return;

    if (
      this.tooltip.openWith() === "both" ||
      this.tooltip.openWith() === "hover"
    ) {
      this.tooltip.hideTooltip();
    }
  }

  @HostListener("keydown.escape")
  onEscape() {
    this.tooltip.hideTooltip();
  }

  ngAfterContentChecked(): void {
    if (!this.interactive()) return;

    const element = this.host.nativeElement as HTMLElement;
    const firstChild = element.firstChild as HTMLElement | null;

    if (!firstChild) {
      return;
    }

    if (
      firstChild.nodeType === Node.TEXT_NODE &&
      firstChild.textContent?.trim()
    ) {
      const span = this.renderer.createElement("span") as HTMLSpanElement;
      this.renderer.addClass(span, "tedi-tooltip-trigger__text");
      this.renderer.addClass(span, "tedi-tooltip-trigger--focus");
      this.renderer.setAttribute(span, "tabindex", "0");
      this.renderer.insertBefore(element, span, firstChild);
      this.renderer.appendChild(span, firstChild);
      this.interactiveElement.set(span);
      return;
    }

    const interactive = this.resolveInteractiveElement(firstChild);

    // The `--focus` class is a fallback focus ring for triggers that have no
    // focus styling of their own. Natively focusable elements (a real
    // `<button>`/`<a href>`, e.g. tedi-info-button or tedi-button) already own
    // their `:focus-visible` styles, and the tooltip's generic outline has
    // higher specificity — adding it would override the component's own focus
    // outline. Only synthesise a focus ring for elements that aren't already
    // focusable in their own right.
    if (!this.isFocusable(interactive)) {
      this.renderer.addClass(interactive, "tedi-tooltip-trigger--focus");
    }

    if (!interactive.getAttribute("tabindex")) {
      this.renderer.setAttribute(interactive, "tabindex", "0");
    }

    this.interactiveElement.set(interactive);
  }

  /**
   * The element that actually receives focus and ARIA semantics. When the
   * projected child is itself focusable (a `<button>`/`<a href>`) it is used
   * directly. When it is a non-focusable wrapper that renders its own
   * interactive element (e.g. a `tedi-dropdown` projecting a trigger button),
   * the first focusable descendant is used instead — otherwise focus and the
   * tooltip description would land on the non-interactive wrapper.
   */
  private resolveInteractiveElement(child: HTMLElement): HTMLElement {
    if (this.isFocusable(child)) {
      return child;
    }

    return child.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? child;
  }

  private isFocusable(el: HTMLElement): boolean {
    return (
      el.tagName === "BUTTON" || (el.tagName === "A" && el.hasAttribute("href"))
    );
  }
}
