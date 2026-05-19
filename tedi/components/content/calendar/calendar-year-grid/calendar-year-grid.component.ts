import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  ViewEncapsulation,
} from "@angular/core";
import { isSameYear } from "../../../../utils/date.util";
import { TediTranslationService } from "../../../../services/translation/translation.service";

type YearPredicate = (year: Date) => boolean;

type YearEntry = { year: number; yearDate: Date };

@Component({
  selector: "tedi-calendar-year-grid",
  standalone: true,
  templateUrl: "./calendar-year-grid.component.html",
  styleUrl: "./calendar-year-grid.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarYearGridComponent {
  readonly pageStart = input.required<number>();
  readonly pageSize = input<number>(12);
  readonly selectedYear = input<Date | null>(null);
  readonly isYearDisabled = input<YearPredicate>(() => false);
  readonly inputDisabled = input<boolean>(false);

  readonly yearSelect = output<Date>();

  private readonly translation = inject(TediTranslationService);

  readonly years = computed<YearEntry[]>(() => {
    const start = this.pageStart();
    const size = this.pageSize();
    const entries: YearEntry[] = [];
    for (let i = 0; i < size; i++) {
      const year = start + i;
      entries.push({ year, yearDate: new Date(year, 0, 1) });
    }
    return entries;
  });

  readonly rows = computed<YearEntry[][]>(() => {
    const entries = this.years();
    const rows: YearEntry[][] = [];
    for (let i = 0; i < entries.length; i += 3) {
      rows.push(entries.slice(i, i + 3));
    }
    return rows;
  });

  readonly gridAriaLabel = computed(() =>
    this.translation.translate("date-picker.choose-year"),
  );

  private readonly today = new Date();

  private yearDate(year: number): Date {
    return new Date(year, 0, 1);
  }

  isSelected(year: number): boolean {
    const selected = this.selectedYear();
    if (!selected) return false;
    return isSameYear(selected, this.yearDate(year));
  }

  isCurrent(year: number): boolean {
    return isSameYear(this.today, this.yearDate(year));
  }

  isDisabled(year: number): boolean {
    if (this.inputDisabled()) return true;
    return this.isYearDisabled()(this.yearDate(year));
  }

  handleClick(year: number): void {
    if (this.isDisabled(year)) return;
    this.yearSelect.emit(this.yearDate(year));
  }
}
