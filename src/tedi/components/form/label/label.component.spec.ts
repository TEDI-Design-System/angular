import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LabelComponent } from "./label.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { TextFieldComponent } from "../text-field/text-field.component";
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

  describe("visuallyHidden", () => {
    it("is visible by default", () => {
      expect(element.classList).not.toContain("sr-only");
      expect(element.classList).not.toContain("tedi-label--reserve-space");
    });

    it("applies sr-only when true, so the name survives without the text showing", () => {
      fixture.componentRef.setInput("visuallyHidden", true);
      fixture.detectChanges();

      expect(element.classList).toContain("sr-only");
      expect(element.classList).not.toContain("tedi-label--reserve-space");
    });

    it("reserves the line instead of collapsing it when set to reserve-space", () => {
      fixture.componentRef.setInput("visuallyHidden", "reserve-space");
      fixture.detectChanges();

      expect(element.classList).toContain("tedi-label--reserve-space");
      expect(element.classList).not.toContain("sr-only");
    });

    it("keeps the required announcement when hidden visually", () => {
      fixture.componentRef.setInput("required", true);
      fixture.componentRef.setInput("visuallyHidden", true);
      fixture.detectChanges();

      expect(element.querySelector(".sr-only")?.textContent).toContain(
        "Kohustuslik väli",
      );
    });

    it("keeps the size class alongside the hidden state", () => {
      fixture.componentRef.setInput("size", "small");
      fixture.componentRef.setInput("visuallyHidden", "reserve-space");
      fixture.detectChanges();

      expect(element.classList).toContain("tedi-label--small");
      expect(element.classList).toContain("tedi-label--reserve-space");
    });
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

@Component({
  standalone: true,
  imports: [FormFieldComponent, LabelComponent, TextFieldComponent],
  template: `
    <tedi-form-field [size]="size">
      <label tedi-label for="sized" [size]="labelSize">Silt</label>
      <input tedi-text-field id="sized" />
    </tedi-form-field>
  `,
})
class FieldSizeHostComponent {
  size: "default" | "small" | "large" = "default";
  labelSize?: "default" | "small";
}

describe("LabelComponent inside a form field", () => {
  let fixture: ComponentFixture<FieldSizeHostComponent>;
  let host: FieldSizeHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldSizeHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(FieldSizeHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const label = (): HTMLElement =>
    fixture.nativeElement.querySelector("label[tedi-label]");

  it("takes the field's size when it has none of its own", () => {
    host.size = "small";
    fixture.detectChanges();

    expect(label().classList).toContain("tedi-label--small");
  });

  it("keeps its own size over the field's", () => {
    host.size = "small";
    host.labelSize = "default";
    fixture.detectChanges();

    expect(label().classList).not.toContain("tedi-label--small");
  });

  it("stays at default size in a large field, which labels have no variant for", () => {
    host.size = "large";
    fixture.detectChanges();

    expect(label().classList).not.toContain("tedi-label--small");
  });
});
