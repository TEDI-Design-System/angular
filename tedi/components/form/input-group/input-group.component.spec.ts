import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { InputGroupComponent } from "./input-group.component";
import { InputGroupPrefixDirective } from "./input-group-prefix.directive";
import { InputGroupSuffixDirective } from "./input-group-suffix.directive";
import { FormFieldComponent } from "../form-field/form-field.component";
import { TextFieldComponent } from "../text-field/text-field.component";
import { LabelComponent } from "../label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { LabelRowComponent } from "../label-row/label-row.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

@Component({
  standalone: true,
  imports: [
    InputGroupComponent,
    InputGroupPrefixDirective,
    InputGroupSuffixDirective,
    FormFieldComponent,
    TextFieldComponent,
    LabelComponent,
    FeedbackTextComponent,
  ],
  template: `
    <tedi-input-group
      #group
      [addons]="addons"
      [disabled]="disabled"
      [invalid]="invalid"
    >
      <label tedi-label [for]="'ig-test'">Address</label>
      @if (showPrefix) {
        <span tediInputGroupPrefix>
          @if (prefixHasElement) {
            <b>Street</b>
          } @else {
            Street
          }
        </span>
      }
      <tedi-form-field #field>
        <input tedi-text-field id="ig-test" />
      </tedi-form-field>
      @if (showSuffix) {
        <span tediInputGroupSuffix>EUR</span>
      }
      @if (showFeedback) {
        <tedi-feedback-text text="Feedback text" type="error" />
      }
    </tedi-input-group>
  `,
})
class TestHostComponent {
  @ViewChild("group", { static: true }) group!: InputGroupComponent;
  @ViewChild("field", { static: true }) field!: FormFieldComponent;

  addons = true;
  disabled = false;
  invalid = false;
  showPrefix = false;
  showSuffix = false;
  prefixHasElement = false;
  showFeedback = false;
}

describe("InputGroupComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  const root = () =>
    fixture.nativeElement.querySelector("tedi-input-group") as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("renders the root with the base and addons classes", () => {
    expect(root()).toBeTruthy();
    expect(root().classList.contains("tedi-input-group")).toBe(true);
    expect(root().classList.contains("tedi-input-group--addons")).toBe(true);
    expect(root().getAttribute("role")).toBe("group");
  });

  it("omits the addons modifier when addons is false", () => {
    host.addons = false;
    fixture.detectChanges();
    expect(root().classList.contains("tedi-input-group--addons")).toBe(false);
  });

  it("adds has-prefix / has-suffix modifiers when slots are present", () => {
    host.showPrefix = true;
    host.showSuffix = true;
    fixture.detectChanges();

    expect(root().classList.contains("tedi-input-group--has-prefix")).toBe(true);
    expect(root().classList.contains("tedi-input-group--has-suffix")).toBe(true);
  });

  it("has no prefix / suffix modifiers by default", () => {
    expect(root().classList.contains("tedi-input-group--has-prefix")).toBe(false);
    expect(root().classList.contains("tedi-input-group--has-suffix")).toBe(false);
  });

  it("applies the text modifier for a text-only addon", () => {
    host.showPrefix = true;
    fixture.detectChanges();

    const prefix = root().querySelector(".tedi-input-group__prefix")!;
    expect(prefix.classList.contains("tedi-input-group__prefix--text")).toBe(true);
  });

  it("omits the text modifier when the addon wraps an element", () => {
    host.showPrefix = true;
    host.prefixHasElement = true;
    fixture.detectChanges();

    const prefix = root().querySelector(".tedi-input-group__prefix")!;
    expect(prefix.classList.contains("tedi-input-group__prefix--text")).toBe(false);
  });

  it("applies the disabled modifier and aria-disabled when disabled", () => {
    host.disabled = true;
    fixture.detectChanges();

    expect(root().classList.contains("tedi-input-group--disabled")).toBe(true);
    expect(root().getAttribute("aria-disabled")).toBe("true");
  });

  it("propagates disabled to the wrapped control", () => {
    host.disabled = true;
    fixture.detectChanges();

    const input = root().querySelector("input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("applies the invalid modifier and propagates invalid to the control", () => {
    host.invalid = true;
    fixture.detectChanges();

    expect(root().classList.contains("tedi-input-group--invalid")).toBe(true);
    expect(host.field.validationState()).toBe("invalid");
    const input = root().querySelector("input") as HTMLInputElement;
    expect(input.getAttribute("aria-invalid")).toBe("true");
  });

  it("renders a projected label referencing the control", () => {
    const label = root().querySelector("label");
    expect(label).toBeTruthy();
    expect(label!.getAttribute("for")).toBe("ig-test");
    expect(label!.textContent).toContain("Address");
  });

  it("renders projected feedback text when provided", () => {
    host.showFeedback = true;
    fixture.detectChanges();

    const feedback = root().querySelector("tedi-feedback-text");
    expect(feedback).toBeTruthy();
    expect(feedback!.textContent).toContain("Feedback text");
  });

  it("renders no feedback text when omitted", () => {
    expect(root().querySelector("tedi-feedback-text")).toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [
    InputGroupComponent,
    InputGroupSuffixDirective,
    FormFieldComponent,
    TextFieldComponent,
    LabelComponent,
    LabelRowComponent,
  ],
  template: `
    <tedi-input-group>
      <tedi-label-row>
        <label tedi-label for="ig-label-row">Summa</label>
        <span class="tooltip-stub">?</span>
      </tedi-label-row>
      <tedi-form-field>
        <input tedi-text-field id="ig-label-row" />
      </tedi-form-field>
      <span tediInputGroupSuffix>EUR</span>
    </tedi-input-group>
  `,
})
class LabelRowHostComponent {}

describe("InputGroupComponent with a tedi-label-row", () => {
  let fixture: ComponentFixture<LabelRowHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabelRowHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(LabelRowHostComponent);
    fixture.detectChanges();
  });

  it("projects the label row above the control row", () => {
    const group = fixture.nativeElement.querySelector("tedi-input-group");
    const labelRow = fixture.nativeElement.querySelector("tedi-label-row");
    const row = fixture.nativeElement.querySelector(".tedi-input-group__row");

    expect(labelRow.parentElement).toBe(group);
    expect(row.contains(labelRow)).toBe(false);
    expect(
      labelRow.compareDocumentPosition(row) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });
});
