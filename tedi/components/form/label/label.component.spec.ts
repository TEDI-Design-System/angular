import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LabelComponent } from "./label.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

describe("LabelComponent", () => {
  let fixture: ComponentFixture<LabelComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LabelComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    });

    fixture = TestBed.createComponent(LabelComponent);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should apply default classes", () => {
    expect(element.classList).toContain("tedi-label");
    expect(element.classList).not.toContain("tedi-label--small");
  });

  it("should apply small size class", () => {
    fixture.componentRef.setInput("size", "small");
    fixture.detectChanges();

    expect(element.classList).toContain("tedi-label--small");
  });

  it("should handle required input", () => {
    fixture.componentRef.setInput("required", true);
    fixture.detectChanges();

    const requiredSpan = element.querySelector(".tedi-label--required");
    expect(requiredSpan).toBeTruthy();
    expect(requiredSpan?.getAttribute("aria-hidden")).toBe("true");

    const srOnlySpan = element.querySelector(".sr-only");
    expect(srOnlySpan).toBeTruthy();
  });
});
