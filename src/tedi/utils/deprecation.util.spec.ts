import * as core from "@angular/core";
import { warnDeprecated } from "./deprecation.util";

jest.mock("@angular/core", () => ({
  ...jest.requireActual("@angular/core"),
  isDevMode: jest.fn(() => true),
}));

describe("warnDeprecated", () => {
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  afterEach(() => {
    warn.mockRestore();
    (core.isDevMode as jest.Mock).mockReturnValue(true);
  });

  it("warns with the component name and message", () => {
    warnDeprecated("tedi-a", "Use B instead.");
    expect(warn).toHaveBeenCalledWith(
      "[TEDI] tedi-a is deprecated. Use B instead.",
    );
  });

  it("warns only once per component", () => {
    warnDeprecated("tedi-b", "Use C instead.");
    warnDeprecated("tedi-b", "Use C instead.");
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("does not warn outside dev mode", () => {
    (core.isDevMode as jest.Mock).mockReturnValue(false);
    warnDeprecated("tedi-c", "Use D instead.");
    expect(warn).not.toHaveBeenCalled();
  });
});
