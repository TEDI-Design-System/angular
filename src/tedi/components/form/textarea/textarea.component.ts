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
  OnInit,
  Renderer2,
  signal,
  ViewEncapsulation,
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

export type TextareaSize = Exclude<InputSize, "large">;

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
    "[class.tedi-field-surface]": "paintsSurface()",
    "[class.tedi-field-surface--valid]": "paintsSurface() && valid()",
    "[class.tedi-textarea--small]": "resolvedSize() === 'small'",
    "[class.tedi-textarea--not-resizable]": "!resizable()",
    "[class.tedi-textarea--auto-grow]": "autoGrow()",
    "[style.height]": "heightStyle()",
    "[style.min-height]": "minHeightStyle()",
    "[style.max-height]": "maxHeightStyle()",
    "[attr.aria-invalid]": "invalid() || null",
    "[attr.aria-describedby]": "describedBy.attribute()",
    "(input)": "handleInputChange($event)",
    "(blur)": "handleBlur()",
  },
})
export class TextareaComponent
  implements OnInit, ControlValueAccessor, FormFieldControl
{
  private el = inject<ElementRef<HTMLTextAreaElement>>(ElementRef);
  private renderer = inject(Renderer2);
  private readonly fieldContext = inject(TEDI_FIELD_CONTEXT, {
    optional: true,
  });

  /**
   * Value of the textarea. Supports two-way binding, use with form controls.
   */
  value = model<string>("");
  /**
   * Size of the field. Falls back to the size of a wrapping `tedi-form-field`
   * when not set here.
   */
  size = input<TextareaSize | undefined>();
  /**
   * Forces the error state on, or off, regardless of the reactive-forms state.
   * Leave unset to let the control derive it.
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  readonly invalidInput = input<boolean>(false, { alias: "invalid" });
  /**
   * Whether the user can resize the textarea. Only vertical resizing is
   * supported; set to `false` to disable resizing entirely.
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
   * Number of rows the field rests at, and the fewest it can ever show. With no
   * `height` set this is what sizes the textarea, so it is the input to reach
   * for when a field needs to be taller or shorter — in every mode, not just
   * while `autoGrow` is on.
   *
   * @default 3
   */
  minRows = input<number>(3);
  /**
   * Most rows the field shows before it starts scrolling. Caps `autoGrow`'s
   * growth and how far the resize grip can be dragged.
   *
   * @default 12
   */
  maxRows = input<number>(12);
  /**
   * Exact resting height (e.g. `'7.5rem'`, `200` → `200px`), for the rare field
   * that has to match something other than a whole number of rows. Prefer
   * `minRows`. Ignored while `autoGrow` is on, and still bounded by `minRows`
   * and `maxRows`.
   */
  height = input<string | number | undefined>();
  /**
   * Maximum height the textarea may grow to (e.g. `'200px'`, `12` → `12px`,
   * `'12rem'`). Beyond it the field scrolls. Applied on top of `maxRows`,
   * whichever is smaller.
   */
  maxHeight = input<string | number | undefined>();

  private toCssSize(value: string | number): string {
    return typeof value === "number" ? `${value}px` : value;
  }

  private rowsToHeight(rows: number): string {
    return `calc(${rows} * 1lh + 2 * var(--_field-padding-y))`;
  }

  readonly resolvedSize = computed<InputSize>(
    () => this.size() ?? this.fieldContext?.size() ?? "default",
  );

  readonly paintsSurface = computed(
    () => !(this.fieldContext?.ownsSurface() ?? false),
  );

  readonly valid = computed(() => this.fieldContext?.valid() ?? false);

  readonly heightStyle = computed<string | null>(() => {
    const height = this.height();
    if (this.autoGrow() || height == null) return null;
    return this.toCssSize(height);
  });

  /**
   * `minRows` is the resting height as much as it is the floor: with no `height`
   * the textarea has nothing else to size to, so the floor is what it settles
   * at. That makes it the one number a consumer has to change.
   */
  readonly minHeightStyle = computed<string>(() =>
    this.rowsToHeight(this.minRows()),
  );

  readonly maxHeightStyle = computed<string>(() => {
    const limits = [this.rowsToHeight(this.maxRows())];
    const maxHeight = this.maxHeight();
    if (maxHeight != null) limits.push(this.toCssSize(maxHeight));

    return limits.length === 1 ? limits[0] : `min(${limits.join(", ")})`;
  });

  readonly disabled = computed(
    () => this.formDisabled() || (this.fieldContext?.disabled() ?? false),
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
        this.renderer.setProperty(this.el.nativeElement, "value", value);
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
    this.renderer.setProperty(this.el.nativeElement, "disabled", isDisabled);
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

  focus() {
    if (this.disabled()) return;
    this.el.nativeElement.focus();
  }

  reset() {
    if (this.disabled()) return;

    this.setValue("");
    this.onChange("");
    this.onTouched();
  }
}
