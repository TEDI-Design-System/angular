import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, viewChild } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { SearchComponent } from "./search.component";
import { SearchFooterTemplateDirective } from "./search-templates.directive";
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

    it("should fall back to the placeholder when that is all there is", () => {
      fixture.componentRef.setInput("placeholder", "Otsi siit");
      fixture.detectChanges();
      expect(getInput().getAttribute("aria-label")).toBe("Otsi siit");
    });

    it("should leave naming to the visible label when one is rendered", () => {
      fixture.componentRef.setInput("label", "Otsing");
      fixture.detectChanges();
      expect(getInput().getAttribute("aria-label")).toBeNull();
    });

    it("should keep the visible label even when ariaLabel is also set", () => {
      fixture.componentRef.setInput("label", "Otsing");
      fixture.componentRef.setInput("ariaLabel", "Otsi tooteid");
      fixture.detectChanges();
      expect(getInput().getAttribute("aria-label")).toBeNull();
      expect(el.getAttribute("aria-label")).toBe("Otsi tooteid");
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

  describe("autocomplete mode", () => {
    it("stays a plain searchbox when no suggestions are bound", () => {
      expect(component.autocomplete()).toBe(false);
      expect(getInput().getAttribute("role")).toBe("searchbox");
      expect(getInput().getAttribute("aria-expanded")).toBeNull();
      expect(getInput().getAttribute("aria-autocomplete")).toBeNull();
    });

    it("becomes a listbox combobox when suggestions are bound, even if empty", () => {
      fixture.componentRef.setInput("suggestions", []);
      fixture.detectChanges();

      expect(component.autocomplete()).toBe(true);
      expect(getInput().getAttribute("role")).toBe("combobox");
      expect(getInput().getAttribute("aria-autocomplete")).toBe("list");
      expect(getInput().getAttribute("aria-expanded")).toBe("false");
    });

    it("resolves labels from plain strings", () => {
      fixture.componentRef.setInput("suggestions", ["Mari", "Mart"]);
      fixture.detectChanges();

      expect(component.resolvedSuggestions().map((s) => s.label)).toEqual([
        "Mari",
        "Mart",
      ]);
    });

    it("resolves labels from objects via bindLabel", () => {
      fixture.componentRef.setInput("suggestions", [
        { name: "Mari", code: 1 },
        { name: "Mart", code: 2 },
      ]);
      fixture.componentRef.setInput("bindLabel", "name");
      fixture.detectChanges();

      expect(component.resolvedSuggestions().map((s) => s.label)).toEqual([
        "Mari",
        "Mart",
      ]);
    });
  });

  describe("suggestion panel", () => {
    const panel = () =>
      document.querySelector(".tedi-search__panel") as HTMLElement | null;

    const openWith = (suggestions: unknown[], value = "Mar") => {
      fixture.componentRef.setInput("suggestions", suggestions);
      fixture.componentRef.setInput("value", value);
      fixture.detectChanges();
      component.openPanel();
      fixture.detectChanges();
    };

    afterEach(() => {
      component.closePanel();
      fixture.detectChanges();
    });

    it("renders nothing while closed", () => {
      fixture.componentRef.setInput("suggestions", ["Mari"]);
      fixture.detectChanges();

      expect(panel()).toBeNull();
    });

    it("renders one option per suggestion in a listbox", () => {
      openWith(["Mari Maasikas", "Mart Mesi"]);

      const listbox = document.querySelector(`#${component.listboxId()}`);
      expect(listbox?.getAttribute("role")).toBe("listbox");
      expect(document.querySelectorAll("li[tedi-search-option]").length).toBe(2);
    });

    it("renders the no-results row when the query matched nothing", () => {
      openWith([]);

      expect(document.querySelectorAll("li[tedi-search-option]").length).toBe(0);
      expect(panel()?.textContent).toContain("Tulemusi ei leitud");
    });

    it("renders the loading row instead of results", () => {
      fixture.componentRef.setInput("suggestions", ["Mari"]);
      fixture.componentRef.setInput("loading", true);
      fixture.componentRef.setInput("value", "Mar");
      fixture.detectChanges();
      component.openPanel();
      fixture.detectChanges();

      expect(panel()?.textContent).toContain("Otsin...");
      expect(document.querySelectorAll("li[tedi-search-option]").length).toBe(0);
    });

    it("stays closed for an empty query with no suggestions", () => {
      openWith([], "");

      expect(component.panelVisible()).toBe(false);
      expect(panel()).toBeNull();
    });
  });

  describe("minQueryLength", () => {
    const panel = () =>
      document.querySelector(".tedi-search__panel") as HTMLElement | null;

    beforeEach(() => {
      fixture.componentRef.setInput("suggestions", ["Mari Maasikas"]);
      fixture.componentRef.setInput("minQueryLength", 3);
      fixture.detectChanges();
    });

    afterEach(() => {
      component.closePanel();
      fixture.detectChanges();
    });

    it("stays closed below the threshold, with no no-results row", () => {
      fixture.componentRef.setInput("value", "Ma");
      fixture.detectChanges();
      component.openPanel();
      fixture.detectChanges();

      expect(component.meetsMinQueryLength()).toBe(false);
      expect(component.panelVisible()).toBe(false);
      expect(panel()).toBeNull();
    });

    it("opens once the threshold is reached", () => {
      fixture.componentRef.setInput("value", "Mar");
      fixture.detectChanges();
      component.openPanel();
      fixture.detectChanges();

      expect(component.meetsMinQueryLength()).toBe(true);
      expect(panel()).not.toBeNull();
    });

    it("does not announce anything below the threshold", () => {
      fixture.componentRef.setInput("value", "Ma");
      fixture.detectChanges();
      component.openPanel();
      fixture.detectChanges();

      expect(component.announcement()).toBe("");
    });

    it("keeps aria-expanded false below the threshold", () => {
      fixture.componentRef.setInput("value", "Ma");
      fixture.detectChanges();
      component.openPanel();
      fixture.detectChanges();

      expect(getInput().getAttribute("aria-expanded")).toBe("false");
    });

    it("suppresses the panel even while loading below the threshold", () => {
      fixture.componentRef.setInput("value", "Ma");
      fixture.componentRef.setInput("loading", true);
      fixture.detectChanges();
      component.openPanel();
      fixture.detectChanges();

      expect(panel()).toBeNull();
    });

    it("ignores surrounding whitespace when measuring the query", () => {
      fixture.componentRef.setInput("value", "  Ma  ");
      fixture.detectChanges();

      expect(component.meetsMinQueryLength()).toBe(false);
    });

    it("defaults to no threshold", () => {
      fixture.componentRef.setInput("minQueryLength", 0);
      fixture.componentRef.setInput("value", "M");
      fixture.detectChanges();
      component.openPanel();
      fixture.detectChanges();

      expect(component.meetsMinQueryLength()).toBe(true);
      expect(panel()).not.toBeNull();
    });
  });

  describe("keyboard navigation", () => {
    const press = (key: string) => {
      getInput().dispatchEvent(new KeyboardEvent("keydown", { key }));
      fixture.detectChanges();
    };

    beforeEach(() => {
      fixture.componentRef.setInput("suggestions", ["Mari", "Mart", "Malle"]);
      fixture.componentRef.setInput("value", "Ma");
      fixture.detectChanges();
      component.openPanel();
      fixture.detectChanges();
    });

    afterEach(() => {
      component.closePanel();
      fixture.detectChanges();
    });

    it("has no active option before navigating", () => {
      expect(getInput().getAttribute("aria-activedescendant")).toBeNull();
    });

    it("ArrowDown activates the first option", () => {
      press("ArrowDown");

      expect(getInput().getAttribute("aria-activedescendant")).toBe(
        component.optionId(0),
      );
    });

    it("ArrowDown twice activates the second option", () => {
      press("ArrowDown");
      press("ArrowDown");

      expect(getInput().getAttribute("aria-activedescendant")).toBe(
        component.optionId(1),
      );
    });

    it("ArrowUp from the first option wraps to the last", () => {
      press("ArrowDown");
      press("ArrowUp");

      expect(getInput().getAttribute("aria-activedescendant")).toBe(
        component.optionId(2),
      );
    });

    it("End activates the last option and Home the first", () => {
      press("End");
      expect(getInput().getAttribute("aria-activedescendant")).toBe(
        component.optionId(2),
      );

      press("Home");
      expect(getInput().getAttribute("aria-activedescendant")).toBe(
        component.optionId(0),
      );
    });

    it("does not set aria-activedescendant when nothing matched", () => {
      fixture.componentRef.setInput("suggestions", []);
      fixture.detectChanges();
      press("ArrowDown");

      expect(getInput().getAttribute("aria-activedescendant")).toBeNull();
    });

    it("clears the active option when new results arrive", () => {
      press("ArrowDown");
      expect(getInput().getAttribute("aria-activedescendant")).not.toBeNull();

      fixture.componentRef.setInput("suggestions", ["Kalle"]);
      fixture.detectChanges();

      expect(getInput().getAttribute("aria-activedescendant")).toBeNull();
    });

    it("Escape closes the panel and keeps focus in the input", () => {
      getInput().focus();
      press("ArrowDown");
      press("Escape");

      expect(component.panelOpen()).toBe(false);
      expect(document.activeElement).toBe(getInput());
    });
  });

  describe("selecting a suggestion", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("suggestions", ["Mari Maasikas", "Mart"]);
      fixture.componentRef.setInput("value", "Mar");
      fixture.detectChanges();
      component.openPanel();
      fixture.detectChanges();
    });

    afterEach(() => {
      component.closePanel();
      fixture.detectChanges();
    });

    it("fills the field, emits, and closes", () => {
      const selectSpy = jest.fn<void, [unknown]>();
      const onChange = jest.fn<void, [string]>();
      component.suggestionSelect.subscribe(selectSpy);
      component.registerOnChange(onChange);

      getInput().dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
      fixture.detectChanges();
      getInput().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      fixture.detectChanges();

      expect(component.value()).toBe("Mari Maasikas");
      expect(onChange).toHaveBeenCalledWith("Mari Maasikas");
      expect(selectSpy).toHaveBeenCalledWith("Mari Maasikas");
      expect(component.panelOpen()).toBe(false);
    });

    it("does not emit searchEvent when Enter accepted a suggestion", () => {
      const searchSpy = jest.fn<void, [string]>();
      component.searchEvent.subscribe(searchSpy);

      getInput().dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown" }),
      );
      fixture.detectChanges();
      getInput().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      fixture.detectChanges();

      expect(searchSpy).not.toHaveBeenCalled();
    });

    it("emits searchEvent when Enter is pressed with no active option", () => {
      const searchSpy = jest.fn<void, [string]>();
      component.searchEvent.subscribe(searchSpy);

      getInput().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      fixture.detectChanges();

      expect(searchSpy).toHaveBeenCalledWith("Mar");
    });

    it("clicking an option selects it", () => {
      const selectSpy = jest.fn<void, [unknown]>();
      component.suggestionSelect.subscribe(selectSpy);

      const option = document.querySelector(
        "li[tedi-search-option]",
      ) as HTMLElement;
      option.click();
      fixture.detectChanges();

      expect(selectSpy).toHaveBeenCalledWith("Mari Maasikas");
      expect(component.value()).toBe("Mari Maasikas");
    });

    it("does not reopen on focus straight after selecting", () => {
      component.selectSuggestion(component.resolvedSuggestions()[0]);
      fixture.detectChanges();

      component.onInputFocus();
      fixture.detectChanges();

      expect(component.panelOpen()).toBe(false);
    });

    it("reopens once the user edits again", () => {
      component.selectSuggestion(component.resolvedSuggestions()[0]);
      fixture.detectChanges();

      component.onInputValue("Mar");
      fixture.detectChanges();

      expect(component.panelOpen()).toBe(true);
    });
  });

  describe("panel open and close rules", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("suggestions", ["Mari"]);
      fixture.componentRef.setInput("value", "Mar");
      fixture.detectChanges();
    });

    afterEach(() => {
      component.closePanel();
      fixture.detectChanges();
    });

    it("opens on focus", () => {
      component.onInputFocus();
      fixture.detectChanges();

      expect(component.panelOpen()).toBe(true);
    });

    it("never opens in plain mode", () => {
      fixture.componentRef.setInput("suggestions", undefined);
      fixture.detectChanges();

      component.onInputFocus();
      component.openPanel();
      fixture.detectChanges();

      expect(component.panelOpen()).toBe(false);
    });

    it("closes when focus leaves the component entirely", () => {
      component.openPanel();
      fixture.detectChanges();

      component.onFocusOut(
        new FocusEvent("focusout", { relatedTarget: document.body }),
      );
      fixture.detectChanges();

      expect(component.panelOpen()).toBe(false);
    });

    it("stays open when focus moves within the component", () => {
      component.openPanel();
      fixture.detectChanges();

      component.onFocusOut(
        new FocusEvent("focusout", { relatedTarget: getInput() }),
      );
      fixture.detectChanges();

      expect(component.panelOpen()).toBe(true);
    });

    it("records the host width so the panel matches the field", () => {
      Object.defineProperty(el, "offsetWidth", {
        configurable: true,
        value: 420,
      });

      component.openPanel();
      fixture.detectChanges();

      expect(component.panelWidth()).toBe(420);
    });
  });

  describe("result announcements", () => {
    const liveRegion = () =>
      el.querySelector(".tedi-search__announcement") as HTMLElement;

    afterEach(() => {
      component.closePanel();
      fixture.detectChanges();
    });

    it("says nothing while the panel is closed", () => {
      fixture.componentRef.setInput("suggestions", ["Mari"]);
      fixture.detectChanges();

      expect(liveRegion().textContent?.trim()).toBe("");
    });

    it("announces the result count when open", () => {
      fixture.componentRef.setInput("suggestions", ["Mari", "Mart"]);
      fixture.componentRef.setInput("value", "Mar");
      fixture.detectChanges();
      component.openPanel();
      fixture.detectChanges();

      expect(liveRegion().textContent).toContain("2 vastet");
    });

    it("announces the empty state", () => {
      fixture.componentRef.setInput("suggestions", []);
      fixture.componentRef.setInput("value", "zzz");
      fixture.detectChanges();
      component.openPanel();
      fixture.detectChanges();

      expect(liveRegion().textContent).toContain("Tulemusi ei leitud");
    });

    it("announces loading", () => {
      fixture.componentRef.setInput("suggestions", []);
      fixture.componentRef.setInput("loading", true);
      fixture.componentRef.setInput("value", "Mar");
      fixture.detectChanges();
      component.openPanel();
      fixture.detectChanges();

      expect(liveRegion().textContent).toContain("Otsin...");
    });

    it("is a polite status region", () => {
      expect(liveRegion().getAttribute("role")).toBe("status");
      expect(liveRegion().getAttribute("aria-live")).toBe("polite");
      expect(liveRegion().classList).toContain("sr-only");
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

@Component({
  standalone: true,
  imports: [SearchComponent, SearchFooterTemplateDirective],
  template: `
    <tedi-search
      inputId="footer-search"
      label="Otsi"
      [suggestions]="suggestions"
      [value]="value"
    >
      <ng-template tediSearchFooter>
        <button type="button" class="footer-action-a">Isik teadmata</button>
        <button type="button" class="footer-action-b">Puudub isikukood</button>
      </ng-template>
    </tedi-search>
    <button type="button" class="after-field">after</button>
  `,
})
class FooterHostComponent {
  suggestions: string[] = ["Mari Maasikas"];
  value = "Mar";
  readonly search = viewChild.required(SearchComponent);
}

describe("SearchComponent with a footer", () => {
  let fixture: ComponentFixture<FooterHostComponent>;
  let search: SearchComponent;

  const getInput = () =>
    fixture.nativeElement.querySelector("#footer-search") as HTMLInputElement;
  const footer = () =>
    document.querySelector(".tedi-search__footer") as HTMLElement | null;
  const press = (el: Element, key: string, shiftKey = false) =>
    el.dispatchEvent(
      new KeyboardEvent("keydown", { key, shiftKey, bubbles: true }),
    );

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FooterHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    });

    fixture = TestBed.createComponent(FooterHostComponent);
    fixture.detectChanges();
    search = fixture.componentInstance.search();
    search.openPanel();
    fixture.detectChanges();
  });

  afterEach(() => {
    search.closePanel();
    fixture.detectChanges();
  });

  it("keeps the listbox combobox semantics — a footer is not a dialog", () => {
    expect(getInput().getAttribute("role")).toBe("combobox");
    expect(getInput().getAttribute("aria-autocomplete")).toBe("list");
    expect(getInput().getAttribute("aria-haspopup")).toBeNull();
    expect(getInput().getAttribute("aria-controls")).toBe(search.listboxId());
  });

  it("renders the footer below the options", () => {
    expect(document.querySelector("[role='listbox']")).not.toBeNull();
    expect(footer()?.querySelector(".footer-action-a")).not.toBeNull();
  });

  it("still selects suggestions with the keyboard", () => {
    press(getInput(), "ArrowDown");
    fixture.detectChanges();
    press(getInput(), "Enter");
    fixture.detectChanges();

    expect(search.value()).toBe("Mari Maasikas");
    expect(search.panelOpen()).toBe(false);
  });

  it("shows the footer in the no-results state", () => {
    fixture.componentInstance.suggestions = [];
    fixture.componentInstance.value = "zzz";
    fixture.detectChanges();
    search.openPanel();
    fixture.detectChanges();

    expect(document.querySelector("[role='listbox']")).toBeNull();
    expect(footer()?.querySelector(".footer-action-a")).not.toBeNull();
  });

  it("Tab from the input moves focus into the footer", () => {
    getInput().focus();
    press(getInput(), "Tab");
    fixture.detectChanges();

    expect(document.activeElement).toBe(footer()?.querySelector(".footer-action-a"));
  });

  it("Shift+Tab on the first footer control returns focus to the input", () => {
    const first = footer()?.querySelector(".footer-action-a") as HTMLElement;
    first.focus();
    press(first, "Tab", true);
    fixture.detectChanges();

    expect(document.activeElement).toBe(getInput());
  });

  it("Tab past the last footer control closes the panel instead of trapping", () => {
    const last = footer()?.querySelector(".footer-action-b") as HTMLElement;
    last.focus();
    press(last, "Tab");
    fixture.detectChanges();

    expect(search.panelOpen()).toBe(false);
  });

  it("Escape inside the footer closes and restores focus", () => {
    const first = footer()?.querySelector(".footer-action-a") as HTMLElement;
    first.focus();
    press(first, "Escape");
    fixture.detectChanges();

    expect(search.panelOpen()).toBe(false);
    expect(document.activeElement).toBe(getInput());
  });
});
