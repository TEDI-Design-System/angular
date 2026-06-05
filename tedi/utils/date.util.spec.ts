import {
  addDays,
  addMonths,
  addYears,
  buildMonthGrid,
  endOfMonth,
  formatDate,
  formatLocaleDate,
  formatLocaleDateHint,
  getDaysInMonth,
  getFirstDayOfWeek,
  getISOWeek,
  getMonthNames,
  getWeekdayNames,
  isAfterDay,
  isBeforeDay,
  isDateInRange,
  isSameDay,
  isSameMonth,
  isSameYear,
  parseDate,
  parseLocaleDate,
  startOfMonth,
  startOfWeek,
  toggleDateInArray,
} from "./date.util";

describe("date.util", () => {
  describe("formatDate", () => {
    it("should format date as dd.MM.yyyy", () => {
      expect(formatDate(new Date(2026, 2, 10))).toBe("10.03.2026");
    });

    it("should pad single digit day and month with zero", () => {
      expect(formatDate(new Date(2026, 0, 5))).toBe("05.01.2026");
    });
  });

  describe("formatLocaleDateHint", () => {
    it("builds an Estonian hint with localized tokens and locale separators", () => {
      expect(formatLocaleDateHint("et-EE")).toBe("pp.kk.aaaa");
    });

    it("falls back to English tokens for an unknown language", () => {
      const hint = formatLocaleDateHint("xx-XX");
      expect(hint).toContain("dd");
      expect(hint).toContain("mm");
      expect(hint).toContain("yyyy");
    });
  });

  describe("parseDate", () => {
    it("should return null for formats not matching dd.MM.yyyy", () => {
      expect(parseDate("")).toBeNull();
      expect(parseDate("12.05")).toBeNull();
      expect(parseDate("12-05-2026")).toBeNull();
      expect(parseDate("12/05/2026")).toBeNull();
    });

    it("should return null when day, month, or year are not valid numbers", () => {
      expect(parseDate("aa.bb.cccc")).toBeNull();
      expect(parseDate("1..2026")).toBeNull();
      expect(parseDate(".02.2026")).toBeNull();
      expect(parseDate("15.NaN.2026")).toBeNull();
    });

    it("should return null for impossible dates", () => {
      expect(parseDate("31.02.2026")).toBeNull();
      expect(parseDate("10.13.2026")).toBeNull();
      expect(parseDate("00.12.2026")).toBeNull();
      expect(parseDate("10.00.2026")).toBeNull();
    });

    it("should return a valid Date for correct input", () => {
      const result = parseDate("10.03.2026");
      expect(result).toEqual(new Date(2026, 2, 10));
    });

    it("should handle whitespace in input", () => {
      const result = parseDate("  10.03.2026  ");
      expect(result).toEqual(new Date(2026, 2, 10));
    });
  });

  describe("isSameDay", () => {
    it("should return true for same calendar day", () => {
      const a = new Date(2026, 4, 15, 10, 30);
      const b = new Date(2026, 4, 15, 22, 45);
      expect(isSameDay(a, b)).toBe(true);
    });

    it("should return false for different days", () => {
      const a = new Date(2026, 4, 15);
      const b = new Date(2026, 4, 16);
      expect(isSameDay(a, b)).toBe(false);
    });

    it("should return false for different months", () => {
      const a = new Date(2026, 4, 15);
      const b = new Date(2026, 5, 15);
      expect(isSameDay(a, b)).toBe(false);
    });

    it("should return false for different years", () => {
      const a = new Date(2026, 4, 15);
      const b = new Date(2025, 4, 15);
      expect(isSameDay(a, b)).toBe(false);
    });
  });

  describe("isBeforeDay", () => {
    it("should return true when a is before b", () => {
      const a = new Date(2026, 4, 14);
      const b = new Date(2026, 4, 15);
      expect(isBeforeDay(a, b)).toBe(true);
    });

    it("should return false when a equals b ignoring time", () => {
      const a = new Date(2026, 4, 15, 0, 0, 0);
      const b = new Date(2026, 4, 15, 23, 59, 59);
      expect(isBeforeDay(a, b)).toBe(false);
    });

    it("should return false when a is after b", () => {
      const a = new Date(2026, 4, 16);
      const b = new Date(2026, 4, 15);
      expect(isBeforeDay(a, b)).toBe(false);
    });

    it("should compare by year first", () => {
      const a = new Date(2023, 11, 31);
      const b = new Date(2026, 0, 1);
      expect(isBeforeDay(a, b)).toBe(true);
    });

    it("should compare by month when years are equal", () => {
      const a = new Date(2026, 3, 30);
      const b = new Date(2026, 4, 1);
      expect(isBeforeDay(a, b)).toBe(true);
    });

    it("should ignore time components completely", () => {
      const a = new Date(2026, 4, 15, 23, 59, 59);
      const b = new Date(2026, 4, 15, 0, 0, 0);
      expect(isBeforeDay(a, b)).toBe(false);
    });
  });

  describe("isAfterDay", () => {
    it("should return true when a is after b", () => {
      const a = new Date(2026, 4, 16);
      const b = new Date(2026, 4, 15);
      expect(isAfterDay(a, b)).toBe(true);
    });

    it("should return false when a equals b ignoring time", () => {
      const a = new Date(2026, 4, 15, 23, 59, 59);
      const b = new Date(2026, 4, 15, 0, 0, 0);
      expect(isAfterDay(a, b)).toBe(false);
    });

    it("should return false when a is before b", () => {
      const a = new Date(2026, 4, 14);
      const b = new Date(2026, 4, 15);
      expect(isAfterDay(a, b)).toBe(false);
    });
  });

  describe("getISOWeek", () => {
    it("should return week 1 for Jan 1, 2026", () => {
      expect(getISOWeek(new Date(2026, 0, 1))).toBe(1);
    });

    it("should return week 53 for Dec 31, 2026", () => {
      expect(getISOWeek(new Date(2026, 11, 31))).toBe(53);
    });

    it("should return week 1 for first week of year", () => {
      expect(getISOWeek(new Date(2026, 0, 4))).toBe(1);
    });
  });

  describe("addDays", () => {
    it("adds positive days", () => {
      expect(addDays(new Date(2026, 4, 15), 5)).toEqual(new Date(2026, 4, 20));
    });

    it("subtracts when n is negative", () => {
      expect(addDays(new Date(2026, 4, 15), -5)).toEqual(new Date(2026, 4, 10));
    });

    it("rolls over into the next month", () => {
      expect(addDays(new Date(2026, 0, 31), 1)).toEqual(new Date(2026, 1, 1));
    });

    it("does not mutate the input", () => {
      const input = new Date(2026, 4, 15);
      addDays(input, 5);
      expect(input).toEqual(new Date(2026, 4, 15));
    });
  });

  describe("addMonths", () => {
    it("adds positive months", () => {
      expect(addMonths(new Date(2026, 0, 15), 2)).toEqual(
        new Date(2026, 2, 15),
      );
    });

    it("subtracts when n is negative", () => {
      expect(addMonths(new Date(2026, 4, 15), -5)).toEqual(
        new Date(2025, 11, 15),
      );
    });

    it("clamps Jan 31 + 1 month to last day of Feb (non-leap)", () => {
      expect(addMonths(new Date(2025, 0, 31), 1)).toEqual(
        new Date(2025, 1, 28),
      );
    });

    it("clamps Jan 31 + 1 month to Feb 29 in leap year", () => {
      expect(addMonths(new Date(2024, 0, 31), 1)).toEqual(
        new Date(2024, 1, 29),
      );
    });

    it("rolls across years correctly", () => {
      expect(addMonths(new Date(2026, 10, 15), 3)).toEqual(
        new Date(2027, 1, 15),
      );
    });
  });

  describe("addYears", () => {
    it("adds years", () => {
      expect(addYears(new Date(2026, 4, 15), 4)).toEqual(
        new Date(2030, 4, 15),
      );
    });

    it("subtracts years when negative", () => {
      expect(addYears(new Date(2026, 4, 15), -10)).toEqual(
        new Date(2016, 4, 15),
      );
    });

    it("clamps Feb 29 + 1 year to Feb 28 in non-leap target", () => {
      expect(addYears(new Date(2024, 1, 29), 1)).toEqual(
        new Date(2025, 1, 28),
      );
    });
  });

  describe("startOfMonth", () => {
    it("returns the first day of the month at 00:00", () => {
      expect(startOfMonth(new Date(2026, 4, 15, 10, 30))).toEqual(
        new Date(2026, 4, 1, 0, 0, 0, 0),
      );
    });
  });

  describe("endOfMonth", () => {
    it("returns the last day for 31-day month", () => {
      expect(endOfMonth(new Date(2026, 0, 15))).toEqual(new Date(2026, 0, 31));
    });

    it("returns Feb 28 for non-leap year", () => {
      expect(endOfMonth(new Date(2025, 1, 5))).toEqual(new Date(2025, 1, 28));
    });

    it("returns Feb 29 for leap year", () => {
      expect(endOfMonth(new Date(2024, 1, 5))).toEqual(new Date(2024, 1, 29));
    });
  });

  describe("startOfWeek", () => {
    it("returns the same day when input is already the first day", () => {
      // 2026-05-11 is a Monday; firstDayOfWeek=1 (Monday)
      expect(startOfWeek(new Date(2026, 4, 11), 1)).toEqual(
        new Date(2026, 4, 11),
      );
    });

    it("walks back to Monday when firstDayOfWeek=1", () => {
      // 2026-05-15 is a Friday → Monday is 2026-05-11
      expect(startOfWeek(new Date(2026, 4, 15), 1)).toEqual(
        new Date(2026, 4, 11),
      );
    });

    it("walks back to Sunday when firstDayOfWeek=0", () => {
      // 2026-05-15 is a Friday → Sunday is 2026-05-10
      expect(startOfWeek(new Date(2026, 4, 15), 0)).toEqual(
        new Date(2026, 4, 10),
      );
    });

    it("walks across month boundary", () => {
      // 2026-05-02 is a Saturday; firstDayOfWeek=1 → Monday 2026-04-27
      expect(startOfWeek(new Date(2026, 4, 2), 1)).toEqual(
        new Date(2026, 3, 27),
      );
    });
  });

  describe("getDaysInMonth", () => {
    it("returns 31 for January", () => {
      expect(getDaysInMonth(2026, 0)).toBe(31);
    });

    it("returns 28 for Feb in non-leap year", () => {
      expect(getDaysInMonth(2025, 1)).toBe(28);
    });

    it("returns 29 for Feb in leap year", () => {
      expect(getDaysInMonth(2024, 1)).toBe(29);
    });

    it("returns 30 for April", () => {
      expect(getDaysInMonth(2026, 3)).toBe(30);
    });
  });

  describe("isSameMonth", () => {
    it("returns true for same year and month", () => {
      expect(isSameMonth(new Date(2026, 4, 1), new Date(2026, 4, 31))).toBe(
        true,
      );
    });

    it("returns false for different months", () => {
      expect(isSameMonth(new Date(2026, 4, 1), new Date(2026, 5, 1))).toBe(
        false,
      );
    });

    it("returns false for same month but different year", () => {
      expect(isSameMonth(new Date(2026, 4, 1), new Date(2025, 4, 1))).toBe(
        false,
      );
    });
  });

  describe("isSameYear", () => {
    it("returns true for same year", () => {
      expect(isSameYear(new Date(2026, 0, 1), new Date(2026, 11, 31))).toBe(
        true,
      );
    });

    it("returns false for different years", () => {
      expect(isSameYear(new Date(2026, 0, 1), new Date(2025, 11, 31))).toBe(
        false,
      );
    });
  });

  describe("getFirstDayOfWeek", () => {
    it("returns a numeric JS day index (0-6) for et-EE", () => {
      const result = getFirstDayOfWeek("et-EE");
      expect(typeof result).toBe("number");
      expect(result).toBeGreaterThanOrEqual(0);
      expect(result).toBeLessThanOrEqual(6);
    });

    it("falls back to 1 (Monday) for an unparseable locale", () => {
      // Syntactically invalid BCP47 — Intl.Locale throws, catch returns 1.
      expect(getFirstDayOfWeek("!@#$")).toBe(1);
    });

    it("converts Intl 7 (Sun) to JS 0", () => {
      const original = Intl.Locale.prototype as unknown as {
        getWeekInfo?: () => { firstDay: number };
      };
      const previous = original.getWeekInfo;
      original.getWeekInfo = () => ({ firstDay: 7 });
      try {
        expect(getFirstDayOfWeek("en-US")).toBe(0);
      } finally {
        if (previous) original.getWeekInfo = previous;
        else delete original.getWeekInfo;
      }
    });

    it("returns the Intl value as-is for Mon..Sat", () => {
      const original = Intl.Locale.prototype as unknown as {
        getWeekInfo?: () => { firstDay: number };
      };
      const previous = original.getWeekInfo;
      original.getWeekInfo = () => ({ firstDay: 1 });
      try {
        expect(getFirstDayOfWeek("et-EE")).toBe(1);
      } finally {
        if (previous) original.getWeekInfo = previous;
        else delete original.getWeekInfo;
      }
    });
  });

  describe("getMonthNames", () => {
    it("returns 12 long names in English", () => {
      const names = getMonthNames("en-US", "long");
      expect(names).toHaveLength(12);
      expect(names[0]).toBe("January");
      expect(names[11]).toBe("December");
    });

    it("returns 12 short names in English", () => {
      const names = getMonthNames("en-US", "short");
      expect(names).toHaveLength(12);
      expect(names[0]).toBe("Jan");
    });

    it("returns 12 names in Estonian", () => {
      const names = getMonthNames("et-EE", "long");
      expect(names).toHaveLength(12);
      expect(names[0].toLowerCase()).toContain("jaanuar");
    });

    it("returns 12 names in Japanese", () => {
      const names = getMonthNames("ja-JP", "long");
      expect(names).toHaveLength(12);
      expect(names[0]).toContain("1");
    });
  });

  describe("getWeekdayNames", () => {
    it("returns 7 names starting at firstDayOfWeek=1 (Monday) in English", () => {
      const names = getWeekdayNames("en-US", "short", 1);
      expect(names).toHaveLength(7);
      expect(names[0]).toBe("Mon");
      expect(names[6]).toBe("Sun");
    });

    it("returns 7 names starting at firstDayOfWeek=0 (Sunday) in English", () => {
      const names = getWeekdayNames("en-US", "short", 0);
      expect(names).toHaveLength(7);
      expect(names[0]).toBe("Sun");
      expect(names[6]).toBe("Sat");
    });

    it("returns 7 narrow names", () => {
      const names = getWeekdayNames("en-US", "narrow", 1);
      // en-US narrow weekdays starting Mon: M T W T F S S
      expect(names).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
    });

    it("returns 7 entries in Estonian", () => {
      const names = getWeekdayNames("et-EE", "short", 1);
      expect(names).toHaveLength(7);
    });
  });

  describe("formatLocaleDate", () => {
    it("formats et-EE as dd.MM.yyyy", () => {
      expect(formatLocaleDate(new Date(2026, 2, 10), "et-EE")).toBe(
        "10.03.2026",
      );
    });

    it("formats en-GB as dd/MM/yyyy", () => {
      expect(formatLocaleDate(new Date(2026, 2, 10), "en-GB")).toBe(
        "10/03/2026",
      );
    });

    it("formats en-US as MM/dd/yyyy", () => {
      expect(formatLocaleDate(new Date(2026, 2, 10), "en-US")).toBe(
        "03/10/2026",
      );
    });

    it("formats ja-JP", () => {
      const formatted = formatLocaleDate(new Date(2026, 2, 10), "ja-JP");
      // ja-JP produces 2026/03/10 (year first, slash separator)
      expect(formatted).toMatch(/2026/);
      expect(formatted).toMatch(/03/);
      expect(formatted).toMatch(/10/);
    });
  });

  describe("parseLocaleDate", () => {
    it("parses et-EE dd.MM.yyyy", () => {
      expect(parseLocaleDate("10.03.2026", "et-EE")).toEqual(
        new Date(2026, 2, 10),
      );
    });

    it("parses en-GB dd/MM/yyyy", () => {
      expect(parseLocaleDate("10/03/2026", "en-GB")).toEqual(
        new Date(2026, 2, 10),
      );
    });

    it("parses en-US MM/dd/yyyy", () => {
      expect(parseLocaleDate("03/10/2026", "en-US")).toEqual(
        new Date(2026, 2, 10),
      );
    });

    it("returns undefined for empty input", () => {
      expect(parseLocaleDate("", "et-EE")).toBeUndefined();
      expect(parseLocaleDate("   ", "et-EE")).toBeUndefined();
    });

    it("returns undefined for wrong separator", () => {
      expect(parseLocaleDate("10/03/2026", "et-EE")).toBeUndefined();
    });

    it("returns undefined for impossible date (Feb 30)", () => {
      expect(parseLocaleDate("30.02.2026", "et-EE")).toBeUndefined();
    });

    it("returns undefined for month > 12", () => {
      expect(parseLocaleDate("10.13.2026", "et-EE")).toBeUndefined();
    });

    it("returns undefined for day 0", () => {
      expect(parseLocaleDate("00.12.2026", "et-EE")).toBeUndefined();
    });

    it("trims whitespace from input", () => {
      expect(parseLocaleDate("  10.03.2026  ", "et-EE")).toEqual(
        new Date(2026, 2, 10),
      );
    });

    it("round-trips formatLocaleDate output", () => {
      const date = new Date(2026, 6, 4);
      for (const locale of ["et-EE", "en-US", "en-GB", "ja-JP"]) {
        const formatted = formatLocaleDate(date, locale);
        expect(parseLocaleDate(formatted, locale)).toEqual(date);
      }
    });

    it("rejects 3-digit years (regex over-permissiveness guard)", () => {
      expect(parseLocaleDate("10/3/100", "en-US")).toBeUndefined();
      expect(parseLocaleDate("10.3.100", "et-EE")).toBeUndefined();
    });
  });

  describe("isDateInRange", () => {
    it("matches dates strictly inside the range", () => {
      const range = { from: new Date(2026, 4, 10), to: new Date(2026, 4, 20) };
      expect(isDateInRange(new Date(2026, 4, 15), range)).toBe(true);
    });

    it("matches both bounds inclusively", () => {
      const range = { from: new Date(2026, 4, 10), to: new Date(2026, 4, 20) };
      expect(isDateInRange(new Date(2026, 4, 10), range)).toBe(true);
      expect(isDateInRange(new Date(2026, 4, 20), range)).toBe(true);
    });

    it("rejects dates outside the range", () => {
      const range = { from: new Date(2026, 4, 10), to: new Date(2026, 4, 20) };
      expect(isDateInRange(new Date(2026, 4, 9), range)).toBe(false);
      expect(isDateInRange(new Date(2026, 4, 21), range)).toBe(false);
    });

    it("acts as same-day check when `to` is undefined", () => {
      const range = { from: new Date(2026, 4, 15) };
      expect(isDateInRange(new Date(2026, 4, 15), range)).toBe(true);
      expect(isDateInRange(new Date(2026, 4, 16), range)).toBe(false);
    });

    it("handles swapped range (from after to)", () => {
      const range = { from: new Date(2026, 4, 20), to: new Date(2026, 4, 10) };
      expect(isDateInRange(new Date(2026, 4, 15), range)).toBe(true);
    });
  });

  describe("toggleDateInArray", () => {
    it("adds a new date", () => {
      const result = toggleDateInArray(
        [new Date(2026, 4, 10)],
        new Date(2026, 4, 15),
      );
      expect(result).toHaveLength(2);
      expect(result[1]).toEqual(new Date(2026, 4, 15));
    });

    it("removes an existing same-day entry", () => {
      const result = toggleDateInArray(
        [new Date(2026, 4, 10), new Date(2026, 4, 15, 9, 0)],
        new Date(2026, 4, 15, 22, 30),
      );
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(new Date(2026, 4, 10));
    });

    it("returns a new array instance", () => {
      const original = [new Date(2026, 4, 10)];
      const result = toggleDateInArray(original, new Date(2026, 4, 15));
      expect(result).not.toBe(original);
    });

    it("adds when starting from empty array", () => {
      const result = toggleDateInArray([], new Date(2026, 4, 15));
      expect(result).toEqual([new Date(2026, 4, 15)]);
    });
  });

  describe("buildMonthGrid", () => {
    it("always returns 6 rows × 7 cells", () => {
      const grid = buildMonthGrid(new Date(2026, 4, 1), 1, true);
      expect(grid).toHaveLength(6);
      grid.forEach((row) => expect(row).toHaveLength(7));
    });

    it("places the first day of the month on its correct weekday (Mon-first)", () => {
      // May 2026: May 1 is a Friday. With firstDayOfWeek=1 (Mon), Friday is index 4.
      const grid = buildMonthGrid(new Date(2026, 4, 1), 1, true);
      const firstRow = grid[0];
      expect(firstRow[4]).toEqual(new Date(2026, 4, 1));
    });

    it("places the first day of the month on its correct weekday (Sun-first)", () => {
      // May 2026: May 1 is a Friday. With firstDayOfWeek=0 (Sun), Friday is index 5.
      const grid = buildMonthGrid(new Date(2026, 4, 1), 0, true);
      const firstRow = grid[0];
      expect(firstRow[5]).toEqual(new Date(2026, 4, 1));
    });

    it("returns real Date objects for outside days when showOutsideDays=true", () => {
      // May 2026: Mon-first → leading cells are Apr 27, 28, 29, 30
      const grid = buildMonthGrid(new Date(2026, 4, 1), 1, true);
      expect(grid[0][0]).toEqual(new Date(2026, 3, 27));
      expect(grid[0][3]).toEqual(new Date(2026, 3, 30));
    });

    it("returns null for outside days when showOutsideDays=false", () => {
      const grid = buildMonthGrid(new Date(2026, 4, 1), 1, false);
      expect(grid[0][0]).toBeNull();
      expect(grid[0][3]).toBeNull();
      expect(grid[0][4]).toEqual(new Date(2026, 4, 1));
    });

    it("does not include null for in-month days", () => {
      const grid = buildMonthGrid(new Date(2026, 4, 15), 1, false);
      const inMonthCells = grid
        .flat()
        .filter((c) => c !== null && c.getMonth() === 4);
      expect(inMonthCells).toHaveLength(31);
    });

    it("fills trailing cells correctly", () => {
      // February 2025: 28 days. Feb 1 is a Saturday (getDay=6).
      // Mon-first → Feb 1 is at index 5. Feb has 28 days → cells 5..32 (=index 32 is Feb 28).
      // Trailing cells 33..41 are Mar 1..9.
      const grid = buildMonthGrid(new Date(2025, 1, 1), 1, true);
      expect(grid[5][6]).toEqual(new Date(2025, 2, 9));
    });
  });
});
