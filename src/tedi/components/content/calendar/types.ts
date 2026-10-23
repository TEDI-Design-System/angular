export type { DateRange } from "../../../utils/date.util";
export type CalendarView = "days" | "months" | "years";
export type DateFieldMode = "single" | "multiple" | "range";

/**
 * Whitelist/blacklist of days — an explicit `Date[]` or a predicate. Shared by
 * Calendar and the fields that wrap it, so consumers get one type back from the
 * entry point rather than three structurally identical copies.
 */
export type DayPredicate = (date: Date) => boolean;
export type DayAvailabilityInput = Date[] | DayPredicate | undefined;
export type MonthPredicate = (month: Date) => boolean;
export type YearPredicate = (year: Date) => boolean;
