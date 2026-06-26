import { matchAny, matchDate, Matcher } from "./matchers.util";

describe("matchers.util", () => {
  const day = (y: number, m: number, d: number) => new Date(y, m, d);

  describe("matchDate", () => {
    describe("boolean matcher", () => {
      it("returns true for true", () => {
        expect(matchDate(day(2026, 0, 1), true)).toBe(true);
      });

      it("returns false for false", () => {
        expect(matchDate(day(2026, 0, 1), false)).toBe(false);
      });
    });

    describe("Date matcher", () => {
      it("returns true when same day", () => {
        expect(matchDate(day(2026, 4, 15), day(2026, 4, 15))).toBe(true);
      });

      it("returns true when same day with different times", () => {
        const a = new Date(2026, 4, 15, 9, 0);
        const b = new Date(2026, 4, 15, 23, 30);
        expect(matchDate(a, b)).toBe(true);
      });

      it("returns false when different days", () => {
        expect(matchDate(day(2026, 4, 15), day(2026, 4, 16))).toBe(false);
      });
    });

    describe("Date[] matcher", () => {
      it("returns true when any entry is same day", () => {
        const list = [day(2026, 0, 1), day(2026, 4, 15), day(2026, 11, 31)];
        expect(matchDate(day(2026, 4, 15), list)).toBe(true);
      });

      it("returns false when none match", () => {
        const list = [day(2026, 0, 1), day(2026, 11, 31)];
        expect(matchDate(day(2026, 4, 15), list)).toBe(false);
      });

      it("returns false for empty array", () => {
        expect(matchDate(day(2026, 4, 15), [])).toBe(false);
      });
    });

    describe("DateBefore matcher", () => {
      it("returns true when date is strictly before", () => {
        expect(
          matchDate(day(2026, 4, 14), { before: day(2026, 4, 15) }),
        ).toBe(true);
      });

      it("returns false when same day", () => {
        expect(
          matchDate(day(2026, 4, 15), { before: day(2026, 4, 15) }),
        ).toBe(false);
      });

      it("returns false when after", () => {
        expect(
          matchDate(day(2026, 4, 16), { before: day(2026, 4, 15) }),
        ).toBe(false);
      });

      it("ignores time of day", () => {
        const date = new Date(2026, 4, 15, 23, 59);
        const before = new Date(2026, 4, 15, 0, 0);
        expect(matchDate(date, { before })).toBe(false);
      });
    });

    describe("DateAfter matcher", () => {
      it("returns true when date is strictly after", () => {
        expect(
          matchDate(day(2026, 4, 16), { after: day(2026, 4, 15) }),
        ).toBe(true);
      });

      it("returns false when same day", () => {
        expect(
          matchDate(day(2026, 4, 15), { after: day(2026, 4, 15) }),
        ).toBe(false);
      });

      it("returns false when before", () => {
        expect(
          matchDate(day(2026, 4, 14), { after: day(2026, 4, 15) }),
        ).toBe(false);
      });
    });

    describe("DateInterval matcher (outside semantics)", () => {
      const interval = { before: day(2026, 4, 20), after: day(2026, 4, 10) };

      it("returns true at or before after-bound", () => {
        expect(matchDate(day(2026, 4, 10), interval)).toBe(true);
        expect(matchDate(day(2026, 4, 9), interval)).toBe(true);
        expect(matchDate(day(2026, 0, 1), interval)).toBe(true);
      });

      it("returns true at or after before-bound", () => {
        expect(matchDate(day(2026, 4, 20), interval)).toBe(true);
        expect(matchDate(day(2026, 4, 21), interval)).toBe(true);
        expect(matchDate(day(2026, 11, 31), interval)).toBe(true);
      });

      it("returns false strictly inside the interval", () => {
        expect(matchDate(day(2026, 4, 11), interval)).toBe(false);
        expect(matchDate(day(2026, 4, 15), interval)).toBe(false);
        expect(matchDate(day(2026, 4, 19), interval)).toBe(false);
      });
    });

    describe("DateRange matcher (inclusive)", () => {
      it("matches date inside the range", () => {
        const range = { from: day(2026, 4, 10), to: day(2026, 4, 20) };
        expect(matchDate(day(2026, 4, 15), range)).toBe(true);
      });

      it("matches both bounds inclusively", () => {
        const range = { from: day(2026, 4, 10), to: day(2026, 4, 20) };
        expect(matchDate(day(2026, 4, 10), range)).toBe(true);
        expect(matchDate(day(2026, 4, 20), range)).toBe(true);
      });

      it("rejects dates outside the range", () => {
        const range = { from: day(2026, 4, 10), to: day(2026, 4, 20) };
        expect(matchDate(day(2026, 4, 9), range)).toBe(false);
        expect(matchDate(day(2026, 4, 21), range)).toBe(false);
      });

      it("treats `to: undefined` like a single-day match", () => {
        const range = { from: day(2026, 4, 15) };
        expect(matchDate(day(2026, 4, 15), range)).toBe(true);
        expect(matchDate(day(2026, 4, 16), range)).toBe(false);
      });

      it("handles a swapped range (from after to)", () => {
        const range = { from: day(2026, 4, 20), to: day(2026, 4, 10) };
        expect(matchDate(day(2026, 4, 15), range)).toBe(true);
        expect(matchDate(day(2026, 4, 10), range)).toBe(true);
        expect(matchDate(day(2026, 4, 20), range)).toBe(true);
      });
    });

    describe("DayOfWeek matcher", () => {
      it("matches when date.getDay() is in the array", () => {
        // 2026-05-16 is a Saturday (getDay() === 6)
        const sat = day(2026, 4, 16);
        expect(matchDate(sat, { dayOfWeek: [0, 6] })).toBe(true);
      });

      it("does not match when not in the array", () => {
        // 2026-05-15 is a Friday (getDay() === 5)
        const fri = day(2026, 4, 15);
        expect(matchDate(fri, { dayOfWeek: [0, 6] })).toBe(false);
      });

      it("empty array never matches", () => {
        expect(matchDate(day(2026, 4, 15), { dayOfWeek: [] })).toBe(false);
      });
    });

    describe("function matcher", () => {
      it("calls the function with the date", () => {
        const fn = jest.fn((d: Date) => d.getFullYear() === 2026);
        expect(matchDate(day(2026, 4, 15), fn)).toBe(true);
        expect(fn).toHaveBeenCalledWith(day(2026, 4, 15));
      });

      it("returns false when the predicate returns false", () => {
        expect(matchDate(day(2026, 4, 15), () => false)).toBe(false);
      });
    });
  });

  describe("matchAny", () => {
    it("returns false for empty array", () => {
      expect(matchAny(new Date(2026, 4, 15), [])).toBe(false);
    });

    it("returns true if any matcher matches", () => {
      const matchers: Matcher[] = [
        false,
        new Date(2026, 0, 1),
        { before: new Date(2026, 4, 15) },
        new Date(2026, 4, 15),
      ];
      expect(matchAny(new Date(2026, 4, 15), matchers)).toBe(true);
    });

    it("returns false when no matcher matches", () => {
      const matchers: Matcher[] = [
        false,
        new Date(2026, 0, 1),
        { after: new Date(2026, 4, 20) },
      ];
      expect(matchAny(new Date(2026, 4, 15), matchers)).toBe(false);
    });

    it("short-circuits — does not call later matchers after a true", () => {
      const later = jest.fn(() => true);
      const result = matchAny(new Date(2026, 4, 15), [true, later]);
      expect(result).toBe(true);
      expect(later).not.toHaveBeenCalled();
    });
  });
});
