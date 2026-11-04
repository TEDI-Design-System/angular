import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FooterSectionComponent } from "./footer-section.component";
import {
  Breakpoint,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";

class BreakpointServiceMock {
  readonly _currentBreakpoint = signal<Breakpoint | undefined>("xl");
  readonly isBelowBreakpoint = BreakpointService.prototype.isBelowBreakpoint;
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
  imports: [FooterSectionComponent],
  template: `
    <tedi-footer-section
      heading="Kontakt"
      [icon]="icon()"
      [iconBreakpoint]="iconBreakpoint()"
      [collapsible]="collapsible()"
      [collapse]="collapse()"
      [defaultOpen]="defaultOpen()"
    >
      <a class="test-link" href="#">+372 555 5555</a>
    </tedi-footer-section>
  `,
})
class TestHostComponent {
  readonly icon = signal<string | undefined>("call");
  readonly iconBreakpoint = signal<Breakpoint>("lg");
  readonly collapsible = signal(false);
  readonly collapse = signal(false);
  readonly defaultOpen = signal(false);
}

describe("FooterSectionComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let breakpoint: BreakpointServiceMock;
  let section: HTMLElement;

  const toggle = () =>
    section.querySelector<HTMLButtonElement>("button[tedi-collapse-button]");

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
    host = fixture.componentInstance;
    fixture.detectChanges();
    section = fixture.nativeElement.querySelector("tedi-footer-section");
  });

  it("renders the heading, icon and content on desktop", () => {
    expect(
      section.querySelector(".tedi-footer-section__heading")?.textContent,
    ).toContain("Kontakt");
    expect(section.querySelector(".tedi-footer-section__icon")).not.toBeNull();
    expect(section.querySelectorAll(".test-link")).toHaveLength(1);
    expect(toggle()).toBeNull();
  });

  it("hides the icon below iconBreakpoint", () => {
    breakpoint._currentBreakpoint.set("md");
    fixture.detectChanges();
    expect(section.querySelector(".tedi-footer-section__icon")).toBeNull();

    host.iconBreakpoint.set("md");
    fixture.detectChanges();
    expect(section.querySelector(".tedi-footer-section__icon")).not.toBeNull();
  });

  it("stays a plain section on mobile unless collapsible", () => {
    breakpoint._currentBreakpoint.set("xs");
    fixture.detectChanges();

    expect(section.classList).toContain("tedi-footer-section--mobile");
    expect(section.classList).not.toContain("tedi-footer-section--collapsible");
    expect(toggle()).toBeNull();
  });

  it("becomes an accordion labelled by the heading on mobile when collapsible", () => {
    host.collapsible.set(true);
    breakpoint._currentBreakpoint.set("xs");
    fixture.detectChanges();

    const button = toggle()!;
    expect(section.classList).toContain("tedi-footer-section--collapsible");
    expect(button.textContent).toContain("Kontakt");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(
      section.querySelector(
        `#${button.getAttribute("aria-controls")} .test-link`,
      ),
    ).not.toBeNull();
    expect(section.querySelectorAll(".test-link")).toHaveLength(1);

    button.click();
    fixture.detectChanges();
    expect(button.getAttribute("aria-expanded")).toBe("true");
  });

  it("keeps the projected content when switching between layouts", () => {
    host.collapsible.set(true);
    breakpoint._currentBreakpoint.set("xs");
    fixture.detectChanges();
    breakpoint._currentBreakpoint.set("xl");
    fixture.detectChanges();

    expect(toggle()).toBeNull();
    expect(section.querySelectorAll(".test-link")).toHaveLength(1);
  });

  it("opens the accordion initially with defaultOpen", () => {
    host.collapsible.set(true);
    host.defaultOpen.set(true);
    breakpoint._currentBreakpoint.set("xs");
    fixture.detectChanges();
    fixture.detectChanges();

    expect(toggle()!.getAttribute("aria-expanded")).toBe("true");
  });

  it("still supports the deprecated collapse input", () => {
    host.collapse.set(true);
    breakpoint._currentBreakpoint.set("xs");
    fixture.detectChanges();

    expect(toggle()).not.toBeNull();
  });
});
