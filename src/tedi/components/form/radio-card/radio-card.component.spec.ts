import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RadioCardComponent, RadioCardVariant } from "./radio-card.component";
import { RadioCardGroupComponent } from "../radio-card-group/radio-card-group.component";
import { RadioComponent } from "../radio/radio.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";

@Component({
  standalone: true,
  imports: [RadioCardComponent, RadioComponent, FeedbackTextComponent],
  template: `
    <label
      tedi-radio-card
      [variant]="variant"
      [grouped]="grouped"
      [showIndicator]="showIndicator"
    >
      <input tedi-radio type="radio" />
      Text
      @if (showDescription) {
        <tedi-feedback-text text="Description" />
      }
    </label>
  `,
})
class TestHostComponent {
  variant: RadioCardVariant = "primary";
  grouped = false;
  showDescription = false;
  showIndicator = true;
}

describe("RadioCardComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let labelElement: HTMLLabelElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    labelElement = fixture.nativeElement.querySelector("label");
  });

  it("should create component", () => {
    expect(labelElement).toBeTruthy();
    expect(labelElement.classList).toContain("tedi-radio-card");
  });

  it("should apply primary class by default", () => {
    expect(labelElement.classList).toContain("tedi-radio-card--primary");
    expect(labelElement.classList).not.toContain("tedi-radio-card--secondary");
  });

  it("should apply secondary class", () => {
    fixture.componentInstance.variant = "secondary";
    fixture.detectChanges();
    expect(labelElement.classList).toContain("tedi-radio-card--secondary");
    expect(labelElement.classList).not.toContain("tedi-radio-card--primary");
  });

  it("should contain a radio input", () => {
    const input = labelElement.querySelector('input[type="radio"]');
    expect(input).toBeTruthy();
  });

  it("should not have grouped class by default", () => {
    expect(labelElement.classList).not.toContain("tedi-radio-card--grouped");
  });

  it("should apply grouped class", () => {
    fixture.componentInstance.grouped = true;
    fixture.detectChanges();
    expect(labelElement.classList).toContain("tedi-radio-card--grouped");
  });

  it("should project content into content wrapper", () => {
    const content = labelElement.querySelector(".tedi-radio-card__content");
    expect(content).toBeTruthy();
    const input = content?.querySelector('input[type="radio"]');
    expect(input).toBeTruthy();
  });

  it("should project feedback text as description", () => {
    fixture.componentInstance.showDescription = true;
    fixture.detectChanges();
    const feedbackText = labelElement.querySelector("tedi-feedback-text");
    expect(feedbackText).toBeTruthy();
    expect(feedbackText?.parentElement).toBe(labelElement);
  });

  it("should show indicator by default", () => {
    expect(labelElement.classList).not.toContain(
      "tedi-radio-card--hide-indicator",
    );
  });

  it("should hide indicator when showIndicator is false", () => {
    fixture.componentInstance.showIndicator = false;
    fixture.detectChanges();
    expect(labelElement.classList).toContain("tedi-radio-card--hide-indicator");
  });
});

@Component({
  standalone: true,
  imports: [RadioCardComponent, RadioCardGroupComponent, RadioComponent],
  template: `
    <tedi-radio-card-group [grouped]="groupGrouped">
      <label tedi-radio-card [grouped]="cardGrouped">
        <input tedi-radio type="radio" name="inherit-test" />
        Option
      </label>
    </tedi-radio-card-group>
  `,
})
class InheritanceHostComponent {
  groupGrouped = false;
  cardGrouped = false;
}

describe("RadioCardComponent — grouped inheritance", () => {
  let fixture: ComponentFixture<InheritanceHostComponent>;
  let labelElement: HTMLLabelElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [InheritanceHostComponent] });
    fixture = TestBed.createComponent(InheritanceHostComponent);
    fixture.detectChanges();
    labelElement = fixture.nativeElement.querySelector(
      "label[tedi-radio-card]",
    );
  });

  it("should not be grouped when neither input is set", () => {
    expect(labelElement.classList).not.toContain("tedi-radio-card--grouped");
  });

  it("should be grouped when parent group is grouped", () => {
    fixture.componentInstance.groupGrouped = true;
    fixture.detectChanges();
    expect(labelElement.classList).toContain("tedi-radio-card--grouped");
  });

  it("should be grouped when card's own input is set", () => {
    fixture.componentInstance.cardGrouped = true;
    fixture.detectChanges();
    expect(labelElement.classList).toContain("tedi-radio-card--grouped");
  });
});
