import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { OverlayContainer } from "@angular/cdk/overlay";
import { CalendarHeaderComponent } from "./calendar-header.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";
import { Matcher } from "../../../../utils/matchers.util";
import { getMonthNames } from "../../../../utils/date.util";

class TranslationMock {
  translate(key: string): string {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

describe("CalendarHeaderComponent", () => {
  let fixture: ComponentFixture<CalendarHeaderComponent>;
  let component: CalendarHeaderComponent;
  let overlayContainerElement: HTMLElement;

  const MAY_2024 = new Date(2024, 4, 1);

  beforeAll(() => {
    Element.prototype.scrollIntoView = jest.fn();
  });

  function createComponent(): void {
    TestBed.configureTestingModule({
      imports: [CalendarHeaderComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });
    fixture = TestBed.createComponent(CalendarHeaderComponent);
    component = fixture.componentInstance;
    overlayContainerElement =
      TestBed.inject(OverlayContainer).getContainerElement();
    fixture.componentRef.setInput("currentMonth", MAY_2024);
    fixture.componentRef.setInput("view", "days");
    fixture.detectChanges();
  }

  function navButtons(): HTMLButtonElement[] {
    return fixture.debugElement
      .queryAll(By.css(".tedi-calendar-header__nav-button"))
      .map((d) => d.nativeElement as HTMLButtonElement);
  }

  function selectTriggers(): HTMLButtonElement[] {
    return fixture.debugElement
      .queryAll(By.css(".tedi-calendar-header__select"))
      .map((d) => d.nativeElement as HTMLButtonElement);
  }

  function labelButtons(): HTMLButtonElement[] {
    return fixture.debugElement
      .queryAll(By.css(".tedi-calendar-header__label-button"))
      .map((d) => d.nativeElement as HTMLButtonElement);
  }

  function titleText(): string {
    const triggers = [
      ...selectTriggers(),
      ...labelButtons(),
      ...fixture.debugElement
        .queryAll(By.css(".tedi-calendar-header__static-label"))
        .map((d) => d.nativeElement as HTMLElement),
    ];
    return triggers
      .map((el) => (el.textContent ?? "").replace(/arrow_drop_down/g, ""))
      .map((t) => t.replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .join(" ");
  }

  beforeEach(() => {
    createComponent();
  });

  afterEach(() => {
    overlayContainerElement.innerHTML = "";
  });

  // The dropdown content renders inside the CDK overlay container, so the
  // dropdown must be opened via its trigger before its items can be queried.
  function openDropdown(triggerIndex: number): void {
    selectTriggers()[triggerIndex].click();
    fixture.detectChanges();
  }

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("navigation buttons", () => {
    it("renders prev/next buttons when showNavigation=true (default)", () => {
      expect(navButtons().length).toBe(2);
    });

    it("omits prev/next buttons when showNavigation=false", () => {
      fixture.componentRef.setInput("showNavigation", false);
      fixture.detectChanges();
      expect(navButtons().length).toBe(0);
    });

    it("emits prevClick when prev button is clicked", () => {
      const emit = jest.spyOn(component.prevClick, "emit");
      navButtons()[0].click();
      expect(emit).toHaveBeenCalledTimes(1);
    });

    it("emits nextClick when next button is clicked", () => {
      const emit = jest.spyOn(component.nextClick, "emit");
      navButtons()[1].click();
      expect(emit).toHaveBeenCalledTimes(1);
    });
  });

  describe("label rendering per view", () => {
    it("days view shows long month name and 4-digit year in et-EE", () => {
      const months = getMonthNames("et-EE", "long");
      const text = titleText();
      expect(text).toContain(months[4]);
      expect(text).toContain("2024");
    });

    it("months view shows year only", () => {
      fixture.componentRef.setInput("view", "months");
      fixture.detectChanges();
      const text = titleText();
      expect(text).toBe("2024");
    });

    it("years view shows a YYYY-YYYY range derived from yearPageStart + yearPageSize - 1", () => {
      fixture.componentRef.setInput("view", "years");
      fixture.componentRef.setInput("yearPageStart", 2020);
      fixture.componentRef.setInput("yearPageSize", 12);
      fixture.detectChanges();
      expect(titleText()).toBe("2020-2031");
    });

    it("years view derives yearPageStart from currentMonth when not provided", () => {
      fixture.componentRef.setInput("view", "years");
      fixture.componentRef.setInput("yearPageSize", 12);
      fixture.detectChanges();
      // currentMonth year is 2024, default start = 2019, end = 2030
      expect(titleText()).toBe("2019-2030");
    });

    it("years view label is not a button (static)", () => {
      fixture.componentRef.setInput("view", "years");
      fixture.detectChanges();
      expect(selectTriggers().length).toBe(0);
      expect(labelButtons().length).toBe(0);
      const staticLabel = fixture.debugElement.query(
        By.css(".tedi-calendar-header__static-label"),
      );
      expect(staticLabel).toBeTruthy();
    });
  });

  describe("dropdown vs grid mode", () => {
    it("renders dropdown selects in dropdown mode (default) for days view", () => {
      expect(selectTriggers().length).toBe(2);
      expect(labelButtons().length).toBe(0);
    });

    it("renders label buttons in grid mode for days view", () => {
      fixture.componentRef.setInput("monthYearSelectType", "grid");
      fixture.detectChanges();
      expect(selectTriggers().length).toBe(0);
      expect(labelButtons().length).toBe(2);
    });

    it("renders one dropdown in months view (dropdown mode)", () => {
      fixture.componentRef.setInput("view", "months");
      fixture.detectChanges();
      expect(selectTriggers().length).toBe(1);
    });

    it("renders one label button in months view (grid mode)", () => {
      fixture.componentRef.setInput("view", "months");
      fixture.componentRef.setInput("monthYearSelectType", "grid");
      fixture.detectChanges();
      expect(labelButtons().length).toBe(1);
    });
  });

  describe("dropdown selection emission", () => {
    function monthItems(): HTMLLIElement[] {
      return Array.from(
        overlayContainerElement.querySelectorAll<HTMLLIElement>(
          ".tedi-calendar-header__dropdown--month li[tedi-dropdown-item]",
        ),
      );
    }

    function yearItems(): HTMLLIElement[] {
      return Array.from(
        overlayContainerElement.querySelectorAll<HTMLLIElement>(
          ".tedi-calendar-header__dropdown--year li[tedi-dropdown-item]",
        ),
      );
    }

    it("emits monthChange with startOfMonth(picked) when a month item is clicked", () => {
      const emit = jest.spyOn(component.monthChange, "emit");
      openDropdown(0);
      // Items are indexed 0..11; index 7 = August.
      monthItems()[7].click();
      fixture.detectChanges();
      expect(emit).toHaveBeenCalledTimes(1);
      const arg = emit.mock.calls[0][0] as Date;
      expect(arg).toBeInstanceOf(Date);
      expect(arg.getFullYear()).toBe(2024);
      expect(arg.getMonth()).toBe(7);
      expect(arg.getDate()).toBe(1);
      expect(arg.getHours()).toBe(0);
    });

    it("does not emit monthChange when value is undefined", () => {
      const emit = jest.spyOn(component.monthChange, "emit");
      component.handleMonthSelect(undefined);
      expect(emit).not.toHaveBeenCalled();
    });

    it("emits yearChange with Jan 1 of picked year when a year item is clicked", () => {
      const emit = jest.spyOn(component.yearChange, "emit");
      openDropdown(1);
      const item = yearItems().find((el) => el.textContent?.trim() === "2030");
      expect(item).toBeTruthy();
      item!.click();
      fixture.detectChanges();
      expect(emit).toHaveBeenCalledTimes(1);
      const arg = emit.mock.calls[0][0] as Date;
      expect(arg.getFullYear()).toBe(2030);
      expect(arg.getMonth()).toBe(0);
      expect(arg.getDate()).toBe(1);
    });

    it("does not emit yearChange when value is undefined", () => {
      const emit = jest.spyOn(component.yearChange, "emit");
      component.handleYearSelect(undefined);
      expect(emit).not.toHaveBeenCalled();
    });
  });

  describe("grid mode viewChange emission", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("monthYearSelectType", "grid");
      fixture.detectChanges();
    });

    it("clicking month label in grid mode emits viewChange('months')", () => {
      const emit = jest.spyOn(component.viewChange, "emit");
      labelButtons()[0].click();
      expect(emit).toHaveBeenCalledWith("months");
    });

    it("clicking year label in grid mode (days view) emits viewChange('years')", () => {
      const emit = jest.spyOn(component.viewChange, "emit");
      labelButtons()[1].click();
      expect(emit).toHaveBeenCalledWith("years");
    });

    it("clicking year label in months view emits viewChange('years')", () => {
      fixture.componentRef.setInput("view", "months");
      fixture.detectChanges();
      const emit = jest.spyOn(component.viewChange, "emit");
      labelButtons()[0].click();
      expect(emit).toHaveBeenCalledWith("years");
    });
  });

  describe("fully-disabled-month detection (dropdown items)", () => {
    function disabledMonthIndices(): number[] {
      return Array.from(
        overlayContainerElement.querySelectorAll<HTMLElement>(
          ".tedi-calendar-header__dropdown--month li",
        ),
      )
        .map((el, i) => ({
          disabled: el.getAttribute("aria-disabled"),
          i,
        }))
        .filter((x) => x.disabled === "true")
        .map((x) => x.i);
    }

    it("marks a month disabled when every day matches a disabledMatcher", () => {
      const matchers: Matcher[] = [
        { from: new Date(2024, 4, 1), to: new Date(2024, 4, 31) },
      ];
      fixture.componentRef.setInput("disabledMatchers", matchers);
      fixture.detectChanges();

      openDropdown(0);
      expect(disabledMonthIndices()).toContain(4);
    });

    it("does not mark a month disabled when only some days are disabled", () => {
      const matchers: Matcher[] = [
        { from: new Date(2024, 4, 1), to: new Date(2024, 4, 15) },
      ];
      fixture.componentRef.setInput("disabledMatchers", matchers);
      fixture.detectChanges();

      openDropdown(0);
      expect(disabledMonthIndices()).not.toContain(4);
    });

    it("uses isMonthDisabled predicate", () => {
      fixture.componentRef.setInput(
        "isMonthDisabled",
        (m: Date) => m.getMonth() === 0,
      );
      fixture.detectChanges();

      openDropdown(0);
      expect(disabledMonthIndices()).toContain(0);
    });
  });

  describe("fully-disabled-year detection (dropdown items)", () => {
    function yearItems(): HTMLElement[] {
      return Array.from(
        overlayContainerElement.querySelectorAll<HTMLElement>(
          ".tedi-calendar-header__dropdown--year li",
        ),
      );
    }

    it("marks a year disabled when every month is fully disabled", () => {
      const matchers: Matcher[] = [
        { from: new Date(2023, 0, 1), to: new Date(2023, 11, 31) },
      ];
      fixture.componentRef.setInput("minYear", 2022);
      fixture.componentRef.setInput("maxYear", 2025);
      fixture.componentRef.setInput("disabledMatchers", matchers);
      fixture.detectChanges();

      openDropdown(1);
      const items = yearItems();
      const disabled2023 = items.find(
        (el) => el.textContent?.trim() === "2023",
      );
      const disabled2024 = items.find(
        (el) => el.textContent?.trim() === "2024",
      );
      expect(disabled2023?.getAttribute("aria-disabled")).toBe("true");
      expect(disabled2024?.getAttribute("aria-disabled")).not.toBe("true");
    });

    it("uses isYearDisabled predicate", () => {
      fixture.componentRef.setInput("minYear", 2023);
      fixture.componentRef.setInput("maxYear", 2025);
      fixture.componentRef.setInput(
        "isYearDisabled",
        (y: Date) => y.getFullYear() === 2024,
      );
      fixture.detectChanges();

      openDropdown(1);
      const items = yearItems();
      const item2024 = items.find((el) => el.textContent?.trim() === "2024");
      expect(item2024?.getAttribute("aria-disabled")).toBe("true");
    });
  });

  describe("inputDisabled", () => {
    it("disables both nav buttons", () => {
      fixture.componentRef.setInput("inputDisabled", true);
      fixture.detectChanges();
      const navs = navButtons();
      expect(navs[0].disabled).toBe(true);
      expect(navs[1].disabled).toBe(true);
    });

    it("disables select triggers in dropdown mode", () => {
      fixture.componentRef.setInput("inputDisabled", true);
      fixture.detectChanges();
      const triggers = selectTriggers();
      for (const trigger of triggers) {
        expect(trigger.disabled).toBe(true);
      }
    });

    it("disables label buttons in grid mode", () => {
      fixture.componentRef.setInput("monthYearSelectType", "grid");
      fixture.componentRef.setInput("inputDisabled", true);
      fixture.detectChanges();
      for (const btn of labelButtons()) {
        expect(btn.disabled).toBe(true);
      }
    });

    it("does not emit on prev/next when inputDisabled is true", () => {
      fixture.componentRef.setInput("inputDisabled", true);
      fixture.detectChanges();
      const prevEmit = jest.spyOn(component.prevClick, "emit");
      const nextEmit = jest.spyOn(component.nextClick, "emit");
      navButtons()[0].click();
      navButtons()[1].click();
      expect(prevEmit).not.toHaveBeenCalled();
      expect(nextEmit).not.toHaveBeenCalled();
    });
  });

  describe("prev/next disabled logic", () => {
    it("days view: disables prev when the previous month is fully matched", () => {
      const matchers: Matcher[] = [
        { from: new Date(2024, 3, 1), to: new Date(2024, 3, 30) },
      ];
      fixture.componentRef.setInput("disabledMatchers", matchers);
      fixture.detectChanges();
      expect(navButtons()[0].disabled).toBe(true);
    });

    it("days view: enables prev when not fully matched", () => {
      expect(navButtons()[0].disabled).toBe(false);
    });

    it("days view: disables next when the next month is fully matched", () => {
      const matchers: Matcher[] = [
        { from: new Date(2024, 5, 1), to: new Date(2024, 5, 30) },
      ];
      fixture.componentRef.setInput("disabledMatchers", matchers);
      fixture.detectChanges();
      expect(navButtons()[1].disabled).toBe(true);
    });

    it("months view: disables prev when previous year is fully disabled", () => {
      fixture.componentRef.setInput("view", "months");
      fixture.componentRef.setInput(
        "isYearDisabled",
        (y: Date) => y.getFullYear() === 2023,
      );
      fixture.detectChanges();
      expect(navButtons()[0].disabled).toBe(true);
    });

    it("years view: disables prev when previous page would go below minYear", () => {
      fixture.componentRef.setInput("view", "years");
      fixture.componentRef.setInput("yearPageStart", 2020);
      fixture.componentRef.setInput("yearPageSize", 12);
      fixture.componentRef.setInput("minYear", 2015);
      fixture.detectChanges();
      expect(navButtons()[0].disabled).toBe(true);
    });

    it("years view: enables prev when previous page is within minYear", () => {
      fixture.componentRef.setInput("view", "years");
      fixture.componentRef.setInput("yearPageStart", 2020);
      fixture.componentRef.setInput("yearPageSize", 12);
      fixture.componentRef.setInput("minYear", 2000);
      fixture.detectChanges();
      expect(navButtons()[0].disabled).toBe(false);
    });

    it("years view: disables next when next page exceeds maxYear", () => {
      fixture.componentRef.setInput("view", "years");
      fixture.componentRef.setInput("yearPageStart", 2020);
      fixture.componentRef.setInput("yearPageSize", 12);
      fixture.componentRef.setInput("maxYear", 2030);
      fixture.detectChanges();
      expect(navButtons()[1].disabled).toBe(true);
    });

    it("years view: enables next when next page is within maxYear", () => {
      fixture.componentRef.setInput("view", "years");
      fixture.componentRef.setInput("yearPageStart", 2020);
      fixture.componentRef.setInput("yearPageSize", 12);
      fixture.componentRef.setInput("maxYear", 2050);
      fixture.detectChanges();
      expect(navButtons()[1].disabled).toBe(false);
    });
  });

  describe("a11y", () => {
    function nav(): HTMLElement {
      return fixture.debugElement.query(By.css("nav.tedi-calendar-header"))
        .nativeElement as HTMLElement;
    }

    function liveRegion(): HTMLElement {
      return fixture.debugElement.query(
        By.css("nav.tedi-calendar-header .sr-only[role='status']"),
      ).nativeElement as HTMLElement;
    }

    it("renders the header as a <nav> with translated aria-label", () => {
      expect(nav().tagName).toBe("NAV");
      expect(nav().getAttribute("aria-label")).toBe("date-picker.calendar-nav");
    });

    it("exposes a polite live region for caption announcements", () => {
      const el = liveRegion();
      expect(el.getAttribute("aria-live")).toBe("polite");
      expect(el.getAttribute("aria-atomic")).toBe("true");
      expect(el.classList.contains("sr-only")).toBe(true);
    });

    it("live region in days view announces month/year text", () => {
      const text = liveRegion().textContent?.trim() ?? "";
      expect(text).toMatch(/2024/);
      expect(text.toLowerCase()).toContain("mai");
    });

    it("live region in months view announces the visible year", () => {
      fixture.componentRef.setInput("view", "months");
      fixture.detectChanges();
      expect(liveRegion().textContent?.trim()).toBe("2024");
    });

    it("live region in years view announces the year-range bracket", () => {
      fixture.componentRef.setInput("view", "years");
      fixture.componentRef.setInput("yearPageStart", 2020);
      fixture.componentRef.setInput("yearPageSize", 12);
      fixture.detectChanges();
      expect(liveRegion().textContent?.trim()).toBe("2020-2031");
    });
  });
});
