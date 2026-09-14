import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DatePickerMonthGridComponent } from "./date-picker-month-grid.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";

class TranslationMock {
  track(key: string) {
    return () => key;
  }
}

describe("DatePickerMonthGridComponent", () => {
  let fixture: ComponentFixture<DatePickerMonthGridComponent>;
  let component: DatePickerMonthGridComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DatePickerMonthGridComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
      ],
    });

    fixture = TestBed.createComponent(DatePickerMonthGridComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput("currentMonth", new Date(2024, 4, 1));

    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should have 12 month short names", () => {
    expect(component.monthShortNames.length).toBe(12);
  });

  describe("onMonthClick()", () => {
    it("should emit monthSelect event with clicked month index", () => {
      const emitSpy = jest.spyOn(component.monthSelect, "emit");

      component.onMonthClick(5);

      expect(emitSpy).toHaveBeenCalledWith(5);
    });

    it("should emit January when first month is clicked", () => {
      const emitSpy = jest.spyOn(component.monthSelect, "emit");

      component.onMonthClick(0);

      expect(emitSpy).toHaveBeenCalledWith(0);
    });

    it("should emit December when last month is clicked", () => {
      const emitSpy = jest.spyOn(component.monthSelect, "emit");

      component.onMonthClick(11);

      expect(emitSpy).toHaveBeenCalledWith(11);
    });
  });
});
