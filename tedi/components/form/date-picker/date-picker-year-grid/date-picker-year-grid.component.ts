import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  input,
  output,
} from "@angular/core";

@Component({
  standalone: true,
  selector: "tedi-date-picker-year-grid",
  templateUrl: "./date-picker-year-grid.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerYearGridComponent {
  /** Years to display in current page */
  readonly pagedYears = input.required<number[]>();

  /** Currently selected year */
  readonly selectedYear = input.required<number>();

  /** Emits selected year */
  readonly yearSelect = output<number>();

  onYearClick(year: number) {
    this.yearSelect.emit(year);
  }
}
