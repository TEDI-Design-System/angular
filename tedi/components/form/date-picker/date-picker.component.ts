import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  signal,
  computed,
  model,
  input,
  inject,
} from "@angular/core";
import { ButtonComponent } from "tedi/components/buttons";
import { IconComponent } from "tedi/components/base";
import { TediTranslationService } from "tedi/services";

export interface DatePickerDay {
  date: Date;
  disabled: boolean;
  inCurrentMonth: boolean;
}

@Component({
  standalone: true,
  selector: "tedi-date-picker",
  templateUrl: "./date-picker.component.html",
  styleUrl: "./date-picker.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent],
})
export class DatePickerComponent {
  /** Selected date */
  readonly selected = model<Date | null>(null);

  private readonly today = new Date();

  readonly min = input<Date | null>(null);
  readonly max = input<Date | null>(null);

  readonly showControls = input(true);
  readonly showMonthDropdown = input(true);
  readonly showYearDropdown = input(true);

  readonly startYear = input<number | null>(null);
  readonly endYear = input<number | null>(null);

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

  private readonly currentMonth = signal(this.today);

  readonly selectedMonth = computed(() => this.currentMonth().getMonth());
  readonly selectedYear = computed(() => this.currentMonth().getFullYear());

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
    const month = this.currentMonth();
    const year = month.getFullYear();
    const monthIndex = month.getMonth();

    const firstOfMonth = new Date(year, monthIndex, 1);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7;

    const minDate = this.min();
    const maxDate = this.max();

    const trailing = (7 - ((firstWeekday + daysInMonth) % 7)) % 7;
    const cells: DatePickerDay[] = [];

    /** Previous month days */
    for (let i = 0; i < firstWeekday; i++) {
      const date = new Date(year, monthIndex, i - firstWeekday + 1);
      const disabled = !!(
        (minDate && date < minDate) ||
        (maxDate && date > maxDate)
      );

      cells.push({
        date,
        inCurrentMonth: false,
        disabled,
      });
    }

    /** Current month days */
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, monthIndex, day);
      const disabled = !!(
        (minDate && date < minDate) ||
        (maxDate && date > maxDate)
      );

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

      const disabled = !!(
        (minDate && date < minDate) ||
        (maxDate && date > maxDate)
      );

      cells.push({
        date,
        inCurrentMonth: false,
        disabled,
      });
    }

    return cells;
  });

  readonly canGoPrev = computed(() => {
    if (!this.min()) return true;

    const prev = new Date(this.currentMonth());
    prev.setMonth(prev.getMonth() - 1);

    return (
      prev >= new Date(this.min()!.getFullYear(), this.min()!.getMonth(), 1)
    );
  });

  readonly canGoNext = computed(() => {
    if (!this.max()) return true;

    const next = new Date(this.currentMonth());
    next.setMonth(next.getMonth() + 1);

    return (
      next <= new Date(this.max()!.getFullYear(), this.max()!.getMonth(), 1)
    );
  });

  prevMonth() {
    const date = new Date(this.currentMonth());
    date.setMonth(date.getMonth() - 1);
    this.currentMonth.set(date);
  }

  nextMonth() {
    const date = new Date(this.currentMonth());
    date.setMonth(date.getMonth() + 1);
    this.currentMonth.set(date);
  }

  selectDay(day: DatePickerDay) {
    if (day.disabled) return;

    this.selected.set(day.date);
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

  onMonthSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    const monthIndex = Number(select.value);

    const updated = new Date(this.currentMonth());
    updated.setMonth(monthIndex);

    this.currentMonth.set(updated);
  }

  onYearSelect(event: Event) {
    const select = event.target as HTMLSelectElement;
    const year = Number(select.value);

    const updated = new Date(this.currentMonth());
    updated.setFullYear(year);

    this.currentMonth.set(updated);
  }
}
