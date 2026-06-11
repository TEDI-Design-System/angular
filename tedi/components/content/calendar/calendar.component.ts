import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  forwardRef,
  HostListener,
  inject,
  Injector,
  input,
  model,
  output,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import {
  addDays,
  addMonths,
  addYears,
  DateRange,
  getDaysInMonth,
  getFirstDayOfWeek,
  isBeforeDay,
  isSameDay,
  startOfMonth,
  toggleDateInArray,
} from "../../../utils/date.util";
import { matchAny, Matcher } from "../../../utils/matchers.util";
import {
  CalendarDayGridComponent,
  DayStatusFn,
} from "./calendar-day-grid/calendar-day-grid.component";
import { CalendarMonthGridComponent } from "./calendar-month-grid/calendar-month-grid.component";
import { CalendarYearGridComponent } from "./calendar-year-grid/calendar-year-grid.component";
import { CalendarHeaderComponent } from "./calendar-header/calendar-header.component";
import { CalendarView, DateFieldMode } from "./types";

type CalendarValue = Date | Date[] | DateRange | null;
type DayPredicate = (date: Date) => boolean;
type DayAvailabilityInput = Date[] | DayPredicate | undefined;
type MonthPredicate = (month: Date) => boolean;
type YearPredicate = (year: Date) => boolean;

const YEAR_PAGE_SIZE = 12;

@Component({
  selector: "tedi-calendar",
  standalone: true,
  templateUrl: "./calendar.component.html",
  styleUrl: "./calendar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CalendarHeaderComponent,
    CalendarDayGridComponent,
    CalendarMonthGridComponent,
    CalendarYearGridComponent,
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarComponent),
      multi: true,
    },
  ],
  host: {
    class: "tedi-calendar",
    "[class.tedi-calendar--disabled]": "effectiveDisabled()",
    "[class.tedi-calendar--multi-month]": "numberOfMonths() > 1",
    "[class.tedi-calendar--bordered]": "bordered()",
  },
})
export class CalendarComponent implements ControlValueAccessor {
  readonly view = model<CalendarView>("days");
  readonly currentMonth = model<Date>(new Date());
  readonly value = model<CalendarValue>(null);

  readonly mode = input<DateFieldMode>("single");
  readonly selectionLevel = input<CalendarView>("days");
  readonly localeCode = input<string>("et-EE");
  readonly showOutsideDays = input<boolean>(true);
  readonly showWeekNumbers = input<boolean>(false);
  readonly showNavigation = input<boolean>(true);
  readonly bordered = input<boolean>(true);
  readonly disabledMatchers = input<Matcher[]>([]);
  readonly availableDays = input<DayAvailabilityInput>(undefined);
  readonly unavailableDays = input<DayAvailabilityInput>(undefined);
  readonly dayStatus = input<DayStatusFn | undefined>(undefined);
  readonly monthYearSelectType = input<"dropdown" | "grid" | "static">(
    "dropdown",
  );
  readonly required = input<boolean>(false);
  readonly numberOfMonths = input<number>(1);
  readonly inputDisabled = input<boolean>(false);
  readonly shouldDisableMonth = input<MonthPredicate | undefined>(undefined);
  readonly shouldDisableYear = input<YearPredicate | undefined>(undefined);
  readonly minYear = input<number | null>(null);
  readonly maxYear = input<number | null>(null);

  // eslint-disable-next-line @angular-eslint/no-output-native -- 'select' is mandated by the DateField spec for parity with TEDI React
  readonly select = output<{ date: CalendarValue; day: Date }>();

  private readonly hostEl = inject(ElementRef<HTMLElement>);
  private readonly injector = inject(Injector);

  readonly yearPageSize = YEAR_PAGE_SIZE;

  private readonly cvaDisabled = signal(false);
  private readonly internalYearPageStart = signal<number | null>(null);
  readonly hoveredDay = signal<Date | null>(null);

  private onChange: (value: CalendarValue) => void = () => {};
  private onTouched: () => void = () => {};

  constructor() {
    effect(() => {
      const level = this.selectionLevel();
      this.view.set(level);
    });
  }

  readonly effectiveDisabled = computed(
    () => this.inputDisabled() || this.cvaDisabled(),
  );

  readonly firstDayOfWeek = computed(() =>
    getFirstDayOfWeek(this.localeCode()),
  );

  readonly monthDates = computed(() =>
    Array.from({ length: this.numberOfMonths() }, (_, i) =>
      addMonths(this.currentMonth(), i),
    ),
  );

  readonly resolvedMinYear = computed(() => {
    const explicit = this.minYear();
    if (explicit !== null) return explicit;
    return new Date().getFullYear() - 10;
  });

  readonly resolvedMaxYear = computed(() => {
    const explicit = this.maxYear();
    if (explicit !== null) return explicit;
    return new Date().getFullYear() + 10;
  });

  readonly yearPageStart = computed(() => {
    const explicit = this.internalYearPageStart();
    if (explicit !== null) return explicit;
    return this.currentMonth().getFullYear() - 5;
  });

  readonly selectedSingle = computed<Date | null>(() => {
    const v = this.value();
    if (this.mode() !== "single") return null;
    return v instanceof Date ? v : null;
  });

  readonly computedDisabledMatchers = computed<Matcher[]>(() => {
    const matchers: Matcher[] = [...this.disabledMatchers()];
    const available = this.availableDays();
    if (available !== undefined) {
      const predicate =
        typeof available === "function"
          ? available
          : (d: Date) => available.some((entry) => isSameDay(entry, d));
      matchers.push((d: Date) => !predicate(d));
    }
    const unavailable = this.unavailableDays();
    if (unavailable !== undefined) {
      const predicate =
        typeof unavailable === "function"
          ? unavailable
          : (d: Date) =>
              unavailable.some((entry) => isSameDay(entry, d));
      matchers.push(predicate);
    }
    return matchers;
  });

  readonly effectiveIsMonthDisabled = computed<MonthPredicate>(() => {
    const custom = this.shouldDisableMonth();
    const matchers = this.computedDisabledMatchers();
    return (month: Date) => {
      if (custom?.(month)) return true;
      if (matchers.length === 0) return false;
      const year = month.getFullYear();
      const monthIndex = month.getMonth();
      const days = getDaysInMonth(year, monthIndex);
      for (let d = 1; d <= days; d++) {
        if (!matchAny(new Date(year, monthIndex, d), matchers)) return false;
      }
      return true;
    };
  });

  readonly effectiveIsYearDisabled = computed<YearPredicate>(() => {
    const customYear = this.shouldDisableYear();
    const monthPredicate = this.effectiveIsMonthDisabled();
    return (year: Date) => {
      if (customYear?.(year)) return true;
      const y = year.getFullYear();
      for (let m = 0; m < 12; m++) {
        if (!monthPredicate(new Date(y, m, 1))) return false;
      }
      return true;
    };
  });

  writeValue(value: CalendarValue): void {
    this.value.set(value);
    const anchor = this.deriveAnchor(value);
    if (anchor) {
      this.currentMonth.set(startOfMonth(anchor));
    }
  }

  registerOnChange(fn: (value: CalendarValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.cvaDisabled.set(disabled);
  }

  handlePrev(): void {
    if (this.effectiveDisabled()) return;
    const view = this.view();
    if (view === "days") {
      this.currentMonth.set(addMonths(this.currentMonth(), -1));
    } else if (view === "months") {
      this.currentMonth.set(addYears(this.currentMonth(), -1));
    } else {
      this.internalYearPageStart.set(this.yearPageStart() - this.yearPageSize);
    }
  }

  handleNext(): void {
    if (this.effectiveDisabled()) return;
    const view = this.view();
    if (view === "days") {
      this.currentMonth.set(addMonths(this.currentMonth(), 1));
    } else if (view === "months") {
      this.currentMonth.set(addYears(this.currentMonth(), 1));
    } else {
      this.internalYearPageStart.set(this.yearPageStart() + this.yearPageSize);
    }
  }

  handleHeaderMonthChange(monthStartDate: Date, index = 0): void {
    const headerDate = new Date(
      monthStartDate.getFullYear(),
      monthStartDate.getMonth(),
      1,
    );
    this.currentMonth.set(addMonths(headerDate, -index));
  }

  handleHeaderYearChange(yearStartDate: Date, index = 0): void {
    const headerMonth = addMonths(this.currentMonth(), index).getMonth();
    const headerDate = new Date(yearStartDate.getFullYear(), headerMonth, 1);
    this.currentMonth.set(addMonths(headerDate, -index));
  }

  handleHeaderViewChange(nextView: CalendarView): void {
    this.view.set(nextView);
    if (nextView === "years") {
      const currentYear = this.currentMonth().getFullYear();
      this.internalYearPageStart.set(currentYear - 5);
    }
  }

  handleDaySelect(day: Date): void {
    const next = this.applyModeSelection(day);
    if (next === undefined) return;
    this.commit(next, day);
  }

  handleMonthSelect(monthStartDate: Date): void {
    if (this.selectionLevel() === "months") {
      const next = this.applyModeSelection(monthStartDate);
      if (next === undefined) return;
      this.commit(next, monthStartDate);
      return;
    }

    this.currentMonth.set(monthStartDate);
    this.view.set("days");
  }

  handleYearSelect(yearStartDate: Date): void {
    if (this.selectionLevel() === "years") {
      const next = this.applyModeSelection(yearStartDate);
      if (next === undefined) return;
      this.commit(next, yearStartDate);
      return;
    }

    this.currentMonth.set(
      new Date(yearStartDate.getFullYear(), this.currentMonth().getMonth(), 1),
    );
    this.view.set(this.selectionLevel() === "months" ? "months" : "days");
  }

  private applyModeSelection(day: Date): CalendarValue | undefined {
    const mode = this.mode();
    const current = this.value();
    if (mode === "single") return day;
    if (mode === "multiple") {
      const arr = Array.isArray(current) ? current : [];
      const next = toggleDateInArray(arr, day);
      if (next.length === 0 && this.required()) return undefined;
      return next;
    }
    if (mode === "range") {
      const partial = this.partialRange(current);
      if (partial) {
        return isBeforeDay(day, partial.from)
          ? { from: day, to: partial.from }
          : { from: partial.from, to: day };
      }
      return { from: day };
    }
    return current;
  }

  @HostListener("keydown", ["$event"])
  handleKeydown(event: KeyboardEvent): void {
    if (this.effectiveDisabled()) return;
    const target = event.target as HTMLElement | null;
    if (!target) return;

    const view = this.view();
    if (view === "days") {
      this.handleDaysKeydown(event, target);
    } else if (view === "months") {
      this.handleMonthsKeydown(event, target);
    } else {
      this.handleYearsKeydown(event, target);
    }
  }

  private handleDaysKeydown(event: KeyboardEvent, target: HTMLElement): void {
    const dayKey = target.getAttribute("data-date-key");
    if (dayKey === null) return;
    const currentDate = new Date(Number(dayKey));
    if (Number.isNaN(currentDate.getTime())) return;

    const nextDate = this.computeDayKeyTarget(event, currentDate);
    if (!nextDate) return;
    event.preventDefault();

    this.adjustCurrentMonthForFocus(nextDate);
    this.focusDayCell(nextDate);
  }

  private computeDayKeyTarget(
    event: KeyboardEvent,
    currentDate: Date,
  ): Date | null {
    const arrowStep: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
    if (event.key in arrowStep) {
      const step = arrowStep[event.key];
      return this.skipDisabledDays(
        addDays(currentDate, step),
        step,
        Math.ceil(366 / Math.abs(step)),
      );
    }
    if (event.key === "Home" || event.key === "End") {
      const offset = (currentDate.getDay() - this.firstDayOfWeek() + 7) % 7;
      const rowStart = addDays(currentDate, -offset);
      const rowEnd = addDays(currentDate, 6 - offset);
      return event.key === "Home"
        ? this.skipDisabledDays(rowStart, 1, 7)
        : this.skipDisabledDays(rowEnd, -1, 7);
    }
    if (event.key === "PageUp") {
      return event.shiftKey
        ? addYears(currentDate, -1)
        : addMonths(currentDate, -1);
    }
    if (event.key === "PageDown") {
      return event.shiftKey
        ? addYears(currentDate, 1)
        : addMonths(currentDate, 1);
    }
    return null;
  }

  private skipDisabledDays(
    start: Date,
    step: number,
    maxIterations: number,
  ): Date | null {
    const matchers = this.computedDisabledMatchers();
    let date = start;
    for (let i = 0; i < maxIterations; i++) {
      if (!matchAny(date, matchers)) return date;
      date = addDays(date, step);
    }
    return null;
  }

  private adjustCurrentMonthForFocus(nextDate: Date): void {
    const anchor = this.currentMonth();
    const lastVisibleMonth = addMonths(anchor, this.numberOfMonths() - 1);
    if (isBeforeDay(nextDate, startOfMonth(anchor))) {
      this.currentMonth.set(startOfMonth(nextDate));
      return;
    }
    const afterLast =
      nextDate.getFullYear() > lastVisibleMonth.getFullYear() ||
      (nextDate.getFullYear() === lastVisibleMonth.getFullYear() &&
        nextDate.getMonth() > lastVisibleMonth.getMonth());
    if (afterLast) {
      const monthsAhead =
        nextDate.getMonth() -
        lastVisibleMonth.getMonth() +
        12 * (nextDate.getFullYear() - lastVisibleMonth.getFullYear());
      this.currentMonth.set(startOfMonth(addMonths(anchor, monthsAhead)));
    }
  }

  private handleMonthsKeydown(
    event: KeyboardEvent,
    target: HTMLElement,
  ): void {
    const buttons = this.queryGridButtons(".tedi-calendar-month-grid__month");
    const index = buttons.indexOf(target as HTMLButtonElement);
    if (index === -1) return;

    let nextIndex: number | null = null;
    switch (event.key) {
      case "ArrowLeft":
        nextIndex = index - 1;
        break;
      case "ArrowRight":
        nextIndex = index + 1;
        break;
      case "ArrowUp":
        nextIndex = index - 3;
        break;
      case "ArrowDown":
        nextIndex = index + 3;
        break;
      default:
        return;
    }

    if (nextIndex === null) return;
    if (nextIndex < 0 || nextIndex >= buttons.length) {
      event.preventDefault();
      return;
    }
    event.preventDefault();
    buttons[nextIndex].focus();
  }

  private handleYearsKeydown(
    event: KeyboardEvent,
    target: HTMLElement,
  ): void {
    const buttons = this.queryGridButtons(".tedi-calendar-year-grid__year");
    const index = buttons.indexOf(target as HTMLButtonElement);
    if (index === -1) return;

    switch (event.key) {
      case "ArrowLeft":
        this.focusGridIndex(buttons, index - 1);
        event.preventDefault();
        return;
      case "ArrowRight":
        this.focusGridIndex(buttons, index + 1);
        event.preventDefault();
        return;
      case "ArrowUp":
        this.focusGridIndex(buttons, index - 3);
        event.preventDefault();
        return;
      case "ArrowDown":
        this.focusGridIndex(buttons, index + 3);
        event.preventDefault();
        return;
      case "PageUp":
        event.preventDefault();
        this.internalYearPageStart.set(
          this.yearPageStart() - this.yearPageSize,
        );
        return;
      case "PageDown":
        event.preventDefault();
        this.internalYearPageStart.set(
          this.yearPageStart() + this.yearPageSize,
        );
        return;
      default:
        return;
    }
  }

  private focusGridIndex(buttons: HTMLButtonElement[], index: number): void {
    if (index < 0 || index >= buttons.length) return;
    buttons[index].focus();
  }

  private queryGridButtons(selector: string): HTMLButtonElement[] {
    const host = this.hostEl.nativeElement as HTMLElement;
    return Array.from(host.querySelectorAll<HTMLButtonElement>(selector));
  }

  /**
   * Moves focus to the calendar's active cell — the roving-tabindex day in the
   * day view, or the first enabled control in the month/year views. Used by
   * popover hosts (e.g. date-field) to pull focus into the calendar when it
   * opens, since the CDK overlay is detached from the trigger in DOM order.
   */
  focusActiveCell(): void {
    afterNextRender(
      () => {
        const host = this.hostEl.nativeElement as HTMLElement;
        const target =
          host.querySelector<HTMLElement>('[tabindex="0"]') ??
          host.querySelector<HTMLElement>("button:not([disabled])");
        target?.focus();
      },
      { injector: this.injector },
    );
  }

  private focusDayCell(date: Date): void {
    const key = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime();
    afterNextRender(
      () => {
        const host = this.hostEl.nativeElement as HTMLElement;
        const inMonth = host.querySelector<HTMLButtonElement>(
          `[data-date-key="${key}"]:not(.tedi-calendar-day-grid__day--outside)`,
        );
        const target =
          inMonth ??
          host.querySelector<HTMLButtonElement>(`[data-date-key="${key}"]`);
        target?.focus();
      },
      { injector: this.injector },
    );
  }

  private commit(newValue: CalendarValue, day: Date): void {
    this.value.set(newValue);
    this.select.emit({ date: newValue, day });
    this.onChange(newValue);
    this.onTouched();
  }

  private partialRange(value: CalendarValue): DateRange | null {
    if (
      value &&
      !(value instanceof Date) &&
      !Array.isArray(value) &&
      value.to === undefined
    ) {
      return value;
    }
    return null;
  }

  private deriveAnchor(value: CalendarValue): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (Array.isArray(value)) {
      return value.length > 0 ? value[0] : null;
    }
    return value.from;
  }
}
