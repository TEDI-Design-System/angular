import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  computed,
  model,
  input,
  signal,
  OnInit,
  viewChild,
  ElementRef,
  effect,
  forwardRef,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { ButtonComponent } from "../../buttons/button/button.component";
import { ClosingButtonComponent } from "../../buttons/closing-button/closing-button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { PopoverComponent } from "../../overlay/popover/popover.component";
import { PopoverContentComponent } from "../../overlay/popover/popover-content/popover-content.component";
import { PopoverTriggerDirective } from "../../overlay/popover/popover-trigger/popover-trigger.directive";
import { DatePickerHeaderComponent } from "./date-picker-header/date-picker-header.component";
import { DatePickerCalendarGridComponent } from "./date-picker-calendar-grid/date-picker-calendar-grid.component";
import { DatePickerMonthGridComponent } from "./date-picker-month-grid/date-picker-month-grid.component";
import { DatePickerYearGridComponent } from "./date-picker-year-grid/date-picker-year-grid.component";
import { formatDate, parseDate, isSameDay, isBeforeDay, isAfterDay, getISOWeek } from "../../../utils/date.util";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";

export interface DatePickerDay {
  date: Date;
  disabled: boolean;
  inCurrentMonth: boolean;
}

export type DatePickerInputState = "default" | "error" | "valid";
export type DatePickerInputSize = "default" | "small";
export type DatePickerSelectorMode = "none" | "label" | "grid" | "dropdown";
export type DatePickerView = "month-grid" | "year-grid" | "calendar-grid";

export type DatePickerMatcher =
  | Date
  | Date[]
  | { before: Date }
  | { after: Date }
  | { from: Date; to?: Date }
  | ((date: Date) => boolean);

let datePickerId = 0;

@Component({
  standalone: true,
  selector: "tedi-date-picker",
  templateUrl: "./date-picker.component.html",
  styleUrl: "./date-picker.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    IconComponent,
    ClosingButtonComponent,
    SeparatorComponent,
    PopoverComponent,
    PopoverTriggerDirective,
    PopoverContentComponent,
    DatePickerHeaderComponent,
    DatePickerCalendarGridComponent,
    DatePickerMonthGridComponent,
    DatePickerYearGridComponent,
    TediTranslationPipe
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true,
    },
  ],
})
export class DatePickerComponent implements OnInit, ControlValueAccessor {
  readonly today = new Date();
  readonly uniqueId = `tedi-date-picker-id-${datePickerId++}`;

  private formDisabled = signal(false);
  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  private emitIfChanged(value: Date | null): void {
    const current = this.selected();
    const changed = value === null
      ? current !== null
      : !current || !isSameDay(value, current);

    if (changed) {
      this.onChange(value);
    }
  }

  /** Selected date */
  readonly selected = model<Date | null>(null);

  /** Currently shown month */
  readonly month = model(this.today);

  /** Disabled dates that cannot be selected. */
  readonly disabled = input<DatePickerMatcher | DatePickerMatcher[] | null>(
    null,
  );

  /** Shows or hides the calendar navigation controls (previous/next month buttons). */
  readonly showNavigation = input(true);

  /** Month selector mode: none | label | grid | dropdown */
  readonly monthMode = input<DatePickerSelectorMode>("dropdown");

  /** Year selector mode: none | label | grid | dropdown */
  readonly yearMode = input<DatePickerSelectorMode>("dropdown");

  /** Explicit starting year for the year dropdown list. If null, a dynamic fallback range (current year - 100) is used. */
  readonly startYear = input<number | null>(null);

  /** Explicit ending year for the year dropdown list. If null, a dynamic fallback range (current year + 20) is used. */
  readonly endYear = input<number | null>(null);

  /** Input id */
  readonly inputId = input<string>();

  /** Input placeholder */
  readonly inputPlaceholder = input<string>();

  /** Input state */
  readonly inputState = input<DatePickerInputState>("default");

  /** Input size */
  readonly inputSize = input<DatePickerInputSize>("default");

  /** Is input disabled? */
  readonly inputDisabled = input(false);

  /** Internal computed for combined disabled state (inputDisabled + formDisabled from reactive forms) */
  readonly fieldDisabled = computed(() => this.inputDisabled() || this.formDisabled());

  /** Is manual typing into input allowed? */
  readonly allowManualInput = input(true);

  /** Should show week numbers before calendar grid? */
  readonly showWeekNumbers = input(false);

  /** Close calendar popover after date selection, default true */
  readonly closeOnSelect = input(true);

  /** Current view of datepicker (months grid, years grid or calendar grid) */
  readonly currentView = signal<DatePickerView>("calendar-grid");

  /** Shown input value */
  readonly inputValue = signal("");

  /** Keyboard active date (what receives keyboard focus) */
  readonly activeDate = signal<Date | null>(null);

  private readonly YEARS_PER_PAGE = 12;
  readonly yearPageIndex = signal(0);
  readonly selectedYear = computed(() => this.month().getFullYear());

  readonly years = computed(() => {
    const current = this.today.getFullYear();

    const start = this.startYear() ?? current - 100;
    const end = this.endYear() ?? current + 20;

    const safeStart = Math.min(start, end);
    const safeEnd = Math.max(start, end);

    return Array.from(
      { length: safeEnd - safeStart + 1 },
      (_, i) => safeStart + i,
    );
  });

  readonly pagedYears = computed(() => {
    const start = this.yearPageIndex() * this.YEARS_PER_PAGE;
    return this.years().slice(start, start + this.YEARS_PER_PAGE);
  });

  readonly hasPrevYearPage = computed(() => {
    return this.yearPageIndex() > 0;
  });

  readonly hasNextYearPage = computed(() => {
    const all = this.years().length;
    return (this.yearPageIndex() + 1) * this.YEARS_PER_PAGE < all;
  });

  readonly disabledMonths = computed(() => {
    const year = this.month().getFullYear();
    const disabled = new Set<number>();

    for (let month = 0; month < 12; month++) {
      if (this.getFirstEnabledDayOfMonth(year, month) === null) {
        disabled.add(month);
      }
    }

    return disabled;
  });

  readonly disabledYears = computed(() => {
    const disabled = new Set<number>();

    for (const year of this.years()) {
      if (this.isYearDisabled(year)) {
        disabled.add(year);
      }
    }

    return disabled;
  });

  readonly weekRows = computed(() => {
    const cells = this.days();
    const rows: DatePickerDay[][] = [];

    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }

    return rows;
  });

  readonly weekNumbers = computed(() => {
    return this.weekRows().map((week) => getISOWeek(week[0].date));
  });

  readonly canGoPrev = computed(() => {
    return this.findPrevEnabledMonth() !== null;
  });

  readonly canGoNext = computed(() => {
    return this.findNextEnabledMonth() !== null;
  });

  readonly days = computed<DatePickerDay[]>(() => {
    const month = this.month();
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const firstOfMonth = new Date(year, monthIndex, 1);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7;

    const trailing = (7 - ((firstWeekday + daysInMonth) % 7)) % 7;
    const cells: DatePickerDay[] = [];

    /** Previous month days */
    for (let i = 0; i < firstWeekday; i++) {
      const date = new Date(year, monthIndex, i - firstWeekday + 1);
      const disabled = this.isDisabled(date);

      cells.push({
        date,
        inCurrentMonth: false,
        disabled,
      });
    }

    /** Current month days */
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const disabled = this.isDisabled(date);

      cells.push({
        date,
        inCurrentMonth: true,
        disabled,
      });
    }

    /** Next month days */
    const lastDate = new Date(year, monthIndex, daysInMonth);

    for (let i = 1; i <= trailing; i++) {
      const date = new Date(lastDate);
      date.setDate(lastDate.getDate() + i);
      const disabled = this.isDisabled(date);

      cells.push({
        date,
        inCurrentMonth: false,
        disabled,
      });
    }

    return cells;
  });

  readonly inputElement =
    viewChild.required<ElementRef<HTMLInputElement>>("inputElement");
  readonly calendarGrid = viewChild<DatePickerCalendarGridComponent>("gridElement");
  readonly popover = viewChild.required(PopoverComponent);

  constructor() {
    effect(() => {
      const selected = this.selected();
      this.inputValue.set(selected ? formatDate(selected) : "");
    });
  }

  ngOnInit(): void {
    let active = this.selected() ?? this.today;

    // If the initial active date is disabled, find the first enabled date
    if (this.isDisabled(active)) {
      const firstEnabled = this.getFirstEnabledDayOfMonth(
        active.getFullYear(),
        active.getMonth(),
      );
      if (firstEnabled) {
        active = firstEnabled;
      }
    }

    this.activeDate.set(active);
  }

  // ControlValueAccessor implementation
  writeValue(value: Date | null): void {
    this.selected.set(value);
    this.inputValue.set(value ? formatDate(value) : "");
  }

  registerOnChange(fn: (value: Date | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  getTabIndex(date: Date): number {
    const active = this.activeDate();
    return active && date.toDateString() === active.toDateString() ? 0 : -1;
  }

  prevMonth() {
    const prev = this.findPrevEnabledMonth();
    if (prev) {
      this.month.set(prev);
      this.updateActiveDateForMonth(prev.getFullYear(), prev.getMonth());
    }
  }

  nextMonth() {
    const next = this.findNextEnabledMonth();
    if (next) {
      this.month.set(next);
      this.updateActiveDateForMonth(next.getFullYear(), next.getMonth());
    }
  }

  prevYearPage() {
    if (this.hasPrevYearPage()) {
      this.yearPageIndex.set(this.yearPageIndex() - 1);
    }
  }

  nextYearPage() {
    if (this.hasNextYearPage()) {
      this.yearPageIndex.set(this.yearPageIndex() + 1);
    }
  }

  selectDay(day: DatePickerDay) {
    if (day.disabled) return;

    this.emitIfChanged(day.date);
    this.selected.set(day.date);
    this.inputValue.set(formatDate(day.date));

    if (this.closeOnSelect()) {
      this.closeCalendar();
    }
  }

  isSelected(date: Date): boolean {
    return (
      !!this.selected() &&
      date.toDateString() === this.selected()!.toDateString()
    );
  }

  isToday(date: Date): boolean {
    return date.toDateString() === this.today.toDateString();
  }

  isDisabled(date: Date): boolean {
    const rules = this.disabled();
    if (!rules) return false;

    const matchers = Array.isArray(rules) ? rules : [rules];
    return matchers.some((m) => this.matches(m, date));
  }

  onMonthClick() {
    this.currentView.set("month-grid");
  }

  onMonthSelect(value?: string | number) {
    if (value === undefined || value === null) return;

    const monthIndex = typeof value === "number" ? value : Number(value);
    const year = this.month().getFullYear();

    if (this.getFirstEnabledDayOfMonth(year, monthIndex) === null) {
      return;
    }

    const updated = new Date(this.month());
    updated.setMonth(monthIndex);
    this.month.set(updated);
    this.updateActiveDateForMonth(year, monthIndex);

    if (this.currentView() === "month-grid") {
      this.currentView.set("calendar-grid");
    }
  }

  onYearClick() {
    const selected = this.month().getFullYear();
    const index = this.years().indexOf(selected);
    this.yearPageIndex.set(Math.floor(index / this.YEARS_PER_PAGE));
    this.currentView.set("year-grid");
  }

  onYearSelect(value?: string | number) {
    if (value === undefined || value === null) return;

    const year = typeof value === "number" ? value : Number(value);

    if (this.isYearDisabled(year)) {
      return;
    }

    const updated = new Date(this.month());
    updated.setFullYear(year);

    // If the current month is disabled in the new year, find the first enabled month
    let targetMonth = updated.getMonth();
    if (this.getFirstEnabledDayOfMonth(year, targetMonth) === null) {
      for (let month = 0; month < 12; month++) {
        if (this.getFirstEnabledDayOfMonth(year, month) !== null) {
          targetMonth = month;
          updated.setMonth(month);
          break;
        }
      }
    }

    this.month.set(updated);
    this.updateActiveDateForMonth(year, targetMonth);

    if (this.currentView() === "year-grid") {
      this.currentView.set("calendar-grid");
    }
  }

  onDayKeydown(event: KeyboardEvent, current: Date) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.selectDay({ date: current, disabled: false, inCurrentMonth: true });
      return;
    }

    if (event.key === "Escape") {
      this.closeCalendar();
      return;
    }

    const target = this.handleDayNavigation(event.key, current);
    if (target) {
      event.preventDefault();
      this.focusDate(target);
    }
  }

  private handleDayNavigation(key: string, current: Date): Date | null {
    const arrowSteps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };

    if (key in arrowSteps) {
      return this.findNextEnabledDate(current, arrowSteps[key]);
    }

    if (key === "Home") {
      const target = new Date(current);
      target.setDate(current.getDate() - ((current.getDay() + 6) % 7));
      return this.isDisabled(target)
        ? this.findNextEnabledDate(target, 1)
        : target;
    }

    if (key === "End") {
      const target = new Date(current);
      target.setDate(current.getDate() + (6 - ((current.getDay() + 6) % 7)));
      return this.isDisabled(target)
        ? this.findNextEnabledDate(target, -1)
        : target;
    }

    if (key === "PageUp") {
      const target = new Date(current);
      target.setMonth(current.getMonth() - 1);
      return this.isDisabled(target)
        ? (this.findNextEnabledDate(target, 1) ??
          this.findNextEnabledDate(target, -1))
        : target;
    }

    if (key === "PageDown") {
      const target = new Date(current);
      target.setMonth(current.getMonth() + 1);
      return this.isDisabled(target)
        ? (this.findNextEnabledDate(target, -1) ??
          this.findNextEnabledDate(target, 1))
        : target;
    }

    return null;
  }

  onCalendarKeyDown(event: KeyboardEvent) {
    if (this.currentView() !== "calendar-grid" && event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      this.currentView.set("calendar-grid");
      const active = this.selected() ?? this.today;
      setTimeout(() => this.focusDate(active));
      return;
    }

    if (event.key === "Tab") {
      this.handleFocusTrap(event);
    }
  }

  private handleFocusTrap(event: KeyboardEvent) {
    const container = (event.target as HTMLElement).closest(
      ".tedi-date-picker__calendar",
    );
    if (!container) return;

    const focusableSelector = 'button:not([disabled]):not([tabindex="-1"]), [tabindex="0"]:not([disabled])';
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector),
    );

    if (!focusableElements.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else if (document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  onInput(event: Event) {
    if (!this.allowManualInput()) return;

    const value = (event.target as HTMLInputElement).value;
    this.inputValue.set(value);

    if (value === "") {
      this.selected.set(null);
    }
  }

  onInputBlur() {
    this.onTouched();

    if (!this.allowManualInput()) return;

    const selected = this.selected();
    const parsed = parseDate(this.inputValue());

    if (parsed) {
      this.emitIfChanged(parsed);
      this.selected.set(parsed);
      this.month.set(parsed);
    } else {
      this.inputValue.set(selected ? formatDate(selected) : "");
    }
  }

  onInputClick() {
    if (this.allowManualInput()) return;

    if (this.popover().floatUiComponent().state) {
      this.popover().floatUiComponent().hide();
      this.inputElement().nativeElement.focus();
    } else {
      this.popover().floatUiComponent().show();
      this.openCalendar();
    }
  }

  clearInput() {
    this.emitIfChanged(null);
    this.inputValue.set("");
    this.selected.set(null);
  }

  closeCalendar() {
    this.popover().floatUiComponent().hide();
    this.inputElement().nativeElement.focus();
    this.onTouched();
  }

  openCalendar() {
    let active = this.selected() ?? this.today;

    // If active date is disabled, find the first enabled date
    if (this.isDisabled(active)) {
      const currentMonth = this.month();
      const firstEnabled = this.getFirstEnabledDayOfMonth(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
      );
      if (firstEnabled) {
        active = firstEnabled;
      }
    }

    this.activeDate.set(active);
    setTimeout(() => this.focusDate(active));
  }

  private focusDate(date: Date) {
    this.activeDate.set(date);
    const currentMonth = this.month();

    if (
      currentMonth.getFullYear() !== date.getFullYear() ||
      currentMonth.getMonth() !== date.getMonth()
    ) {
      this.month.set(new Date(date));
    }

    setTimeout(() => {
      this.calendarGrid()?.focusDate(date);
    });
  }

  private matches(m: DatePickerMatcher, date: Date): boolean {
    if (m instanceof Date) {
      return isSameDay(m, date);
    }

    if (Array.isArray(m)) {
      return m.some((d) => isSameDay(d, date));
    }

    if (typeof m === "function") {
      return m(date);
    }

    if ("before" in m) {
      return isBeforeDay(date, m.before);
    }

    if ("after" in m) {
      return isAfterDay(date, m.after);
    }

    if ("from" in m) {
      const { from, to } = m;
      if (to) {
        return (isSameDay(date, from) || isAfterDay(date, from)) &&
          (isSameDay(date, to) || isBeforeDay(date, to));
      }

      return isSameDay(date, from) || isAfterDay(date, from);
    }

    return false;
  }

  /**
   * Updates activeDate to the selected date if it's in the given month,
   * otherwise to the first enabled date in the month.
   * Needed for correct WCAG focus handling
   */
  private updateActiveDateForMonth(year: number, month: number) {
    const selected = this.selected();

    if (
      selected &&
      selected.getFullYear() === year &&
      selected.getMonth() === month &&
      !this.isDisabled(selected)
    ) {
      this.activeDate.set(selected);
      return;
    }

    const firstEnabled = this.getFirstEnabledDayOfMonth(year, month);
    if (firstEnabled) {
      this.activeDate.set(firstEnabled);
    }
  }

  private getFirstEnabledDayOfMonth(year: number, month: number): Date | null {
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);

      if (!this.isDisabled(date)) {
        return date;
      }
    }

    return null;
  }

  private isYearDisabled(year: number): boolean {
    for (let month = 0; month < 12; month++) {
      if (this.getFirstEnabledDayOfMonth(year, month) !== null) {
        return false;
      }
    }

    return true;
  }

  private findPrevEnabledMonth(): Date | null {
    const current = this.month();
    const years = this.years();
    const minYear = years.length > 0 ? years[0] : current.getFullYear() - 100;

    let year = current.getFullYear();
    let month = current.getMonth() - 1;

    while (year >= minYear) {
      if (month < 0) {
        month = 11;
        year--;
      }

      if (year < minYear) break;

      if (this.getFirstEnabledDayOfMonth(year, month) !== null) {
        return new Date(year, month, 1);
      }

      month--;
    }

    return null;
  }

  private findNextEnabledMonth(): Date | null {
    const current = this.month();
    const years = this.years();
    const maxYear = years.length > 0 ? years[years.length - 1] : current.getFullYear() + 20;

    let year = current.getFullYear();
    let month = current.getMonth() + 1;

    while (year <= maxYear) {
      if (month > 11) {
        month = 0;
        year++;
      }

      if (year > maxYear) break;

      if (this.getFirstEnabledDayOfMonth(year, month) !== null) {
        return new Date(year, month, 1);
      }

      month++;
    }

    return null;
  }

  /**
   * Finds the next enabled date starting from the given date, moving by the given step.
   * Returns null if no enabled date is found within a reasonable range.
   * Needed for correct WCAG arrow movement handling
   */
  private findNextEnabledDate(from: Date, step: number): Date | null {
    const maxIterations = 365;
    const target = new Date(from);

    for (let i = 0; i < maxIterations; i++) {
      target.setDate(target.getDate() + step);

      if (!this.isDisabled(target)) {
        return new Date(target);
      }
    }

    return null;
  }
}
