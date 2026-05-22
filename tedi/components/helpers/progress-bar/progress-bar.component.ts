import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { FeedbackTextComponent } from "../../form/feedback-text/feedback-text.component";
import { LabelComponent } from "../../form/label/label.component";

export type ProgressBarDirection = "horizontal" | "vertical";
export type ProgressBarLabelPosition = "top" | "horizontal";
export type ProgressBarValuePosition = "horizontal" | "bottom";

@Component({
  selector: "tedi-progress-bar",
  imports: [LabelComponent],
  templateUrl: "./progress-bar.component.html",
  styleUrl: "./progress-bar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class.tedi-progress-bar]": "true",
    "[class.tedi-progress-bar--small]": "small()",
    "[class.tedi-progress-bar--horizontal]": "direction() === 'horizontal'",
    "[class.tedi-progress-bar--label-horizontal]":
      "label() && labelPosition() === 'horizontal'",
    "[class.tedi-progress-bar--value-bottom]": "valuePosition() === 'bottom'",
  },
})
export class ProgressBarComponent {
  /**
   * Optional id for the underlying `<progress>` element. Useful when an
   * external `<label for=…>` should bind to it.
   */
  progressId = input<string>();
  /**
   * Progress value between 0 and 100. Values are clamped.
   * @default 0
   */
  value = input<number, number>(0, {
    transform: (raw) => Math.min(100, Math.max(0, Number(raw) || 0)),
  });
  /**
   * Direction (layout) of the percentage relative to the bar.
   * - `horizontal` – percentage to the right of the bar.
   * - `vertical` – percentage below the bar.
   * @default horizontal
   */
  direction = input<ProgressBarDirection>("horizontal");
  /**
   * Small variant — 4px bar height instead of the default 8px.
   * @default false
   */
  small = input(false, { transform: booleanAttribute });
  /**
   * Optional title rendered above (default) or to the left of the bar.
   */
  label = input<string>();
  /**
   * Where to place the label relative to the bar.
   * Has no effect when `label` is not set.
   * @default top
   */
  labelPosition = input<ProgressBarLabelPosition>("top");
  /**
   * Render a red `*` after the label to indicate a required field.
   * Has no effect when `label` is not set.
   * @default false
   */
  required = input(false, { transform: booleanAttribute });
  /**
   * Show or hide the percentage value.
   * @default true
   */
  showValue = input(true, { transform: booleanAttribute });
  /**
   * Where to place the percentage value.
   * - `horizontal` – next to the bar.
   * - `bottom` – on the hint row beneath the bar.
   * @default horizontal
   */
  valuePosition = input<ProgressBarValuePosition>("horizontal");
  /**
   * Override the rendered value text. Defaults to `"{value}%"`.
   *
   * Use this when the progress represents something other than a percentage —
   * e.g. `value=20` with `valueLabel="1/5"` shows the bar at 20% but renders
   * the label as "1/5". `value` still drives the bar fill and ARIA semantics.
   */
  valueLabel = input<string>();
  /**
   * Accessible label for the progress bar. Falls back to `label()` when omitted.
   */
  ariaLabel = input<string>();

  protected projectedFeedback = contentChild(FeedbackTextComponent);

  protected hasHintRow = computed(
    () =>
      !!this.projectedFeedback() ||
      (this.showValue() && this.valuePosition() === "bottom"),
  );

  protected formattedValue = computed(
    () => this.valueLabel() ?? `${this.value()}%`,
  );

  protected accessibleLabel = computed(
    () => this.ariaLabel() ?? this.label() ?? undefined,
  );
}
