import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  CheckboxCardComponent,
  CheckboxCardVariant,
} from "./checkbox-card.component";
import { CheckboxComponent } from "../checkbox/checkbox.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";

@Component({
  standalone: true,
  imports: [CheckboxCardComponent, CheckboxComponent, FeedbackTextComponent],
  template: `
    <label tedi-checkbox-card [variant]="variant" [showIndicator]="showIndicator">
      <input tedi-checkbox type="checkbox" />
      Text
      @if (showDescription) {
        <tedi-feedback-text text="Description" />
      }
    </label>
  `,
})
class TestHostComponent {
  variant: CheckboxCardVariant = "primary";
  showDescription = false;
  showIndicator = true;
}

describe("CheckboxCardComponent", () => {
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
    expect(labelElement.classList).toContain("tedi-checkbox-card");
  });

  it("should apply primary class by default", () => {
    expect(labelElement.classList).toContain("tedi-checkbox-card--primary");
    expect(labelElement.classList).not.toContain(
      "tedi-checkbox-card--secondary"
    );
  });

  it("should apply secondary class", () => {
    fixture.componentInstance.variant = "secondary";
    fixture.detectChanges();
    expect(labelElement.classList).toContain("tedi-checkbox-card--secondary");
    expect(labelElement.classList).not.toContain("tedi-checkbox-card--primary");
  });

  it("should contain a checkbox input", () => {
    const input = labelElement.querySelector('input[type="checkbox"]');
    expect(input).toBeTruthy();
  });

  it("should project content into content wrapper", () => {
    const content = labelElement.querySelector(
      ".tedi-checkbox-card__content"
    );
    expect(content).toBeTruthy();
    const input = content?.querySelector('input[type="checkbox"]');
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
      "tedi-checkbox-card--hide-indicator"
    );
  });

  it("should hide indicator when showIndicator is false", () => {
    fixture.componentInstance.showIndicator = false;
    fixture.detectChanges();
    expect(labelElement.classList).toContain(
      "tedi-checkbox-card--hide-indicator"
    );
  });
});
