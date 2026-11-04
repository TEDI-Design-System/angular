import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FooterBodyComponent, FooterBodyInputs } from "./footer-body.component";
import { FooterSectionComponent } from "../footer-section/footer-section.component";
import {
  Breakpoint,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";

class BreakpointServiceMock {
  readonly _currentBreakpoint = signal<Breakpoint | undefined>("xl");
  readonly isBelowBreakpoint = BreakpointService.prototype.isBelowBreakpoint;
  readonly getBreakpointInputs =
    BreakpointService.prototype.getBreakpointInputs;
}

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

@Component({
  standalone: true,
  imports: [FooterBodyComponent, FooterSectionComponent],
  template: `
    <tedi-footer-body [columns]="columns()" [lg]="lg()">
      <tedi-footer-section heading="One" [collapsible]="collapsible()">
        <a href="#">Link</a>
      </tedi-footer-section>
      <div>
        <tedi-footer-section heading="Two"
          ><a href="#">Link</a></tedi-footer-section
        >
      </div>
    </tedi-footer-body>
  `,
})
class TestHostComponent {
  readonly columns = signal<number | undefined>(undefined);
  readonly lg = signal<FooterBodyInputs | undefined>(undefined);
  readonly collapsible = signal(false);
}

describe("FooterBodyComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let breakpoint: BreakpointServiceMock;
  let body: HTMLElement;

  beforeEach(async () => {
    breakpoint = new BreakpointServiceMock();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: BreakpointService, useValue: breakpoint },
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    body = fixture.nativeElement.querySelector("tedi-footer-body");
  });

  it("is a filling row by default", () => {
    expect(body.classList).toContain("tedi-footer-body");
    expect(body.classList).not.toContain("tedi-footer-body--grid");
    expect(body.style.gridTemplateColumns).toBe("");
  });

  it("lays sections out in equal columns when columns is set", () => {
    fixture.componentInstance.columns.set(3);
    fixture.detectChanges();

    expect(body.classList).toContain("tedi-footer-body--grid");
    expect(body.style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
  });

  it("applies breakpoint overrides from that breakpoint up", () => {
    fixture.componentInstance.columns.set(2);
    fixture.componentInstance.lg.set({ columns: 4 });
    fixture.detectChanges();
    expect(body.style.gridTemplateColumns).toBe("repeat(4, minmax(0, 1fr))");

    breakpoint._currentBreakpoint.set("md");
    fixture.detectChanges();
    expect(body.style.gridTemplateColumns).toBe("repeat(2, minmax(0, 1fr))");
  });

  it("stacks into one column below the mobile breakpoint, ignoring columns", () => {
    fixture.componentInstance.columns.set(3);
    breakpoint._currentBreakpoint.set("xs");
    fixture.detectChanges();

    expect(body.classList).toContain("tedi-footer-body--mobile");
    expect(body.classList).not.toContain("tedi-footer-body--grid");
  });

  it("uses the compact gap only when a section is an accordion", () => {
    breakpoint._currentBreakpoint.set("xs");
    fixture.detectChanges();
    expect(body.classList).not.toContain("tedi-footer-body--compact");

    fixture.componentInstance.collapsible.set(true);
    fixture.detectChanges();
    expect(body.classList).toContain("tedi-footer-body--compact");

    breakpoint._currentBreakpoint.set("xl");
    fixture.detectChanges();
    expect(body.classList).not.toContain("tedi-footer-body--compact");
  });
});
