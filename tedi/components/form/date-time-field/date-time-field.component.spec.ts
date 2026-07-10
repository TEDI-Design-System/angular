import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import {
  DateTimeFieldComponent,
  DateTimeFieldValue,
} from "./date-time-field.component";
import { DateRange } from "../../content/calendar/types";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { BreakpointService } from "../../../services/breakpoint/breakpoint.service";
import { ModalService } from "../../overlay/modal/modal.service";

class TranslationMock {
  translate(key: string): string {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

class BreakpointServiceMock {
  private current = signal<string>("lg");

  setBreakpoint(bp: string): void {
    this.current.set(bp);
  }

  currentBreakpoint() {
    return this.current;
  }

  isBelowBreakpoint(bp: string | (() => string)) {
    return () => {
      const target = typeof bp === "function" ? bp() : bp;
      const order = ["xs", "sm", "md", "lg", "xl", "xxl"];
      const ci = order.indexOf(this.current());
      const ti = order.indexOf(target);
      return ci !== -1 && ti !== -1 && ci < ti;
    };
  }

  isAboveBreakpoint(bp: string | (() => string)) {
    return () => {
      const target = typeof bp === "function" ? bp() : bp;
      const order = ["xs", "sm", "md", "lg", "xl", "xxl"];
      const ci = order.indexOf(this.current());
      const ti = order.indexOf(target);
      return ci !== -1 && ti !== -1 && ci >= ti;
    };
  }
}

class ModalServiceStub {
  open = jest.fn();
  closeAll = jest.fn();
}

function configureBaseModule(
  breakpoint: BreakpointServiceMock = new BreakpointServiceMock(),
  modalService: ModalServiceStub = new ModalServiceStub(),
): { breakpoint: BreakpointServiceMock; modalService: ModalServiceStub } {
  TestBed.configureTestingModule({
    imports: [DateTimeFieldComponent],
    providers: [
      { provide: TediTranslationService, useClass: TranslationMock },
      { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      { provide: BreakpointService, useValue: breakpoint },
      { provide: ModalService, useValue: modalService },
    ],
  });
  return { breakpoint, modalService };
}

function createField(inputs: Record<string, unknown> = {}): {
  fixture: ComponentFixture<DateTimeFieldComponent>;
  component: DateTimeFieldComponent;
  el: HTMLElement;
  breakpoint: BreakpointServiceMock;
  modalService: ModalServiceStub;
} {
  const { breakpoint, modalService } = configureBaseModule();
  const fixture = TestBed.createComponent(DateTimeFieldComponent);
  fixture.componentRef.setInput("inputId", "test-dtf");
  for (const [k, v] of Object.entries(inputs)) {
    fixture.componentRef.setInput(k, v);
  }
  fixture.detectChanges();
  return {
    fixture,
    component: fixture.componentInstance,
    el: fixture.nativeElement,
    breakpoint,
    modalService,
  };
}

const pad2 = (n: number): string => String(n).padStart(2, "0");

/** Replace the calendar viewChild with a stub returning `value`. */
function stubCalendar(
  component: DateTimeFieldComponent,
  value: DateTimeFieldValue,
): void {
  (component as unknown as { calendar: () => unknown }).calendar = () => ({
    value: () => value,
    focusActiveCell: () => {},
  });
}

describe("DateTimeFieldComponent", () => {
  it("creates the component", () => {
    const { component } = createField();
    expect(component).toBeTruthy();
  });

  describe("input + display", () => {
    it("assigns the inputId to the date-input", () => {
      const { el } = createField();
      const input = el.querySelector("input.tedi-date-input__input");
      expect(input?.id).toBe("test-dtf");
    });

    it("derives a date + time placeholder for et", () => {
      const { component } = createField();
      expect(component.effectivePlaceholder()).toMatch(/tt:mm$/);
    });

    it("formats a single date+time value", () => {
      const { component } = createField({ value: new Date(2025, 8, 1, 11, 30) });
      expect(component.displayValue()).toContain("11:30");
    });

    it("formats a range value with both ends", () => {
      const { component } = createField({
        mode: "range",
        value: {
          from: new Date(2025, 8, 1, 9, 0),
          to: new Date(2025, 8, 3, 17, 0),
        } as DateRange,
      });
      const display = component.displayValue();
      expect(display).toContain("09:00");
      expect(display).toContain("17:00");
      expect(display).toContain("–");
    });
  });

  describe("opening the picker", () => {
    it("opens the popover on icon click", () => {
      const { component, el, fixture } = createField();
      el
        .querySelector<HTMLButtonElement>(".tedi-date-input__icon")!
        .click();
      fixture.detectChanges();
      expect(component.overlayOpen()).toBe(true);
    });

    it("emits openChange when the picker opens", () => {
      const { component, fixture } = createField();
      const spy = jest.fn();
      component.openChange.subscribe(spy);
      component.handleIconClick();
      fixture.detectChanges();
      expect(spy).toHaveBeenCalledWith(true);
    });

    it("resets the multi-step to the date step when closed", () => {
      const { component } = createField({ layout: "multi-step" });
      component.handleIconClick();
      component.goToTimeStep();
      expect(component.step()).toBe("time");
      component.closeOverlay();
      expect(component.step()).toBe("date");
    });
  });

  describe("selection", () => {
    it("combines the picked date with the existing time", () => {
      const { component } = createField({ value: new Date(2025, 8, 1, 14, 45) });
      stubCalendar(component, new Date(2025, 8, 10));
      component.handleCalendarSelect();
      const v = component.value() as Date;
      expect(v.getDate()).toBe(10);
      expect(v.getHours()).toBe(14);
      expect(v.getMinutes()).toBe(45);
    });

    it("combines the picked time with the selected date", () => {
      const { component } = createField({ value: new Date(2025, 8, 1, 0, 0) });
      component.handleTimeSelect("09:30");
      const v = component.value() as Date;
      expect(v.getHours()).toBe(9);
      expect(v.getMinutes()).toBe(30);
      expect(v.getDate()).toBe(1);
    });

    it("parses a typed date + time string", () => {
      const { component } = createField();
      component.handleInputChange("01.09.2025 11:30");
      const v = component.value() as Date;
      expect(v.getFullYear()).toBe(2025);
      expect(v.getMonth()).toBe(8);
      expect(v.getDate()).toBe(1);
      expect(v.getHours()).toBe(11);
      expect(v.getMinutes()).toBe(30);
    });

    it("ignores a typed date that fails the disable matchers", () => {
      const { component } = createField({
        value: new Date(2025, 8, 1, 10, 0),
        minDate: new Date(2025, 8, 5),
      });
      component.handleInputChange("01.09.2025 11:30");
      expect((component.value() as Date).getDate()).toBe(1);
      expect((component.value() as Date).getHours()).toBe(10);
    });

    it("clears the value", () => {
      const { component } = createField({ value: new Date(2025, 8, 1, 10, 0) });
      component.handleClear();
      expect(component.value()).toBeNull();
    });
  });

  describe("range", () => {
    it("forces the side-by-side layout", () => {
      const { component } = createField({ mode: "range", layout: "multi-step" });
      expect(component.effectiveLayout()).toBe("side-by-side");
    });

    it("combines the from time into the range", () => {
      const { component } = createField({
        mode: "range",
        value: { from: new Date(2025, 8, 1, 0, 0) } as DateRange,
      });
      component.handleRangeTimeSelect("from", "08:15");
      const v = component.value() as DateRange;
      expect(v.from.getHours()).toBe(8);
      expect(v.from.getMinutes()).toBe(15);
    });

    it("combines the to time into the range", () => {
      const { component } = createField({
        mode: "range",
        value: { from: new Date(2025, 8, 1, 9, 0) } as DateRange,
      });
      component.handleRangeTimeSelect("to", "18:30");
      const v = component.value() as DateRange;
      expect(v.to?.getHours()).toBe(18);
      expect(v.from.getHours()).toBe(9);
    });

    it("resolves two months on a wide breakpoint", () => {
      const { component } = createField({ mode: "range" });
      expect(component.numberOfMonthsResolved()).toBe(2);
    });

    it("combines both ends from a calendar range select", () => {
      const { component } = createField({
        mode: "range",
        value: {
          from: new Date(2025, 8, 1, 9, 0),
          to: new Date(2025, 8, 3, 17, 0),
        } as DateRange,
      });
      stubCalendar(component, {
        from: new Date(2025, 8, 10),
        to: new Date(2025, 8, 12),
      } as DateRange);
      component.handleCalendarSelect();
      const v = component.value() as DateRange;
      expect(v.from.getDate()).toBe(10);
      expect(v.from.getHours()).toBe(9);
      expect(v.to?.getDate()).toBe(12);
      expect(v.to?.getHours()).toBe(17);
    });

    it("clears the value when the calendar range is empty", () => {
      const { component } = createField({
        mode: "range",
        value: { from: new Date(2025, 8, 1, 9, 0) } as DateRange,
      });
      stubCalendar(component, {} as DateRange);
      component.handleCalendarSelect();
      expect(component.value()).toBeNull();
    });
  });

  describe("available times", () => {
    it("uses the slots variant when availableTimes is set", () => {
      const { component } = createField({
        value: new Date(2025, 8, 1, 10, 0),
        availableTimes: ["09:30", "10:00"],
      });
      expect(component.singleAvailableTimes()).toEqual(["09:30", "10:00"]);
    });

    it("defaults to the radio grid variant in multi-step", () => {
      const { component } = createField({
        layout: "multi-step",
        availableTimes: ["09:30"],
      });
      expect(component.resolvedGridVariant()).toBe("radio");
    });

    it("snaps the time to the first slot when the existing time is unavailable", () => {
      const { component } = createField({
        value: new Date(2025, 8, 1, 14, 45),
        availableTimes: ["09:30", "10:00"],
      });
      stubCalendar(component, new Date(2025, 8, 2));
      component.handleCalendarSelect();
      const v = component.value() as Date;
      expect(`${v.getHours()}:${v.getMinutes()}`).toBe("9:30");
    });
  });

  describe("native picker", () => {
    it("renders a datetime-local input and ISO value", () => {
      const { component, el } = createField({
        useNativePicker: true,
        value: new Date(2025, 8, 1, 11, 30),
      });
      expect(component.useNativePickerEffective()).toBe(true);
      const input = el.querySelector<HTMLInputElement>(
        "input.tedi-date-input__input",
      )!;
      expect(input.type).toBe("datetime-local");
      expect(component.nativeIsoValue()).toBe("2025-09-01T11:30");
    });

    it("parses a native datetime-local string", () => {
      const { component } = createField({ useNativePicker: true });
      component.handleInputChange("2025-09-01T11:30");
      const v = component.value() as Date;
      expect(v.getHours()).toBe(11);
      expect(v.getMinutes()).toBe(30);
    });

    it("never uses the native picker in range mode", () => {
      const { component } = createField({ useNativePicker: true, mode: "range" });
      expect(component.useNativePickerEffective()).toBe(false);
    });
  });

  describe("modal", () => {
    it("opens a modal when modal is enabled", () => {
      const { component, modalService } = createField({ modal: true });
      modalService.open.mockReturnValue({ closed: { subscribe: jest.fn() } });
      component.handleIconClick();
      expect(modalService.open).toHaveBeenCalled();
    });
  });

  describe("placeholder + layout resolution", () => {
    it("uses an explicit placeholder verbatim", () => {
      const { component } = createField({ placeholder: "custom" });
      expect(component.effectivePlaceholder()).toBe("custom");
    });

    it("has no placeholder for the native picker", () => {
      const { component } = createField({ useNativePicker: true });
      expect(component.effectivePlaceholder()).toBe("");
    });

    it("has no placeholder in range mode", () => {
      const { component } = createField({ mode: "range" });
      expect(component.effectivePlaceholder()).toBe("");
    });

    it("uses an hh:mm hint for non-et locales", () => {
      const { component } = createField({ localeCode: "en-GB" });
      expect(component.effectivePlaceholder()).toMatch(/hh:mm$/);
    });

    it("uses the popover when neither modal nor native applies", () => {
      const { component } = createField();
      expect(component.usePopover()).toBe(true);
      expect(component.useModal()).toBe(false);
    });
  });

  describe("time selection details", () => {
    it("closes the overlay after a slot pick in multi-step", () => {
      const { component } = createField({
        layout: "multi-step",
        availableTimes: ["09:30", "10:00"],
        value: new Date(2025, 8, 1, 0, 0),
      });
      component.handleIconClick();
      component.goToTimeStep();
      component.handleTimeSelect("09:30");
      expect(component.overlayOpen()).toBe(false);
    });

    it("creates a value from today when no date is selected yet", () => {
      const { component } = createField();
      component.handleTimeSelect("08:15");
      const v = component.value() as Date;
      expect(v.getHours()).toBe(8);
      expect(v.getMinutes()).toBe(15);
    });

    it("keeps the existing time when it is still an available slot", () => {
      const { component } = createField({
        value: new Date(2025, 8, 1, 10, 0),
        availableTimes: ["09:30", "10:00"],
      });
      stubCalendar(component, new Date(2025, 8, 2));
      component.handleCalendarSelect();
      const v = component.value() as Date;
      expect(`${v.getHours()}:${pad2(v.getMinutes())}`).toBe("10:00");
    });

    it("seeds a 'to' time even without a from", () => {
      const { component } = createField({ mode: "range" });
      component.handleRangeTimeSelect("to", "12:00");
      const v = component.value() as DateRange;
      expect(v.from.getHours()).toBe(12);
      expect(v.to?.getHours()).toBe(12);
    });
  });

  describe("overlay dismissal", () => {
    it("closes on Escape", () => {
      const { component } = createField();
      component.handleIconClick();
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      jest.spyOn(event, "preventDefault");
      component.handleOverlayKeydown(event);
      expect(component.overlayOpen()).toBe(false);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it("closes on an outside click but not an inside one", () => {
      const { component, el } = createField();
      component.handleIconClick();
      const inside = new MouseEvent("click");
      Object.defineProperty(inside, "target", { value: el.querySelector("input") });
      component.handleOverlayOutsideClick(inside);
      expect(component.overlayOpen()).toBe(true);

      const outside = new MouseEvent("click");
      Object.defineProperty(outside, "target", { value: document.body });
      component.handleOverlayOutsideClick(outside);
      expect(component.overlayOpen()).toBe(false);
    });
  });

  describe("typed + native edge cases", () => {
    it("commits null on empty input", () => {
      const { component } = createField({ value: new Date(2025, 8, 1, 10, 0) });
      component.handleInputChange("");
      expect(component.value()).toBeNull();
    });

    it("parses a date-only string and keeps the existing time", () => {
      const { component } = createField({ value: new Date(2025, 8, 1, 14, 30) });
      component.handleInputChange("05.09.2025");
      const v = component.value() as Date;
      expect(v.getDate()).toBe(5);
      expect(v.getHours()).toBe(14);
      expect(v.getMinutes()).toBe(30);
    });

    it("ignores an unparseable string", () => {
      const { component } = createField({ value: new Date(2025, 8, 1, 10, 0) });
      component.handleInputChange("not a date");
      expect((component.value() as Date).getDate()).toBe(1);
    });

    it("ignores an out-of-range typed time", () => {
      const { component } = createField({ value: new Date(2025, 8, 1, 10, 0) });
      component.handleInputChange("01.09.2025 25:99");
      expect((component.value() as Date).getHours()).toBe(10);
    });

    it("ignores typed input while read-only", () => {
      const { component } = createField({ readOnly: true });
      component.handleInputChange("01.09.2025 11:30");
      expect(component.value()).toBeNull();
    });

    it("clears the native value on empty input", () => {
      const { component } = createField({
        useNativePicker: true,
        value: new Date(2025, 8, 1, 10, 0),
      });
      component.handleInputChange("");
      expect(component.value()).toBeNull();
    });

    it("ignores an invalid native datetime string", () => {
      const { component } = createField({ useNativePicker: true });
      component.handleInputChange("2025-13-40T99:99");
      expect(component.value()).toBeNull();
    });

    it("does not clear when the field is disabled", () => {
      const { component } = createField({
        value: new Date(2025, 8, 1, 10, 0),
        inputDisabled: true,
      });
      component.handleClear();
      expect(component.value()).not.toBeNull();
    });
  });

  describe("display edge cases", () => {
    it("formats a range with only a from value", () => {
      const { component } = createField({
        mode: "range",
        value: { from: new Date(2025, 8, 1, 9, 0) } as DateRange,
      });
      const display = component.displayValue();
      expect(display).toContain("09:00");
      expect(display).not.toContain("–");
    });

    it("returns an empty display for a null value", () => {
      const { component } = createField();
      expect(component.displayValue()).toBe("");
    });

    it("uses a custom formatDate when provided", () => {
      const { component } = createField({
        value: new Date(2025, 8, 1, 10, 0),
        formatDate: () => "CUSTOM",
      });
      expect(component.displayValue()).toBe("CUSTOM");
    });
  });

  describe("modal lifecycle", () => {
    it("commits the value returned when the modal closes", () => {
      const { component, modalService } = createField({ modal: true });
      let closedCb: ((v: DateTimeFieldValue) => void) | undefined;
      modalService.open.mockReturnValue({
        closed: { subscribe: (cb: (v: DateTimeFieldValue) => void) => (closedCb = cb) },
      });
      component.handleIconClick();
      const result = new Date(2025, 8, 1, 12, 0);
      closedCb!(result);
      expect(component.value()).toBe(result);
      expect(component.overlayOpen()).toBe(false);
    });

    it("keeps the value when the modal is dismissed", () => {
      const existing = new Date(2025, 8, 1, 10, 0);
      const { component, modalService } = createField({ modal: true, value: existing });
      let closedCb: ((v: DateTimeFieldValue) => void) | undefined;
      modalService.open.mockReturnValue({
        closed: { subscribe: (cb: (v: DateTimeFieldValue) => void) => (closedCb = cb) },
      });
      component.handleIconClick();
      closedCb!(undefined as unknown as DateTimeFieldValue);
      expect(component.value()).toBe(existing);
    });
  });

  describe("breakpoint resolution", () => {
    it("resolves the native picker per breakpoint", () => {
      const { component, breakpoint } = createField({ useNativePicker: "md" });
      expect(component.useNativePickerEffective()).toBe(false);
      breakpoint.setBreakpoint("xs");
      expect(component.useNativePickerEffective()).toBe(true);
    });

    it("resolves the modal per breakpoint", () => {
      const { component, breakpoint } = createField({ modal: "md" });
      expect(component.useModal()).toBe(false);
      breakpoint.setBreakpoint("sm");
      expect(component.useModal()).toBe(true);
    });

    it("narrows the range to one month on small screens", () => {
      const { component, breakpoint } = createField({ mode: "range" });
      expect(component.numberOfMonthsResolved()).toBe(2);
      breakpoint.setBreakpoint("xs");
      expect(component.numberOfMonthsResolved()).toBe(1);
    });

    it("resolves the highest matching breakpoint tier", () => {
      const { component, fixture, breakpoint } = createField({ mode: "range" });
      fixture.componentRef.setInput("numberOfMonths", {
        xs: 1,
        sm: 1,
        md: 2,
        lg: 2,
        xl: 3,
        xxl: 4,
      });
      breakpoint.setBreakpoint("xxl");
      fixture.detectChanges();
      expect(component.numberOfMonthsResolved()).toBe(4);
      breakpoint.setBreakpoint("xl");
      expect(component.numberOfMonthsResolved()).toBe(3);
      breakpoint.setBreakpoint("sm");
      expect(component.numberOfMonthsResolved()).toBe(1);
    });

    it("focuses the input when the native picker has no showPicker", () => {
      const { component, el } = createField({ useNativePicker: true });
      const input = el.querySelector<HTMLInputElement>(
        "input.tedi-date-input__input",
      )!;
      const focusSpy = jest.spyOn(input, "focus");
      component.handleIconClick();
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe("ControlValueAccessor + FormFieldControl", () => {
    it("writes a value via writeValue", () => {
      const { component } = createField();
      const date = new Date(2025, 8, 1, 10, 0);
      component.writeValue(date);
      expect(component.value()).toBe(date);
    });

    it("calls onChange when a value commits", () => {
      const { component } = createField();
      const onChange = jest.fn();
      component.registerOnChange(onChange);
      component.handleTimeSelect("10:00");
      expect(onChange).toHaveBeenCalled();
    });

    it("reflects the disabled state", () => {
      const { component } = createField();
      component.setDisabledState(true);
      expect(component.disabled()).toBe(true);
    });

    it("reflects the invalid state", () => {
      const { component } = createField();
      component.setInvalidState(true);
      expect(component.invalid()).toBe(true);
    });

    it("integrates with a reactive FormControl", () => {
      TestBed.resetTestingModule();
      configureBaseModule();

      @Component({
        standalone: true,
        imports: [DateTimeFieldComponent, ReactiveFormsModule],
        template: `<tedi-date-time-field
          inputId="dtf"
          [formControl]="control"
        />`,
      })
      class HostComponent {
        control = new FormControl<DateTimeFieldValue>(null);
      }

      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const field = fixture.debugElement.query(
        By.directive(DateTimeFieldComponent),
      ).componentInstance as DateTimeFieldComponent;

      const date = new Date(2025, 8, 1, 12, 0);
      fixture.componentInstance.control.setValue(date);
      fixture.detectChanges();
      expect(field.value()).toBe(date);

      field.handleTimeSelect("09:00");
      expect(
        (fixture.componentInstance.control.value as Date).getHours(),
      ).toBe(9);
    });
  });

  describe("native time input on narrow screens", () => {
    it("resolves to a native input below md and the wheel from md up", () => {
      const { component, breakpoint, fixture } = createField();
      expect(component.useNativeTimeInput()).toBe(false);
      breakpoint.setBreakpoint("sm");
      fixture.detectChanges();
      expect(component.useNativeTimeInput()).toBe(true);
    });

    it("renders a native time-field in the popover below md", () => {
      const { component, breakpoint, fixture } = createField();
      breakpoint.setBreakpoint("sm");
      component.handleIconClick();
      fixture.detectChanges();
      expect(document.querySelector("tedi-time-field")).toBeTruthy();
      expect(document.querySelector(".tedi-time-picker--scroll")).toBeNull();
      component.closeOverlay();
      fixture.detectChanges();
    });

    it("renders the scroll wheel in the popover from md up", () => {
      const { component, fixture } = createField();
      component.handleIconClick();
      fixture.detectChanges();
      expect(document.querySelector("tedi-time-field")).toBeNull();
      expect(document.querySelector("tedi-time-picker")).toBeTruthy();
      component.closeOverlay();
      fixture.detectChanges();
    });

    it("keeps the slot grid (not a native input) when availableTimes is set", () => {
      const { component, breakpoint, fixture } = createField({
        availableTimes: ["09:00", "10:00"],
      });
      breakpoint.setBreakpoint("sm");
      component.handleIconClick();
      fixture.detectChanges();
      expect(document.querySelector("tedi-time-field")).toBeNull();
      expect(document.querySelector(".tedi-time-picker--slots")).toBeTruthy();
      component.closeOverlay();
      fixture.detectChanges();
    });
  });

  describe("range time headings", () => {
    it("labels the two ends with distinct start/end headings", () => {
      const { component, fixture } = createField({ mode: "range" });
      component.handleIconClick();
      fixture.detectChanges();
      const headings = Array.from(
        document.querySelectorAll(".tedi-date-time-field__split-heading"),
      ).map((h) => h.textContent?.trim());
      expect(headings).toContain("date-time-field.time-heading-from");
      expect(headings).toContain("date-time-field.time-heading-to");
      component.closeOverlay();
      fixture.detectChanges();
    });

    it("uses native time inputs (not scroll wheels) for both ends even on desktop", () => {
      const { component, fixture } = createField({ mode: "range" });
      expect(component.useNativeTimeInput()).toBe(false);
      component.handleIconClick();
      fixture.detectChanges();
      expect(document.querySelectorAll("tedi-time-field").length).toBe(2);
      expect(document.querySelector(".tedi-time-picker--scroll")).toBeNull();
      component.closeOverlay();
      fixture.detectChanges();
    });

    it("keeps the slot grid for both ends when availableTimes is set", () => {
      const { component, fixture } = createField({
        mode: "range",
        availableTimes: ["09:00", "10:00"],
      });
      component.handleIconClick();
      fixture.detectChanges();
      expect(document.querySelector("tedi-time-field")).toBeNull();
      expect(
        document.querySelectorAll(".tedi-time-picker--slots").length,
      ).toBe(2);
      component.closeOverlay();
      fixture.detectChanges();
    });

    it("shows each end's selected date under its heading", () => {
      const { component, fixture } = createField({
        mode: "range",
        value: {
          from: new Date(2025, 8, 1, 9, 0),
          to: new Date(2025, 8, 5, 17, 0),
        },
      });
      component.handleIconClick();
      fixture.detectChanges();
      const dates = Array.from(
        document.querySelectorAll(".tedi-date-time-field__range-date"),
      ).map((d) => d.textContent?.trim());
      expect(dates.length).toBe(2);
      expect(dates.every((d) => !!d)).toBe(true);
      component.closeOverlay();
      fixture.detectChanges();
    });
  });
});
