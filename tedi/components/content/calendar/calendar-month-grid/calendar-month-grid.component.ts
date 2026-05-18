import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  ViewEncapsulation,
} from "@angular/core";
import { getMonthNames, isSameMonth } from "../../../../utils/date.util";

type MonthPredicate = (month: Date) => boolean;

@Component({
  selector: "tedi-calendar-month-grid",
  standalone: true,
  templateUrl: "./calendar-month-grid.component.html",
  styleUrl: "./calendar-month-grid.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarMonthGridComponent {
  readonly year = input.required<number>();
  readonly selectedMonth = input<Date | null>(null);
  readonly localeCode = input<string>("et-EE");
  readonly monthNameFormat = input<"long" | "short">("short");
  readonly isMonthDisabled = input<MonthPredicate>(() => false);
  readonly inputDisabled = input<boolean>(false);

  readonly monthSelect = output<Date>();

  readonly monthNames = computed(() =>
    getMonthNames(this.localeCode(), this.monthNameFormat()),
  );

  private readonly today = new Date();

  monthDate(index: number): Date {
    return new Date(this.year(), index, 1);
  }

  isSelected(index: number): boolean {
    const selected = this.selectedMonth();
    if (!selected) return false;
    return isSameMonth(selected, this.monthDate(index));
  }

  isCurrent(index: number): boolean {
    return isSameMonth(this.today, this.monthDate(index));
  }

  isDisabled(index: number): boolean {
    if (this.inputDisabled()) return true;
    return this.isMonthDisabled()(this.monthDate(index));
  }

  handleClick(index: number): void {
    if (this.isDisabled(index)) return;
    this.monthSelect.emit(this.monthDate(index));
  }
}
