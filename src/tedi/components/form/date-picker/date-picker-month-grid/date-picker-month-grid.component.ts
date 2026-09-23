import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  input,
  output,
  inject,
} from "@angular/core";
import { TediTranslationService } from "../../../../services/translation/translation.service";

@Component({
  standalone: true,
  selector: "tedi-date-picker-month-grid",
  templateUrl: "./date-picker-month-grid.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerMonthGridComponent {
  /** Currently displayed month (0-11) */
  readonly currentMonth = input.required<Date>();

  /** Emits selected month index (0-11) */
  readonly monthSelect = output<number>();

  private readonly translationService = inject(TediTranslationService);

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

  onMonthClick(index: number) {
    this.monthSelect.emit(index);
  }
}
