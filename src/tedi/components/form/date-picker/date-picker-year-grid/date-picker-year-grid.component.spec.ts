import { ComponentFixture, TestBed } from "@angular/core/testing";
import { DatePickerYearGridComponent } from "./date-picker-year-grid.component";

describe("DatePickerYearGridComponent", () => {
  let fixture: ComponentFixture<DatePickerYearGridComponent>;
  let component: DatePickerYearGridComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DatePickerYearGridComponent],
    });

    fixture = TestBed.createComponent(DatePickerYearGridComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput(
      "pagedYears",
      [2020, 2021, 2022, 2023, 2024, 2025],
    );
    fixture.componentRef.setInput("selectedYear", 2024);

    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  describe("onYearClick()", () => {
    it("should emit yearSelect event with clicked year", () => {
      const emitSpy = jest.spyOn(component.yearSelect, "emit");

      component.onYearClick(2025);

      expect(emitSpy).toHaveBeenCalledWith(2025);
    });

    it("should emit the first year in the page when clicked", () => {
      const emitSpy = jest.spyOn(component.yearSelect, "emit");

      component.onYearClick(2020);

      expect(emitSpy).toHaveBeenCalledWith(2020);
    });

    it("should emit the last year in the page when clicked", () => {
      const emitSpy = jest.spyOn(component.yearSelect, "emit");

      component.onYearClick(2025);

      expect(emitSpy).toHaveBeenCalledWith(2025);
    });
  });
});
