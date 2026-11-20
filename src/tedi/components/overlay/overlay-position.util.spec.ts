import { ConnectedPosition } from "@angular/cdk/overlay";

import { toConnectedPositions } from "./overlay-position.util";

const sides = (positions: ConnectedPosition[]) =>
  positions.map(({ originX, originY, overlayX, overlayY }) => {
    if (overlayX === "start" && originX === "end") return "right";
    if (overlayX === "end" && originX === "start") return "left";
    return overlayY === "top" && originY === "bottom" ? "bottom" : "top";
  });

describe("toConnectedPositions", () => {
  it("falls back below and above after both sides for a side placement", () => {
    const positions = sides(toConnectedPositions("right-start", true));

    expect(positions.slice(0, 2)).toEqual(["right", "right"]);
    expect(positions.slice(2, 4)).toEqual(["left", "left"]);
    expect(positions.slice(4)).toEqual(["bottom", "bottom", "top", "top"]);
  });

  it("adds no below or above fallbacks without preventOverflow", () => {
    const positions = sides(toConnectedPositions("left", false));

    expect(positions.every((side) => side === "left")).toBe(true);
  });

  it("adds no side fallbacks for a vertical placement", () => {
    const positions = sides(toConnectedPositions("bottom-start", true));

    expect(positions).toEqual(["bottom", "bottom", "top", "top"]);
  });
});
