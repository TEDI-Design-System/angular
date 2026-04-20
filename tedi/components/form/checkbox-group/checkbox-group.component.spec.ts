import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import {
  CheckboxGroupComponent,
  CheckboxGroupDirection,
} from "./checkbox-group.component";
import { CheckboxComponent } from "../checkbox/checkbox.component";
import { CheckboxCardComponent } from "../checkbox-card/checkbox-card.component";
import { CheckboxCardGroupComponent } from "../checkbox-card-group/checkbox-card-group.component";
import { LabelComponent } from "../label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";

@Component({
  standalone: true,
  imports: [
    CheckboxGroupComponent,
    CheckboxComponent,
    LabelComponent,
    FeedbackTextComponent,
  ],
  template: `
    <tedi-checkbox-group [label]="label" [direction]="direction">
      <label tedi-label color="primary" class="flex align-items-center gap-2">
        <input tedi-checkbox type="checkbox" />
        Option 1
      </label>
      <label tedi-label color="primary" class="flex align-items-center gap-2">
        <input tedi-checkbox type="checkbox" />
        Option 2
      </label>
      @if (showFeedback) {
        <tedi-feedback-text text="Hint text" />
      }
    </tedi-checkbox-group>
  `,
})
class TestHostComponent {
  label?: string;
  direction: CheckboxGroupDirection = "horizontal";
  showFeedback = false;
}

describe("CheckboxGroupComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let groupElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    groupElement = fixture.nativeElement.querySelector("tedi-checkbox-group");
  });

  it("should create component", () => {
    expect(groupElement).toBeTruthy();
    expect(groupElement.classList).toContain("tedi-checkbox-group");
  });

  it("should not render label when not provided", () => {
    const label = groupElement.querySelector(".tedi-checkbox-group__label");
    expect(label).toBeFalsy();
  });

  it("should render label when provided", () => {
    fixture.componentInstance.label = "Group Label";
    fixture.detectChanges();
    const label = groupElement.querySelector(".tedi-checkbox-group__label");
    expect(label).toBeTruthy();
    expect(label?.textContent?.trim()).toBe("Group Label");
  });

  it("should use horizontal direction by default", () => {
    const checks = groupElement.querySelector(".tedi-checkbox-group__checks");
    expect(checks?.classList).not.toContain(
      "tedi-checkbox-group__checks--vertical"
    );
  });

  it("should apply vertical direction class", () => {
    fixture.componentInstance.direction = "vertical";
    fixture.detectChanges();
    const checks = groupElement.querySelector(".tedi-checkbox-group__checks");
    expect(checks?.classList).toContain(
      "tedi-checkbox-group__checks--vertical"
    );
  });

  it("should project checkbox content into checks container", () => {
    const checks = groupElement.querySelector(".tedi-checkbox-group__checks");
    const inputs = checks?.querySelectorAll('input[type="checkbox"]');
    expect(inputs?.length).toBe(2);
  });

  it("should project feedback text into subtexts container", () => {
    fixture.componentInstance.showFeedback = true;
    fixture.detectChanges();
    const subtexts = groupElement.querySelector(
      ".tedi-checkbox-group__subtexts"
    );
    const feedbackText = subtexts?.querySelector("tedi-feedback-text");
    expect(feedbackText).toBeTruthy();
  });

  it("should not set role when unmanaged (back-compat)", () => {
    expect(groupElement.getAttribute("role")).toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [CheckboxGroupComponent, CheckboxComponent],
  template: `
    <tedi-checkbox-group>
      <input tedi-checkbox type="checkbox" value="a" checked />
      <input tedi-checkbox type="checkbox" value="b" />
    </tedi-checkbox-group>
  `,
})
class UnmanagedValuedHostComponent {}

describe("CheckboxGroupComponent — unmanaged with valued children", () => {
  it("should stay unmanaged and preserve pre-checked state", () => {
    TestBed.configureTestingModule({ imports: [UnmanagedValuedHostComponent] });
    const fixture = TestBed.createComponent(UnmanagedValuedHostComponent);
    fixture.detectChanges();
    const groupElement = fixture.nativeElement.querySelector(
      "tedi-checkbox-group"
    ) as HTMLElement;
    const inputs = Array.from(
      groupElement.querySelectorAll('input[type="checkbox"]')
    ) as HTMLInputElement[];

    expect(groupElement.getAttribute("role")).toBeNull();
    expect(groupElement.getAttribute("aria-labelledby")).toBeNull();
    expect(groupElement.getAttribute("aria-label")).toBeNull();
    expect(groupElement.getAttribute("aria-disabled")).toBeNull();
    expect(inputs[0].checked).toBe(true);
    expect(inputs[1].checked).toBe(false);
  });
});

@Component({
  standalone: true,
  imports: [CheckboxGroupComponent, CheckboxComponent, ReactiveFormsModule],
  template: `
    <tedi-checkbox-group [formControl]="control" label="Tags">
      <input tedi-checkbox type="checkbox" value="urgent" />
      <input tedi-checkbox type="checkbox" value="review" />
      <input tedi-checkbox type="checkbox" value="draft" />
    </tedi-checkbox-group>
  `,
})
class FormControlHostComponent {
  control = new FormControl<string[]>([]);
}

describe("CheckboxGroupComponent — managed with FormControl", () => {
  let fixture: ComponentFixture<FormControlHostComponent>;
  let groupElement: HTMLElement;
  let inputs: HTMLInputElement[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormControlHostComponent],
    });

    fixture = TestBed.createComponent(FormControlHostComponent);
    fixture.detectChanges();
    groupElement = fixture.nativeElement.querySelector("tedi-checkbox-group");
    inputs = Array.from(
      groupElement.querySelectorAll('input[type="checkbox"]')
    ) as HTMLInputElement[];
  });

  it("should apply role=group when managed", () => {
    expect(groupElement.getAttribute("role")).toBe("group");
  });

  it("should apply aria-labelledby pointing at the rendered label", () => {
    const labelledBy = groupElement.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const labelEl = groupElement.querySelector(".tedi-checkbox-group__label");
    expect(labelEl?.id).toBe(labelledBy);
    expect(labelEl?.textContent?.trim()).toBe("Tags");
    expect(groupElement.getAttribute("aria-label")).toBeNull();
  });

  it("should reflect FormControl value into native checked state", () => {
    fixture.componentInstance.control.setValue(["urgent", "draft"]);
    fixture.detectChanges();
    expect(inputs[0].checked).toBe(true);
    expect(inputs[1].checked).toBe(false);
    expect(inputs[2].checked).toBe(true);
  });

  it("should toggle on child check/uncheck", () => {
    inputs[0].checked = true;
    inputs[0].dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual(["urgent"]);

    inputs[1].checked = true;
    inputs[1].dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual([
      "urgent",
      "review",
    ]);

    inputs[0].checked = false;
    inputs[0].dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual(["review"]);
  });

  it("should propagate disabled from FormControl to children", () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(inputs.every((i) => i.disabled)).toBe(true);
    expect(groupElement.getAttribute("aria-disabled")).toBe("true");
  });
});

@Component({
  standalone: true,
  imports: [CheckboxGroupComponent, CheckboxComponent, ReactiveFormsModule],
  template: `
    <tedi-checkbox-group
      [formControl]="control"
      [ariaLabel]="ariaLabel"
      [ariaLabelledby]="ariaLabelledby"
    >
      <input tedi-checkbox type="checkbox" value="a" />
    </tedi-checkbox-group>
  `,
})
class AriaNameHostComponent {
  control = new FormControl<string[]>([]);
  ariaLabel?: string;
  ariaLabelledby?: string;
}

describe("CheckboxGroupComponent — accessible name fallbacks", () => {
  it("should use ariaLabel when managed and no label/ariaLabelledby", () => {
    TestBed.configureTestingModule({ imports: [AriaNameHostComponent] });
    const fixture = TestBed.createComponent(AriaNameHostComponent);
    fixture.componentInstance.ariaLabel = "My options";
    fixture.detectChanges();
    const groupElement = fixture.nativeElement.querySelector(
      "tedi-checkbox-group"
    ) as HTMLElement;
    expect(groupElement.getAttribute("aria-label")).toBe("My options");
    expect(groupElement.getAttribute("aria-labelledby")).toBeNull();
  });

  it("should use ariaLabelledby when managed and no label", () => {
    TestBed.configureTestingModule({ imports: [AriaNameHostComponent] });
    const fixture = TestBed.createComponent(AriaNameHostComponent);
    fixture.componentInstance.ariaLabelledby = "external-label";
    fixture.componentInstance.ariaLabel = "Fallback";
    fixture.detectChanges();
    const groupElement = fixture.nativeElement.querySelector(
      "tedi-checkbox-group"
    ) as HTMLElement;
    expect(groupElement.getAttribute("aria-labelledby")).toBe("external-label");
    expect(groupElement.getAttribute("aria-label")).toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [CheckboxGroupComponent, CheckboxComponent, ReactiveFormsModule],
  template: `
    <tedi-checkbox-group [formControl]="control">
      <input tedi-checkbox type="checkbox" value="a" />
      <input tedi-checkbox type="checkbox" value="b" disabled />
    </tedi-checkbox-group>
  `,
})
class IntrinsicDisabledHostComponent {
  control = new FormControl<string[]>([]);
}

@Component({
  standalone: true,
  imports: [CheckboxGroupComponent, CheckboxComponent, ReactiveFormsModule],
  template: `
    <tedi-checkbox-group [formControl]="control">
      <input tedi-checkbox type="checkbox" value="a" [disabled]="aDisabled" />
      <input tedi-checkbox type="checkbox" value="b" />
    </tedi-checkbox-group>
  `,
})
class DynamicDisabledHostComponent {
  control = new FormControl<string[]>([]);
  aDisabled = false;
}

describe("CheckboxGroupComponent — per-item disabled", () => {
  it("should preserve intrinsic disabled across group-disabled toggles", () => {
    TestBed.configureTestingModule({
      imports: [IntrinsicDisabledHostComponent],
    });
    const fixture = TestBed.createComponent(IntrinsicDisabledHostComponent);
    fixture.detectChanges();
    const inputs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'input[type="checkbox"]'
      )
    ) as HTMLInputElement[];

    // Intrinsic disabled preserved initially.
    expect(inputs[0].disabled).toBe(false);
    expect(inputs[1].disabled).toBe(true);

    // Disabling the FormControl disables all.
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(inputs[0].disabled).toBe(true);
    expect(inputs[1].disabled).toBe(true);

    // Re-enabling the FormControl restores intrinsic per-item state.
    fixture.componentInstance.control.enable();
    fixture.detectChanges();
    expect(inputs[0].disabled).toBe(false);
    expect(inputs[1].disabled).toBe(true);
  });

  it("should reflect dynamic [disabled] toggles on a child after group-disabled cycles", () => {
    TestBed.configureTestingModule({ imports: [DynamicDisabledHostComponent] });
    const fixture = TestBed.createComponent(DynamicDisabledHostComponent);
    fixture.detectChanges();
    const inputs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'input[type="checkbox"]'
      )
    ) as HTMLInputElement[];

    expect(inputs[0].disabled).toBe(false);
    fixture.componentInstance.aDisabled = true;
    fixture.detectChanges();
    expect(inputs[0].disabled).toBe(true);

    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(inputs[0].disabled).toBe(true);
    expect(inputs[1].disabled).toBe(true);

    fixture.componentInstance.control.enable();
    fixture.detectChanges();
    expect(inputs[0].disabled).toBe(true);
    expect(inputs[1].disabled).toBe(false);

    fixture.componentInstance.aDisabled = false;
    fixture.detectChanges();
    expect(inputs[0].disabled).toBe(false);
  });

  it("should not update values when intrinsically disabled child fires change", () => {
    TestBed.configureTestingModule({
      imports: [IntrinsicDisabledHostComponent],
    });
    const fixture = TestBed.createComponent(IntrinsicDisabledHostComponent);
    fixture.detectChanges();
    const inputs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'input[type="checkbox"]'
      )
    ) as HTMLInputElement[];

    // Simulate click on disabled input (shouldn't normally fire, but guard anyway).
    inputs[1].checked = true;
    inputs[1].dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual([]);
  });
});

@Component({
  standalone: true,
  imports: [CheckboxGroupComponent, CheckboxComponent],
  template: `
    <tedi-checkbox-group [(values)]="selected">
      <input tedi-checkbox type="checkbox" value="a" />
      <input tedi-checkbox type="checkbox" value="b" />
    </tedi-checkbox-group>
  `,
})
class TwoWayHostComponent {
  selected: string[] = ["a"];
}

describe("CheckboxGroupComponent — managed with [(values)]", () => {
  let fixture: ComponentFixture<TwoWayHostComponent>;
  let inputs: HTMLInputElement[];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TwoWayHostComponent] });
    fixture = TestBed.createComponent(TwoWayHostComponent);
    fixture.detectChanges();
    inputs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'input[type="checkbox"]'
      )
    ) as HTMLInputElement[];
  });

  it("should reflect initial values", () => {
    expect(inputs[0].checked).toBe(true);
    expect(inputs[1].checked).toBe(false);
  });

  it("should update bound values on toggle", () => {
    inputs[1].checked = true;
    inputs[1].dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toEqual(["a", "b"]);
  });
});

@Component({
  standalone: true,
  imports: [
    CheckboxGroupComponent,
    CheckboxComponent,
    CheckboxCardComponent,
    CheckboxCardGroupComponent,
    ReactiveFormsModule,
  ],
  template: `
    <tedi-checkbox-group [formControl]="control">
      <tedi-checkbox-card-group>
        <label tedi-checkbox-card variant="primary">
          <input tedi-checkbox type="checkbox" value="analytics" />
          Analytics
        </label>
        <label tedi-checkbox-card variant="primary">
          <input tedi-checkbox type="checkbox" value="export" />
          Export
        </label>
      </tedi-checkbox-card-group>
    </tedi-checkbox-group>
  `,
})
class CardHostComponent {
  control = new FormControl<string[]>([]);
}

describe("CheckboxGroupComponent — card children", () => {
  it("should coordinate card-wrapped checkboxes", () => {
    TestBed.configureTestingModule({ imports: [CardHostComponent] });
    const fixture = TestBed.createComponent(CardHostComponent);
    fixture.detectChanges();
    const inputs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'input[type="checkbox"]'
      )
    ) as HTMLInputElement[];
    fixture.componentInstance.control.setValue(["export"]);
    fixture.detectChanges();
    expect(inputs[0].checked).toBe(false);
    expect(inputs[1].checked).toBe(true);

    inputs[0].checked = true;
    inputs[0].dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toEqual([
      "export",
      "analytics",
    ]);
  });
});

@Component({
  standalone: true,
  imports: [CheckboxGroupComponent, CheckboxComponent, ReactiveFormsModule],
  template: `
    <tedi-checkbox-group [formControl]="control">
      <input tedi-checkbox type="checkbox" />
    </tedi-checkbox-group>
  `,
})
class MissingValueHostComponent {
  control = new FormControl<string[]>([]);
}

describe("CheckboxGroupComponent — missing child value", () => {
  it("should warn once per instance and drop the change", () => {
    TestBed.configureTestingModule({ imports: [MissingValueHostComponent] });
    const fixture = TestBed.createComponent(MissingValueHostComponent);
    fixture.detectChanges();
    const input = (
      fixture.nativeElement as HTMLElement
    ).querySelector<HTMLInputElement>('input[type="checkbox"]')!;
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    input.checked = true;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.control.value).toEqual([]);

    input.checked = false;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    input.checked = true;
    input.dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance.control.value).toEqual([]);

    warnSpy.mockRestore();
  });
});
