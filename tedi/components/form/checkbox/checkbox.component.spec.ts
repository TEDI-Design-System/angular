import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CheckboxComponent } from "./checkbox.component";

describe("CheckboxComponent", () => {
  let fixture: ComponentFixture<CheckboxComponent>;
  let element: HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CheckboxComponent],
    });

    fixture = TestBed.createComponent(CheckboxComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should not have large class by default", () => {
    expect(element.classList).not.toContain("tedi-checkbox--large");
  });

  it("should apply large class", () => {
    fixture.componentRef.setInput("size", "large");
    fixture.detectChanges();
    expect(element.classList).toContain("tedi-checkbox--large");
  });

  it("should not have invalid class by default", () => {
    expect(element.classList).not.toContain("tedi-checkbox--invalid");
  });

  it("should apply invalid class", () => {
    fixture.componentRef.setInput("invalid", true);
    fixture.detectChanges();
    expect(element.classList).toContain("tedi-checkbox--invalid");
  });
});
