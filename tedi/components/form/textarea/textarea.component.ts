import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  model,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  FormFieldControl,
  TEDI_FORM_FIELD_CONTROL,
} from "../form-field/form-field-control";

@Component({
  selector: "textarea[tedi-textarea]",
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
    {
      provide: TEDI_FORM_FIELD_CONTROL,
      useExisting: forwardRef(() => TextareaComponent),
    },
  ],
  template: "",
  styleUrl: "./textarea.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-textarea",
    "[class.tedi-textarea--not-resizable]": "!resizable()",
    "[class.tedi-textarea--auto-grow]": "autoGrow()",
    "[style.height]": "heightStyle()",
    "[style.min-height]": "minHeightStyle()",
    "[style.max-height]": "maxHeightStyle()",
    "[attr.aria-invalid]": "invalid() || null",
    "(input)": "handleInputChange($event)",
    "(blur)": "handleBlur()",
  },
})
export class TextareaComponent implements ControlValueAccessor, FormFieldControl {
  private el = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);

  /**
   * Value of the textarea. Supports two-way binding, use with form controls.
   */
  value = model<string>("");
  /**
   * Whether the user can resize the textarea. Only vertical resizing is
   * supported; set to `false` to disable resizing entirely.
   *
   * The resize is applied to the surrounding `tedi-form-field` box (which owns
   * the border) while the textarea fills it, so the visible field resizes with
   * the drag.
   *
   * @default true
   */
  resizable = input<boolean>(true);
  /**
   * Automatically grows the textarea to fit its content as the user types,
   * using the native CSS `field-sizing` property (no JavaScript). Growth is
   * bounded by `minRows` and `maxRows` (and the optional `maxHeight` cap), and
   * manual resizing is disabled while auto-growing.
   *
   * On browsers without `field-sizing` support the textarea gracefully falls
   * back to its `minRows` height and remains manually resizable.
   *
   * @default false
   */
  autoGrow = input<boolean>(false);
  /**
   * Minimum number of visible rows while `autoGrow` is enabled.
   * @default 3
   */
  minRows = input<number>(3);
  /**
   * Maximum number of visible rows before the field scrolls, while `autoGrow`
   * is enabled.
   * @default 12
   */
  maxRows = input<number>(12);
  /**
   * Fixed height of the textarea (e.g. `'7.5rem'`, `200` → `200px`). Applied
   * only when `autoGrow` is disabled; otherwise the height is content-driven.
   * Set to `undefined` to let the resting height come from the native `rows`
   * attribute instead.
   *
   * @default "7.5rem"
   */
  height = input<string | number | undefined>("7.5rem");
  /**
   * Maximum height the textarea may grow to (e.g. `'200px'`, `12` → `12px`,
   * `'12rem'`). Beyond it the field scrolls. Limits `autoGrow` growth (in
   * addition to `maxRows`) and manual resizing.
   */
  maxHeight = input<string | number | undefined>();

  private toCssSize(value: string | number): string {
    return typeof value === "number" ? `${value}px` : value;
  }

  private rowsToHeight(rows: number): string {
    return `calc(${rows} * 1lh + 2 * var(--_tedi-textarea-padding-y))`;
  }

  readonly heightStyle = computed<string | null>(() => {
    const height = this.height();
    if (this.autoGrow() || height == null) return null;
    return this.toCssSize(height);
  });

  readonly minHeightStyle = computed<string | null>(() =>
    this.autoGrow() ? this.rowsToHeight(this.minRows()) : null,
  );

  readonly maxHeightStyle = computed<string | null>(() => {
    const limits: string[] = [];
    if (this.autoGrow()) limits.push(this.rowsToHeight(this.maxRows()));
    const maxHeight = this.maxHeight();
    if (maxHeight != null) limits.push(this.toCssSize(maxHeight));

    if (limits.length === 0) return null;
    return limits.length === 1 ? limits[0] : `min(${limits.join(", ")})`;
  });

  readonly disabled = computed(() => this.formDisabled());

  readonly invalid = signal(false);

  setInvalidState(isInvalid: boolean) {
    this.invalid.set(isInvalid);
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
    this.el.nativeElement.disabled = isDisabled;
  }

  handleInputChange(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;

    this.value.set(value);
    this.onChange(value);
  }

  handleBlur() {
    this.onTouched();
  }
}
