import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import {
  HorizontalStepperComponent,
  HorizontalStepperCompact,
} from "./horizontal-stepper.component";
import { HorizontalStepperItemComponent } from "./horizontal-stepper-item/horizontal-stepper-item.component";

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
  imports: [HorizontalStepperComponent, HorizontalStepperItemComponent],
  template: `
    <tedi-horizontal-stepper
      [ariaLabel]="ariaLabel"
      [background]="background"
      [compact]="compact"
    >
      <tedi-horizontal-stepper-item label="Request" completed />
      <tedi-horizontal-stepper-item label="Application" selected />
      <tedi-horizontal-stepper-item label="General info" />
      <tedi-horizontal-stepper-item label="Response" />
    </tedi-horizontal-stepper>
  `,
})
class TestHostComponent {
  ariaLabel = "Form progress";
  background: "default" | "transparent" = "default";
  compact: HorizontalStepperCompact = "sm";
}

describe("HorizontalStepperComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  function getStepper(): HTMLElement {
    return fixture.nativeElement.querySelector("tedi-horizontal-stepper");
  }

  function getItems(): NodeListOf<HTMLElement> {
    return fixture.nativeElement.querySelectorAll(
      "tedi-horizontal-stepper-item",
    );
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

  it("should have tedi-horizontal-stepper class", () => {
    expect(getStepper().classList).toContain("tedi-horizontal-stepper");
  });

  it("should have navigation role", () => {
    expect(getStepper().getAttribute("role")).toBe("navigation");
  });

  it("should set aria-label", () => {
    expect(getStepper().getAttribute("aria-label")).toBe("Form progress");
  });

  it("should render all step items", () => {
    expect(getItems().length).toBe(4);
  });

  it("should assign step numbers to items", () => {
    const numbers = fixture.nativeElement.querySelectorAll(
      ".tedi-horizontal-stepper-item__number",
    );
    // Item 1 is completed (no number), item 2 is selected (shows number)
    // Items 3 and 4 are default (show numbers)
    // Step 2 = selected, step 3 and 4 = default
    expect(numbers.length).toBe(3);
    expect(numbers[0].textContent.trim()).toBe("2");
    expect(numbers[1].textContent.trim()).toBe("3");
    expect(numbers[2].textContent.trim()).toBe("4");
  });

  it("should apply transparent background class", () => {
    host.background = "transparent";
    fixture.detectChanges();

    expect(getStepper().classList).toContain(
      "tedi-horizontal-stepper--transparent",
    );
  });

  it("should not apply transparent class by default", () => {
    expect(getStepper().classList).not.toContain(
      "tedi-horizontal-stepper--transparent",
    );
  });

  it("should apply correct states to items", () => {
    const items = getItems();

    expect(items[0].classList).toContain(
      "tedi-horizontal-stepper-item--completed",
    );
    expect(items[1].classList).toContain(
      "tedi-horizontal-stepper-item--selected",
    );
    expect(items[2].classList).not.toContain(
      "tedi-horizontal-stepper-item--selected",
    );
    expect(items[3].classList).not.toContain(
      "tedi-horizontal-stepper-item--completed",
    );
  });

  describe("compact input", () => {
    it("should apply compact-sm class by default", () => {
      expect(getStepper().classList).toContain(
        "tedi-horizontal-stepper--compact-sm",
      );
      expect(getStepper().classList).not.toContain(
        "tedi-horizontal-stepper--compact",
      );
    });

    it("should apply compact class when compact is true", () => {
      host.compact = true;
      fixture.detectChanges();

      expect(getStepper().classList).toContain(
        "tedi-horizontal-stepper--compact",
      );
      expect(getStepper().classList).not.toContain(
        "tedi-horizontal-stepper--compact-sm",
      );
    });

    it("should not apply any compact class when compact is false", () => {
      host.compact = false;
      fixture.detectChanges();

      const classes = Array.from(getStepper().classList);
      expect(classes.some((c) => c.startsWith("tedi-horizontal-stepper--compact"))).toBe(false);
    });

    it("should apply the matching breakpoint class", () => {
      for (const bp of ["sm", "md", "lg", "xl"] as const) {
        host.compact = bp;
        fixture.detectChanges();

        expect(getStepper().classList).toContain(
          `tedi-horizontal-stepper--compact-${bp}`,
        );
      }
    });
  });
});
