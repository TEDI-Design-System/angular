import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FooterComponent } from "./footer.component";
import { FooterBodyComponent } from "./footer-body/footer-body.component";
import { FooterSideComponent } from "./footer-side/footer-side.component";
import { FooterBottomComponent } from "./footer-bottom/footer-bottom.component";
import {
  Breakpoint,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";

class BreakpointServiceMock {
  readonly _currentBreakpoint = signal<Breakpoint | undefined>("md");
  readonly isBelowBreakpoint = BreakpointService.prototype.isBelowBreakpoint;
  readonly getBreakpointInputs =
    BreakpointService.prototype.getBreakpointInputs;
}

@Component({
  standalone: true,
  imports: [
    FooterComponent,
    FooterBodyComponent,
    FooterSideComponent,
    FooterBottomComponent,
  ],
  template: `
    <tedi-footer
      [mobileBreakpoint]="mobileBreakpoint()"
      [maxWidth]="maxWidth()"
    >
      <tedi-footer-side placement="end">Logo</tedi-footer-side>
      <tedi-footer-body>Body</tedi-footer-body>
      <tedi-footer-bottom>Bottom</tedi-footer-bottom>
    </tedi-footer>
  `,
})
class TestHostComponent {
  readonly mobileBreakpoint = signal<Breakpoint>("sm");
  readonly maxWidth = signal<number | string | undefined>(undefined);
}

describe("FooterComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let breakpoint: BreakpointServiceMock;
  let element: HTMLElement;

  const container = () =>
    element.querySelector<HTMLElement>(".tedi-footer__container")!;

  beforeEach(async () => {
    breakpoint = new BreakpointServiceMock();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: BreakpointService, useValue: breakpoint }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("styles its host and renders a footer landmark that is hidden when printing", () => {
    const host = element.querySelector("tedi-footer")!;
    expect(host.classList).toContain("tedi-footer");
    expect(host.classList).toContain("no-print");
    expect(host.querySelector("footer")).not.toBeNull();
  });

  it("projects the sides and body into the container and the bottom after it", () => {
    expect(container().querySelector("tedi-footer-side")).not.toBeNull();
    expect(container().querySelector("tedi-footer-body")).not.toBeNull();
    expect(container().querySelector("tedi-footer-bottom")).toBeNull();
    expect(element.querySelector("footer > tedi-footer-bottom")).not.toBeNull();
  });

  it("stacks below mobileBreakpoint and shares that state with its parts", () => {
    expect(container().classList).not.toContain(
      "tedi-footer__container--mobile",
    );

    fixture.componentInstance.mobileBreakpoint.set("lg");
    fixture.detectChanges();

    expect(container().classList).toContain("tedi-footer__container--mobile");
    expect(element.querySelector("tedi-footer-body")!.classList).toContain(
      "tedi-footer-body--mobile",
    );
    expect(element.querySelector("tedi-footer-side")!.classList).toContain(
      "tedi-footer-side--mobile",
    );
    expect(element.querySelector("tedi-footer-bottom")!.classList).toContain(
      "tedi-footer-bottom--mobile",
    );
  });

  it("follows the viewport breakpoint", () => {
    breakpoint._currentBreakpoint.set("xs");
    fixture.detectChanges();
    expect(container().classList).toContain("tedi-footer__container--mobile");
  });

  it.each([
    { maxWidth: 1280, expected: "1280px" },
    { maxWidth: "1280", expected: "1280px" },
    { maxWidth: "80rem", expected: "80rem" },
  ])(
    "caps the container and bottom content to maxWidth $maxWidth",
    ({ maxWidth, expected }) => {
      fixture.componentInstance.maxWidth.set(maxWidth);
      fixture.detectChanges();

      expect(container().style.maxWidth).toBe(expected);
      expect(
        element.querySelector<HTMLElement>(".tedi-footer-bottom__inner")!.style
          .maxWidth,
      ).toBe(expected);
    },
  );

  it("does not cap the width by default or when emptied", () => {
    expect(container().style.maxWidth).toBe("");

    fixture.componentInstance.maxWidth.set("");
    fixture.detectChanges();
    expect(container().style.maxWidth).toBe("");
  });
});
