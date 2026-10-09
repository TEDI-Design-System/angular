import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RadioCardGroupComponent } from "./radio-card-group.component";
import { RadioCardComponent } from "../radio-card/radio-card.component";
import { RadioComponent } from "../radio/radio.component";

@Component({
  standalone: true,
  imports: [RadioCardGroupComponent, RadioCardComponent, RadioComponent],
  template: `
    <tedi-radio-card-group [grouped]="grouped">
      <label tedi-radio-card variant="primary">
        <input tedi-radio type="radio" name="test" />
        Option 1
      </label>
      <label tedi-radio-card variant="primary">
        <input tedi-radio type="radio" name="test" />
        Option 2
      </label>
    </tedi-radio-card-group>
  `,
})
class TestHostComponent {
  grouped = false;
}

describe("RadioCardGroupComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let groupElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    groupElement = fixture.nativeElement.querySelector("tedi-radio-card-group");
  });

  it("should create component", () => {
    expect(groupElement).toBeTruthy();
    expect(groupElement.classList).toContain("tedi-radio-card-group");
  });

  it("should project card content", () => {
    const cards = groupElement.querySelectorAll("label[tedi-radio-card]");
    expect(cards.length).toBe(2);
  });

  it("should not have grouped class by default", () => {
    expect(groupElement.classList).not.toContain(
      "tedi-radio-card-group--grouped",
    );
  });

  it("should apply grouped class when grouped input is true", () => {
    fixture.componentInstance.grouped = true;
    fixture.detectChanges();
    expect(groupElement.classList).toContain("tedi-radio-card-group--grouped");
  });

  it("should propagate grouped state to child cards", () => {
    fixture.componentInstance.grouped = true;
    fixture.detectChanges();
    const cards = Array.from(
      groupElement.querySelectorAll("label[tedi-radio-card]"),
    );
    expect(cards.length).toBe(2);
    for (const card of cards) {
      expect(card.classList).toContain("tedi-radio-card--grouped");
    }
  });

  it("should not apply grouped class to children when group is not grouped", () => {
    const cards = Array.from(
      groupElement.querySelectorAll("label[tedi-radio-card]"),
    );
    for (const card of cards) {
      expect(card.classList).not.toContain("tedi-radio-card--grouped");
    }
  });
});
