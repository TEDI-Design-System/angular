import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DatePickerHeaderComponent } from "./date-picker-header.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";

class TranslationMock {
  track(key: string) {
    return () => key;
  }
}

describe("DatePickerHeaderComponent", () => {
  let fixture: ComponentFixture<DatePickerHeaderComponent>;
  let component: DatePickerHeaderComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DatePickerHeaderComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
      ],
    });

    fixture = TestBed.createComponent(DatePickerHeaderComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput("uniqueId", "test-datepicker");
    fixture.componentRef.setInput("currentView", "calendar-grid");
    fixture.componentRef.setInput("month", new Date(2024, 4, 1));
    fixture.componentRef.setInput("selectedYear", 2024);
    fixture.componentRef.setInput("years", [2020, 2021, 2022, 2023, 2024, 2025]);
    fixture.componentRef.setInput("pagedYears", [2020, 2021, 2022, 2023, 2024, 2025]);

    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  describe("onPrevMonth()", () => {
    it("should emit prevMonth event", () => {
      const emitSpy = jest.spyOn(component.prevMonth, "emit");

      component.onPrevMonth();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe("onNextMonth()", () => {
    it("should emit nextMonth event", () => {
      const emitSpy = jest.spyOn(component.nextMonth, "emit");

      component.onNextMonth();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe("onMonthSelect()", () => {
    it("should emit monthSelect event when value is provided", () => {
      const emitSpy = jest.spyOn(component.monthSelect, "emit");

      component.onMonthSelect("5");

      expect(emitSpy).toHaveBeenCalledWith("5");
    });

    it("should not emit monthSelect event when value is undefined", () => {
      const emitSpy = jest.spyOn(component.monthSelect, "emit");

      component.onMonthSelect(undefined);

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it("should not emit monthSelect event when value is empty string", () => {
      const emitSpy = jest.spyOn(component.monthSelect, "emit");

      component.onMonthSelect("");

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe("onYearSelect()", () => {
    it("should emit yearSelect event when value is provided", () => {
      const emitSpy = jest.spyOn(component.yearSelect, "emit");

      component.onYearSelect("2025");

      expect(emitSpy).toHaveBeenCalledWith("2025");
    });

    it("should not emit yearSelect event when value is undefined", () => {
      const emitSpy = jest.spyOn(component.yearSelect, "emit");

      component.onYearSelect(undefined);

      expect(emitSpy).not.toHaveBeenCalled();
    });

    it("should not emit yearSelect event when value is empty string", () => {
      const emitSpy = jest.spyOn(component.yearSelect, "emit");

      component.onYearSelect("");

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe("onMonthClick()", () => {
    it("should emit monthClick event", () => {
      const emitSpy = jest.spyOn(component.monthClick, "emit");

      component.onMonthClick();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe("onYearClick()", () => {
    it("should emit yearClick event", () => {
      const emitSpy = jest.spyOn(component.yearClick, "emit");

      component.onYearClick();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe("onPrevYearPage()", () => {
    it("should emit prevYearPage event", () => {
      const emitSpy = jest.spyOn(component.prevYearPage, "emit");

      component.onPrevYearPage();

      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe("onNextYearPage()", () => {
    it("should emit nextYearPage event", () => {
      const emitSpy = jest.spyOn(component.nextYearPage, "emit");

      component.onNextYearPage();

      expect(emitSpy).toHaveBeenCalled();
    });
  });
});
