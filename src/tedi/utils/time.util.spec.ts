import { isValidTime, normalizeTime } from "./time.util";

describe("time.util", () => {
  describe("isValidTime", () => {
    it.each(["00:00", "09:30", "23:59", "12:00"])(
      "should return true for valid time %s",
      (time) => {
        expect(isValidTime(time)).toBe(true);
      },
    );

    it.each(["", "9:30", "9:5", "24:00", "12:60", "abc", "12:00:00", "1:1"])(
      "should return false for invalid time %s",
      (time) => {
        expect(isValidTime(time)).toBe(false);
      },
    );

    it("should return false for null/undefined", () => {
      expect(isValidTime(null)).toBe(false);
      expect(isValidTime(undefined)).toBe(false);
    });

    it("should trim before validating", () => {
      expect(isValidTime("  09:30  ")).toBe(true);
    });
  });

  describe("normalizeTime", () => {
    it("should return '' for empty/whitespace input", () => {
      expect(normalizeTime("")).toBe("");
      expect(normalizeTime("   ")).toBe("");
    });

    it("should pass through already-valid HH:mm", () => {
      expect(normalizeTime("09:30")).toBe("09:30");
      expect(normalizeTime("23:59")).toBe("23:59");
    });

    it("should zero-pad H:m form", () => {
      expect(normalizeTime("9:5")).toBe("09:05");
      expect(normalizeTime("14:5")).toBe("14:05");
      expect(normalizeTime("1:1")).toBe("01:01");
    });

    it("should split 4-digit input as HH:mm", () => {
      expect(normalizeTime("1155")).toBe("11:55");
      expect(normalizeTime("0930")).toBe("09:30");
      expect(normalizeTime("2359")).toBe("23:59");
    });

    it("should split 3-digit input as H:mm", () => {
      expect(normalizeTime("930")).toBe("09:30");
      expect(normalizeTime("159")).toBe("01:59");
    });

    it("should treat any non-digit as separator", () => {
      expect(normalizeTime("11.55")).toBe("11:55");
      expect(normalizeTime("11-55")).toBe("11:55");
      expect(normalizeTime("11 55")).toBe("11:55");
      expect(normalizeTime("11/55")).toBe("11:55");
    });

    it("should trim leading/trailing whitespace", () => {
      expect(normalizeTime("  09:30  ")).toBe("09:30");
      expect(normalizeTime("  1155  ")).toBe("11:55");
    });

    it("should return null for out-of-range hours/minutes", () => {
      expect(normalizeTime("24:00")).toBeNull();
      expect(normalizeTime("12:60")).toBeNull();
      expect(normalizeTime("2400")).toBeNull();
      expect(normalizeTime("1260")).toBeNull();
      expect(normalizeTime("489")).toBeNull();
    });

    it("should return null for non-numeric input", () => {
      expect(normalizeTime("abc")).toBeNull();
      expect(normalizeTime("12:ab")).toBeNull();
    });

    it("should return null for digit counts other than 3 or 4 (without colon)", () => {
      expect(normalizeTime("1")).toBeNull();
      expect(normalizeTime("12")).toBeNull();
      expect(normalizeTime("12345")).toBeNull();
    });
  });
});
