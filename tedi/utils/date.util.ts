/**
 * Formats a Date object to dd.MM.yyyy string format.
 */
export function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  return `${d}.${m}.${y}`;
}

/**
 * Parses a dd.MM.yyyy string to a Date object.
 * Returns null if the string is invalid.
 */
export function parseDate(str: string): Date | null {
  const parts = str.trim().split(".");
  if (parts.length !== 3) return null;

  const [dd, mm, yyyy] = parts.map(Number);
  if (!dd || !mm || !yyyy) return null;

  const date = new Date(yyyy, mm - 1, dd);

  if (
    date.getFullYear() !== yyyy ||
    date.getMonth() !== mm - 1 ||
    date.getDate() !== dd
  ) {
    return null;
  }

  return date;
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
 * Checks if date a is before date b.
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
 * Checks if date a is after date b.
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
