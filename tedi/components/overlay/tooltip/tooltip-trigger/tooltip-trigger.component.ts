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
import { TooltipComponent } from "../tooltip.component";

@Component({
  selector: "tedi-tooltip-trigger",
  standalone: true,
  template: "<ng-content />",
  styleUrl: "../tooltip.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipTriggerComponent implements AfterContentChecked {
  readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private renderer = inject(Renderer2);
  readonly tooltip = inject(TooltipComponent);
  private interactiveElement = signal<HTMLElement | null>(null);

  constructor() {
    effect(() => {
      const element = this.interactiveElement();
      if (!element) return;

      const descriptionId = this.tooltip.descriptionId;
      const isOpen = this.tooltip.isOpen();

      element.setAttribute("aria-describedby", descriptionId);
      element.setAttribute("aria-expanded", String(isOpen));
    });
  }

  @HostListener("click")
  onClick() {
    if (
      this.tooltip.openWith() === "both" ||
      this.tooltip.openWith() === "click"
    ) {
      this.tooltip.toggleTooltip();
    }
  }

  @HostListener("mouseenter")
  onMouseEnter() {
    if (
      this.tooltip.openWith() === "both" ||
      this.tooltip.openWith() === "hover"
    ) {
      this.tooltip.showTooltip();
    }
  }

  @HostListener("mouseleave")
  onMouseLeave() {
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
    if (
      this.tooltip.openWith() === "both" ||
      this.tooltip.openWith() === "hover"
    ) {
      this.tooltip.showTooltip();
    }
  }

  @HostListener("focusout")
  onFocusOut() {
    if (this.tooltip.isContentHovered()) {
      return;
    }

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

    this.renderer.addClass(firstChild, "tedi-tooltip-trigger--focus");

    if (!firstChild.getAttribute("tabindex")) {
      this.renderer.setAttribute(firstChild, "tabindex", "0");
    }

    this.interactiveElement.set(firstChild);
  }
}
