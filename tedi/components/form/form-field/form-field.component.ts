import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  input,
  ViewEncapsulation,
  AfterContentInit,
  inject,
  DestroyRef,
  effect,
} from "@angular/core";
import { TEDI_INPUT_GROUP } from "../input-group/input-group.token";
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
import { NgControl } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

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
export class FormFieldComponent implements AfterContentInit {
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

  @ContentChild(NgControl)
  ngControl?: NgControl;

  @ContentChild(FeedbackTextComponent)
  feedback?: FeedbackTextComponent;

  private readonly destroyRef = inject(DestroyRef);
  private readonly inputGroup = inject(TEDI_INPUT_GROUP, { optional: true });

  constructor() {
    effect(() => {
      const invalid = this.computeInvalid();
      this.control?.setInvalidState(invalid);
    });
  }

  ngAfterContentInit() {
    this.ngControl?.control?.events
      ?.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateValidationState());

    this.updateValidationState();
  }

  private updateValidationState() {
    this.control?.setInvalidState(this.computeInvalid());
  }

  private computeInvalid(): boolean {
    const invalid = !!this.ngControl?.invalid;
    const touched = !!this.ngControl?.touched;
    const dirty = !!this.ngControl?.dirty;
    const fieldInvalid = invalid && (touched || dirty);

    return fieldInvalid || (this.inputGroup?.invalid() ?? false);
  }

  readonly resolvedIcon = computed<FormFieldIcon | undefined>(() => {
    const icon = this.icon();
    if (!icon) return undefined;

    return typeof icon === "string" ? { name: icon } : icon;
  });

  readonly validationState = computed<ValidationState>(() => {
    const feedbackType = this.feedback?.type();
    const fieldInvalid = this.control?.invalid?.() ?? false;

    if (fieldInvalid || feedbackType === "error") return "invalid";
    if (feedbackType === "valid") return "valid";

    return "neutral";
  });

  showClearButton = computed(() => {
    const value = this.control?.value();
    return this.clearable() && !!value;
  });

  readonly isDisabled = computed(
    () => (this.control?.disabled() ?? false) || (this.inputGroup?.disabled() ?? false),
  );

  readonly hostClasses = computed(() => {
    return {
      "tedi-form-field": true,
      "tedi-form-field--valid": this.validationState() === "valid",
      "tedi-form-field--invalid": this.validationState() === "invalid",
      "tedi-form-field--disabled": this.isDisabled(),
      "tedi-form-field--small": this.size() === "small",
      "tedi-form-field--large": this.size() === "large",
      "tedi-form-field--with-icon": this.clearable() || !!this.icon(),
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
