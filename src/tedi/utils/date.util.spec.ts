import {
  formatDate,
  parseDate,
  isSameDay,
  isBeforeDay,
  isAfterDay,
  getISOWeek,
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
});
