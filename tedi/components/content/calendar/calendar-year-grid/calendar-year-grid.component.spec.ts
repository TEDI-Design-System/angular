import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CalendarYearGridComponent } from "./calendar-year-grid.component";

describe("CalendarYearGridComponent", () => {
  let fixture: ComponentFixture<CalendarYearGridComponent>;
  let component: CalendarYearGridComponent;

  const PAGE_START = 2020;

  function createComponent(): void {
    TestBed.configureTestingModule({
      imports: [CalendarYearGridComponent],
    });
    fixture = TestBed.createComponent(CalendarYearGridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("pageStart", PAGE_START);
    fixture.detectChanges();
  }

  function buttons(): HTMLButtonElement[] {
    return fixture.debugElement
      .queryAll(By.css(".tedi-calendar-year-grid__year"))
      .map((d) => d.nativeElement as HTMLButtonElement);
  }

  beforeEach(() => {
    createComponent();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("grid layout", () => {
    it("renders exactly pageSize cells (default 12)", () => {
      const cells = fixture.debugElement.queryAll(
        By.css(".tedi-calendar-year-grid__cell"),
      );
      expect(cells.length).toBe(12);
      expect(buttons().length).toBe(12);
    });

    it("renders the grid container with role=grid and a single role=row", () => {
      const grid = fixture.debugElement.query(
        By.css(".tedi-calendar-year-grid"),
      );
      expect(grid.nativeElement.getAttribute("role")).toBe("grid");
      const rows = fixture.debugElement.queryAll(
        By.css(".tedi-calendar-year-grid__row"),
      );
      expect(rows.length).toBe(1);
      expect(rows[0].nativeElement.getAttribute("role")).toBe("row");
    });

    it("renders years sequentially starting at pageStart", () => {
      const labels = buttons().map((b) => (b.textContent ?? "").trim());
      expect(labels).toEqual([
        "2020",
        "2021",
        "2022",
        "2023",
        "2024",
        "2025",
        "2026",
        "2027",
        "2028",
        "2029",
        "2030",
        "2031",
      ]);
    });

    it("renders custom pageSize cells", () => {
      fixture.componentRef.setInput("pageSize", 16);
      fixture.detectChanges();

      const all = buttons();
      expect(all.length).toBe(16);
      const labels = all.map((b) => (b.textContent ?? "").trim());
      expect(labels[0]).toBe(String(PAGE_START));
      expect(labels[15]).toBe(String(PAGE_START + 15));
    });
  });

  describe("selectedYear highlighting", () => {
    it("highlights only the matching year with --selected", () => {
      fixture.componentRef.setInput(
        "selectedYear",
        new Date(PAGE_START + 3, 5, 15),
      );
      fixture.detectChanges();

      const all = buttons();
      const selected = all.filter((b) =>
        b.classList.contains("tedi-calendar-year-grid__year--selected"),
      );
      expect(selected.length).toBe(1);
      expect(selected[0]).toBe(all[3]);
      expect(selected[0].getAttribute("aria-selected")).toBe("true");
    });

    it("highlights nothing when selectedYear is null", () => {
      const selected = buttons().filter((b) =>
        b.classList.contains("tedi-calendar-year-grid__year--selected"),
      );
      expect(selected.length).toBe(0);
    });

    it("highlights nothing when selectedYear is outside the page range", () => {
      fixture.componentRef.setInput("selectedYear", new Date(1999, 0, 1));
      fixture.detectChanges();

      const selected = buttons().filter((b) =>
        b.classList.contains("tedi-calendar-year-grid__year--selected"),
      );
      expect(selected.length).toBe(0);
    });
  });

  describe("isYearDisabled predicate", () => {
    it("disables years matching the predicate", () => {
      fixture.componentRef.setInput(
        "isYearDisabled",
        (y: Date) => y.getFullYear() === PAGE_START || y.getFullYear() === PAGE_START + 1,
      );
      fixture.detectChanges();

      const all = buttons();
      expect(all[0].getAttribute("aria-disabled")).toBe("true");
      expect(all[0].classList).toContain(
        "tedi-calendar-year-grid__year--disabled",
      );
      expect(all[1].getAttribute("aria-disabled")).toBe("true");
      expect(all[2].getAttribute("aria-disabled")).toBeNull();
    });

    it("does not emit on click of a disabled year", () => {
      fixture.componentRef.setInput(
        "isYearDisabled",
        (y: Date) => y.getFullYear() === PAGE_START + 3,
      );
      fixture.detectChanges();

      const emit = jest.spyOn(component.yearSelect, "emit");
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
          "tedi-calendar-year-grid__year--disabled",
        );
      }
    });

    it("does not emit on click when inputDisabled is true", () => {
      fixture.componentRef.setInput("inputDisabled", true);
      fixture.detectChanges();

      const emit = jest.spyOn(component.yearSelect, "emit");
      buttons()[5].click();
      expect(emit).not.toHaveBeenCalled();
    });
  });

  describe("yearSelect emission", () => {
    it("emits January 1st Date for an enabled click", () => {
      const emit = jest.spyOn(component.yearSelect, "emit");
      buttons()[6].click();

      expect(emit).toHaveBeenCalledTimes(1);
      const emitted = emit.mock.calls[0][0] as Date;
      expect(emitted).toBeInstanceOf(Date);
      expect(emitted.getFullYear()).toBe(PAGE_START + 6);
      expect(emitted.getMonth()).toBe(0);
      expect(emitted.getDate()).toBe(1);
    });

    it("emits the first year (pageStart) correctly", () => {
      const emit = jest.spyOn(component.yearSelect, "emit");
      buttons()[0].click();

      const emitted = emit.mock.calls[0][0] as Date;
      expect(emitted.getFullYear()).toBe(PAGE_START);
      expect(emitted.getMonth()).toBe(0);
      expect(emitted.getDate()).toBe(1);
    });

    it("emits the last year on the page correctly", () => {
      const emit = jest.spyOn(component.yearSelect, "emit");
      buttons()[11].click();

      const emitted = emit.mock.calls[0][0] as Date;
      expect(emitted.getFullYear()).toBe(PAGE_START + 11);
      expect(emitted.getMonth()).toBe(0);
      expect(emitted.getDate()).toBe(1);
    });
  });

  describe("--current modifier", () => {
    it("applies to today's year when within the page range", () => {
      const now = new Date();
      fixture.componentRef.setInput("pageStart", now.getFullYear() - 2);
      fixture.detectChanges();

      const all = buttons();
      const current = all.filter((b) =>
        b.classList.contains("tedi-calendar-year-grid__year--current"),
      );
      expect(current.length).toBe(1);
      expect(current[0]).toBe(all[2]);
    });

    it("does not apply when current year is outside the page range", () => {
      fixture.componentRef.setInput("pageStart", 1900);
      fixture.detectChanges();

      const current = buttons().filter((b) =>
        b.classList.contains("tedi-calendar-year-grid__year--current"),
      );
      expect(current.length).toBe(0);
    });
  });

  describe("aria attributes use null when inactive", () => {
    it("omits aria-selected attribute on non-selected cells", () => {
      fixture.componentRef.setInput(
        "selectedYear",
        new Date(PAGE_START + 2, 0, 1),
      );
      fixture.detectChanges();

      const all = buttons();
      expect(all[2].getAttribute("aria-selected")).toBe("true");
      expect(all[0].hasAttribute("aria-selected")).toBe(false);
      expect(all[1].hasAttribute("aria-selected")).toBe(false);
      expect(all[5].hasAttribute("aria-selected")).toBe(false);
    });

    it("omits aria-disabled attribute on non-disabled cells", () => {
      fixture.componentRef.setInput(
        "isYearDisabled",
        (y: Date) => y.getFullYear() === PAGE_START + 1,
      );
      fixture.detectChanges();

      const all = buttons();
      expect(all[1].getAttribute("aria-disabled")).toBe("true");
      expect(all[0].hasAttribute("aria-disabled")).toBe(false);
      expect(all[2].hasAttribute("aria-disabled")).toBe(false);
    });
  });
});
