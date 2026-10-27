import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TextareaComponent } from "./textarea.component";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { Component } from "@angular/core";
import { By } from "@angular/platform-browser";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

@Component({
  standalone: true,
  imports: [TextareaComponent, ReactiveFormsModule],
  template: `<textarea tedi-textarea></textarea>`,
})
class TestHostComponent {}

@Component({
  standalone: true,
  imports: [TextareaComponent],
  template: `<textarea tedi-textarea [invalid]="true"></textarea>`,
})
class InvalidHostComponent {}

@Component({
  standalone: true,
  imports: [TextareaComponent, ReactiveFormsModule],
  template: `<textarea tedi-textarea [formControl]="control"></textarea>`,
})
class FormControlHostComponent {
  control = new FormControl<string>("", { nonNullable: true });
}

describe("TextareaComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let textarea: HTMLTextAreaElement;
  let component: TextareaComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "en" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const debug = fixture.debugElement.query(By.directive(TextareaComponent));
    component = debug.componentInstance;
    textarea = debug.nativeElement;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
    expect(textarea).toBeTruthy();
    expect(textarea.tagName).toBe("TEXTAREA");
  });

  it("should apply the base class", () => {
    expect(textarea.classList.contains("tedi-textarea")).toBe(true);
  });

  it("writeValue() should set the passed-in value", () => {
    component.writeValue("test");
    fixture.detectChanges();

    expect(textarea.value).toBe("test");
  });

  it("writeValue(null) should reset the value to an empty string", () => {
    component.writeValue("test");
    fixture.detectChanges();

    component.writeValue(null);
    fixture.detectChanges();

    expect(component.value()).toBe("");
    expect(textarea.value).toBe("");
  });

  it("registerOnChange() triggers when input changes", () => {
    const onChangeSpy = jest.fn();
    component.registerOnChange(onChangeSpy);

    textarea.value = "changed";
    textarea.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    expect(onChangeSpy).toHaveBeenCalledWith("changed");
    expect(component.value()).toBe("changed");
  });

  it("registerOnTouched() triggers when blurred", () => {
    const onTouchedSpy = jest.fn();
    component.registerOnTouched(onTouchedSpy);

    textarea.dispatchEvent(new Event("blur"));
    fixture.detectChanges();

    expect(onTouchedSpy).toHaveBeenCalled();
  });

  it("should reflect the invalid input", () => {
    const invalidFixture = TestBed.createComponent(InvalidHostComponent);
    invalidFixture.detectChanges();
    const invalidTextarea = invalidFixture.debugElement.query(
      By.directive(TextareaComponent),
    ).componentInstance as TextareaComponent;

    expect(invalidTextarea.invalid()).toBe(true);
    expect(
      invalidFixture.nativeElement
        .querySelector("textarea")
        .getAttribute("aria-invalid"),
    ).toBe("true");
  });

  it("should paint its own surface when not inside a field box", () => {
    expect(textarea.classList.contains("tedi-field-surface")).toBe(true);
  });

  describe("resizable", () => {
    it("is resizable by default (no modifier class)", () => {
      expect(textarea.classList.contains("tedi-textarea--not-resizable")).toBe(
        false,
      );
    });

    it("applies the not-resizable modifier class when disabled", () => {
      const resizeFixture = TestBed.createComponent(TextareaComponent);
      resizeFixture.componentRef.setInput("resizable", false);
      resizeFixture.detectChanges();

      expect(
        (resizeFixture.nativeElement as HTMLElement).classList.contains(
          "tedi-textarea--not-resizable",
        ),
      ).toBe(true);
    });
  });

  describe("autoGrow", () => {
    it("does not apply the auto-grow class by default", () => {
      expect(textarea.classList.contains("tedi-textarea--auto-grow")).toBe(
        false,
      );
    });

    it("applies the auto-grow class when enabled", () => {
      const growFixture = TestBed.createComponent(TextareaComponent);
      growFixture.componentRef.setInput("autoGrow", true);
      growFixture.detectChanges();

      expect(
        (growFixture.nativeElement as HTMLElement).classList.contains(
          "tedi-textarea--auto-grow",
        ),
      ).toBe(true);
    });

    const makeFixture = (inputs: Record<string, unknown>) => {
      const f = TestBed.createComponent(TextareaComponent);
      Object.entries(inputs).forEach(([k, v]) => f.componentRef.setInput(k, v));
      f.detectChanges();
      return f.componentInstance;
    };

    it("derives min-height from minRows in both modes", () => {
      expect(makeFixture({ autoGrow: true, minRows: 4 }).minHeightStyle()).toBe(
        "calc(4 * 1lh + 2 * var(--_field-padding-y))",
      );
      expect(
        makeFixture({ autoGrow: false, minRows: 4 }).minHeightStyle(),
      ).toBe("calc(4 * 1lh + 2 * var(--_field-padding-y))");
    });

    it("treats minRows below 1 as 1", () => {
      const f = TestBed.createComponent(TextareaComponent);
      f.componentRef.setInput("minRows", 0);
      f.detectChanges();

      expect(f.componentInstance.minHeightStyle()).toBe(
        "calc(1 * 1lh + 2 * var(--_field-padding-y))",
      );
      expect((f.nativeElement as HTMLTextAreaElement).rows).toBe(1);
    });

    it("keeps a rows attribute the consumer set", () => {
      @Component({
        standalone: true,
        imports: [TextareaComponent],
        template: `<textarea tedi-textarea rows="5"></textarea>`,
      })
      class RowsHostComponent {}

      const f = TestBed.createComponent(RowsHostComponent);
      f.detectChanges();

      const textarea = f.nativeElement.querySelector("textarea");
      expect(textarea.rows).toBe(5);
    });

    it("sets the native rows from minRows", () => {
      const f = TestBed.createComponent(TextareaComponent);
      f.componentRef.setInput("minRows", 5);
      f.detectChanges();

      expect((f.nativeElement as HTMLTextAreaElement).rows).toBe(5);
    });

    it("rests at minRows when no height is set", () => {
      const component = makeFixture({});

      expect(component.heightStyle()).toBeNull();
      expect(component.minHeightStyle()).toBe(
        "calc(3 * 1lh + 2 * var(--_field-padding-y))",
      );
    });

    it("derives max-height from maxRows in both modes", () => {
      expect(
        makeFixture({ autoGrow: true, maxRows: 10 }).maxHeightStyle(),
      ).toBe("calc(10 * 1lh + 2 * var(--_field-padding-y))");
      expect(
        makeFixture({ autoGrow: false, maxRows: 10 }).maxHeightStyle(),
      ).toBe("calc(10 * 1lh + 2 * var(--_field-padding-y))");
    });

    it("sets no max-height without maxRows or maxHeight", () => {
      expect(makeFixture({ autoGrow: true }).maxHeightStyle()).toBeNull();
      expect(makeFixture({}).maxHeightStyle()).toBeNull();
    });

    it("caps at maxHeight alone without maxRows", () => {
      expect(
        makeFixture({ autoGrow: true, maxHeight: 200 }).maxHeightStyle(),
      ).toBe("200px");
    });

    it("combines maxRows and maxHeight with min()", () => {
      expect(
        makeFixture({
          autoGrow: true,
          maxRows: 12,
          maxHeight: "200px",
        }).maxHeightStyle(),
      ).toBe("min(calc(12 * 1lh + 2 * var(--_field-padding-y)), 200px)");
      expect(
        makeFixture({ maxRows: 12, maxHeight: 200 }).maxHeightStyle(),
      ).toBe("min(calc(12 * 1lh + 2 * var(--_field-padding-y)), 200px)");
    });

    it("applies an explicit height when not auto-growing", () => {
      expect(makeFixture({ height: "7.5rem" }).heightStyle()).toBe("7.5rem");
      expect(makeFixture({ height: 200 }).heightStyle()).toBe("200px");
    });

    it("ignores an explicit height while auto-growing", () => {
      expect(
        makeFixture({ autoGrow: true, height: "7.5rem" }).heightStyle(),
      ).toBeNull();
    });
  });

  describe("when bound to a reactive FormControl", () => {
    let fcFixture: ComponentFixture<FormControlHostComponent>;
    let fcComponent: TextareaComponent;
    let fcTextarea: HTMLTextAreaElement;
    let control: FormControl<string>;

    beforeEach(() => {
      fcFixture = TestBed.createComponent(FormControlHostComponent);
      fcFixture.detectChanges();

      const debug = fcFixture.debugElement.query(
        By.directive(TextareaComponent),
      );
      fcComponent = debug.componentInstance;
      fcTextarea = debug.nativeElement;
      control = fcFixture.componentInstance.control;
    });

    it("should reflect control value changes", () => {
      control.setValue("hello");
      fcFixture.detectChanges();

      expect(fcComponent.value()).toBe("hello");
      expect(fcTextarea.value).toBe("hello");
    });

    it("should disable when control.disable() is called", () => {
      control.disable();
      fcFixture.detectChanges();

      expect(fcComponent.disabled()).toBe(true);
      expect(fcTextarea.disabled).toBe(true);
    });
  });
});

@Component({
  standalone: true,
  imports: [TextareaComponent],
  template: `<textarea tedi-textarea readonly></textarea>`,
})
class ReadOnlyTextareaHostComponent {}

describe("TextareaComponent readOnly", () => {
  it("reads the readonly attribute and keeps it on the textarea", () => {
    TestBed.configureTestingModule({
      imports: [ReadOnlyTextareaHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    });
    const fixture = TestBed.createComponent(ReadOnlyTextareaHostComponent);
    fixture.detectChanges();

    const textarea = fixture.debugElement.query(
      By.directive(TextareaComponent),
    );
    expect(textarea.injector.get(TextareaComponent).readOnly()).toBe(true);
    expect((textarea.nativeElement as HTMLTextAreaElement).readOnly).toBe(true);
  });
});

describe("TextareaComponent scrollbarWidth", () => {
  let observerCallback: ResizeObserverCallback;
  const disconnect = jest.fn();
  const originalResizeObserver = globalThis.ResizeObserver;

  beforeEach(() => {
    globalThis.ResizeObserver = jest.fn((callback: ResizeObserverCallback) => {
      observerCallback = callback;
      return { observe: jest.fn(), unobserve: jest.fn(), disconnect };
    }) as unknown as typeof ResizeObserver;
    TestBed.configureTestingModule({ imports: [TextareaComponent] });
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
  });

  it("reports the vertical scrollbar width, borders excluded", () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLTextAreaElement;
    el.style.border = "1px solid";
    Object.defineProperty(el, "offsetWidth", {
      configurable: true,
      value: 217,
    });
    Object.defineProperty(el, "clientWidth", {
      configurable: true,
      value: 200,
    });
    observerCallback([], {} as ResizeObserver);

    expect(fixture.componentInstance.scrollbarWidth()).toBe(15);
  });

  it("stops observing on destroy", () => {
    const fixture = TestBed.createComponent(TextareaComponent);
    fixture.detectChanges();
    fixture.destroy();

    expect(disconnect).toHaveBeenCalled();
  });
});
