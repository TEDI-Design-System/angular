import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  Renderer2,
  ViewEncapsulation,
} from "@angular/core";
import { TooltipComponent } from "../tooltip.component";

@Component({
  selector: "tedi-tooltip-trigger",
  standalone: true,
  template: "<ng-content />",
  styleUrl: "../tooltip.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[id]": "tooltip.containerId() + '_trigger'",
    "[attr.aria-controls]": "tooltip.containerId()",
  },
})
export class TooltipTriggerComponent implements AfterContentChecked {
  readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private renderer = inject(Renderer2);
  private tooltip = inject(TooltipComponent);

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
      return;
    }

    this.renderer.addClass(firstChild, "tedi-tooltip-trigger--focus");

    if (!firstChild.getAttribute("tabindex")) {
      this.renderer.setAttribute(firstChild, "tabindex", "0");
    }
  }
}
