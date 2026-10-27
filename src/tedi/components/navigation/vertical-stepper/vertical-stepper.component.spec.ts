import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { VerticalStepperComponent } from "./vertical-stepper.component";
import { VerticalStepperItemComponent } from "./vertical-stepper-item/vertical-stepper-item.component";

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
  imports: [VerticalStepperComponent, VerticalStepperItemComponent],
  template: `
    <tedi-vertical-stepper
      [ariaLabel]="ariaLabel()"
      [compact]="compact()"
      [enumerated]="enumerated()"
    >
      <tedi-vertical-stepper-item title="Kutse" completed />
      <tedi-vertical-stepper-item title="Tahteavaldus" [opened]="true">
        <tedi-vertical-stepper-item title="Sõbrad" completed />
        <tedi-vertical-stepper-item title="Pere" />
      </tedi-vertical-stepper-item>
      <tedi-vertical-stepper-item title="Vastus" selected />
    </tedi-vertical-stepper>
  `,
})
class TestHostComponent {
  ariaLabel = signal("Taotluse menetlus");
  compact = signal(false);
  enumerated = signal(false);
}

@Component({
  standalone: true,
  imports: [VerticalStepperComponent, VerticalStepperItemComponent],
  template: `
    <tedi-vertical-stepper>
      @for (step of steps; track step) {
        <tedi-vertical-stepper-item [title]="step" [opened]="true">
          @for (sub of subSteps; track sub) {
            <tedi-vertical-stepper-item [title]="sub" />
          }
        </tedi-vertical-stepper-item>
      }
    </tedi-vertical-stepper>
  `,
})
class LoopHostComponent {
  steps = ["Kutse", "Tahteavaldus", "Vastus"];
  subSteps = ["Sõbrad", "Pere"];
}

describe("VerticalStepperComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  function getStepper(): HTMLElement {
    return fixture.nativeElement.querySelector("tedi-vertical-stepper");
  }

  function getNumbers(): string[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll(
        ".tedi-vertical-stepper-item__number",
      ) as NodeListOf<HTMLElement>,
    ).map((element) => element.textContent?.trim() ?? "");
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(getStepper()).toBeTruthy();
  });

  it("should expose a navigation landmark with the given name", () => {
    expect(getStepper().getAttribute("role")).toBe("navigation");
    expect(getStepper().getAttribute("aria-label")).toBe("Taotluse menetlus");
  });

  it("should render the steps in an explicit list", () => {
    const list = getStepper().querySelector("ol");

    expect(list?.getAttribute("role")).toBe("list");
    expect(
      list?.querySelectorAll(
        ':scope > tedi-vertical-stepper-item[role="listitem"]',
      ).length,
    ).toBe(3);
  });

  it("should number the steps in source order", () => {
    expect(getNumbers()).toEqual(["1", "2", "3"]);
  });

  it("should not number the sub-steps", () => {
    expect(
      fixture.nativeElement.querySelectorAll(
        ".tedi-vertical-stepper-item--sub-item .tedi-vertical-stepper-item__number",
      ).length,
    ).toBe(0);
  });

  it("should not apply the compact class by default", () => {
    expect(getStepper().classList).not.toContain(
      "tedi-vertical-stepper--compact",
    );
  });

  it("should apply the compact class and drop the indicator numbers", () => {
    host.compact.set(true);
    fixture.detectChanges();

    expect(getStepper().classList).toContain("tedi-vertical-stepper--compact");
    expect(getNumbers()).toEqual([]);
  });

  it("should print numbers in front of compact labels when asked", () => {
    host.compact.set(true);
    host.enumerated.set(true);
    fixture.detectChanges();

    const prefixes = Array.from(
      fixture.nativeElement.querySelectorAll(
        ".tedi-vertical-stepper-item__number-prefix",
      ) as NodeListOf<HTMLElement>,
    ).map((element) => element.textContent?.trim());

    expect(prefixes).toEqual(["1.", "2.", "3."]);
  });

  it("should not print number prefixes at the default density", () => {
    host.enumerated.set(true);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelectorAll(
        ".tedi-vertical-stepper-item__number-prefix",
      ).length,
    ).toBe(0);
  });
});

describe("VerticalStepperComponent in a loop", () => {
  let fixture: ComponentFixture<LoopHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LoopHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    fixture = TestBed.createComponent(LoopHostComponent);
    fixture.detectChanges();
  });

  it("should number steps rendered by a control flow block", () => {
    const numbers = Array.from(
      fixture.nativeElement.querySelectorAll(
        ".tedi-vertical-stepper-item__number",
      ) as NodeListOf<HTMLElement>,
    ).map((element) => element.textContent?.trim());

    expect(numbers).toEqual(["1", "2", "3"]);
  });

  it("should collect looped sub-steps into their step's sub-list", () => {
    expect(
      fixture.nativeElement.querySelectorAll(
        ".tedi-vertical-stepper-item__sub-list > .tedi-vertical-stepper-item--sub-item",
      ).length,
    ).toBe(6);
    expect(
      fixture.nativeElement.querySelectorAll(
        ".tedi-vertical-stepper-item__toggle",
      ).length,
    ).toBe(3);
  });
});
