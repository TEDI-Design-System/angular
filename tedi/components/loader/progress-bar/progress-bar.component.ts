import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { _IdGenerator } from "@angular/cdk/a11y";
import { LabelComponent } from "../../form/label/label.component";
import { BreakpointService } from "../../../services/breakpoint/breakpoint.service";

export type ProgressBarSize = "default" | "small";
export type ProgressBarLabelPosition = "top" | "horizontal";
export type ProgressBarValuePosition = "horizontal" | "bottom";

/**
 * The subset of inputs that can be overridden per breakpoint via the
 * `xs`–`xxl` inputs. Every field is optional — only the ones you set override
 * the base value at that breakpoint.
 */
export type ProgressBarInputs = {
  /** Overrides {@link ProgressBarComponent.size}. */
  size?: ProgressBarSize;
  /** Overrides {@link ProgressBarComponent.labelPosition}. */
  labelPosition?: ProgressBarLabelPosition;
  /** Overrides {@link ProgressBarComponent.showValue}. */
  showValue?: boolean;
  /** Overrides {@link ProgressBarComponent.valuePosition}. */
  valuePosition?: ProgressBarValuePosition;
  /** Overrides {@link ProgressBarComponent.valueLabel}. */
  valueLabel?: string;
};

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
    "[class.tedi-progress-bar--small]": "currentProps().size === 'small'",
    "[class.tedi-progress-bar--label-horizontal]":
      "label() && currentProps().labelPosition === 'horizontal'",
    "[class.tedi-progress-bar--value-bottom]":
      "currentProps().valuePosition === 'bottom'",
  },
})
export class ProgressBarComponent {
  /**
   * Optional id for the underlying `<progress>` element. Useful when an
   * external `<label for=…>` should bind to it. When omitted, a unique id is
   * generated so the internal label stays bound to the bar.
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

  /*
   * Per-breakpoint overrides (`xs`–`xxl`).
   *
   * The base inputs (`size`, `labelPosition`, `valuePosition`, …) describe the
   * smallest viewport. Each breakpoint input takes a *partial* `ProgressBarInputs`
   * that is layered on top from that breakpoint **and up** — so you only set what
   * changes, and larger breakpoints inherit from smaller ones until overridden.
   *
   * Breakpoint widths: `xs` ≥ 0, `sm` ≥ 576, `md` ≥ 768, `lg` ≥ 992,
   * `xl` ≥ 1200, `xxl` ≥ 1400 (px).
   *
   * @example
   * ```html
   * <!-- Mobile-first: stacked label + value below the bar.
   *      From md up: inline label on the left, value beside the bar. -->
   * <tedi-progress-bar
   *   [value]="40"
   *   label="Upload"
   *   labelPosition="top"
   *   valuePosition="bottom"
   *   [md]="{ labelPosition: 'horizontal', valuePosition: 'horizontal' }"
   * />
   *
   * <!-- Multiple breakpoints stack: sm hides the value, xl shows it again. -->
   * <tedi-progress-bar
   *   [value]="40"
   *   [sm]="{ showValue: false }"
   *   [xl]="{ showValue: true }"
   * />
   * ```
   */

  /** Overrides applied from the `xs` breakpoint (≥ 0px) and up. */
  xs = input<ProgressBarInputs>();
  /** Overrides applied from the `sm` breakpoint (≥ 576px) and up. */
  sm = input<ProgressBarInputs>();
  /** Overrides applied from the `md` breakpoint (≥ 768px) and up. */
  md = input<ProgressBarInputs>();
  /** Overrides applied from the `lg` breakpoint (≥ 992px) and up. */
  lg = input<ProgressBarInputs>();
  /** Overrides applied from the `xl` breakpoint (≥ 1200px) and up. */
  xl = input<ProgressBarInputs>();
  /** Overrides applied from the `xxl` breakpoint (≥ 1400px) and up. */
  xxl = input<ProgressBarInputs>();

  private breakpointService = inject(BreakpointService);
  private readonly fallbackId = inject(_IdGenerator).getId(
    "tedi-progress-bar-",
  );

  protected resolvedId = computed(() => this.progressId() ?? this.fallbackId);

  protected currentProps = computed(() =>
    this.breakpointService.getBreakpointInputs<ProgressBarInputs>({
      size: this.size(),
      labelPosition: this.labelPosition(),
      showValue: this.showValue(),
      valuePosition: this.valuePosition(),
      valueLabel: this.valueLabel(),
      xs: this.xs(),
      sm: this.sm(),
      md: this.md(),
      lg: this.lg(),
      xl: this.xl(),
      xxl: this.xxl(),
    }),
  );

  protected formattedValue = computed(
    () => this.currentProps().valueLabel ?? `${this.value()}%`,
  );

  protected accessibleLabel = computed(
    () => this.ariaLabel() ?? this.label() ?? undefined,
  );
}
