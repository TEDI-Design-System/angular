import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
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
})
export class TooltipTriggerComponent implements AfterContentChecked {
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

    this.renderer.addClass(interactive, "tedi-tooltip-trigger--focus");

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
