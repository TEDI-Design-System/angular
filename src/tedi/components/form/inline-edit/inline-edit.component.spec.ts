import { Component, signal, viewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { InputGroupComponent } from "../input-group/input-group.component";
import { By } from "@angular/platform-browser";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { TextFieldComponent } from "../text-field/text-field.component";
import { InlineEditControlDirective } from "./inline-edit-control.directive";
import { InlineEditComponent } from "./inline-edit.component";

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

@Component({
  standalone: true,
  imports: [
    InlineEditComponent,
    InlineEditControlDirective,
    TextFieldComponent,
  ],
  template: `
    <tedi-inline-edit
      [displayValue]="displayValue()"
      [placeholder]="placeholder()"
      [label]="label()"
      [size]="size()"
      [disabled]="disabled()"
      [invalid]="invalid()"
      [editIcon]="editIcon()"
      [editIconVisibility]="editIconVisibility()"
      [closeOnEnter]="closeOnEnter()"
      [closeOnEscape]="closeOnEscape()"
      [closeOnBlur]="closeOnBlur()"
      [(editing)]="editing"
      (editStart)="editStarts = editStarts + 1"
      (editCommit)="commits = commits + 1"
      (editCancel)="cancels = cancels + 1"
    >
      <ng-template tediInlineEditControl>
        <input tedi-text-field [(value)]="displayValue" />
      </ng-template>
    </tedi-inline-edit>
  `,
})
class TestHostComponent {
  readonly inlineEdit = viewChild.required(InlineEditComponent);

  displayValue = signal("Mari Maasikas");
  placeholder = signal("");
  label = signal("Nimi");
  size = signal<"default" | "small">("default");
  disabled = signal(false);
  invalid = signal(false);
  editIcon = signal<string | null>(null);
  editIconVisibility = signal<"always" | "hover">("always");
  closeOnEnter = signal(true);
  closeOnEscape = signal(true);
  closeOnBlur = signal(true);
  editing = signal(false);

  editStarts = 0;
  commits = 0;
  cancels = 0;
}

describe("InlineEditComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  const dom = () => fixture.nativeElement as HTMLElement;
  const trigger = () =>
    dom().querySelector<HTMLButtonElement>(".tedi-inline-edit__trigger");
  const editorInput = () =>
    dom().querySelector<HTMLInputElement>(".tedi-inline-edit__editor input");
  const root = () =>
    fixture.debugElement.query(By.directive(InlineEditComponent))
      .nativeElement as HTMLElement;

  const enterEditMode = async () => {
    trigger()!.click();
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(host.inlineEdit()).toBeTruthy();
  });

  describe("read mode", () => {
    it("shows the display value on a button", () => {
      expect(trigger()).toBeTruthy();
      expect(trigger()!.textContent?.trim()).toBe("Mari Maasikas");
    });

    it("falls back to the placeholder when the value is blank", () => {
      host.displayValue.set("   ");
      host.placeholder.set("Sisesta nimi");
      fixture.detectChanges();

      const value = dom().querySelector(".tedi-inline-edit__value")!;
      expect(value.textContent?.trim()).toBe("Sisesta nimi");
      expect(
        value.classList.contains("tedi-inline-edit__value--placeholder"),
      ).toBe(true);
    });

    it.each(["", "   "])("rejects a blank label (%j)", (label) => {
      host.label.set(label);
      expect(() => fixture.detectChanges()).toThrow(
        "[tedi-inline-edit] label must be a non-empty string.",
      );
    });

    it("names the trigger when the value and placeholder are empty", () => {
      host.displayValue.set("");
      fixture.detectChanges();
      expect(trigger()!.getAttribute("aria-label")).toBe(
        "Nimi, inline-edit.edit",
      );
    });

    it("trims surrounding whitespace from the label", () => {
      host.label.set("  Nimi  ");
      fixture.detectChanges();
      expect(trigger()!.getAttribute("aria-label")).toBe(
        "Nimi: Mari Maasikas, inline-edit.edit",
      );
    });

    it("announces the label, the value and the edit action", () => {
      host.label.set("Nimi");
      fixture.detectChanges();

      expect(trigger()!.getAttribute("aria-label")).toBe(
        "Nimi: Mari Maasikas, inline-edit.edit",
      );
    });

    it("renders the edit icon in the brand colour, not the text colour", () => {
      host.editIcon.set("edit");
      fixture.detectChanges();

      const icon = dom().querySelector("tedi-icon")!;
      expect(icon.className).toContain("tedi-icon--color-brand");
      expect(icon.className).not.toContain("tedi-icon--color-inherit");
    });

    it("renders no icon by default and one when asked", () => {
      expect(dom().querySelector("tedi-icon")).toBeNull();

      host.editIcon.set("edit");
      fixture.detectChanges();

      expect(dom().querySelector("tedi-icon")).toBeTruthy();
    });
  });

  describe("host classes", () => {
    it("reflects size", () => {
      expect(root().classList).not.toContain("tedi-inline-edit--small");

      host.size.set("small");
      fixture.detectChanges();

      expect(root().classList).toContain("tedi-inline-edit--small");
    });

    it("reflects invalid, and disables the trigger itself", () => {
      host.invalid.set(true);
      host.disabled.set(true);
      fixture.detectChanges();

      expect(root().classList).toContain("tedi-inline-edit--invalid");
      expect(trigger()!.disabled).toBe(true);
    });

    it("reflects icon visibility only when it is not the default", () => {
      expect(root().classList).not.toContain("tedi-inline-edit--icon-hover");

      host.editIconVisibility.set("hover");
      fixture.detectChanges();

      expect(root().classList).toContain("tedi-inline-edit--icon-hover");
    });
  });

  describe("entering edit mode", () => {
    it("swaps the trigger for the control and emits editStart", async () => {
      await enterEditMode();

      expect(trigger()).toBeNull();
      expect(editorInput()).toBeTruthy();
      expect(host.editStarts).toBe(1);
      expect(host.editing()).toBe(true);
      expect(root().classList).toContain("tedi-inline-edit--editing");
    });

    it("does not take focus when initially rendered in edit mode", async () => {
      fixture.destroy();
      const outside = document.createElement("button");
      document.body.appendChild(outside);
      outside.focus();
      try {
        fixture = TestBed.createComponent(TestHostComponent);
        host = fixture.componentInstance;
        host.editing.set(true);
        fixture.detectChanges();
        await fixture.whenStable();

        expect(editorInput()).toBeTruthy();
        expect(document.activeElement).toBe(outside);
        expect(host.editStarts).toBe(1);
      } finally {
        outside.remove();
      }
    });

    it("moves focus into the control", async () => {
      await enterEditMode();

      expect(document.activeElement).toBe(editorInput());
    });

    it("renders the control at the small size so it matches the row", async () => {
      await enterEditMode();

      expect(editorInput()!.classList).toContain("tedi-text-field--small");
    });

    it("survives the focusout fired by destroying the trigger", async () => {
      // The real browser sequence: the trigger is focused by the click, then
      // destroyed by the swap, firing focusout with a null relatedTarget
      // before the control exists to take focus.
      trigger()!.focus();
      trigger()!.click();
      root().dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget: null }),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(host.editing()).toBe(true);
      expect(host.commits).toBe(0);
      expect(editorInput()).toBeTruthy();
      expect(document.activeElement).toBe(editorInput());
    });

    it("does nothing while disabled", async () => {
      host.disabled.set(true);
      fixture.detectChanges();

      await enterEditMode();

      expect(host.editing()).toBe(false);
      expect(host.editStarts).toBe(0);
    });

    it("can be driven from outside through the editing model", async () => {
      host.editing.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(editorInput()).toBeTruthy();
      expect(document.activeElement).toBe(editorInput());
      expect(host.editStarts).toBe(1);
      host.editing.set(false);
      fixture.detectChanges();
      expect(host.commits).toBe(0);
      expect(host.cancels).toBe(0);
    });
  });

  describe("leaving edit mode", () => {
    it("commits on Enter and returns focus to the trigger", async () => {
      await enterEditMode();

      editorInput()!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(host.commits).toBe(1);
      expect(host.cancels).toBe(0);
      expect(host.editing()).toBe(false);
      expect(document.activeElement).toBe(trigger());
    });

    it("cancels on Escape", async () => {
      await enterEditMode();

      editorInput()!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(host.cancels).toBe(1);
      expect(host.commits).toBe(0);
      expect(host.editing()).toBe(false);
    });

    it.each(["Enter", "Escape"])(
      "ignores %s during IME composition",
      async (key) => {
        await enterEditMode();
        editorInput()!.dispatchEvent(
          new KeyboardEvent("keydown", {
            key,
            bubbles: true,
            isComposing: true,
          }),
        );
        fixture.detectChanges();
        expect(host.editing()).toBe(true);
        expect(host.commits).toBe(0);
        expect(host.cancels).toBe(0);
      },
    );

    it("ignores a key the control already handled", async () => {
      await enterEditMode();

      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      });
      event.preventDefault();
      editorInput()!.dispatchEvent(event);
      fixture.detectChanges();

      expect(host.editing()).toBe(true);
      expect(host.commits).toBe(0);
    });

    it("commits when focus leaves the component", async () => {
      await enterEditMode();

      const outside = document.createElement("button");
      document.body.appendChild(outside);

      root().dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget: outside }),
      );
      fixture.detectChanges();

      expect(host.commits).toBe(1);
      expect(host.editing()).toBe(false);

      outside.remove();
    });

    it("stays open while focus moves within the component", async () => {
      await enterEditMode();

      root().dispatchEvent(
        new FocusEvent("focusout", {
          bubbles: true,
          relatedTarget: editorInput(),
        }),
      );
      fixture.detectChanges();

      expect(host.editing()).toBe(true);
      expect(host.commits).toBe(0);
    });

    it("stays open in its linked overlay and commits when focus leaves it", async () => {
      await enterEditMode();

      const overlay = document.createElement("div");
      overlay.className = "cdk-overlay-container";
      overlay.id = "inline-edit-options";
      editorInput()!.setAttribute("aria-controls", overlay.id);
      const option = document.createElement("button");
      overlay.appendChild(option);
      document.body.appendChild(overlay);

      root().dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget: option }),
      );
      fixture.detectChanges();

      expect(host.editing()).toBe(true);
      expect(host.commits).toBe(0);

      editorInput()!.removeAttribute("aria-controls");
      option.dispatchEvent(
        new FocusEvent("focusout", {
          bubbles: true,
          relatedTarget: document.body,
        }),
      );
      fixture.detectChanges();
      expect(host.commits).toBe(1);
      expect(host.editing()).toBe(false);
      overlay.remove();
    });
  });

  it("commits when focus moves to an unrelated overlay", async () => {
    await enterEditMode();
    const overlay = document.createElement("div");
    overlay.className = "cdk-overlay-container";
    document.body.appendChild(overlay);
    editorInput()!.dispatchEvent(
      new FocusEvent("focusout", { bubbles: true, relatedTarget: overlay }),
    );
    fixture.detectChanges();
    expect(host.commits).toBe(1);
    overlay.remove();
  });

  describe("opting out of the exit triggers", () => {
    it("keeps Enter inside the control when closeOnEnter is off", async () => {
      host.closeOnEnter.set(false);
      fixture.detectChanges();
      await enterEditMode();

      editorInput()!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
      );
      fixture.detectChanges();

      expect(host.editing()).toBe(true);
      expect(host.commits).toBe(0);
    });

    it("ignores Escape when closeOnEscape is off", async () => {
      host.closeOnEscape.set(false);
      fixture.detectChanges();
      await enterEditMode();

      editorInput()!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
      fixture.detectChanges();

      expect(host.editing()).toBe(true);
      expect(host.cancels).toBe(0);
    });

    it("ignores focus leaving when closeOnBlur is off", async () => {
      host.closeOnBlur.set(false);
      fixture.detectChanges();
      await enterEditMode();

      root().dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget: null }),
      );
      fixture.detectChanges();

      expect(host.editing()).toBe(true);
      expect(host.commits).toBe(0);
    });
  });
});

describe("InlineEditComponent projected feedback", () => {
  @Component({
    standalone: true,
    imports: [
      InlineEditComponent,
      InlineEditControlDirective,
      TextFieldComponent,
      FeedbackTextComponent,
    ],
    template: `
      <tedi-inline-edit displayValue="Mari" label="Nimi" invalid>
        <ng-template tediInlineEditControl>
          <input tedi-text-field value="Mari" />
        </ng-template>
        <tedi-feedback-text text="Vigane väärtus" type="error" />
      </tedi-inline-edit>
    `,
  })
  class FeedbackHostComponent {}

  it("links the feedback text to the trigger", async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(FeedbackHostComponent);
    fixture.detectChanges();

    const dom = fixture.nativeElement as HTMLElement;
    const describedBy = dom
      .querySelector(".tedi-inline-edit__trigger")!
      .getAttribute("aria-describedby");

    expect(describedBy).toBeTruthy();
    expect(dom.querySelector(`#${describedBy}`)!.textContent).toContain(
      "Vigane väärtus",
    );
  });
});

describe("InlineEditComponent inside a form field", () => {
  @Component({
    standalone: true,
    imports: [
      InlineEditComponent,
      InlineEditControlDirective,
      TextFieldComponent,
      FormFieldComponent,
      InputGroupComponent,
    ],
    template: `
      <tedi-input-group [disabled]="disabled()"
        ><tedi-form-field>
          <tedi-inline-edit displayValue="Mari" label="Nimi">
            <ng-template tediInlineEditControl>
              <input tedi-text-field value="Mari" />
            </ng-template>
          </tedi-inline-edit> </tedi-form-field
      ></tedi-input-group>
    `,
  })
  class WrappedHostComponent {
    disabled = signal(false);
    readonly inlineEdit = viewChild.required(InlineEditComponent);
  }

  it("folds the wrapping field's disabled state in", async () => {
    await TestBed.configureTestingModule({
      imports: [WrappedHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(WrappedHostComponent);
    fixture.detectChanges();

    expect(fixture.componentInstance.inlineEdit().disabled()).toBe(false);
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector("button");
    expect(trigger.disabled).toBe(true);
    trigger.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.inlineEdit().editing()).toBe(false);
  });
});

describe("InlineEditComponent with updateOn blur", () => {
  @Component({
    imports: [
      InlineEditComponent,
      InlineEditControlDirective,
      TextFieldComponent,
      ReactiveFormsModule,
    ],
    template: `
      <tedi-inline-edit
        [displayValue]="control.value"
        label="Name"
        (editCommit)="committed = control.value"
      >
        <ng-template tediInlineEditControl>
          <input tedi-text-field [formControl]="control" aria-label="Name" />
        </ng-template>
      </tedi-inline-edit>
    `,
  })
  class BlurHost {
    control = new FormControl("Mari", { nonNullable: true, updateOn: "blur" });
    committed = "";
  }
  it("flushes the pending value before emitting commit on Enter", async () => {
    await TestBed.configureTestingModule({
      imports: [BlurHost],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(BlurHost);
    fixture.detectChanges();
    fixture.nativeElement.querySelector("button").click();
    fixture.detectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector("input");
    input.value = "Updated";
    input.dispatchEvent(new Event("input", { bubbles: true }));
    expect(fixture.componentInstance.control.value).toBe("Mari");
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    fixture.detectChanges();
    expect(fixture.componentInstance.committed).toBe("Updated");
  });
});
