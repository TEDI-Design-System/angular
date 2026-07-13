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
import { TextareaComponent } from "../textarea/textarea.component";
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
      [characterLimit]="characterLimit"
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
  characterLimit?: number;
  feedbackType: "valid" | "error" | "default" = "default";
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

  it("should count the characters of the control value", () => {
    host.mockControl.value.set("hello");
    fixture.detectChanges();

    expect(formField.characterCount()).toBe(5);
  });

  it("should report a character count of 0 when there is no control", () => {
    const bare = TestBed.createComponent(FormFieldComponent);
    bare.detectChanges();

    expect(bare.componentInstance.characterCount()).toBe(0);
  });

  it("should force the control invalid when the character limit is exceeded", () => {
    host.characterLimit = 3;
    host.mockControl.value.set("hello");
    fixture.detectChanges();

    const spy = jest.spyOn(host.mockControl, "setInvalidState");
    spy.mockClear();

    formField.ngAfterContentInit();

    expect(spy).toHaveBeenCalledWith(true);
    expect(formField.validationState()).toBe("invalid");
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

@Component({
  standalone: true,
  imports: [FormFieldComponent, TextareaComponent],
  template: `
    <tedi-form-field #formField [clearable]="true" [icon]="'search'">
      <textarea tedi-textarea [value]="'hello'"></textarea>
    </tedi-form-field>
  `,
})
class TextareaHostComponent {
  @ViewChild("formField", { static: true }) formField!: FormFieldComponent;
}

describe("FormFieldComponent wrapping a textarea", () => {
  let fixture: ComponentFixture<TextareaHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaHostComponent);
    fixture.detectChanges();
  });

  it("detects the projected textarea", () => {
    expect(fixture.componentInstance.formField.isTextarea()).toBe(true);
  });

  it("suppresses the clear button even when clearable with a value", () => {
    expect(
      fixture.nativeElement.querySelector(".tedi-form-field__clear"),
    ).toBeNull();
  });

  it("suppresses the icon", () => {
    expect(fixture.nativeElement.querySelector("tedi-icon")).toBeNull();
  });

  it("does not apply the --with-icon class", () => {
    expect(
      fixture.componentInstance.formField.hostClasses()[
        "tedi-form-field--with-icon"
      ],
    ).toBe(false);
  });
});

@Component({
  standalone: true,
  imports: [FormFieldComponent, TextareaComponent],
  template: `
    <tedi-form-field #formField [characterLimit]="characterLimit">
      <textarea tedi-textarea [value]="value"></textarea>
    </tedi-form-field>
  `,
})
class TextareaCharacterLimitHostComponent {
  @ViewChild("formField", { static: true }) formField!: FormFieldComponent;
  characterLimit = 5;
  value = "";
}

describe("FormFieldComponent character limit with a textarea", () => {
  let fixture: ComponentFixture<TextareaCharacterLimitHostComponent>;
  let host: TextareaCharacterLimitHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaCharacterLimitHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaCharacterLimitHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const counter = () =>
    fixture.nativeElement.querySelector(".tedi-form-field__character-count");
  const textarea = (): HTMLTextAreaElement =>
    fixture.nativeElement.querySelector("textarea");

  it("displays the current/limit character count", () => {
    host.value = "abc";
    fixture.detectChanges();

    expect(counter().textContent?.trim()).toBe("3/5");
  });

  it("stays neutral without the error class when within the limit", () => {
    host.value = "abc";
    fixture.detectChanges();

    expect(
      counter().classList.contains("tedi-form-field__character-count--error"),
    ).toBe(false);
    expect(host.formField.validationState()).toBe("neutral");
  });

  it("applies the error class and invalid state when the limit is exceeded", () => {
    host.value = "abcdef";
    fixture.detectChanges();

    expect(
      counter().classList.contains("tedi-form-field__character-count--error"),
    ).toBe(true);
    expect(host.formField.validationState()).toBe("invalid");
  });

  it("sets aria-invalid on the textarea after the validation-state update", () => {
    expect(textarea().getAttribute("aria-invalid")).toBeNull();

    host.value = "abcdef";
    fixture.detectChanges();
    host.formField.ngAfterContentInit();
    fixture.detectChanges();

    expect(textarea().getAttribute("aria-invalid")).toBe("true");
  });
});
