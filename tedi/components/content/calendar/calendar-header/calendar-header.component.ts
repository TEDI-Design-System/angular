import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  ViewEncapsulation,
} from "@angular/core";
import { ButtonComponent } from "../../../buttons/button/button.component";
import { IconComponent } from "../../../base/icon/icon.component";
import { DropdownComponent } from "../../../overlay/dropdown/dropdown.component";
import { DropdownTriggerDirective } from "../../../overlay/dropdown/dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "../../../overlay/dropdown/dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../../../overlay/dropdown/dropdown-item/dropdown-item.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import {
  addMonths,
  addYears,
  getDaysInMonth,
  getMonthNames,
  startOfMonth,
} from "../../../../utils/date.util";
import { matchAny, Matcher } from "../../../../utils/matchers.util";
import { CalendarView } from "../types";

type MonthYearSelectType = "dropdown" | "grid";
type MonthPredicate = (month: Date) => boolean;
type YearPredicate = (year: Date) => boolean;

type MonthOption = { index: number; label: string; disabled: boolean };
type YearOption = { year: number; disabled: boolean };

@Component({
  selector: "tedi-calendar-header",
  standalone: true,
  templateUrl: "./calendar-header.component.html",
  styleUrl: "./calendar-header.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    IconComponent,
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemComponent,
  ],
})
export class CalendarHeaderComponent {
  readonly currentMonth = input.required<Date>();
  readonly view = input.required<CalendarView>();
  readonly localeCode = input<string>("et-EE");
  readonly showNavigation = input<boolean>(true);
  readonly monthYearSelectType = input<MonthYearSelectType>("dropdown");
  readonly disabledMatchers = input<Matcher[]>([]);
  readonly isMonthDisabled = input<MonthPredicate>(() => false);
  readonly isYearDisabled = input<YearPredicate>(() => false);
  readonly minYear = input<number>(new Date().getFullYear() - 100);
  readonly maxYear = input<number>(new Date().getFullYear() + 100);
  readonly yearPageStart = input<number | null>(null);
  readonly yearPageSize = input<number>(12);
  readonly numberOfMonths = input<number>(1);
  readonly inputDisabled = input<boolean>(false);

  readonly prevClick = output<void>();
  readonly nextClick = output<void>();
  readonly monthChange = output<Date>();
  readonly yearChange = output<Date>();
  readonly viewChange = output<CalendarView>();

  readonly translationService = inject(TediTranslationService);

  readonly monthNames = computed(() =>
    getMonthNames(this.localeCode(), "long"),
  );

  readonly resolvedYearPageStart = computed(() => {
    const explicit = this.yearPageStart();
    if (explicit !== null) return explicit;
    return this.currentMonth().getFullYear() - 5;
  });

  readonly yearRangeEnd = computed(
    () => this.resolvedYearPageStart() + this.yearPageSize() - 1,
  );

  readonly yearRangeLabel = computed(
    () => `${this.resolvedYearPageStart()}-${this.yearRangeEnd()}`,
  );

  readonly currentYear = computed(() => this.currentMonth().getFullYear());

  readonly currentMonthIndex = computed(() => this.currentMonth().getMonth());

  readonly currentMonthLabel = computed(() => {
    const names = this.monthNames();
    return names[this.currentMonthIndex()] ?? "";
  });

  readonly monthOptions = computed<MonthOption[]>(() => {
    const year = this.currentYear();
    const names = this.monthNames();
    return names.map((label, index) => ({
      index,
      label,
      disabled: this.isMonthFullyDisabled(new Date(year, index, 1)),
    }));
  });

  readonly yearOptions = computed<YearOption[]>(() => {
    const min = this.minYear();
    const max = this.maxYear();
    const result: YearOption[] = [];
    for (let year = min; year <= max; year++) {
      result.push({
        year,
        disabled: this.isYearFullyDisabled(year),
      });
    }
    return result;
  });

  readonly prevDisabled = computed(() => {
    if (this.inputDisabled()) return true;
    const view = this.view();
    if (view === "days") {
      const prev = addMonths(this.currentMonth(), -1);
      return this.isMonthFullyDisabled(prev);
    }
    if (view === "months") {
      const prev = addYears(this.currentMonth(), -1);
      return this.isYearFullyDisabled(prev.getFullYear());
    }
    return this.resolvedYearPageStart() - this.yearPageSize() < this.minYear();
  });

  readonly nextDisabled = computed(() => {
    if (this.inputDisabled()) return true;
    const view = this.view();
    if (view === "days") {
      const next = addMonths(this.currentMonth(), this.numberOfMonths());
      return this.isMonthFullyDisabled(next);
    }
    if (view === "months") {
      const next = addYears(this.currentMonth(), 1);
      return this.isYearFullyDisabled(next.getFullYear());
    }
    return this.yearRangeEnd() + 1 > this.maxYear();
  });

  readonly prevAriaLabel = computed(() => {
    const view = this.view();
    if (view === "years") {
      return this.translationService.translate("date-picker.previous-years");
    }
    return this.translationService.translate("date-picker.go-prev-month");
  });

  readonly nextAriaLabel = computed(() => {
    const view = this.view();
    if (view === "years") {
      return this.translationService.translate("date-picker.next-years");
    }
    return this.translationService.translate("date-picker.go-next-month");
  });

  readonly selectMonthLabel = computed(() =>
    this.translationService.translate("date-picker.select-month"),
  );

  readonly selectYearLabel = computed(() =>
    this.translationService.translate("date-picker.select-year"),
  );

  handlePrev(): void {
    if (this.prevDisabled()) return;
    this.prevClick.emit();
  }

  handleNext(): void {
    if (this.nextDisabled()) return;
    this.nextClick.emit();
  }

  handleMonthSelect(value?: string): void {
    if (!value) return;
    const index = Number(value);
    if (!Number.isFinite(index)) return;
    const next = new Date(this.currentYear(), index, 1);
    this.monthChange.emit(startOfMonth(next));
  }

  handleYearSelect(value?: string): void {
    if (!value) return;
    const year = Number(value);
    if (!Number.isFinite(year)) return;
    this.yearChange.emit(new Date(year, 0, 1));
  }

  handleMonthLabelClick(): void {
    if (this.inputDisabled()) return;
    this.viewChange.emit("months");
  }

  handleYearLabelClick(): void {
    if (this.inputDisabled()) return;
    this.viewChange.emit("years");
  }

  private isMonthFullyDisabled(month: Date): boolean {
    if (this.isMonthDisabled()(month)) return true;
    const matchers = this.disabledMatchers();
    if (matchers.length === 0) return false;
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const days = getDaysInMonth(year, monthIndex);
    for (let day = 1; day <= days; day++) {
      if (!matchAny(new Date(year, monthIndex, day), matchers)) {
        return false;
      }
    }
    return true;
  }

  private isYearFullyDisabled(year: number): boolean {
    const yearStart = new Date(year, 0, 1);
    if (this.isYearDisabled()(yearStart)) return true;
    for (let month = 0; month < 12; month++) {
      if (!this.isMonthFullyDisabled(new Date(year, month, 1))) {
        return false;
      }
    }
    return true;
  }
}
