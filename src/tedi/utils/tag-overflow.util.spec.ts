import {
  calculateVisibleTagCount,
  COUNTER_TAG_WIDTH,
  TAG_GAP,
} from "./tag-overflow.util";

describe("calculateVisibleTagCount", () => {
  it("returns 0 when there are no tags", () => {
    expect(calculateVisibleTagCount([], 500)).toBe(0);
  });

  it("returns 0 when available width is non-positive", () => {
    expect(calculateVisibleTagCount([50, 50], 0)).toBe(0);
    expect(calculateVisibleTagCount([50, 50], -10)).toBe(0);
  });

  it("shows all tags when they fit (no counter reserved on the last one)", () => {
    // [60] + gap + [60] = 128, fits within 200
    expect(calculateVisibleTagCount([60, 60], 200)).toBe(2);
  });

  it("reserves counter width while more tags remain", () => {
    // First tag 60. Second would need 60 + gap(8) + counter(40) + gap(8) = 176,
    // used 60 -> total 176 > 150, so only the first fits.
    expect(calculateVisibleTagCount([60, 60, 60], 150)).toBe(1);
  });

  it("does not reserve counter space for the final tag", () => {
    // Two tags: 60 + gap(8) + 60 = 128 <= 130, both fit since none remain after.
    expect(calculateVisibleTagCount([60, 60], 130)).toBe(2);
  });

  it("always shows at least one tag even if it overflows", () => {
    expect(calculateVisibleTagCount([500], 100)).toBe(1);
    expect(calculateVisibleTagCount([500, 500], 100)).toBe(1);
  });

  it("honours custom gap and counter width", () => {
    // gap 0, counter 0: pure widths. 50 + 50 + 50 = 150 fits in 150.
    expect(
      calculateVisibleTagCount([50, 50, 50], 150, { gap: 0, counterWidth: 0 }),
    ).toBe(3);
  });

  it("exposes the default constants", () => {
    expect(TAG_GAP).toBe(8);
    expect(COUNTER_TAG_WIDTH).toBe(40);
  });
});
