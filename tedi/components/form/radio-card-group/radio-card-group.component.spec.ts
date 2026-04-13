import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RadioCardGroupComponent } from "./radio-card-group.component";
import { RadioCardComponent } from "../radio-card/radio-card.component";
import { RadioComponent } from "../radio/radio.component";

@Component({
  standalone: true,
  imports: [RadioCardGroupComponent, RadioCardComponent, RadioComponent],
  template: `
    <tedi-radio-card-group>
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
class TestHostComponent {}

describe("RadioCardGroupComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let groupElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    groupElement = fixture.nativeElement.querySelector(
      "tedi-radio-card-group"
    );
  });

  it("should create component", () => {
    expect(groupElement).toBeTruthy();
    expect(groupElement.classList).toContain("tedi-radio-card-group");
  });

  it("should project card content", () => {
    const cards = groupElement.querySelectorAll("label[tedi-radio-card]");
    expect(cards.length).toBe(2);
  });
});
