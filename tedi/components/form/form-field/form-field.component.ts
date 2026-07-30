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
  forwardRef,
  signal,
  booleanAttribute,
} from "@angular/core";
import { TEDI_INPUT_GROUP } from "../input-group/input-group.token";
import { TEDI_FORM_FIELD } from "./form-field-context";
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
  providers: [
    {
      provide: TEDI_FORM_FIELD,
      useExisting: forwardRef(() => FormFieldComponent),
    },
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
   * Whether the field shows a clear button. The single source of truth for every
   * control inside it — date and time fields read it too instead of declaring
   * their own input.
   * @default false
   */
  clearable = input(false, { transform: booleanAttribute });
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
    this.controlRef.set(this.control);

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

  /**
   * The resolved `ContentChild`, mirrored into a signal. A plain property read
   * is not a reactive dependency, so the computeds below would cache whatever
   * they saw before `ngAfterContentInit` and never re-evaluate.
   */
  private readonly controlRef = signal<FormFieldControl | undefined>(undefined);

  /**
   * Whether the field renders its own clear button. Controls that render one
   * themselves opt out, so `clearable` drives them without producing two.
   */
  readonly renderClearButton = computed(
    () => this.clearable() && !this.controlRef()?.ownsClearButton,
  );

  showClearButton = computed(() => {
    const value = this.controlRef()?.value();
    return this.renderClearButton() && !!value;
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
      "tedi-form-field--with-icon": this.renderClearButton() || !!this.icon(),
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

  /**
   * The control never fills the whole box — the box padding and the layout
   * wrappers around the control are outside its hit area — so clicking there
   * would otherwise leave the field unfocused. Focus the control instead, unless
   * the click landed on something interactive that handles it itself (the
   * control, the clear/calendar buttons, a tag's close button).
   */
  handleBoxMouseDown(event: MouseEvent) {
    if (this.isDisabled()) return;

    const target = event.target as HTMLElement | null;
    if (target?.closest("button, input, textarea, select, a")) return;

    // Keep the browser from moving focus off the control we are about to focus.
    event.preventDefault();
    this.control?.focus?.();
  }
}
