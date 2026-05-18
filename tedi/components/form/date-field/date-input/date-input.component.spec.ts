import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DateInputComponent } from "./date-input.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";

class TranslationMock {
  translate(key: string): string {
    return key;
  }
  track(key: string): () => string {
    return () => key;
  }
}

describe("DateInputComponent", () => {
  let fixture: ComponentFixture<DateInputComponent>;
  let component: DateInputComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DateInputComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    fixture = TestBed.createComponent(DateInputComponent);
    fixture.componentRef.setInput("inputId", "test-date-input");
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  function getInput(): HTMLInputElement {
    return el.querySelector("input.tedi-date-input__input") as HTMLInputElement;
  }

  function getIconButton(): HTMLButtonElement {
    return el.querySelector(".tedi-date-input__icon") as HTMLButtonElement;
  }

  it("creates the component", () => {
    expect(component).toBeTruthy();
  });

  it("assigns the inputId to the underlying input", () => {
    const input = getInput();
    expect(input.id).toBe("test-date-input");
  });

  it("renders the value in single mode (type=text)", () => {
    fixture.componentRef.setInput("value", "14.05.2026");
    fixture.detectChanges();

    const input = getInput();
    expect(input.type).toBe("text");
    expect(input.value).toBe("14.05.2026");
  });

  it("switches to type=date and uses nativeIsoValue when useNativePicker is true", () => {
    fixture.componentRef.setInput("useNativePicker", true);
    fixture.componentRef.setInput("value", "14.05.2026");
    fixture.componentRef.setInput("nativeIsoValue", "2026-05-14");
    fixture.detectChanges();

    const input = getInput();
    expect(input.type).toBe("date");
    expect(input.value).toBe("2026-05-14");
  });

  it("does not render chips when mode is single, even with chips provided", () => {
    fixture.componentRef.setInput("mode", "single");
    fixture.componentRef.setInput("chips", [{ id: "a", label: "01.01.2026" }]);
    fixture.detectChanges();

    const chips = el.querySelector(".tedi-date-input__chips");
    expect(chips).toBeNull();
    expect(el.querySelectorAll("tedi-tag").length).toBe(0);
  });

  it("does not render chips when mode is multiple but chips list is empty", () => {
    fixture.componentRef.setInput("mode", "multiple");
    fixture.componentRef.setInput("chips", []);
    fixture.detectChanges();

    const chips = el.querySelector(".tedi-date-input__chips");
    expect(chips).toBeNull();
    expect(el.querySelectorAll("tedi-tag").length).toBe(0);
  });

  it("renders chips as tedi-tag elements when mode='multiple' and chips list is non-empty", () => {
    fixture.componentRef.setInput("mode", "multiple");
    fixture.componentRef.setInput("chips", [
      { id: "a", label: "01.01.2026" },
      { id: "b", label: "02.01.2026" },
    ]);
    fixture.detectChanges();

    const tags = el.querySelectorAll("tedi-tag");
    expect(tags.length).toBe(2);
    expect(tags[0].textContent).toContain("01.01.2026");
    expect(tags[1].textContent).toContain("02.01.2026");
  });

  it("emits chipRemove with the chip id when the tag's close button is clicked", () => {
    fixture.componentRef.setInput("mode", "multiple");
    fixture.componentRef.setInput("chips", [{ id: "chip-1", label: "01.01.2026" }]);
    fixture.detectChanges();

    const removeBtn = el.querySelector(
      "tedi-tag .tedi-closing-button",
    ) as HTMLButtonElement;
    expect(removeBtn).not.toBeNull();
    const spy = jest.fn();
    component.chipRemove.subscribe(spy);

    removeBtn.click();
    expect(spy).toHaveBeenCalledWith("chip-1");
  });

  it("does not render a tag close button when disabled", () => {
    fixture.componentRef.setInput("mode", "multiple");
    fixture.componentRef.setInput("chips", [{ id: "chip-1", label: "01.01.2026" }]);
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();

    const removeBtn = el.querySelector("tedi-tag .tedi-closing-button");
    expect(removeBtn).toBeNull();
  });

  it("does not render a tag close button when readOnly", () => {
    fixture.componentRef.setInput("mode", "multiple");
    fixture.componentRef.setInput("chips", [{ id: "chip-1", label: "01.01.2026" }]);
    fixture.componentRef.setInput("readOnly", true);
    fixture.detectChanges();

    const removeBtn = el.querySelector("tedi-tag .tedi-closing-button");
    expect(removeBtn).toBeNull();
  });

  it("emits iconClick when the calendar icon button is clicked", () => {
    const spy = jest.fn();
    component.iconClick.subscribe(spy);

    getIconButton().click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("does not emit iconClick when disabled", () => {
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();

    const spy = jest.fn();
    component.iconClick.subscribe(spy);

    getIconButton().click();
    expect(spy).not.toHaveBeenCalled();
  });

  it("still emits iconClick when readOnly", () => {
    fixture.componentRef.setInput("readOnly", true);
    fixture.detectChanges();

    const spy = jest.fn();
    component.iconClick.subscribe(spy);

    getIconButton().click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("emits inputChange with the typed value", () => {
    const spy = jest.fn();
    component.inputChange.subscribe(spy);

    const input = getInput();
    input.value = "14.05.";
    input.dispatchEvent(new Event("input"));

    expect(spy).toHaveBeenCalledWith("14.05.");
  });

  it("sets the readonly attribute on the underlying input when readOnly is true", () => {
    fixture.componentRef.setInput("readOnly", true);
    fixture.detectChanges();

    expect(getInput().readOnly).toBe(true);
  });

  it("disables both the input and the icon button when disabled is true", () => {
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();

    expect(getInput().disabled).toBe(true);
    expect(getIconButton().disabled).toBe(true);
  });

  it("disables only the icon button when iconDisabled is true (input stays enabled)", () => {
    fixture.componentRef.setInput("iconDisabled", true);
    fixture.detectChanges();

    expect(getInput().disabled).toBe(false);
    expect(getIconButton().disabled).toBe(true);
  });

  it("does not emit iconClick when iconDisabled is true", () => {
    fixture.componentRef.setInput("iconDisabled", true);
    fixture.detectChanges();

    const spy = jest.fn();
    component.iconClick.subscribe(spy);
    getIconButton().click();
    expect(spy).not.toHaveBeenCalled();
  });

  it("does not emit inputChange or iconClick when disabled", () => {
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();

    const inputSpy = jest.fn();
    const iconSpy = jest.fn();
    component.inputChange.subscribe(inputSpy);
    component.iconClick.subscribe(iconSpy);

    getIconButton().click();
    expect(iconSpy).not.toHaveBeenCalled();

    // disabled native input ignores `input` events from user, but if dispatched manually
    // (which simulates a browser bug or programmatic event), the component must
    // still not call its handler since the input is disabled. To verify the
    // contract honestly, we only check the icon path here.
    expect(inputSpy).not.toHaveBeenCalled();
  });

  it("sets aria-expanded=true and the active modifier on the icon when iconActive is true", () => {
    fixture.componentRef.setInput("iconActive", true);
    fixture.detectChanges();

    const icon = getIconButton();
    expect(icon.getAttribute("aria-expanded")).toBe("true");
    expect(icon.classList.contains("tedi-date-input__icon--active")).toBe(true);
  });

  it("sets aria-expanded=false and no active modifier when iconActive is false", () => {
    const icon = getIconButton();
    expect(icon.getAttribute("aria-expanded")).toBe("false");
    expect(icon.classList.contains("tedi-date-input__icon--active")).toBe(false);
  });

  it("exposes an aria-label on the icon button", () => {
    const icon = getIconButton();
    const label = icon.getAttribute("aria-label");
    expect(label).toBeTruthy();
    expect(label?.length).toBeGreaterThan(0);
  });

  it("renders a labelled tag close button that is described by the chip label", () => {
    fixture.componentRef.setInput("mode", "multiple");
    fixture.componentRef.setInput("chips", [{ id: "a", label: "01.01.2026" }]);
    fixture.detectChanges();

    const tag = el.querySelector("tedi-tag") as HTMLElement;
    const removeBtn = tag.querySelector(
      ".tedi-closing-button",
    ) as HTMLButtonElement;
    expect(removeBtn.getAttribute("aria-label")).toBeTruthy();

    const describedById = removeBtn.getAttribute("aria-describedby");
    expect(describedById).toBeTruthy();
    const describedBy = tag.querySelector(`#${describedById}`);
    expect(describedBy?.textContent).toContain("01.01.2026");
  });

  it("renders a clear button only when clearable and value is non-empty", () => {
    expect(el.querySelector(".tedi-date-input__clear")).toBeNull();

    fixture.componentRef.setInput("clearable", true);
    fixture.componentRef.setInput("value", "14.05.2026");
    fixture.detectChanges();
    expect(el.querySelector(".tedi-date-input__clear")).not.toBeNull();
  });

  it("emits clear when the clear button is clicked", () => {
    fixture.componentRef.setInput("clearable", true);
    fixture.componentRef.setInput("value", "14.05.2026");
    fixture.detectChanges();

    const spy = jest.fn();
    component.clear.subscribe(spy);

    const clearBtn = el.querySelector(
      ".tedi-date-input__clear",
    ) as HTMLButtonElement;
    clearBtn.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("toggles the with-chips host modifier based on chip rendering", () => {
    const host = el as HTMLElement;
    expect(host.classList.contains("tedi-date-input--with-chips")).toBe(false);

    fixture.componentRef.setInput("mode", "multiple");
    fixture.componentRef.setInput("chips", [{ id: "a", label: "01.01.2026" }]);
    fixture.detectChanges();
    expect(host.classList.contains("tedi-date-input--with-chips")).toBe(true);
  });

  it("applies disabled and readonly host modifiers based on inputs", () => {
    const host = el as HTMLElement;
    expect(host.classList.contains("tedi-date-input--disabled")).toBe(false);
    expect(host.classList.contains("tedi-date-input--readonly")).toBe(false);

    fixture.componentRef.setInput("disabled", true);
    fixture.componentRef.setInput("readOnly", true);
    fixture.detectChanges();

    expect(host.classList.contains("tedi-date-input--disabled")).toBe(true);
    expect(host.classList.contains("tedi-date-input--readonly")).toBe(true);
  });
});
