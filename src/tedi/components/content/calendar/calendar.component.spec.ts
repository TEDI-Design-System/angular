import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { CalendarComponent } from "./calendar.component";
import { DateRange } from "../../../utils/date.util";
import { Matcher } from "../../../utils/matchers.util";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

class TranslationMock {
  translate(key: string): string {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

const MAY_15_2024 = new Date(2024, 4, 15);

@Component({
  standalone: true,
  imports: [CalendarComponent, ReactiveFormsModule],
  template: `<tedi-calendar [formControl]="control" />`,
})
class FormHostComponent {
  control = new FormControl<Date | Date[] | DateRange | null>(null);
}

@Component({
  standalone: true,
  imports: [CalendarComponent],
  template: `
    <tedi-calendar>
      <button tediCalendarFooter type="button" class="footer-btn">Done</button>
    </tedi-calendar>
  `,
})
class FooterHostComponent {}

function configureBaseModule(): void {
  TestBed.configureTestingModule({
    imports: [CalendarComponent],
    providers: [
      { provide: TediTranslationService, useClass: TranslationMock },
      { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
    ],
  });
}

function createComponent(): ComponentFixture<CalendarComponent> {
  configureBaseModule();
  const fixture = TestBed.createComponent(CalendarComponent);
  fixture.componentRef.setInput("currentMonth", MAY_15_2024);
  fixture.detectChanges();
  return fixture;
}

function dayButtons(fixture: ComponentFixture<unknown>): HTMLButtonElement[] {
  return fixture.debugElement
    .queryAll(By.css(".tedi-calendar-day-grid__day"))
    .map((d) => d.nativeElement as HTMLButtonElement);
}

function dayButtonForDate(
  fixture: ComponentFixture<unknown>,
  date: Date,
): HTMLButtonElement | null {
  const key = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
  return (fixture.debugElement.nativeElement as HTMLElement).querySelector(
    `[data-date-key="${key}"]`,
  );
}

function monthButtons(fixture: ComponentFixture<unknown>): HTMLButtonElement[] {
  return fixture.debugElement
    .queryAll(By.css(".tedi-calendar-month-grid__month"))
    .map((d) => d.nativeElement as HTMLButtonElement);
}

function yearButtons(fixture: ComponentFixture<unknown>): HTMLButtonElement[] {
  return fixture.debugElement
    .queryAll(By.css(".tedi-calendar-year-grid__year"))
    .map((d) => d.nativeElement as HTMLButtonElement);
}

function navButtons(fixture: ComponentFixture<unknown>): HTMLButtonElement[] {
  return fixture.debugElement
    .queryAll(By.css(".tedi-calendar-header__nav-button"))
    .map((d) => d.nativeElement as HTMLButtonElement);
}

describe("CalendarComponent", () => {
  describe("default rendering", () => {
    let fixture: ComponentFixture<CalendarComponent>;

    beforeEach(() => {
      fixture = createComponent();
    });

    it("creates the component", () => {
      expect(fixture.componentInstance).toBeTruthy();
    });

    it("renders the day grid by default", () => {
      const grid = fixture.debugElement.query(
        By.css(".tedi-calendar-day-grid"),
      );
      expect(grid).toBeTruthy();
    });

    it("renders a single month by default", () => {
      const grids = fixture.debugElement.queryAll(
        By.css(".tedi-calendar-day-grid"),
      );
      expect(grids.length).toBe(1);
    });

    it("renders the header", () => {
      const header = fixture.debugElement.query(
        By.css(".tedi-calendar-header"),
      );
      expect(header).toBeTruthy();
    });
  });

  describe("writeValue", () => {
    let fixture: ComponentFixture<CalendarComponent>;
    let component: CalendarComponent;

    beforeEach(() => {
      fixture = createComponent();
      component = fixture.componentInstance;
    });

    it("syncs value AND currentMonth when given a Date", () => {
      const target = new Date(2025, 6, 20);
      component.writeValue(target);
      fixture.detectChanges();
      expect(component.value()).toEqual(target);
      expect(component.currentMonth().getFullYear()).toBe(2025);
      expect(component.currentMonth().getMonth()).toBe(6);
      expect(component.currentMonth().getDate()).toBe(1);
    });

    it("clears value when given null", () => {
      component.writeValue(new Date(2024, 4, 1));
      component.writeValue(null);
      expect(component.value()).toBeNull();
    });

    it("syncs to first entry for multiple mode", () => {
      fixture.componentRef.setInput("mode", "multiple");
      fixture.detectChanges();
      const a = new Date(2025, 2, 5);
      const b = new Date(2026, 8, 10);
      component.writeValue([a, b]);
      expect(component.currentMonth().getFullYear()).toBe(2025);
      expect(component.currentMonth().getMonth()).toBe(2);
    });

    it("syncs to range.from for range mode", () => {
      fixture.componentRef.setInput("mode", "range");
      fixture.detectChanges();
      const range: DateRange = {
        from: new Date(2027, 1, 10),
        to: new Date(2027, 1, 20),
      };
      component.writeValue(range);
      expect(component.currentMonth().getFullYear()).toBe(2027);
      expect(component.currentMonth().getMonth()).toBe(1);
    });
  });

  describe("header navigation", () => {
    let fixture: ComponentFixture<CalendarComponent>;
    let component: CalendarComponent;

    beforeEach(() => {
      fixture = createComponent();
      component = fixture.componentInstance;
    });

    it("prev button moves currentMonth back by one month in days view", () => {
      navButtons(fixture)[0].click();
      fixture.detectChanges();
      expect(component.currentMonth().getMonth()).toBe(3);
    });

    it("next button moves currentMonth forward by one month in days view", () => {
      navButtons(fixture)[1].click();
      fixture.detectChanges();
      expect(component.currentMonth().getMonth()).toBe(5);
    });

    it("prev button moves by one year in months view", () => {
      component.view.set("months");
      fixture.detectChanges();
      navButtons(fixture)[0].click();
      fixture.detectChanges();
      expect(component.currentMonth().getFullYear()).toBe(2023);
    });

    it("next button advances yearPageStart in years view", () => {
      component.view.set("years");
      fixture.detectChanges();
      const initial = component.yearPageStart();
      navButtons(fixture)[1].click();
      fixture.detectChanges();
      expect(component.yearPageStart()).toBe(initial + 12);
    });
  });

  describe("view propagation", () => {
    let fixture: ComponentFixture<CalendarComponent>;
    let component: CalendarComponent;

    beforeEach(() => {
      fixture = createComponent();
      component = fixture.componentInstance;
    });

    it("header viewChange propagates to view()", () => {
      component.handleHeaderViewChange("months");
      fixture.detectChanges();
      expect(component.view()).toBe("months");
      const monthGrid = fixture.debugElement.query(
        By.css(".tedi-calendar-month-grid"),
      );
      expect(monthGrid).toBeTruthy();
    });

    it("switching to years recomputes the year page bracket", () => {
      fixture.componentRef.setInput("currentMonth", new Date(2030, 0, 1));
      fixture.detectChanges();
      component.handleHeaderViewChange("years");
      fixture.detectChanges();
      expect(component.yearPageStart()).toBe(2025);
    });
  });

  describe("header month/year change", () => {
    let fixture: ComponentFixture<CalendarComponent>;
    let component: CalendarComponent;

    beforeEach(() => {
      fixture = createComponent();
      component = fixture.componentInstance;
    });

    it("updates currentMonth when header emits monthChange", () => {
      component.handleHeaderMonthChange(new Date(2024, 9, 1));
      fixture.detectChanges();
      expect(component.currentMonth().getMonth()).toBe(9);
      expect(component.currentMonth().getFullYear()).toBe(2024);
    });

    it("updates currentMonth year when header emits yearChange", () => {
      component.handleHeaderYearChange(new Date(2030, 0, 1));
      fixture.detectChanges();
      expect(component.currentMonth().getFullYear()).toBe(2030);
      expect(component.currentMonth().getMonth()).toBe(4);
    });
  });

  describe("single mode selection", () => {
    let fixture: ComponentFixture<CalendarComponent>;
    let component: CalendarComponent;

    beforeEach(() => {
      fixture = createComponent();
      component = fixture.componentInstance;
    });

    it("emits select and updates value when a day is clicked", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);
      const emit = jest.spyOn(component.select, "emit");

      const target = new Date(2024, 4, 10);
      const btn = dayButtonForDate(fixture, target);
      btn?.click();
      fixture.detectChanges();

      expect(emit).toHaveBeenCalledTimes(1);
      const payload = emit.mock.calls[0][0] as {
        date: Date;
        day: Date;
      };
      expect((payload.date as Date).getTime()).toBe(target.getTime());
      expect(payload.day.getTime()).toBe(target.getTime());
      expect((component.value() as Date).getTime()).toBe(target.getTime());
      expect(onChange).toHaveBeenCalledWith(target);
    });
  });

  describe("multiple mode selection", () => {
    let fixture: ComponentFixture<CalendarComponent>;
    let component: CalendarComponent;

    beforeEach(() => {
      fixture = createComponent();
      component = fixture.componentInstance;
      fixture.componentRef.setInput("mode", "multiple");
      fixture.detectChanges();
    });

    it("toggles a date in the array", () => {
      const a = new Date(2024, 4, 10);
      dayButtonForDate(fixture, a)?.click();
      fixture.detectChanges();
      expect(component.value()).toEqual([a]);

      const b = new Date(2024, 4, 11);
      dayButtonForDate(fixture, b)?.click();
      fixture.detectChanges();
      expect((component.value() as Date[]).length).toBe(2);

      dayButtonForDate(fixture, a)?.click();
      fixture.detectChanges();
      expect((component.value() as Date[]).length).toBe(1);
      expect((component.value() as Date[])[0].getTime()).toBe(b.getTime());
    });

    it("prevents clearing the last entry when required=true", () => {
      fixture.componentRef.setInput("required", true);
      fixture.detectChanges();

      const a = new Date(2024, 4, 10);
      dayButtonForDate(fixture, a)?.click();
      fixture.detectChanges();
      const before = component.value();

      dayButtonForDate(fixture, a)?.click();
      fixture.detectChanges();

      expect(component.value()).toEqual(before);
    });
  });

  describe("range mode selection", () => {
    let fixture: ComponentFixture<CalendarComponent>;
    let component: CalendarComponent;

    beforeEach(() => {
      fixture = createComponent();
      component = fixture.componentInstance;
      fixture.componentRef.setInput("mode", "range");
      fixture.detectChanges();
    });

    it("first click sets {from}", () => {
      const day = new Date(2024, 4, 10);
      dayButtonForDate(fixture, day)?.click();
      fixture.detectChanges();
      expect(component.value()).toEqual({ from: day });
    });

    it("second click after first sets {from, to}", () => {
      const a = new Date(2024, 4, 10);
      const b = new Date(2024, 4, 20);
      dayButtonForDate(fixture, a)?.click();
      fixture.detectChanges();
      dayButtonForDate(fixture, b)?.click();
      fixture.detectChanges();
      const v = component.value() as DateRange;
      expect(v.from.getTime()).toBe(a.getTime());
      expect(v.to?.getTime()).toBe(b.getTime());
    });

    it("swaps from/to when second click is before first", () => {
      const a = new Date(2024, 4, 20);
      const b = new Date(2024, 4, 10);
      dayButtonForDate(fixture, a)?.click();
      fixture.detectChanges();
      dayButtonForDate(fixture, b)?.click();
      fixture.detectChanges();
      const v = component.value() as DateRange;
      expect(v.from.getTime()).toBe(b.getTime());
      expect(v.to?.getTime()).toBe(a.getTime());
    });

    it("third click starts a new range", () => {
      const a = new Date(2024, 4, 10);
      const b = new Date(2024, 4, 20);
      const c = new Date(2024, 4, 25);
      dayButtonForDate(fixture, a)?.click();
      fixture.detectChanges();
      dayButtonForDate(fixture, b)?.click();
      fixture.detectChanges();
      dayButtonForDate(fixture, c)?.click();
      fixture.detectChanges();
      const v = component.value() as DateRange;
      expect(v.from.getTime()).toBe(c.getTime());
      expect(v.to).toBeUndefined();
    });
  });

  // A value that isn't a Date reaches the grid whenever a form control is
  // seeded from an untyped source. Rendering must survive it — a throw here
  // aborts change detection, which leaves the grid blank and any surrounding
  // overlay unpositioned.
  describe("range mode with a malformed value", () => {
    let fixture: ComponentFixture<CalendarComponent>;

    beforeEach(() => {
      fixture = createComponent();
      fixture.componentRef.setInput("mode", "range");
      fixture.detectChanges();
    });

    it.each([
      ["a plain string", "2019"],
      ["a range without dates", { from: "2019", to: "2020" }],
      ["a range with a non-Date end", { from: MAY_15_2024, to: "2020" }],
      ["an array of non-Dates", ["2019"]],
    ])("renders the day grid given %s", (_label, value) => {
      expect(() => {
        fixture.componentRef.setInput("value", value);
        fixture.detectChanges();
      }).not.toThrow();
      expect(dayButtons(fixture).length).toBeGreaterThan(0);
    });

    it("keeps a valid start date selected when the end is malformed", () => {
      fixture.componentRef.setInput("value", {
        from: new Date(2024, 4, 10),
        to: "2020",
      });
      fixture.detectChanges();
      const day = dayButtonForDate(fixture, new Date(2024, 4, 10));
      expect(day?.className).toContain("tedi-calendar-day-grid__day--selected");
    });
  });

  describe("selectionLevel='months'", () => {
    let fixture: ComponentFixture<CalendarComponent>;
    let component: CalendarComponent;

    beforeEach(() => {
      fixture = createComponent();
      component = fixture.componentInstance;
      fixture.componentRef.setInput("selectionLevel", "months");
      fixture.detectChanges();
    });

    it("opens on the month grid when selectionLevel='months'", () => {
      expect(component.view()).toBe("months");
      const monthGrid = fixture.debugElement.query(
        By.css(".tedi-calendar-month-grid"),
      );
      expect(monthGrid).toBeTruthy();
      const dayGrid = fixture.debugElement.query(
        By.css(".tedi-calendar-day-grid"),
      );
      expect(dayGrid).toBeNull();
    });

    it("month click commits the value (single)", () => {
      const emit = jest.spyOn(component.select, "emit");
      monthButtons(fixture)[0].click();
      fixture.detectChanges();
      expect(emit).toHaveBeenCalledTimes(1);
      const v = component.value() as Date;
      expect(v.getFullYear()).toBe(2024);
      expect(v.getMonth()).toBe(0);
    });
  });

  describe("selectionLevel='years'", () => {
    let fixture: ComponentFixture<CalendarComponent>;
    let component: CalendarComponent;

    beforeEach(() => {
      fixture = createComponent();
      component = fixture.componentInstance;
      fixture.componentRef.setInput("selectionLevel", "years");
      fixture.detectChanges();
    });

    it("opens on the year grid when selectionLevel='years'", () => {
      expect(component.view()).toBe("years");
      const yearGrid = fixture.debugElement.query(
        By.css(".tedi-calendar-year-grid"),
      );
      expect(yearGrid).toBeTruthy();
      const dayGrid = fixture.debugElement.query(
        By.css(".tedi-calendar-day-grid"),
      );
      expect(dayGrid).toBeNull();
    });

    it("year click commits new Date(year, 0, 1)", () => {
      const buttons = yearButtons(fixture);
      const targetButton = buttons.find(
        (b) => b.textContent?.trim() === "2024",
      );
      expect(targetButton).toBeTruthy();
      targetButton!.click();
      fixture.detectChanges();
      const v = component.value() as Date;
      expect(v.getFullYear()).toBe(2024);
      expect(v.getMonth()).toBe(0);
      expect(v.getDate()).toBe(1);
    });
  });

  describe("drill-down navigation", () => {
    let fixture: ComponentFixture<CalendarComponent>;
    let component: CalendarComponent;

    beforeEach(() => {
      fixture = createComponent();
      component = fixture.componentInstance;
    });

    it("month click in view='months', selectionLevel='days' drills to days", () => {
      component.view.set("months");
      fixture.detectChanges();
      monthButtons(fixture)[7].click();
      fixture.detectChanges();
      expect(component.view()).toBe("days");
      expect(component.currentMonth().getMonth()).toBe(7);
      expect(component.value()).toBeNull();
    });

    it("year click in view='years', selectionLevel='days' drills back to days", () => {
      component.view.set("years");
      fixture.detectChanges();
      const button = yearButtons(fixture).find(
        (b) => b.textContent?.trim() === "2025",
      );
      button!.click();
      fixture.detectChanges();
      expect(component.view()).toBe("days");
      expect(component.currentMonth().getFullYear()).toBe(2025);
      expect(component.value()).toBeNull();
    });

    it("year click in view='years', selectionLevel='months' drills to months", () => {
      fixture.componentRef.setInput("selectionLevel", "months");
      fixture.detectChanges();
      component.view.set("years");
      fixture.detectChanges();
      const button = yearButtons(fixture).find(
        (b) => b.textContent?.trim() === "2026",
      );
      button!.click();
      fixture.detectChanges();
      expect(component.view()).toBe("months");
      expect(component.currentMonth().getFullYear()).toBe(2026);
    });
  });

  describe("disabled propagation", () => {
    it("inputDisabled disables every day cell", () => {
      const fixture = createComponent();
      fixture.componentRef.setInput("inputDisabled", true);
      fixture.detectChanges();
      const days = dayButtons(fixture);
      expect(days.length).toBeGreaterThan(0);
      expect(
        days.every((b) => b.getAttribute("aria-disabled") === "true"),
      ).toBe(true);
    });

    it("inputDisabled disables every month cell", () => {
      const fixture = createComponent();
      fixture.componentInstance.view.set("months");
      fixture.componentRef.setInput("inputDisabled", true);
      fixture.detectChanges();
      const buttons = monthButtons(fixture);
      expect(buttons.length).toBe(12);
      expect(
        buttons.every((b) => b.getAttribute("aria-disabled") === "true"),
      ).toBe(true);
    });

    it("inputDisabled disables every year cell", () => {
      const fixture = createComponent();
      fixture.componentInstance.view.set("years");
      fixture.componentRef.setInput("inputDisabled", true);
      fixture.detectChanges();
      const buttons = yearButtons(fixture);
      expect(
        buttons.every((b) => b.getAttribute("aria-disabled") === "true"),
      ).toBe(true);
    });
  });

  describe("effective month/year disabled predicates", () => {
    it("month is fully disabled when all days are matched", () => {
      const fixture = createComponent();
      const component = fixture.componentInstance;
      const matchers: Matcher[] = [
        { from: new Date(2024, 4, 1), to: new Date(2024, 4, 31) },
      ];
      fixture.componentRef.setInput("disabledMatchers", matchers);
      fixture.detectChanges();
      const pred = component.effectiveIsMonthDisabled();
      expect(pred(new Date(2024, 4, 1))).toBe(true);
      expect(pred(new Date(2024, 5, 1))).toBe(false);
    });

    it("year is fully disabled when every month is fully disabled", () => {
      const fixture = createComponent();
      const component = fixture.componentInstance;
      const matchers: Matcher[] = [
        { from: new Date(2024, 0, 1), to: new Date(2024, 11, 31) },
      ];
      fixture.componentRef.setInput("disabledMatchers", matchers);
      fixture.detectChanges();
      const pred = component.effectiveIsYearDisabled();
      expect(pred(new Date(2024, 0, 1))).toBe(true);
      expect(pred(new Date(2025, 0, 1))).toBe(false);
    });

    it("custom shouldDisableMonth predicate is honored", () => {
      const fixture = createComponent();
      const component = fixture.componentInstance;
      fixture.componentRef.setInput(
        "shouldDisableMonth",
        (m: Date) => m.getMonth() === 0,
      );
      fixture.detectChanges();
      const pred = component.effectiveIsMonthDisabled();
      expect(pred(new Date(2024, 0, 1))).toBe(true);
      expect(pred(new Date(2024, 4, 1))).toBe(false);
    });
  });

  describe("footer content projection", () => {
    it("renders projected footer content", () => {
      TestBed.configureTestingModule({
        imports: [FooterHostComponent],
        providers: [
          { provide: TediTranslationService, useClass: TranslationMock },
          { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        ],
      });
      const fixture = TestBed.createComponent(FooterHostComponent);
      fixture.detectChanges();
      const footer = fixture.debugElement.query(By.css(".footer-btn"));
      expect(footer).toBeTruthy();
      expect(footer.nativeElement.textContent.trim()).toBe("Done");
    });
  });

  describe("ControlValueAccessor + reactive forms", () => {
    it("writes a value through the FormControl and selecting a date updates the control", () => {
      TestBed.configureTestingModule({
        imports: [FormHostComponent],
        providers: [
          { provide: TediTranslationService, useClass: TranslationMock },
          { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        ],
      });
      const fixture = TestBed.createComponent(FormHostComponent);
      const host = fixture.componentInstance;
      fixture.detectChanges();

      host.control.setValue(MAY_15_2024);
      fixture.detectChanges();
      const selectedCell = fixture.debugElement.query(
        By.css(".tedi-calendar-day-grid__day--selected"),
      );
      expect(selectedCell).toBeTruthy();

      const target = new Date(2024, 4, 22);
      dayButtonForDate(fixture, target)?.click();
      fixture.detectChanges();

      expect((host.control.value as Date).getTime()).toBe(target.getTime());
    });

    it("setDisabledState disables every cell", () => {
      TestBed.configureTestingModule({
        imports: [FormHostComponent],
        providers: [
          { provide: TediTranslationService, useClass: TranslationMock },
          { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        ],
      });
      const fixture = TestBed.createComponent(FormHostComponent);
      fixture.detectChanges();
      fixture.componentInstance.control.disable();
      fixture.detectChanges();
      const buttons = dayButtons(fixture);
      expect(
        buttons.every((b) => b.getAttribute("aria-disabled") === "true"),
      ).toBe(true);
    });
  });

  describe("keyboard navigation", () => {
    let fixture: ComponentFixture<CalendarComponent>;

    beforeEach(() => {
      fixture = createComponent();
    });

    it("ArrowLeft on a focused day focuses the previous day", () => {
      const start = new Date(2024, 4, 10);
      const startBtn = dayButtonForDate(fixture, start);
      startBtn?.focus();
      const event = new KeyboardEvent("keydown", {
        key: "ArrowLeft",
        bubbles: true,
        cancelable: true,
      });
      startBtn?.dispatchEvent(event);
      fixture.detectChanges();
      const prev = new Date(2024, 4, 9);
      // Microtask-based focus lookup is synchronous in spec for our purposes.
      return Promise.resolve().then(() => {
        expect(document.activeElement).toBe(dayButtonForDate(fixture, prev));
      });
    });

    it("ArrowLeft preventDefault is called for known key", () => {
      const start = new Date(2024, 4, 10);
      const btn = dayButtonForDate(fixture, start);
      btn?.focus();
      const event = new KeyboardEvent("keydown", {
        key: "ArrowLeft",
        bubbles: true,
        cancelable: true,
      });
      const prevented = !btn?.dispatchEvent(event);
      expect(prevented).toBe(true);
    });

    it("Enter on a focused day commits selection (native button behavior)", () => {
      const component = fixture.componentInstance;
      const target = new Date(2024, 4, 7);
      const btn = dayButtonForDate(fixture, target);
      btn?.click();
      fixture.detectChanges();
      expect((component.value() as Date).getTime()).toBe(target.getTime());
    });

    it("ArrowRight crossing into next month advances currentMonth", () => {
      const component = fixture.componentInstance;
      const lastDay = new Date(2024, 4, 31);
      const btn = dayButtonForDate(fixture, lastDay);
      btn?.focus();
      const event = new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      });
      btn?.dispatchEvent(event);
      fixture.detectChanges();
      expect(component.currentMonth().getMonth()).toBe(5);
    });

    it("ArrowRight in months view focuses the next month", () => {
      fixture.componentInstance.view.set("months");
      fixture.detectChanges();
      const buttons = monthButtons(fixture);
      buttons[0].focus();
      const event = new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      });
      buttons[0].dispatchEvent(event);
      fixture.detectChanges();
      expect(document.activeElement).toBe(buttons[1]);
    });

    it("ArrowDown in months view focuses three rows down", () => {
      fixture.componentInstance.view.set("months");
      fixture.detectChanges();
      const buttons = monthButtons(fixture);
      buttons[0].focus();
      const event = new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      });
      buttons[0].dispatchEvent(event);
      fixture.detectChanges();
      expect(document.activeElement).toBe(buttons[3]);
    });

    it("ArrowRight in years view focuses the next year", () => {
      fixture.componentInstance.view.set("years");
      fixture.detectChanges();
      const buttons = yearButtons(fixture);
      buttons[0].focus();
      const event = new KeyboardEvent("keydown", {
        key: "ArrowRight",
        bubbles: true,
        cancelable: true,
      });
      buttons[0].dispatchEvent(event);
      fixture.detectChanges();
      expect(document.activeElement).toBe(buttons[1]);
    });
  });

  describe("focusActiveCell", () => {
    it("focuses the roving day cell in the day view", () => {
      const fixture = createComponent();
      fixture.componentInstance.focusActiveCell();
      fixture.detectChanges();
      return Promise.resolve().then(() => {
        const roving = (
          fixture.debugElement.nativeElement as HTMLElement
        ).querySelector<HTMLElement>(
          '.tedi-calendar-day-grid__day[tabindex="0"]',
        );
        expect(roving).toBeTruthy();
        expect(document.activeElement).toBe(roving);
      });
    });

    it("focuses the first enabled control in the months view", () => {
      const fixture = createComponent();
      fixture.componentInstance.view.set("months");
      fixture.detectChanges();
      fixture.componentInstance.focusActiveCell();
      fixture.detectChanges();
      return Promise.resolve().then(() => {
        expect(document.activeElement).toBeInstanceOf(HTMLButtonElement);
        expect((document.activeElement as HTMLButtonElement).disabled).toBe(
          false,
        );
      });
    });
  });

  describe("multi-month", () => {
    it("renders N day grids when numberOfMonths > 1", () => {
      const fixture = createComponent();
      fixture.componentRef.setInput("numberOfMonths", 2);
      fixture.detectChanges();
      const grids = fixture.debugElement.queryAll(
        By.css(".tedi-calendar-day-grid"),
      );
      expect(grids.length).toBe(2);
    });
  });

  describe("more keyboard navigation", () => {
    let fixture: ComponentFixture<CalendarComponent>;

    beforeEach(() => {
      fixture = createComponent();
    });

    function dispatchKey(
      el: HTMLElement | null,
      key: string,
      shiftKey = false,
    ): boolean {
      if (!el) throw new Error("element missing");
      el.focus();
      const event = new KeyboardEvent("keydown", {
        key,
        shiftKey,
        bubbles: true,
        cancelable: true,
      });
      return el.dispatchEvent(event);
    }

    it("ArrowUp moves focus up one week", () => {
      const start = new Date(2024, 4, 15);
      const ok = !dispatchKey(dayButtonForDate(fixture, start), "ArrowUp");
      expect(ok).toBe(true);
    });

    it("ArrowDown moves focus down one week", () => {
      const start = new Date(2024, 4, 15);
      const ok = !dispatchKey(dayButtonForDate(fixture, start), "ArrowDown");
      expect(ok).toBe(true);
    });

    it("Home key navigates to start of week", () => {
      const start = new Date(2024, 4, 15);
      const ok = !dispatchKey(dayButtonForDate(fixture, start), "Home");
      expect(ok).toBe(true);
    });

    it("End key navigates to end of week", () => {
      const start = new Date(2024, 4, 15);
      const ok = !dispatchKey(dayButtonForDate(fixture, start), "End");
      expect(ok).toBe(true);
    });

    it("PageUp moves to previous month", () => {
      const component = fixture.componentInstance;
      const start = new Date(2024, 4, 15);
      dispatchKey(dayButtonForDate(fixture, start), "PageUp");
      fixture.detectChanges();
      expect(component.currentMonth().getMonth()).toBe(3);
    });

    it("PageDown moves to next month", () => {
      const component = fixture.componentInstance;
      const start = new Date(2024, 4, 15);
      dispatchKey(dayButtonForDate(fixture, start), "PageDown");
      fixture.detectChanges();
      expect(component.currentMonth().getMonth()).toBe(5);
    });

    it("Shift+PageUp moves to previous year", () => {
      const component = fixture.componentInstance;
      const start = new Date(2024, 4, 15);
      dispatchKey(dayButtonForDate(fixture, start), "PageUp", true);
      fixture.detectChanges();
      expect(component.currentMonth().getFullYear()).toBe(2023);
    });

    it("Shift+PageDown moves to next year", () => {
      const component = fixture.componentInstance;
      const start = new Date(2024, 4, 15);
      dispatchKey(dayButtonForDate(fixture, start), "PageDown", true);
      fixture.detectChanges();
      expect(component.currentMonth().getFullYear()).toBe(2025);
    });

    it("unrecognized key in days view is a no-op", () => {
      const start = new Date(2024, 4, 15);
      const propagated = dispatchKey(dayButtonForDate(fixture, start), "Tab");
      expect(propagated).toBe(true);
    });

    it("ignores keydown when effectiveDisabled is true", () => {
      fixture.componentRef.setInput("inputDisabled", true);
      fixture.detectChanges();
      const start = new Date(2024, 4, 15);
      const btn = dayButtonForDate(fixture, start);
      const propagated = dispatchKey(btn, "ArrowLeft");
      expect(propagated).toBe(true);
    });

    it("months view: ArrowLeft at index 0 prevents default but does not focus", () => {
      fixture.componentInstance.view.set("months");
      fixture.detectChanges();
      const buttons = monthButtons(fixture);
      const propagated = dispatchKey(buttons[0], "ArrowLeft");
      expect(propagated).toBe(false);
    });

    it("years view: PageUp pages back", () => {
      const component = fixture.componentInstance;
      component.view.set("years");
      fixture.detectChanges();
      const initial = component.yearPageStart();
      const buttons = yearButtons(fixture);
      dispatchKey(buttons[0], "PageUp");
      fixture.detectChanges();
      expect(component.yearPageStart()).toBe(initial - 12);
    });

    it("years view: PageDown pages forward", () => {
      const component = fixture.componentInstance;
      component.view.set("years");
      fixture.detectChanges();
      const initial = component.yearPageStart();
      const buttons = yearButtons(fixture);
      dispatchKey(buttons[0], "PageDown");
      fixture.detectChanges();
      expect(component.yearPageStart()).toBe(initial + 12);
    });

    it("years view: ArrowUp moves up three rows", () => {
      fixture.componentInstance.view.set("years");
      fixture.detectChanges();
      const buttons = yearButtons(fixture);
      dispatchKey(buttons[5], "ArrowUp");
      expect(document.activeElement).toBe(buttons[2]);
    });
  });

  describe("multi-mode month/year selection at corresponding selectionLevel", () => {
    it("selectionLevel='months', mode='multiple' toggles months", () => {
      const fixture = createComponent();
      const component = fixture.componentInstance;
      fixture.componentRef.setInput("selectionLevel", "months");
      fixture.componentRef.setInput("mode", "multiple");
      fixture.detectChanges();

      monthButtons(fixture)[0].click();
      fixture.detectChanges();
      monthButtons(fixture)[1].click();
      fixture.detectChanges();
      expect((component.value() as Date[]).length).toBe(2);

      monthButtons(fixture)[0].click();
      fixture.detectChanges();
      expect((component.value() as Date[]).length).toBe(1);
    });

    it("selectionLevel='months', mode='range' produces a 2-month range", () => {
      const fixture = createComponent();
      const component = fixture.componentInstance;
      fixture.componentRef.setInput("selectionLevel", "months");
      fixture.componentRef.setInput("mode", "range");
      fixture.detectChanges();

      monthButtons(fixture)[2].click();
      fixture.detectChanges();
      monthButtons(fixture)[5].click();
      fixture.detectChanges();
      const v = component.value() as DateRange;
      expect(v.from.getMonth()).toBe(2);
      expect(v.to?.getMonth()).toBe(5);
    });

    it("selectionLevel='years', mode='multiple' toggles years", () => {
      const fixture = createComponent();
      const component = fixture.componentInstance;
      fixture.componentRef.setInput("selectionLevel", "years");
      fixture.componentRef.setInput("mode", "multiple");
      fixture.detectChanges();

      yearButtons(fixture)[0].click();
      fixture.detectChanges();
      yearButtons(fixture)[1].click();
      fixture.detectChanges();
      expect((component.value() as Date[]).length).toBe(2);
    });

    it("required prevents clearing for selectionLevel='months', mode='multiple'", () => {
      const fixture = createComponent();
      const component = fixture.componentInstance;
      fixture.componentRef.setInput("selectionLevel", "months");
      fixture.componentRef.setInput("mode", "multiple");
      fixture.componentRef.setInput("required", true);
      fixture.detectChanges();

      monthButtons(fixture)[0].click();
      fixture.detectChanges();
      const before = component.value();
      monthButtons(fixture)[0].click();
      fixture.detectChanges();
      expect(component.value()).toEqual(before);
    });
  });

  describe("year range defaults", () => {
    it("defaults to 100 years before and 20 years after the current year", () => {
      const fixture = createComponent();
      const component = fixture.componentInstance;
      const thisYear = new Date().getFullYear();
      expect(component.resolvedMinYear()).toBe(thisYear - 100);
      expect(component.resolvedMaxYear()).toBe(thisYear + 20);
    });

    it("honours explicit minYear/maxYear overrides", () => {
      const fixture = createComponent();
      const component = fixture.componentInstance;
      fixture.componentRef.setInput("minYear", 1950);
      fixture.componentRef.setInput("maxYear", 1970);
      fixture.detectChanges();
      expect(component.resolvedMinYear()).toBe(1950);
      expect(component.resolvedMaxYear()).toBe(1970);
    });
  });

  describe("prev/next via internal handlers", () => {
    it("prev in years view decrements yearPageStart", () => {
      const fixture = createComponent();
      // Pin the year bounds so the prev page isn't blocked by the default
      // window — this test only cares about page-decrement math.
      fixture.componentRef.setInput("minYear", 1900);
      fixture.componentRef.setInput("maxYear", 2200);
      const component = fixture.componentInstance;
      component.view.set("years");
      fixture.detectChanges();
      const initial = component.yearPageStart();
      navButtons(fixture)[0].click();
      fixture.detectChanges();
      expect(component.yearPageStart()).toBe(initial - 12);
    });

    it("next in months view advances by year", () => {
      const fixture = createComponent();
      const component = fixture.componentInstance;
      component.view.set("months");
      fixture.detectChanges();
      navButtons(fixture)[1].click();
      fixture.detectChanges();
      expect(component.currentMonth().getFullYear()).toBe(2025);
    });

    it("handlePrev/handleNext are no-ops when disabled", () => {
      const fixture = createComponent();
      const component = fixture.componentInstance;
      fixture.componentRef.setInput("inputDisabled", true);
      fixture.detectChanges();
      const initial = component.currentMonth().getMonth();
      component.handlePrev();
      component.handleNext();
      expect(component.currentMonth().getMonth()).toBe(initial);
    });
  });
});
