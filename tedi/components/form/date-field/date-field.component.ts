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
  output,
  signal,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  ConnectedPosition,
  OverlayModule,
} from "@angular/cdk/overlay";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { DateInputComponent, DateInputChip } from "./date-input/date-input.component";
import { CalendarComponent } from "../../content/calendar/calendar.component";
import {
  CalendarView,
  DateFieldMode,
  DateRange,
} from "../../content/calendar/types";
import {
  FormFieldControl,
  TEDI_FORM_FIELD_CONTROL,
} from "../form-field/form-field-control";
import {
  Breakpoint,
  breakpointInput,
  BreakpointInput,
  BreakpointObject,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
import {
  formatLocaleDate,
  isSameDay,
  parseLocaleDate,
  startOfMonth,
} from "../../../utils/date.util";
import { matchAny, Matcher } from "../../../utils/matchers.util";
import { ModalService } from "../../overlay/modal/modal.service";
import {
  DateFieldModalComponent,
  DateFieldModalData,
} from "./date-field-modal/date-field-modal.component";

type DateFieldValue = Date | Date[] | DateRange | null;
type DateFieldFormatter = (value: DateFieldValue) => string;
type DateFieldParser = (value: string) => DateFieldValue | undefined;
type DayAvailabilityInput = Date[] | ((d: Date) => boolean) | undefined;
type MonthPredicate = (month: Date) => boolean;
type YearPredicate = (year: Date) => boolean;
type DateFieldCalendarTrigger = "input" | "button";
type DateFieldModalInput = BreakpointInput<boolean> | Breakpoint;

@Component({
  selector: "tedi-date-field",
  standalone: true,
  templateUrl: "./date-field.component.html",
  styleUrl: "./date-field.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CalendarComponent,
    DateInputComponent,
    OverlayModule,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateFieldComponent),
      multi: true,
    },
    {
      provide: TEDI_FORM_FIELD_CONTROL,
      useExisting: forwardRef(() => DateFieldComponent),
    },
  ],
  host: {
    class: "tedi-date-field",
  },
})
export class DateFieldComponent
  implements ControlValueAccessor, FormFieldControl<DateFieldValue>
{
  readonly inputId = input.required<string>();
  readonly value = model<DateFieldValue>(null);
  readonly mode = input<DateFieldMode>("single");
  readonly placeholder = input<string>("");
  readonly disabledInput = input<Matcher | Matcher[] | undefined>(undefined, {
    // eslint-disable-next-line @angular-eslint/no-input-rename -- 'disabled' conflicts with FormFieldControl.disabled Signal<boolean> required by the form-field-control contract; alias keeps the spec'd public binding name
    alias: "disabled",
  });
  readonly inputDisabled = input<boolean>(false);
  readonly readOnly = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly minDate = input<Date | undefined>(undefined);
  readonly maxDate = input<Date | undefined>(undefined);
  readonly disablePast = input<boolean>(false);
  readonly disableFuture = input<boolean>(false);
  readonly shouldDisableMonth = input<MonthPredicate | undefined>(undefined);
  readonly shouldDisableYear = input<YearPredicate | undefined>(undefined);
  readonly availableDays = input<DayAvailabilityInput>(undefined);
  readonly unavailableDays = input<DayAvailabilityInput>(undefined);
  readonly selectionLevel = input<CalendarView>("days");
  readonly monthYearSelectType = input<"dropdown" | "grid">("dropdown");
  readonly initialMonth = input<Date | undefined>(undefined);
  readonly localeCode = input<string>("et-EE");
  readonly closeOnSelect = input<boolean | undefined>(undefined);
  readonly showOutsideDays = input<boolean>(true);
  readonly numberOfMonths = input(
    { xs: 1 },
    { transform: (v: BreakpointInput<number>) => breakpointInput(v) },
  );
  readonly enableCalendar = input(
    { xs: true },
    { transform: (v: BreakpointInput<boolean>) => breakpointInput(v) },
  );
  readonly calendarTrigger = input(
    { xs: "button" as DateFieldCalendarTrigger },
    {
      transform: (v: BreakpointInput<DateFieldCalendarTrigger>) =>
        breakpointInput(v),
    },
  );
  readonly useNativePicker = input(
    { xs: false },
    { transform: (v: BreakpointInput<boolean>) => breakpointInput(v) },
  );
  readonly modal = input<DateFieldModalInput>("md");
  readonly formatDate = input<DateFieldFormatter | undefined>(undefined);
  readonly parseDate = input<DateFieldParser | undefined>(undefined);

  readonly openChange = output<boolean>();

  private readonly breakpointService = inject(BreakpointService);
  private readonly modalService = inject(ModalService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  readonly calendar = viewChild<CalendarComponent>("calendar");
  readonly dateInput = viewChild.required<DateInputComponent>("dateInput");

  readonly currentMonth = signal<Date>(new Date());
  readonly overlayOpen = signal<boolean>(false);

  readonly overlayPositions: ConnectedPosition[] = [
    {
      originX: "start",
      originY: "bottom",
      overlayX: "start",
      overlayY: "top",
      offsetY: 4,
    },
    {
      originX: "start",
      originY: "top",
      overlayX: "start",
      overlayY: "bottom",
      offsetY: -4,
    },
  ];

  private readonly cvaDisabled = signal(false);
  private readonly formInvalid = signal(false);

  private onChange: (value: DateFieldValue) => void = () => {};
  private onTouched: () => void = () => {};

  readonly fieldDisabled = computed(
    () => this.inputDisabled() || this.cvaDisabled(),
  );

  readonly disabled = computed(() => this.fieldDisabled());

  readonly invalid = computed(() => this.formInvalid());

  readonly disabledMatchers = computed<Matcher[]>(() => {
    const result: Matcher[] = [];
    const explicit = this.disabledInput();
    if (Array.isArray(explicit)) {
      result.push(...explicit);
    } else if (explicit !== undefined) {
      result.push(explicit);
    }
    const min = this.minDate();
    if (min) result.push({ before: min });
    const max = this.maxDate();
    if (max) result.push({ after: max });
    if (this.disablePast()) {
      result.push({ before: this.startOfToday() });
    }
    if (this.disableFuture()) {
      result.push({ after: this.startOfToday() });
    }
    return result;
  });

  readonly useNativePickerResolved = computed(() =>
    this.resolveBreakpointInput(this.useNativePicker()),
  );

  readonly useNativePickerEffective = computed(
    () => this.useNativePickerResolved() && this.mode() === "single",
  );

  readonly numberOfMonthsResolved = computed(() => {
    const raw = this.resolveBreakpointInput(this.numberOfMonths());
    const belowMd = this.breakpointService.isBelowBreakpoint("md")();
    if (belowMd) return 1;
    return Math.max(1, raw);
  });

  readonly enableCalendarResolved = computed(() =>
    this.resolveBreakpointInput(this.enableCalendar()),
  );

  readonly calendarTriggerResolved = computed<DateFieldCalendarTrigger>(() =>
    this.resolveBreakpointInput(this.calendarTrigger()),
  );

  readonly modalEnabled = computed(() => {
    const m = this.modal();
    if (typeof m === "string") {
      return this.breakpointService.isBelowBreakpoint(m)();
    }
    return this.resolveBreakpointInput(breakpointInput(m));
  });

  readonly closeOnSelectEffective = computed(() => {
    const explicit = this.closeOnSelect();
    if (typeof explicit === "boolean") return explicit;
    return this.mode() === "single";
  });

  readonly showCalendar = computed(
    () => this.enableCalendarResolved() && !this.useNativePickerEffective(),
  );

  readonly useModal = computed(
    () => this.showCalendar() && this.modalEnabled(),
  );

  readonly usePopover = computed(
    () => this.showCalendar() && !this.modalEnabled(),
  );

  readonly nativeIsoValue = computed(() => {
    if (!this.useNativePickerEffective()) return "";
    const v = this.value();
    if (!(v instanceof Date)) return "";
    return this.toIsoDate(v);
  });

  readonly displayValue = computed(() => {
    const v = this.value();
    if (this.mode() === "multiple") return "";
    if (v === null || v === undefined) return "";
    const customFormat = this.formatDate();
    if (customFormat) return customFormat(v);
    return this.defaultFormat(v);
  });

  readonly chipsForMultipleMode = computed<DateInputChip[]>(() => {
    if (this.mode() !== "multiple") return [];
    const v = this.value();
    if (!Array.isArray(v)) return [];
    const customFormat = this.formatDate();
    return v.map((d, index) => ({
      id: `${d.getTime()}-${index}`,
      label: customFormat ? customFormat(d) : this.defaultFormat(d),
    }));
  });

  readonly canClear = computed(
    () => !!this.value() && !this.fieldDisabled() && !this.readOnly(),
  );

  readonly inputIsTrigger = computed(
    () =>
      this.showCalendar() && this.calendarTriggerResolved() === "input",
  );

  private initialOpenEmit = true;

  constructor() {
    effect(() => {
      const v = this.value();
      const anchor = this.deriveAnchor(v) ?? this.initialMonth() ?? null;
      if (anchor) {
        this.currentMonth.set(startOfMonth(anchor));
      }
    });

    effect(() => {
      const open = this.overlayOpen();
      if (this.initialOpenEmit) {
        this.initialOpenEmit = false;
        return;
      }
      this.openChange.emit(open);
    });
  }

  writeValue(value: DateFieldValue): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: DateFieldValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  setInvalidState(isInvalid: boolean): void {
    this.formInvalid.set(isInvalid);
  }

  clearField(): void {
    if (this.fieldDisabled() || this.readOnly()) return;
    this.commitValue(null);
  }

  handleClear(): void {
    this.clearField();
  }

  handleIconClick(): void {
    if (this.fieldDisabled()) return;
    if (!this.enableCalendarResolved()) return;

    if (this.useNativePickerEffective()) {
      this.openNativePicker();
      return;
    }

    if (!this.showCalendar()) return;

    if (this.useModal()) {
      if (!this.overlayOpen()) {
        this.openModal();
      }
      return;
    }

    if (this.overlayOpen()) {
      this.overlayOpen.set(false);
      this.onTouched();
    } else {
      this.overlayOpen.set(true);
    }
  }

  handleInputChange(value: string): void {
    if (this.readOnly() || this.fieldDisabled()) return;

    if (this.useNativePickerEffective()) {
      this.handleNativeInputChange(value);
      return;
    }

    if (value === "") {
      this.commitValue(null);
      return;
    }

    if (this.mode() === "single") {
      this.handleSingleParseInput(value);
      return;
    }

    const customParse = this.parseDate();
    if (!customParse) return;
    const parsed = customParse(value);
    if (parsed === undefined) return;
    if (this.parsedValueIsDisabled(parsed)) return;
    this.commitValue(parsed);
  }

  handleChipRemove(id: string): void {
    if (this.fieldDisabled() || this.readOnly()) return;
    const v = this.value();
    if (!Array.isArray(v)) return;

    const time = Number(id.split("-")[0]);
    if (!Number.isFinite(time)) return;

    const target = new Date(time);
    const next = v.filter((d) => !isSameDay(d, target));
    this.commitValue(next);
  }

  handleInputClick(event: Event): void {
    if (this.fieldDisabled()) return;
    if (!this.inputIsTrigger()) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;
    if (!target.matches(".tedi-date-input__input")) return;
    this.handleIconClick();
  }

  handleCalendarSelect(): void {
    const calendar = this.calendar();
    if (!calendar) return;
    const newValue = calendar.value();
    this.value.set(newValue);
    this.onChange(newValue);
    this.onTouched();
    if (this.closeOnSelectEffective()) {
      this.closeOverlay();
    }
  }

  handleCurrentMonthChange(month: Date): void {
    this.currentMonth.set(month);
  }

  closeOverlay(): void {
    if (!this.overlayOpen()) return;
    this.overlayOpen.set(false);
    this.onTouched();
    this.focusIconButton();
  }

  handleOverlayOutsideClick(event: MouseEvent): void {
    if (!this.overlayOpen()) return;
    const host = this.hostEl.nativeElement as HTMLElement;
    const target = event.target as Node | null;
    if (target && host.contains(target)) return;
    this.overlayOpen.set(false);
    this.onTouched();
  }

  handleOverlayKeydown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.closeOverlay();
    }
  }

  private focusIconButton(): void {
    const host = this.hostEl.nativeElement as HTMLElement;
    const icon = host.querySelector<HTMLElement>(".tedi-date-input__icon");
    icon?.focus();
  }

  private openNativePicker(): void {
    const inputEl = this.queryNativeInput();
    if (!inputEl) return;
    if (typeof inputEl.showPicker === "function") {
      try {
        inputEl.showPicker();
        return;
      } catch {
        /* showPicker may throw outside a user gesture — fall through */
      }
    }
    inputEl.focus();
  }

  private openModal(): void {
    this.overlayOpen.set(true);
    const data: DateFieldModalData = {
      value: this.value(),
      currentMonth: this.currentMonth(),
      mode: this.mode(),
      selectionLevel: this.selectionLevel(),
      localeCode: this.localeCode(),
      showOutsideDays: this.showOutsideDays(),
      numberOfMonths: this.numberOfMonthsResolved(),
      monthYearSelectType: this.monthYearSelectType(),
      required: this.required(),
      disabledMatchers: this.disabledMatchers(),
      availableDays: this.availableDays(),
      unavailableDays: this.unavailableDays(),
      shouldDisableMonth: this.shouldDisableMonth(),
      shouldDisableYear: this.shouldDisableYear(),
      closeOnSelect: this.closeOnSelectEffective(),
    };

    const ref = this.modalService.open<DateFieldValue, DateFieldModalData>(
      DateFieldModalComponent,
      {
        data,
        size: "small",
        width: "sm",
        position: "center",
        maxWidth: "var(--tedi-containers-03)",
      },
    );

    ref.closed.subscribe((result) => {
      this.overlayOpen.set(false);
      this.onTouched();
      if (result === undefined) return;
      this.commitValue(result);
    });
  }

  private handleNativeInputChange(value: string): void {
    if (value === "") {
      this.commitValue(null);
      return;
    }
    const parts = value.split("-");
    if (parts.length !== 3) return;
    const [yearStr, monthStr, dayStr] = parts;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);
    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      return;
    }
    const parsed = new Date(year, month - 1, day);
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return;
    }
    if (this.parsedValueIsDisabled(parsed)) return;
    this.commitValue(parsed);
  }

  private handleSingleParseInput(value: string): void {
    const customParse = this.parseDate();
    const parsed = customParse
      ? customParse(value)
      : parseLocaleDate(value, this.localeCode());
    if (parsed === undefined || parsed === null) return;
    if (this.parsedValueIsDisabled(parsed)) return;
    this.commitValue(parsed);
  }

  private parsedValueIsDisabled(value: DateFieldValue): boolean {
    if (value === null) return false;
    const matchers = this.disabledMatchers();
    if (matchers.length === 0) return false;
    if (value instanceof Date) return matchAny(value, matchers);
    if (Array.isArray(value)) return value.some((d) => matchAny(d, matchers));
    if (matchAny(value.from, matchers)) return true;
    if (value.to && matchAny(value.to, matchers)) return true;
    return false;
  }

  private commitValue(next: DateFieldValue): void {
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
    const anchor = this.deriveAnchor(next);
    if (anchor) {
      this.currentMonth.set(startOfMonth(anchor));
    }
  }

  private defaultFormat(value: Date | Date[] | DateRange): string {
    const locale = this.localeCode();
    if (value instanceof Date) return formatLocaleDate(value, locale);
    if (Array.isArray(value)) {
      return value.map((d) => formatLocaleDate(d, locale)).join(", ");
    }
    if (value.to === undefined) return formatLocaleDate(value.from, locale);
    return `${formatLocaleDate(value.from, locale)} – ${formatLocaleDate(value.to, locale)}`;
  }

  private deriveAnchor(value: DateFieldValue): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (Array.isArray(value)) return value.length > 0 ? value[0] : null;
    return value.from;
  }

  private resolveBreakpointInput<T>(v: BreakpointObject<T>): T {
    if (
      v.xxl !== undefined &&
      this.breakpointService.isAboveBreakpoint("xxl")()
    )
      return v.xxl;
    if (v.xl !== undefined && this.breakpointService.isAboveBreakpoint("xl")())
      return v.xl;
    if (v.lg !== undefined && this.breakpointService.isAboveBreakpoint("lg")())
      return v.lg;
    if (v.md !== undefined && this.breakpointService.isAboveBreakpoint("md")())
      return v.md;
    if (v.sm !== undefined && this.breakpointService.isAboveBreakpoint("sm")())
      return v.sm;
    return v.xs;
  }

  // Note: 'today' is captured per-getter call but disabledMatchers is a
  // computed() — it will not re-evaluate at midnight rollover. For sessions
  // spanning midnight the past/future windows may become stale until any
  // other dependency changes.
  private startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  private toIsoDate(date: Date): string {
    const y = date.getFullYear().toString().padStart(4, "0");
    const m = (date.getMonth() + 1).toString().padStart(2, "0");
    const d = date.getDate().toString().padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  private queryNativeInput(): HTMLInputElement | null {
    const host = this.hostEl.nativeElement as HTMLElement;
    return host.querySelector<HTMLInputElement>(".tedi-date-input__input");
  }
}
