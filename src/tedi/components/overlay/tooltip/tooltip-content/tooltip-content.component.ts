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
    "[id]": "tooltip.descriptionId",
    role: "tooltip",
    "[attr.aria-hidden]": "ariaHidden() || null",
  },
})
export class TooltipContentComponent {
  /**
   * The width of the tooltip. Can be 'none', 'small', 'medium', or 'large'.
   * @default medium
   */
  maxWidth = input<TooltipWidth>("medium");
  /**
   * Makes the tooltip visual-only: screen readers skip this content and the trigger is not
   * described by it. Use when it repeats the trigger's accessible name, e.g. on an icon-only
   * button whose `aria-label` matches the tooltip text.
   * @default false
   */
  ariaHidden = input(false);

  protected readonly tooltip = inject(TooltipComponent);

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
