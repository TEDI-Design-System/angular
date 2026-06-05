/**
 * A date range with an inclusive start (`from`) and optional inclusive end (`to`).
 * When `to` is undefined the range degenerates to the single day `from`.
 */
export type DateRange = { from: Date; to?: Date };

/**
 * Formats a Date object to dd.MM.yyyy string format.
 *
 * Thin wrapper around `formatLocaleDate(date, 'et-EE')` kept for back-compat.
 * New code should call `formatLocaleDate` directly with the desired locale.
 */
export function formatDate(date: Date): string {
  return formatLocaleDate(date, "et-EE");
}

/**
 * Parses a dd.MM.yyyy string to a Date object.
 * Returns null if the string is invalid.
 *
 * Thin wrapper around `parseLocaleDate(str, 'et-EE')` kept for back-compat.
 * Note: `parseLocaleDate` returns `Date | undefined`; this wrapper normalizes
 * undefined to null so existing callers asserting `=== null` still work.
 */
export function parseDate(str: string): Date | null {
  return parseLocaleDate(str, "et-EE") ?? null;
}

/**
 * Checks if two dates represent the same calendar day.
 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

/**
 * Checks if date a is before date b (day-level, time ignored).
 */
export function isBeforeDay(a: Date, b: Date): boolean {
  if (a.getFullYear() !== b.getFullYear()) {
    return a.getFullYear() < b.getFullYear();
  }
  if (a.getMonth() !== b.getMonth()) {
    return a.getMonth() < b.getMonth();
  }
  return a.getDate() < b.getDate();
}

/**
 * Checks if date a is after date b (day-level, time ignored).
 */
export function isAfterDay(a: Date, b: Date): boolean {
  if (a.getFullYear() !== b.getFullYear()) {
    return a.getFullYear() > b.getFullYear();
  }
  if (a.getMonth() !== b.getMonth()) {
    return a.getMonth() > b.getMonth();
  }
  return a.getDate() > b.getDate();
}

/**
 * Returns the ISO week number for a given date.
 */
export function getISOWeek(date: Date): number {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const day = target.getDay();
  const isoDay = day === 0 ? 7 : day;

  target.setDate(target.getDate() + (4 - isoDay));
  const yearStart = new Date(target.getFullYear(), 0, 1);

  const diffInDays = Math.floor(
    (target.getTime() - yearStart.getTime()) / 86400000,
  );
  return Math.floor(diffInDays / 7) + 1;
}

/**
 * Returns a new Date offset by `n` days from `date`. `n` may be negative.
 */
export function addDays(date: Date, n: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + n);
  return result;
}

/**
 * Returns a new Date offset by `n` months from `date`. Clamps the day to the
 * last day of the target month (e.g. Jan 31 + 1 month → Feb 28/29).
 */
export function addMonths(date: Date, n: number): Date {
  const targetYear = date.getFullYear();
  const targetMonthRaw = date.getMonth() + n;
  const targetMonth = ((targetMonthRaw % 12) + 12) % 12;
  const yearOffset = Math.floor(targetMonthRaw / 12);
  const year = targetYear + yearOffset;
  const day = Math.min(date.getDate(), getDaysInMonth(year, targetMonth));
  const result = new Date(date);
  result.setFullYear(year, targetMonth, day);
  return result;
}

/**
 * Returns a new Date offset by `n` years from `date`. Clamps Feb 29 to Feb 28
 * in non-leap target years.
 */
export function addYears(date: Date, n: number): Date {
  const targetYear = date.getFullYear() + n;
  const month = date.getMonth();
  const day = Math.min(date.getDate(), getDaysInMonth(targetYear, month));
  const result = new Date(date);
  result.setFullYear(targetYear, month, day);
  return result;
}

/**
 * Returns the first day of the month for `date` at 00:00 local time.
 */
export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Returns the last day of the month for `date` at 00:00 local time.
 */
export function endOfMonth(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    getDaysInMonth(date.getFullYear(), date.getMonth()),
  );
}

/**
 * Returns the first day of the week containing `date`, given a locale's
 * first day of week (0=Sun..6=Sat).
 */
export function startOfWeek(date: Date, firstDayOfWeek: number): Date {
  const result = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (result.getDay() - firstDayOfWeek + 7) % 7;
  result.setDate(result.getDate() - offset);
  return result;
}

/**
 * Returns the number of days in the given month/year. `monthIndex` is 0-based.
 */
export function getDaysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * Checks if two dates fall in the same calendar month and year.
 */
export function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

/**
 * Checks if two dates fall in the same calendar year.
 */
export function isSameYear(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear();
}

type WeekInfo = { firstDay: number };
type LocaleWithWeekInfo = {
  weekInfo?: WeekInfo;
  getWeekInfo?: () => WeekInfo;
};

/**
 * Returns the locale's first day of week as a JS day index (0=Sun..6=Sat).
 *
 * Reads `Intl.Locale(localeCode).getWeekInfo()` when available, falling back
 * to 1 (Monday) when unavailable. Intl returns 1-7 (1=Mon..7=Sun); this
 * function converts to JS's 0-6 convention.
 */
export function getFirstDayOfWeek(localeCode: string): number {
  try {
    const locale = new Intl.Locale(localeCode) as Intl.Locale &
      LocaleWithWeekInfo;
    const info = locale.getWeekInfo?.() ?? locale.weekInfo;
    if (info && typeof info.firstDay === "number") {
      return info.firstDay === 7 ? 0 : info.firstDay;
    }
  } catch {
    // ignore — fall through to default
  }
  return 1;
}

/**
 * Returns 12 month names (January..December) in the requested locale and format.
 */
export function getMonthNames(
  localeCode: string,
  format: "long" | "short",
): string[] {
  const fmt = new Intl.DateTimeFormat(localeCode, { month: format });
  const names: string[] = [];
  for (let i = 0; i < 12; i++) {
    names.push(fmt.format(new Date(2021, i, 1)));
  }
  return names;
}

/**
 * Returns 7 weekday names starting at `firstDayOfWeek` (0=Sun..6=Sat) in the
 * requested locale and format.
 */
export function getWeekdayNames(
  localeCode: string,
  format: "long" | "short" | "narrow",
  firstDayOfWeek: number,
): string[] {
  const fmt = new Intl.DateTimeFormat(localeCode, { weekday: format });
  // 2021-08-01 was a Sunday → adding `i` days gives weekday `i` (0..6).
  const sunday = new Date(2021, 7, 1);
  const names: string[] = [];
  for (let i = 0; i < 7; i++) {
    const dayIndex = (firstDayOfWeek + i) % 7;
    const reference = new Date(sunday);
    reference.setDate(sunday.getDate() + dayIndex);
    names.push(fmt.format(reference));
  }
  return names;
}

/**
 * Formats a Date according to the given locale's short numeric form.
 * For `et-EE` produces `dd.MM.yyyy`; for `en-US` `MM/dd/yyyy`; for `en-GB`
 * `dd/MM/yyyy`; etc.
 */
export function formatLocaleDate(date: Date, localeCode: string): string {
  const fmt = new Intl.DateTimeFormat(localeCode, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(date);
}

/**
 * Formats a Date as a long-form, locale-aware string suitable for
 * `aria-label` use — e.g. for `en-US` produces "Friday, May 16, 2026" and for
 * `et-EE` "reede, 16. mai 2026". Matches react-day-picker's `labelDay` shape.
 */
export function formatLocaleDateLong(
  date: Date,
  localeCode: string,
): string {
  const fmt = new Intl.DateTimeFormat(localeCode, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return fmt.format(date);
}

/**
 * Formats a Date as a locale-aware "Month Year" string — e.g. "May 2026" for
 * `en-US` and "mai 2026" for `et-EE`. Used as the aria-label for the day
 * grid and inside the calendar header's aria-live region so screen readers
 * announce the visible month/year on navigation.
 */
export function formatMonthYear(date: Date, localeCode: string): string {
  const fmt = new Intl.DateTimeFormat(localeCode, {
    year: "numeric",
    month: "long",
  });
  return fmt.format(date);
}

type DateFieldName = "day" | "month" | "year";

function isDateFieldType(type: string): type is DateFieldName {
  return type === "day" || type === "month" || type === "year";
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type LocalePattern = { order: DateFieldName[]; regex: RegExp };

const FIELD_HINT_TOKENS: Record<string, Record<DateFieldName, string>> = {
  et: { day: "pp", month: "kk", year: "aaaa" },
  en: { day: "dd", month: "mm", year: "yyyy" },
  ru: { day: "дд", month: "мм", year: "гггг" },
};

/**
 * Builds a locale-aware manual-entry hint such as `pp.kk.aaaa` (et-EE),
 * `dd.mm.yyyy` (en) or `дд.мм.гггг` (ru). Field order and separators are
 * derived from `Intl.DateTimeFormat` (so they always match what the field
 * formats and parses), while the letter tokens are localized per language.
 * Falls back to English tokens for unknown languages.
 */
export function formatLocaleDateHint(localeCode: string): string {
  const fmt = new Intl.DateTimeFormat(localeCode, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date(2024, 0, 2));
  const lang = localeCode.split("-")[0].toLowerCase();
  const tokens = FIELD_HINT_TOKENS[lang] ?? FIELD_HINT_TOKENS["en"];
  let hint = "";
  for (const part of parts) {
    hint += isDateFieldType(part.type) ? tokens[part.type] : part.value;
  }
  return hint;
}

const FIELD_DIGIT_RANGE: Record<DateFieldName, string> = {
  day: "\\d{1,2}",
  month: "\\d{1,2}",
  // Year accepts 2 or 4 digits; 3-digit years (e.g. 100) are invalid input.
  year: "(?:\\d{2}|\\d{4})",
};

function buildLocalePattern(localeCode: string): LocalePattern | undefined {
  const fmt = new Intl.DateTimeFormat(localeCode, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date(2024, 0, 2));
  const order: DateFieldName[] = [];
  let pattern = "";
  for (const part of parts) {
    if (isDateFieldType(part.type)) {
      order.push(part.type);
      pattern += `(${FIELD_DIGIT_RANGE[part.type]})`;
    } else {
      pattern += escapeRegExp(part.value);
    }
  }
  if (order.length !== 3) return undefined;
  return { order, regex: new RegExp(`^${pattern}$`) };
}

function extractFields(
  match: RegExpMatchArray,
  order: DateFieldName[],
): { year: number; month: number; day: number } | undefined {
  let year = 0;
  let month = 0;
  let day = 0;
  for (let i = 0; i < order.length; i++) {
    const num = Number(match[i + 1]);
    if (!Number.isFinite(num)) return undefined;
    if (order[i] === "year") year = num;
    else if (order[i] === "month") month = num;
    else day = num;
  }
  return { year, month, day };
}

function buildValidatedDate(
  year: number,
  month: number,
  day: number,
): Date | undefined {
  if (year < 1 || month < 1 || month > 12 || day < 1 || day > 31) {
    return undefined;
  }
  const date = new Date(year, month - 1, day);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  return date;
}

/**
 * Parses a locale-formatted date string back into a Date.
 *
 * Algorithm (mirrors React's defaultParseDate):
 *   1. Format a reference date with distinct y/m/d digits via Intl.DateTimeFormat.
 *   2. Walk `formatToParts` to discover the field order and the literal
 *      separators the locale uses.
 *   3. Build a regex from that ordering using field-aware digit ranges
 *      (day/month: 1-2 digits, year: 2 or 4 digits) and the actual escaped
 *      separators. 3-digit years are rejected.
 *   4. Match the (trimmed) input; reject if no match.
 *   5. Validate ranges and check the constructed Date round-trips (so e.g.
 *      Feb 30 is rejected).
 *
 * Returns `undefined` on any failure — silent, caller decides UX.
 */
export function parseLocaleDate(
  value: string,
  localeCode: string,
): Date | undefined {
  const input = value.trim();
  if (!input) return undefined;

  const pattern = buildLocalePattern(localeCode);
  if (!pattern) return undefined;

  const match = input.match(pattern.regex);
  if (!match) return undefined;

  const fields = extractFields(match, pattern.order);
  if (!fields) return undefined;

  return buildValidatedDate(fields.year, fields.month, fields.day);
}

/**
 * Returns true if `date` falls within the inclusive `[from, to]` range
 * (day-level). When `to` is undefined, only `from` matters (same-day check).
 */
export function isDateInRange(date: Date, range: DateRange): boolean {
  if (range.to === undefined) {
    return isSameDay(date, range.from);
  }
  const start = isBeforeDay(range.from, range.to) ? range.from : range.to;
  const end = isBeforeDay(range.from, range.to) ? range.to : range.from;
  return !isBeforeDay(date, start) && !isAfterDay(date, end);
}

/**
 * Toggles a date in an array of dates (day-level). If a same-day entry exists
 * it is removed; otherwise the date is appended. Returns a new array.
 */
export function toggleDateInArray(dates: Date[], date: Date): Date[] {
  const index = dates.findIndex((d) => isSameDay(d, date));
  if (index >= 0) {
    return dates.slice(0, index).concat(dates.slice(index + 1));
  }
  return [...dates, date];
}

/**
 * Builds a 6×7 grid of Date cells for the calendar day view.
 *
 * - The first weekday of the month is found, then we walk back to
 *   `firstDayOfWeek` to fill leading cells.
 * - Cells outside the current month are real Date objects when
 *   `showOutsideDays` is true, otherwise `null`.
 * - Always returns 6 rows × 7 cells (42 cells total).
 */
export function buildMonthGrid(
  month: Date,
  firstDayOfWeek: number,
  showOutsideDays: boolean,
): (Date | null)[][] {
  const monthStart = startOfMonth(month);
  const gridStart = startOfWeek(monthStart, firstDayOfWeek);
  const rows: (Date | null)[][] = [];
  for (let row = 0; row < 6; row++) {
    const cells: (Date | null)[] = [];
    for (let col = 0; col < 7; col++) {
      const cell = addDays(gridStart, row * 7 + col);
      if (isSameMonth(cell, month)) {
        cells.push(cell);
      } else {
        cells.push(showOutsideDays ? cell : null);
      }
    }
    rows.push(cells);
  }
  return rows;
}
