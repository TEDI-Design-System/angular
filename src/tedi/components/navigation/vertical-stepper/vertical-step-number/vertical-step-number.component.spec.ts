import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  VerticalStepNumberComponent,
  VerticalStepNumberType,
} from "./vertical-step-number.component";

describe("VerticalStepNumberComponent", () => {
  let fixture: ComponentFixture<VerticalStepNumberComponent>;

  function host(): HTMLElement {
    return fixture.nativeElement;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [VerticalStepNumberComponent] });
    fixture = TestBed.createComponent(VerticalStepNumberComponent);
    fixture.componentRef.setInput("number", 3);
    fixture.detectChanges();
  });

  it("should render the number", () => {
    expect(host().textContent?.trim()).toBe("3");
    expect(host().classList).toContain("tedi-vertical-step-number");
  });

  it("should default to the default type", () => {
    expect(host().classList).toContain("tedi-vertical-step-number--default");
  });

  it.each<VerticalStepNumberType>([
    "success",
    "danger",
    "selected",
    "disabled",
  ])("should apply the %s type class alone", (type) => {
    fixture.componentRef.setInput("type", type);
    fixture.detectChanges();

    const typeClasses = Array.from(host().classList).filter((name) =>
      name.startsWith("tedi-vertical-step-number--"),
    );

    expect(typeClasses).toEqual([`tedi-vertical-step-number--${type}`]);
  });
});
