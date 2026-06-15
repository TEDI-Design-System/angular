import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { EllipsisComponent } from "./index";

@Component({
  standalone: true,
  imports: [EllipsisComponent],
  template: `
    <tedi-ellipsis
      [lineClamp]="lineClamp"
      [tooltip]="tooltip"
      [position]="position"
    >
      Any inline <b>content (even bold)</b>, that is too long for the wrapper
    </tedi-ellipsis>
  `,
})
class TestHostComponent {
  lineClamp = 2;
  tooltip = true;
  position: "start" | "end" = "end";
}

describe("EllipsisComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let ellipsisEl: HTMLElement;
  let contentEl: HTMLElement;
  let component: EllipsisComponent;

  let resizeCallbacks: ResizeObserverCallback[];
  const triggerResize = () =>
    resizeCallbacks.forEach((cb) =>
      cb([], {} as ResizeObserver),
    );

  beforeEach(() => {
    resizeCallbacks = [];
    global.ResizeObserver = class {
      constructor(cb: ResizeObserverCallback) {
        resizeCallbacks.push(cb);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;

    TestBed.configureTestingModule({
      imports: [TestHostComponent, EllipsisComponent],
    });
    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    component = fixture.debugElement.children[0]
      .componentInstance as EllipsisComponent;
    fixture.detectChanges();
    ellipsisEl = fixture.nativeElement.querySelector("tedi-ellipsis");
    contentEl = ellipsisEl.querySelector(".tedi-ellipsis__content")!;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /** Mock the content element so an overflow measurement reports truncation. */
  const mockTruncated = (axis: "height" | "width") => {
    if (axis === "height") {
      jest.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(100);
      jest.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(50);
    } else {
      jest.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(100);
      jest.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(50);
    }
    triggerResize();
    fixture.detectChanges();
  };

  it("should create", () => {
    expect(host).toBeTruthy();
  });

  it("should render host class", () => {
    expect(ellipsisEl.classList.contains("tedi-ellipsis")).toBe(true);
  });

  it("should render projected content", () => {
    expect(ellipsisEl.textContent).toContain("content (even bold)");
  });

  describe("lineClamp input", () => {
    it("should apply default lineClamp of 2 via computed style", () => {
      expect(component.clampStyle()).toBe("2");
    });

    it("should apply custom lineClamp value through component", () => {
      host.lineClamp = 4;
      fixture.detectChanges();
      expect(component.clampStyle()).toBe("4");
    });
  });

  describe("position input", () => {
    it("should not apply --start modifier class by default (end position)", () => {
      expect(contentEl.classList.contains("tedi-ellipsis__content--start")).toBe(false);
    });

    it("should apply --start modifier class when position is start", () => {
      host.position = "start";
      fixture.detectChanges();
      const span = ellipsisEl.querySelector(".tedi-ellipsis__content")!;
      expect(span.classList.contains("tedi-ellipsis__content--start")).toBe(true);
    });

    it("should not set line-clamp style when position is start", () => {
      host.position = "start";
      fixture.detectChanges();
      expect(component.clampStyle()).toBeNull();
    });

    it("should set line-clamp style when position is end", () => {
      host.position = "end";
      host.lineClamp = 3;
      fixture.detectChanges();
      expect(component.clampStyle()).toBe("3");
    });
  });

  describe("truncation detection", () => {
    it("should detect end-mode truncation via scrollHeight", () => {
      mockTruncated("height");
      expect(component.isEllipsed()).toBe(true);
    });

    it("should detect start-mode truncation via scrollWidth", () => {
      host.position = "start";
      fixture.detectChanges();
      mockTruncated("width");
      expect(component.isEllipsed()).toBe(true);
    });

    it("should not report truncation when content fits", () => {
      jest.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(50);
      jest.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(50);
      triggerResize();
      fixture.detectChanges();
      expect(component.isEllipsed()).toBe(false);
    });

    it("should populate fullText from content textContent", () => {
      mockTruncated("height");
      expect(component.fullText()).toContain("content (even bold)");
    });
  });

  describe("tooltip rendering", () => {
    it("should show tooltip wrapper when truncated and tooltip is true", () => {
      mockTruncated("height");
      expect(ellipsisEl.querySelector("tedi-tooltip-trigger")).toBeTruthy();
    });

    it("should not show tooltip wrapper when not truncated", () => {
      expect(ellipsisEl.querySelector("tedi-tooltip-trigger")).toBeNull();
    });

    it("should not show tooltip wrapper when truncated but tooltip is false", () => {
      host.tooltip = false;
      fixture.detectChanges();
      mockTruncated("height");
      expect(ellipsisEl.querySelector("tedi-tooltip-trigger")).toBeNull();
    });
  });

  describe("teardown", () => {
    it("should disconnect ResizeObserver without error on destroy", () => {
      expect(() => fixture.destroy()).not.toThrow();
    });
  });
});
