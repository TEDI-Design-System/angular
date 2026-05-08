import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
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
import { BreakpointService } from "../../../services/breakpoint/breakpoint.service";
import { ModalService } from "../../overlay/modal/modal.service";
import {
  FormFieldControl,
  TEDI_FORM_FIELD_CONTROL,
} from "../form-field/form-field-control";
import {
  TimePickerModalComponent,
  TimePickerModalData,
} from "./time-picker-modal.component";

export type TimeFieldSize = "default" | "small";
export type TimeFieldState = "default" | "error" | "valid";
export type TimeFieldPickerVariant = TimePickerVariant | "none" | "native";
export type TimeFieldPickerTrigger = "button" | "input";
export type TimeFieldModal = boolean | "sm" | "md" | "lg" | "xl";

const DROPDOWN_TRIGGER_OFFSET = 12;

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
  /** Unique ID for label association and accessibility. */
  readonly inputId = input.required<string>();
  /** Selected time in `HH:mm` format. Two-way bindable. */
  readonly value = model<string | null>(null);
  /** Placeholder shown when the input is empty. */
  readonly placeholder = input<string>();
  /** Field size — matches the surrounding `tedi-form-field`. */
  readonly size = input<TimeFieldSize>("default");
  /** Visual validation state. */
  readonly state = input<TimeFieldState>("default");
  /** Disables interaction. Combines with the form-control disabled state. */
  readonly disabled = input<boolean>(false);
  /** Marks the field as invalid for ARIA + form-field error styling. */
  readonly invalid = input<boolean>(false);
  /** Show a clear button when the field has a value. */
  readonly clearable = input<boolean>(true);
  /** Picker variant. `none` renders just the input (with browser HH:mm validation); `native` opens the OS picker. */
  readonly pickerVariant = input<TimeFieldPickerVariant>("scroll");
  /** What opens the picker: only the icon (`button`) or also clicking the input (`input`). */
  readonly pickerTrigger = input<TimeFieldPickerTrigger>("button");
  /** Close the popover/modal as soon as the user picks a value. */
  readonly closeOnSelect = input<boolean>(false);
  /** Predefined `HH:mm` strings for the `slots` and `dropdown` variants. */
  readonly timeSlots = input<string[]>([]);
  /** Grid columns for the `slots` variant. */
  readonly columns = input<number>(3);
  /** Minute step for the `scroll` variant — e.g. `5` renders `00, 05, 10…`. */
  readonly minuteStep = input<number>(1);
  /** Open the picker in a modal: `true` always, `false` never, breakpoint name → modal below that breakpoint. */
  readonly modal = input<TimeFieldModal>("md");

  private readonly breakpointService = inject(BreakpointService);
  private readonly modalService = inject(ModalService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  readonly dropdownWidth = signal<number | null>(null);

  readonly inputElement =
    viewChild.required<ElementRef<HTMLInputElement>>("inputElement");
  readonly popover = viewChild<PopoverComponent>("popover");
  readonly timePicker = viewChild<TimePickerComponent>("timePicker");

  readonly inputValue = signal("");

  private formDisabled = signal(false);
  private formInvalid = signal(false);
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly isInvalid = computed(
    () => this.invalid() || this.formInvalid() || this.state() === "error",
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
  readonly inputType = computed(() => {
    const v = this.pickerVariant();
    return v === "native" || v === "none" ? "time" : "text";
  });
  readonly inputIsTrigger = computed(
    () =>
      this.pickerTrigger() === "input" &&
      (this.hasPicker() || this.useMobileModal()),
  );
  readonly useMobileModal = computed(() => {
    if (!this.hasPicker()) return false;
    const modal = this.modal();
    return typeof modal === "boolean"
      ? modal
      : this.breakpointService.isBelowBreakpoint(modal)();
  });

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

  setInvalidState(isInvalid: boolean): void {
    this.formInvalid.set(isInvalid);
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
    const input = this.inputElement().nativeElement;
    if (typeof input.showPicker === "function") {
      try {
        input.showPicker();
        return;
      } catch {
        /* showPicker may throw outside a user gesture — fall through */
      }
    }
    input.focus();
  }

  onInputClick() {
    if (this.isDisabled()) return;
    if (!this.inputIsTrigger()) return;
    this.openPicker();
  }

  openPicker() {
    if (this.isDisabled()) return;
    if (!this.hasPicker()) return;

    if (this.useMobileModal()) {
      this.openMobileModal();
      return;
    }

    this.popover()?.showPopover();
  }

  private openMobileModal() {
    const data: TimePickerModalData = {
      value: this.value(),
      variant: this.resolvedPickerVariant(),
      timeSlots: this.timeSlots(),
      columns: this.columns(),
      minuteStep: this.minuteStep(),
    };

    const ref = this.modalService.open<string | null, TimePickerModalData>(
      TimePickerModalComponent,
      {
        data,
        size: "small",
        width: "sm",
        position: "center",
        maxWidth: "var(--tedi-containers-03)",
      },
    );

    ref.closed.subscribe((result) => {
      this.onTouched();
      if (result === undefined) return;
      if (result !== this.value()) {
        this.value.set(result);
        this.inputValue.set(result ?? "");
        this.onChange(result);
      }
      this.inputElement().nativeElement.focus();
    });
  }

  onPickerOpen() {
    if (this.pickerVariant() === "dropdown") {
      const host = this.hostEl.nativeElement as HTMLElement;
      const formField = host.closest(".tedi-form-field") as HTMLElement | null;
      const anchor = formField ?? host;
      this.dropdownWidth.set(anchor.offsetWidth - DROPDOWN_TRIGGER_OFFSET);
    } else {
      this.dropdownWidth.set(null);
    }

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
