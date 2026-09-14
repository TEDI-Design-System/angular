import { highlightParts } from "./search-highlight.util";

describe("highlightParts", () => {
  it("returns a single unmatched part when the query is empty", () => {
    expect(highlightParts("Mari Maasikas", "")).toEqual([
      { text: "Mari Maasikas", match: false },
    ]);
  });

  it("returns a single unmatched part when there is no match", () => {
    expect(highlightParts("Mari Maasikas", "zzz")).toEqual([
      { text: "Mari Maasikas", match: false },
    ]);
  });

  it("splits a leading match", () => {
    expect(highlightParts("Mari Maasikas", "Mar")).toEqual([
      { text: "Mar", match: true },
      { text: "i Maasikas", match: false },
    ]);
  });

  it("splits a match in the middle", () => {
    expect(highlightParts("Mari Maasikas", "i M")).toEqual([
      { text: "Mar", match: false },
      { text: "i M", match: true },
      { text: "aasikas", match: false },
    ]);
  });

  it("splits a trailing match", () => {
    expect(highlightParts("Mari Maasikas", "kas")).toEqual([
      { text: "Mari Maasi", match: false },
      { text: "kas", match: true },
    ]);
  });

  it("matches case-insensitively but preserves the original casing", () => {
    expect(highlightParts("Mari Maasikas", "mari")).toEqual([
      { text: "Mari", match: true },
      { text: " Maasikas", match: false },
    ]);
  });

  it("ignores surrounding whitespace in the query", () => {
    expect(highlightParts("Mari Maasikas", "  Mar  ")).toEqual([
      { text: "Mar", match: true },
      { text: "i Maasikas", match: false },
    ]);
  });
});
