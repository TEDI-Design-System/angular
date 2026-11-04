import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  FooterSideComponent,
  FooterSideInputs,
  FooterSidePlacement,
  FooterSidePosition,
} from "./footer-side.component";
import {
  Breakpoint,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";

class BreakpointServiceMock {
  readonly _currentBreakpoint = signal<Breakpoint | undefined>("xl");
  readonly isBelowBreakpoint = BreakpointService.prototype.isBelowBreakpoint;
  readonly getBreakpointInputs =
    BreakpointService.prototype.getBreakpointInputs;
}

@Component({
  standalone: true,
  imports: [FooterSideComponent],
  template: `
    <tedi-footer-side
      [placement]="placement()"
      [position]="position()"
      [lg]="lg()"
    >
      Logo
    </tedi-footer-side>
    <tedi-footer-side tedi-footer-end>Legacy end</tedi-footer-side>
    <tedi-footer-side tedi-footer-start>Legacy start</tedi-footer-side>
  `,
})
class TestHostComponent {
  readonly placement = signal<FooterSidePlacement | undefined>(undefined);
  readonly position = signal<FooterSidePosition | undefined>("center");
  readonly lg = signal<FooterSideInputs | undefined>(undefined);
}

describe("FooterSideComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let breakpoint: BreakpointServiceMock;
  let sides: HTMLElement[];

  beforeEach(async () => {
    breakpoint = new BreakpointServiceMock();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: BreakpointService, useValue: breakpoint }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    sides = Array.from(
      fixture.nativeElement.querySelectorAll("tedi-footer-side"),
    );
  });

  it("is placed at the start and centred by default", () => {
    expect(sides[0].classList).toContain("tedi-footer-side");
    expect(sides[0].classList).toContain("tedi-footer-side--start");
    expect(sides[0].classList).toContain("tedi-footer-side--vertical-center");
  });

  it("still reads the deprecated placement attributes", () => {
    expect(sides[1].classList).toContain("tedi-footer-side--end");
    expect(sides[2].classList).toContain("tedi-footer-side--start");
  });

  it.each(["start", "center", "end"] as const)(
    "aligns content to position '%s'",
    (position) => {
      host.position.set(position);
      fixture.detectChanges();
      expect(sides[0].classList).toContain(
        `tedi-footer-side--vertical-${position}`,
      );
    },
  );

  it("applies breakpoint overrides from that breakpoint up", () => {
    host.placement.set("end");
    host.lg.set({ placement: "start", position: "start" });
    fixture.detectChanges();
    expect(sides[0].classList).toContain("tedi-footer-side--start");
    expect(sides[0].classList).toContain("tedi-footer-side--vertical-start");

    breakpoint._currentBreakpoint.set("md");
    fixture.detectChanges();
    expect(sides[0].classList).toContain("tedi-footer-side--end");
    expect(sides[0].classList).toContain("tedi-footer-side--vertical-center");
  });

  it("marks itself as mobile below the mobile breakpoint", () => {
    expect(sides[0].classList).not.toContain("tedi-footer-side--mobile");
    breakpoint._currentBreakpoint.set("xs");
    fixture.detectChanges();
    expect(sides[0].classList).toContain("tedi-footer-side--mobile");
  });
});
