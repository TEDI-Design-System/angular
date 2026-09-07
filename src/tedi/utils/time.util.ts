/**
 * Checks if a string is a valid `HH:mm` time (00:00 – 23:59).
 */
export function isValidTime(time: string | null | undefined): boolean {
  if (!time) return false;
  return /^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(time.trim());
}

/**
 * Normalizes common typing patterns into `HH:mm`.
 *
 * Returns:
 *   - the canonical `HH:mm` string when the input can be normalized
 *   - `""` when the input is empty
 *   - `null` when the input is non-empty but cannot be normalized
 *
 * Examples:
 *   `"9:5"`              → `"09:05"`
 *   `"14:5"`             → `"14:05"`
 *   `"2359"`             → `"23:59"`
 *   `"930"`              → `"09:30"`
 *   `"11.55"` / `"11-55"` → `"11:55"` (any non-digit treated as separator)
 *   `"4:89"` / `"24:00"`  → `null`
 */
export function normalizeTime(input: string): string | null {
  const cleaned = input.trim();
  if (!cleaned) return "";

  if (isValidTime(cleaned)) return cleaned;

  if (cleaned.includes(":")) {
    const [hPart, mPart] = cleaned.split(":");
    const hour = parseInt(hPart, 10);
    const min = parseInt(mPart, 10);
    if (
      !isNaN(hour) &&
      !isNaN(min) &&
      hour >= 0 &&
      hour <= 23 &&
      min >= 0 &&
      min <= 59
    ) {
      return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    }
    return null;
  }

  const digitsOnly = cleaned.replace(/[^0-9]/g, "");
  if (digitsOnly.length === 3) {
    const candidate = `${digitsOnly.slice(0, 1).padStart(2, "0")}:${digitsOnly.slice(1)}`;
    return isValidTime(candidate) ? candidate : null;
  }
  if (digitsOnly.length === 4) {
    const candidate = `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2)}`;
    return isValidTime(candidate) ? candidate : null;
  }

  return null;
}
