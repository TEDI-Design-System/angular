import { formatFileSize } from "./file.util";

describe("formatFileSize", () => {
  it("steps up through the units as the count grows", () => {
    expect(formatFileSize(512, "en")).toBe("512 byte");
    expect(formatFileSize(1024, "en")).toBe("1 kB");
    expect(formatFileSize(1024 ** 2, "en")).toBe("1 MB");
    expect(formatFileSize(1024 ** 3, "en")).toBe("1 GB");
  });

  it("writes the units and the decimal mark the way the language does", () => {
    const bytes = 1.5 * 1024 ** 2;

    expect(formatFileSize(bytes, "et")).toBe("1,5 MB");
    expect(formatFileSize(bytes, "en")).toBe("1.5 MB");
    // Russian abbreviates in Cyrillic, as Windows and macOS do.
    expect(formatFileSize(bytes, "ru")).toBe("1,5 МБ");
  });

  it("falls back to Estonian, like the translation service", () => {
    expect(formatFileSize(1.5 * 1024 ** 2)).toBe("1,5 MB");
  });

  it("counts in binary magnitudes, so a limit never rejects what a file manager calls the same size", () => {
    // 1,000,000 bytes is "1 MB" to a decimal file manager and under a 1 MB
    // limit here either way.
    expect(formatFileSize(1_000_000, "en")).toBe("976.6 kB");
  });

  it("returns nothing for a size that cannot be shown", () => {
    expect(formatFileSize(-1, "et")).toBe("");
    expect(formatFileSize(Number.NaN, "et")).toBe("");
  });
});
