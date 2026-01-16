import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DatePickerComponent } from "./date-picker.component";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { NgxFloatUiContentComponent } from "ngx-float-ui";
import { DatePickerCalendarGridComponent } from "./date-picker-calendar-grid/date-picker-calendar-grid.component";

class TranslationMock {
  track(key: string) {
    return () => key;
  }
}

describe("DatePickerComponent", () => {
  let fixture: ComponentFixture<DatePickerComponent>;
  let component: DatePickerComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DatePickerComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
      ],
    });

    fixture = TestBed.createComponent(DatePickerComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;

    const mockFloatUiElement = document.createElement("div");
    const mockContainer = document.createElement("div");
    mockContainer.className = "float-ui-container-popover";
    mockContainer.id = "mock-popover-container";
    mockFloatUiElement.appendChild(mockContainer);

    jest.spyOn(component.popover(), "floatUiComponent").mockReturnValue({
      state: false,
      show: jest.fn(),
      hide: jest.fn(),
      elRef: {
        nativeElement: mockFloatUiElement,
      },
    } as unknown as NgxFloatUiContentComponent);

    fixture.detectChanges();
  });

  const getInput = () => el.querySelector("input") as HTMLInputElement;

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with empty input when selected=null", () => {
    expect(component.inputValue()).toBe("");
  });

  it("should update inputValue when a date is selected", () => {
    const date = new Date(2024, 2, 10);

    component.selectDay({
      date,
      disabled: false,
      inCurrentMonth: true,
    });

    fixture.detectChanges();

    expect(component.selected()).toEqual(date);
    expect(component.inputValue()).toBe("10.03.2024");
  });

  it("should NOT select disabled date", () => {
    const date = new Date(2024, 2, 20);

    component.selectDay({
      date,
      disabled: true,
      inCurrentMonth: true,
    });

    expect(component.selected()).toBeNull();
  });

  it("clearInput() should reset inputValue & selected", () => {
    component.selectDay({
      date: new Date(2024, 1, 1),
      disabled: false,
      inCurrentMonth: true,
    });

    fixture.detectChanges();

    component.clearInput();
    fixture.detectChanges();

    expect(component.inputValue()).toBe("");
    expect(component.selected()).toBeNull();
  });

  it("prevMonth() should change month to previous", () => {
    const initial = component.month();
    component.prevMonth();
    fixture.detectChanges();

    const expected = (initial.getMonth() + 11) % 12;
    expect(component.month().getMonth()).toBe(expected);
  });

  it("nextMonth() should change month to next", () => {
    const initial = component.month();
    component.nextMonth();
    fixture.detectChanges();

    const expected = (initial.getMonth() + 1) % 12;
    expect(component.month().getMonth()).toBe(expected);
  });

  it("onMonthClick should switch to month-grid", () => {
    component.onMonthClick();
    fixture.detectChanges();

    expect(component.currentView()).toBe("month-grid");
  });

  it("onYearClick should switch to year-grid", () => {
    component.onYearClick();
    fixture.detectChanges();

    expect(component.currentView()).toBe("year-grid");
  });

  it("onMonthSelect should update month & return to calendar-grid", () => {
    component.currentView.set("month-grid");

    component.onMonthSelect("5");
    fixture.detectChanges();

    expect(component.month().getMonth()).toBe(5);
    expect(component.currentView()).toBe("calendar-grid");
  });

  it("onYearSelect should update year & return to calendar-grid", () => {
    component.currentView.set("year-grid");

    component.onYearSelect("2030");
    fixture.detectChanges();

    expect(component.month().getFullYear()).toBe(2030);
    expect(component.currentView()).toBe("calendar-grid");
  });

  it("manual input should update inputValue", () => {
    const input = getInput();
    input.value = "15.04.2024";

    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    expect(component.inputValue()).toBe("15.04.2024");
  });

  it("should clear date when input value is empty string", () => {
    const input = getInput();
    input.value = "";

    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    expect(component.selected()).toBe(null);
  });

  it("valid manual input should update selected on blur", () => {
    const input = getInput();

    input.value = "05.02.2025";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    input.dispatchEvent(new Event("blur"));
    fixture.detectChanges();

    expect(component.selected()).toEqual(new Date(2025, 1, 5));
  });

  it("invalid manual input restores previous selected date", () => {
    component.selected.set(new Date(2024, 0, 1));
    component.inputValue.set("01.01.2024");

    fixture.detectChanges();

    const input = getInput();
    input.value = "invalid";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    input.dispatchEvent(new Event("blur"));
    fixture.detectChanges();

    expect(component.inputValue()).toBe("01.01.2024");
  });

  it("disabled matcher using Date should disable that day", () => {
    const disabledDate = new Date(2024, 1, 10);
    fixture.componentRef.setInput("disabled", disabledDate);
    fixture.detectChanges();

    expect(component.isDisabled(disabledDate)).toBe(true);
    expect(component.isDisabled(new Date(2024, 1, 11))).toBe(false);
  });

  it("Escape in day grid should hide popover and focus input", () => {
    const hideMock = jest.fn();
    const pop = component.popover().floatUiComponent();
    pop.hide = hideMock;
    pop.state = true;

    const input = component.inputElement().nativeElement;
    const focusSpy = jest.spyOn(input, "focus");

    const today = new Date();
    const event = new KeyboardEvent("keydown", { key: "Escape" });

    component.onDayKeydown(event, today);

    expect(hideMock).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });

  it("Escape in month-grid should return to calendar-grid", () => {
    component.currentView.set("month-grid");

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    component.onCalendarKeyDown(event);

    expect(component.currentView()).toBe("calendar-grid");
  });

  it("weekNumbers should generate exactly one number per week row", () => {
    const rows = component.weekRows();
    const weeks = component.weekNumbers();

    expect(weeks.length).toBe(rows.length);
  });

  it("onInputClick should do nothing when allowManualInput=true", () => {
    fixture.componentRef.setInput("allowManualInput", true);

    const pop = component.popover().floatUiComponent();
    const hideSpy = jest.spyOn(pop, "hide");
    const showSpy = jest.spyOn(pop, "show");

    component.onInputClick();

    expect(hideSpy).not.toHaveBeenCalled();
    expect(showSpy).not.toHaveBeenCalled();
  });

  it("onInputClick should hide popover and focus input when popover is open", () => {
    fixture.componentRef.setInput("allowManualInput", false);

    const pop = component.popover().floatUiComponent();
    pop.state = true;

    const hideSpy = jest.spyOn(pop, "hide");
    const focusSpy = jest.spyOn(
      component.inputElement().nativeElement,
      "focus",
    );

    component.onInputClick();

    expect(hideSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });

  it("onInputClick should show popover and call openCalendar when popover closed", () => {
    fixture.componentRef.setInput("allowManualInput", false);

    const pop = component.popover().floatUiComponent();
    pop.state = false;

    const showSpy = jest.spyOn(pop, "show");
    const openSpy = jest.spyOn(component, "openCalendar");

    component.onInputClick();

    expect(showSpy).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalled();
  });

  it("focusDate should update activeDate but NOT change month when already same month", () => {
    const spyMonth = jest.spyOn(component.month, "set");

    const date = new Date(
      component.month().getFullYear(),
      component.month().getMonth(),
      15,
    );

    component["focusDate"](date);
    expect(component.activeDate()).toEqual(date);
    expect(spyMonth).not.toHaveBeenCalled();
  });

  it("focusDate should update month when focusing date from different month", () => {
    const spyMonth = jest.spyOn(component.month, "set");

    const nextMonthDate = new Date(
      component.month().getFullYear(),
      component.month().getMonth() + 1,
      10,
    );

    component["focusDate"](nextMonthDate);
    expect(spyMonth).toHaveBeenCalled();
  });

  it("focusDate should focus the correct button after timeout", () => {
    jest.useFakeTimers();

    const date = new Date(2024, 4, 20);
    const mockFocusDate = jest.fn();

    jest.spyOn(component, "calendarGrid").mockReturnValue({
      focusDate: mockFocusDate,
    } as unknown as DatePickerCalendarGridComponent);

    component["focusDate"](date);

    jest.runAllTimers();
    jest.useRealTimers();

    expect(mockFocusDate).toHaveBeenCalledWith(date);
  });

  describe("Year page navigation", () => {
    it("prevYearPage should decrement page when hasPrevYearPage=true", () => {
      component.yearPageIndex.set(2);
      fixture.detectChanges();

      component.prevYearPage();
      expect(component.yearPageIndex()).toBe(1);
    });

    it("prevYearPage should NOT decrement when hasPrevYearPage=false", () => {
      component.yearPageIndex.set(0);
      fixture.detectChanges();

      component.prevYearPage();
      expect(component.yearPageIndex()).toBe(0);
    });

    it("nextYearPage should increment page when hasNextYearPage=true", () => {
      component.yearPageIndex.set(0);

      fixture.componentRef.setInput("endYear", 200);
      fixture.detectChanges();

      component.nextYearPage();
      expect(component.yearPageIndex()).toBe(1);
    });

    it("nextYearPage should NOT increment when hasNextYearPage=false", () => {
      const currentYear = new Date().getFullYear();
      fixture.componentRef.setInput("startYear", currentYear);
      fixture.componentRef.setInput("endYear", currentYear + 11);
      component.yearPageIndex.set(0);
      fixture.detectChanges();

      component.nextYearPage();
      expect(component.yearPageIndex()).toBe(0);
    });
  });

  describe("onDayKeydown navigation keys", () => {
    const today = new Date(2024, 4, 15);

    let focusSpy: jest.SpyInstance;
    type FocusType = { focusDate: (date: Date) => void };

    beforeEach(() => {
      focusSpy = jest.spyOn(component as unknown as FocusType, "focusDate");
    });

    function trigger(key: string) {
      const evt = new KeyboardEvent("keydown", { key });
      component.onDayKeydown(evt, today);
    }

    it("ArrowLeft should move date -1 day", () => {
      trigger("ArrowLeft");
      const expected = new Date(2024, 4, 14).getTime();
      expect(focusSpy).toHaveBeenCalledWith(new Date(expected));
    });

    it("ArrowRight should move date +1 day", () => {
      trigger("ArrowRight");
      expect(focusSpy).toHaveBeenCalledWith(new Date(2024, 4, 16));
    });

    it("ArrowUp should move date -7 days", () => {
      trigger("ArrowUp");
      expect(focusSpy).toHaveBeenCalledWith(new Date(2024, 4, 8));
    });

    it("ArrowDown should move date +7 days", () => {
      trigger("ArrowDown");
      expect(focusSpy).toHaveBeenCalledWith(new Date(2024, 4, 22));
    });

    it("Home should jump to start of week", () => {
      const weekday = (today.getDay() + 6) % 7;
      const expected = new Date(today);
      expected.setDate(today.getDate() - weekday);

      trigger("Home");
      expect(focusSpy).toHaveBeenCalledWith(expected);
    });

    it("End should jump to end of week", () => {
      const weekday = (today.getDay() + 6) % 7;
      const expected = new Date(today);
      expected.setDate(today.getDate() + (6 - weekday));

      trigger("End");
      expect(focusSpy).toHaveBeenCalledWith(expected);
    });

    it("PageUp should move one month back", () => {
      trigger("PageUp");
      expect(focusSpy).toHaveBeenCalledWith(new Date(2024, 3, 15));
    });

    it("PageDown should move one month forward", () => {
      trigger("PageDown");
      expect(focusSpy).toHaveBeenCalledWith(new Date(2024, 5, 15));
    });

    it("Enter selects the date", () => {
      const selectSpy = jest.spyOn(component, "selectDay");

      trigger("Enter");

      expect(selectSpy).toHaveBeenCalledWith({
        date: today,
        disabled: false,
        inCurrentMonth: true,
      });
    });

    it("Space selects the date", () => {
      const selectSpy = jest.spyOn(component, "selectDay");

      trigger(" ");

      expect(selectSpy).toHaveBeenCalled();
    });

    it("Default key should NOT call focusDate", () => {
      focusSpy.mockClear();
      trigger("X");
      expect(focusSpy).not.toHaveBeenCalled();
    });
  });

  describe("matches()", () => {
    type PrivateMatchesAPI = {
      matches: (m: unknown, date: Date) => boolean;
    };

    const matches = (m: unknown, date: Date) =>
      (component as unknown as PrivateMatchesAPI).matches(m, date);

    const ref = new Date(2024, 4, 15);

    it("should match when m is a Date (same day)", () => {
      expect(matches(new Date(2024, 4, 15), ref)).toBe(true);
    });

    it("should NOT match when m is a Date (different day)", () => {
      expect(matches(new Date(2024, 4, 16), ref)).toBe(false);
    });

    it("should match when m is an array containing matching date", () => {
      expect(matches([new Date(2024, 4, 10), new Date(2024, 4, 15)], ref)).toBe(
        true,
      );
    });

    it("should NOT match when array has no matching dates", () => {
      expect(matches([new Date(2024, 4, 10), new Date(2024, 4, 20)], ref)).toBe(
        false,
      );
    });

    it("should match when m is a function returning true", () => {
      expect(matches((d: Date) => d.getDate() === 15, ref)).toBe(true);
    });

    it("should NOT match when m is a function returning false", () => {
      expect(matches((d: Date) => d.getDate() === 1, ref)).toBe(false);
    });

    it("should match when m has 'before' and date < before", () => {
      expect(matches({ before: new Date(2024, 5, 1) }, ref)).toBe(true);
    });

    it("should NOT match when m has 'before' and date >= before", () => {
      expect(matches({ before: new Date(2024, 4, 15) }, ref)).toBe(false);
    });

    it("should match when m has 'after' and date > after", () => {
      expect(matches({ after: new Date(2024, 3, 1) }, ref)).toBe(true);
    });

    it("should NOT match when m has 'after' and date <= after", () => {
      expect(matches({ after: new Date(2024, 4, 15) }, ref)).toBe(false);
    });

    it("should match when m has 'from' and date >= from", () => {
      expect(matches({ from: new Date(2024, 4, 1) }, ref)).toBe(true);
    });

    it("should NOT match when m has 'from' and date < from", () => {
      expect(matches({ from: new Date(2024, 4, 20) }, ref)).toBe(false);
    });

    it("should match when m has 'from' and 'to' and date is in range", () => {
      expect(
        matches(
          { from: new Date(2024, 4, 10), to: new Date(2024, 4, 20) },
          ref,
        ),
      ).toBe(true);
    });

    it("should NOT match when m has 'from' and 'to' and date is outside range", () => {
      expect(
        matches({ from: new Date(2024, 4, 1), to: new Date(2024, 4, 10) }, ref),
      ).toBe(false);
    });

    it("should return false for unknown matcher shapes", () => {
      expect(matches({ invalid: true }, ref)).toBe(false);
    });
  });

  describe("getFirstEnabledDayOfMonth()", () => {
    const getFirst = (y: number, m: number) =>
      component["getFirstEnabledDayOfMonth"](y, m);

    it("should return the 1st of month when no disabled rules exist", () => {
      fixture.componentRef.setInput("disabled", null);
      fixture.detectChanges();

      const result = getFirst(2024, 4);
      expect(result).toEqual(new Date(2024, 4, 1));
    });

    it("should return the first *enabled* day if early days are disabled", () => {
      const disabledDates = [new Date(2024, 4, 1), new Date(2024, 4, 2)];
      fixture.componentRef.setInput("disabled", disabledDates);
      fixture.detectChanges();

      const result = getFirst(2024, 4);

      expect(result).toEqual(new Date(2024, 4, 3));
    });

    it("should return null if ALL days of the month are disabled", () => {
      const disabledAll = [];

      for (let d = 1; d <= 29; d++) {
        disabledAll.push(new Date(2024, 1, d));
      }

      fixture.componentRef.setInput("disabled", disabledAll);
      fixture.detectChanges();

      const result = getFirst(2024, 1);
      expect(result).toBeNull();
    });

    it("should work with matcher objects (before rule disables all days)", () => {
      fixture.componentRef.setInput("disabled", {
        before: new Date(2030, 0, 1),
      });
      fixture.detectChanges();

      const result = getFirst(2024, 4);
      expect(result).toBeNull();
    });

    it("should work with matcher objects (after rule disables all days)", () => {
      fixture.componentRef.setInput("disabled", {
        after: new Date(2020, 0, 1),
      });
      fixture.detectChanges();

      const result = getFirst(2024, 4);
      expect(result).toBeNull();
    });

    it("should work with function matcher (disable weekends)", () => {
      fixture.componentRef.setInput("disabled", (d: Date) => {
        const dow = d.getDay();
        return dow === 0 || dow === 6;
      });
      fixture.detectChanges();

      const result = getFirst(2024, 1);
      expect(result).toEqual(new Date(2024, 1, 1));
    });
  });

  describe("Disabled date matchers ignore time components", () => {
    it("before matcher should not disable the date itself", () => {
      const cutoffDate = new Date(2024, 4, 15, 12, 30, 0);
      fixture.componentRef.setInput("disabled", { before: cutoffDate });
      fixture.detectChanges();

      const cutoffAtMidnight = new Date(2024, 4, 15, 0, 0, 0);
      const dayBefore = new Date(2024, 4, 14);

      expect(component.isDisabled(cutoffAtMidnight)).toBe(false);
      expect(component.isDisabled(dayBefore)).toBe(true);
    });

    it("after matcher should not disable the date itself", () => {
      const cutoffDate = new Date(2024, 4, 15, 12, 30, 0);
      fixture.componentRef.setInput("disabled", { after: cutoffDate });
      fixture.detectChanges();

      const cutoffAtMidnight = new Date(2024, 4, 15, 0, 0, 0);
      const dayAfter = new Date(2024, 4, 16);

      expect(component.isDisabled(cutoffAtMidnight)).toBe(false);
      expect(component.isDisabled(dayAfter)).toBe(true);
    });
  });

  describe("Disabled months and years", () => {
    it("disabledMonths should contain months with no enabled days", () => {
      fixture.componentRef.setInput("disabled", [
        { before: new Date(2024, 2, 1) },
        { after: new Date(2024, 4, 31) },
      ]);
      component.month.set(new Date(2024, 3, 1));
      fixture.detectChanges();

      const disabled = component.disabledMonths();

      expect(disabled.has(0)).toBe(true);
      expect(disabled.has(1)).toBe(true);
      expect(disabled.has(2)).toBe(false);
      expect(disabled.has(3)).toBe(false);
      expect(disabled.has(4)).toBe(false);
      expect(disabled.has(5)).toBe(true);
    });

    it("disabledYears should contain years with no enabled days", () => {
      fixture.componentRef.setInput("startYear", 2022);
      fixture.componentRef.setInput("endYear", 2026);
      fixture.componentRef.setInput("disabled", [
        { before: new Date(2024, 0, 1) },
        { after: new Date(2024, 11, 31) },
      ]);
      fixture.detectChanges();

      const disabled = component.disabledYears();

      expect(disabled.has(2022)).toBe(true);
      expect(disabled.has(2023)).toBe(true);
      expect(disabled.has(2024)).toBe(false);
      expect(disabled.has(2025)).toBe(true);
      expect(disabled.has(2026)).toBe(true);
    });
  });

  describe("Navigation with disabled months", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("startYear", 2024);
      fixture.componentRef.setInput("endYear", 2024);
      fixture.componentRef.setInput("disabled", [
        { before: new Date(2024, 3, 1) },
        { after: new Date(2024, 8, 30) },
      ]);
      component.month.set(new Date(2024, 5, 1));
      fixture.detectChanges();
    });

    it("canGoPrev should be true when there is an enabled month before", () => {
      expect(component.canGoPrev()).toBe(true);
    });

    it("canGoNext should be true when there is an enabled month after", () => {
      expect(component.canGoNext()).toBe(true);
    });

    it("prevMonth should skip disabled months", () => {
      component.month.set(new Date(2024, 5, 1));
      fixture.detectChanges();

      component.prevMonth();

      expect(component.month().getMonth()).toBe(4);
    });

    it("nextMonth should skip disabled months", () => {
      component.month.set(new Date(2024, 5, 1));
      fixture.detectChanges();

      component.nextMonth();

      expect(component.month().getMonth()).toBe(6);
    });

    it("canGoPrev should be false when at first enabled month", () => {
      component.month.set(new Date(2024, 3, 1));
      fixture.detectChanges();

      expect(component.canGoPrev()).toBe(false);
    });

    it("canGoNext should be false when at last enabled month", () => {
      component.month.set(new Date(2024, 8, 1));
      fixture.detectChanges();

      expect(component.canGoNext()).toBe(false);
    });

    it("prevMonth should not change month when canGoPrev is false", () => {
      component.month.set(new Date(2024, 3, 1));
      fixture.detectChanges();

      component.prevMonth();

      expect(component.month().getMonth()).toBe(3);
    });

    it("nextMonth should not change month when canGoNext is false", () => {
      component.month.set(new Date(2024, 8, 1));
      fixture.detectChanges();

      component.nextMonth();

      expect(component.month().getMonth()).toBe(8);
    });
  });

  describe("Month and year select with disabled periods", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("startYear", 2025);
      fixture.componentRef.setInput("endYear", 2027);
      fixture.componentRef.setInput("disabled", [
        { before: new Date(2024, 5, 1) },
        { after: new Date(2024, 7, 31) },
      ]);
      component.month.set(new Date(2024, 6, 1));
      fixture.detectChanges();
    });

    it("onMonthSelect should not navigate to fully disabled month", () => {
      component.onMonthSelect("0");

      expect(component.month().getMonth()).toBe(6);
    });

    it("onMonthSelect should navigate to enabled month", () => {
      component.onMonthSelect("7");

      expect(component.month().getMonth()).toBe(7);
    });

    it("onYearSelect should not navigate to fully disabled year", () => {
      component.onYearSelect("2025");

      expect(component.month().getFullYear()).toBe(2024);
    });

    it("onYearSelect should navigate to enabled year", () => {
      fixture.componentRef.setInput("disabled", null);
      fixture.detectChanges();

      component.onYearSelect("2027");

      expect(component.month().getFullYear()).toBe(2027);
    });

    it("onYearSelect should find first enabled month if current month is disabled in new year", () => {
      // Enable Jun-Aug in 2024, and Jan-Mar in 2027
      fixture.componentRef.setInput("disabled", [
        { before: new Date(2024, 5, 1) },
        { after: new Date(2027, 2, 31) },
      ]);
      component.month.set(new Date(2024, 6, 1));
      fixture.detectChanges();

      component.onYearSelect("2027");

      expect(component.month().getFullYear()).toBe(2027);
      expect(component.month().getMonth()).toBeLessThanOrEqual(2);
    });
  });

  describe("closeOnSelect behavior", () => {
    it("should close popover after selection when closeOnSelect is true", () => {
      const hideSpy = jest.spyOn(
        component.popover().floatUiComponent(),
        "hide",
      );

      component.selectDay({
        date: new Date(2024, 4, 15),
        disabled: false,
        inCurrentMonth: true,
      });

      expect(hideSpy).toHaveBeenCalled();
    });

    it("should not close popover after selection when closeOnSelect is false", () => {
      fixture.componentRef.setInput("closeOnSelect", false);
      fixture.detectChanges();

      const hideSpy = jest.spyOn(
        component.popover().floatUiComponent(),
        "hide",
      );

      component.selectDay({
        date: new Date(2024, 4, 15),
        disabled: false,
        inCurrentMonth: true,
      });

      expect(hideSpy).not.toHaveBeenCalled();
    });
  });
});
