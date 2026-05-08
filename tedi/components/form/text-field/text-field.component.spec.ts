import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TextFieldComponent } from "./text-field.component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Component } from "@angular/core";
import { By } from "@angular/platform-browser";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

@Component({
  standalone: true,
  imports: [TextFieldComponent, ReactiveFormsModule],
  template: `<input tedi-text-field />`,
})
class TestHostComponent {}

@Component({
  standalone: true,
  imports: [TextFieldComponent, ReactiveFormsModule],
  template: `<input tedi-text-field [formControl]="control" />`,
})
class FormControlHostComponent {
  control = new FormControl<string>("", { nonNullable: true });
}

describe("TextFieldComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let input: HTMLInputElement;
  let textField: TextFieldComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "en" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const textFieldDebug = fixture.debugElement.query(
      By.directive(TextFieldComponent),
    );
    textField = textFieldDebug.componentInstance;
    input = textFieldDebug.nativeElement;
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

  it("registerOnChange() triggers when input changes", () => {
    const onChangeSpy = jest.fn();
    textField.registerOnChange(onChangeSpy);

    input.value = "changed";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    expect(onChangeSpy).toHaveBeenCalledWith("changed");
    expect(textField.value()).toBe("changed");
  });

  it("registerOnTouched() triggers when blurred", () => {
    const onTouchedSpy = jest.fn();
    textField.registerOnTouched(onTouchedSpy);

    input.dispatchEvent(new Event("blur"));
    fixture.detectChanges();

    expect(onTouchedSpy).toHaveBeenCalled();
  });

  it("clearField() should clear value", () => {
    textField.writeValue("test");

    textField.clearField();

    expect(textField.value()).toBe("");
    expect(input.value).toBe("");
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

  it("should update invalid signal via setInvalidState", () => {
    const fixture = TestBed.createComponent(TextFieldComponent);
    const component = fixture.componentInstance;

    component.setInvalidState(true);
    expect(component.invalid()).toBe(true);

    component.setInvalidState(false);
    expect(component.invalid()).toBe(false);
  });

  describe("when bound to a reactive FormControl", () => {
    let fcFixture: ComponentFixture<FormControlHostComponent>;
    let fcTextField: TextFieldComponent;
    let fcInput: HTMLInputElement;
    let control: FormControl<string>;

    beforeEach(() => {
      fcFixture = TestBed.createComponent(FormControlHostComponent);
      fcFixture.detectChanges();

      const debug = fcFixture.debugElement.query(
        By.directive(TextFieldComponent),
      );
      fcTextField = debug.componentInstance;
      fcInput = debug.nativeElement;
      control = fcFixture.componentInstance.control;
    });

    it("should disable when control.disable() is called", () => {
      control.disable();
      fcFixture.detectChanges();

      expect(fcTextField.disabled()).toBe(true);
      expect(fcInput.disabled).toBe(true);
    });

    it("should re-enable after control.disable() then control.enable()", () => {
      control.disable();
      fcFixture.detectChanges();
      expect(fcTextField.disabled()).toBe(true);
      expect(fcInput.disabled).toBe(true);

      control.enable();
      fcFixture.detectChanges();
      expect(fcTextField.disabled()).toBe(false);
      expect(fcInput.disabled).toBe(false);
    });

    it("clearField() should not clear when control is disabled", () => {
      control.setValue("test");
      control.disable();
      fcFixture.detectChanges();

      fcTextField.clearField();

      expect(fcTextField.value()).toBe("test");
      expect(control.value).toBe("test");
    });
  });
});
