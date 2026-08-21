import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  forwardRef,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { NgClass, NgTemplateOutlet } from "@angular/common";
import {
  IconColor,
  IconComponent,
  IconSize,
  IconType,
  IconVariant,
} from "../../base/icon/icon.component";
import { ClosingButtonComponent } from "../../buttons/closing-button/closing-button.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";
import { TEDI_INPUT_GROUP } from "../input-group/input-group.token";
import {
  FormFieldControl,
  TEDI_FORM_FIELD_CONTROL,
} from "./form-field-control";
import {
  FieldContext,
  InputSize,
  TEDI_FIELD_CONTEXT,
} from "./field-context.token";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";

export type { InputSize };
export type InputState = "valid" | "error" | "default";

export interface FormFieldIcon {
  name: string;
  size?: IconSize;
  color?: IconColor;
  type?: IconType;
  variant?: IconVariant;
}
type ValidationState = "invalid" | "valid" | "neutral";

let formFieldIdCounter = 0;

@Component({
  selector: "tedi-form-field",
  standalone: true,
  templateUrl: "./form-field.component.html",
  styleUrl: "./form-field.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    NgTemplateOutlet,
    IconComponent,
    ClosingButtonComponent,
    SeparatorComponent,
    TediTranslationPipe,
  ],
  providers: [
    {
      provide: TEDI_FIELD_CONTEXT,
      useExisting: forwardRef(() => FormFieldComponent),
    },
  ],
  host: {
    "[class]": "hostClasses()",
  },
})
export class FormFieldComponent implements FieldContext {
  /**
   * Size of the whole field — the label, the control and the box row scale
   * together. A control's own `size` input overrides it.
   * @default "default"
   */
  size = input<InputSize>("default");
  /**
   * Icon name, or a configuration object, shown at the end of the field.
   */
  icon = input<string | FormFieldIcon | undefined>();
  /**
   * Whether the field shows a clear button once the control holds a value.
   * @default false
   */
  clearable = input<boolean>(false);
  /**
   * Custom CSS classes for the field box.
   *
   * @deprecated Style the control directly — it owns its own surface now.
   */
  inputClass = input<string | null>(null);
  /**
   * Maximum number of characters the control should hold. When set, a live
   * character counter (`current/limit`) is shown in the feedback row and the
   * field enters an error state once the limit is exceeded.
   */
  characterLimit = input<number | undefined>();

  readonly control = contentChild<FormFieldControl>(TEDI_FORM_FIELD_CONTROL, {
    descendants: true,
  });

  readonly feedback = contentChild(FeedbackTextComponent, {
    descendants: true,
  });

  private readonly inputGroup = inject(TEDI_INPUT_GROUP, { optional: true });
  private readonly id = `tedi-form-field-${formFieldIdCounter++}`;

  constructor() {
    effect(() => this.control()?.setDescribedBy?.(this.describedByIds()));
  }

  /**
   * Inline additions have to render inside the border, next to the control, so
   * they need a row that carries the surface. Without them the control paints
   * itself and no box is rendered at all.
   */
  readonly hasBox = computed(() => !!this.icon() || this.clearable());

  readonly ownsSurface = computed(() => this.hasBox());

  readonly disabled = computed(() => this.inputGroup?.disabled() ?? false);

  readonly invalid = computed(
    () =>
      this.feedback()?.type() === "error" ||
      this.characterCountExceeded() ||
      (this.inputGroup?.invalid() ?? false),
  );

  readonly valid = computed(() => this.validationState() === "valid");

  readonly characterCount = computed(
    () => this.control()?.value()?.toString().length ?? 0,
  );

  readonly characterCountExceeded = computed(() => {
    const limit = this.characterLimit();
    return limit != null && this.characterCount() > limit;
  });

  readonly characterCountId = computed<string | null>(() =>
    this.characterLimit() != null ? `${this.id}-character-count` : null,
  );

  readonly describedByIds = computed(() => {
    const ids = [this.feedback()?.elementId(), this.characterCountId()];
    return ids.filter((id): id is string => !!id);
  });

  readonly validationState = computed<ValidationState>(() => {
    const feedbackType = this.feedback()?.type();

    if (
      (this.control()?.invalid() ?? false) ||
      feedbackType === "error" ||
      this.characterCountExceeded()
    )
      return "invalid";
    if (feedbackType === "valid") return "valid";

    return "neutral";
  });

  readonly isDisabled = computed(
    () => (this.control()?.disabled() ?? false) || this.disabled(),
  );

  readonly boxClasses = computed(() => {
    const customClass = this.inputClass();

    return {
      "tedi-form-field__box": true,
      "tedi-field-surface": true,
      "tedi-field-surface--invalid": this.validationState() === "invalid",
      "tedi-field-surface--valid": this.validationState() === "valid",
      "tedi-field-surface--disabled": this.isDisabled(),
      ...(customClass ? { [customClass]: true } : {}),
    };
  });

  readonly resolvedIcon = computed<FormFieldIcon | undefined>(() => {
    const icon = this.icon();
    if (!icon) return undefined;

    return typeof icon === "string" ? { name: icon } : icon;
  });

  readonly iconSize = computed<IconSize>(() => {
    const size = this.size();
    if (size === "small") return 16;
    if (size === "large") return 24;
    return 18;
  });

  readonly showClearButton = computed(
    () => this.clearable() && !!this.control()?.value(),
  );

  clear() {
    this.control()?.reset?.();
  }

  /**
   * The box padding and the layout wrappers around the control are outside its
   * hit area, so clicking there would leave the field unfocused.
   */
  handleBoxMouseDown(event: MouseEvent) {
    if (this.isDisabled()) return;

    const target = event.target as HTMLElement | null;
    if (target?.closest("button, input, textarea, select, a")) return;

    // Keep the browser from moving focus off the control we are about to focus.
    event.preventDefault();
    this.control()?.focus?.();
  }

  readonly hostClasses = computed(() => {
    return {
      "tedi-form-field": true,
      "tedi-form-field--valid": this.validationState() === "valid",
      "tedi-form-field--invalid": this.validationState() === "invalid",
      "tedi-form-field--disabled": this.isDisabled(),
      "tedi-form-field--small": this.size() === "small",
      "tedi-form-field--large": this.size() === "large",
    };
  });
}
