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
  ElementRef,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  FormFieldControl,
  TEDI_FORM_FIELD_CONTROL,
} from "../form-field/form-field-control";

@Component({
  selector: "input[tedi-text-field]",
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextFieldComponent),
      multi: true,
    },
    {
      provide: TEDI_FORM_FIELD_CONTROL,
      useExisting: forwardRef(() => TextFieldComponent),
    },
  ],
  template: "",
  styleUrl: "./text-field.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-text-field",
    "[class.tedi-text-field--arrows-hidden]": "arrowsHidden()",
    "[attr.aria-invalid]": "invalid() || null",
    "(input)": "handleInputChange($event)",
    "(blur)": "handleBlur()",
  },
})
export class TextFieldComponent
  implements ControlValueAccessor, FormFieldControl
{
  /**
   * Value of the input field. Supports two-way binding, use with form controls.
   */
  value = model<string>("");
  /**
   * Whether to hide arrows for number inputs.
   * @default true
   */
  arrowsHidden = input<boolean>(true);
  /**
   * Callback triggered when the clear button is clicked.
   */
  readonly clear = output<void>();

  constructor(private el: ElementRef<HTMLInputElement>) {}

  readonly disabled = computed(() => this.formDisabled());

  readonly invalid = signal(false);

  setInvalidState(isInvalid: boolean) {
    this.invalid.set(isInvalid);
  }

  private formDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  private setValue(value: string) {
    this.el.nativeElement.value = value;
    this.value.set(value);
  }

  writeValue(value: string | null): void {
    this.setValue(value ?? "");
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
    this.el.nativeElement.disabled = isDisabled;
  }

  handleInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    this.value.set(value);
    this.onChange(value);
  }

  handleBlur() {
    this.onTouched();
  }

  clearField() {
    if (this.disabled()) return;

    this.setValue("");
    this.onChange("");
    this.clear.emit();
    this.onTouched();
  }
}
