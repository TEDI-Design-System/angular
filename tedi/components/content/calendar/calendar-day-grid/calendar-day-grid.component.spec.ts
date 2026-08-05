import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CalendarDayGridComponent } from "./calendar-day-grid.component";
import { DateRange } from "../../../../utils/date.util";
import { Matcher } from "../../../../utils/matchers.util";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";

class TranslationMock {
  translate(key: string): string {
    return key;
  }
  track(key: string): () => string {
    return () => key;
  }
}

describe("CalendarDayGridComponent", () => {
  let fixture: ComponentFixture<CalendarDayGridComponent>;
  let component: CalendarDayGridComponent;

  const MAY_2024 = new Date(2024, 4, 15);

  function createComponent(): void {
    TestBed.configureTestingModule({
      imports: [CalendarDayGridComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });
    fixture = TestBed.createComponent(CalendarDayGridComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("month", MAY_2024);
    fixture.componentRef.setInput("firstDayOfWeek", 1);
    fixture.detectChanges();
  }

  function buttons(): HTMLButtonElement[] {
    return fixture.debugElement
      .queryAll(By.css(".tedi-calendar-day-grid__day"))
      .map((d) => d.nativeElement as HTMLButtonElement);
  }

  function buttonForDay(day: Date): HTMLButtonElement | null {
    return (
      fixture.debugElement.nativeElement as HTMLElement
    ).querySelector<HTMLButtonElement>(`[data-date-key="${day.getTime()}"]`);
  }

  function hasAnyPreviewClass(): boolean {
    return (
      buttons().some((b) =>
        b.classList.contains("tedi-calendar-day-grid__day--range-preview-end"),
      ) ||
      buttons().some((b) =>
        b.classList.contains(
          "tedi-calendar-day-grid__day--range-preview-middle",
        ),
      )
    );
  }

  beforeEach(() => {
    createComponent();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("grid layout", () => {
    it("renders 6 rows of 7 cells", () => {
      const rows = fixture.debugElement.queryAll(
        By.css(".tedi-calendar-day-grid__row"),
      );
      expect(rows.length).toBe(6);
      for (const row of rows) {
        const cells = row.queryAll(By.css(".tedi-calendar-day-grid__cell"));
        expect(cells.length).toBe(7);
      }
    });

    it("renders 7 weekday headers respecting firstDayOfWeek=1 (Mon-first)", () => {
      const headers = fixture.debugElement
        .queryAll(By.css(".tedi-calendar-day-grid__weekday"))
        .map((d) => (d.nativeElement.textContent as string).trim());
      expect(headers.length).toBe(7);
      const monFirst = headers[0];

      fixture.componentRef.setInput("firstDayOfWeek", 0);
      fixture.detectChanges();
      const headersSunFirst = fixture.debugElement
        .queryAll(By.css(".tedi-calendar-day-grid__weekday"))
        .map((d) => (d.nativeElement.textContent as string).trim());
      expect(headersSunFirst[0]).not.toEqual(monFirst);
      expect(headersSunFirst[1]).toEqual(monFirst);
    });

    it("renders outside-month days as buttons when showOutsideDays=true", () => {
      const outside = fixture.debugElement.queryAll(
        By.css(".tedi-calendar-day-grid__day--outside"),
      );
      expect(outside.length).toBeGreaterThan(0);
    });

    it("renders outside-month cells as empty when showOutsideDays=false", () => {
      fixture.componentRef.setInput("showOutsideDays", false);
      fixture.detectChanges();
      const outside = fixture.debugElement.queryAll(
        By.css(".tedi-calendar-day-grid__day--outside"),
      );
      expect(outside.length).toBe(0);

      const emptyCells = fixture.debugElement
        .queryAll(By.css(".tedi-calendar-day-grid__cell"))
        .filter(
          (cell) =>
            cell.queryAll(By.css(".tedi-calendar-day-grid__day")).length === 0,
        );
      expect(emptyCells.length).toBeGreaterThan(0);
    });

    it("renders week-number column when showWeekNumbers=true", () => {
      expect(
        fixture.debugElement.queryAll(
          By.css(".tedi-calendar-day-grid__week-number"),
        ).length,
      ).toBe(0);

      fixture.componentRef.setInput("showWeekNumbers", true);
      fixture.detectChanges();

      const weekNumbers = fixture.debugElement.queryAll(
        By.css(".tedi-calendar-day-grid__week-number"),
      );
      expect(weekNumbers.length).toBe(6);
      for (const weekNumber of weekNumbers) {
        const value = Number(
          (weekNumber.nativeElement.textContent as string).trim(),
        );
        expect(Number.isInteger(value)).toBe(true);
        expect(value).toBeGreaterThan(0);
      }
    });
  });

  describe("selection — single mode", () => {
    it("marks the selected date with --selected", () => {
      fixture.componentRef.setInput("value", new Date(2024, 4, 15));
      fixture.detectChanges();

      const selected = buttonForDay(new Date(2024, 4, 15));
      expect(selected).not.toBeNull();
      expect(selected?.classList).toContain(
        "tedi-calendar-day-grid__day--selected",
      );
      expect(selected?.getAttribute("aria-selected")).toBe("true");
    });
  });

  describe("selection — multiple mode", () => {
    it("marks all dates in the value array", () => {
      fixture.componentRef.setInput("mode", "multiple");
      fixture.componentRef.setInput("value", [
        new Date(2024, 4, 10),
        new Date(2024, 4, 20),
      ]);
      fixture.detectChanges();

      expect(
        buttonForDay(new Date(2024, 4, 10))?.classList.contains(
          "tedi-calendar-day-grid__day--selected",
        ),
      ).toBe(true);
      expect(
        buttonForDay(new Date(2024, 4, 20))?.classList.contains(
          "tedi-calendar-day-grid__day--selected",
        ),
      ).toBe(true);
      expect(
        buttonForDay(new Date(2024, 4, 15))?.classList.contains(
          "tedi-calendar-day-grid__day--selected",
        ),
      ).toBe(false);
    });
  });

  describe("selection — range mode", () => {
    it("marks only --selected (fully rounded) when only from is set", () => {
      fixture.componentRef.setInput("mode", "range");
      const range: DateRange = { from: new Date(2024, 4, 10) };
      fixture.componentRef.setInput("value", range);
      fixture.detectChanges();

      const fromBtn = buttonForDay(new Date(2024, 4, 10));
      expect(fromBtn?.classList).not.toContain(
        "tedi-calendar-day-grid__day--range-start",
      );
      expect(fromBtn?.classList).toContain(
        "tedi-calendar-day-grid__day--selected",
      );
    });

    it("marks only --selected (fully rounded) when from and to are the same day", () => {
      fixture.componentRef.setInput("mode", "range");
      const range: DateRange = {
        from: new Date(2024, 4, 10),
        to: new Date(2024, 4, 10),
      };
      fixture.componentRef.setInput("value", range);
      fixture.detectChanges();

      const fromBtn = buttonForDay(new Date(2024, 4, 10));
      expect(fromBtn?.classList).not.toContain(
        "tedi-calendar-day-grid__day--range-start",
      );
      expect(fromBtn?.classList).not.toContain(
        "tedi-calendar-day-grid__day--range-end",
      );
      expect(fromBtn?.classList).toContain(
        "tedi-calendar-day-grid__day--selected",
      );
    });

    it("marks --range-start, --range-end and --range-middle when from+to are set", () => {
      fixture.componentRef.setInput("mode", "range");
      const range: DateRange = {
        from: new Date(2024, 4, 10),
        to: new Date(2024, 4, 14),
      };
      fixture.componentRef.setInput("value", range);
      fixture.detectChanges();

      expect(
        buttonForDay(new Date(2024, 4, 10))?.classList.contains(
          "tedi-calendar-day-grid__day--range-start",
        ),
      ).toBe(true);
      expect(
        buttonForDay(new Date(2024, 4, 14))?.classList.contains(
          "tedi-calendar-day-grid__day--range-end",
        ),
      ).toBe(true);
      for (const d of [11, 12, 13]) {
        expect(
          buttonForDay(new Date(2024, 4, d))?.classList.contains(
            "tedi-calendar-day-grid__day--range-middle",
          ),
        ).toBe(true);
      }
    });
  });

  describe("disabled cells via disabledMatchers", () => {
    it("renders disabled buttons", () => {
      const matchers: Matcher[] = [new Date(2024, 4, 15)];
      fixture.componentRef.setInput("disabledMatchers", matchers);
      fixture.detectChanges();

      const btn = buttonForDay(new Date(2024, 4, 15));
      expect(btn?.getAttribute("aria-disabled")).toBe("true");
      expect(btn?.classList).toContain("tedi-calendar-day-grid__day--disabled");
    });
  });

  describe("availableDays / unavailableDays", () => {
    it("disables non-available days when availableDays is provided", () => {
      const available = [new Date(2024, 4, 10), new Date(2024, 4, 11)];
      fixture.componentRef.setInput("availableDays", available);
      fixture.detectChanges();

      const includedBtn = buttonForDay(new Date(2024, 4, 10));
      expect(includedBtn?.getAttribute("aria-disabled")).toBeNull();
      expect(includedBtn?.classList).toContain(
        "tedi-calendar-day-grid__day--available-day",
      );

      const excludedBtn = buttonForDay(new Date(2024, 4, 15));
      expect(excludedBtn?.getAttribute("aria-disabled")).toBe("true");
    });

    it("disables days flagged by unavailableDays", () => {
      const unavailable = (d: Date): boolean => d.getDay() === 0;
      fixture.componentRef.setInput("unavailableDays", unavailable);
      fixture.detectChanges();

      const sunday = new Date(2024, 4, 12);
      const monday = new Date(2024, 4, 13);
      const sundayBtn = buttonForDay(sunday);
      const mondayBtn = buttonForDay(monday);

      expect(sundayBtn?.getAttribute("aria-disabled")).toBe("true");
      expect(sundayBtn?.classList).toContain(
        "tedi-calendar-day-grid__day--unavailable-day",
      );
      expect(mondayBtn?.getAttribute("aria-disabled")).toBeNull();
    });
  });

  describe("range hover preview", () => {
    it("applies --range-preview-middle and --range-preview-end on mouseenter and clears on mouseleave", () => {
      fixture.componentRef.setInput("mode", "range");
      fixture.componentRef.setInput("value", {
        from: new Date(2024, 4, 10),
      });
      fixture.detectChanges();

      component.handleMouseEnter(new Date(2024, 4, 14));
      fixture.detectChanges();

      for (const d of [11, 12, 13]) {
        expect(
          buttonForDay(new Date(2024, 4, d))?.classList.contains(
            "tedi-calendar-day-grid__day--range-preview-middle",
          ),
        ).toBe(true);
      }
      expect(
        buttonForDay(new Date(2024, 4, 14))?.classList.contains(
          "tedi-calendar-day-grid__day--range-preview-end",
        ),
      ).toBe(true);

      component.handleMouseLeave();
      fixture.detectChanges();

      for (const d of [11, 12, 13, 14]) {
        const btn = buttonForDay(new Date(2024, 4, d));
        expect(
          btn?.classList.contains(
            "tedi-calendar-day-grid__day--range-preview-middle",
          ),
        ).toBe(false);
        expect(
          btn?.classList.contains(
            "tedi-calendar-day-grid__day--range-preview-end",
          ),
        ).toBe(false);
      }
    });

    it("does not apply preview classes when not in range mode", () => {
      fixture.componentRef.setInput("value", { from: new Date(2024, 4, 10) });
      fixture.detectChanges();
      component.handleMouseEnter(new Date(2024, 4, 14));
      fixture.detectChanges();
      expect(hasAnyPreviewClass()).toBe(false);
    });
  });

  describe("daySelect", () => {
    it("emits the date when an enabled cell is clicked", () => {
      const emit = jest.spyOn(component.daySelect, "emit");
      const day = new Date(2024, 4, 15);
      buttonForDay(day)?.click();
      expect(emit).toHaveBeenCalledTimes(1);
      expect(emit.mock.calls[0][0]).toBeInstanceOf(Date);
      expect((emit.mock.calls[0][0] as Date).getTime()).toBe(day.getTime());
    });

    it("does not emit when a disabled cell is clicked", () => {
      fixture.componentRef.setInput("disabledMatchers", [new Date(2024, 4, 15)]);
      fixture.detectChanges();

      const emit = jest.spyOn(component.daySelect, "emit");
      buttonForDay(new Date(2024, 4, 15))?.click();
      expect(emit).not.toHaveBeenCalled();
    });
  });

  describe("inputDisabled", () => {
    it("disables every button when true", () => {
      fixture.componentRef.setInput("inputDisabled", true);
      fixture.detectChanges();

      const all = buttons();
      expect(all.length).toBeGreaterThan(0);
      for (const btn of all) {
        expect(btn.getAttribute("aria-disabled")).toBe("true");
      }
    });
  });

  describe("focusable cell (roving tabindex)", () => {
    it("makes exactly one cell tabbable", () => {
      const tabbable = buttons().filter((b) => b.getAttribute("tabindex") === "0");
      expect(tabbable.length).toBe(1);
    });
  });

  describe("keyboard focus → hover preview", () => {
    it("applies preview classes on focus and clears them on blur in range mode", () => {
      fixture.componentRef.setInput("mode", "range");
      fixture.componentRef.setInput("value", { from: new Date(2024, 4, 10) });
      fixture.detectChanges();

      component.handleFocus(new Date(2024, 4, 14));
      fixture.detectChanges();
      expect(
        buttonForDay(new Date(2024, 4, 14))?.classList.contains(
          "tedi-calendar-day-grid__day--range-preview-end",
        ),
      ).toBe(true);

      component.handleBlur(new FocusEvent("blur"));
      fixture.detectChanges();
      expect(hasAnyPreviewClass()).toBe(false);
    });

    it("keeps preview classes when focus moves to a sibling day cell (no flash)", () => {
      fixture.componentRef.setInput("mode", "range");
      fixture.componentRef.setInput("value", { from: new Date(2024, 4, 10) });
      fixture.detectChanges();

      component.handleFocus(new Date(2024, 4, 14));
      fixture.detectChanges();
      expect(hasAnyPreviewClass()).toBe(true);

      // Simulate the browser-native blur → focus chain that fires when the
      // user clicks a different day in the same grid. relatedTarget points
      // at the incoming cell — blur should NOT clear hoveredDate, because
      // doing so would render one frame with no preview (visible as a flash).
      const nextCell = buttonForDay(new Date(2024, 4, 16));
      expect(nextCell).toBeTruthy();
      component.handleBlur(
        new FocusEvent("blur", { relatedTarget: nextCell as EventTarget }),
      );
      fixture.detectChanges();
      expect(hasAnyPreviewClass()).toBe(true);
    });

    it("does not apply preview classes on focus when not in range mode", () => {
      fixture.componentRef.setInput("value", { from: new Date(2024, 4, 10) });
      fixture.detectChanges();
      component.handleFocus(new Date(2024, 4, 14));
      fixture.detectChanges();
      expect(hasAnyPreviewClass()).toBe(false);
      component.handleBlur(new FocusEvent("blur"));
      fixture.detectChanges();
      expect(hasAnyPreviewClass()).toBe(false);
    });

    it("ignores focus on null day", () => {
      fixture.componentRef.setInput("mode", "range");
      fixture.componentRef.setInput("value", { from: new Date(2024, 4, 10) });
      fixture.detectChanges();
      component.handleFocus(null);
      fixture.detectChanges();
      expect(hasAnyPreviewClass()).toBe(false);
    });

    it("ignores mouseenter on null day", () => {
      fixture.componentRef.setInput("mode", "range");
      fixture.componentRef.setInput("value", { from: new Date(2024, 4, 10) });
      fixture.detectChanges();
      component.handleMouseEnter(null);
      fixture.detectChanges();
      expect(hasAnyPreviewClass()).toBe(false);
    });
  });

  describe("range mode tolerance", () => {
    it("treats a Date value as no-range for range-mode rendering", () => {
      fixture.componentRef.setInput("mode", "range");
      fixture.componentRef.setInput("value", new Date(2024, 4, 12));
      fixture.detectChanges();

      const btn = buttonForDay(new Date(2024, 4, 12));
      expect(btn?.classList.contains("tedi-calendar-day-grid__day--range-start")).toBe(false);
    });

    it("does not preview when hovering on the from date itself", () => {
      fixture.componentRef.setInput("mode", "range");
      fixture.componentRef.setInput("value", { from: new Date(2024, 4, 10) });
      fixture.detectChanges();

      component.handleMouseEnter(new Date(2024, 4, 10));
      fixture.detectChanges();

      expect(
        buttonForDay(new Date(2024, 4, 10))?.classList.contains(
          "tedi-calendar-day-grid__day--range-preview-end",
        ),
      ).toBe(false);
    });

    it("supports user clicking earlier than from — committed range swaps via orderedRange", () => {
      fixture.componentRef.setInput("mode", "range");
      fixture.componentRef.setInput("value", {
        from: new Date(2024, 4, 14),
        to: new Date(2024, 4, 10),
      });
      fixture.detectChanges();

      for (const d of [11, 12, 13]) {
        expect(
          buttonForDay(new Date(2024, 4, d))?.classList.contains(
            "tedi-calendar-day-grid__day--range-middle",
          ),
        ).toBe(true);
      }
    });
  });

  describe("focusable cell fallback when current month is not today's month", () => {
    it("falls back to the first day of the rendered month when today is elsewhere", () => {
      fixture.componentRef.setInput("month", new Date(2030, 0, 15));
      fixture.detectChanges();

      const tabbable = fixture.debugElement
        .queryAll(By.css(".tedi-calendar-day-grid__day"))
        .map((d) => d.nativeElement as HTMLButtonElement)
        .filter((b) => b.getAttribute("tabindex") === "0");
      expect(tabbable.length).toBe(1);
      expect(tabbable[0].textContent?.trim()).toBe("1");
    });
  });

  describe("availableDays as predicate function", () => {
    it("disables days that fail the predicate", () => {
      fixture.componentRef.setInput(
        "availableDays",
        (d: Date) => d.getDate() === 15,
      );
      fixture.detectChanges();

      expect(buttonForDay(new Date(2024, 4, 15))?.getAttribute("aria-disabled")).toBeNull();
      expect(buttonForDay(new Date(2024, 4, 16))?.getAttribute("aria-disabled")).toBe("true");
    });
  });

  describe("weekNumber()", () => {
    it("returns the ISO week of the first non-null day in the row", () => {
      const grid = component.grid();
      const firstRow = grid[0];
      const nonNullDay = firstRow.find((d): d is Date => d !== null);
      if (!nonNullDay) throw new Error("Expected a non-null day in first row");
      expect(component.weekNumber(firstRow)).toBeGreaterThan(0);
    });

    it("returns null for an all-null row", () => {
      expect(component.weekNumber([null, null, null, null, null, null, null])).toBeNull();
    });
  });

  describe("a11y", () => {
    function gridTable(): HTMLElement {
      return fixture.debugElement.query(By.css(".tedi-calendar-day-grid"))
        .nativeElement as HTMLElement;
    }

    it("sets aria-label on the grid to the month/year", () => {
      const label = gridTable().getAttribute("aria-label");
      // formatMonthYear via Intl yields locale-specific output; we just assert
      // both the month name and year appear in it.
      expect(label).toMatch(/2024/);
      expect(label?.toLowerCase()).toContain("mai");
    });

    it("omits aria-multiselectable in single mode", () => {
      expect(gridTable().getAttribute("aria-multiselectable")).toBeNull();
    });

    it("sets aria-multiselectable=true in multiple mode", () => {
      fixture.componentRef.setInput("mode", "multiple");
      fixture.detectChanges();
      expect(gridTable().getAttribute("aria-multiselectable")).toBe("true");
    });

    it("sets aria-multiselectable=true in range mode", () => {
      fixture.componentRef.setInput("mode", "range");
      fixture.detectChanges();
      expect(gridTable().getAttribute("aria-multiselectable")).toBe("true");
    });

    it("exposes a long aria-label on each weekday header", () => {
      const headers = fixture.debugElement.queryAll(
        By.css(".tedi-calendar-day-grid__weekday"),
      );
      const labels = headers.map(
        (h) => (h.nativeElement as HTMLElement).getAttribute("aria-label"),
      );
      // Estonian locale "et" returns "esmaspäev" .. "pühapäev" for `long`.
      for (const label of labels) {
        expect(label && label.length > 3).toBe(true);
      }
    });

    it("keeps the narrow weekday abbreviation as visible header text (not aria-hidden) so headers aren't empty, while the full name is the accessible name via aria-label", () => {
      const headers = fixture.debugElement.queryAll(
        By.css(".tedi-calendar-day-grid__weekday"),
      );
      for (const h of headers) {
        const el = h.nativeElement as HTMLElement;
        expect(el.textContent?.trim().length).toBeGreaterThan(0);
        expect(el.querySelector("[aria-hidden='true']")).toBeNull();
        expect((el.getAttribute("aria-label") ?? "").length).toBeGreaterThan(3);
      }
    });

    it("selected state is exposed on the interactive day (role=gridcell button), not a plain button", () => {
      fixture.componentRef.setInput("value", new Date(2024, 4, 15));
      fixture.detectChanges();
      const selected = buttonForDay(new Date(2024, 4, 15));
      expect(selected?.getAttribute("role")).toBe("gridcell");
      expect(selected?.getAttribute("aria-selected")).toBe("true");
    });

    it("week number cell is a <th> rowheader with translated aria-label and visible number", () => {
      fixture.componentRef.setInput("showWeekNumbers", true);
      fixture.detectChanges();
      const cell = fixture.debugElement.query(
        By.css(".tedi-calendar-day-grid__week-number"),
      );
      expect(cell.nativeElement.tagName).toBe("TH");
      expect(cell.nativeElement.getAttribute("role")).toBe("rowheader");
      expect(cell.nativeElement.getAttribute("scope")).toBe("row");
      expect(cell.nativeElement.getAttribute("aria-label")).toBe(
        "date-picker.week-number",
      );
      expect((cell.nativeElement.textContent as string).trim().length).toBeGreaterThan(0);
    });

    it("week number column header has scope=col and a visually hidden translated label", () => {
      fixture.componentRef.setInput("showWeekNumbers", true);
      fixture.detectChanges();
      const header = fixture.debugElement.query(
        By.css(".tedi-calendar-day-grid__week-number-header"),
      );
      expect(header.nativeElement.getAttribute("scope")).toBe("col");
      const srOnly = header.nativeElement.querySelector(".sr-only") as HTMLElement;
      expect(srOnly).not.toBeNull();
      expect(srOnly.textContent?.trim()).toBe("date-picker.week-number-header");
    });
  });
});
