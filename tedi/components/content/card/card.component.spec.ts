import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  Breakpoint,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
import { CardComponent, CardInputs } from "./card.component";
import { CardBorderRadius, CardBorderType } from "./card.utils";

const BREAKPOINT_ORDER: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "xxl"];

/**
 * Deterministic stand-in for the real BreakpointService. The real service
 * resolves the active breakpoint from a one-time BreakpointObserver
 * subscription in its constructor, which — because it is providedIn: 'root' —
 * can leak a stale instance across test files under CI's parallel workers and
 * never pick up a per-test observer mock. This mock has no such state: the
 * active breakpoint is set explicitly per test. The merge logic it mirrors is
 * covered on its own in breakpoint.service.spec.ts.
 */
class BreakpointServiceMock {
  current: Breakpoint = "xs";

  getBreakpointInputs<TInputs>(
    inputs: Record<string, unknown>,
  ): TInputs {
    let resolved: Record<string, unknown> = {};

    for (const key of Object.keys(inputs)) {
      if (!BREAKPOINT_ORDER.includes(key as Breakpoint)) {
        resolved[key] = inputs[key];
      }
    }

    for (let i = 0; i <= BREAKPOINT_ORDER.indexOf(this.current); i++) {
      const breakpointInputs = inputs[BREAKPOINT_ORDER[i]];
      if (breakpointInputs) {
        resolved = { ...resolved, ...(breakpointInputs as object) };
      }
    }

    return resolved as TInputs;
  }
}

@Component({
  standalone: true,
  imports: [CardComponent],
  template: `
    <tedi-card
      [borderless]="borderless"
      [border]="border"
      [borderRadius]="borderRadius"
      [md]="md"
    >
      <span class="projected">Content</span>
    </tedi-card>
  `,
})
class TestHostComponent {
  borderless = false;
  border?: CardBorderType;
  borderRadius?: CardBorderRadius;
  md?: CardInputs;
}

describe("CardComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  const createComponent = (currentBreakpoint: Breakpoint = "xs") => {
    const breakpointService = new BreakpointServiceMock();
    breakpointService.current = currentBreakpoint;

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: BreakpointService, useValue: breakpointService },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  };

  const cardElement = (): HTMLElement =>
    fixture.nativeElement.querySelector("tedi-card");

  it("should create and project content", () => {
    createComponent();
    expect(cardElement()).toBeTruthy();
    expect(cardElement().classList).toContain("tedi-card");
    expect(fixture.nativeElement.querySelector(".projected")).toBeTruthy();
  });

  it("should not have modifier classes by default", () => {
    createComponent();
    const classes = Array.from(cardElement().classList);
    expect(classes).toEqual(["tedi-card"]);
  });

  it("should apply borderless class", () => {
    createComponent();
    host.borderless = true;
    fixture.detectChanges();
    expect(cardElement().classList).toContain("tedi-card--borderless");
  });

  it("should apply border color without placement", () => {
    createComponent();
    host.border = "accent";
    fixture.detectChanges();
    expect(cardElement().classList).toContain("tedi-card--border--accent");
    expect(cardElement().classList).not.toContain("tedi-card--border-top");
    expect(cardElement().classList).not.toContain("tedi-card--border-left");
  });

  it("should apply left border placement with color", () => {
    createComponent();
    host.border = "left-danger-primary";
    fixture.detectChanges();
    expect(cardElement().classList).toContain("tedi-card--border-left");
    expect(cardElement().classList).toContain(
      "tedi-card--border--danger-primary",
    );
  });

  it("should apply top border placement with color", () => {
    createComponent();
    host.border = "top-info-primary";
    fixture.detectChanges();
    expect(cardElement().classList).toContain("tedi-card--border-top");
    expect(cardElement().classList).toContain(
      "tedi-card--border--info-primary",
    );
  });

  it("should remove all corner radiuses with borderRadius false", () => {
    createComponent();
    host.borderRadius = false;
    fixture.detectChanges();
    expect(cardElement().classList).toContain("tedi-card--no-radius-tl");
    expect(cardElement().classList).toContain("tedi-card--no-radius-tr");
    expect(cardElement().classList).toContain("tedi-card--no-radius-br");
    expect(cardElement().classList).toContain("tedi-card--no-radius-bl");
  });

  it("should remove corners of a side", () => {
    createComponent();
    host.borderRadius = { top: false };
    fixture.detectChanges();
    expect(cardElement().classList).toContain("tedi-card--no-radius-tl");
    expect(cardElement().classList).toContain("tedi-card--no-radius-tr");
    expect(cardElement().classList).not.toContain("tedi-card--no-radius-br");
    expect(cardElement().classList).not.toContain("tedi-card--no-radius-bl");
  });

  it("should prioritize corner overrides over side values", () => {
    createComponent();
    host.borderRadius = { bottom: false, bottomRight: true };
    fixture.detectChanges();
    expect(cardElement().classList).toContain("tedi-card--no-radius-bl");
    expect(cardElement().classList).not.toContain("tedi-card--no-radius-br");
  });

  it("should remove a single corner", () => {
    createComponent();
    host.borderRadius = { topLeft: false };
    fixture.detectChanges();
    expect(cardElement().classList).toContain("tedi-card--no-radius-tl");
    expect(cardElement().classList).not.toContain("tedi-card--no-radius-tr");
  });

  it("should apply breakpoint overrides at matching breakpoint", () => {
    createComponent("md");
    host.md = { borderless: true, border: "left-success-primary" };
    fixture.detectChanges();
    expect(cardElement().classList).toContain("tedi-card--borderless");
    expect(cardElement().classList).toContain("tedi-card--border-left");
    expect(cardElement().classList).toContain(
      "tedi-card--border--success-primary",
    );
  });

  it("should not apply breakpoint overrides below their breakpoint", () => {
    createComponent("xs");
    host.md = { borderless: true };
    fixture.detectChanges();
    expect(cardElement().classList).not.toContain("tedi-card--borderless");
  });
});
