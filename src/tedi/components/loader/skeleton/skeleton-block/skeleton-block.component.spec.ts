import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SkeletonBlockComponent } from "./skeleton-block.component";
import {
  Breakpoint,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";

const BREAKPOINT_ORDER: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "xxl"];

class BreakpointMock {
  current = signal<Breakpoint | undefined>(undefined);

  getBreakpointInputs<T>(inputs: Record<string, unknown>): T {
    let resolved: Record<string, unknown> = {};

    Object.keys(inputs).forEach((key) => {
      if (!BREAKPOINT_ORDER.includes(key as Breakpoint)) {
        resolved[key] = inputs[key];
      }
    });

    const current = this.current();
    if (!current) {
      return resolved as T;
    }

    for (let i = 0; i <= BREAKPOINT_ORDER.indexOf(current); i++) {
      const override = inputs[BREAKPOINT_ORDER[i]] as
        Record<string, unknown> | undefined;

      if (override) {
        resolved = { ...resolved, ...override };
      }
    }

    return resolved as T;
  }
}

describe("SkeletonBlockComponent", () => {
  let fixture: ComponentFixture<SkeletonBlockComponent>;
  let host: HTMLElement;
  let breakpoint: BreakpointMock;

  beforeEach(async () => {
    breakpoint = new BreakpointMock();

    await TestBed.configureTestingModule({
      imports: [SkeletonBlockComponent],
      providers: [{ provide: BreakpointService, useValue: breakpoint }],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonBlockComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("is hidden from assistive technology", () => {
    expect(host.getAttribute("aria-hidden")).toBe("true");
  });

  describe("height", () => {
    it("defaults to the paragraph line height", () => {
      expect(host.classList).toContain("tedi-skeleton-block--p");
      expect(host.style.height).toBe("");
    });

    it("applies a modifier class for a text style", () => {
      fixture.componentRef.setInput("height", "h2");
      fixture.detectChanges();

      expect(host.classList).toContain("tedi-skeleton-block--h2");
      expect(host.classList).not.toContain("tedi-skeleton-block--p");
    });

    it("applies a numeric height in px without a modifier class", () => {
      fixture.componentRef.setInput("height", 100);
      fixture.detectChanges();

      expect(host.style.height).toBe("100px");
      expect(host.className).toBe("tedi-skeleton-block");
    });

    it("reads a numeric string as px, so attribute syntax works", () => {
      fixture.componentRef.setInput("height", "100");
      fixture.detectChanges();

      expect(host.style.height).toBe("100px");
      expect(host.className).toBe("tedi-skeleton-block");
    });
  });

  describe("width", () => {
    it("leaves the full-width default to CSS", () => {
      expect(host.style.width).toBe("");
    });

    it("treats a number as a percentage of the container", () => {
      fixture.componentRef.setInput("width", 50);
      fixture.detectChanges();

      expect(host.style.width).toBe("50%");
    });

    it("passes a px value through unchanged", () => {
      fixture.componentRef.setInput("width", "36px");
      fixture.detectChanges();

      expect(host.style.width).toBe("36px");
    });

    it("reads a numeric string as a percentage, so attribute syntax works", () => {
      fixture.componentRef.setInput("width", "50");
      fixture.detectChanges();

      expect(host.style.width).toBe("50%");
    });
  });

  describe("breakpoint overrides", () => {
    it("layers a breakpoint override on top of the base inputs", () => {
      fixture.componentRef.setInput("width", 100);
      fixture.componentRef.setInput("height", "p");
      fixture.componentRef.setInput("md", { width: 50, height: "h1" });
      breakpoint.current.set("lg");
      fixture.detectChanges();

      expect(host.style.width).toBe("50%");
      expect(host.classList).toContain("tedi-skeleton-block--h1");
    });

    it("keeps the base inputs below the breakpoint", () => {
      fixture.componentRef.setInput("width", 100);
      fixture.componentRef.setInput("md", { width: 50 });
      breakpoint.current.set("sm");
      fixture.detectChanges();

      expect(host.style.width).toBe("100%");
    });

    it("only overrides the fields the breakpoint sets", () => {
      fixture.componentRef.setInput("width", 100);
      fixture.componentRef.setInput("height", "h3");
      fixture.componentRef.setInput("md", { width: 50 });
      breakpoint.current.set("md");
      fixture.detectChanges();

      expect(host.style.width).toBe("50%");
      expect(host.classList).toContain("tedi-skeleton-block--h3");
    });
  });
});
