import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  ViewEncapsulation,
} from "@angular/core";
import { getMonthNames, isSameMonth } from "../../../../utils/date.util";
import { TediTranslationService } from "../../../../services/translation/translation.service";

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

  private readonly translation = inject(TediTranslationService);

  readonly monthNames = computed(() =>
    getMonthNames(this.localeCode(), this.monthNameFormat()),
  );

  readonly monthLongNames = computed(() =>
    getMonthNames(this.localeCode(), "long"),
  );

  readonly rows = computed<number[][]>(() => {
    const indices = Array.from({ length: 12 }, (_, i) => i);
    const rows: number[][] = [];
    for (let i = 0; i < indices.length; i += 3) {
      rows.push(indices.slice(i, i + 3));
    }
    return rows;
  });

  readonly gridAriaLabel = computed(() =>
    this.translation.translate("date-picker.choose-month"),
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
