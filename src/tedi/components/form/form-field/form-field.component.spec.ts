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
import { LabelComponent } from "../label/label.component";
import { LabelRowComponent } from "../label-row/label-row.component";
import { FormFieldExtraDirective } from "./form-field-extra.directive";
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
  reset = jest.fn();
  focus = jest.fn();
  setDescribedBy = jest.fn();
}

@Component({
  standalone: true,
  imports: [FormFieldComponent, MockControlComponent, FeedbackTextComponent],
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
      <tedi-feedback-text
        #feedback
        [text]="'Feedback text'"
        [type]="feedbackType"
      ></tedi-feedback-text>
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
  feedbackType: "valid" | "error" | "hint" = "hint";
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

  it("should accept a control it has no prior knowledge of", () => {
    host.mockControl.value.set("hello");
    fixture.detectChanges();

    expect(formField.control()).toBe(host.mockControl);
    expect(formField.characterCount()).toBe(5);
  });

  it("should not render a field box without inline additions", () => {
    expect(
      fixture.nativeElement.querySelector(".tedi-form-field__box"),
    ).toBeNull();
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

  it("should reset the control when the clear button is clicked", () => {
    host.clearable = true;
    host.mockControl.value.set("Test");
    fixture.detectChanges();

    fixture.nativeElement.querySelector(".tedi-form-field__clear").click();

    expect(host.mockControl.reset).toHaveBeenCalled();
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
      fixture.nativeElement.querySelector(".tedi-form-field__box");

    beforeEach(() => {
      host.icon = "search";
      fixture.detectChanges();
    });

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

  it("should apply the deprecated inputClass to the field box", () => {
    host.icon = "search";
    host.inputClass = "custom-class";
    fixture.detectChanges();

    const box = fixture.nativeElement.querySelector(".tedi-form-field__box");
    expect(box.classList.contains("custom-class")).toBe(true);
  });

  it("should scale the icon with the size", () => {
    expect(formField.iconSize()).toBe(18);

    host.size = "small";
    fixture.detectChanges();
    expect(formField.iconSize()).toBe(16);

    host.size = "large";
    fixture.detectChanges();
    expect(formField.iconSize()).toBe(24);
  });

  it("should mirror the validation and disabled state onto the box surface", () => {
    host.icon = "search";
    host.mockControl.invalid.set(true);
    host.mockControl.disabled.set(true);
    fixture.detectChanges();

    const box = fixture.nativeElement.querySelector(".tedi-form-field__box");
    expect(box.classList).toContain("tedi-field-surface");
    expect(box.classList).toContain("tedi-field-surface--invalid");
    expect(box.classList).toContain("tedi-field-surface--disabled");
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

  it("should contribute the exceeded character limit to the control's invalid state", () => {
    host.characterLimit = 3;
    host.mockControl.value.set("hello");
    fixture.detectChanges();

    expect(formField.invalid()).toBe(true);
    expect(formField.validationState()).toBe("invalid");
  });

  it("should contribute an error feedback text to the control's invalid state", () => {
    host.feedbackType = "error";
    fixture.detectChanges();

    expect(formField.invalid()).toBe(true);
  });
});

@Component({
  standalone: true,
  imports: [FormFieldComponent, TextareaComponent],
  template: `
    <tedi-form-field #formField>
      <textarea tedi-textarea [value]="'hello'"></textarea>
    </tedi-form-field>
  `,
})
class TextareaHostComponent {
  @ViewChild("formField", { static: true }) formField!: FormFieldComponent;
}

@Component({
  standalone: true,
  imports: [FormFieldComponent, TextareaComponent],
  template: `
    <tedi-form-field icon="search">
      <textarea tedi-textarea></textarea>
    </tedi-form-field>
  `,
})
class TextareaInBoxHostComponent {}

@Component({
  standalone: true,
  imports: [FormFieldComponent, TextareaComponent],
  template: `
    <tedi-form-field icon="search">
      <textarea tedi-textarea height="7.5rem"></textarea>
    </tedi-form-field>
  `,
})
class FixedHeightTextareaInBoxHostComponent {}

@Component({
  standalone: true,
  imports: [FormFieldComponent, TextareaComponent],
  template: `
    <tedi-form-field [clearable]="true">
      <textarea tedi-textarea [value]="'hello'"></textarea>
    </tedi-form-field>
  `,
})
class ClearableTextareaHostComponent {}

describe("FormFieldComponent wrapping a textarea", () => {
  let fixture: ComponentFixture<TextareaHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TextareaHostComponent,
        TextareaInBoxHostComponent,
        FixedHeightTextareaInBoxHostComponent,
        ClearableTextareaHostComponent,
      ],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaHostComponent);
    fixture.detectChanges();
  });

  it("leaves the surface to the textarea", () => {
    const ta = fixture.nativeElement.querySelector("textarea");

    expect(
      fixture.nativeElement.querySelector(".tedi-form-field__box"),
    ).toBeNull();
    expect(ta.classList.contains("tedi-field-surface")).toBe(true);
  });

  it("hands the surface to the box when an inline addition is asked for", () => {
    const boxFixture = TestBed.createComponent(TextareaInBoxHostComponent);
    boxFixture.detectChanges();

    const box = boxFixture.nativeElement.querySelector(".tedi-form-field__box");
    const ta = boxFixture.nativeElement.querySelector("textarea");

    expect(box.classList.contains("tedi-field-surface")).toBe(true);
    expect(ta.classList.contains("tedi-field-surface")).toBe(false);
    expect(box.contains(ta)).toBe(true);
  });

  it("makes the textarea the resizable element resting at minRows", () => {
    const ta = fixture.nativeElement.querySelector("textarea");

    expect(ta.style.height).toBe("");
    expect(ta.style.minHeight).toBe(
      "calc(3 * 1lh + 2 * var(--_field-padding-y))",
    );
    expect(ta.classList.contains("tedi-textarea--not-resizable")).toBe(false);
  });

  it("keeps its own sizing when the box owns the surface", () => {
    const boxFixture = TestBed.createComponent(
      FixedHeightTextareaInBoxHostComponent,
    );
    boxFixture.detectChanges();

    // The textarea reaches under the box's additions to the border, so it keeps
    // its own grip and its own height — boxed and standalone size alike.
    const ta = boxFixture.nativeElement.querySelector("textarea");
    expect(ta.style.height).toBe("7.5rem");
    expect(ta.style.minHeight).toBe(
      "calc(3 * 1lh + 2 * var(--_field-padding-y))",
    );
  });

  it("clears the textarea from the box's clear button", () => {
    const clearFixture = TestBed.createComponent(
      ClearableTextareaHostComponent,
    );
    clearFixture.detectChanges();

    const ta: HTMLTextAreaElement =
      clearFixture.nativeElement.querySelector("textarea");
    expect(ta.value).toBe("hello");

    clearFixture.nativeElement.querySelector(".tedi-form-field__clear").click();
    clearFixture.detectChanges();

    expect(ta.value).toBe("");
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

  it("sets aria-invalid on the textarea when the limit is exceeded", () => {
    expect(textarea().getAttribute("aria-invalid")).toBeNull();

    host.value = "abcdef";
    fixture.detectChanges();

    expect(textarea().getAttribute("aria-invalid")).toBe("true");
  });

  it("exposes the counter to assistive tech via the textarea's aria-describedby", () => {
    const countId = counter().id;

    expect(countId).toBeTruthy();
    expect(textarea().getAttribute("aria-describedby") ?? "").toContain(
      countId,
    );
  });

  it("marks the counter as a live region so updates are announced", () => {
    expect(counter().getAttribute("aria-live")).toBe("polite");
  });
});

@Component({
  standalone: true,
  imports: [FormFieldComponent, TextareaComponent, FeedbackTextComponent],
  template: `
    <tedi-form-field [characterLimit]="5">
      <textarea tedi-textarea></textarea>
      @if (showFeedback) {
        <tedi-feedback-text [text]="'Hint text'" />
      }
    </tedi-form-field>
  `,
})
class TextareaFeedbackAndCounterHostComponent {
  showFeedback = true;
}

describe("FormFieldComponent aria-describedby aggregation", () => {
  let fixture: ComponentFixture<TextareaFeedbackAndCounterHostComponent>;
  let host: TextareaFeedbackAndCounterHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaFeedbackAndCounterHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaFeedbackAndCounterHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const describedBy = () =>
    fixture.nativeElement
      .querySelector("textarea")
      .getAttribute("aria-describedby") ?? "";
  const counterId = () =>
    fixture.nativeElement.querySelector(".tedi-form-field__character-count").id;

  it("links both the feedback text and the counter", () => {
    const feedbackId =
      fixture.nativeElement.querySelector("tedi-feedback-text").id;

    expect(feedbackId).toBeTruthy();
    expect(counterId()).toBeTruthy();
    expect(describedBy()).toContain(feedbackId);
    expect(describedBy()).toContain(counterId());
  });

  it("links feedback that appears after the first render", () => {
    host.showFeedback = false;
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector("tedi-feedback-text"),
    ).toBeNull();

    host.showFeedback = true;
    fixture.detectChanges();

    const feedbackId =
      fixture.nativeElement.querySelector("tedi-feedback-text").id;
    expect(feedbackId).toBeTruthy();
    expect(describedBy()).toContain(feedbackId);
  });

  it("unlinks feedback that is removed again", () => {
    const feedbackId =
      fixture.nativeElement.querySelector("tedi-feedback-text").id;

    host.showFeedback = false;
    fixture.detectChanges();

    expect(describedBy()).not.toContain(feedbackId);
    expect(describedBy()).toContain(counterId());
  });
});

@Component({
  standalone: true,
  imports: [FormFieldComponent, TextareaComponent],
  template: `
    <tedi-form-field [characterLimit]="5">
      <textarea tedi-textarea aria-describedby="external-hint"></textarea>
    </tedi-form-field>
  `,
})
class TextareaCallerDescribedByHostComponent {}

describe("FormFieldComponent aria-describedby with a caller-provided id", () => {
  let fixture: ComponentFixture<TextareaCallerDescribedByHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaCallerDescribedByHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaCallerDescribedByHostComponent);
    fixture.detectChanges();
  });

  it("keeps the caller's id and appends the managed counter id", () => {
    const describedBy =
      fixture.nativeElement
        .querySelector("textarea")
        .getAttribute("aria-describedby") ?? "";
    const counterId = fixture.nativeElement.querySelector(
      ".tedi-form-field__character-count",
    ).id;

    expect(describedBy).toContain("external-hint");
    expect(describedBy).toContain(counterId);
  });
});

@Component({
  standalone: true,
  imports: [
    FormFieldComponent,
    TextareaComponent,
    LabelComponent,
    LabelRowComponent,
  ],
  template: `
    <tedi-form-field [icon]="icon">
      <tedi-label-row>
        <label tedi-label for="notes">Märkused</label>
        <span class="tooltip-stub">?</span>
      </tedi-label-row>
      <textarea tedi-textarea id="notes"></textarea>
    </tedi-form-field>
  `,
})
class LabelRowHostComponent {
  icon?: string;
}

describe("FormFieldComponent with a tedi-label-row", () => {
  let fixture: ComponentFixture<LabelRowHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelRowHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(LabelRowHostComponent);
    fixture.detectChanges();
  });

  const labelRow = (): HTMLElement =>
    fixture.nativeElement.querySelector("tedi-label-row");

  it("projects the label row above the control, not into the control slot", () => {
    const formField = fixture.nativeElement.querySelector("tedi-form-field");
    const textarea = fixture.nativeElement.querySelector("textarea");

    expect(labelRow().parentElement).toBe(formField);
    expect(
      labelRow().compareDocumentPosition(textarea) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps the label row out of the field box", () => {
    fixture.componentInstance.icon = "search";
    fixture.detectChanges();

    const box = fixture.nativeElement.querySelector(".tedi-form-field__box");
    expect(box).not.toBeNull();
    expect(box.contains(labelRow())).toBe(false);
  });

  it("keeps the label and its affix together in the row", () => {
    expect(labelRow().querySelector("label[tedi-label]")).not.toBeNull();
    expect(labelRow().querySelector(".tooltip-stub")).not.toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [
    FormFieldComponent,
    TextareaComponent,
    FeedbackTextComponent,
    FormFieldExtraDirective,
  ],
  template: `
    <tedi-form-field [icon]="icon">
      <textarea tedi-textarea></textarea>
      <tedi-feedback-text [text]="'Hint text'" />
      <p tediFormFieldExtra class="extra-stub">Lisainfo</p>
    </tedi-form-field>
  `,
})
class ProjectionSlotHostComponent {
  icon?: string;
}

describe("FormFieldComponent projection slots", () => {
  let fixture: ComponentFixture<ProjectionSlotHostComponent>;
  let host: ProjectionSlotHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectionSlotHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectionSlotHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const feedback = (): HTMLElement =>
    fixture.nativeElement.querySelector("tedi-feedback-text");
  const extra = (): HTMLElement =>
    fixture.nativeElement.querySelector(".extra-stub");

  it("projects the feedback text into the feedback row", () => {
    expect(feedback().parentElement?.classList).toContain(
      "tedi-form-field__feedback",
    );
  });

  it("projects [tediFormFieldExtra] content into the extra row", () => {
    expect(extra().parentElement?.classList).toContain(
      "tedi-form-field__extra",
    );
  });

  it("keeps unmarked content out of the extra row", () => {
    const extraRow = fixture.nativeElement.querySelector(
      ".tedi-form-field__extra",
    );

    expect(extraRow.querySelector("textarea")).toBeNull();
    expect(extraRow.querySelector("tedi-feedback-text")).toBeNull();
  });

  it("keeps the feedback and extra rows outside the field box", () => {
    host.icon = "person";
    fixture.detectChanges();

    const box = fixture.nativeElement.querySelector(".tedi-form-field__box");
    expect(box).toBeTruthy();
    expect(box.contains(feedback())).toBe(false);
    expect(box.contains(extra())).toBe(false);
  });
});
