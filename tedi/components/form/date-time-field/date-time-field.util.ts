export type DateTimeFieldAvailableTimes =
  | string[]
  | ((date: Date) => string[])
  | undefined;

export type RangeParts = { from?: Date; to?: Date };
export type DayAvailabilityInput = Date[] | ((d: Date) => boolean) | undefined;
export type MonthPredicate = (month: Date) => boolean;
export type YearPredicate = (year: Date) => boolean;

export const toSingle = (
  value: Date | RangeParts | null | undefined,
): Date | null => (value instanceof Date ? value : null);

export const toRangeParts = (
  value: Date | RangeParts | null | undefined,
): RangeParts => (!value || value instanceof Date ? {} : value);

export const pad = (n: number): string => String(n).padStart(2, "0");

export const getTimeOf = (d: Date | undefined | null): string =>
  d ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : "00:00";

export const combineDateTime = (date: Date, time: string): Date => {
  const [h, m] = time.split(":").map(Number);
  const result = new Date(date);
  result.setHours(Number.isFinite(h) ? h : 0, Number.isFinite(m) ? m : 0, 0, 0);
  return result;
};

export const resolveAvailableTimes = (
  availableTimes: DateTimeFieldAvailableTimes,
  date: Date | null | undefined,
): string[] | undefined => {
  if (!availableTimes) return undefined;
  if (typeof availableTimes === "function") {
    return availableTimes(date ?? new Date());
  }
  return availableTimes;
};

/** Keep `previousTime` if it's still an offered slot (or no slots constrain it); otherwise snap to the first slot. */
const pickTimeForDate = (
  slots: string[] | undefined,
  previousTime: string,
): string =>
  !slots || slots.length === 0 || slots.includes(previousTime)
    ? previousTime
    : slots[0];

/**
 * Combine a fresh calendar selection with the times to keep: each picked date
 * reuses the matching end's current time, snapped to the first available slot
 * when that time isn't offered. Returns `null` for an empty selection.
 */
export function combineCalendarSelection(
  selected: Date | RangeParts | null,
  isRange: boolean,
  current: Date | RangeParts | null,
  availableTimes: DateTimeFieldAvailableTimes,
): Date | RangeParts | null {
  if (isRange) {
    const range = (selected ?? {}) as RangeParts;
    if (!range.from && !range.to) return null;
    const cur = toRangeParts(current);
    const next: RangeParts = {};
    if (range.from) {
      next.from = combineDateTime(
        range.from,
        pickTimeForDate(
          resolveAvailableTimes(availableTimes, range.from),
          getTimeOf(cur.from),
        ),
      );
    }
    if (range.to) {
      next.to = combineDateTime(
        range.to,
        pickTimeForDate(
          resolveAvailableTimes(availableTimes, range.to),
          getTimeOf(cur.to),
        ),
      );
    }
    return next;
  }
  if (selected instanceof Date) {
    return combineDateTime(
      selected,
      pickTimeForDate(
        resolveAvailableTimes(availableTimes, selected),
        getTimeOf(toSingle(current)),
      ),
    );
  }
  return null;
}

/** Apply a new time to one end of a range, preserving the other end. */
export function applyRangeTime(
  kind: "from" | "to",
  time: string,
  current: RangeParts,
  fallbackDate: Date,
): RangeParts {
  const base = current[kind] ?? current.from ?? fallbackDate;
  const combined = combineDateTime(base, time);
  return kind === "from"
    ? { from: combined, to: current.to }
    : { from: current.from ?? combined, to: combined };
}
