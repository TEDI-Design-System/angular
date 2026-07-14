import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  OnDestroy,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { LabelComponent } from "../label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { ComponentInputs } from "../../../types/inputs.type";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";

export type SliderHideLabel = boolean | "keep-space";

@Component({
  selector: "tedi-slider",
  standalone: true,
  templateUrl: "./slider.component.html",
  styleUrl: "./slider.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    LabelComponent,
    FeedbackTextComponent,
    TooltipComponent,
    TooltipTriggerComponent,
    TooltipContentComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true,
    },
  ],
  host: {
    "[class]": "classes()",
  },
})
export class SliderComponent implements ControlValueAccessor, OnDestroy {
  /**
   * Unique identifier for the underlying range input, used for label association.
   */
  inputId = input.required<string>();
  /**
   * Name attribute of the underlying input.
   */
  name = input<string>();
  /**
   * Label rendered above the slider.
   */
  label = input<string>();
  /**
   * Hide the label visually while keeping it available to assistive technology, or
   * `"keep-space"` to also reserve its vertical space.
   * @default false
   */
  hideLabel = input<SliderHideLabel>(false);
  /**
   * Marks the field as required.
   * @default false
   */
  required = input<boolean>(false);
  /**
   * Minimum allowed value.
   * @default 0
   */
  min = input<number>(0);
  /**
   * Maximum allowed value.
   * @default 100
   */
  max = input<number>(100);
  /**
   * Step size.
   * @default 1
   */
  step = input<number>(1);
  /**
   * Current value. Supports two-way binding and reactive forms.
   */
  value = model<number>(0);
  /**
   * Disables the slider.
   * @default false
   */
  disabled = input<boolean>(false);
  /**
   * Marks the slider as invalid for validation purposes.
   * @default false
   */
  invalid = input<boolean>(false);
  /**
   * Text rendered to the left of the track (e.g. the minimum value).
   */
  minLabel = input<string>();
  /**
   * Text rendered to the right of the track (e.g. the maximum value).
   * Ignored when `showCurrentValue` is `true`.
   */
  maxLabel = input<string>();
  /**
   * Render the current value to the right of the track instead of `maxLabel`.
   * @default false
   */
  showCurrentValue = input<boolean>(false);
  /**
   * Formats the current value for the thumb tooltip and the `showCurrentValue` label.
   */
  valueFormatter = input<(value: number) => string>();
  /**
   * Show a tooltip with the current value above the thumb while hovered, focused or dragged.
   * @default true
   */
  tooltip = input<boolean>(true);
  /**
   * FeedbackText component inputs, rendered below the slider.
   */
  feedbackText = input<ComponentInputs<FeedbackTextComponent>>();
  /**
   * Accessible label used when no visible `label` is provided.
   */
  ariaLabel = input<string>();
  /**
   * ID of an element that labels the slider, used when no visible `label` is provided.
   */
  ariaLabelledby = input<string>();
  /**
   * Human-readable text alternative of the current value.
   */
  ariaValuetext = input<string>();

  private readonly formDisabled = signal(false);
  readonly isHovered = signal(false);
  readonly isFocused = signal(false);
  readonly isDragging = signal(false);

  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  readonly isInvalid = computed(
    () => this.invalid() || this.feedbackText()?.type === "error",
  );

  readonly clampedValue = computed(() =>
    Math.min(this.max(), Math.max(this.min(), this.value())),
  );

  readonly progress = computed(() => {
    const min = this.min();
    const max = this.max();
    if (max === min) return 0;
    return ((this.clampedValue() - min) / (max - min)) * 100;
  });

  readonly progressStyle = computed(() => ({
    "--tedi-slider-progress": `${this.progress()}%`,
    "--tedi-slider-progress-ratio": `${this.progress() / 100}`,
  }));

  readonly formattedValue = computed(() => {
    const formatter = this.valueFormatter();
    return formatter
      ? formatter(this.clampedValue())
      : `${this.clampedValue()}`;
  });

  readonly rightLabel = computed(() =>
    this.showCurrentValue() ? this.formattedValue() : this.maxLabel(),
  );

  readonly feedbackId = computed(() =>
    this.feedbackText() ? `${this.inputId()}-feedback` : null,
  );

  readonly canShowTooltip = computed(
    () => this.tooltip() && !this.isDisabled(),
  );

  readonly tooltipOpen = computed(
    () =>
      this.canShowTooltip() &&
      (this.isHovered() || this.isFocused() || this.isDragging()),
  );

  readonly classes = computed(() => {
    const classList = ["tedi-slider"];
    if (this.isDisabled()) classList.push("tedi-slider--disabled");
    if (this.isInvalid()) classList.push("tedi-slider--invalid");
    if (this.isDragging() && !this.isDisabled()) {
      classList.push("tedi-slider--dragging");
    }
    return classList.join(" ");
  });

  writeValue(value?: number): void {
    this.value.set(value == null || isNaN(value) ? this.min() : value);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  handleInput(event: Event): void {
    const next = (event.target as HTMLInputElement).valueAsNumber;
    if (isNaN(next)) return;
    this.value.set(next);
    this.onChange(next);
  }

  handlePointerDown(): void {
    if (this.isDisabled()) return;
    this.isDragging.set(true);
    window.addEventListener("pointerup", this.endDrag);
    window.addEventListener("pointercancel", this.endDrag);
  }

  handleFocus(): void {
    this.isFocused.set(true);
  }

  handleBlur(): void {
    this.isFocused.set(false);
    this.onTouched();
  }

  handleMouseEnter(): void {
    this.isHovered.set(true);
  }

  handleMouseLeave(): void {
    this.isHovered.set(false);
  }

  ngOnDestroy(): void {
    this.endDrag();
  }

  private endDrag = (): void => {
    this.isDragging.set(false);
    window.removeEventListener("pointerup", this.endDrag);
    window.removeEventListener("pointercancel", this.endDrag);
  };
}
