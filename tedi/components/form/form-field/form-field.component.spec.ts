import { Component, signal, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  FormFieldComponent,
  FormFieldIcon,
  InputSize,
} from "./form-field.component";
import {
  TEDI_FORM_FIELD_CONTROL,
  FormFieldControl,
} from "./form-field-control";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { NgControl } from "@angular/forms";
import { Subject } from "rxjs";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

@Component({
  selector: "mock-control",
  standalone: true,
  template: "",
  providers: [
    {
      provide: TEDI_FORM_FIELD_CONTROL,
      useExisting: MockControlComponent,
    },
  ],
})
class MockControlComponent implements FormFieldControl<string> {
  value = signal("");
  disabled = signal(false);
  invalid = signal(false);
  setInvalidState = jest.fn();
  clearField = jest.fn();
  focus = jest.fn();
  ownsClearButton = false;
}

@Component({
  selector: "mock-feedback",
  standalone: true,
  template: "",
})
export class MockFeedbackComponent extends FeedbackTextComponent {}

@Component({
  standalone: true,
  imports: [FormFieldComponent, MockControlComponent, MockFeedbackComponent],
  template: `
    <tedi-form-field
      #formField
      [size]="size"
      [icon]="icon"
      [clearable]="clearable"
      [inputClass]="inputClass"
    >
      <mock-control #mockControl></mock-control>
      <mock-feedback
        #feedback
        [text]="'Feedback text'"
        [type]="feedbackType"
      ></mock-feedback>
    </tedi-form-field>
  `,
})
class TestHostComponent {
  @ViewChild("formField", { static: true }) formField!: FormFieldComponent;
  @ViewChild("mockControl", { static: true })
  mockControl!: MockControlComponent;
  @ViewChild("feedback", { static: true }) feedback!: FeedbackTextComponent;

  size: InputSize = "default";
  icon?: string | FormFieldIcon;
  clearable = false;
  inputClass?: string;
  feedbackType: "valid" | "error" | "default" = "default";
}

@Component({
  standalone: true,
  imports: [FormFieldComponent, MockControlComponent],
  template: `
    <tedi-form-field clearable>
      <mock-control #mockControl></mock-control>
    </tedi-form-field>
  `,
})
class BareClearableHostComponent {
  @ViewChild("mockControl", { static: true })
  mockControl!: MockControlComponent;
}

describe("FormFieldComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let formField: FormFieldComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    formField = host.formField;
  });

  it("should create", () => {
    expect(formField).toBeTruthy();
  });

  it("should apply small size class", () => {
    host.size = "small";
    fixture.detectChanges();
    expect(formField.hostClasses()["tedi-form-field--small"]).toBe(true);
  });

  it("should resolve string icon to config object", () => {
    host.icon = "person";
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

  it("should not render icon when icon is undefined", () => {
    host.icon = undefined;
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector("tedi-icon");
    expect(icon).toBeNull();
  });

  it("should hide clear button slot when value is empty", () => {
    host.clearable = true;
    host.mockControl.value.set("");
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelector(
      ".tedi-form-field__buttons",
    );
    expect(buttons).toBeTruthy();
    expect(buttons.classList.contains("tedi-form-field__buttons--hidden")).toBe(
      true,
    );
    expect(buttons.getAttribute("aria-hidden")).toBe("true");

    const button = buttons.querySelector("button");
    expect(button.hasAttribute("disabled")).toBe(true);
    expect(button.getAttribute("tabindex")).toBe("-1");
  });

  it("should show clear button when clearable and value is set", () => {
    host.clearable = true;
    host.mockControl.value.set("Test");
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelector(
      ".tedi-form-field__buttons",
    );
    expect(buttons).toBeTruthy();
    expect(buttons.classList.contains("tedi-form-field__buttons--hidden")).toBe(
      false,
    );
    expect(buttons.getAttribute("aria-hidden")).toBeNull();

    const button = buttons.querySelector("button");
    expect(button.hasAttribute("disabled")).toBe(false);
  });

  it("should not render buttons slot when clearable is false", () => {
    host.clearable = false;
    host.mockControl.value.set("Test");
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelector(
      ".tedi-form-field__buttons",
    );
    expect(buttons).toBeNull();
  });

  it("should not render its own clear button when the control renders one", () => {
    host.clearable = true;
    host.mockControl.value.set("text");
    host.mockControl.ownsClearButton = true;
    formField.ngAfterContentInit();
    fixture.detectChanges();

    expect(formField.renderClearButton()).toBe(false);
    expect(
      fixture.nativeElement.querySelector(".tedi-form-field__clear"),
    ).toBeNull();
  });

  it("should not be clearable by default", () => {
    expect(formField.clearable()).toBe(false);
    expect(formField.renderClearButton()).toBe(false);
  });

  it("should treat a bare clearable attribute as true", () => {
    const bare = TestBed.createComponent(BareClearableHostComponent);
    bare.detectChanges();

    expect(
      bare.nativeElement.querySelector(".tedi-form-field__clear"),
    ).toBeTruthy();
  });

  it("should call control.clearField when clear is triggered", () => {
    formField.clear();

    expect(host.mockControl.clearField).toHaveBeenCalled();
  });

  describe("clicking the field box", () => {
    const mouseDownOn = (element: Element) => {
      const event = new MouseEvent("mousedown", {
        bubbles: true,
        cancelable: true,
      });
      element.dispatchEvent(event);
      return event;
    };

    const box = (): HTMLElement =>
      fixture.nativeElement.querySelector(".tedi-form-field__input");

    it("should focus the control when the box padding is clicked", () => {
      const event = mouseDownOn(box());

      expect(host.mockControl.focus).toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(true);
    });

    it("should focus the control when a non-interactive wrapper is clicked", () => {
      const wrapper = document.createElement("div");
      box().appendChild(wrapper);

      mouseDownOn(wrapper);

      expect(host.mockControl.focus).toHaveBeenCalled();
    });

    it("should not focus the control when an interactive element is clicked", () => {
      host.clearable = true;
      host.mockControl.value.set("text");
      fixture.detectChanges();

      const clearButton = fixture.nativeElement.querySelector(
        ".tedi-form-field__clear",
      );
      const event = mouseDownOn(clearButton);

      expect(host.mockControl.focus).not.toHaveBeenCalled();
      expect(event.defaultPrevented).toBe(false);
    });

    it("should not focus the control when disabled", () => {
      host.mockControl.disabled.set(true);
      fixture.detectChanges();

      mouseDownOn(box());

      expect(host.mockControl.focus).not.toHaveBeenCalled();
    });
  });

  it("should be invalid when control invalid", () => {
    host.mockControl.invalid.set(true);

    fixture.detectChanges();

    expect(formField.validationState()).toBe("invalid");
  });

  it("should reflect disabled state from control", () => {
    host.mockControl.disabled.set(true);
    fixture.detectChanges();
    expect(formField.isDisabled()).toBe(true);

    host.mockControl.disabled.set(false);
    fixture.detectChanges();
    expect(formField.isDisabled()).toBe(false);
  });

  it("should apply custom class", () => {
    host.inputClass = "custom-class";
    fixture.detectChanges();

    const classes = formField.inputClasses() as Record<string, boolean>;
    expect(classes["custom-class"]).toBe(true);
  });

  it("should react to control.events and call setInvalidState", () => {
    const events = new Subject<void>();

    formField.ngControl = {
      control: {
        events: events.asObservable(),
      },
      invalid: true,
      touched: true,
      dirty: false,
    } as unknown as NgControl;

    formField.ngAfterContentInit();

    const spy = jest.spyOn(host.mockControl, "setInvalidState");
    spy.mockClear();

    events.next();

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(true);
  });
});
