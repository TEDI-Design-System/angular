import {
  DateRange,
  isAfterDay,
  isBeforeDay,
  isDateInRange,
  isSameDay,
} from "./date.util";

export type DateBefore = { before: Date };
export type DateAfter = { after: Date };
export type DateInterval = { before: Date; after: Date };
export type DayOfWeek = { dayOfWeek: number[] };

export type Matcher =
  | boolean
  | Date
  | Date[]
  | DateBefore
  | DateAfter
  | DateInterval
  | DateRange
  | DayOfWeek
  | ((date: Date) => boolean);

function isDate(value: unknown): value is Date {
  return value instanceof Date;
}

function isDateArray(value: unknown): value is Date[] {
  return Array.isArray(value) && value.every(isDate);
}

function isDateInterval(value: object): value is DateInterval {
  return (
    "before" in value &&
    "after" in value &&
    isDate((value as { before: unknown }).before) &&
    isDate((value as { after: unknown }).after)
  );
}

function isDateBefore(value: object): value is DateBefore {
  return (
    "before" in value &&
    !("after" in value) &&
    isDate((value as { before: unknown }).before)
  );
}

function isDateAfter(value: object): value is DateAfter {
  return (
    "after" in value &&
    !("before" in value) &&
    isDate((value as { after: unknown }).after)
  );
}

function isDateRange(value: object): value is DateRange {
  if (!("from" in value)) return false;
  const from = (value as { from: unknown }).from;
  if (!isDate(from)) return false;
  if ("to" in value) {
    const to = (value as { to: unknown }).to;
    return to === undefined || isDate(to);
  }
  return true;
}

function isDayOfWeek(value: object): value is DayOfWeek {
  return (
    "dayOfWeek" in value &&
    Array.isArray((value as { dayOfWeek: unknown }).dayOfWeek) &&
    (value as { dayOfWeek: unknown[] }).dayOfWeek.every(
      (n) => typeof n === "number",
    )
  );
}

function matchObjectMatcher(
  date: Date,
  matcher: DateBefore | DateAfter | DateInterval | DateRange | DayOfWeek,
): boolean {
  if (isDateInterval(matcher)) {
    return (
      !isAfterDay(date, matcher.after) || !isBeforeDay(date, matcher.before)
    );
  }
  if (isDateBefore(matcher)) return isBeforeDay(date, matcher.before);
  if (isDateAfter(matcher)) return isAfterDay(date, matcher.after);
  if (isDayOfWeek(matcher)) return matcher.dayOfWeek.includes(date.getDay());
  if (isDateRange(matcher)) return matchDateRange(date, matcher);
  return false;
}

function matchDateRange(date: Date, range: DateRange): boolean {
  return isDateInRange(date, range);
}

/**
 * Returns whether `date` matches the given matcher.
 *
 * Semantics mirror react-day-picker:
 * - `boolean` — returned as-is.
 * - `Date` — true if same day.
 * - `Date[]` — true if any entry is the same day.
 * - `{ before }` — true if date is strictly before `before` (day-level).
 * - `{ after }` — true if date is strictly after `after` (day-level).
 * - `{ before, after }` — true if date is OUTSIDE the interval `(after, before)`
 *   (i.e. `date <= after || date >= before`, day-level).
 * - `{ from, to? }` — true if date is within `[from, to]` inclusive (day-level).
 *   If `to` is omitted, only `from` matters.
 * - `{ dayOfWeek }` — true if `date.getDay()` is in the array.
 * - function — called with the date.
 */
export function matchDate(date: Date, matcher: Matcher): boolean {
  if (typeof matcher === "boolean") return matcher;
  if (typeof matcher === "function") return matcher(date);
  if (isDate(matcher)) return isSameDay(date, matcher);
  if (isDateArray(matcher)) return matcher.some((d) => isSameDay(date, d));
  if (typeof matcher === "object" && matcher !== null) {
    return matchObjectMatcher(date, matcher);
  }
  return false;
}

/**
 * Returns true if any matcher in the list matches the given date.
 * An empty array returns false.
 */
export function matchAny(date: Date, matchers: Matcher[]): boolean {
  return matchers.some((m) => matchDate(date, m));
}
