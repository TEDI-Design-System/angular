import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SegmentedProgressComponent } from "./segmented-progress.component";

describe("SegmentedProgressComponent", () => {
  let fixture: ComponentFixture<SegmentedProgressComponent>;
  let el: HTMLElement;

  const fills = () =>
    Array.from(
      el.querySelectorAll<HTMLElement>(".tedi-segmented-progress__fill"),
    ).map((f) => f.style.width);
  const bar = () =>
    el.querySelector(".tedi-segmented-progress__bar") as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SegmentedProgressComponent] });
    fixture = TestBed.createComponent(SegmentedProgressComponent);
    el = fixture.nativeElement;
    fixture.componentRef.setInput("segments", 4);
    fixture.detectChanges();
  });

  it("renders one segment per step, all empty by default", () => {
    expect(el.classList).toContain("tedi-segmented-progress");
    expect(fills()).toEqual(["0%", "0%", "0%", "0%"]);
  });

  it("fills whole and partial segments from value", () => {
    fixture.componentRef.setInput("value", 1.5);
    fixture.detectChanges();
    expect(fills()).toEqual(["100%", "50%", "0%", "0%"]);
  });

  it("clamps value to the segment range", () => {
    fixture.componentRef.setInput("value", 10);
    fixture.detectChanges();
    expect(fills()).toEqual(["100%", "100%", "100%", "100%"]);
    expect(bar().getAttribute("aria-valuenow")).toBe("4");

    fixture.componentRef.setInput("value", -1);
    fixture.detectChanges();
    expect(fills()).toEqual(["0%", "0%", "0%", "0%"]);
  });

  it("fills each segment on its own when value is an array", () => {
    fixture.componentRef.setInput("value", [1, 0, 0.5, 2]);
    fixture.detectChanges();
    expect(fills()).toEqual(["100%", "0%", "50%", "100%"]);
    expect(bar().getAttribute("aria-valuenow")).toBe("2.5");

    fixture.componentRef.setInput("value", [0.25]);
    fixture.detectChanges();
    expect(fills()).toEqual(["25%", "0%", "0%", "0%"]);
  });

  it("exposes progressbar semantics", () => {
    fixture.componentRef.setInput("value", 2);
    fixture.componentRef.setInput("valueLabel", "2/4");
    fixture.componentRef.setInput("label", "Questions");
    fixture.detectChanges();
    expect(bar().getAttribute("role")).toBe("progressbar");
    expect(bar().getAttribute("aria-valuemin")).toBe("0");
    expect(bar().getAttribute("aria-valuemax")).toBe("4");
    expect(bar().getAttribute("aria-valuenow")).toBe("2");
    expect(bar().getAttribute("aria-valuetext")).toBe("2/4");
    expect(bar().getAttribute("aria-label")).toBe("Questions");
  });

  it("renders the header only when a label is given", () => {
    expect(el.querySelector(".tedi-segmented-progress__header")).toBeNull();
    fixture.componentRef.setInput("label", "Questions");
    fixture.componentRef.setInput("valueLabel", "1/4");
    fixture.detectChanges();
    expect(
      el.querySelector(".tedi-segmented-progress__label")?.textContent,
    ).toBe("Questions");
    expect(
      el.querySelector(".tedi-segmented-progress__value")?.textContent,
    ).toBe("1/4");
  });

  it("prefers ariaLabel over label", () => {
    fixture.componentRef.setInput("label", "Visible");
    fixture.componentRef.setInput("ariaLabel", "Hidden");
    fixture.detectChanges();
    expect(bar().getAttribute("aria-label")).toBe("Hidden");
  });
});
