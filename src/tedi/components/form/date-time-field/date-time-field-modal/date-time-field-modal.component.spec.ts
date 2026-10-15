import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  DateTimeFieldModalComponent,
  DateTimeFieldModalData,
} from "./date-time-field-modal.component";
import { ModalRef } from "../../../overlay/modal/modal-ref";
import { MODAL_DATA } from "../../../overlay/modal/modal.types";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";
import { DateRange } from "../../../content/calendar/types";

class TranslationMock {
  translate(key: string): string {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

function makeData(
  overrides: Partial<DateTimeFieldModalData> = {},
): DateTimeFieldModalData {
  return {
    value: null,
    currentMonth: new Date(2026, 4, 1),
    mode: "single",
    selectionLevel: "days",
    localeCode: "et-EE",
    showOutsideDays: true,
    showWeekNumbers: false,
    numberOfMonths: 1,
    monthYearSelectType: "dropdown",
    required: false,
    disabledMatchers: [],
    availableDays: undefined,
    unavailableDays: undefined,
    shouldDisableMonth: undefined,
    shouldDisableYear: undefined,
    layout: "side-by-side",
    useNativeTimeInput: signal(false),
    minuteStep: 15,
    slotColumns: 3,
    gridVariant: "button",
    timeHeading: undefined,
    availableTimes: undefined,
    size: "default",
    ...overrides,
  };
}

describe("DateTimeFieldModalComponent", () => {
  let fixture: ComponentFixture<DateTimeFieldModalComponent>;
  let component: DateTimeFieldModalComponent;
  let close: jest.Mock;

  function setup(data: DateTimeFieldModalData = makeData()): void {
    close = jest.fn();
    const ref = { close } as unknown as ModalRef<unknown>;
    TestBed.configureTestingModule({
      imports: [DateTimeFieldModalComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        { provide: MODAL_DATA, useValue: data },
        { provide: ModalRef, useValue: ref },
      ],
    });
    fixture = TestBed.createComponent(DateTimeFieldModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it("renders and seeds the draft from data.value", () => {
    const value = new Date(2026, 4, 14, 10, 0);
    setup(makeData({ value }));
    expect(component.draft()).toBe(value);
  });

  it("cancel closes with undefined", () => {
    setup();
    component.cancel();
    expect(close).toHaveBeenCalledWith(undefined);
  });

  it("confirm closes with the current draft", () => {
    setup();
    const next = new Date(2026, 4, 14, 9, 0);
    component.draft.set(next);
    component.confirm();
    expect(close).toHaveBeenCalledWith(next);
  });

  it("combines the picked time into the single draft", () => {
    setup(makeData({ value: new Date(2026, 4, 14, 0, 0) }));
    component.handleTimeSelect("09:30");
    const v = component.draft() as Date;
    expect(v.getHours()).toBe(9);
    expect(v.getMinutes()).toBe(30);
  });

  it("combines the from time into the range draft", () => {
    setup(
      makeData({
        mode: "range",
        value: { from: new Date(2026, 4, 14, 0, 0) } as DateRange,
      }),
    );
    component.handleRangeTimeSelect("from", "08:00");
    const v = component.draft() as DateRange;
    expect(v.from.getHours()).toBe(8);
  });

  function stubCalendar(value: unknown): void {
    (component as unknown as { calendar: () => unknown }).calendar = () => ({
      value: () => value,
    });
  }

  it("combines the calendar date with the existing time on select (single)", () => {
    setup(makeData({ value: new Date(2026, 4, 14, 14, 30) }));
    stubCalendar(new Date(2026, 4, 20));
    component.handleCalendarSelect();
    const v = component.draft() as Date;
    expect(v.getDate()).toBe(20);
    expect(v.getHours()).toBe(14);
    expect(v.getMinutes()).toBe(30);
  });

  it("combines both ends on range select", () => {
    setup(
      makeData({
        mode: "range",
        value: {
          from: new Date(2026, 4, 14, 9, 0),
          to: new Date(2026, 4, 16, 17, 0),
        } as DateRange,
      }),
    );
    stubCalendar({
      from: new Date(2026, 4, 20),
      to: new Date(2026, 4, 22),
    } as DateRange);
    component.handleCalendarSelect();
    const v = component.draft() as DateRange;
    expect(v.from.getDate()).toBe(20);
    expect(v.from.getHours()).toBe(9);
    expect(v.to?.getDate()).toBe(22);
    expect(v.to?.getHours()).toBe(17);
  });

  it("clears the draft when the calendar selection is empty", () => {
    setup(makeData({ value: new Date(2026, 4, 14, 9, 0) }));
    stubCalendar(null);
    component.handleCalendarSelect();
    expect(component.draft()).toBeNull();
  });

  it("combines the to time into the range draft", () => {
    setup(
      makeData({
        mode: "range",
        value: { from: new Date(2026, 4, 14, 9, 0) } as DateRange,
      }),
    );
    component.handleRangeTimeSelect("to", "18:30");
    const v = component.draft() as DateRange;
    expect(v.to?.getHours()).toBe(18);
  });

  it("resolves available times from a function", () => {
    setup(
      makeData({
        value: new Date(2026, 4, 14, 0, 0),
        availableTimes: () => ["10:00", "11:00"],
      }),
    );
    expect(component.singleSlots()).toEqual(["10:00", "11:00"]);
  });

  it("resolves a static available-times array", () => {
    setup(makeData({ availableTimes: ["09:00", "09:30"] }));
    expect(component.singleSlots()).toEqual(["09:00", "09:30"]);
  });

  it("returns undefined slots when no availableTimes are set", () => {
    setup();
    expect(component.singleSlots()).toBeUndefined();
  });

  it("creates a single value from today when no date is selected", () => {
    setup();
    component.handleTimeSelect("07:45");
    const v = component.draft() as Date;
    expect(v.getHours()).toBe(7);
    expect(v.getMinutes()).toBe(45);
  });

  it("snaps to the first slot when the existing time is unavailable", () => {
    setup(
      makeData({
        value: new Date(2026, 4, 14, 23, 0),
        availableTimes: ["09:30", "10:00"],
      }),
    );
    stubCalendar(new Date(2026, 4, 20));
    component.handleCalendarSelect();
    const v = component.draft() as Date;
    expect(v.getHours()).toBe(9);
    expect(v.getMinutes()).toBe(30);
  });

  it("ignores empty time selections", () => {
    setup(makeData({ value: new Date(2026, 4, 14, 9, 0) }));
    component.handleTimeSelect(null);
    component.handleRangeTimeSelect("from", null);
    expect((component.draft() as Date).getHours()).toBe(9);
  });

  describe("multi-step", () => {
    const query = (selector: string) =>
      fixture.nativeElement.querySelector(selector);

    it("shows the calendar first and blocks advancing until the range is complete", () => {
      setup(makeData({ mode: "range", layout: "multi-step" }));
      expect(component.titleKey()).toBe("date-field.modal-title");
      expect(query("tedi-calendar")).toBeTruthy();
      expect(component.canAdvance()).toBe(false);

      component.draft.set({
        from: new Date(2026, 4, 14),
        to: new Date(2026, 4, 16),
      } as DateRange);
      expect(component.canAdvance()).toBe(true);
    });

    it("swaps the calendar for both time pickers on the time step", () => {
      setup(
        makeData({
          mode: "range",
          layout: "multi-step",
          value: {
            from: new Date(2026, 4, 14, 9, 0),
            to: new Date(2026, 4, 16, 17, 0),
          } as DateRange,
        }),
      );
      component.goToTimeStep();
      fixture.detectChanges();
      expect(component.titleKey()).toBe("date-time-field.time-heading");
      expect(query("tedi-calendar")).toBeNull();
      expect(
        fixture.nativeElement.querySelectorAll(".tedi-time-picker--scroll")
          .length,
      ).toBe(2);
      expect(query(".tedi-date-time-field-modal__back")).toBeTruthy();

      component.goToDateStep();
      fixture.detectChanges();
      expect(query("tedi-calendar")).toBeTruthy();
    });

    it("renders native time inputs when requested", () => {
      setup(
        makeData({
          mode: "range",
          layout: "multi-step",
          useNativeTimeInput: signal(true),
        }),
      );
      component.goToTimeStep();
      fixture.detectChanges();
      expect(
        fixture.nativeElement.querySelectorAll("tedi-time-field").length,
      ).toBe(2);
    });

    it("advances a single value once a date is picked", () => {
      setup(makeData({ layout: "multi-step" }));
      expect(component.canAdvance()).toBe(false);
      component.draft.set(new Date(2026, 4, 14));
      expect(component.canAdvance()).toBe(true);
    });
  });
});
