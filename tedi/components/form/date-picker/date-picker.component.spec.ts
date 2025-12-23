import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DatePickerComponent } from "./date-picker.component";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { NgxFloatUiContentComponent } from "ngx-float-ui";
import { ElementRef } from "@angular/core";

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

    const mockContainer = document.createElement("div");
    const date = new Date(2024, 4, 20);
    const key = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    ).getTime();

    const fakeBtn = document.createElement("button");
    fakeBtn.setAttribute("data-date-key", String(key));

    const focusSpy = jest.spyOn(fakeBtn, "focus");

    mockContainer.appendChild(fakeBtn);

    jest.spyOn(component, "gridElement").mockReturnValue({
      nativeElement: mockContainer,
    } as unknown as ElementRef<HTMLDivElement>);

    component["focusDate"](date);

    jest.runAllTimers();
    jest.useRealTimers();

    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
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

  describe("parseDate", () => {
    function parse(str: string) {
      return component["parseDate"](str);
    }

    it("should return null for formats not split into 3 parts", () => {
      expect(parse("")).toBeNull();
      expect(parse("12.05")).toBeNull();
      expect(parse("12-05-2024")).toBeNull();
      expect(parse("12/05/2024")).toBeNull();
    });

    it("should return null when day, month, or year are not valid numbers", () => {
      expect(parse("aa.bb.cccc")).toBeNull();
      expect(parse("1..2024")).toBeNull();
      expect(parse(".02.2024")).toBeNull();
      expect(parse("15.NaN.2024")).toBeNull();
    });

    it("should return null for impossible dates after constructing Date", () => {
      expect(parse("31.02.2024")).toBeNull();
      expect(parse("10.13.2024")).toBeNull();
      expect(parse("00.12.2024")).toBeNull();
      expect(parse("10.00.2024")).toBeNull();
    });

    it("should return a valid Date for correct input", () => {
      const result = parse("10.03.2024");
      expect(result).toEqual(new Date(2024, 2, 10));
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
});
