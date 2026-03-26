import { CommonModule, NgClass } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  computed,
  inject,
} from "@angular/core";
import { IconComponent } from "../../base/icon/icon.component";
import { _IdGenerator } from "@angular/cdk/a11y";

export type StatusBadgeColor =
  | "neutral"
  | "brand"
  | "accent"
  | "success"
  | "danger"
  | "warning"
  | "transparent";
export type StatusBadgeVariant = "filled" | "filled-bordered" | "bordered";
export type StatusBadgeSize = "default" | "large";
export type StatusBadgeStatus = "danger" | "success" | "warning" | "inactive";

@Component({
  selector: "tedi-status-badge",
  standalone: true,
  imports: [IconComponent, CommonModule, NgClass],
  templateUrl: "./status-badge.component.html",
  styleUrl: "./status-badge.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  readonly idGenerator = inject(_IdGenerator);
  readonly uniqueId = this.idGenerator.getId("tedi-status-badge");
  /**
   * The text to be displayed inside the StatusBadge.
   */
  text = input<string>("");
  /**
   * Additional classes to apply custom styles to the StatusBadge.
   */
  class = input<string>();
  /**
   * Provides the full text or description when the Badge represents an abbreviation.
   * This is typically shown as a tooltip on hover.
   */
  title = input<string>();
  /**
   * ARIA role attribute for accessibility.
   */
  role = input<string>();
  /**
   * Specifies the color scheme of the StatusBadge.
   * @default neutral
   */
  color = input<StatusBadgeColor>("neutral");
  /**
   * Determines the style or visual type of the StatusBadge.
   * @default filled
   */
  variant = input<StatusBadgeVariant>("filled");
  /**
   * Specifies the size of the StatusBadge.
   * @default default
   */
  size = input<StatusBadgeSize>("default");
  /**
   * StatusBadge status indicator.
   */
  status = input<StatusBadgeStatus>();
  /**
   * The name of the icon to be displayed inside the StatusBadge. The icon is rendered using the `Icon` component.
   */
  icon = input<string>("");

  classes = computed(() => {
    const classList = ["tedi-status-badge"];

    if (this.color()) {
      classList.push(`tedi-status-badge--color-${this.color()}`);
    }

    if (this.variant()) {
      classList.push(`tedi-status-badge--variant-${this.variant()}`);
    }

    if (this.status()) {
      classList.push(
        "tedi-status-badge--status",
        `tedi-status-badge--status-${this.status()}`,
      );
    }

    if (this.size() === "large") {
      classList.push("tedi-status-badge--large");
    }

    const hasText = !!this.text()?.trim();
    const hasIcon = !!this.icon()?.trim();
    if (hasIcon && !hasText) {
      classList.push("tedi-status-badge__icon-only");
    }

    const customClass = this.class();
    if (customClass) {
      classList.push(customClass);
    }

    return classList;
  });

  ariaLive = computed(() => {
    if (this.role() === "alert") {
      return "assertive";
    }
    if (this.role() === "status") {
      return "polite";
    }
    return null;
  });
}
