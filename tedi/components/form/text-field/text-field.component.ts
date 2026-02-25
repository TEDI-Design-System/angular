import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  ViewEncapsulation,
  forwardRef,
  signal,
  output,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  ClosingButtonComponent,
  ComponentInputs,
  FeedbackTextComponent,
  IconColor,
  IconComponent,
  IconSize,
  IconType,
  IconVariant,
  LabelComponent,
  SeparatorComponent,
  TediTranslationPipe,
} from "@tedi-design-system/angular/tedi";
import { NgClass } from "@angular/common";
import { SpreadAttrsDirective } from "../../../directives/spread-attrs/spread-attrs.directive";

export type InputSize = "small" | "large" | "default";
export type InputState = "valid" | "error" | "default";
type ValidationState = "invalid" | "valid" | "neutral";
type PseudoState = "Hover" | "Active" | "Focus";

export interface TextFieldIcon {
  name: string;
  size?: IconSize;
  color?: IconColor;
  type?: IconType;
  variant?: IconVariant;
}

@Component({
  selector: "tedi-text-field",
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextFieldComponent),
      multi: true,
    },
  ],
  imports: [
    NgClass,
    LabelComponent,
    IconComponent,
    FeedbackTextComponent,
    ClosingButtonComponent,
    SeparatorComponent,
    SpreadAttrsDirective,
    TediTranslationPipe,
  ],
  templateUrl: "./text-field.component.html",
  styleUrl: "./text-field.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextFieldComponent implements ControlValueAccessor {
  /**
   * The unique identifier for the input element that this label is associated with. This ID should match the input element's id attribute to ensure accessibility.
   */
  inputId = input.required<string>();
  /**
   * The text content of the label that describes the input field.
   */
  label = input<string>();
  /**
   * Indicates whether the input field is required. If set to true, the required indicator will be displayed next to the label.
   * @default false
   */
  required = input<boolean>(false);
  /**
   * The size of the input.
   * @default "default"
   */
  size = input<InputSize>("default");
  /**
   * Value of the input field. Supports two-way binding, use with form controls.
   */
  value = model<string>("");
  /**
   * Marks the field as invalid for validation purposes.
   * @default false
   */
  invalid = input<boolean>(false);
  /**
   * Whether the input is disabled.
   * @default false
   */
  disabled = input<boolean>(false);
  /**
   * Placeholder text displayed inside the input.
   */
  placeholder = input<string>("");
  /**
   * Icon name or configuration object.
   */
  icon = input<string | TextFieldIcon | undefined>();
  /**
   * Whether the input includes a clear button.
   * @default false
   */
  isClearable = input<boolean>(false);
  /**
   * Helper text or feedback messages.
   */
  helper = input<ComponentInputs<FeedbackTextComponent>>();
  /**
   * Name attribute for the input element.
   */
  name = input<string | null>(null);
  /**
   * Whether the input is read-only.
   * @default false
   */
  readOnly = input<boolean>(false);
  /**
   * Whether to hide arrows for number inputs.
   * @default true
   */
  arrowsHidden = input<boolean>(true);
  /**
   * Additional attributes to pass directly to the input element.
   */
  inputAttrs = input<Record<string, string | number | boolean>>({});
  /**
   * Custom CSS classes for the container.
   */
  class = input<string | null>(null);
  /**
   * Custom CSS classes for the input element.
   */
  inputClass = input<string | null>(null);
  /**
   * Internal: used only for Storybook pseudo-state rendering.
   * Do not use in production.
   */
  readonly _forceState = input<PseudoState | null>(null);
  /**
   * Callback triggered when the clear button is clicked.
   */
  readonly clear = output<void>();

  private formDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    const newValue = value ?? "";

    if (newValue !== this.value()) {
      this.value.set(newValue);
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  readonly resolvedIcon = computed<TextFieldIcon | undefined>(() => {
    const icon = this.icon();
    if (!icon) return undefined;

    return typeof icon === "string" ? { name: icon } : icon;
  });

  readonly feedbackId = computed(() =>
    this.helper() ? `${this.inputId()}-feedback` : null,
  );

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  readonly validationState = computed<ValidationState>(() => {
    if (this.invalid() || this.helper()?.type === "error") {
      return "invalid";
    }

    if (this.helper()?.type === "valid") {
      return "valid";
    }

    return "neutral";
  });

  showClearButton = computed(() => {
    return this.isClearable() && this.value();
  });

  handleInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    this.value.set(value);
    this.onChange(value);
  }

  handleBlur() {
    this.onTouched();
  }

  clearInput() {
    this.value.set("");
    this.onChange("");
    this.clear.emit();
    this.onTouched();
  }

  readonly containerClasses = computed(() => {
    const customClass = this.class();

    return {
      ...(customClass ? { [customClass]: true } : {}),
      "tedi-text-field--hover": this._forceState() === "Hover",
      "tedi-text-field--active": this._forceState() === "Active",
      "tedi-text-field--focus": this._forceState() === "Focus",
      "tedi-text-field--valid": this.validationState() === "valid",
      "tedi-text-field--invalid": this.validationState() === "invalid",
      "tedi-text-field--disabled": this.isDisabled(),
      "tedi-text-field--small": this.size() === "small",
      "tedi-text-field--large": this.size() === "large",
      "tedi-text-field--with-icon": this.showClearButton() || !!this.icon(),
    };
  });

  readonly inputClasses = computed(() => {
    const customClass = this.inputClass();

    return {
      ...(customClass ? { [customClass]: true } : {}),
      "tedi-text-field__input--arrows-hidden": this.arrowsHidden(),
    };
  });
}
