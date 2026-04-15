import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";
import { HorizontalStepperItemComponent } from "./horizontal-stepper-item.component";

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
  imports: [HorizontalStepperItemComponent],
  template: `
    <tedi-horizontal-stepper-item
      [label]="label"
      [description]="description"
      [completed]="completed"
      [error]="error"
      [selected]="selected"
      (stepSelect)="onStepSelect()"
    />
  `,
})
class TestHostComponent {
  label = "Step";
  description?: string;
  completed = false;
  error = false;
  selected = false;
  onStepSelect = jest.fn();
}

describe("HorizontalStepperItemComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  function getItem(): HTMLElement {
    return fixture.nativeElement.querySelector("tedi-horizontal-stepper-item");
  }

  function getButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector(
      ".tedi-horizontal-stepper-item__step",
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
    expect(getItem()).toBeTruthy();
  });

  it("should have tedi-horizontal-stepper-item class", () => {
    expect(getItem().classList).toContain("tedi-horizontal-stepper-item");
  });

  it("should render label text", () => {
    const label = fixture.nativeElement.querySelector(
      ".tedi-horizontal-stepper-item__label",
    );
    expect(label.textContent.trim()).toBe("Step");
  });

  it("should render step number when set", () => {
    const itemComponent = fixture.debugElement.children[0].componentInstance;
    itemComponent._stepNumber.set(3);
    fixture.detectChanges();

    const number = fixture.nativeElement.querySelector(
      ".tedi-horizontal-stepper-item__number",
    );
    expect(number.textContent.trim()).toBe("3");
  });

  it("should render description when provided", () => {
    host.description = "Some description";
    fixture.detectChanges();

    const desc = fixture.nativeElement.querySelector(
      ".tedi-horizontal-stepper-item__description",
    );
    expect(desc).toBeTruthy();
    expect(desc.textContent.trim()).toBe("Some description");
  });

  it("should not render description when not provided", () => {
    const desc = fixture.nativeElement.querySelector(
      ".tedi-horizontal-stepper-item__description",
    );
    expect(desc).toBeFalsy();
  });

  it("should apply selected class and aria-current", () => {
    host.selected = true;
    fixture.detectChanges();

    expect(getItem().classList).toContain(
      "tedi-horizontal-stepper-item--selected",
    );
    expect(getButton().getAttribute("aria-current")).toBe("step");
  });

  it("should not set aria-current when not selected", () => {
    expect(getButton().getAttribute("aria-current")).toBeNull();
  });

  it("should apply completed class and show check icon", () => {
    host.completed = true;
    fixture.detectChanges();

    expect(getItem().classList).toContain(
      "tedi-horizontal-stepper-item--completed",
    );

    const icon = fixture.nativeElement.querySelector("tedi-icon");
    expect(icon).toBeTruthy();
    expect(icon.textContent).toContain("check");
  });

  it("should apply error class and show exclamation icon", () => {
    host.error = true;
    fixture.detectChanges();

    expect(getItem().classList).toContain(
      "tedi-horizontal-stepper-item--error",
    );

    const icon = fixture.nativeElement.querySelector("tedi-icon");
    expect(icon).toBeTruthy();
    expect(icon.textContent).toContain("exclamation");
  });

  it("should prioritize error over completed", () => {
    host.completed = true;
    host.error = true;
    fixture.detectChanges();

    expect(getItem().classList).toContain(
      "tedi-horizontal-stepper-item--error",
    );
    expect(getItem().classList).not.toContain(
      "tedi-horizontal-stepper-item--completed",
    );

    const icon = fixture.nativeElement.querySelector("tedi-icon");
    expect(icon.textContent).toContain("exclamation");
  });

  it("should show step number for default type", () => {
    const number = fixture.nativeElement.querySelector(
      ".tedi-horizontal-stepper-item__number",
    );
    expect(number).toBeTruthy();
  });

  it("should not show step number for completed type", () => {
    host.completed = true;
    fixture.detectChanges();

    const number = fixture.nativeElement.querySelector(
      ".tedi-horizontal-stepper-item__number",
    );
    expect(number).toBeFalsy();
  });

  it("should emit stepSelect on click", () => {
    getButton().click();
    fixture.detectChanges();

    expect(host.onStepSelect).toHaveBeenCalled();
  });

  it("should render a button element", () => {
    expect(getButton().tagName).toBe("BUTTON");
    expect(getButton().getAttribute("type")).toBe("button");
  });
});
