import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  input,
  output,
  viewChild,
  ElementRef,
  inject,
} from "@angular/core";
import { DatePickerDay } from "../date-picker.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";

@Component({
  standalone: true,
  selector: "tedi-date-picker-calendar-grid",
  templateUrl: "./date-picker-calendar-grid.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerCalendarGridComponent {
  private readonly gridElement =
    viewChild<ElementRef<HTMLDivElement>>("gridElement");
  /** Grid element unique ID for ARIA */
  readonly gridId = input.required<string>();

  /** Week rows containing day data */
  readonly weekRows = input.required<DatePickerDay[][]>();

  /** Week numbers for each row */
  readonly weekNumbers = input.required<number[]>();

  /** Whether to show week numbers */
  readonly showWeekNumbers = input(false);

  /** Currently active date for keyboard navigation */
  readonly activeDate = input.required<Date | null>();

  /** Currently selected date */
  readonly selected = input<Date | null>(null);

  /** Today's date */
  readonly today = input.required<Date>();

  /** Emits when a day is selected */
  readonly daySelect = output<DatePickerDay>();

  /** Emits on day keydown for keyboard navigation */
  readonly dayKeydown = output<{ event: KeyboardEvent; date: Date }>();

  private readonly translationService = inject(TediTranslationService);

  readonly weekDays = [
    this.translationService.track("date-picker.monday-short"),
    this.translationService.track("date-picker.tuesday-short"),
    this.translationService.track("date-picker.wednesday-short"),
    this.translationService.track("date-picker.thursday-short"),
    this.translationService.track("date-picker.friday-short"),
    this.translationService.track("date-picker.saturday-short"),
    this.translationService.track("date-picker.sunday-short"),
  ];

  isSelected(date: Date): boolean {
    const sel = this.selected();
    return !!sel && date.toDateString() === sel.toDateString();
  }

  isToday(date: Date): boolean {
    return date.toDateString() === this.today().toDateString();
  }

  getTabIndex(date: Date): number {
    const active = this.activeDate();
    return active && date.toDateString() === active.toDateString() ? 0 : -1;
  }

  onDayClick(day: DatePickerDay) {
    this.daySelect.emit(day);
  }

  onDayKeydown(event: KeyboardEvent, date: Date) {
    this.dayKeydown.emit({ event, date });
  }

  /** Focus a specific date in the grid */
  focusDate(date: Date) {
    const container = this.gridElement()?.nativeElement;
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
  }
}
