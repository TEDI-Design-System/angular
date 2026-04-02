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

describe("FormFieldComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let formField: FormFieldComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
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

  it("should not show clear button when value is empty", () => {
    host.clearable = true;
    host.mockControl.value.set("");
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector("button");
    expect(button).toBeNull();
  });

  it("should not show clear button when clearable is false", () => {
    host.clearable = false;
    host.mockControl.value.set("Test");
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector("button");
    expect(button).toBeNull();
  });

  it("should call control.clearField when clear is triggered", () => {
    formField.clear();

    expect(host.mockControl.clearField).toHaveBeenCalled();
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

    events.next();

    expect(host.mockControl.setInvalidState).toHaveBeenCalledWith(true);
  });
});
