import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { NgClass } from "@angular/common";
import {
  FormFieldControl,
  TEDI_FORM_FIELD_CONTROL,
} from "./form-field-control";
import {
  IconColor,
  IconComponent,
  IconSize,
  IconType,
  IconVariant,
} from "../../../components/base/icon/icon.component";
import { ClosingButtonComponent } from "../../../components/buttons/closing-button/closing-button.component";
import { SeparatorComponent } from "../../../components/helpers/separator/separator.component";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";

export type InputSize = "small" | "large" | "default";
export type InputState = "valid" | "error" | "default";
type ValidationState = "invalid" | "valid" | "neutral";

export interface FormFieldIcon {
  name: string;
  size?: IconSize;
  color?: IconColor;
  type?: IconType;
  variant?: IconVariant;
}

@Component({
  selector: "tedi-form-field",
  standalone: true,
  templateUrl: "./form-field.component.html",
  styleUrl: "./form-field.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    IconComponent,
    ClosingButtonComponent,
    SeparatorComponent,
    TediTranslationPipe,
  ],
  host: {
    "[class]": "hostClasses()",
  },
})
export class FormFieldComponent {
  /**
   * The size of the form field.
   * @default "default"
   */
  size = input<InputSize>("default");
  /**
   * Icon name or configuration object.
   */
  icon = input<string | FormFieldIcon | undefined>();
  /**
   * Whether the form field includes a clear button.
   * @default false
   */
  clearable = input<boolean>(false);
  /**
   * Custom CSS classes for the input.
   */
  inputClass = input<string | null>(null);

  @ContentChild(TEDI_FORM_FIELD_CONTROL)
  control?: FormFieldControl;

  @ContentChild(FeedbackTextComponent)
  feedback?: FeedbackTextComponent;

  readonly resolvedIcon = computed<FormFieldIcon | undefined>(() => {
    const icon = this.icon();
    if (!icon) return undefined;

    return typeof icon === "string" ? { name: icon } : icon;
  });

  readonly validationState = computed<ValidationState>(() => {
    const feedbackType = this.feedback?.type();
    const fieldInvalid = this.control?.invalid();

    if (fieldInvalid || feedbackType === "error") return "invalid";
    if (feedbackType === "valid") return "valid";

    return "neutral";
  });

  showClearButton = computed(() => {
    const value = this.control?.value();
    return this.clearable() && !!value;
  });

  readonly isDisabled = computed(() => this.control?.disabled() ?? false);

  readonly hostClasses = computed(() => {
    return {
      "tedi-form-field": true,
      "tedi-form-field--valid": this.validationState() === "valid",
      "tedi-form-field--invalid": this.validationState() === "invalid",
      "tedi-form-field--disabled": this.control?.disabled(),
      "tedi-form-field--small": this.size() === "small",
      "tedi-form-field--large": this.size() === "large",
      "tedi-form-field--with-icon": this.showClearButton() || !!this.icon(),
    };
  });

  readonly inputClasses = computed(() => {
    const customClass = this.inputClass();

    return {
      "tedi-form-field__input": true,
      ...(customClass ? { [customClass]: true } : {}),
    };
  });

  clear() {
    this.control?.clearField?.();
  }
}
