import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  ViewEncapsulation,
} from "@angular/core";
import {
  buildMonthGrid,
  DateRange,
  getISOWeek,
  getWeekdayNames,
  isAfterDay,
  isBeforeDay,
  isSameDay,
  isSameMonth,
} from "../../../../utils/date.util";
import { matchAny, Matcher } from "../../../../utils/matchers.util";
import { DateFieldMode } from "../types";

type DayPredicate = (date: Date) => boolean;
type DayAvailabilityInput = Date[] | DayPredicate | undefined;
type CalendarValue = Date | Date[] | DateRange | null;

@Component({
  selector: "tedi-calendar-day-grid",
  standalone: true,
  templateUrl: "./calendar-day-grid.component.html",
  styleUrl: "./calendar-day-grid.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDayGridComponent {
  readonly month = input.required<Date>();
  readonly mode = input<DateFieldMode>("single");
  readonly value = input<CalendarValue>(null);
  readonly localeCode = input<string>("et-EE");
  readonly firstDayOfWeek = input.required<number>();
  readonly showOutsideDays = input<boolean>(true);
  readonly showWeekNumbers = input<boolean>(false);
  readonly disabledMatchers = input<Matcher[]>([]);
  readonly availableDays = input<DayAvailabilityInput>(undefined);
  readonly unavailableDays = input<DayAvailabilityInput>(undefined);
  readonly inputDisabled = input<boolean>(false);

  readonly daySelect = output<Date>();

  readonly hoveredDate = model<Date | null>(null);

  readonly weekdayNames = computed(() =>
    getWeekdayNames(this.localeCode(), "narrow", this.firstDayOfWeek()),
  );

  readonly grid = computed(() =>
    buildMonthGrid(
      this.month(),
      this.firstDayOfWeek(),
      this.showOutsideDays(),
    ),
  );

  private readonly availablePredicate = computed(() =>
    this.toPredicate(this.availableDays()),
  );
  private readonly unavailablePredicate = computed(() =>
    this.toPredicate(this.unavailableDays()),
  );

  private readonly focusableKey = computed(() => {
    const month = this.month();
    const grid = this.grid();
    const today = new Date();
    if (isSameMonth(today, month)) {
      const todayInGrid = this.findInGrid(grid, (d) => isSameDay(d, today));
      if (todayInGrid && !this.isDisabled(todayInGrid)) {
        return this.dayKey(todayInGrid);
      }
    }
    const firstSelectable = this.findInGrid(
      grid,
      (d) => isSameMonth(d, month) && !this.isDisabled(d),
    );
    return firstSelectable ? this.dayKey(firstSelectable) : null;
  });

  cellState(day: Date | null): string {
    if (!day) return "";
    const modifiers: string[] = [];
    this.collectBaseModifiers(day, modifiers);
    this.collectRangeModifiers(day, modifiers);
    this.collectAvailabilityModifiers(day, modifiers);
    if (this.isDisabled(day)) modifiers.push("disabled");
    return [
      "tedi-calendar-day-grid__day",
      ...modifiers.map((m) => `tedi-calendar-day-grid__day--${m}`),
    ].join(" ");
  }

  private collectBaseModifiers(day: Date, modifiers: string[]): void {
    if (!isSameMonth(day, this.month())) modifiers.push("outside");
    if (isSameDay(day, new Date())) modifiers.push("today");
    if (this.isSelected(day)) modifiers.push("selected");
  }

  private collectRangeModifiers(day: Date, modifiers: string[]): void {
    if (this.mode() !== "range") return;
    const range = this.rangeValue();
    if (!range) return;
    if (range.to) {
      this.collectCommittedRangeModifiers(day, range, modifiers);
      return;
    }
    this.collectPreviewRangeModifiers(day, range, modifiers);
  }

  private collectCommittedRangeModifiers(
    day: Date,
    range: DateRange,
    modifiers: string[],
  ): void {
    if (isSameDay(day, range.from)) modifiers.push("range-start");
    if (range.to && isSameDay(day, range.to)) modifiers.push("range-end");
    if (this.isInCommittedRangeMiddle(day, range)) {
      modifiers.push("range-middle");
    }
  }

  private collectPreviewRangeModifiers(
    day: Date,
    range: DateRange,
    modifiers: string[],
  ): void {
    const hovered = this.hoveredDate();
    if (!hovered || isSameDay(hovered, range.from)) {
      if (isSameDay(day, range.from)) modifiers.push("range-start");
      return;
    }
    const hoverIsAfter = isAfterDay(hovered, range.from);
    if (isSameDay(day, range.from)) {
      modifiers.push(hoverIsAfter ? "range-start" : "range-end");
    } else if (isSameDay(day, hovered)) {
      modifiers.push(hoverIsAfter ? "range-preview-end" : "range-preview-start");
    } else if (this.isInPreviewRangeMiddle(day, range)) {
      modifiers.push("range-preview-middle");
    }
  }

  private collectAvailabilityModifiers(day: Date, modifiers: string[]): void {
    if (this.availableDays() !== undefined && this.availablePredicate()(day)) {
      modifiers.push("available-day");
    }
    if (
      this.unavailableDays() !== undefined &&
      this.unavailablePredicate()(day)
    ) {
      modifiers.push("unavailable-day");
    }
  }

  isSelected(day: Date | null): boolean {
    if (!day) return false;
    const value = this.value();
    if (value === null) return false;
    const mode = this.mode();
    if (mode === "single") {
      return value instanceof Date && isSameDay(day, value);
    }
    if (mode === "multiple") {
      return Array.isArray(value) && value.some((d) => isSameDay(d, day));
    }
    if (mode === "range") {
      const range = this.asRange(value);
      if (!range) return false;
      if (isSameDay(day, range.from)) return true;
      if (range.to && isSameDay(day, range.to)) return true;
    }
    return false;
  }

  isDisabled(day: Date | null): boolean {
    if (!day) return true;
    if (this.inputDisabled()) return true;
    if (matchAny(day, this.disabledMatchers())) return true;
    if (
      this.availableDays() !== undefined &&
      !this.availablePredicate()(day)
    ) {
      return true;
    }
    if (
      this.unavailableDays() !== undefined &&
      this.unavailablePredicate()(day)
    ) {
      return true;
    }
    return false;
  }

  isFocusable(day: Date | null): boolean {
    if (!day) return false;
    const key = this.focusableKey();
    return key !== null && this.dayKey(day) === key;
  }

  weekNumber(row: (Date | null)[]): number | null {
    const reference = row.find((d): d is Date => d !== null);
    if (!reference) return null;
    return getISOWeek(reference);
  }

  rowKey(row: (Date | null)[], index: number): number {
    const reference = row.find((d): d is Date => d !== null);
    return reference ? reference.getTime() : index;
  }

  cellKey(day: Date | null, index: number): string {
    return day ? `d-${day.getTime()}` : `e-${index}`;
  }

  handleClick(day: Date | null): void {
    if (!day) return;
    if (this.isDisabled(day)) return;
    this.daySelect.emit(day);
  }

  handleMouseEnter(day: Date | null): void {
    if (!day) return;
    if (this.mode() !== "range") return;
    this.hoveredDate.set(day);
  }

  handleMouseLeave(): void {
    if (this.mode() !== "range") return;
    this.hoveredDate.set(null);
  }

  handleFocus(day: Date | null): void {
    if (!day) return;
    if (this.mode() !== "range") return;
    this.hoveredDate.set(day);
  }

  handleBlur(): void {
    if (this.mode() !== "range") return;
    this.hoveredDate.set(null);
  }

  private toPredicate(input: DayAvailabilityInput): DayPredicate {
    if (input === undefined) return () => false;
    if (typeof input === "function") return input;
    return (d: Date) => input.some((entry) => isSameDay(entry, d));
  }

  private rangeValue(): DateRange | null {
    if (this.mode() !== "range") return null;
    return this.asRange(this.value());
  }

  private asRange(value: CalendarValue): DateRange | null {
    if (value && !Array.isArray(value) && !(value instanceof Date)) {
      return value;
    }
    return null;
  }

  private isInCommittedRangeMiddle(day: Date, range: DateRange): boolean {
    if (!range.to) return false;
    const [start, end] = this.orderedRange(range.from, range.to);
    return isAfterDay(day, start) && isBeforeDay(day, end);
  }

  private isInPreviewRangeMiddle(day: Date, range: DateRange): boolean {
    if (range.to) return false;
    const hovered = this.hoveredDate();
    if (!hovered) return false;
    if (isSameDay(hovered, range.from)) return false;
    const [start, end] = this.orderedRange(range.from, hovered);
    return isAfterDay(day, start) && isBeforeDay(day, end);
  }

  private isPreviewRangeEnd(day: Date, range: DateRange): boolean {
    if (range.to) return false;
    const hovered = this.hoveredDate();
    if (!hovered) return false;
    if (isSameDay(hovered, range.from)) return false;
    return isSameDay(day, hovered);
  }

  private orderedRange(a: Date, b: Date): [Date, Date] {
    return isBeforeDay(a, b) ? [a, b] : [b, a];
  }

  private findInGrid(
    grid: (Date | null)[][],
    predicate: (day: Date) => boolean,
  ): Date | null {
    for (const row of grid) {
      for (const cell of row) {
        if (cell && predicate(cell)) return cell;
      }
    }
    return null;
  }

  private dayKey(day: Date): number {
    return new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
    ).getTime();
  }
}
