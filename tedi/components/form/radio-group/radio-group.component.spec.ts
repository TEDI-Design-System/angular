import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import {
  RadioGroupComponent,
  RadioGroupDirection,
} from "./radio-group.component";
import { RadioComponent } from "../radio/radio.component";
import { RadioCardComponent } from "../radio-card/radio-card.component";
import { RadioCardGroupComponent } from "../radio-card-group/radio-card-group.component";
import { LabelComponent } from "../label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";

@Component({
  standalone: true,
  imports: [
    RadioGroupComponent,
    RadioComponent,
    LabelComponent,
    FeedbackTextComponent,
  ],
  template: `
    <tedi-radio-group [label]="label" [direction]="direction">
      <label tedi-label color="primary" class="flex align-items-center gap-2">
        <input tedi-radio type="radio" name="test" />
        Option 1
      </label>
      <label tedi-label color="primary" class="flex align-items-center gap-2">
        <input tedi-radio type="radio" name="test" />
        Option 2
      </label>
      @if (showFeedback) {
        <tedi-feedback-text text="Hint text" />
      }
    </tedi-radio-group>
  `,
})
class TestHostComponent {
  label?: string;
  direction: RadioGroupDirection = "horizontal";
  showFeedback = false;
}

describe("RadioGroupComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let groupElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    groupElement = fixture.nativeElement.querySelector("tedi-radio-group");
  });

  it("should create component", () => {
    expect(groupElement).toBeTruthy();
    expect(groupElement.classList).toContain("tedi-radio-group");
  });

  it("should not render label when not provided", () => {
    const label = groupElement.querySelector(".tedi-radio-group__label");
    expect(label).toBeFalsy();
  });

  it("should render label when provided", () => {
    fixture.componentInstance.label = "Group Label";
    fixture.detectChanges();
    const label = groupElement.querySelector(".tedi-radio-group__label");
    expect(label).toBeTruthy();
    expect(label?.textContent?.trim()).toBe("Group Label");
  });

  it("should use horizontal direction by default", () => {
    const checks = groupElement.querySelector(".tedi-radio-group__checks");
    expect(checks?.classList).not.toContain(
      "tedi-radio-group__checks--vertical"
    );
  });

  it("should apply vertical direction class", () => {
    fixture.componentInstance.direction = "vertical";
    fixture.detectChanges();
    const checks = groupElement.querySelector(".tedi-radio-group__checks");
    expect(checks?.classList).toContain("tedi-radio-group__checks--vertical");
  });

  it("should project radio content into checks container", () => {
    const checks = groupElement.querySelector(".tedi-radio-group__checks");
    const inputs = checks?.querySelectorAll('input[type="radio"]');
    expect(inputs?.length).toBe(2);
  });

  it("should project feedback text into subtexts container", () => {
    fixture.componentInstance.showFeedback = true;
    fixture.detectChanges();
    const subtexts = groupElement.querySelector(
      ".tedi-radio-group__subtexts"
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
  imports: [RadioGroupComponent, RadioComponent, ReactiveFormsModule],
  template: `
    <tedi-radio-group [formControl]="control" label="Status">
      <input tedi-radio type="radio" value="all" />
      <input tedi-radio type="radio" value="active" />
      <input tedi-radio type="radio" value="done" />
    </tedi-radio-group>
  `,
})
class FormControlHostComponent {
  control = new FormControl<string | null>(null);
}

describe("RadioGroupComponent — managed with FormControl", () => {
  let fixture: ComponentFixture<FormControlHostComponent>;
  let groupElement: HTMLElement;
  let inputs: HTMLInputElement[];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormControlHostComponent],
    });

    fixture = TestBed.createComponent(FormControlHostComponent);
    fixture.detectChanges();
    groupElement = fixture.nativeElement.querySelector("tedi-radio-group");
    inputs = Array.from(
      groupElement.querySelectorAll('input[type="radio"]')
    ) as HTMLInputElement[];
  });

  it("should apply role=radiogroup when managed", () => {
    expect(groupElement.getAttribute("role")).toBe("radiogroup");
  });

  it("should apply aria-labelledby pointing at the rendered label", () => {
    const labelledBy = groupElement.getAttribute("aria-labelledby");
    expect(labelledBy).toBeTruthy();
    const labelEl = groupElement.querySelector(".tedi-radio-group__label");
    expect(labelEl?.id).toBe(labelledBy);
    expect(labelEl?.textContent?.trim()).toBe("Status");
    expect(groupElement.getAttribute("aria-label")).toBeNull();
  });

  it("should share an auto-generated name across children", () => {
    const names = inputs.map((i) => i.getAttribute("name"));
    expect(names[0]).toBeTruthy();
    expect(names[0]).toMatch(/^tedi-radio-group-\d+$/);
    expect(new Set(names).size).toBe(1);
  });

  it("should reflect FormControl value into native checked state", () => {
    fixture.componentInstance.control.setValue("active");
    fixture.detectChanges();
    expect(inputs[0].checked).toBe(false);
    expect(inputs[1].checked).toBe(true);
    expect(inputs[2].checked).toBe(false);
  });

  it("should update FormControl when a child is clicked", () => {
    inputs[2].checked = true;
    inputs[2].dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe("done");
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
  imports: [RadioGroupComponent, RadioComponent],
  template: `
    <tedi-radio-group [(value)]="selected">
      <input tedi-radio type="radio" value="a" />
      <input tedi-radio type="radio" value="b" />
    </tedi-radio-group>
  `,
})
class TwoWayHostComponent {
  selected: string | null = "a";
}

describe("RadioGroupComponent — managed with [(value)]", () => {
  let fixture: ComponentFixture<TwoWayHostComponent>;
  let inputs: HTMLInputElement[];

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TwoWayHostComponent] });
    fixture = TestBed.createComponent(TwoWayHostComponent);
    fixture.detectChanges();
    inputs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'input[type="radio"]'
      )
    ) as HTMLInputElement[];
  });

  it("should reflect initial value", () => {
    expect(inputs[0].checked).toBe(true);
    expect(inputs[1].checked).toBe(false);
  });

  it("should update bound value on click", () => {
    inputs[1].checked = true;
    inputs[1].dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe("b");
  });
});

@Component({
  standalone: true,
  imports: [RadioGroupComponent, RadioComponent],
  template: `
    <tedi-radio-group [(value)]="selected">
      <input tedi-radio type="radio" value="a" />
      <input tedi-radio type="radio" value="b" />
    </tedi-radio-group>
  `,
})
class TwoWayNullInitialHostComponent {
  selected: string | null = null;
}

describe("RadioGroupComponent — managed with [(value)] starting null", () => {
  it("should propagate clicks even when two-way value starts null", () => {
    TestBed.configureTestingModule({
      imports: [TwoWayNullInitialHostComponent],
    });
    const fixture = TestBed.createComponent(TwoWayNullInitialHostComponent);
    fixture.detectChanges();
    const inputs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'input[type="radio"]'
      )
    ) as HTMLInputElement[];

    inputs[1].checked = true;
    inputs[1].dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.selected).toBe("b");
  });
});

@Component({
  standalone: true,
  imports: [
    RadioGroupComponent,
    RadioComponent,
    RadioCardComponent,
    RadioCardGroupComponent,
    ReactiveFormsModule,
  ],
  template: `
    <tedi-radio-group [formControl]="control">
      <tedi-radio-card-group>
        <label tedi-radio-card variant="primary">
          <input tedi-radio type="radio" value="basic" />
          Basic
        </label>
        <label tedi-radio-card variant="primary">
          <input tedi-radio type="radio" value="pro" />
          Pro
        </label>
      </tedi-radio-card-group>
    </tedi-radio-group>
  `,
})
class CardHostComponent {
  control = new FormControl<string | null>(null);
}

describe("RadioGroupComponent — per-item disabled", () => {
  it("should reflect dynamic [disabled] toggles on a child after group-disabled cycles", () => {
    @Component({
      standalone: true,
      imports: [RadioGroupComponent, RadioComponent, ReactiveFormsModule],
      template: `
        <tedi-radio-group [formControl]="control">
          <input tedi-radio type="radio" value="a" [disabled]="aDisabled" />
          <input tedi-radio type="radio" value="b" />
        </tedi-radio-group>
      `,
    })
    class DynamicHostComponent {
      control = new FormControl<string | null>(null);
      aDisabled = false;
    }

    TestBed.configureTestingModule({ imports: [DynamicHostComponent] });
    const fixture = TestBed.createComponent(DynamicHostComponent);
    fixture.detectChanges();
    const inputs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'input[type="radio"]'
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
});

describe("RadioGroupComponent — card children", () => {
  it("should coordinate card-wrapped radios", () => {
    TestBed.configureTestingModule({ imports: [CardHostComponent] });
    const fixture = TestBed.createComponent(CardHostComponent);
    fixture.detectChanges();
    const inputs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'input[type="radio"]'
      )
    ) as HTMLInputElement[];
    fixture.componentInstance.control.setValue("pro");
    fixture.detectChanges();
    expect(inputs[0].checked).toBe(false);
    expect(inputs[1].checked).toBe(true);

    inputs[0].checked = true;
    inputs[0].dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe("basic");
  });
});
