import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SpreadAttrsDirective } from "./spread-attrs.directive";

@Component({
  standalone: true,
  imports: [SpreadAttrsDirective],
  template: `
    <input tediSpreadAttrs [tediSpreadAttrs]="attrs" data-test="static" />
  `,
})
class TestHostComponent {
  attrs: Record<string, string | number | boolean | null | undefined> = {};
}

describe("SpreadAttrsDirective", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let input: HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    input = fixture.nativeElement.querySelector("input");
  });

  it("should create", () => {
    fixture.detectChanges();
    expect(input).toBeTruthy();
  });

  it("should apply attributes", () => {
    host.attrs = {
      inputmode: "numeric",
      autocomplete: "off",
    };

    fixture.detectChanges();

    expect(input.getAttribute("inputmode")).toBe("numeric");
    expect(input.getAttribute("autocomplete")).toBe("off");
  });

  it("should remove attribute when set to null", () => {
    host.attrs = { inputmode: "numeric" };
    fixture.detectChanges();

    host.attrs = { inputmode: null };
    fixture.detectChanges();

    expect(input.hasAttribute("inputmode")).toBeFalsy();
  });

  it("should apply data attributes", () => {
    host.attrs = {
      "data-testid": "username-input",
    };

    fixture.detectChanges();

    expect(input.getAttribute("data-testid")).toBe("username-input");
  });

  it("should apply aria attributes", () => {
    host.attrs = {
      "aria-label": "Custom label",
    };

    fixture.detectChanges();

    expect(input.getAttribute("aria-label")).toBe("Custom label");
  });
});
