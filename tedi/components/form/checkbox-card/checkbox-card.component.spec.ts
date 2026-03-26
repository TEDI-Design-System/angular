import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  CheckboxCardComponent,
  CheckboxCardVariant,
} from "./checkbox-card.component";
import { CheckboxComponent } from "../checkbox/checkbox.component";

@Component({
  standalone: true,
  imports: [CheckboxCardComponent, CheckboxComponent],
  template: `
    <label tedi-checkbox-card [variant]="variant">
      <input tedi-checkbox type="checkbox" />
      Text
    </label>
  `,
})
class TestHostComponent {
  variant: CheckboxCardVariant = "primary";
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
});
