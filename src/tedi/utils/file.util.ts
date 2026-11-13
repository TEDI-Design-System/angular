const BYTES_IN_KB = 1024;

const BYTES_IN_MB = BYTES_IN_KB ** 2;
const BYTES_IN_GB = BYTES_IN_KB ** 3;

const round = (value: number): string => value.toFixed(1).replace(/\.0$/, "");

/**
 * Formats a byte count as a human-readable size string (`"0.9 MB"`).
 */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < BYTES_IN_KB) return `${bytes} B`;
  if (bytes < BYTES_IN_MB) return `${round(bytes / BYTES_IN_KB)} KB`;
  if (bytes < BYTES_IN_GB) return `${round(bytes / BYTES_IN_MB)} MB`;

  return `${round(bytes / BYTES_IN_GB)} GB`;
}
