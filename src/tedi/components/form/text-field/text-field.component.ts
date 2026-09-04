import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  ViewEncapsulation,
  forwardRef,
  OnInit,
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
import {
  InputSize,
  TEDI_FIELD_CONTEXT,
} from "../form-field/field-context.token";
import { deriveControlState } from "../form-field/derive-control-state";
import { controlDescribedBy } from "../form-field/control-described-by";

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
    "[class.tedi-field-surface]": "paintsSurface()",
    "[class.tedi-field-surface--valid]": "paintsSurface() && valid()",
    "[class.tedi-text-field--small]": "resolvedSize() === 'small'",
    "[class.tedi-text-field--large]": "resolvedSize() === 'large'",
    "[class.tedi-text-field--arrows-hidden]": "arrowsHidden()",
    "[attr.aria-invalid]": "invalid() || null",
    "[attr.aria-describedby]": "describedBy.attribute()",
    "[disabled]": "disabled()",
    "(input)": "handleInputChange($event)",
    "(blur)": "handleBlur()",
  },
})
export class TextFieldComponent
  implements OnInit, ControlValueAccessor, FormFieldControl
{
  private el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly fieldContext = inject(TEDI_FIELD_CONTEXT, {
    optional: true,
  });

  /**
   * Value of the input field. Supports two-way binding, use with form controls.
   */
  value = model<string>("");
  /**
   * Size of the field. Falls back to the size of a wrapping `tedi-form-field`
   * when not set here.
   */
  size = input<InputSize | undefined>();
  /**
   * Forces the error state on, or off, regardless of the reactive-forms state.
   * Leave unset to let the control derive it.
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly invalidInput = input<boolean>(false, { alias: "invalid" });
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
  readonly disabledInput = input(false, {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    alias: "disabled",
    transform: booleanAttribute,
  });

  readonly disabled = computed(
    () =>
      this.disabledInput() ||
      this.formDisabled() ||
      (this.fieldContext?.disabled() ?? false),
  );

  private readonly derived = deriveControlState();

  readonly describedBy = controlDescribedBy();

  readonly touched = this.derived.touched;

  readonly dirty = this.derived.dirty;

  readonly invalid = computed(
    () =>
      this.invalidInput() ||
      this.derived.invalid() ||
      (this.fieldContext?.invalid() ?? false),
  );

  readonly resolvedSize = computed<InputSize>(
    () => this.size() ?? this.fieldContext?.size() ?? "default",
  );

  readonly paintsSurface = computed(
    () => !(this.fieldContext?.ownsSurface() ?? false),
  );

  readonly valid = computed(() => this.fieldContext?.valid() ?? false);

  ngOnInit() {
    this.derived.connect();
  }

  setDescribedBy(ids: string[]) {
    this.describedBy.set(ids);
  }

  private formDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

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

  focus() {
    if (this.disabled()) return;
    this.el.nativeElement.focus();
  }

  reset() {
    if (this.disabled()) return;

    this.setValue("");
    this.onChange("");
    this.clear.emit();
    this.onTouched();
  }
}
