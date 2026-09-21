/** Horizontal gap (px) between tags in a single row. */
export const TAG_GAP = 8;
/** Reserved width (px) for the "+N" counter tag. */
export const COUNTER_TAG_WIDTH = 40;

export interface TagOverflowOptions {
  /** Gap between adjacent tags. Defaults to {@link TAG_GAP}. */
  gap?: number;
  /** Width reserved for the "+N" counter tag. Defaults to {@link COUNTER_TAG_WIDTH}. */
  counterWidth?: number;
}

/**
 * Given the measured widths of single-row tags and the available width, returns
 * how many tags fit before the overflow collapses into a "+N" counter.
 *
 * Space for the counter is reserved while more tags remain, so the counter
 * stays visible. At least one tag is always shown when any exist, even if it
 * overflows on its own.
 */
export function calculateVisibleTagCount(
  tagWidths: readonly number[],
  availableWidth: number,
  { gap = TAG_GAP, counterWidth = COUNTER_TAG_WIDTH }: TagOverflowOptions = {},
): number {
  if (tagWidths.length === 0 || availableWidth <= 0) return 0;

  let used = 0;
  let visible = 0;
  for (let i = 0; i < tagWidths.length; i++) {
    const needed = used + tagWidths[i] + (visible > 0 ? gap : 0);
    const hasMore = i < tagWidths.length - 1;
    const reserved = hasMore ? counterWidth + gap : 0;
    if (needed + reserved <= availableWidth) {
      used = needed;
      visible++;
    } else {
      break;
    }
  }

  return visible === 0 ? 1 : visible;
}
