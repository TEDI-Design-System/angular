import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { OptionContentComponent } from "./option-content.component";

describe("OptionContentComponent", () => {
  let fixture: ComponentFixture<OptionContentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OptionContentComponent],
    });

    fixture = TestBed.createComponent(OptionContentComponent);
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render a presentational, aria-hidden, non-tabbable checkbox", () => {
    fixture.componentRef.setInput("type", "checkbox");
    fixture.detectChanges();

    const input = fixture.debugElement.query(
      By.css(".tedi-option-content__checkbox"),
    ).nativeElement as HTMLInputElement;

    expect(input.getAttribute("aria-hidden")).toBe("true");
    expect(input.getAttribute("tabindex")).toBe("-1");
  });

  it("should render a presentational, aria-hidden, non-tabbable radio", () => {
    fixture.componentRef.setInput("type", "radio");
    fixture.detectChanges();

    const input = fixture.debugElement.query(
      By.css(".tedi-option-content__radio"),
    ).nativeElement as HTMLInputElement;

    expect(input.getAttribute("aria-hidden")).toBe("true");
    expect(input.getAttribute("tabindex")).toBe("-1");
  });
});
