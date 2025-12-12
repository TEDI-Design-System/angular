import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  computed,
  model,
  input,
  inject,
  signal,
  OnInit,
  viewChild,
  ElementRef,
} from "@angular/core";
import { ButtonComponent } from "../../buttons/button/button.component";
import { ClosingButtonComponent } from "../../buttons/closing-button/closing-button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { DropdownComponent } from "../../overlay/dropdown/dropdown.component";
import { DropdownTriggerDirective } from "../../overlay/dropdown/dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "../../overlay/dropdown/dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../../overlay/dropdown/dropdown-item/dropdown-item.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { PopoverComponent } from "../../overlay/popover/popover.component";
import { PopoverContentComponent } from "../../overlay/popover/popover-content/popover-content.component";
import { PopoverTriggerDirective } from "../../overlay/popover/popover-trigger/popover-trigger.directive";

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
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemComponent,
    ClosingButtonComponent,
    SeparatorComponent,
    PopoverComponent,
    PopoverTriggerDirective,
    PopoverContentComponent,
  ],
})
export class DatePickerComponent implements OnInit {
  private readonly today = new Date();
  readonly uniqueId = `tedi-date-picker-id-${datePickerId++}`;

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

  /** Is manual typing into input allowed? */
  readonly allowManualInput = input(true);

  /** Should show week numbers before calendar grid? */
  readonly showWeekNumbers = input(false);

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

  readonly weekRows = computed(() => {
    const cells = this.days();
    const rows: DatePickerDay[][] = [];

    for (let i = 0; i < cells.length; i += 7) {
      rows.push(cells.slice(i, i + 7));
    }

    return rows;
  });

  readonly weekNumbers = computed(() => {
    return this.weekRows().map((week) => this.getISOWeek(week[0].date));
  });

  readonly canGoPrev = computed(() => {
    const current = this.month();
    const year = current.getFullYear();
    const month = current.getMonth();

    const prevMonth = month - 1;
    const prevYear = prevMonth < 0 ? year - 1 : year;
    const finalPrevMonth = (prevMonth + 12) % 12;

    return this.getFirstEnabledDayOfMonth(prevYear, finalPrevMonth) !== null;
  });

  readonly canGoNext = computed(() => {
    const current = this.month();
    const year = current.getFullYear();
    const month = current.getMonth();

    const nextMonth = month + 1;
    const nextYear = nextMonth > 11 ? year + 1 : year;
    const finalNextMonth = nextMonth % 12;

    return this.getFirstEnabledDayOfMonth(nextYear, finalNextMonth) !== null;
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
  readonly gridElement =
    viewChild.required<ElementRef<HTMLDivElement>>("gridElement");
  readonly popover = viewChild.required(PopoverComponent);

  readonly translationService = inject(TediTranslationService);

  readonly weekDays = [
    this.translationService.track("date-picker.monday-short"),
    this.translationService.track("date-picker.tuesday-short"),
    this.translationService.track("date-picker.wednesday-short"),
    this.translationService.track("date-picker.thursday-short"),
    this.translationService.track("date-picker.friday-short"),
    this.translationService.track("date-picker.saturday-short"),
    this.translationService.track("date-picker.sunday-short"),
  ];

  readonly monthShortNames = [
    this.translationService.track("date-picker.january-short"),
    this.translationService.track("date-picker.february-short"),
    this.translationService.track("date-picker.march-short"),
    this.translationService.track("date-picker.april-short"),
    this.translationService.track("date-picker.may-short"),
    this.translationService.track("date-picker.june-short"),
    this.translationService.track("date-picker.july-short"),
    this.translationService.track("date-picker.august-short"),
    this.translationService.track("date-picker.september-short"),
    this.translationService.track("date-picker.october-short"),
    this.translationService.track("date-picker.november-short"),
    this.translationService.track("date-picker.december-short"),
  ];

  readonly monthNames = [
    this.translationService.track("date-picker.january"),
    this.translationService.track("date-picker.february"),
    this.translationService.track("date-picker.march"),
    this.translationService.track("date-picker.april"),
    this.translationService.track("date-picker.may"),
    this.translationService.track("date-picker.june"),
    this.translationService.track("date-picker.july"),
    this.translationService.track("date-picker.august"),
    this.translationService.track("date-picker.september"),
    this.translationService.track("date-picker.october"),
    this.translationService.track("date-picker.november"),
    this.translationService.track("date-picker.december"),
  ];

  ngOnInit(): void {
    const selected = this.selected();
    this.inputValue.set(selected ? this.format(selected) : "");
    this.activeDate.set(selected ?? this.today);
  }

  getTabIndex(date: Date): number {
    const active = this.activeDate();
    return active && date.toDateString() === active.toDateString() ? 0 : -1;
  }

  prevMonth() {
    const date = new Date(this.month());
    date.setMonth(date.getMonth() - 1);
    this.month.set(date);
  }

  nextMonth() {
    const date = new Date(this.month());
    date.setMonth(date.getMonth() + 1);
    this.month.set(date);
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

    this.selected.set(day.date);
    this.inputValue.set(this.format(day.date));
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

  onMonthSelect(index?: string) {
    if (!index) return;

    const updated = new Date(this.month());
    updated.setMonth(Number(index));
    this.month.set(updated);

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

  onYearSelect(index?: string) {
    const updated = new Date(this.month());
    updated.setFullYear(Number(index));
    this.month.set(updated);

    if (this.currentView() === "year-grid") {
      this.currentView.set("calendar-grid");
    }
  }

  onDayKeydown(event: KeyboardEvent, current: Date) {
    let target: Date | null = null;

    switch (event.key) {
      case "ArrowLeft":
        target = new Date(current);
        target.setDate(current.getDate() - 1);
        break;

      case "ArrowRight":
        target = new Date(current);
        target.setDate(current.getDate() + 1);
        break;

      case "ArrowUp":
        target = new Date(current);
        target.setDate(current.getDate() - 7);
        break;

      case "ArrowDown":
        target = new Date(current);
        target.setDate(current.getDate() + 7);
        break;

      case "Home":
        target = new Date(current);
        target.setDate(current.getDate() - ((current.getDay() + 6) % 7));
        break;

      case "End":
        target = new Date(current);
        target.setDate(current.getDate() + (6 - ((current.getDay() + 6) % 7)));
        break;

      case "PageUp":
        target = new Date(current);
        target.setMonth(current.getMonth() - 1);
        break;

      case "PageDown":
        target = new Date(current);
        target.setMonth(current.getMonth() + 1);
        break;

      case "Enter":
      case " ":
        event.preventDefault();
        this.selectDay({
          date: current,
          disabled: false,
          inCurrentMonth: true,
        });
        return;

      case "Escape":
        this.popover().floatUiComponent().hide();
        this.inputElement().nativeElement.focus();
        return;

      default:
        return;
    }

    if (target) {
      event.preventDefault();
      this.focusDate(target);
    }
  }

  onCalendarKeyDown(event: KeyboardEvent) {
    if (this.currentView() === "calendar-grid") return;

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();

      this.currentView.set("calendar-grid");
      const active = this.selected() ?? this.today;
      setTimeout(() => this.focusDate(active));
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
    if (!this.allowManualInput()) return;

    const selected = this.selected();
    const parsed = this.parseDate(this.inputValue());

    if (parsed) {
      this.selected.set(parsed);
      this.month.set(parsed);
    } else {
      this.inputValue.set(selected ? this.format(selected) : "");
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
    this.inputValue.set("");
    this.selected.set(null);
  }

  openCalendar() {
    const active = this.selected() ?? this.today;
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
      const container = this.gridElement().nativeElement;
      if (!container) return;

      const key = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      ).getTime();

      const btn = container.querySelector<HTMLButtonElement>(
        `[data-date-key="${key}"]`,
      );

      if (btn && document.activeElement !== btn) {
        btn.focus({ preventScroll: true });
      }
    });
  }

  private parseDate(str: string): Date | null {
    const parts = str.trim().split(".");
    if (parts.length !== 3) return null;

    const [dd, mm, yyyy] = parts.map(Number);
    if (!dd || !mm || !yyyy) return null;

    const date = new Date(yyyy, mm - 1, dd);

    if (
      date.getFullYear() !== yyyy ||
      date.getMonth() !== mm - 1 ||
      date.getDate() !== dd
    ) {
      return null;
    }

    return date;
  }

  private format(date: Date): string {
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    return `${d}.${m}.${y}`;
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getDate() === b.getDate() &&
      a.getMonth() === b.getMonth() &&
      a.getFullYear() === b.getFullYear()
    );
  }

  private matches(m: DatePickerMatcher, date: Date): boolean {
    if (m instanceof Date) {
      return this.isSameDay(m, date);
    }

    if (Array.isArray(m)) {
      return m.some((d) => this.isSameDay(d, date));
    }

    if (typeof m === "function") {
      return m(date);
    }

    if ("before" in m) {
      return date < m.before;
    }

    if ("after" in m) {
      return date > m.after;
    }

    if ("from" in m) {
      const { from, to } = m;
      if (to) return date >= from && date <= to;

      return date >= from;
    }

    return false;
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

  private getISOWeek(date: Date): number {
    const target = new Date(date);
    target.setHours(0, 0, 0, 0);

    const day = target.getDay();
    const isoDay = day === 0 ? 7 : day;

    target.setDate(target.getDate() + (4 - isoDay));
    const yearStart = new Date(target.getFullYear(), 0, 1);

    const diffInDays = Math.floor(
      (target.getTime() - yearStart.getTime()) / 86400000,
    );
    return Math.floor(diffInDays / 7) + 1;
  }
}
