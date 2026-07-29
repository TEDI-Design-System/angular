import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ButtonComponent, ButtonVariant } from "../../buttons/button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { ComponentInputs } from "../../../types/inputs.type";
import {
  FormFieldComponent,
  FormFieldIcon,
  InputSize,
} from "../form-field/form-field.component";
import { TextFieldComponent } from "../text-field/text-field.component";
import { LabelComponent } from "../label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";

export type SearchSize = InputSize;

export interface SearchButton {
  /**
   * Visible button text. When omitted, the button is rendered icon-only.
   */
  text?: string;
  /**
   * Icon shown inside the button.
   * @default "search"
   */
  icon?: string;
  /**
   * Button color variant.
   * @default "primary"
   */
  variant?: ButtonVariant;
  /**
   * Accessible label for an icon-only button.
   * @default translation "search"
   */
  ariaLabel?: string;
}

@Component({
  selector: "tedi-search",
  standalone: true,
  templateUrl: "./search.component.html",
  styleUrl: "./search.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    FormFieldComponent,
    TextFieldComponent,
    LabelComponent,
    FeedbackTextComponent,
    ButtonComponent,
    IconComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SearchComponent),
      multi: true,
    },
  ],
  host: {
    role: "search",
    class: "tedi-search",
    "[attr.aria-label]": "searchAriaLabel()",
    "[style.--tedi-search-field-height]": "fieldHeight()",
    "[class.tedi-search--button-icon-only]": "!!button() && !button()?.text",
  },
})
export class SearchComponent implements ControlValueAccessor {
  /**
   * Unique identifier for the input element, used to associate the label.
   */
  inputId = input.required<string>();
  /**
   * Visible label text. When omitted, provide `ariaLabel` for accessibility.
   */
  label = input<string>();
  /**
   * Value of the search input. Supports two-way binding and reactive forms.
   */
  value = model<string>("");
  /**
   * Placeholder text for the search input.
   */
  placeholder = input<string>("");
  /**
   * Size of the search field.
   * @default "default"
   */
  size = input<SearchSize>("default");
  /**
   * Whether the input shows a clear button once it has a value.
   * @default true
   */
  clearable = input<boolean>(true);
  /**
   * Icon shown inside the input. Ignored when `button` is set.
   * @default "search"
   */
  searchIcon = input<string | FormFieldIcon>("search");
  /**
   * Whether the search field is disabled.
   * @default false
   */
  disabled = input<boolean>(false);
  /**
   * When set, renders a trailing search button and hides the inline icon.
   */
  button = input<SearchButton>();
  /**
   * FeedbackText component inputs (hint / validation message).
   */
  feedbackText = input<ComponentInputs<FeedbackTextComponent>>();
  /**
   * Accessible name for the search region. Falls back to `label`, then
   * `placeholder`, then the translated "search" label.
   */
  ariaLabel = input<string>();

  /**
   * Emitted when the search is executed (Enter key or button click).
   */
  readonly searchEvent = output<string>();
  /**
   * Emitted when the clear button is clicked.
   */
  readonly clear = output<void>();

  private readonly inputRef = viewChild("searchInput", { read: ElementRef });

  private readonly formDisabled = signal(false);
  private readonly translationService = inject(TediTranslationService);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());

  readonly fieldIcon = computed(() =>
    this.button() ? undefined : this.searchIcon()
  );

  readonly fieldHeight = computed(() => {
    switch (this.size()) {
      case "small":
        return "var(--form-field-height-sm)";
      case "large":
        return "var(--form-field-height-lg)";
      default:
        return "var(--form-field-height)";
    }
  });

  readonly buttonSize = computed(() =>
    this.size() === "small" ? "small" : "default"
  );

  readonly buttonIconSize = computed(() => (this.size() === "large" ? 24 : 18));

  readonly buttonAriaLabel = computed(() => {
    const button = this.button();
    if (button?.text) return null;
    return button?.ariaLabel ?? this.translationService.translate("search");
  });

  readonly feedbackId = computed(() =>
    this.feedbackText() ? `${this.inputId()}-feedback` : null
  );

  readonly searchAriaLabel = computed(
    () =>
      this.ariaLabel() ||
      this.label() ||
      this.placeholder() ||
      this.translationService.translate("search")
  );

  onInputValue(value: string): void {
    this.value.set(value);
    this.onChange(value);
  }

  onClear(): void {
    this.clear.emit();
    this.onTouched();
  }

  onBlur(): void {
    this.onTouched();
  }

  emitSearch(): void {
    this.searchEvent.emit(this.value());
  }

  focus(): void {
    const input = this.inputRef()?.nativeElement as HTMLInputElement | undefined;
    input?.focus();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? "");
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
}
