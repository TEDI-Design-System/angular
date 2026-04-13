import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  RadioGroupComponent,
  RadioGroupDirection,
} from "./radio-group.component";
import { RadioComponent } from "../radio/radio.component";
import { LabelComponent } from "../label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";

@Component({
  standalone: true,
  imports: [
    RadioGroupComponent,
    RadioComponent,
    LabelComponent,
    FeedbackTextComponent,
  ],
  template: `
    <tedi-radio-group [label]="label" [direction]="direction">
      <label tedi-label color="primary" class="flex align-items-center gap-2">
        <input tedi-radio type="radio" name="test" />
        Option 1
      </label>
      <label tedi-label color="primary" class="flex align-items-center gap-2">
        <input tedi-radio type="radio" name="test" />
        Option 2
      </label>
      @if (showFeedback) {
        <tedi-feedback-text text="Hint text" />
      }
    </tedi-radio-group>
  `,
})
class TestHostComponent {
  label?: string;
  direction: RadioGroupDirection = "horizontal";
  showFeedback = false;
}

describe("RadioGroupComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let groupElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    groupElement = fixture.nativeElement.querySelector("tedi-radio-group");
  });

  it("should create component", () => {
    expect(groupElement).toBeTruthy();
    expect(groupElement.classList).toContain("tedi-radio-group");
  });

  it("should not render label when not provided", () => {
    const label = groupElement.querySelector(".tedi-radio-group__label");
    expect(label).toBeFalsy();
  });

  it("should render label when provided", () => {
    fixture.componentInstance.label = "Group Label";
    fixture.detectChanges();
    const label = groupElement.querySelector(".tedi-radio-group__label");
    expect(label).toBeTruthy();
    expect(label?.textContent?.trim()).toBe("Group Label");
  });

  it("should use horizontal direction by default", () => {
    const checks = groupElement.querySelector(".tedi-radio-group__checks");
    expect(checks?.classList).not.toContain(
      "tedi-radio-group__checks--vertical"
    );
  });

  it("should apply vertical direction class", () => {
    fixture.componentInstance.direction = "vertical";
    fixture.detectChanges();
    const checks = groupElement.querySelector(".tedi-radio-group__checks");
    expect(checks?.classList).toContain("tedi-radio-group__checks--vertical");
  });

  it("should project radio content into checks container", () => {
    const checks = groupElement.querySelector(".tedi-radio-group__checks");
    const inputs = checks?.querySelectorAll('input[type="radio"]');
    expect(inputs?.length).toBe(2);
  });

  it("should project feedback text into subtexts container", () => {
    fixture.componentInstance.showFeedback = true;
    fixture.detectChanges();
    const subtexts = groupElement.querySelector(
      ".tedi-radio-group__subtexts"
    );
    const feedbackText = subtexts?.querySelector("tedi-feedback-text");
    expect(feedbackText).toBeTruthy();
  });
});
