import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  input,
  model,
  signal,
  ViewEncapsulation,
  viewChild,
  effect,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ButtonComponent } from "../../buttons/button/button.component";
import { ClosingButtonComponent } from "../../buttons/closing-button/closing-button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { PopoverComponent } from "../../overlay/popover/popover.component";
import { PopoverContentComponent } from "../../overlay/popover/popover-content/popover-content.component";
import { PopoverTriggerDirective } from "../../overlay/popover/popover-trigger/popover-trigger.directive";
import {
  TimePickerComponent,
  TimePickerVariant,
} from "../time-picker/time-picker.component";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";
import {
  FormFieldControl,
  TEDI_FORM_FIELD_CONTROL,
} from "../form-field/form-field-control";

export type TimeFieldSize = "default" | "small";
export type TimeFieldState = "default" | "error" | "valid";
export type TimeFieldPickerVariant = TimePickerVariant | "none" | "native";

@Component({
  selector: "tedi-time-field",
  standalone: true,
  templateUrl: "./time-field.component.html",
  styleUrl: "./time-field.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ButtonComponent,
    ClosingButtonComponent,
    SeparatorComponent,
    IconComponent,
    PopoverComponent,
    PopoverContentComponent,
    PopoverTriggerDirective,
    TimePickerComponent,
    TediTranslationPipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimeFieldComponent),
      multi: true,
    },
    {
      provide: TEDI_FORM_FIELD_CONTROL,
      useExisting: forwardRef(() => TimeFieldComponent),
    },
  ],
  host: {
    class: "tedi-time-field",
  },
})
export class TimeFieldComponent
  implements ControlValueAccessor, FormFieldControl<string | null>
{
  readonly inputId = input.required<string>();
  readonly value = model<string | null>(null);
  readonly placeholder = input<string>();
  readonly size = input<TimeFieldSize>("default");
  readonly state = input<TimeFieldState>("default");
  readonly disabled = input<boolean>(false);
  readonly invalid = input<boolean>(false);
  readonly clearable = input<boolean>(true);
  readonly pickerVariant = input<TimeFieldPickerVariant>("scroll");
  readonly closeOnSelect = input<boolean>(false);
  readonly timeSlots = input<string[]>([]);
  readonly columns = input<number>(3);
  readonly minuteStep = input<number>(1);

  readonly inputElement =
    viewChild.required<ElementRef<HTMLInputElement>>("inputElement");
  readonly nativeInput = viewChild<ElementRef<HTMLInputElement>>("nativeInput");
  readonly popover = viewChild<PopoverComponent>("popover");
  readonly timePicker = viewChild<TimePickerComponent>("timePicker");

  readonly inputValue = signal("");

  private formDisabled = signal(false);
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly isInvalid = computed(
    () => this.invalid() || this.state() === "error",
  );
  readonly hasValue = computed(
    () => this.value() !== null && this.value() !== "",
  );
  readonly showClear = computed(() => this.hasValue() && this.clearable());
  readonly hasPicker = computed(() => {
    const v = this.pickerVariant();
    return v !== "none" && v !== "native";
  });
  readonly hasNativePicker = computed(() => this.pickerVariant() === "native");
  readonly resolvedPickerVariant = computed(
    () => this.pickerVariant() as TimePickerVariant,
  );

  constructor() {
    effect(() => {
      const val = this.value();
      this.inputValue.set(val ?? "");
    });
  }

  writeValue(value: string | null): void {
    this.value.set(value);
    this.inputValue.set(value ?? "");
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  handleInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue.set(value);
  }

  handleBlur() {
    this.onTouched();

    const raw = this.inputValue();
    if (raw === "") {
      if (this.value() !== null) {
        this.value.set(null);
        this.onChange(null);
      }
      return;
    }

    const parsed = this.parseTime(raw);
    if (parsed) {
      if (parsed !== this.value()) {
        this.value.set(parsed);
        this.onChange(parsed);
      }
      this.inputValue.set(parsed);
    } else {
      this.inputValue.set(this.value() ?? "");
    }
  }

  clearInput() {
    this.value.set(null);
    this.inputValue.set("");
    this.onChange(null);
    this.inputElement().nativeElement.focus();
  }

  clearField() {
    this.clearInput();
  }

  openNativePicker() {
    this.nativeInput()?.nativeElement.showPicker();
  }

  onNativeChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    const parsed = value || null;
    if (parsed !== this.value()) {
      this.value.set(parsed);
      this.inputValue.set(parsed ?? "");
      this.onTouched();
      this.onChange(parsed);
    }
  }

  onPickerOpen() {
    // First timeout waits for popover to render content in DOM.
    // Nested timeout runs after popover's own focus setup (which also uses setTimeout).
    setTimeout(() => {
      this.timePicker()?.scrollToSelected();
      setTimeout(() => {
        this.timePicker()?.focusActiveItem();
      });
    });
  }

  onPickerValueChange(newValue: string | null) {
    if (newValue !== this.value()) {
      this.value.set(newValue);
      this.inputValue.set(newValue ?? "");
      this.onTouched();
      this.onChange(newValue);
    }

    if (this.closeOnSelect()) {
      this.closePopover();
    }
  }

  closePopoverToTrigger() {
    this.popover()?.hidePopover(true);
    this.onTouched();
  }

  closePopover() {
    this.popover()?.hidePopover(true);
    this.inputElement().nativeElement.focus();
    this.onTouched();
  }

  private parseTime(value: string): string | null {
    const trimmed = value.trim();
    const match = trimmed.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;

    const hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);

    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  }
}
