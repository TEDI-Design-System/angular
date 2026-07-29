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
  untracked,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { ConnectedPosition, OverlayModule } from "@angular/cdk/overlay";
import { A11yModule } from "@angular/cdk/a11y";
import { NgTemplateOutlet } from "@angular/common";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { DateInputComponent } from "../date-field/date-input/date-input.component";
import { CalendarComponent } from "../../content/calendar/calendar.component";
import { CalendarView, DateRange } from "../../content/calendar/types";
import { TimePickerComponent } from "../time-picker/time-picker.component";
import { TimeFieldComponent } from "../time-field/time-field.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import {
  FormFieldControl,
  TEDI_FORM_FIELD_CONTROL,
} from "../form-field/form-field-control";
import {
  breakpointInput,
  BreakpointInput,
  BreakpointObject,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
import {
  formatLocaleDate,
  formatLocaleDateHint,
  parseLocaleDate,
  startOfMonth,
} from "../../../utils/date.util";
import { matchAny, Matcher } from "../../../utils/matchers.util";
import { ModalService } from "../../overlay/modal/modal.service";
import { ModalRef } from "../../overlay/modal/modal-ref";
import { ModalFullscreen } from "../../overlay/modal/modal.types";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";
import {
  applyRangeTime,
  combineCalendarSelection,
  combineDateTime,
  DateTimeFieldAvailableTimes,
  DayAvailabilityInput,
  getTimeOf,
  MonthPredicate,
  pad,
  RangeParts,
  resolveAvailableTimes,
  toRangeParts,
  toSingle,
  YearPredicate,
} from "./date-time-field.util";
import {
  DateTimeFieldModalComponent,
  DateTimeFieldModalData,
} from "./date-time-field-modal/date-time-field-modal.component";

export type {
  DateTimeFieldAvailableTimes,
  DayAvailabilityInput,
} from "./date-time-field.util";
export type DateTimeFieldValue = Date | DateRange | null;
export type DateTimeFieldMode = "single" | "range";
export type DateTimeFieldLayout = "side-by-side" | "multi-step";
export type DateTimeFieldStep = "date" | "time";
export type DateTimeFieldTimeGridVariant = "button" | "radio";
export type DateTimeFieldUseNativePicker = boolean | "sm" | "md" | "lg" | "xl";
export type DateTimeFieldModalInput = boolean | "sm" | "md" | "lg" | "xl";
type DateTimeFieldFormatter = (value: DateTimeFieldValue) => string;

@Component({
  selector: "tedi-date-time-field",
  standalone: true,
  templateUrl: "./date-time-field.component.html",
  styleUrl: "./date-time-field.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    DateInputComponent,
    CalendarComponent,
    TimePickerComponent,
    TimeFieldComponent,
    FormFieldComponent,
    ButtonComponent,
    IconComponent,
    NgTemplateOutlet,
    OverlayModule,
    A11yModule,
    TediTranslationPipe,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimeFieldComponent),
      multi: true,
    },
    {
      provide: TEDI_FORM_FIELD_CONTROL,
      useExisting: forwardRef(() => DateTimeFieldComponent),
    },
  ],
  host: {
    class: "tedi-date-time-field",
  },
})
export class DateTimeFieldComponent
  implements ControlValueAccessor, FormFieldControl<DateTimeFieldValue>
{
  /**
   * Unique ID for label association and accessibility. Bind the sibling
   * `<label tedi-label [for]>` to the same value.
   */
  readonly inputId = input.required<string>();
  /**
   * The selected value (two-way / `ControlValueAccessor`). `single` → `Date | null`,
   * `range` → `{ from, to }` where each end carries its own time.
   */
  readonly value = model<DateTimeFieldValue>(null);
  /** Selection mode. `single` picks one date+time, `range` builds a `{ from, to }` pair. */
  readonly mode = input<DateTimeFieldMode>("single");
  /** Popover layout. `side-by-side` shows the calendar and time picker together; `multi-step` picks the date first, then advances to a separate time step. `range` always uses `side-by-side`. */
  readonly layout = input<DateTimeFieldLayout>("side-by-side");
  /** Placeholder rendered in the input when there is no value. */
  readonly placeholder = input<string>("");
  /**
   * Predefined time slots (`HH:mm` strings). When set, the time step renders a grid of
   * slots instead of the scroll-wheel. Accepts a static array or a `(date) => string[]`
   * function evaluated with the selected date (called per range end in `range` mode).
   */
  readonly availableTimes = input<DateTimeFieldAvailableTimes>(undefined);
  /** Slot grid layout when `availableTimes` is set. Defaults to `button` for `side-by-side`, `radio` for `multi-step`. */
  readonly timeGridVariant = input<DateTimeFieldTimeGridVariant | undefined>(
    undefined,
  );
  /** Minute interval for the scroll-wheel time picker. Ignored when `availableTimes` is set. */
  readonly minuteStep = input<number>(15);
  /** Number of columns in the slot grid. */
  readonly slotColumns = input<number>(3);
  /** Heading above the time picker. Falls back to the `date-time-field.time-heading` label. */
  readonly timeHeading = input<string | undefined>(undefined);
  /** Footer link label in the multi-step calendar. Falls back to `date-time-field.select-time`. */
  readonly selectTimeLabel = input<string | undefined>(undefined);
  /** Back-link label in the multi-step time step. Falls back to `date-time-field.back`. */
  readonly backLabel = input<string | undefined>(undefined);
  /**
   * Disables specific days via matchers (does not disable the whole field). Accepts a
   * `Date`, `Date[]`, `{ before }`, `{ after }`, `{ from, to? }`, `{ dayOfWeek }`, or a
   * `(date) => boolean` predicate.
   */
  readonly disabledMatchers = input<Matcher | Matcher[] | undefined>(undefined);
  /** Disables the field entirely — text input, icon button, and picker. */
  readonly inputDisabled = input<boolean>(false);
  /** Blocks typing into the input but leaves the picker interactive. */
  readonly readOnly = input<boolean>(false);
  /** Marks the input as required. The asterisk lives on the sibling `<label tedi-label [required]>`. */
  readonly required = input<boolean>(false);
  /** Field size — matches the surrounding `tedi-form-field`. */
  readonly size = input<"default" | "small">("default");
  /** Disables all dates before this date (inclusive boundary stays enabled). */
  readonly minDate = input<Date | undefined>(undefined);
  /** Disables all dates after this date (inclusive boundary stays enabled). */
  readonly maxDate = input<Date | undefined>(undefined);
  /** Disable all dates before today. */
  readonly disablePast = input<boolean>(false);
  /** Disable all dates after today. */
  readonly disableFuture = input<boolean>(false);
  /** Predicate `(month) => boolean` returning `true` to disable a whole month. */
  readonly shouldDisableMonth = input<MonthPredicate | undefined>(undefined);
  /** Predicate `(year) => boolean` returning `true` to disable a whole year. */
  readonly shouldDisableYear = input<YearPredicate | undefined>(undefined);
  /** Whitelist of selectable days — a `Date[]` or `(date) => boolean`. Every other day is disabled. */
  readonly availableDays = input<DayAvailabilityInput>(undefined);
  /** Blacklist of unavailable days — a `Date[]` or `(date) => boolean`. Takes precedence over `availableDays`. */
  readonly unavailableDays = input<DayAvailabilityInput>(undefined);
  /** Lowest level the user can commit to in the calendar. */
  readonly selectionLevel = input<CalendarView>("days");
  /** How the calendar header exposes month/year picking. */
  readonly monthYearSelectType = input<"dropdown" | "grid">("dropdown");
  /** Month the calendar opens on when there is no value. */
  readonly initialMonth = input<Date | undefined>(undefined);
  /** BCP-47 locale for the calendar and the default date/time formatting. */
  readonly localeCode = input<string>("et-EE");
  /** Render the trailing/leading days from the adjacent month in the calendar grid. */
  readonly showOutsideDays = input<boolean>(true);
  /** Render an ISO week-number column in the day grid. */
  readonly showWeekNumbers = input<boolean>(false);
  /**
   * Months shown side by side in `range` mode (ignored in `single`). Accepts a
   * `BreakpointInput<number>` — defaults to one month on `xs`, two from `md` up.
   */
  readonly numberOfMonths = input(
    { xs: 1, md: 2 },
    { transform: (v: BreakpointInput<number>) => breakpointInput(v) },
  );
  /**
   * Use the OS native picker (`<input type="datetime-local">`) instead of the custom popover
   * (single mode only). `true` always, `false` never, breakpoint name → native below it.
   */
  readonly useNativePicker = input<DateTimeFieldUseNativePicker>(false);
  /** Open the picker in a modal: `true` always, `false` never, breakpoint name → modal below it. */
  readonly modal = input<DateTimeFieldModalInput>(false);
  /** Make the modal fullscreen: `true` always, `false` never, breakpoint name → fullscreen below it. */
  readonly fullscreen = input<ModalFullscreen>(false);
  /** Custom formatter for the input's display string. Overrides the locale-aware default. */
  readonly formatDate = input<DateTimeFieldFormatter | undefined>(undefined);

  /** Emitted whenever the picker (popover/modal) open state changes. */
  readonly openChange = output<boolean>();

  private readonly breakpointService = inject(BreakpointService);
  private readonly modalService = inject(ModalService);
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  readonly calendar = viewChild<CalendarComponent>("calendar");
  readonly stepTimePicker = viewChild<TimePickerComponent>("stepTimePicker");

  readonly currentMonth = signal<Date>(new Date());
  readonly overlayOpen = signal<boolean>(false);
  readonly step = signal<DateTimeFieldStep>("date");
  readonly overlayMaxHeight = signal<number | null>(null);

  readonly overlayPositions = computed<ConnectedPosition[]>(() => [
    { originX: "end", overlayX: "end", originY: "bottom", overlayY: "top", offsetY: 4 },
    { originX: "end", overlayX: "end", originY: "top", overlayY: "bottom", offsetY: -4 },
    { originX: "start", overlayX: "start", originY: "bottom", overlayY: "top", offsetY: 4 },
    { originX: "start", overlayX: "start", originY: "top", overlayY: "bottom", offsetY: -4 },
  ]);

  private readonly cvaDisabled = signal(false);
  private readonly formInvalid = signal(false);
  private modalRef: ModalRef<DateTimeFieldValue> | null = null;

  private onChange: (value: DateTimeFieldValue) => void = () => {};
  private onTouched: () => void = () => {};

  readonly fieldDisabled = computed(
    () => this.inputDisabled() || this.cvaDisabled(),
  );
  readonly disabled = computed(() => this.fieldDisabled());
  readonly invalid = computed(() => this.formInvalid());

  readonly effectiveLayout = computed<DateTimeFieldLayout>(() =>
    this.mode() === "range" ? "side-by-side" : this.layout(),
  );

  // Below `md` the hour/minute scroll wheels are cramped and, stacked in range
  // mode, force the popover to scroll — so swap them for a native `type="time"`
  // input on phones/small tablets. Predefined slot grids stay as-is (they're
  // already touch-friendly buttons).
  readonly useNativeTimeInput = computed(() =>
    this.breakpointService.isBelowBreakpoint("md")(),
  );

  readonly resolvedGridVariant = computed<DateTimeFieldTimeGridVariant>(
    () =>
      this.timeGridVariant() ??
      (this.effectiveLayout() === "multi-step" ? "radio" : "button"),
  );

  readonly resolvedDisabledMatchers = computed<Matcher[]>(() => {
    const result: Matcher[] = [];
    const explicit = this.disabledMatchers();
    if (Array.isArray(explicit)) {
      result.push(...explicit);
    } else if (explicit !== undefined) {
      result.push(explicit);
    }
    const min = this.minDate();
    if (min) result.push({ before: min });
    const max = this.maxDate();
    if (max) result.push({ after: max });
    if (this.disablePast()) result.push({ before: this.startOfToday() });
    if (this.disableFuture()) result.push({ after: this.startOfToday() });
    return result;
  });

  readonly useNativePickerResolved = computed(() => {
    const v = this.useNativePicker();
    return typeof v === "boolean"
      ? v
      : this.breakpointService.isBelowBreakpoint(v)();
  });

  readonly modalEnabled = computed(() => {
    const m = this.modal();
    return typeof m === "boolean"
      ? m
      : this.breakpointService.isBelowBreakpoint(m)();
  });

  readonly useNativePickerEffective = computed(
    () =>
      this.useNativePickerResolved() &&
      this.mode() === "single" &&
      !this.modalEnabled(),
  );

  readonly useModal = computed(
    () => this.modalEnabled() && !this.useNativePickerEffective(),
  );

  readonly usePopover = computed(
    () => !this.useModal() && !this.useNativePickerEffective(),
  );

  readonly numberOfMonthsResolved = computed(() =>
    this.mode() === "range"
      ? Math.max(1, this.resolveBreakpointInput(this.numberOfMonths()))
      : 1,
  );

  readonly singleValue = computed(() => toSingle(this.value()));
  readonly rangeValue = computed<RangeParts>(() => toRangeParts(this.value()));

  readonly singleTime = computed(() => getTimeOf(this.singleValue()));
  readonly fromTime = computed(() => getTimeOf(this.rangeValue().from));
  readonly toTime = computed(() => getTimeOf(this.rangeValue().to));

  readonly fromDateLabel = computed(() =>
    this.formatRangeDate(this.rangeValue().from),
  );
  readonly toDateLabel = computed(() =>
    this.formatRangeDate(this.rangeValue().to),
  );

  readonly singleAvailableTimes = computed(() =>
    resolveAvailableTimes(this.availableTimes(), this.singleValue()),
  );
  readonly fromAvailableTimes = computed(() =>
    resolveAvailableTimes(this.availableTimes(), this.rangeValue().from),
  );
  readonly toAvailableTimes = computed(() =>
    resolveAvailableTimes(this.availableTimes(), this.rangeValue().to),
  );

  readonly nativeIsoValue = computed(() => {
    if (!this.useNativePickerEffective()) return "";
    const v = this.singleValue();
    if (!v) return "";
    return `${v.getFullYear().toString().padStart(4, "0")}-${pad(v.getMonth() + 1)}-${pad(v.getDate())}T${pad(v.getHours())}:${pad(v.getMinutes())}`;
  });

  readonly effectivePlaceholder = computed(() => {
    const explicit = this.placeholder();
    if (explicit) return explicit;
    if (this.useNativePickerEffective()) return "";
    if (this.mode() === "range") return "";
    const timeHint = this.localeCode().startsWith("et") ? "tt:mm" : "hh:mm";
    return `${formatLocaleDateHint(this.localeCode())} ${timeHint}`;
  });

  readonly displayValue = computed(() => {
    const v = this.value();
    if (!v) return "";
    const customFormat = this.formatDate();
    if (customFormat) return customFormat(v);
    return this.defaultFormat(v);
  });

  private readonly shortDateFormatter = computed(
    () =>
      new Intl.DateTimeFormat(this.localeCode(), {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }),
  );

  readonly shortSelectedDate = computed(() =>
    this.shortDateFormatter().format(this.singleValue() ?? new Date()),
  );

  readonly canClear = computed(
    () => !!this.value() && !this.fieldDisabled() && !this.readOnly(),
  );

  private initialOpenEmit = true;

  constructor() {
    effect(() => {
      const anchor = this.deriveAnchor(this.value()) ?? this.initialMonth() ?? null;
      if (anchor) this.currentMonth.set(startOfMonth(anchor));
    });

    effect(() => {
      const open = this.overlayOpen();
      if (this.initialOpenEmit) {
        this.initialOpenEmit = false;
        return;
      }
      this.openChange.emit(open);
    });

    effect(() => {
      // A breakpoint flip can switch between popover, modal and native picker.
      // Close any open picker so two strategies never render at once.
      this.usePopover();
      this.useModal();
      this.useNativePickerEffective();
      untracked(() => {
        if (!this.overlayOpen()) return;
        this.modalRef?.close();
        this.modalRef = null;
        this.overlayOpen.set(false);
        this.step.set("date");
      });
    });
  }

  writeValue(value: DateTimeFieldValue): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: DateTimeFieldValue) => void): void {
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

    if (this.useNativePickerEffective()) {
      this.openNativePicker();
      return;
    }

    if (this.useModal()) {
      if (!this.overlayOpen()) this.openModal();
      return;
    }

    if (this.overlayOpen()) {
      this.overlayOpen.set(false);
      this.step.set("date");
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

    if (this.mode() !== "single") return;

    const parsed = this.parseDateTimeText(value);
    if (!parsed) return;
    if (matchAny(parsed, this.resolvedDisabledMatchers())) return;
    this.commitValue(parsed);
  }

  handleCalendarSelect(): void {
    const calendar = this.calendar();
    if (!calendar) return;
    this.commitValue(
      combineCalendarSelection(
        calendar.value() as Date | RangeParts | null,
        this.mode() === "range",
        this.value(),
        this.availableTimes(),
      ) as DateTimeFieldValue,
    );
  }

  handleTimeSelect(time: string | null): void {
    if (!time) return;
    const baseDate = this.singleValue() ?? new Date();
    this.commitValue(combineDateTime(baseDate, time));
    if (
      this.effectiveLayout() === "multi-step" &&
      resolveAvailableTimes(this.availableTimes(), baseDate)
    ) {
      this.closeOverlay();
    }
  }

  handleRangeTimeSelect(kind: "from" | "to", time: string | null): void {
    if (!time) return;
    this.commitValue(
      applyRangeTime(kind, time, this.rangeValue(), new Date()) as DateRange,
    );
  }

  goToTimeStep(): void {
    this.step.set("time");
  }

  goToDateStep(): void {
    this.step.set("date");
  }

  handleCurrentMonthChange(month: Date): void {
    this.currentMonth.set(month);
  }

  closeOverlay(): void {
    if (!this.overlayOpen()) return;
    this.overlayOpen.set(false);
    this.step.set("date");
    this.onTouched();
    this.focusIconButton();
  }

  handleOverlayOutsideClick(event: MouseEvent): void {
    if (!this.overlayOpen()) return;
    const host = this.hostEl.nativeElement as HTMLElement;
    const target = event.target as Node | null;
    if (target && host.contains(target)) return;
    this.overlayOpen.set(false);
    this.step.set("date");
    this.onTouched();
  }

  handleOverlayAttached(): void {
    this.updateOverlayMaxHeight();
    if (this.step() === "time") {
      this.stepTimePicker()?.focusActiveItem();
      return;
    }
    this.calendar()?.focusActiveCell();
  }

  // Cap the popover to whichever side of the trigger has more room and let it
  // scroll (only its height — never its width, which would make the calendar
  // re-measure and wrap its months). Without this a tall content set — e.g. many
  // predefined slots stacked in range mode — spills past the viewport.
  private updateOverlayMaxHeight(): void {
    const rect = this.hostEl.nativeElement.getBoundingClientRect();
    const margin = 8;
    const spaceBelow = window.innerHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;
    this.overlayMaxHeight.set(Math.max(spaceBelow, spaceAbove));
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
    host.querySelector<HTMLElement>(".tedi-date-input__icon")?.focus();
  }

  private openNativePicker(): void {
    const host = this.hostEl.nativeElement as HTMLElement;
    const input = host.querySelector<HTMLInputElement>(
      ".tedi-date-input__input",
    );
    if (!input) return;
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

  private openModal(): void {
    this.overlayOpen.set(true);
    const data: DateTimeFieldModalData = {
      value: this.value(),
      currentMonth: this.currentMonth(),
      mode: this.mode(),
      selectionLevel: this.selectionLevel(),
      localeCode: this.localeCode(),
      showOutsideDays: this.showOutsideDays(),
      showWeekNumbers: this.showWeekNumbers(),
      numberOfMonths: this.numberOfMonthsResolved(),
      monthYearSelectType: this.monthYearSelectType(),
      required: this.required(),
      disabledMatchers: this.resolvedDisabledMatchers(),
      availableDays: this.availableDays(),
      unavailableDays: this.unavailableDays(),
      shouldDisableMonth: this.shouldDisableMonth(),
      shouldDisableYear: this.shouldDisableYear(),
      minuteStep: this.minuteStep(),
      slotColumns: this.slotColumns(),
      gridVariant: this.resolvedGridVariant(),
      timeHeading: this.timeHeading(),
      availableTimes: this.availableTimes(),
      size: this.size(),
    };

    const ref = this.modalService.open<
      DateTimeFieldValue,
      DateTimeFieldModalData
    >(DateTimeFieldModalComponent, {
      data,
      size: "small",
      // Non-preset width makes the overlay shrink-wrap its content, so the modal
      // is exactly as wide as the calendar + time picker sit side-by-side on wide
      // screens and collapses to the calendar's width once they stack (see the
      // modal's responsive `__content` layout). `maxWidth` keeps it within the
      // viewport on narrow screens.
      width: "fit-content",
      position: "center",
      fullscreen: this.fullscreen(),
      maxWidth: "95vw",
    });
    this.modalRef = ref;

    ref.closed.subscribe((result) => {
      this.modalRef = null;
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
    const [datePart, timePart] = value.split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = (timePart ?? "00:00").split(":").map(Number);
    if (
      ![year, month, day, hour, minute].every((n) => Number.isFinite(n))
    ) {
      return;
    }
    const parsed = new Date(year, month - 1, day, hour, minute);
    if (
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      return;
    }
    if (matchAny(parsed, this.resolvedDisabledMatchers())) return;
    this.commitValue(parsed);
  }

  private parseDateTimeText(value: string): Date | undefined {
    const input = value.trim();
    const timeMatch = input.match(/^(.*?)[\sT]+(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
      const datePart = parseLocaleDate(timeMatch[1], this.localeCode());
      if (!datePart) return undefined;
      const hour = Number(timeMatch[2]);
      const minute = Number(timeMatch[3]);
      if (hour > 23 || minute > 59) return undefined;
      return combineDateTime(datePart, `${hour}:${minute}`);
    }
    const dateOnly = parseLocaleDate(input, this.localeCode());
    if (!dateOnly) return undefined;
    return combineDateTime(dateOnly, getTimeOf(this.singleValue()));
  }

  private commitValue(next: DateTimeFieldValue): void {
    this.value.set(next);
    this.onChange(next);
    this.onTouched();
    const anchor = this.deriveAnchor(next);
    if (anchor) this.currentMonth.set(startOfMonth(anchor));
  }

  private defaultFormat(value: Date | DateRange): string {
    if (value instanceof Date) return this.formatSingle(value);
    const from = this.formatSingle(value.from);
    const to = value.to ? this.formatSingle(value.to) : "";
    if (!to) return from;
    return `${from} – ${to}`;
  }

  private formatSingle(date: Date): string {
    return `${formatLocaleDate(date, this.localeCode())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  private formatRangeDate(date: Date | undefined): string {
    return date ? formatLocaleDate(date, this.localeCode()) : "";
  }

  private deriveAnchor(value: DateTimeFieldValue): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    return value.from ?? null;
  }

  private resolveBreakpointInput<T>(v: BreakpointObject<T>): T {
    if (v.xxl !== undefined && this.breakpointService.isAboveBreakpoint("xxl")())
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

  private startOfToday(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }
}
