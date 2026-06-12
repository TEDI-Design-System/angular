import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { LabelComponent } from "../../form/label/label.component";
import {
  Breakpoint,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";

export type ProgressBarSize = "default" | "small";
export type ProgressBarLabelPosition = "top" | "horizontal";
export type ProgressBarValuePosition = "horizontal" | "bottom";

@Component({
  standalone: true,
  selector: "tedi-progress-bar",
  imports: [LabelComponent],
  templateUrl: "./progress-bar.component.html",
  styleUrl: "./progress-bar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class.tedi-progress-bar]": "true",
    "[class.tedi-progress-bar--small]": "size() === 'small'",
    "[class.tedi-progress-bar--label-horizontal]":
      "label() && labelPosition() === 'horizontal'",
    "[class.tedi-progress-bar--value-bottom]":
      "effectiveValuePosition() === 'bottom'",
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
   * Size of the bar. `small` renders a 4px bar height instead of the
   * default 8px.
   * @default default
   */
  size = input<ProgressBarSize>("default");
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
   * the label as "1/5". `value` still drives the bar fill; the label is also
   * exposed to assistive technology via `aria-valuetext`.
   */
  valueLabel = input<string>();
  /**
   * Accessible label for the progress bar. Falls back to `label()` when omitted.
   */
  ariaLabel = input<string>();
  /**
   * Manually force the mobile variant on or off. When `undefined`, the
   * variant is auto-derived from the viewport breakpoint (see
   * `mobileBreakpoint`). Set to `false` to opt out of the automatic
   * behavior entirely. The mobile variant always renders the value on the
   * hint row beneath the bar, regardless of `valuePosition`.
   */
  mobile = input<boolean | undefined>(undefined);
  /**
   * Viewport breakpoint below which the mobile variant kicks in when
   * `mobile` is not set explicitly.
   * @default "sm"
   */
  mobileBreakpoint = input<Breakpoint>("sm");

  private breakpointService = inject(BreakpointService);

  private _autoMobile = computed(() => {
    return this.breakpointService.isBelowBreakpoint(this.mobileBreakpoint())();
  });

  protected isMobile = computed(() => this.mobile() ?? this._autoMobile());

  protected effectiveValuePosition = computed<ProgressBarValuePosition>(() =>
    this.isMobile() ? "bottom" : this.valuePosition(),
  );

  protected formattedValue = computed(
    () => this.valueLabel() ?? `${this.value()}%`,
  );

  protected accessibleLabel = computed(
    () => this.ariaLabel() ?? this.label() ?? undefined,
  );
}
