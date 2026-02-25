import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TextFieldComponent, TextFieldIcon } from "./text-field.component";
import { ReactiveFormsModule } from "@angular/forms";
import { Component } from "@angular/core";
import { By } from "@angular/platform-browser";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { ComponentInputs } from "tedi/types";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";

@Component({
  standalone: true,
  imports: [TextFieldComponent, ReactiveFormsModule],
  template: `<tedi-text-field
    [inputId]="'test-id'"
    [value]="value"
    [required]="required"
    [invalid]="invalid"
    [inputAttrs]="inputAttrs"
    [isClearable]="isClearable"
    [icon]="icon"
    [disabled]="disabled"
    [helper]="helper"
    [size]="size"
    [inputClass]="inputClass"
  ></tedi-text-field>`,
})
class TestHostComponent {
  value = "";
  required = false;
  invalid = false;
  inputAttrs: Record<string, string | number | boolean> = {};
  isClearable = false;
  disabled = false;
  icon: string | TextFieldIcon | undefined = undefined;
  helper?: ComponentInputs<FeedbackTextComponent>;
  size = "default";
  inputClass = "";
}

describe("TextFieldComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let input: HTMLInputElement;
  let textField: TextFieldComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;

    fixture.detectChanges();

    const textFieldDebug = fixture.debugElement.query(
      By.directive(TextFieldComponent),
    );
    textField = textFieldDebug.componentInstance;
    input = textFieldDebug.nativeElement.querySelector("input");
  });

  it("should create", () => {
    expect(textField).toBeTruthy();
    expect(input).toBeTruthy();
  });

  it("writeValue() should set the passed-in value", () => {
    textField.writeValue("test");
    fixture.detectChanges();

    expect(input.value).toBe("test");
  });

  it("setDisabledState() should toggle formDisabled and disable input", () => {
    textField.setDisabledState(true);
    fixture.detectChanges();

    expect(input.disabled).toBeTruthy();

    textField.setDisabledState(false);
    fixture.detectChanges();

    expect(input.disabled).toBeFalsy();
  });

  it("should disable input when disabled input is true", () => {
    host.disabled = true;
    fixture.detectChanges();

    expect(input.disabled).toBeTruthy();
  });

  it("should apply required attribute", () => {
    host.required = true;
    fixture.detectChanges();

    expect(input.required).toBeTruthy();
  });

  it("should clear input when clear button clicked", () => {
    host.isClearable = true;
    host.value = "Test";
    fixture.detectChanges();

    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector("button");
    button.click();
    fixture.detectChanges();

    expect(input.value).toBe("");
  });

  it("should not show clear button when isClearable is false", () => {
    host.isClearable = false;
    host.value = "Test";
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector("button");
    expect(button).toBeNull();
  });

  it("should not show clear button when value is empty", () => {
    host.isClearable = true;
    host.value = "";
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector("button");
    expect(button).toBeNull();
  });

  it("should set aria-invalid when validation state is invalid", () => {
    host.invalid = true;
    fixture.detectChanges();

    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("should be invalid when helper type is error", () => {
    host.invalid = false;
    host.helper = { text: "Error message", type: "error", position: "left" };
    fixture.detectChanges();

    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("should apply valid class when helper type is valid", () => {
    host.helper = { text: "Success message", type: "valid", position: "left" };
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector(".tedi-text-field");
    expect(container.classList.contains("tedi-text-field--valid")).toBeTruthy();
  });

  it("should apply inputAttrs to input", () => {
    host.inputAttrs = { inputmode: "numeric", autocomplete: "off" };
    fixture.detectChanges();

    expect(input.getAttribute("inputmode")).toBe("numeric");
    expect(input.getAttribute("autocomplete")).toBe("off");
  });

  it("should not render icon when icon is undefined", () => {
    host.icon = undefined;
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector("tedi-icon");
    expect(icon).toBeNull();
  });

  it("should resolve string icon to config object", () => {
    host.icon = "search";
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector("tedi-icon");
    expect(icon).toBeTruthy();
  });

  it("should use full icon config object", () => {
    host.icon = { name: "search", size: 24 };
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector("tedi-icon");
    expect(icon).toBeTruthy();
  });

  it("should apply small size class", () => {
    host.size = "small";
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector(".tedi-text-field");
    expect(container.classList.contains("tedi-text-field--small")).toBeTruthy();
  });

  it("should apply custom input class", () => {
    host.inputClass = "custom-class";
    fixture.detectChanges();

    expect(input.classList.contains("custom-class")).toBeTruthy();
  });

  it("should call onChange when input changes", () => {
    const onChangeSpy = jest.fn();
    textField.registerOnChange(onChangeSpy);

    input.value = "test";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    expect(onChangeSpy).toHaveBeenCalledWith("test");
    expect(textField.value()).toBe("test");
  });

  it("should call onTouched when input is blurred", () => {
    const onTouchedSpy = jest.fn();
    textField.registerOnTouched(onTouchedSpy);

    input.dispatchEvent(new Event("blur"));
    fixture.detectChanges();

    expect(onTouchedSpy).toHaveBeenCalled();
  });
});
