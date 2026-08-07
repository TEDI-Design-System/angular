import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { TimeFieldComponent } from "./time-field.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { LabelComponent } from "../label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { BreakpointService } from "../../../services/breakpoint/breakpoint.service";
import { ModalService } from "../../overlay/modal/modal.service";
import { TEDI_FORM_FIELD } from "../form-field/form-field-context";

describe("TimeFieldComponent", () => {
  let fixture: ComponentFixture<TimeFieldComponent>;
  let component: TimeFieldComponent;
  let el: HTMLElement;
  /** Stands in for the wrapping `tedi-form-field`, which owns `clearable`. */
  let fieldClearable: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    fieldClearable = signal(false);
    TestBed.configureTestingModule({
      imports: [TimeFieldComponent],
      providers: [
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        { provide: TEDI_FORM_FIELD, useValue: { clearable: fieldClearable } },
      ],
    });

    fixture = TestBed.createComponent(TimeFieldComponent);
    fixture.componentRef.setInput("inputId", "test-id");
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with null value", () => {
    expect(component.value()).toBeNull();
  });

  describe("input", () => {
    it("should have correct id", () => {
      const input = el.querySelector("input");
      expect(input?.id).toBe("test-id");
    });

    it("should show placeholder when provided", () => {
      fixture.componentRef.setInput("placeholder", "hh:mm");
      fixture.detectChanges();

      const input = el.querySelector("input");
      expect(input?.placeholder).toBe("hh:mm");
    });

    it("should update inputValue on typing", () => {
      const input = el.querySelector("input")!;
      input.value = "14:30";
      input.dispatchEvent(new Event("input"));

      expect(component.inputValue()).toBe("14:30");
    });
  });

  describe("time parsing on blur", () => {
    let input: HTMLInputElement;

    beforeEach(() => {
      input = el.querySelector("input")!;
    });

    it("should accept valid time HH:mm", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      input.value = "09:30";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("09:30");
      expect(onChange).toHaveBeenCalledWith("09:30");
    });

    it("should accept single-digit hours and zero-pad", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      input.value = "9:05";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("09:05");
      expect(onChange).toHaveBeenCalledWith("09:05");
    });

    it("should accept 00:00", () => {
      input.value = "00:00";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("00:00");
    });

    it("should accept 23:59", () => {
      input.value = "23:59";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("23:59");
    });

    it("should normalize 4-digit input without delimiter", () => {
      input.value = "1155";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("11:55");
      expect(component.inputValue()).toBe("11:55");
    });

    it("should normalize 3-digit input without delimiter", () => {
      input.value = "930";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("09:30");
    });

    it("should normalize alternative delimiters", () => {
      input.value = "11.55";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("11:55");
    });

    it("should reject 24:00", () => {
      component.writeValue("12:00");
      fixture.detectChanges();

      input.value = "24:00";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("12:00");
    });

    it("should reject invalid text", () => {
      component.writeValue("12:00");
      fixture.detectChanges();

      input.value = "abc";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("12:00");
      expect(component.inputValue()).toBe("12:00");
    });

    it("should set value to null when input is cleared", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);
      component.writeValue("12:00");
      fixture.detectChanges();

      input.value = "";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBeNull();
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("should call onTouched on blur", () => {
      const onTouched = jest.fn();
      component.registerOnTouched(onTouched);

      input.dispatchEvent(new Event("blur"));

      expect(onTouched).toHaveBeenCalled();
    });
  });

  describe("clear button", () => {
    beforeEach(() => {
      fieldClearable.set(true);
      fixture.detectChanges();
    });

    it("should not show clear button when the form field has not opted in", () => {
      fieldClearable.set(false);
      component.writeValue("14:30");
      fixture.detectChanges();

      expect(el.querySelector(".tedi-time-field__clear")).toBeNull();
    });

    it("should not show clear button when value is null", () => {
      expect(el.querySelector(".tedi-time-field__clear")).toBeNull();
    });

    it("should show clear button when value exists", () => {
      component.writeValue("14:30");
      fixture.detectChanges();

      expect(el.querySelector(".tedi-time-field__clear")).toBeTruthy();
    });

    it("should clear value on click", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);
      component.writeValue("14:30");
      fixture.detectChanges();

      const clearBtn = el.querySelector(
        ".tedi-time-field__clear",
      ) as HTMLButtonElement;
      clearBtn.click();
      fixture.detectChanges();

      expect(component.value()).toBeNull();
      expect(component.inputValue()).toBe("");
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("should show separator alongside clear button", () => {
      component.writeValue("14:30");
      fixture.detectChanges();

      expect(el.querySelector("tedi-separator")).toBeTruthy();
    });

    it("should stop click propagation when the clear button is clicked", () => {
      component.writeValue("14:30");
      fixture.detectChanges();

      const clearBtn = el.querySelector(
        ".tedi-time-field__clear",
      ) as HTMLButtonElement;
      const event = new MouseEvent("click", { bubbles: true, cancelable: true });
      const stopSpy = jest.spyOn(event, "stopPropagation");

      clearBtn.dispatchEvent(event);
      expect(stopSpy).toHaveBeenCalled();
      expect(component.value()).toBeNull();
    });
  });

  describe("field-focus delegation", () => {
    it("should forward focus from the wrapper to the input", () => {
      // Focus delegation only applies in input-trigger mode, where the field
      // wrapper is the popover trigger (the popover refocuses it on close).
      fixture.componentRef.setInput("pickerTrigger", "input");
      fixture.detectChanges();

      const wrapper = el.querySelector(".tedi-time-field__field") as HTMLElement;
      const input = el.querySelector(".tedi-time-field__input") as HTMLInputElement;
      const focusSpy = jest.spyOn(input, "focus");

      wrapper.dispatchEvent(new FocusEvent("focus", { bubbles: false }));
      expect(focusSpy).toHaveBeenCalled();
    });

    it("should NOT forward focus when a focus event bubbles from a child", () => {
      const wrapper = el.querySelector(".tedi-time-field__field") as HTMLElement;
      const input = el.querySelector(".tedi-time-field__input") as HTMLInputElement;
      const focusSpy = jest.spyOn(input, "focus");

      // Simulate a focus event whose target is the input (bubbled up to wrapper).
      const event = new FocusEvent("focus", { bubbles: true });
      Object.defineProperty(event, "target", { value: input });
      Object.defineProperty(event, "currentTarget", { value: wrapper });
      component.onFieldFocus(event);

      expect(focusSpy).not.toHaveBeenCalled();
    });
  });

  describe("FormFieldControl", () => {
    it("should expose value signal", () => {
      component.writeValue("10:30");
      expect(component.value()).toBe("10:30");
    });

    it("should expose isDisabled as disabled signal", () => {
      expect(component.isDisabled()).toBe(false);
      component.setDisabledState(true);
      expect(component.isDisabled()).toBe(true);
    });

    it("should expose invalid signal driven by the invalid input", () => {
      expect(component.invalid()).toBe(false);
      fixture.componentRef.setInput("invalid", true);
      fixture.detectChanges();
      expect(component.invalid()).toBe(true);
    });

    it("should expose invalid signal driven by setInvalidState", () => {
      expect(component.invalid()).toBe(false);
      component.setInvalidState(true);
      expect(component.invalid()).toBe(true);
    });

    it("should provide focus method that focuses the input", () => {
      const input = el.querySelector(
        ".tedi-time-field__input",
      ) as HTMLInputElement;
      const focusSpy = jest.spyOn(input, "focus");

      component.focus();
      expect(focusSpy).toHaveBeenCalled();
    });

    it("should not focus the input when disabled", () => {
      const input = el.querySelector(
        ".tedi-time-field__input",
      ) as HTMLInputElement;
      const focusSpy = jest.spyOn(input, "focus");
      component.setDisabledState(true);
      fixture.detectChanges();

      component.focus();
      expect(focusSpy).not.toHaveBeenCalled();
    });

    it("should provide clearField method", () => {
      component.writeValue("14:30");
      fixture.detectChanges();

      component.clearField();
      expect(component.value()).toBeNull();
      expect(component.inputValue()).toBe("");
    });
  });

  describe("native picker", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("useNativePicker", true);
      fixture.detectChanges();
    });

    it("should render the visible input with type=time", () => {
      const input = el.querySelector(".tedi-time-field__input") as HTMLInputElement;
      expect(input).toBeTruthy();
      expect(input.type).toBe("time");
    });

    it("should render trigger button without popover", () => {
      expect(el.querySelector("tedi-popover")).toBeNull();
      const btn = el.querySelector(".tedi-time-field__icon") as HTMLButtonElement;
      expect(btn).toBeTruthy();
    });

    it("should sync visible input value from component value", () => {
      component.writeValue("15:00");
      fixture.detectChanges();

      const input = el.querySelector(".tedi-time-field__input") as HTMLInputElement;
      expect(input.value).toBe("15:00");
    });

    it("should commit value on blur after typing", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const input = el.querySelector(".tedi-time-field__input") as HTMLInputElement;
      input.value = "16:45";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBe("16:45");
      expect(onChange).toHaveBeenCalledWith("16:45");
    });

    it("should set value to null when input is cleared and blurred", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);
      component.writeValue("12:00");
      fixture.detectChanges();

      const input = el.querySelector(".tedi-time-field__input") as HTMLInputElement;
      input.value = "";
      input.dispatchEvent(new Event("input"));
      input.dispatchEvent(new Event("blur"));

      expect(component.value()).toBeNull();
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("should show the clear button immediately after a value is picked (no blur required)", () => {
      fieldClearable.set(true);
      fixture.detectChanges();
      expect(el.querySelector(".tedi-time-field__clear")).toBeNull();

      const input = el.querySelector(".tedi-time-field__input") as HTMLInputElement;
      input.value = "16:45";
      input.dispatchEvent(new Event("input"));
      fixture.detectChanges();

      expect(component.value()).toBe("16:45");
      expect(el.querySelector(".tedi-time-field__clear")).toBeTruthy();
    });
  });

  describe("native picker — breakpoint form", () => {
    let isBelowMd: ReturnType<typeof signal<boolean>>;
    let bpFixture: ComponentFixture<TimeFieldComponent>;
    let bpComponent: TimeFieldComponent;
    let bpEl: HTMLElement;

    beforeEach(() => {
      isBelowMd = signal(false);
      const breakpointMock = {
        isBelowBreakpoint: (target: string) =>
          target === "md" ? isBelowMd : signal(false),
        isAboveBreakpoint: () => signal(false),
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [TimeFieldComponent],
        providers: [
          { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
          { provide: BreakpointService, useValue: breakpointMock },
        ],
      });

      bpFixture = TestBed.createComponent(TimeFieldComponent);
      bpFixture.componentRef.setInput("inputId", "bp-test");
      bpFixture.componentRef.setInput("useNativePicker", "md");
      bpComponent = bpFixture.componentInstance;
      bpEl = bpFixture.nativeElement;
      bpFixture.detectChanges();
    });

    it("should use the native picker when current viewport is below the breakpoint", () => {
      isBelowMd.set(true);
      bpFixture.detectChanges();

      expect(bpComponent.useNativePickerResolved()).toBe(true);
      const input = bpEl.querySelector(".tedi-time-field__input") as HTMLInputElement;
      expect(input.type).toBe("time");
      expect(bpEl.querySelector("tedi-popover")).toBeNull();
    });

    it("should use the custom picker when current viewport is at or above the breakpoint", () => {
      isBelowMd.set(false);
      bpFixture.detectChanges();

      expect(bpComponent.useNativePickerResolved()).toBe(false);
      const input = bpEl.querySelector(".tedi-time-field__input") as HTMLInputElement;
      expect(input.type).toBe("text");
      expect(bpEl.querySelector("tedi-popover")).toBeTruthy();
    });

    it("should react to viewport changes", () => {
      isBelowMd.set(false);
      bpFixture.detectChanges();
      expect(bpComponent.useNativePickerResolved()).toBe(false);

      isBelowMd.set(true);
      bpFixture.detectChanges();
      expect(bpComponent.useNativePickerResolved()).toBe(true);
    });
  });

  describe("modal breakpoint switch", () => {
    let isBelowMd: ReturnType<typeof signal<boolean>>;
    let mFixture: ComponentFixture<TimeFieldComponent>;
    let mComponent: TimeFieldComponent;
    let mEl: HTMLElement;

    beforeEach(() => {
      isBelowMd = signal(false);
      const breakpointMock = {
        isBelowBreakpoint: (target: string) =>
          target === "md" ? isBelowMd : signal(false),
        isAboveBreakpoint: () => signal(false),
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [TimeFieldComponent],
        providers: [
          { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
          { provide: BreakpointService, useValue: breakpointMock },
        ],
      });

      mFixture = TestBed.createComponent(TimeFieldComponent);
      mFixture.componentRef.setInput("inputId", "modal-test");
      mFixture.componentRef.setInput("modal", "md");
      mComponent = mFixture.componentInstance;
      mEl = mFixture.nativeElement;
      mFixture.detectChanges();
    });

    it("should render the popover branch when above the modal breakpoint", () => {
      isBelowMd.set(false);
      mFixture.detectChanges();

      expect(mComponent.useMobileModal()).toBe(false);
      expect(mEl.querySelector("tedi-popover")).toBeTruthy();
    });

    it("should drop the popover branch when below the modal breakpoint", () => {
      isBelowMd.set(true);
      mFixture.detectChanges();

      expect(mComponent.useMobileModal()).toBe(true);
      expect(mEl.querySelector("tedi-popover")).toBeNull();
    });

    it("should not use the modal when pickerVariant=none even if below the breakpoint", () => {
      mFixture.componentRef.setInput("pickerVariant", "none");
      isBelowMd.set(true);
      mFixture.detectChanges();

      expect(mComponent.useMobileModal()).toBe(false);
    });
  });

  describe("openMobileModal lifecycle", () => {
    let modalServiceMock: { open: jest.Mock };
    let modalRefMock: { closed: { subscribe: jest.Mock } };
    let closedCallback: ((result: string | null | undefined) => void) | null;
    let mFixture: ComponentFixture<TimeFieldComponent>;
    let mComponent: TimeFieldComponent;
    let mEl: HTMLElement;

    beforeEach(() => {
      closedCallback = null;
      modalRefMock = {
        closed: {
          subscribe: jest.fn((fn) => {
            closedCallback = fn;
            return { unsubscribe: jest.fn() };
          }),
        },
      };
      modalServiceMock = {
        open: jest.fn().mockReturnValue(modalRefMock),
      };
      const breakpointMock = {
        isBelowBreakpoint: () => signal(true),
        isAboveBreakpoint: () => signal(false),
      };

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [TimeFieldComponent],
        providers: [
          { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
          { provide: BreakpointService, useValue: breakpointMock },
          { provide: ModalService, useValue: modalServiceMock },
        ],
      });

      mFixture = TestBed.createComponent(TimeFieldComponent);
      mFixture.componentRef.setInput("inputId", "modal-life");
      mFixture.componentRef.setInput("modal", true);
      mComponent = mFixture.componentInstance;
      mEl = mFixture.nativeElement;
      mFixture.detectChanges();
    });

    it("should open the modal with the current picker config", () => {
      mFixture.componentRef.setInput("timeSlots", ["09:00", "09:30"]);
      mFixture.componentRef.setInput("columns", 2);
      mFixture.componentRef.setInput("minuteStep", 5);
      mComponent.writeValue("10:15");
      mFixture.detectChanges();

      mComponent.openPicker();

      expect(modalServiceMock.open).toHaveBeenCalledTimes(1);
      const args = modalServiceMock.open.mock.calls[0];
      expect(args[1].data).toEqual(
        expect.objectContaining({
          value: "10:15",
          variant: "scroll",
          timeSlots: ["09:00", "09:30"],
          columns: 2,
          minuteStep: 5,
        }),
      );
    });

    it("should commit the result and refocus the input when the modal closes with a value", () => {
      const onChange = jest.fn();
      mComponent.registerOnChange(onChange);
      const inputEl = mEl.querySelector("input") as HTMLInputElement;
      const focusSpy = jest.spyOn(inputEl, "focus");

      mComponent.openPicker();
      expect(closedCallback).toBeTruthy();
      closedCallback!("14:00");
      mFixture.detectChanges();

      expect(mComponent.value()).toBe("14:00");
      expect(onChange).toHaveBeenCalledWith("14:00");
      expect(focusSpy).toHaveBeenCalled();
    });

    it("should NOT change value when the modal closes with undefined (cancel)", () => {
      const onChange = jest.fn();
      mComponent.registerOnChange(onChange);
      mComponent.writeValue("08:00");
      mFixture.detectChanges();

      mComponent.openPicker();
      closedCallback!(undefined);
      mFixture.detectChanges();

      expect(mComponent.value()).toBe("08:00");
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should call onTouched on close regardless of result", () => {
      const onTouched = jest.fn();
      mComponent.registerOnTouched(onTouched);

      mComponent.openPicker();
      closedCallback!(undefined);

      expect(onTouched).toHaveBeenCalled();
    });

    it("should forward the fullscreen input to the modal config", () => {
      mFixture.componentRef.setInput("fullscreen", "md");
      mFixture.detectChanges();

      mComponent.openPicker();

      const args = modalServiceMock.open.mock.calls[0];
      expect(args[1].fullscreen).toBe("md");
    });
  });

  describe("picker trigger", () => {
    it("should open popover when input is clicked with pickerTrigger=input", () => {
      fixture.componentRef.setInput("pickerTrigger", "input");
      fixture.detectChanges();

      const input = el.querySelector(".tedi-time-field__input") as HTMLInputElement;
      const popoverSpy = jest.spyOn(component.popover()!, "showPopover");

      input.click();

      expect(popoverSpy).toHaveBeenCalled();
    });

    it("should NOT open popover when input is clicked with pickerTrigger=button", () => {
      const input = el.querySelector(".tedi-time-field__input") as HTMLInputElement;
      const popoverSpy = jest.spyOn(component.popover()!, "showPopover");

      input.click();

      expect(popoverSpy).not.toHaveBeenCalled();
    });

    it("should guard the field area against opening with pickerTrigger=button", () => {
      // Button mode anchors the popover to the field but only the icon may open
      // it; the wrapper's non-interactive areas are made unclickable via the
      // `--button-trigger` class (pointer-events). Input mode opens from the
      // whole field, so the guard is absent.
      const field = el.querySelector(".tedi-time-field__field") as HTMLElement;
      expect(
        field.classList.contains("tedi-time-field__field--button-trigger"),
      ).toBe(true);

      fixture.componentRef.setInput("pickerTrigger", "input");
      fixture.detectChanges();
      const inputField = el.querySelector(
        ".tedi-time-field__field",
      ) as HTMLElement;
      expect(
        inputField.classList.contains("tedi-time-field__field--button-trigger"),
      ).toBe(false);
    });

    it("should open toward the button end in button mode and the field start in input mode", () => {
      expect(component.popoverPosition()).toBe("bottom-end");

      fixture.componentRef.setInput("pickerTrigger", "input");
      fixture.detectChanges();
      expect(component.popoverPosition()).toBe("bottom-start");
    });

    it("should mark input as readonly when pickerTrigger=input", () => {
      fixture.componentRef.setInput("pickerTrigger", "input");
      fixture.detectChanges();

      const input = el.querySelector(".tedi-time-field__input") as HTMLInputElement;
      expect(input.readOnly).toBe(true);
    });
  });

  describe("picker variant=none", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("pickerVariant", "none");
      fixture.detectChanges();
    });

    it("should render the visible input as plain text (no native picker)", () => {
      const input = el.querySelector(".tedi-time-field__input") as HTMLInputElement;
      expect(input.type).toBe("text");
    });

    it("should not render any picker affordance", () => {
      expect(el.querySelector("tedi-popover")).toBeNull();
      expect(el.querySelector(".tedi-time-field__icon")).toBeTruthy();
      expect(
        el.querySelector(".tedi-time-field__icon--static"),
      ).toBeTruthy();
    });
  });

  describe("states", () => {
    it("should disable input when disabled", () => {
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();

      expect(el.querySelector("input")?.disabled).toBe(true);
    });

    it("should disable icon button when disabled", () => {
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();

      const iconBtn = el.querySelector(
        ".tedi-time-field__icon",
      ) as HTMLButtonElement;
      expect(iconBtn.disabled).toBe(true);
    });

    it("should not render a popover trigger when disabled (cannot be opened by clicking)", () => {
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();

      expect(component.usePopover()).toBe(false);
      expect(el.querySelector("tedi-popover")).toBeNull();
    });
  });

  describe("accessibility", () => {
    it("should set aria-invalid when setInvalidState(true) is called", () => {
      component.setInvalidState(true);
      fixture.detectChanges();

      expect(el.querySelector("input")?.getAttribute("aria-invalid")).toBe(
        "true",
      );
    });

    it("should set aria-invalid when the invalid input is true", () => {
      fixture.componentRef.setInput("invalid", true);
      fixture.detectChanges();

      expect(el.querySelector("input")?.getAttribute("aria-invalid")).toBe(
        "true",
      );
    });

    it("should not set aria-invalid by default", () => {
      expect(
        el.querySelector("input")?.hasAttribute("aria-invalid"),
      ).toBe(false);
    });

    it("should have aria-label on icon button", () => {
      const iconBtn = el.querySelector(".tedi-time-field__icon");
      expect(iconBtn?.getAttribute("aria-label")).toBeTruthy();
    });

    it("should not expose button/dialog ARIA on the field wrapper (it is only a positioning anchor)", () => {
      const field = el.querySelector(".tedi-time-field__field") as HTMLElement;
      expect(field.hasAttribute("role")).toBe(false);
      expect(field.hasAttribute("aria-haspopup")).toBe(false);
      expect(field.hasAttribute("aria-expanded")).toBe(false);
      expect(field.hasAttribute("aria-controls")).toBe(false);
    });

    it("should expose the dialog trigger ARIA on the icon button", () => {
      const iconBtn = el.querySelector(".tedi-time-field__icon") as HTMLElement;
      expect(iconBtn.getAttribute("aria-haspopup")).toBe("dialog");
    });
  });

  describe("ControlValueAccessor", () => {
    it("should set value via writeValue", () => {
      component.writeValue("08:15");

      expect(component.value()).toBe("08:15");
      expect(component.inputValue()).toBe("08:15");
    });

    it("should handle null writeValue", () => {
      component.writeValue(null);

      expect(component.value()).toBeNull();
      expect(component.inputValue()).toBe("");
    });

    it("should set formDisabled via setDisabledState", () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(component.isDisabled()).toBe(true);
      expect(el.querySelector("input")?.disabled).toBe(true);
    });

    it("should preserve in-progress input when writeValue is called with the same value", () => {
      component.writeValue("10:00");
      const input = el.querySelector("input") as HTMLInputElement;
      input.value = "10:3";
      input.dispatchEvent(new Event("input"));
      expect(component.inputValue()).toBe("10:3");

      component.writeValue("10:00");

      expect(component.inputValue()).toBe("10:3");
    });
  });

  describe("icon button trigger", () => {
    it("should call onPickerOpen on icon-button click", () => {
      const spy = jest.spyOn(component, "onPickerOpen");
      const iconBtn = el.querySelector(
        ".tedi-time-field__icon",
      ) as HTMLButtonElement;
      iconBtn.click();

      expect(spy).toHaveBeenCalled();
    });
  });

  describe("onPickerValueChange", () => {
    it("should commit a new value", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      component.onPickerValueChange("13:45");

      expect(component.value()).toBe("13:45");
      expect(component.inputValue()).toBe("13:45");
      expect(onChange).toHaveBeenCalledWith("13:45");
    });

    it("should NOT call onChange when the value is unchanged", () => {
      component.writeValue("10:00");
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      component.onPickerValueChange("10:00");

      expect(onChange).not.toHaveBeenCalled();
    });

    it("should close the popover when closeOnSelect is true", () => {
      fixture.componentRef.setInput("closeOnSelect", true);
      fixture.detectChanges();

      const hideSpy = jest
        .spyOn(component.popover()!, "hidePopover")
        .mockImplementation(() => {});

      component.onPickerValueChange("09:15");

      expect(hideSpy).toHaveBeenCalled();
    });

    it("should NOT close the popover when closeOnSelect is false", () => {
      const hideSpy = jest
        .spyOn(component.popover()!, "hidePopover")
        .mockImplementation(() => {});

      component.onPickerValueChange("09:15");

      expect(hideSpy).not.toHaveBeenCalled();
    });
  });

  describe("closePopover", () => {
    it("should hide the popover and refocus the input", () => {
      const hideSpy = jest
        .spyOn(component.popover()!, "hidePopover")
        .mockImplementation(() => {});
      const input = el.querySelector("input") as HTMLInputElement;
      const focusSpy = jest.spyOn(input, "focus");

      component.closePopover();

      expect(hideSpy).toHaveBeenCalledWith(false);
      expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    });

    it("should call onTouched by default", () => {
      jest
        .spyOn(component.popover()!, "hidePopover")
        .mockImplementation(() => {});
      const onTouched = jest.fn();
      component.registerOnTouched(onTouched);

      component.closePopover();

      expect(onTouched).toHaveBeenCalled();
    });

    it("should NOT call onTouched when notifyTouched is false", () => {
      jest
        .spyOn(component.popover()!, "hidePopover")
        .mockImplementation(() => {});
      const onTouched = jest.fn();
      component.registerOnTouched(onTouched);

      component.closePopover(false);

      expect(onTouched).not.toHaveBeenCalled();
    });
  });

  describe("onPickerOpen", () => {
    it("should set dropdown min-width from the field wrapper when variant is dropdown", () => {
      fixture.componentRef.setInput("pickerVariant", "dropdown");
      fixture.componentRef.setInput("timeSlots", ["09:00", "09:30"]);
      fixture.detectChanges();

      const wrapper = component.fieldEl()!.nativeElement;
      Object.defineProperty(wrapper, "offsetWidth", {
        value: 240,
        configurable: true,
      });

      component.onPickerOpen();

      expect(component.dropdownMinWidth()).toBe(240);
    });

    it("should reset dropdown min-width for non-dropdown variants", () => {
      component.dropdownMinWidth.set(200);

      component.onPickerOpen();

      expect(component.dropdownMinWidth()).toBeNull();
    });
  });

  describe("native picker explicit", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("useNativePicker", true);
      fixture.detectChanges();
    });

    it("should call input.showPicker when available", () => {
      const input = el.querySelector("input") as HTMLInputElement;
      const showPicker = jest.fn();
      (input as unknown as { showPicker?: () => void }).showPicker = showPicker;

      component.openNativePicker();

      expect(showPicker).toHaveBeenCalled();
    });

    it("should focus the input when showPicker throws", () => {
      const input = el.querySelector("input") as HTMLInputElement;
      (input as unknown as { showPicker?: () => void }).showPicker = () => {
        throw new Error("not a user gesture");
      };
      const focusSpy = jest.spyOn(input, "focus");

      component.openNativePicker();

      expect(focusSpy).toHaveBeenCalled();
    });

    it("should focus the input when showPicker is not available", () => {
      const input = el.querySelector("input") as HTMLInputElement;
      (input as unknown as { showPicker?: () => void }).showPicker = undefined;
      const focusSpy = jest.spyOn(input, "focus");

      component.openNativePicker();

      expect(focusSpy).toHaveBeenCalled();
    });
  });
});

@Component({
  standalone: true,
  imports: [TimeFieldComponent, ReactiveFormsModule],
  template: `<tedi-time-field inputId="form-test" [formControl]="control" />`,
})
class TestHostComponent {
  control = new FormControl<string | null>(null);
}

describe("TimeFieldComponent with ReactiveFormsModule", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should sync FormControl value to component", () => {
    host.control.setValue("10:00");
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector("input");
    expect(input.value).toBe("10:00");
  });

  it("should sync component value to FormControl on blur", () => {
    const input = fixture.nativeElement.querySelector("input")!;
    input.value = "15:45";
    input.dispatchEvent(new Event("input"));
    input.dispatchEvent(new Event("blur"));
    fixture.detectChanges();

    expect(host.control.value).toBe("15:45");
  });

  it("should disable component when FormControl is disabled", () => {
    host.control.disable();
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector("input");
    expect(input.disabled).toBe(true);
  });
});

@Component({
  standalone: true,
  imports: [
    TimeFieldComponent,
    FormFieldComponent,
    LabelComponent,
    FeedbackTextComponent,
    ReactiveFormsModule,
  ],
  template: `
    <tedi-form-field>
      <label tedi-label for="composite-test">Time</label>
      <tedi-time-field inputId="composite-test" [formControl]="control" />
      <tedi-feedback-text text="Error" type="error" />
    </tedi-form-field>
  `,
})
class CompositeTestHostComponent {
  control = new FormControl<string | null>(null);
}

@Component({
  standalone: true,
  imports: [TimeFieldComponent, FormFieldComponent, LabelComponent],
  template: `
    <tedi-form-field>
      <label tedi-label for="bind-host">Time</label>
      <tedi-time-field inputId="bind-host" [invalid]="invalid" />
    </tedi-form-field>
  `,
})
class InvalidBindingHostComponent {
  invalid = false;
}

describe("TimeFieldComponent invalid input binding", () => {
  let fixture: ComponentFixture<InvalidBindingHostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InvalidBindingHostComponent],
      providers: [
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });
    fixture = TestBed.createComponent(InvalidBindingHostComponent);
    fixture.detectChanges();
  });

  it("should toggle tedi-form-field--invalid when [invalid] changes", () => {
    const ff = fixture.nativeElement.querySelector(
      "tedi-form-field",
    ) as HTMLElement;
    expect(ff.classList.contains("tedi-form-field--invalid")).toBe(false);

    fixture.componentInstance.invalid = true;
    fixture.detectChanges();
    expect(ff.classList.contains("tedi-form-field--invalid")).toBe(true);

    fixture.componentInstance.invalid = false;
    fixture.detectChanges();
    expect(ff.classList.contains("tedi-form-field--invalid")).toBe(false);
  });
});

describe("TimeFieldComponent inside FormFieldComponent", () => {
  let fixture: ComponentFixture<CompositeTestHostComponent>;
  let host: CompositeTestHostComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CompositeTestHostComponent],
      providers: [
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    fixture = TestBed.createComponent(CompositeTestHostComponent);
    host = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should render time-field inside form-field", () => {
    expect(el.querySelector("tedi-form-field")).toBeTruthy();
    expect(el.querySelector("tedi-time-field")).toBeTruthy();
    expect(el.querySelector("input")).toBeTruthy();
  });

  it("should render projected label", () => {
    const label = el.querySelector("[tedi-label]");
    expect(label).toBeTruthy();
    expect(label?.textContent?.trim()).toBe("Time");
  });

  it("should render projected feedback text", () => {
    expect(el.querySelector("tedi-feedback-text")).toBeTruthy();
  });

  it("should sync FormControl value", () => {
    host.control.setValue("09:00");
    fixture.detectChanges();

    const input = el.querySelector("input");
    expect(input?.value).toBe("09:00");
  });
});
