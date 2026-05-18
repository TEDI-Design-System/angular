import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CalendarMonthGridComponent } from "./calendar-month-grid.component";
import { getMonthNames } from "../../../../utils/date.util";

describe("CalendarMonthGridComponent", () => {
  let fixture: ComponentFixture<CalendarMonthGridComponent>;
  let component: CalendarMonthGridComponent;

  const YEAR = 2024;

  function createComponent(): void {
    TestBed.configureTestingModule({
      imports: [CalendarMonthGridComponent],
    });
    fixture = TestBed.createComponent(CalendarMonthGridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("year", YEAR);
    fixture.detectChanges();
  }

  function buttons(): HTMLButtonElement[] {
    return fixture.debugElement
      .queryAll(By.css(".tedi-calendar-month-grid__month"))
      .map((d) => d.nativeElement as HTMLButtonElement);
  }

  beforeEach(() => {
    createComponent();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("grid layout", () => {
    it("renders 12 cells", () => {
      const cells = fixture.debugElement.queryAll(
        By.css(".tedi-calendar-month-grid__cell"),
      );
      expect(cells.length).toBe(12);
      expect(buttons().length).toBe(12);
    });

    it("renders the grid container with role=grid and a single role=row", () => {
      const grid = fixture.debugElement.query(
        By.css(".tedi-calendar-month-grid"),
      );
      expect(grid.nativeElement.getAttribute("role")).toBe("grid");
      const rows = fixture.debugElement.queryAll(
        By.css(".tedi-calendar-month-grid__row"),
      );
      expect(rows.length).toBe(1);
      expect(rows[0].nativeElement.getAttribute("role")).toBe("row");
    });
  });

  describe("month name formatting", () => {
    it("renders et-EE short names by default", () => {
      const expected = getMonthNames("et-EE", "short");
      const labels = buttons().map((b) => (b.textContent ?? "").trim());
      expect(labels).toEqual(expected);
    });

    it("renders en-US long names when localeCode and monthNameFormat change", () => {
      fixture.componentRef.setInput("localeCode", "en-US");
      fixture.componentRef.setInput("monthNameFormat", "long");
      fixture.detectChanges();

      const expected = getMonthNames("en-US", "long");
      const labels = buttons().map((b) => (b.textContent ?? "").trim());
      expect(labels).toEqual(expected);
      expect(labels[0]).toBe("January");
      expect(labels[11]).toBe("December");
    });
  });

  describe("selectedMonth highlighting", () => {
    it("highlights only the matching month with --selected", () => {
      fixture.componentRef.setInput("selectedMonth", new Date(YEAR, 4, 15));
      fixture.detectChanges();

      const all = buttons();
      const selected = all.filter((b) =>
        b.classList.contains("tedi-calendar-month-grid__month--selected"),
      );
      expect(selected.length).toBe(1);
      expect(selected[0]).toBe(all[4]);
      expect(selected[0].getAttribute("aria-selected")).toBe("true");
    });

    it("highlights nothing when selectedMonth is null", () => {
      const selected = buttons().filter((b) =>
        b.classList.contains("tedi-calendar-month-grid__month--selected"),
      );
      expect(selected.length).toBe(0);
    });

    it("does not highlight when selectedMonth is in a different year", () => {
      fixture.componentRef.setInput("selectedMonth", new Date(2023, 4, 15));
      fixture.detectChanges();

      const selected = buttons().filter((b) =>
        b.classList.contains("tedi-calendar-month-grid__month--selected"),
      );
      expect(selected.length).toBe(0);
    });
  });

  describe("isMonthDisabled predicate", () => {
    it("disables months matching the predicate", () => {
      fixture.componentRef.setInput(
        "isMonthDisabled",
        (m: Date) => m.getMonth() === 0 || m.getMonth() === 1,
      );
      fixture.detectChanges();

      const all = buttons();
      expect(all[0].getAttribute("aria-disabled")).toBe("true");
      expect(all[0].classList).toContain(
        "tedi-calendar-month-grid__month--disabled",
      );
      expect(all[1].getAttribute("aria-disabled")).toBe("true");
      expect(all[2].getAttribute("aria-disabled")).toBeNull();
    });

    it("does not emit on click of a disabled month", () => {
      fixture.componentRef.setInput(
        "isMonthDisabled",
        (m: Date) => m.getMonth() === 3,
      );
      fixture.detectChanges();

      const emit = jest.spyOn(component.monthSelect, "emit");
      buttons()[3].click();
      expect(emit).not.toHaveBeenCalled();
    });
  });

  describe("inputDisabled", () => {
    it("disables every button when true", () => {
      fixture.componentRef.setInput("inputDisabled", true);
      fixture.detectChanges();

      const all = buttons();
      expect(all.length).toBe(12);
      for (const btn of all) {
        expect(btn.getAttribute("aria-disabled")).toBe("true");
        expect(btn.classList).toContain(
          "tedi-calendar-month-grid__month--disabled",
        );
      }
    });

    it("does not emit on click when inputDisabled is true", () => {
      fixture.componentRef.setInput("inputDisabled", true);
      fixture.detectChanges();

      const emit = jest.spyOn(component.monthSelect, "emit");
      buttons()[5].click();
      expect(emit).not.toHaveBeenCalled();
    });
  });

  describe("monthSelect emission", () => {
    it("emits startOfMonth Date for an enabled click", () => {
      const emit = jest.spyOn(component.monthSelect, "emit");
      buttons()[6].click();

      expect(emit).toHaveBeenCalledTimes(1);
      const emitted = emit.mock.calls[0][0] as Date;
      expect(emitted).toBeInstanceOf(Date);
      expect(emitted.getFullYear()).toBe(YEAR);
      expect(emitted.getMonth()).toBe(6);
      expect(emitted.getDate()).toBe(1);
    });

    it("emits January (index 0) with the correct year", () => {
      const emit = jest.spyOn(component.monthSelect, "emit");
      buttons()[0].click();

      const emitted = emit.mock.calls[0][0] as Date;
      expect(emitted.getFullYear()).toBe(YEAR);
      expect(emitted.getMonth()).toBe(0);
      expect(emitted.getDate()).toBe(1);
    });

    it("emits December (index 11) with the correct year", () => {
      const emit = jest.spyOn(component.monthSelect, "emit");
      buttons()[11].click();

      const emitted = emit.mock.calls[0][0] as Date;
      expect(emitted.getFullYear()).toBe(YEAR);
      expect(emitted.getMonth()).toBe(11);
      expect(emitted.getDate()).toBe(1);
    });
  });

  describe("--current modifier", () => {
    it("applies to today's month when year matches the current year", () => {
      const now = new Date();
      fixture.componentRef.setInput("year", now.getFullYear());
      fixture.detectChanges();

      const all = buttons();
      const current = all.filter((b) =>
        b.classList.contains("tedi-calendar-month-grid__month--current"),
      );
      expect(current.length).toBe(1);
      expect(current[0]).toBe(all[now.getMonth()]);
    });

    it("does not apply when year is different from the current year", () => {
      fixture.componentRef.setInput("year", new Date().getFullYear() + 5);
      fixture.detectChanges();

      const current = buttons().filter((b) =>
        b.classList.contains("tedi-calendar-month-grid__month--current"),
      );
      expect(current.length).toBe(0);
    });
  });
});
