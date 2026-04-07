import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { TimeFieldComponent } from "./time-field.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { LabelComponent } from "../label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

describe("TimeFieldComponent", () => {
  let fixture: ComponentFixture<TimeFieldComponent>;
  let component: TimeFieldComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TimeFieldComponent],
      providers: [
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    fixture = TestBed.createComponent(TimeFieldComponent);
    fixture.componentRef.setInput("inputId", "test-id");
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with null value", () => {
    expect(component.value()).toBeNull();
  });

  describe("input", () => {
    it("should have correct id", () => {
      const input = el.querySelector("input");
      expect(input?.id).toBe("test-id");
    });

    it("should show placeholder when provided", () => {
      fixture.componentRef.setInput("placeholder", "hh:mm");
      fixture.detectChanges();

      const input = el.querySelector("input");
      expect(input?.placeholder).toBe("hh:mm");
    });

    it("should update inputValue on typing", () => {
      const input = el.querySelector("input")!;
      input.value = "14:30";
      input.dispatchEvent(new Event("input"));

      expect(component.inputValue()).toBe("14:30");
    });
  });

  describe("time parsing on blur", () => {
    let input: HTMLInputElement;

    beforeEach(() => {
      input = el.querySelector("input")!;
    });

    it("should accept valid time HH:mm", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      input.value = "09:30";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("09:30");
      expect(onChange).toHaveBeenCalledWith("09:30");
    });

    it("should accept single-digit hours and zero-pad", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      input.value = "9:05";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("09:05");
      expect(onChange).toHaveBeenCalledWith("09:05");
    });

    it("should accept 00:00", () => {
      input.value = "00:00";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("00:00");
    });

    it("should accept 23:59", () => {
      input.value = "23:59";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("23:59");
    });

    it("should reject 24:00", () => {
      component.writeValue("12:00");
      fixture.detectChanges();

      input.value = "24:00";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("12:00");
    });

    it("should reject invalid text", () => {
      component.writeValue("12:00");
      fixture.detectChanges();

      input.value = "abc";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("12:00");
      expect(component.inputValue()).toBe("12:00");
    });

    it("should set value to null when input is cleared", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);
      component.writeValue("12:00");
      fixture.detectChanges();

      input.value = "";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBeNull();
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("should call onTouched on blur", () => {
      const onTouched = jest.fn();
      component.registerOnTouched(onTouched);

      input.dispatchEvent(new Event("blur"));

      expect(onTouched).toHaveBeenCalled();
    });
  });

  describe("clear button", () => {
    it("should not show clear button when value is null", () => {
      expect(el.querySelector(".tedi-time-field__clear")).toBeNull();
    });

    it("should show clear button when value exists", () => {
      component.writeValue("14:30");
      fixture.detectChanges();

      expect(el.querySelector(".tedi-time-field__clear")).toBeTruthy();
    });

    it("should clear value on click", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);
      component.writeValue("14:30");
      fixture.detectChanges();

      const clearBtn = el.querySelector(
        ".tedi-time-field__clear",
      ) as HTMLButtonElement;
      clearBtn.click();
      fixture.detectChanges();

      expect(component.value()).toBeNull();
      expect(component.inputValue()).toBe("");
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("should show separator alongside clear button", () => {
      component.writeValue("14:30");
      fixture.detectChanges();

      expect(el.querySelector("tedi-separator")).toBeTruthy();
    });
  });

  describe("FormFieldControl", () => {
    it("should expose value signal", () => {
      component.writeValue("10:30");
      expect(component.value()).toBe("10:30");
    });

    it("should expose isDisabled as disabled signal", () => {
      expect(component.isDisabled()).toBe(false);
      component.setDisabledState(true);
      expect(component.isDisabled()).toBe(true);
    });

    it("should expose isInvalid as invalid signal", () => {
      expect(component.isInvalid()).toBe(false);
      fixture.componentRef.setInput("invalid", true);
      fixture.detectChanges();
      expect(component.isInvalid()).toBe(true);
    });

    it("should provide clearField method", () => {
      component.writeValue("14:30");
      fixture.detectChanges();

      component.clearField();
      expect(component.value()).toBeNull();
      expect(component.inputValue()).toBe("");
    });
  });

  describe("native picker", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("pickerVariant", "native");
      fixture.detectChanges();
    });

    it("should render hidden native time input", () => {
      const native = el.querySelector(".tedi-time-field__native") as HTMLInputElement;
      expect(native).toBeTruthy();
      expect(native.type).toBe("time");
    });

    it("should render trigger button without popover", () => {
      expect(el.querySelector("tedi-popover")).toBeNull();
      const btn = el.querySelector(".tedi-time-field__icon") as HTMLButtonElement;
      expect(btn).toBeTruthy();
    });

    it("should sync native input value from component value", () => {
      component.writeValue("15:00");
      fixture.detectChanges();

      const native = el.querySelector(".tedi-time-field__native") as HTMLInputElement;
      expect(native.value).toBe("15:00");
    });

    it("should update value on native input change", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const native = el.querySelector(".tedi-time-field__native") as HTMLInputElement;
      native.value = "16:45";
      native.dispatchEvent(new Event("change"));

      expect(component.value()).toBe("16:45");
      expect(onChange).toHaveBeenCalledWith("16:45");
    });

    it("should set value to null when native input is cleared", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);
      component.writeValue("12:00");
      fixture.detectChanges();

      const native = el.querySelector(".tedi-time-field__native") as HTMLInputElement;
      native.value = "";
      native.dispatchEvent(new Event("change"));

      expect(component.value()).toBeNull();
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe("states", () => {
    it("should disable input when disabled", () => {
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();

      expect(el.querySelector("input")?.disabled).toBe(true);
    });

    it("should disable icon button when disabled", () => {
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();

      const iconBtn = el.querySelector(
        ".tedi-time-field__icon",
      ) as HTMLButtonElement;
      expect(iconBtn.disabled).toBe(true);
    });
  });

  describe("accessibility", () => {
    it("should set aria-invalid when invalid", () => {
      fixture.componentRef.setInput("invalid", true);
      fixture.detectChanges();

      expect(el.querySelector("input")?.getAttribute("aria-invalid")).toBe(
        "true",
      );
    });

    it("should set aria-invalid when state is error", () => {
      fixture.componentRef.setInput("state", "error");
      fixture.detectChanges();

      expect(el.querySelector("input")?.getAttribute("aria-invalid")).toBe(
        "true",
      );
    });

    it("should not set aria-invalid when state is default", () => {
      expect(
        el.querySelector("input")?.hasAttribute("aria-invalid"),
      ).toBe(false);
    });

    it("should have aria-label on icon button", () => {
      const iconBtn = el.querySelector(".tedi-time-field__icon");
      expect(iconBtn?.getAttribute("aria-label")).toBeTruthy();
    });
  });

  describe("ControlValueAccessor", () => {
    it("should set value via writeValue", () => {
      component.writeValue("08:15");

      expect(component.value()).toBe("08:15");
      expect(component.inputValue()).toBe("08:15");
    });

    it("should handle null writeValue", () => {
      component.writeValue(null);

      expect(component.value()).toBeNull();
      expect(component.inputValue()).toBe("");
    });

    it("should set formDisabled via setDisabledState", () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(component.isDisabled()).toBe(true);
      expect(el.querySelector("input")?.disabled).toBe(true);
    });
  });
});

@Component({
  standalone: true,
  imports: [TimeFieldComponent, ReactiveFormsModule],
  template: `<tedi-time-field inputId="form-test" [formControl]="control" />`,
})
class TestHostComponent {
  control = new FormControl<string | null>(null);
}

describe("TimeFieldComponent with ReactiveFormsModule", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should sync FormControl value to component", () => {
    host.control.setValue("10:00");
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector("input");
    expect(input.value).toBe("10:00");
  });

  it("should sync component value to FormControl on blur", () => {
    const input = fixture.nativeElement.querySelector("input")!;
    input.value = "15:45";
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new Event("blur"));
    fixture.detectChanges();

    expect(host.control.value).toBe("15:45");
  });

  it("should disable component when FormControl is disabled", () => {
    host.control.disable();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector("input");
    expect(input.disabled).toBe(true);
  });
});

@Component({
  standalone: true,
  imports: [
    TimeFieldComponent,
    FormFieldComponent,
    LabelComponent,
    FeedbackTextComponent,
    ReactiveFormsModule,
  ],
  template: `
    <tedi-form-field>
      <label tedi-label for="composite-test">Time</label>
      <tedi-time-field inputId="composite-test" [formControl]="control" />
      <tedi-feedback-text text="Error" type="error" />
    </tedi-form-field>
  `,
})
class CompositeTestHostComponent {
  control = new FormControl<string | null>(null);
}

describe("TimeFieldComponent inside FormFieldComponent", () => {
  let fixture: ComponentFixture<CompositeTestHostComponent>;
  let host: CompositeTestHostComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CompositeTestHostComponent],
      providers: [
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    fixture = TestBed.createComponent(CompositeTestHostComponent);
    host = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should render time-field inside form-field", () => {
    expect(el.querySelector("tedi-form-field")).toBeTruthy();
    expect(el.querySelector("tedi-time-field")).toBeTruthy();
    expect(el.querySelector("input")).toBeTruthy();
  });

  it("should render projected label", () => {
    const label = el.querySelector("[tedi-label]");
    expect(label).toBeTruthy();
    expect(label?.textContent?.trim()).toBe("Time");
  });

  it("should render projected feedback text", () => {
    expect(el.querySelector("tedi-feedback-text")).toBeTruthy();
  });

  it("should sync FormControl value", () => {
    host.control.setValue("09:00");
    fixture.detectChanges();

    const input = el.querySelector("input");
    expect(input?.value).toBe("09:00");
  });
});
