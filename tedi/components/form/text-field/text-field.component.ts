import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  ViewEncapsulation,
  forwardRef,
  signal,
  output,
  ElementRef,
  inject,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  FormFieldControl,
  TEDI_FORM_FIELD_CONTROL,
} from "../form-field/form-field-control";
import { TEDI_INPUT_GROUP } from "../input-group/input-group.token";

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
    "[disabled]": "disabled()",
    "(input)": "handleInputChange($event)",
    "(blur)": "handleBlur()",
  },
})
export class TextFieldComponent
  implements ControlValueAccessor, FormFieldControl {
  private el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private group = inject(TEDI_INPUT_GROUP, { optional: true });

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

  /**
   * Disables the input from a parent template (e.g. a wrapping field component).
   * Combined with the reactive-forms disabled state and any input-group state.
   */
  readonly disabledInput = input<boolean>(false, { alias: "disabled" });

  readonly disabled = computed(
    () =>
      this.disabledInput() ||
      this.formDisabled() ||
      (this.group?.disabled() ?? false),
  );

  readonly invalid = signal(false);

  setInvalidState(isInvalid: boolean) {
    this.invalid.set(isInvalid);
  }

  private formDisabled = signal(false);
  private onChange: (value: string) => void = () => { };
  private onTouched: () => void = () => { };

  constructor() {
    effect(() => {
      const value = this.value();
      if (this.el.nativeElement.value !== value) {
        this.el.nativeElement.value = value;
      }
    });
  }

  private setValue(value: string) {
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
