import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  RadioCardComponent,
  RadioCardVariant,
} from "./radio-card.component";
import { RadioComponent } from "../radio/radio.component";

@Component({
  standalone: true,
  imports: [RadioCardComponent, RadioComponent],
  template: `
    <label tedi-radio-card [variant]="variant" [grouped]="grouped">
      <input tedi-radio type="radio" />
      Text
    </label>
  `,
})
class TestHostComponent {
  variant: RadioCardVariant = "primary";
  grouped = false;
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
    expect(labelElement.classList).not.toContain(
      "tedi-radio-card--secondary"
    );
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
});
