import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CheckboxCardGroupComponent } from "./checkbox-card-group.component";
import { CheckboxCardComponent } from "../checkbox-card/checkbox-card.component";
import { CheckboxComponent } from "../checkbox/checkbox.component";

@Component({
  standalone: true,
  imports: [CheckboxCardGroupComponent, CheckboxCardComponent, CheckboxComponent],
  template: `
    <tedi-checkbox-card-group>
      <label tedi-checkbox-card variant="primary">
        <input tedi-checkbox type="checkbox" />
        Option 1
      </label>
      <label tedi-checkbox-card variant="primary">
        <input tedi-checkbox type="checkbox" />
        Option 2
      </label>
    </tedi-checkbox-card-group>
  `,
})
class TestHostComponent {}

describe("CheckboxCardGroupComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let groupElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    groupElement = fixture.nativeElement.querySelector(
      "tedi-checkbox-card-group"
    );
  });

  it("should create component", () => {
    expect(groupElement).toBeTruthy();
    expect(groupElement.classList).toContain("tedi-checkbox-card-group");
  });

  it("should project card content", () => {
    const cards = groupElement.querySelectorAll("label[tedi-checkbox-card]");
    expect(cards.length).toBe(2);
  });
});
