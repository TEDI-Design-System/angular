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
import {
  breakpointInput,
  BreakpointInput,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
import { ModalService } from "../../overlay/modal/modal.service";
import {
  FormFieldControl,
  TEDI_FORM_FIELD_CONTROL,
} from "../form-field/form-field-control";
import {
  TimePickerModalComponent,
  TimePickerModalData,
} from "./time-picker-modal.component";
import { normalizeTime } from "../../../utils/time.util";

export type TimeFieldSize = "default" | "small";
export type TimeFieldState = "default" | "error" | "valid";
export type TimeFieldPickerVariant = TimePickerVariant | "none";
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
  /** Picker variant. `none` renders just the input with no picker UI — typed input is still normalized on blur. */
  readonly pickerVariant = input<TimeFieldPickerVariant>("scroll");
  /**
   * Use the OS native time picker instead of the custom one. Accepts a breakpoint object,
   * e.g. `{ xs: true, md: false }` to use the native picker on phones and the custom variant on larger screens.
   * When `true`, overrides `pickerVariant` and `modal` — the input renders as `type="time"`.
   */
  readonly useNativePicker = input(
    { xs: false },
    { transform: (v: BreakpointInput<boolean>) => breakpointInput(v) },
  );
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
  readonly useNativePickerResolved = computed(() => {
    const v = this.useNativePicker();
    if (v.xxl !== undefined && this.breakpointService.isAboveBreakpoint("xxl")()) return v.xxl;
    if (v.xl !== undefined && this.breakpointService.isAboveBreakpoint("xl")()) return v.xl;
    if (v.lg !== undefined && this.breakpointService.isAboveBreakpoint("lg")()) return v.lg;
    if (v.md !== undefined && this.breakpointService.isAboveBreakpoint("md")()) return v.md;
    if (v.sm !== undefined && this.breakpointService.isAboveBreakpoint("sm")()) return v.sm;
    return v.xs;
  });
  readonly hasPicker = computed(
    () => this.pickerVariant() !== "none" && !this.useNativePickerResolved(),
  );
  readonly hasNativePicker = computed(() => this.useNativePickerResolved());
  readonly customPickerVariant = computed(
    () => this.pickerVariant() as TimePickerVariant,
  );
  readonly inputType = computed(() =>
    this.useNativePickerResolved() ? "time" : "text",
  );
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
    const normalized = normalizeTime(raw);

    if (normalized === "") {
      if (this.value() !== null) {
        this.value.set(null);
        this.onChange(null);
      }
      return;
    }

    if (normalized !== null) {
      if (normalized !== this.value()) {
        this.value.set(normalized);
        this.onChange(normalized);
      }
      this.inputValue.set(normalized);
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
      variant: this.customPickerVariant(),
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

}
