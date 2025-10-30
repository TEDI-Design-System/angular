import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { TooltipComponent } from "../tooltip.component";

export type TooltipWidth = "none" | "small" | "medium" | "large";

@Component({
  standalone: true,
  selector: "tedi-tooltip-content",
  template: "<ng-content />",
  styleUrl: "../tooltip.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "classes()",
    role: "tooltip",
  },
})
export class TooltipContentComponent {
  /**
   * The width of the tooltip. Can be 'none', 'small', 'medium', or 'large'.
   * @default medium
   */
  maxWidth = input<TooltipWidth>("medium");

  private tooltip = inject(TooltipComponent);

  classes = computed(() => {
    return [
      "tedi-tooltip-content",
      `tedi-tooltip-content--${this.maxWidth()}`,
    ].join(" ");
  });

  @HostListener("mouseenter")
  onMouseEnter() {
    clearTimeout(this.tooltip.hideTimeout);
    this.tooltip.isContentHovered.set(true);
  }

  @HostListener("mouseleave")
  onMouseLeave() {
    this.tooltip.hideTooltip();
    this.tooltip.isContentHovered.set(false);
  }
}
