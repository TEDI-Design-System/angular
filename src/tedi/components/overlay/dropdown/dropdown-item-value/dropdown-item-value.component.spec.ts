import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DropdownItemValueComponent } from "./dropdown-item-value.component";

describe("DropdownItemValueComponent", () => {
  let fixture: ComponentFixture<DropdownItemValueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DropdownItemValueComponent],
    });

    fixture = TestBed.createComponent(DropdownItemValueComponent);
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render a presentational, aria-hidden, non-tabbable checkbox", () => {
    fixture.componentRef.setInput("type", "checkbox");
    fixture.detectChanges();

    const input = fixture.debugElement.query(
      By.css(".tedi-dropdown-item-value__checkbox"),
    ).nativeElement as HTMLInputElement;

    expect(input.getAttribute("aria-hidden")).toBe("true");
    expect(input.getAttribute("tabindex")).toBe("-1");
  });

  it("should render a presentational, aria-hidden, non-tabbable radio", () => {
    fixture.componentRef.setInput("type", "radio");
    fixture.detectChanges();

    const input = fixture.debugElement.query(
      By.css(".tedi-dropdown-item-value__radio"),
    ).nativeElement as HTMLInputElement;

    expect(input.getAttribute("aria-hidden")).toBe("true");
    expect(input.getAttribute("tabindex")).toBe("-1");
  });
});
