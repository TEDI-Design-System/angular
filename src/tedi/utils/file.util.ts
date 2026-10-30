import type { Language } from "../services/translation/translation.service";

const BYTES_IN_KB = 1024;

const BYTES_IN_MB = BYTES_IN_KB ** 2;
const BYTES_IN_GB = BYTES_IN_KB ** 3;

const unitFor = (bytes: number): [value: number, unit: string] => {
  if (bytes < BYTES_IN_KB) return [bytes, "byte"];
  if (bytes < BYTES_IN_MB) return [bytes / BYTES_IN_KB, "kilobyte"];
  if (bytes < BYTES_IN_GB) return [bytes / BYTES_IN_MB, "megabyte"];

  return [bytes / BYTES_IN_GB, "gigabyte"];
};

/**
 * Formats a byte count the way the language writes it — `"0,9 MB"` in Estonian,
 * `"0,9 МБ"` in Russian, `"0.9 MB"` in English.
 *
 * Magnitudes stay binary, so a kilobyte is 1024 bytes while the unit reads
 * `kB`. That errs on the forgiving side: a file every file manager calls 1 MB
 * passes a limit shown as 1 MB, whichever convention the manager follows.
 *
 * Pass the language from `TediTranslationService.getLanguage()`. It falls back
 * to Estonian, matching the translation service's own fallback.
 */
export function formatFileSize(bytes: number, lang: Language = "et"): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";

  const [value, unit] = unitFor(bytes);

  return new Intl.NumberFormat(lang, {
    style: "unit",
    unit,
    unitDisplay: "short",
    maximumFractionDigits: 1,
  }).format(value);
}
