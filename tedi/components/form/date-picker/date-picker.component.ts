import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  computed,
  model,
  input,
  inject,
  signal,
} from "@angular/core";
import {
  ButtonComponent,
  ClosingButtonComponent,
} from "tedi/components/buttons";
import { IconComponent } from "tedi/components/base";
import { TediTranslationService } from "tedi/services";
import { DropdownComponent } from "../../overlay/dropdown/dropdown.component";
import { DropdownTriggerDirective } from "../../overlay/dropdown/dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "../../overlay/dropdown/dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../../overlay/dropdown/dropdown-item/dropdown-item.component";
import { SeparatorComponent } from "tedi/components/helpers";
import {
  PopoverComponent,
  PopoverTriggerComponent,
  PopoverContentComponent,
} from "tedi/components/overlay";

export interface DatePickerDay {
  date: Date;
  disabled: boolean;
  inCurrentMonth: boolean;
}

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
    PopoverTriggerComponent,
    PopoverContentComponent,
  ],
})
export class DatePickerComponent {
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
  readonly showControls = input(true);

  /** Toggle visibility of the month selection dropdown in the header. */
  readonly showMonthDropdown = input(true);

  /** Toggle visibility of the year selection dropdown in the header. */
  readonly showYearDropdown = input(true);

  /** Explicit starting year for the year dropdown list. If null, a dynamic fallback range (current year - 100) is used. */
  readonly startYear = input<number | null>(null);

  /** Explicit ending year for the year dropdown list. If null, a dynamic fallback range (current year + 20) is used. */
  readonly endYear = input<number | null>(null);

  /** Input placeholder */
  readonly placeholder = input<string>();

  readonly inputValue = computed(() => {
    const selected = this.selected();
    if (!selected) return "";

    return this.format(selected);
  });

  readonly isCalendarOpen = signal(false);

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

  readonly months = [
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

  selectDay(day: DatePickerDay) {
    if (day.disabled) return;

    this.selected.set(day.date);
  }

  isDisabled(date: Date): boolean {
    const rules = this.disabled();
    if (!rules) return false;

    const matchers = Array.isArray(rules) ? rules : [rules];
    return matchers.some((m) => this.matches(m, date));
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

  onMonthSelect(index?: string) {
    if (!index) return;

    const updated = new Date(this.month());
    updated.setMonth(Number(index));
    this.month.set(updated);
  }

  onYearSelect(index?: string) {
    const updated = new Date(this.month());
    updated.setFullYear(Number(index));
    this.month.set(updated);
  }

  toggleCalendar() {
    this.isCalendarOpen.update((v) => !v);
  }

  private rawInput = "";

  onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.rawInput = value;
  }

  onInputBlur() {
    const selected = this.selected();
    const parsed = this.parseDate(this.rawInput);

    if (parsed) {
      this.selected.set(parsed);
      this.month.set(parsed);
    } else {
      this.rawInput = selected ? this.format(selected) : "";
    }
  }

  clearInput() {
    this.selected.set(null);
    this.rawInput = "";
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
}
