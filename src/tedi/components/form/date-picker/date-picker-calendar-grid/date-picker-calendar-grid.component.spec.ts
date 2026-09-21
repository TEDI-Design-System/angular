import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DatePickerCalendarGridComponent } from "./date-picker-calendar-grid.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { DatePickerDay } from "../date-picker.component";

class TranslationMock {
  track(key: string) {
    return () => key;
  }
}

describe("DatePickerCalendarGridComponent", () => {
  let fixture: ComponentFixture<DatePickerCalendarGridComponent>;
  let component: DatePickerCalendarGridComponent;

  const mockWeekRows: DatePickerDay[][] = [
    [
      { date: new Date(2024, 4, 13), disabled: false, inCurrentMonth: true },
      { date: new Date(2024, 4, 14), disabled: false, inCurrentMonth: true },
      { date: new Date(2024, 4, 15), disabled: false, inCurrentMonth: true },
      { date: new Date(2024, 4, 16), disabled: true, inCurrentMonth: true },
      { date: new Date(2024, 4, 17), disabled: false, inCurrentMonth: true },
      { date: new Date(2024, 4, 18), disabled: false, inCurrentMonth: true },
      { date: new Date(2024, 4, 19), disabled: false, inCurrentMonth: true },
    ],
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DatePickerCalendarGridComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
      ],
    });

    fixture = TestBed.createComponent(DatePickerCalendarGridComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput("gridId", "test-grid");
    fixture.componentRef.setInput("weekRows", mockWeekRows);
    fixture.componentRef.setInput("weekNumbers", [20]);
    fixture.componentRef.setInput("activeDate", new Date(2024, 4, 15));
    fixture.componentRef.setInput("today", new Date(2024, 4, 15));

    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  describe("isSelected()", () => {
    it("should return true when date matches selected date", () => {
      fixture.componentRef.setInput("selected", new Date(2024, 4, 15));
      fixture.detectChanges();

      expect(component.isSelected(new Date(2024, 4, 15))).toBe(true);
    });

    it("should return false when date does not match selected date", () => {
      fixture.componentRef.setInput("selected", new Date(2024, 4, 15));
      fixture.detectChanges();

      expect(component.isSelected(new Date(2024, 4, 16))).toBe(false);
    });

    it("should return false when no date is selected", () => {
      fixture.componentRef.setInput("selected", null);
      fixture.detectChanges();

      expect(component.isSelected(new Date(2024, 4, 15))).toBe(false);
    });
  });

  describe("isToday()", () => {
    it("should return true when date is today", () => {
      expect(component.isToday(new Date(2024, 4, 15))).toBe(true);
    });

    it("should return false when date is not today", () => {
      expect(component.isToday(new Date(2024, 4, 16))).toBe(false);
    });
  });

  describe("getTabIndex()", () => {
    it("should return 0 when date matches active date", () => {
      expect(component.getTabIndex(new Date(2024, 4, 15))).toBe(0);
    });

    it("should return -1 when date does not match active date", () => {
      expect(component.getTabIndex(new Date(2024, 4, 16))).toBe(-1);
    });

    it("should return -1 when activeDate is null", () => {
      fixture.componentRef.setInput("activeDate", null);
      fixture.detectChanges();

      expect(component.getTabIndex(new Date(2024, 4, 15))).toBe(-1);
    });
  });

  describe("onDayClick()", () => {
    it("should emit daySelect event with the clicked day", () => {
      const emitSpy = jest.spyOn(component.daySelect, "emit");
      const day: DatePickerDay = {
        date: new Date(2024, 4, 15),
        disabled: false,
        inCurrentMonth: true,
      };

      component.onDayClick(day);

      expect(emitSpy).toHaveBeenCalledWith(day);
    });
  });

  describe("onDayKeydown()", () => {
    it("should emit dayKeydown event with keyboard event and date", () => {
      const emitSpy = jest.spyOn(component.dayKeydown, "emit");
      const event = new KeyboardEvent("keydown", { key: "Enter" });
      const date = new Date(2024, 4, 15);

      component.onDayKeydown(event, date);

      expect(emitSpy).toHaveBeenCalledWith({ event, date });
    });
  });

  describe("focusDate()", () => {
    type GridElementType = {
      gridElement: () => { nativeElement: HTMLElement } | undefined;
    };

    it("should focus the button with matching data-date-key", () => {
      const date = new Date(2024, 4, 15);
      const key = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      ).getTime();

      const mockButton = document.createElement("button");
      mockButton.setAttribute("data-date-key", key.toString());
      const focusSpy = jest.spyOn(mockButton, "focus");

      const mockContainer = document.createElement("div");
      mockContainer.appendChild(mockButton);

      jest
        .spyOn(component as unknown as GridElementType, "gridElement")
        .mockReturnValue({ nativeElement: mockContainer });

      component.focusDate(date);

      expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    });

    it("should not focus when button is already focused", () => {
      const date = new Date(2024, 4, 15);
      const key = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      ).getTime();

      const mockButton = document.createElement("button");
      mockButton.setAttribute("data-date-key", key.toString());
      const focusSpy = jest.spyOn(mockButton, "focus");

      const mockContainer = document.createElement("div");
      mockContainer.appendChild(mockButton);

      jest
        .spyOn(component as unknown as GridElementType, "gridElement")
        .mockReturnValue({ nativeElement: mockContainer });

      Object.defineProperty(document, "activeElement", {
        value: mockButton,
        configurable: true,
      });

      component.focusDate(date);

      expect(focusSpy).not.toHaveBeenCalled();
    });

    it("should return early when gridElement is null", () => {
      jest
        .spyOn(component as unknown as GridElementType, "gridElement")
        .mockReturnValue(undefined);

      expect(() => component.focusDate(new Date(2024, 4, 15))).not.toThrow();
    });

    it("should not focus when button is not found", () => {
      const mockContainer = document.createElement("div");

      jest
        .spyOn(component as unknown as GridElementType, "gridElement")
        .mockReturnValue({ nativeElement: mockContainer });

      expect(() => component.focusDate(new Date(2024, 4, 15))).not.toThrow();
    });
  });
});
