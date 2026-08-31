import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
} from "@angular/core";

export type StatusIndicatorType = "success" | "danger" | "warning" | "inactive";
export type StatusIndicatorSize = "sm" | "lg";
export type StatusIndicatorPosition = "default" | "top-right";

@Component({
  selector: "tedi-status-indicator",
  standalone: true,
  template: "",
  styleUrl: "./status-indicator.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-status-indicator",
    "[class.tedi-status-indicator--success]": "type() === 'success'",
    "[class.tedi-status-indicator--danger]": "type() === 'danger'",
    "[class.tedi-status-indicator--warning]": "type() === 'warning'",
    "[class.tedi-status-indicator--inactive]": "type() === 'inactive'",
    "[class.tedi-status-indicator--sm]": "size() === 'sm'",
    "[class.tedi-status-indicator--lg]": "size() === 'lg'",
    "[class.tedi-status-indicator--bordered]": "hasBorder()",
    "[class.tedi-status-indicator--top-right]": "position() === 'top-right'",
    "[attr.role]": "label() ? 'img' : null",
    "[attr.aria-hidden]": "!label()",
    "[attr.aria-label]": "label() || null",
  },
})
export class StatusIndicatorComponent {
  /**
   * Accessible label for the indicator. When provided, the indicator is
   * exposed to assistive technology with `role="img"`. When omitted, the
   * indicator is treated as decorative (`aria-hidden="true"`).
   */
  readonly label = input<string>();
  /**
   * The status type, which determines the indicator color.
   * @default success
   */
  readonly type = input<StatusIndicatorType>("success");
  /**
   * The size of the indicator.
   * @default sm
   */
  readonly size = input<StatusIndicatorSize>("sm");
  /**
   * Whether the indicator has a white border ring.
   * @default false
   */
  readonly hasBorder = input<boolean>(false);
  /**
   * Controls positioning of the indicator.
   * - `'default'` — inline, no absolute positioning
   * - `'top-right'` — absolutely positioned at the top-right corner of the parent
   * @default default
   */
  readonly position = input<StatusIndicatorPosition>("default");
}
