import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  model,
  signal,
  ViewEncapsulation,
  viewChild,
  effect,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NgTemplateOutlet } from "@angular/common";
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
import { ModalFullscreen } from "../../overlay/modal/modal.types";
import {
  FormFieldControl,
  TEDI_FORM_FIELD_CONTROL,
} from "../form-field/form-field-control";
import { TEDI_FORM_FIELD } from "../form-field/form-field-context";
import {
  TimePickerModalComponent,
  TimePickerModalData,
} from "./time-picker-modal.component";
import { normalizeTime } from "../../../utils/time.util";

export type TimeFieldPickerVariant = TimePickerVariant | "none";
export type TimeFieldPickerTrigger = "button" | "input";
export type TimeFieldModal = boolean | "sm" | "md" | "lg" | "xl";
export type TimeFieldFullscreen = ModalFullscreen;
export type TimeFieldUseNativePicker = boolean | "sm" | "md" | "lg" | "xl";

@Component({
  selector: "tedi-time-field",
  standalone: true,
  templateUrl: "./time-field.component.html",
  styleUrl: "./time-field.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    NgTemplateOutlet,
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
  /**
   * Manually mark the field as invalid. Sets `aria-invalid` on the input and triggers
   * the form-field's invalid styling. Combines with reactive-form validity reported
   * via `setInvalidState`.
   */
  // eslint-disable-next-line @angular-eslint/no-input-rename
  protected readonly invalidInput = input<boolean>(false, { alias: "invalid" });
  /** Disables interaction. Combines with the form-control disabled state. */
  readonly disabled = input<boolean>(false);
  /** Picker variant. `none` renders just the input with no picker UI — typed input is still normalized on blur. */
  readonly pickerVariant = input<TimeFieldPickerVariant>("scroll");
  /**
   * Use the OS native time picker instead of the custom one. `true` always, `false` never, breakpoint name → native below that breakpoint (custom from that breakpoint up).
   * When resolved to `true`, overrides `pickerVariant` and `modal` — the input renders as `type="time"`.
   */
  readonly useNativePicker = input<TimeFieldUseNativePicker>(false);
  /** What opens the picker: only the icon (`button`) or also clicking the input (`input`). */
  readonly pickerTrigger = input<TimeFieldPickerTrigger>("button");
  /** Close the popover/modal as soon as the user picks a value. */
  readonly closeOnSelect = input<boolean>(false);
  /** Predefined `HH:mm` strings for the `slots` and `dropdown` variants. */
  readonly timeSlots = input<string[]>([]);
  /** Grid columns for the `slots` variant. */
  readonly columns = input<number>(3);
  /** Show the radio indicator dot on each card in the `slots` variant. */
  readonly showSlotIndicator = input<boolean>(false);
  /** Minute step for the `scroll` variant — e.g. `5` renders `00, 05, 10…`. */
  readonly minuteStep = input<number>(1);
  /** Open the picker in a modal: `true` always, `false` never, breakpoint name → modal below that breakpoint. */
  readonly modal = input<TimeFieldModal>("md");
  /** Make the mobile modal fullscreen: `true` always, `false` never, breakpoint name → fullscreen below that breakpoint. Only applies when the picker actually opens as a modal. */
  readonly fullscreen = input<TimeFieldFullscreen>(false);

  private readonly formField = inject(TEDI_FORM_FIELD, { optional: true });
  private readonly breakpointService = inject(BreakpointService);
  private readonly modalService = inject(ModalService);
  private readonly injector = inject(Injector);

  readonly inputElement =
    viewChild.required<ElementRef<HTMLInputElement>>("inputElement");
  readonly fieldEl = viewChild<ElementRef<HTMLElement>>("fieldEl");
  readonly popover = viewChild<PopoverComponent>("popover");
  readonly timePicker = viewChild<TimePickerComponent>("timePicker");

  readonly dropdownMinWidth = signal<number | null>(null);

  readonly inputValue = signal("");

  private formDisabled = signal(false);
  private formInvalid = signal(false);
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  readonly invalid = computed(
    () => this.invalidInput() || this.formInvalid(),
  );
  readonly hasValue = computed(
    () => this.value() !== null && this.value() !== "",
  );
  readonly showClear = computed(
    () => this.hasValue() && this.clearableResolved(),
  );
  /** The clear button sits in the time field's action row, beside the picker. */
  readonly ownsClearButton = true;
  /** Driven by the wrapping `tedi-form-field`'s `clearable`. */
  readonly clearableResolved = computed(
    () => this.formField?.clearable() ?? true,
  );
  readonly useNativePickerResolved = computed(() => {
    const v = this.useNativePicker();
    return typeof v === "boolean"
      ? v
      : this.breakpointService.isBelowBreakpoint(v)();
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
  // Popover only when there's a custom picker, not a modal, and not disabled
  // (disabled renders no trigger, so it can't be opened).
  readonly usePopover = computed(
    () => this.hasPicker() && !this.useMobileModal() && !this.isDisabled(),
  );
  // Opens from the field start for input-trigger, toward the icon end for button.
  readonly popoverPosition = computed(() =>
    this.pickerTrigger() === "input"
      ? ("bottom-start" as const)
      : ("bottom-end" as const),
  );
  popoverIsOpen(): boolean {
    return !!this.popover()?.isOpen();
  }

  constructor() {
    effect(() => {
      const val = this.value();
      this.inputValue.set(val ?? "");
    });
  }

  writeValue(value: string | null): void {
    // Guard against same-value patches: without this, a parent form patching the
    // current value back (common with reactive forms) would overwrite the user's
    // in-progress input mid-typing.
    if (value === this.value()) return;
    // The constructor effect also mirrors `value` into `inputValue`, but we sync it
    // here too so synchronous reads (e.g. tests, CVA wiring) see the new value
    // without waiting for the next change-detection tick.
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

    if (this.useNativePickerResolved()) {
      const next = value === "" ? null : value;
      if (next !== this.value()) {
        this.value.set(next);
        this.onChange(next);
      }
    }
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

  focus() {
    if (this.isDisabled()) return;
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

  onInputClick(event: MouseEvent) {
    if (this.isDisabled()) return;
    // No popover wrapper in modal mode, so open it explicitly.
    if (this.inputIsTrigger() && this.useMobileModal()) {
      this.openPicker();
      return;
    }
    // Button-trigger: keep the input click from bubbling to the trigger directive.
    if (this.usePopover() && !this.inputIsTrigger()) {
      event.stopPropagation();
    }
  }

  // The wrapper is the popover trigger; input-trigger opens from any field click,
  // so align the wheel here. (Button-trigger reaches the trigger only via the
  // icon — see onIconClick — so nothing to do here.)
  onFieldClick() {
    if (this.isDisabled()) return;
    if (this.inputIsTrigger()) {
      this.onPickerOpen();
    }
  }

  // The click bubbles to the trigger directive which toggles the popover; we
  // just align the wheel.
  onIconClick() {
    this.onPickerOpen();
  }

  onClearClick(event: MouseEvent) {
    event.stopPropagation();
    this.clearInput();
  }

  // Forwards focus from the wrapper (popover-trigger) to the input. The popover's
  // `hidePopover(true)` lands focus on the wrapper element; we delegate so the user
  // gets a single visible focus indicator on the input instead of two stacked rings.
  // The guard ignores bubbled focus events from inner elements (input, buttons) so
  // we don't loop when focus actually arrives at the input.
  onFieldFocus(event: FocusEvent) {
    if (event.target !== event.currentTarget) return;
    this.inputElement().nativeElement.focus({ preventScroll: true });
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
      showSlotIndicator: this.showSlotIndicator(),
      minuteStep: this.minuteStep(),
    };

    const ref = this.modalService.open<string | null, TimePickerModalData>(
      TimePickerModalComponent,
      {
        data,
        size: "small",
        width: "sm",
        position: "center",
        fullscreen: this.fullscreen(),
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
    // Dropdown variant: size its min-width to the field wrapper so it spans
    // the full input area instead of shrinking to fit the time strings.
    // The popover content is positioned relative to the wrapper but sized
    // by its own content, so this min-width is what visually fills the gap.
    if (this.pickerVariant() === "dropdown") {
      const w = this.fieldEl()?.nativeElement.offsetWidth ?? null;
      this.dropdownMinWidth.set(w);
    } else {
      this.dropdownMinWidth.set(null);
    }

    // The popover renders on the next change-detection tick, so we wait for two
    // renders: the first lays out the picker (needed for scrollToSelected to
    // measure item heights); the second lets the scroll position settle before
    // we move focus into the picker.
    afterNextRender(
      () => {
        this.timePicker()?.scrollToSelected();
        afterNextRender(
          () => this.timePicker()?.focusActiveItem(),
          { injector: this.injector },
        );
      },
      { injector: this.injector },
    );
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

  // Closes the picker popover and lands focus back on the input. We always pass
  // `focusTrigger=false` to the popover (its built-in path would land focus on the
  // wrapper, which (focus) would then bounce into the input — same destination,
  // one extra hop). `notifyTouched` is true for explicit user dismissals
  // (Tab/Escape from the picker, value selected with closeOnSelect) so
  // ControlValueAccessor consumers see a touch event.
  closePopover(notifyTouched = true) {
    this.popover()?.hidePopover(false);
    this.inputElement().nativeElement.focus({ preventScroll: true });
    if (notifyTouched) this.onTouched();
  }
}
