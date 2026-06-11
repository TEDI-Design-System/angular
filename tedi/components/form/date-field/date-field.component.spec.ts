import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { DateFieldComponent } from "./date-field.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { LabelComponent } from "../label/label.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
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
    imports: [DateFieldComponent],
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
  fixture: ComponentFixture<DateFieldComponent>;
  component: DateFieldComponent;
  el: HTMLElement;
  breakpoint: BreakpointServiceMock;
  modalService: ModalServiceStub;
} {
  const { breakpoint, modalService } = configureBaseModule();
  const fixture = TestBed.createComponent(DateFieldComponent);
  fixture.componentRef.setInput("inputId", "test-date-field");
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

describe("DateFieldComponent", () => {
  it("creates the component", () => {
    const { component } = createField();
    expect(component).toBeTruthy();
  });

  describe("input wiring", () => {
    it("assigns the inputId to the date-input", () => {
      const { el } = createField();
      const input = el.querySelector("input.tedi-date-input__input");
      expect(input?.id).toBe("test-date-field");
    });

    it("shows placeholder", () => {
      const { el } = createField({ placeholder: "dd.mm.yyyy" });
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      expect(input.placeholder).toBe("dd.mm.yyyy");
    });

    it("defaults the placeholder to the locale format hint in single mode", () => {
      const { component } = createField({ mode: "single" });
      expect(component.effectivePlaceholder()).toBe("pp.kk.aaaa");
    });

    it("does not auto-fill a format-hint placeholder in multiple mode", () => {
      const { component } = createField({ mode: "multiple" });
      expect(component.effectivePlaceholder()).toBe("");
    });

    it("renders the formatted display value for a single Date", () => {
      const { el, component, fixture } = createField({ mode: "single" });
      component.writeValue(new Date(2026, 4, 14));
      fixture.detectChanges();
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      expect(input.value).toBe("14.05.2026");
    });
  });

  describe("ControlValueAccessor", () => {
    it("sets value via writeValue", () => {
      const { component } = createField();
      const v = new Date(2026, 0, 1);
      component.writeValue(v);
      expect(component.value()).toBe(v);
    });

    it("handles null writeValue", () => {
      const { component } = createField();
      component.writeValue(null);
      expect(component.value()).toBeNull();
    });

    it("sets cvaDisabled via setDisabledState", () => {
      const { component, el, fixture } = createField();
      component.setDisabledState(true);
      fixture.detectChanges();
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      expect(input.disabled).toBe(true);
      expect(component.fieldDisabled()).toBe(true);
    });

    it("calls onChange when value is committed", () => {
      const { component } = createField();
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      // Simulate manual input parse commit
      component.handleInputChange("14.05.2026");

      expect(onChange).toHaveBeenCalledTimes(1);
      const arg = onChange.mock.calls[0][0] as Date;
      expect(arg.getFullYear()).toBe(2026);
      expect(arg.getMonth()).toBe(4);
      expect(arg.getDate()).toBe(14);
    });
  });

  describe("FormFieldControl", () => {
    it("exposes value signal", () => {
      const { component } = createField();
      component.writeValue(new Date(2026, 0, 1));
      expect(component.value()).toBeInstanceOf(Date);
    });

    it("exposes disabled signal driven by inputDisabled", () => {
      const { component, fixture } = createField();
      expect(component.disabled()).toBe(false);
      fixture.componentRef.setInput("inputDisabled", true);
      fixture.detectChanges();
      expect(component.disabled()).toBe(true);
    });

    it("setInvalidState toggles invalid signal", () => {
      const { component } = createField();
      expect(component.invalid()).toBe(false);
      component.setInvalidState(true);
      expect(component.invalid()).toBe(true);
    });

    it("clearField clears value and emits null", () => {
      const { component } = createField();
      const onChange = jest.fn();
      component.writeValue(new Date(2026, 0, 1));
      component.registerOnChange(onChange);

      component.clearField();
      expect(component.value()).toBeNull();
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });

  describe("manual input parsing", () => {
    it("parses a valid et-EE date and commits", () => {
      const { component } = createField({ mode: "single" });
      component.handleInputChange("14.05.2026");
      const v = component.value() as Date;
      expect(v).toBeInstanceOf(Date);
      expect(v.getFullYear()).toBe(2026);
      expect(v.getMonth()).toBe(4);
      expect(v.getDate()).toBe(14);
    });

    it("silently ignores an unparseable value", () => {
      const { component } = createField({ mode: "single" });
      component.writeValue(new Date(2024, 0, 1));
      component.handleInputChange("xxxxxxxx");
      const v = component.value() as Date;
      expect(v.getFullYear()).toBe(2024);
    });

    it("rejects a parsed date that matches a disabled matcher", () => {
      const matcher = { before: new Date(2030, 11, 31) };
      const { component } = createField({
        mode: "single",
        disabled: matcher,
      });
      component.handleInputChange("14.05.2026");
      expect(component.value()).toBeNull();
    });

    it("does not parse non-single modes by default", () => {
      const { component } = createField({ mode: "range" });
      component.handleInputChange("14.05.2026");
      expect(component.value()).toBeNull();
    });

    it("uses custom parseDate when provided", () => {
      const parsed = new Date(2030, 5, 15);
      const customParse = jest.fn(() => parsed);
      const { component } = createField({
        mode: "single",
        parseDate: customParse,
      });
      component.handleInputChange("anything");
      expect(customParse).toHaveBeenCalledWith("anything");
      expect(component.value()).toBe(parsed);
    });

    it("clears value when input is emptied", () => {
      const { component } = createField({ mode: "single" });
      component.writeValue(new Date(2024, 0, 1));
      component.handleInputChange("");
      expect(component.value()).toBeNull();
    });

    it("does not commit while readOnly", () => {
      const { component } = createField({ mode: "single", readOnly: true });
      component.handleInputChange("14.05.2026");
      expect(component.value()).toBeNull();
    });
  });

  describe("disabledMatchers computed", () => {
    it("combines disabled, minDate, maxDate, disablePast, disableFuture", () => {
      const min = new Date(2020, 0, 1);
      const max = new Date(2030, 11, 31);
      const single = new Date(2025, 0, 1);
      const { component } = createField({
        disabled: single,
        minDate: min,
        maxDate: max,
        disablePast: true,
        disableFuture: true,
      });
      const matchers = component.disabledMatchers();
      expect(matchers.length).toBe(5);
    });

    it("forwards minDate as a before-matcher", () => {
      const { component } = createField({
        minDate: new Date(2022, 0, 1),
      });
      const matchers = component.disabledMatchers();
      expect(matchers[0]).toEqual({ before: new Date(2022, 0, 1) });
    });

    it("forwards an array of matchers", () => {
      const arr = [new Date(2024, 0, 1), new Date(2024, 1, 1)];
      const { component } = createField({ disabled: arr });
      expect(component.disabledMatchers()).toEqual(arr);
    });
  });

  describe("native picker fallback", () => {
    it("renders type=date when useNativePicker is true in single mode", () => {
      const { el } = createField({
        useNativePicker: true,
        mode: "single",
      });
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      expect(input.type).toBe("date");
    });

    it("does NOT switch to native picker when mode is multiple", () => {
      const { el } = createField({
        useNativePicker: true,
        mode: "multiple",
      });
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      expect(input.type).toBe("text");
    });

    it("renders nativeIsoValue from value() when in native-picker mode", () => {
      const { el, component, fixture } = createField({
        useNativePicker: true,
        mode: "single",
      });
      component.writeValue(new Date(2026, 4, 14));
      fixture.detectChanges();
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      expect(input.value).toBe("2026-05-14");
    });

    it("suppresses overlay when native picker is active", () => {
      const { component } = createField({
        useNativePicker: true,
        mode: "single",
      });
      expect(component.usePopover()).toBe(false);
    });

    it("calls showPicker on icon click when supported", () => {
      const { el, component } = createField({
        useNativePicker: true,
        mode: "single",
      });
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      const showPicker = jest.fn();
      (input as unknown as { showPicker: () => void }).showPicker = showPicker;

      component.handleIconClick();
      expect(showPicker).toHaveBeenCalledTimes(1);
    });

    it("focuses the input when showPicker is not supported", () => {
      const { el, component } = createField({
        useNativePicker: true,
        mode: "single",
      });
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      delete (input as unknown as { showPicker?: () => void }).showPicker;
      const focusSpy = jest.spyOn(input, "focus");

      component.handleIconClick();
      expect(focusSpy).toHaveBeenCalled();
    });

    it("parses native ISO input on change", () => {
      const { component } = createField({
        useNativePicker: true,
        mode: "single",
      });
      component.handleInputChange("2026-05-14");
      const v = component.value() as Date;
      expect(v.getFullYear()).toBe(2026);
      expect(v.getMonth()).toBe(4);
      expect(v.getDate()).toBe(14);
    });
  });

  describe("overlay", () => {
    it("enables the overlay path when calendar is enabled", () => {
      const { component } = createField();
      expect(component.usePopover()).toBe(true);
    });

    it("opens the overlay on icon click", () => {
      const { el, component } = createField();
      const iconBtn = el.querySelector(
        ".tedi-date-input__icon",
      ) as HTMLButtonElement;
      iconBtn.click();
      expect(component.overlayOpen()).toBe(true);
    });

    it("closes the overlay on second icon click", () => {
      const { el, component } = createField();
      const iconBtn = el.querySelector(
        ".tedi-date-input__icon",
      ) as HTMLButtonElement;
      iconBtn.click();
      iconBtn.click();
      expect(component.overlayOpen()).toBe(false);
    });

    it("closes the overlay on outside click", () => {
      const { component } = createField();
      component.overlayOpen.set(true);
      const onTouched = jest.fn();
      component.registerOnTouched(onTouched);

      const outsideTarget = document.createElement("div");
      document.body.appendChild(outsideTarget);
      const event = new MouseEvent("click");
      Object.defineProperty(event, "target", { value: outsideTarget });
      component.handleOverlayOutsideClick(event);

      expect(component.overlayOpen()).toBe(false);
      expect(onTouched).toHaveBeenCalled();
      document.body.removeChild(outsideTarget);
    });

    it("ignores outside click events when the click is inside the host (origin)", () => {
      const { el, component } = createField();
      component.overlayOpen.set(true);
      const iconBtn = el.querySelector(
        ".tedi-date-input__icon",
      ) as HTMLButtonElement;
      const event = new MouseEvent("click");
      Object.defineProperty(event, "target", { value: iconBtn });
      component.handleOverlayOutsideClick(event);
      expect(component.overlayOpen()).toBe(true);
    });

    it("closes the overlay on Escape key", () => {
      const { component } = createField();
      component.overlayOpen.set(true);
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      component.handleOverlayKeydown(event);
      expect(component.overlayOpen()).toBe(false);
    });

    it("does not close on other keys", () => {
      const { component } = createField();
      component.overlayOpen.set(true);
      const event = new KeyboardEvent("keydown", { key: "Enter" });
      component.handleOverlayKeydown(event);
      expect(component.overlayOpen()).toBe(true);
    });
  });

  describe("overlay focus management", () => {
    function openOverlay(component: DateFieldComponent): void {
      component.overlayOpen.set(true);
    }

    function queryOverlay(): HTMLElement | null {
      return document.querySelector(".tedi-date-field__overlay");
    }

    it("renders the overlay as a focus-trapped dialog with a label", () => {
      const { fixture, component } = createField();
      openOverlay(component);
      fixture.detectChanges();

      const overlay = queryOverlay();
      expect(overlay).toBeTruthy();
      expect(overlay?.getAttribute("role")).toBe("dialog");
      expect(overlay?.getAttribute("aria-label")).toBe(
        "date-field.calendar-dialog",
      );
      expect(overlay?.hasAttribute("cdkTrapFocus")).toBe(true);

      component.overlayOpen.set(false);
      fixture.detectChanges();
    });

    it("pulls focus into the calendar when the overlay attaches", () => {
      const { fixture, component } = createField();
      openOverlay(component);
      fixture.detectChanges();

      const calendar = component.calendar();
      expect(calendar).toBeTruthy();
      const focusSpy = jest.spyOn(calendar!, "focusActiveCell");

      component.handleOverlayAttached();
      expect(focusSpy).toHaveBeenCalled();

      component.overlayOpen.set(false);
      fixture.detectChanges();
    });

    it("does nothing on attach when the calendar is not present", () => {
      const { component } = createField();
      expect(() => component.handleOverlayAttached()).not.toThrow();
    });

    it("moves DOM focus into the calendar when opened via the icon (real flow)", () => {
      const { fixture, el, component } = createField();
      const iconBtn = el.querySelector(
        ".tedi-date-input__icon",
      ) as HTMLButtonElement;
      iconBtn.click();
      fixture.detectChanges();

      return Promise.resolve().then(() => {
        const roving = document.querySelector<HTMLElement>(
          '.tedi-date-field__overlay .tedi-calendar-day-grid__day[tabindex="0"]',
        );
        expect(roving).toBeTruthy();
        expect(document.activeElement).toBe(roving);

        component.overlayOpen.set(false);
        fixture.detectChanges();
      });
    });
  });

  describe("closeOnSelect heuristic", () => {
    it("defaults to true for single mode", () => {
      const { component } = createField({ mode: "single" });
      expect(component.closeOnSelectEffective()).toBe(true);
    });

    it("defaults to false for multiple mode", () => {
      const { component } = createField({ mode: "multiple" });
      expect(component.closeOnSelectEffective()).toBe(false);
    });

    it("defaults to false for range mode", () => {
      const { component } = createField({ mode: "range" });
      expect(component.closeOnSelectEffective()).toBe(false);
    });

    it("respects explicit closeOnSelect=true", () => {
      const { component } = createField({
        mode: "multiple",
        closeOnSelect: true,
      });
      expect(component.closeOnSelectEffective()).toBe(true);
    });

    it("respects explicit closeOnSelect=false", () => {
      const { component } = createField({
        mode: "single",
        closeOnSelect: false,
      });
      expect(component.closeOnSelectEffective()).toBe(false);
    });
  });

  describe("modal-below-breakpoint", () => {
    it("opens a modal when below the configured breakpoint", () => {
      const { component, modalService } = createField({ modal: "md" });
      const bp = TestBed.inject(BreakpointService) as unknown as BreakpointServiceMock;
      bp.setBreakpoint("sm");

      const ref = {
        closed: { subscribe: jest.fn() },
      };
      modalService.open.mockReturnValue(ref);

      component.handleIconClick();
      expect(modalService.open).toHaveBeenCalled();
    });

    it("does NOT open a modal when above the configured breakpoint", () => {
      const { component, modalService } = createField({ modal: "md" });
      const bp = TestBed.inject(BreakpointService) as unknown as BreakpointServiceMock;
      bp.setBreakpoint("xl");
      component.handleIconClick();
      expect(modalService.open).not.toHaveBeenCalled();
    });
  });

  describe("readOnly", () => {
    it("sets readonly attribute on the underlying input", () => {
      const { el } = createField({ readOnly: true });
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      expect(input.readOnly).toBe(true);
    });

    it("does not commit on manual typing when readOnly", () => {
      const { component } = createField({ readOnly: true, mode: "single" });
      component.handleInputChange("14.05.2026");
      expect(component.value()).toBeNull();
    });

    it("still allows the icon button to be clickable (does not disable it)", () => {
      const { el } = createField({ readOnly: true });
      const iconBtn = el.querySelector(
        ".tedi-date-input__icon",
      ) as HTMLButtonElement;
      expect(iconBtn.disabled).toBe(false);
    });
  });

  describe("inputDisabled vs disabled matcher", () => {
    it("inputDisabled marks the underlying input disabled", () => {
      const { el } = createField({ inputDisabled: true });
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it("matcher disabled does NOT mark the input disabled", () => {
      const { el } = createField({
        disabled: { before: new Date(2030, 0, 1) },
      });
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      expect(input.disabled).toBe(false);
    });
  });

  describe("enableCalendar=false", () => {
    it("does not enable the overlay path when calendar is disabled", () => {
      const { component } = createField({ enableCalendar: false });
      expect(component.usePopover()).toBe(false);
    });

    it("still allows manual typing", () => {
      const { component } = createField({
        enableCalendar: false,
        mode: "single",
      });
      component.handleInputChange("14.05.2026");
      expect(component.value()).toBeInstanceOf(Date);
    });

    it("renders the icon button disabled when enableCalendar=false", () => {
      const { el } = createField({ enableCalendar: false });
      const icon = el.querySelector(
        ".tedi-date-input__icon",
      ) as HTMLButtonElement;
      expect(icon).toBeTruthy();
      expect(icon.disabled).toBe(true);
    });

    it("handleIconClick is a no-op when enableCalendar=false", () => {
      const { component } = createField({ enableCalendar: false });
      component.handleIconClick();
      expect(component.overlayOpen()).toBe(false);
    });
  });

  describe("multiple mode tags", () => {
    it("renders tags for selected dates in multiple mode", () => {
      const { el, component, fixture } = createField({ mode: "multiple" });
      component.value.set([new Date(2026, 4, 14), new Date(2026, 5, 1)]);
      fixture.detectChanges();
      const tags = el.querySelectorAll("tedi-tag");
      expect(tags.length).toBe(2);
    });

    it("removes a date when the tag is removed", () => {
      const { el, component, fixture } = createField({ mode: "multiple" });
      component.value.set([new Date(2026, 4, 14), new Date(2026, 5, 1)]);
      fixture.detectChanges();
      const removeBtn = el.querySelector(
        "tedi-tag .tedi-closing-button",
      ) as HTMLButtonElement;
      removeBtn.click();
      const v = component.value() as Date[];
      expect(v.length).toBe(1);
    });

    it("renders read-only tags (no close button) when isTagRemovable is false", () => {
      const { el, component, fixture } = createField({
        mode: "multiple",
        isTagRemovable: false,
      });
      component.value.set([new Date(2026, 4, 14), new Date(2026, 5, 1)]);
      fixture.detectChanges();
      expect(el.querySelectorAll("tedi-tag").length).toBe(2);
      expect(el.querySelector("tedi-tag .tedi-closing-button")).toBeNull();
    });

    it("forwards tagEllipsis to the rendered tags", () => {
      const { el, component, fixture } = createField({
        mode: "multiple",
        tagEllipsis: "start",
      });
      component.value.set([new Date(2026, 4, 14)]);
      fixture.detectChanges();
      const tag = el.querySelector("tedi-tag");
      expect(tag?.classList.contains("tedi-tag--ellipsis")).toBe(true);
      expect(
        tag?.querySelector(".tedi-ellipsis__content--start"),
      ).not.toBeNull();
    });
  });

  describe("openChange output", () => {
    it("emits openChange when overlay opens via icon click", () => {
      const { el, component, fixture } = createField();
      const events: boolean[] = [];
      component.openChange.subscribe((v) => events.push(v));
      const iconBtn = el.querySelector(
        ".tedi-date-input__icon",
      ) as HTMLButtonElement;
      iconBtn.click();
      fixture.detectChanges();
      expect(events).toContain(true);
    });

    it("emits openChange=false when overlay closes", () => {
      const { component, fixture } = createField();
      const events: boolean[] = [];
      component.overlayOpen.set(true);
      fixture.detectChanges();
      component.openChange.subscribe((v) => events.push(v));
      component.closeOverlay();
      fixture.detectChanges();
      expect(events).toContain(false);
    });
  });

  describe("valueChange (model output)", () => {
    it("emits when value changes via commit", () => {
      const { component } = createField({ mode: "single" });
      const events: Array<Date | Date[] | DateRange | null> = [];
      component.value.subscribe((v) => events.push(v));
      component.handleInputChange("14.05.2026");
      const last = events[events.length - 1];
      expect(last).toBeInstanceOf(Date);
    });
  });

  describe("handleCalendarSelect", () => {
    it("commits the calendar value and closes the overlay for single mode", () => {
      const { component } = createField({ mode: "single" });
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      component.overlayOpen.set(true);

      const fakeCalendar = {
        value: () => new Date(2026, 4, 14),
      };
      (component as unknown as { calendar: () => typeof fakeCalendar }).calendar =
        () => fakeCalendar;

      component.handleCalendarSelect();
      expect(component.value()).toBeInstanceOf(Date);
      expect(onChange).toHaveBeenCalled();
      expect(component.overlayOpen()).toBe(false);
    });

    it("does not close when mode is multiple", () => {
      const { component } = createField({ mode: "multiple" });
      component.overlayOpen.set(true);
      const fakeCalendar = {
        value: () => [new Date(2026, 4, 14)],
      };
      (component as unknown as { calendar: () => typeof fakeCalendar }).calendar =
        () => fakeCalendar;

      component.handleCalendarSelect();
      expect(component.overlayOpen()).toBe(true);
    });
  });

  describe("handleCurrentMonthChange", () => {
    it("updates the currentMonth signal", () => {
      const { component } = createField();
      const target = new Date(2030, 5, 1);
      component.handleCurrentMonthChange(target);
      expect(component.currentMonth().getFullYear()).toBe(2030);
      expect(component.currentMonth().getMonth()).toBe(5);
    });
  });

  describe("closeOverlay", () => {
    it("flips overlayOpen to false when invoked while open", () => {
      const { component } = createField();
      component.overlayOpen.set(true);
      component.closeOverlay();
      expect(component.overlayOpen()).toBe(false);
    });

    it("no-ops when overlayOpen is false", () => {
      const { component } = createField();
      const onTouched = jest.fn();
      component.registerOnTouched(onTouched);
      component.closeOverlay();
      expect(onTouched).not.toHaveBeenCalled();
    });
  });

  describe("initialMonth", () => {
    it("uses initialMonth to seed currentMonth when value is null", () => {
      const initial = new Date(2030, 2, 1);
      const { component } = createField({ initialMonth: initial });
      expect(component.currentMonth().getFullYear()).toBe(2030);
      expect(component.currentMonth().getMonth()).toBe(2);
    });
  });

  describe("range mode", () => {
    it("formats a range with both endpoints", () => {
      const { el, component, fixture } = createField({ mode: "range" });
      component.value.set({
        from: new Date(2026, 0, 1),
        to: new Date(2026, 0, 5),
      });
      fixture.detectChanges();
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      expect(input.value).toContain("01.01.2026");
      expect(input.value).toContain("05.01.2026");
    });

    it("formats a range with only `from`", () => {
      const { el, component, fixture } = createField({ mode: "range" });
      component.value.set({ from: new Date(2026, 0, 1) });
      fixture.detectChanges();
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      expect(input.value).toBe("01.01.2026");
    });
  });

  describe("formatDate override", () => {
    it("uses the consumer-provided formatter", () => {
      const customFormat = jest.fn(() => "CUSTOM");
      const { el, component, fixture } = createField({
        mode: "single",
        formatDate: customFormat,
      });
      component.writeValue(new Date(2026, 4, 14));
      fixture.detectChanges();
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      expect(input.value).toBe("CUSTOM");
      expect(customFormat).toHaveBeenCalled();
    });
  });

  describe("native picker invalid input", () => {
    it("ignores a malformed yyyy-MM-dd value", () => {
      const { component } = createField({
        useNativePicker: true,
        mode: "single",
      });
      component.handleInputChange("garbage");
      expect(component.value()).toBeNull();
    });

    it("ignores a non-existent date like 2026-02-30", () => {
      const { component } = createField({
        useNativePicker: true,
        mode: "single",
      });
      component.handleInputChange("2026-02-30");
      expect(component.value()).toBeNull();
    });
  });

  describe("breakpoint-aware resolution", () => {
    it("uses the xxl branch when at xxl breakpoint", () => {
      const { component } = createField({
        useNativePicker: { xs: false, xxl: true },
      });
      const bp = TestBed.inject(BreakpointService) as unknown as BreakpointServiceMock;
      bp.setBreakpoint("xxl");
      expect(component.useNativePickerResolved()).toBe(true);
    });

    it("falls back to xs when no other breakpoint matches", () => {
      const { component } = createField({
        useNativePicker: { xs: true },
      });
      const bp = TestBed.inject(BreakpointService) as unknown as BreakpointServiceMock;
      bp.setBreakpoint("xs");
      expect(component.useNativePickerResolved()).toBe(true);
    });

    it("clamps numberOfMonths to 1 below md", () => {
      const { component } = createField({ numberOfMonths: 2 });
      const bp = TestBed.inject(BreakpointService) as unknown as BreakpointServiceMock;
      bp.setBreakpoint("sm");
      expect(component.numberOfMonthsResolved()).toBe(1);
    });

    it("respects numberOfMonths above md", () => {
      const { component } = createField({ numberOfMonths: 2 });
      const bp = TestBed.inject(BreakpointService) as unknown as BreakpointServiceMock;
      bp.setBreakpoint("lg");
      expect(component.numberOfMonthsResolved()).toBe(2);
    });

    it("modal=true forces modal mode at all breakpoints", () => {
      const { component } = createField({ modal: true });
      const bp = TestBed.inject(BreakpointService) as unknown as BreakpointServiceMock;
      bp.setBreakpoint("xxl");
      expect(component.modalEnabled()).toBe(true);
    });

    it("modal=false disables modal mode at all breakpoints", () => {
      const { component } = createField({ modal: false });
      const bp = TestBed.inject(BreakpointService) as unknown as BreakpointServiceMock;
      bp.setBreakpoint("xs");
      expect(component.modalEnabled()).toBe(false);
    });

    it("defaults single-mode fields to the native picker below md", () => {
      const { component } = createField();
      const bp = TestBed.inject(BreakpointService) as unknown as BreakpointServiceMock;
      bp.setBreakpoint("sm");
      expect(component.useNativePickerEffective()).toBe(true);
    });

    it("uses the custom popover from md upward by default", () => {
      const { component } = createField();
      const bp = TestBed.inject(BreakpointService) as unknown as BreakpointServiceMock;
      bp.setBreakpoint("lg");
      expect(component.useNativePickerEffective()).toBe(false);
      expect(component.usePopover()).toBe(true);
    });

    it("lets an opted-in modal take precedence over the native default", () => {
      const { component } = createField({ modal: true });
      const bp = TestBed.inject(BreakpointService) as unknown as BreakpointServiceMock;
      bp.setBreakpoint("sm");
      expect(component.useNativePickerEffective()).toBe(false);
      expect(component.useModal()).toBe(true);
    });
  });

  describe("responsive strategy change", () => {
    it("closes an open popover when the viewport crosses into the native range", () => {
      const { component, fixture } = createField();
      const bp = TestBed.inject(BreakpointService) as unknown as BreakpointServiceMock;
      bp.setBreakpoint("lg");
      fixture.detectChanges();

      component.handleIconClick();
      expect(component.overlayOpen()).toBe(true);

      bp.setBreakpoint("sm");
      fixture.detectChanges();
      expect(component.overlayOpen()).toBe(false);
    });
  });

  describe("modal commit", () => {
    it("commits the value returned from the modal", () => {
      const { component, modalService } = createField({ modal: true });
      const subscribers: Array<(v: Date | null) => void> = [];
      modalService.open.mockReturnValue({
        closed: {
          subscribe: (fn: (v: Date | null) => void) => {
            subscribers.push(fn);
            return { unsubscribe: () => {} };
          },
        },
      });

      component.handleIconClick();
      expect(modalService.open).toHaveBeenCalled();

      // Simulate user confirms with a date
      const confirmed = new Date(2026, 4, 14);
      subscribers[0](confirmed);
      expect(component.value()).toBe(confirmed);
      expect(component.overlayOpen()).toBe(false);
    });

    it("does not commit when modal is cancelled (closed with undefined)", () => {
      const { component, modalService } = createField({ modal: true });
      const subscribers: Array<(v: Date | undefined) => void> = [];
      modalService.open.mockReturnValue({
        closed: {
          subscribe: (fn: (v: Date | undefined) => void) => {
            subscribers.push(fn);
            return { unsubscribe: () => {} };
          },
        },
      });

      component.writeValue(null);
      component.handleIconClick();
      subscribers[0](undefined);
      expect(component.value()).toBeNull();
    });
  });

  describe("input click trigger", () => {
    it("opens the overlay when calendarTrigger=input and input is clicked", () => {
      const { el, component, fixture } = createField({
        calendarTrigger: "input",
      });
      fixture.detectChanges();
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      input.click();
      expect(component.overlayOpen()).toBe(true);
    });

    it("does not open the overlay from input click when calendarTrigger=button", () => {
      const { el, component } = createField({ calendarTrigger: "button" });
      const input = el.querySelector(
        "input.tedi-date-input__input",
      ) as HTMLInputElement;
      input.click();
      expect(component.overlayOpen()).toBe(false);
    });
  });

  describe("availableDays forwarded", () => {
    it("passes availableDays through to the calendar input", () => {
      const fn = (d: Date) => d.getDate() === 1;
      const { component } = createField({ availableDays: fn });
      expect(component.availableDays()).toBe(fn);
    });
  });

  describe("clearField behavior", () => {
    it("does nothing when disabled", () => {
      const { component } = createField({ inputDisabled: true });
      component.value.set(new Date(2026, 4, 14));
      const onChange = jest.fn();
      component.registerOnChange(onChange);
      component.clearField();
      expect(component.value()).toBeInstanceOf(Date);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("does nothing when readOnly", () => {
      const { component } = createField({ readOnly: true });
      component.value.set(new Date(2026, 4, 14));
      const onChange = jest.fn();
      component.registerOnChange(onChange);
      component.clearField();
      expect(component.value()).toBeInstanceOf(Date);
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("native picker parse rejection", () => {
    it("rejects when parts.length !== 3 (no dashes)", () => {
      const { component } = createField({
        useNativePicker: true,
        mode: "single",
      });
      component.handleInputChange("nodashvalue");
      expect(component.value()).toBeNull();
    });

    it("rejects non-numeric ISO parts", () => {
      const { component } = createField({
        useNativePicker: true,
        mode: "single",
      });
      component.handleInputChange("abcd-ef-gh");
      expect(component.value()).toBeNull();
    });
  });

  describe("multiple mode display", () => {
    it("default format joins multiple dates with a comma — used for parser/format calls", () => {
      // Force the defaultFormat array branch by calling the formatter on a non-multiple
      // array value (range-mode parser returns a Date[] for example).
      const customParse = () => [new Date(2026, 0, 1), new Date(2026, 0, 2)];
      const { component } = createField({
        mode: "range",
        parseDate: customParse,
      });
      component.handleInputChange("anything");
      // value should be the array
      expect(component.value()).toEqual([
        new Date(2026, 0, 1),
        new Date(2026, 0, 2),
      ]);
    });
  });

  describe("breakpoint resolver — lower-tier branches", () => {
    function makeFieldAt(breakpoint: string, inputs: Record<string, unknown>) {
      const r = createField(inputs);
      const bp = TestBed.inject(BreakpointService) as unknown as BreakpointServiceMock;
      bp.setBreakpoint(breakpoint);
      return r;
    }

    it("uses xl branch at xl breakpoint", () => {
      const { component } = makeFieldAt("xl", {
        useNativePicker: { xs: false, xl: true },
      });
      expect(component.useNativePickerResolved()).toBe(true);
    });

    it("uses lg branch at lg breakpoint", () => {
      const { component } = makeFieldAt("lg", {
        useNativePicker: { xs: false, lg: true },
      });
      expect(component.useNativePickerResolved()).toBe(true);
    });

    it("uses md branch at md breakpoint", () => {
      const { component } = makeFieldAt("md", {
        useNativePicker: { xs: false, md: true },
      });
      expect(component.useNativePickerResolved()).toBe(true);
    });

    it("uses sm branch at sm breakpoint", () => {
      const { component } = makeFieldAt("sm", {
        useNativePicker: { xs: false, sm: true },
      });
      expect(component.useNativePickerResolved()).toBe(true);
    });
  });

  describe("parsedValueIsDisabled with range matchers", () => {
    it("rejects a range whose `from` falls in the disabled set", () => {
      const customParse = () => ({
        from: new Date(2026, 4, 14),
        to: new Date(2026, 4, 20),
      });
      const matcher = new Date(2026, 4, 14);
      const { component } = createField({
        mode: "range",
        disabled: matcher,
        parseDate: customParse,
      });
      component.handleInputChange("anything");
      expect(component.value()).toBeNull();
    });

    it("accepts a range without disabled overlap", () => {
      const customParse = () => ({
        from: new Date(2026, 4, 14),
        to: new Date(2026, 4, 20),
      });
      const { component } = createField({
        mode: "range",
        parseDate: customParse,
      });
      component.handleInputChange("anything");
      expect(component.value()).toEqual({
        from: new Date(2026, 4, 14),
        to: new Date(2026, 4, 20),
      });
    });

    it("rejects a range whose `to` falls in the disabled set", () => {
      const customParse = () => ({
        from: new Date(2026, 4, 14),
        to: new Date(2026, 4, 20),
      });
      const matcher = new Date(2026, 4, 20);
      const { component } = createField({
        mode: "range",
        disabled: matcher,
        parseDate: customParse,
      });
      component.handleInputChange("anything");
      expect(component.value()).toBeNull();
    });

    it("rejects an array value with any disabled date", () => {
      const customParse = () => [new Date(2026, 4, 14)];
      const matcher = new Date(2026, 4, 14);
      const { component } = createField({
        mode: "multiple",
        disabled: matcher,
        parseDate: customParse,
      });
      component.handleInputChange("anything");
      expect(component.value()).toBeNull();
    });
  });
});

@Component({
  standalone: true,
  imports: [DateFieldComponent, ReactiveFormsModule],
  template: `<tedi-date-field inputId="rf-test" [formControl]="control" [useNativePicker]="false" />`,
})
class ReactiveHostComponent {
  control = new FormControl<Date | Date[] | DateRange | null>(null);
}

describe("DateFieldComponent with ReactiveFormsModule", () => {
  let fixture: ComponentFixture<ReactiveHostComponent>;
  let host: ReactiveHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });
    fixture = TestBed.createComponent(ReactiveHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("syncs FormControl value to the input display", () => {
    host.control.setValue(new Date(2026, 4, 14));
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      "input.tedi-date-input__input",
    ) as HTMLInputElement;
    expect(input.value).toBe("14.05.2026");
  });

  it("disables the input when FormControl is disabled", () => {
    host.control.disable();
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector(
      "input.tedi-date-input__input",
    ) as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it("syncs the parsed value back to the FormControl on input change", () => {
    const fieldDebug = fixture.debugElement.query(By.directive(DateFieldComponent));
    const fieldInstance = fieldDebug.componentInstance as DateFieldComponent;
    fieldInstance.handleInputChange("14.05.2026");
    fixture.detectChanges();
    expect(host.control.value).toBeInstanceOf(Date);
  });
});

@Component({
  standalone: true,
  imports: [
    DateFieldComponent,
    FormFieldComponent,
    LabelComponent,
    FeedbackTextComponent,
    ReactiveFormsModule,
  ],
  template: `
    <tedi-form-field>
      <label tedi-label for="composite-date">Date</label>
      <tedi-date-field inputId="composite-date" [formControl]="control" />
      <tedi-feedback-text text="Error" type="error" />
    </tedi-form-field>
  `,
})
class CompositeHostComponent {
  control = new FormControl<Date | Date[] | DateRange | null>(null);
}

describe("DateFieldComponent inside FormFieldComponent", () => {
  let fixture: ComponentFixture<CompositeHostComponent>;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CompositeHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });
    fixture = TestBed.createComponent(CompositeHostComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("renders date-field inside form-field", () => {
    expect(el.querySelector("tedi-form-field")).toBeTruthy();
    expect(el.querySelector("tedi-date-field")).toBeTruthy();
    expect(el.querySelector("input.tedi-date-input__input")).toBeTruthy();
  });

  it("renders projected label", () => {
    const label = el.querySelector("[tedi-label]");
    expect(label).toBeTruthy();
  });

  it("renders feedback text", () => {
    expect(el.querySelector("tedi-feedback-text")).toBeTruthy();
  });
});

// TODO: footer-projection cannot be asserted in jsdom; see date-field.stories.ts WithFooter

