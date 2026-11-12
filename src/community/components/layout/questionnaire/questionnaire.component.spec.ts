import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import {
  TEDI_TRANSLATION_DEFAULT_TOKEN,
  TediTranslationService,
} from "@tedi-design-system/angular/tedi";
import {
  QuestionnaireComponent,
  QuestionnaireStep,
} from "./questionnaire.component";

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

const STEPS: QuestionnaireStep[] = [
  { label: "One" },
  { label: "Two" },
  { label: "Three", disabled: true },
];

const providers = [
  { provide: TediTranslationService, useClass: TranslationMock },
  { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
];

describe("QuestionnaireComponent", () => {
  let fixture: ComponentFixture<QuestionnaireComponent>;
  let component: QuestionnaireComponent;
  let el: HTMLElement;

  const steps = () =>
    Array.from(
      el.querySelectorAll<HTMLButtonElement>(".tedi-questionnaire__step"),
    );
  const backButton = () =>
    el.querySelector<HTMLButtonElement>(".tedi-questionnaire__header button");
  const progressBar = () =>
    el.querySelector(".tedi-segmented-progress__bar") as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [QuestionnaireComponent],
      providers,
    });
    fixture = TestBed.createComponent(QuestionnaireComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.componentRef.setInput("heading", "Questionnaire");
    fixture.componentRef.setInput("steps", STEPS);
    fixture.detectChanges();
  });

  it("renders the heading and numbered steps", () => {
    expect(el.classList).toContain("tedi-questionnaire");
    expect(el.querySelector("h1")?.textContent).toBe("Questionnaire");
    expect(steps().map((s) => s.textContent?.replace(/\s+/g, ""))).toEqual([
      "1One",
      "2Two",
      "3Three",
    ]);
    expect(
      el.querySelector("nav")?.getAttribute("aria-label"),
    ).toBe("questionnaire.steps");
  });

  it("marks the active step", () => {
    expect(steps()[0].getAttribute("aria-current")).toBe("step");
    expect(steps()[0].classList).toContain("tedi-questionnaire__step--active");
    expect(steps()[1].hasAttribute("aria-current")).toBe(false);
  });

  it("changes the active step on click", () => {
    steps()[1].click();
    fixture.detectChanges();
    expect(component.activeStep()).toBe(1);
    expect(steps()[1].getAttribute("aria-current")).toBe("step");
  });

  it("does not select a disabled step", () => {
    expect(steps()[2].disabled).toBe(true);
    component.selectStep(2);
    expect(component.activeStep()).toBe(0);
  });

  it("renders one progress segment per step, driven by activeStep", () => {
    expect(
      el.querySelectorAll(".tedi-segmented-progress__segment").length,
    ).toBe(3);
    expect(progressBar().getAttribute("aria-valuenow")).toBe("0");
    expect(progressBar().getAttribute("aria-label")).toBe("Questionnaire");

    steps()[1].click();
    fixture.detectChanges();
    expect(progressBar().getAttribute("aria-valuenow")).toBe("1");
  });

  it("uses the progress input over activeStep", () => {
    fixture.componentRef.setInput("progress", 1.5);
    fixture.componentRef.setInput("progressLabel", "Label");
    fixture.componentRef.setInput("progressValueLabel", "2/6");
    fixture.detectChanges();
    expect(progressBar().getAttribute("aria-valuenow")).toBe("1.5");
    expect(progressBar().getAttribute("aria-valuetext")).toBe("2/6");
    expect(progressBar().getAttribute("aria-label")).toBe("Label");
  });

  it("passes per-step progress to the segments", () => {
    fixture.componentRef.setInput("progress", [1, 0, 0.5]);
    fixture.detectChanges();
    const widths = Array.from(
      el.querySelectorAll<HTMLElement>(".tedi-segmented-progress__fill"),
    ).map((f) => f.style.width);
    expect(widths).toEqual(["100%", "0%", "50%"]);
  });

  it("emits back and can hide the back button", () => {
    const spy = jest.fn();
    component.back.subscribe(spy);
    expect(backButton()?.getAttribute("aria-label")).toBe("questionnaire.back");
    backButton()?.click();
    expect(spy).toHaveBeenCalledTimes(1);

    fixture.componentRef.setInput("showBack", false);
    fixture.detectChanges();
    expect(backButton()).toBeNull();
  });
});

@Component({
  imports: [QuestionnaireComponent],
  template: `
    <tedi-questionnaire heading="H" [steps]="steps">
      <p class="question">Question</p>
      <button questionnaire-actions>Save</button>
    </tedi-questionnaire>
  `,
})
class HostComponent {
  steps = STEPS;
}

describe("QuestionnaireComponent projection", () => {
  it("projects content and actions", () => {
    TestBed.configureTestingModule({ imports: [HostComponent], providers });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(
      el.querySelector(".tedi-questionnaire__content .question"),
    ).not.toBeNull();
    expect(
      el.querySelector(".tedi-questionnaire__actions [questionnaire-actions]")
        ?.textContent,
    ).toBe("Save");
  });
});
