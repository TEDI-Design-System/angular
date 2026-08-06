import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "./search.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { TextFieldComponent } from "../text-field/text-field.component";
import { LabelComponent } from "../label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

describe("SearchComponent", () => {
  let fixture: ComponentFixture<SearchComponent>;
  let component: SearchComponent;
  let el: HTMLElement;

  const getInput = () => el.querySelector("input") as HTMLInputElement;

  const typeInto = (value: string) => {
    const input = getInput();
    input.value = value;
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SearchComponent,
        FormFieldComponent,
        TextFieldComponent,
        LabelComponent,
        FeedbackTextComponent,
        ButtonComponent,
        IconComponent,
      ],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    });

    fixture = TestBed.createComponent(SearchComponent);
    fixture.componentRef.setInput("inputId", "test-id");
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should render a search landmark with role and searchbox input", () => {
    expect(el.getAttribute("role")).toBe("search");
    expect(getInput().getAttribute("role")).toBe("searchbox");
  });

  it("should associate the label with the input", () => {
    fixture.componentRef.setInput("label", "Otsing");
    fixture.detectChanges();

    const label = el.querySelector("label") as HTMLLabelElement;
    expect(label.getAttribute("for")).toBe("test-id");
    expect(label.textContent?.trim()).toBe("Otsing");
  });

  describe("accessible name", () => {
    it("should use label when provided", () => {
      fixture.componentRef.setInput("label", "Otsing");
      fixture.detectChanges();
      expect(el.getAttribute("aria-label")).toBe("Otsing");
    });

    it("should fall back to placeholder when no label", () => {
      fixture.componentRef.setInput("placeholder", "Otsi siit");
      fixture.detectChanges();
      expect(el.getAttribute("aria-label")).toBe("Otsi siit");
    });

    it("should fall back to the translated search label", () => {
      expect(el.getAttribute("aria-label")).toBe("Otsi");
    });

    it("should prefer explicit ariaLabel over label", () => {
      fixture.componentRef.setInput("label", "Otsing");
      fixture.componentRef.setInput("ariaLabel", "Otsi tooteid");
      fixture.detectChanges();
      expect(el.getAttribute("aria-label")).toBe("Otsi tooteid");
    });
  });

  describe("input accessible name", () => {
    it("should name the input even without a label or placeholder", () => {
      expect(getInput().getAttribute("aria-label")).toBe("Otsi");
    });

    it("should use ariaLabel when there is no visible label", () => {
      fixture.componentRef.setInput("ariaLabel", "Otsi tooteid");
      fixture.detectChanges();
      expect(getInput().getAttribute("aria-label")).toBe("Otsi tooteid");
    });

    it("should leave naming to the visible label when one is rendered", () => {
      fixture.componentRef.setInput("label", "Otsing");
      fixture.detectChanges();
      expect(getInput().getAttribute("aria-label")).toBeNull();
    });
  });

  it("should show the search icon when there is no button", () => {
    expect(el.querySelector(".tedi-form-field__icon tedi-icon")).not.toBeNull();
    expect(el.querySelector("button.tedi-search__button")).toBeNull();
  });

  it("should propagate typed value and call onChange", () => {
    const onChange = jest.fn<void, [string]>();
    component.registerOnChange(onChange);

    typeInto("hello");

    expect(component.value()).toBe("hello");
    expect(onChange).toHaveBeenCalledWith("hello");
  });

  it("should reflect the value input onto the native input", () => {
    fixture.componentRef.setInput("value", "preset");
    fixture.detectChanges();
    expect(getInput().value).toBe("preset");
  });

  it("should emit search on Enter key", () => {
    const searchSpy = jest.fn<void, [string]>();
    component.searchEvent.subscribe(searchSpy);

    typeInto("query");
    getInput().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    fixture.detectChanges();

    expect(searchSpy).toHaveBeenCalledWith("query");
  });

  it("should emit search on button click", () => {
    fixture.componentRef.setInput("button", { text: "Otsi" });
    fixture.detectChanges();

    const searchSpy = jest.fn<void, [string]>();
    component.searchEvent.subscribe(searchSpy);

    typeInto("query");
    const button = el.querySelector("button.tedi-search__button") as HTMLButtonElement;
    button.click();

    expect(searchSpy).toHaveBeenCalledWith("query");
  });

  it("should hide the inline icon when a button is set", () => {
    fixture.componentRef.setInput("button", { text: "Otsi" });
    fixture.detectChanges();

    expect(el.querySelector(".tedi-form-field__icon")).toBeNull();
    expect(el.querySelector("button.tedi-search__button")).not.toBeNull();
  });

  it("should give an icon-only button an accessible label", () => {
    fixture.componentRef.setInput("button", {});
    fixture.detectChanges();

    const button = el.querySelector("button.tedi-search__button") as HTMLButtonElement;
    expect(button.getAttribute("aria-label")).toBeTruthy();
  });

  it("should clear the value and emit clear", () => {
    const clearSpy = jest.fn();
    component.clear.subscribe(clearSpy);

    typeInto("something");
    const clearBtn = el.querySelector(".tedi-form-field__clear") as HTMLButtonElement;
    clearBtn.click();
    fixture.detectChanges();

    expect(component.value()).toBe("");
    expect(clearSpy).toHaveBeenCalled();
  });

  it("should disable the input and button when disabled", () => {
    fixture.componentRef.setInput("button", { text: "Otsi" });
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();

    expect(component.isDisabled()).toBe(true);
    expect(getInput().disabled).toBe(true);
    const button = el.querySelector("button.tedi-search__button") as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("should set aria-describedby when feedbackText is provided", () => {
    const freshFixture = TestBed.createComponent(SearchComponent);
    freshFixture.componentRef.setInput("inputId", "test-id");
    freshFixture.componentRef.setInput("feedbackText", {
      text: "Tagasiside tekst",
      type: "error",
    });
    freshFixture.detectChanges();
    const freshEl = freshFixture.nativeElement as HTMLElement;

    expect(
      freshEl.querySelector("input")?.getAttribute("aria-describedby")
    ).toBe("test-id-feedback");
    const feedback = freshEl.querySelector("tedi-feedback-text");
    expect(feedback?.getAttribute("id")).toBe("test-id-feedback");
    expect(feedback?.textContent?.trim()).toBe("Tagasiside tekst");
  });

  it("should not set aria-describedby without feedbackText", () => {
    expect(getInput().getAttribute("aria-describedby")).toBeNull();
  });

  describe("ControlValueAccessor", () => {
    it("writeValue() should set the value (and default null to empty)", () => {
      component.writeValue("abc");
      expect(component.value()).toBe("abc");

      component.writeValue(null);
      expect(component.value()).toBe("");
    });

    it("setDisabledState() should toggle the disabled state", () => {
      component.setDisabledState(true);
      fixture.detectChanges();
      expect(component.isDisabled()).toBe(true);
      expect(getInput().disabled).toBe(true);

      component.setDisabledState(false);
      fixture.detectChanges();
      expect(component.isDisabled()).toBe(false);
      expect(getInput().disabled).toBe(false);
    });

    it("should call onTouched on blur", () => {
      const onTouched = jest.fn();
      component.registerOnTouched(onTouched);

      getInput().dispatchEvent(new Event("blur"));
      fixture.detectChanges();

      expect(onTouched).toHaveBeenCalled();
    });
  });

  it("focus() should focus the underlying input", () => {
    const input = getInput();
    const focusSpy = jest.spyOn(input, "focus");

    component.focus();

    expect(focusSpy).toHaveBeenCalled();
    expect(document.activeElement).toBe(input);
  });

  describe("field height", () => {
    const heightVar = () =>
      el.style.getPropertyValue("--tedi-search-field-height");

    it("should use the small field-height token for size small", () => {
      fixture.componentRef.setInput("size", "small");
      fixture.detectChanges();

      expect(component.fieldHeight()).toBe("var(--form-field-height-sm)");
      expect(heightVar()).toBe("var(--form-field-height-sm)");
    });

    it("should use the large field-height token for size large", () => {
      fixture.componentRef.setInput("size", "large");
      fixture.detectChanges();

      expect(component.fieldHeight()).toBe("var(--form-field-height-lg)");
      expect(heightVar()).toBe("var(--form-field-height-lg)");
    });

    it("should use the default field-height token for the default size", () => {
      expect(component.fieldHeight()).toBe("var(--form-field-height)");
      expect(heightVar()).toBe("var(--form-field-height)");
    });
  });

  describe("button sizing", () => {
    it("should use a small button with an 18px icon for size small", () => {
      fixture.componentRef.setInput("size", "small");
      fixture.detectChanges();

      expect(component.buttonSize()).toBe("small");
      expect(component.buttonIconSize()).toBe(18);
    });

    it("should use a default button with an 18px icon for the default size", () => {
      expect(component.buttonSize()).toBe("default");
      expect(component.buttonIconSize()).toBe(18);
    });

    it("should use a default button with a 24px icon for size large", () => {
      fixture.componentRef.setInput("size", "large");
      fixture.detectChanges();

      expect(component.buttonSize()).toBe("default");
      expect(component.buttonIconSize()).toBe(24);
    });
  });
});

@Component({
  standalone: true,
  imports: [SearchComponent, ReactiveFormsModule],
  template: `<tedi-search inputId="cva-id" [formControl]="control" />`,
})
class ReactiveHostComponent {
  control = new FormControl<string>("", { nonNullable: true });
}

describe("SearchComponent with reactive forms", () => {
  let hostFixture: ComponentFixture<ReactiveHostComponent>;
  let host: ReactiveHostComponent;
  let hostEl: HTMLElement;

  const getInput = () => hostEl.querySelector("input") as HTMLInputElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    });

    hostFixture = TestBed.createComponent(ReactiveHostComponent);
    host = hostFixture.componentInstance;
    hostEl = hostFixture.nativeElement;
    hostFixture.detectChanges();
  });

  it("should register as a value accessor and reflect the control value", () => {
    host.control.setValue("from-model");
    hostFixture.detectChanges();

    expect(getInput().value).toBe("from-model");
  });

  it("should propagate input changes back to the form control", () => {
    const input = getInput();
    input.value = "typed";
    input.dispatchEvent(new Event("input"));
    hostFixture.detectChanges();

    expect(host.control.value).toBe("typed");
  });
});
