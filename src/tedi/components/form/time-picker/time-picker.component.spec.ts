import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { TimePickerComponent } from "./time-picker.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

describe("TimePickerComponent", () => {
  let fixture: ComponentFixture<TimePickerComponent>;
  let component: TimePickerComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TimePickerComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    });

    fixture = TestBed.createComponent(TimePickerComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with null value", () => {
    expect(component.value()).toBeNull();
  });

  describe("scroll variant", () => {
    it("should render two columns by default", () => {
      const columns = el.querySelectorAll(".tedi-time-picker__column");
      expect(columns.length).toBe(2);
    });

    it("should render 24 hour items", () => {
      const hourColumn = el.querySelectorAll(".tedi-time-picker__column")[0];
      const items = hourColumn.querySelectorAll(".tedi-time-picker__item");
      expect(items.length).toBe(24);
    });

    it("should render 60 minute items by default", () => {
      const minuteColumn = el.querySelectorAll(".tedi-time-picker__column")[1];
      const items = minuteColumn.querySelectorAll(".tedi-time-picker__item");
      expect(items.length).toBe(60);
    });

    it("should render minute items based on minuteStep", () => {
      fixture.componentRef.setInput("minuteStep", 15);
      fixture.detectChanges();

      const minuteColumn = el.querySelectorAll(".tedi-time-picker__column")[1];
      const items = minuteColumn.querySelectorAll(".tedi-time-picker__item");
      expect(items.length).toBe(4);
    });

    it("should select hour on click", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const hourItems = el
        .querySelectorAll(".tedi-time-picker__column")[0]
        .querySelectorAll(".tedi-time-picker__item");
      (hourItems[14] as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(component.value()).toBe("14:00");
      expect(onChange).toHaveBeenCalledWith("14:00");
    });

    it("should move focus to minute column after selecting an hour", () => {
      const columns = el.querySelectorAll(".tedi-time-picker__column");
      const hourItems = columns[0].querySelectorAll(".tedi-time-picker__item");

      (hourItems[8] as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(document.activeElement).toBe(columns[1]);
    });

    it("should select minute on click", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);
      component.writeValue("14:00");
      fixture.detectChanges();

      const minuteItems = el
        .querySelectorAll(".tedi-time-picker__column")[1]
        .querySelectorAll(".tedi-time-picker__item");
      (minuteItems[30] as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(component.value()).toBe("14:30");
      expect(onChange).toHaveBeenCalledWith("14:30");
    });

    it("should highlight selected hour and minute", () => {
      component.writeValue("09:15");
      fixture.detectChanges();

      const hourItems = el
        .querySelectorAll(".tedi-time-picker__column")[0]
        .querySelectorAll(".tedi-time-picker__item");
      expect(
        hourItems[9].classList.contains("tedi-time-picker__item--selected"),
      ).toBe(true);

      const minuteItems = el
        .querySelectorAll(".tedi-time-picker__column")[1]
        .querySelectorAll(".tedi-time-picker__item");
      expect(
        minuteItems[15].classList.contains("tedi-time-picker__item--selected"),
      ).toBe(true);
    });

    it("should have separator between columns", () => {
      expect(el.querySelector(".tedi-time-picker__separator")).toBeTruthy();
    });

    it("should have listbox role on columns", () => {
      const columns = el.querySelectorAll(".tedi-time-picker__column");
      expect(columns[0].getAttribute("role")).toBe("listbox");
      expect(columns[1].getAttribute("role")).toBe("listbox");
    });

    it("should set aria-selected on selected items", () => {
      component.writeValue("03:05");
      fixture.detectChanges();

      const hourItems = el
        .querySelectorAll(".tedi-time-picker__column")[0]
        .querySelectorAll(".tedi-time-picker__item");
      expect(hourItems[3].getAttribute("aria-selected")).toBe("true");
      expect(hourItems[0].getAttribute("aria-selected")).toBe("false");
    });

    describe("column tabindex and aria", () => {
      it("should expose tabindex 0 on each column", () => {
        const columns = el.querySelectorAll(".tedi-time-picker__column");
        expect(columns[0].getAttribute("tabindex")).toBe("0");
        expect(columns[1].getAttribute("tabindex")).toBe("0");
      });

      it("should set tabindex -1 on every item", () => {
        const items = el
          .querySelectorAll(".tedi-time-picker__column")[0]
          .querySelectorAll(".tedi-time-picker__item");
        Array.from(items).forEach((item) => {
          expect(item.getAttribute("tabindex")).toBe("-1");
        });
      });

      it("should set tabindex -1 on columns when disabled", () => {
        fixture.componentRef.setInput("disabled", true);
        fixture.detectChanges();

        const columns = el.querySelectorAll(".tedi-time-picker__column");
        expect(columns[0].getAttribute("tabindex")).toBe("-1");
        expect(columns[1].getAttribute("tabindex")).toBe("-1");
      });

      it("should set aria-activedescendant to selected item id", () => {
        component.writeValue("05:30");
        fixture.detectChanges();

        const columns = el.querySelectorAll(".tedi-time-picker__column");
        const hourItems = columns[0].querySelectorAll(
          ".tedi-time-picker__item",
        );
        const minuteItems = columns[1].querySelectorAll(
          ".tedi-time-picker__item",
        );

        expect(columns[0].getAttribute("aria-activedescendant")).toBe(
          hourItems[5].getAttribute("id"),
        );
        expect(columns[1].getAttribute("aria-activedescendant")).toBe(
          minuteItems[30].getAttribute("id"),
        );
      });
    });

    describe("keyboard navigation", () => {
      const dispatchKey = (element: Element, key: string) => {
        element.dispatchEvent(
          new KeyboardEvent("keydown", { key, bubbles: true }),
        );
      };

      it("should select next value with ArrowDown", () => {
        component.writeValue("05:00");
        fixture.detectChanges();

        const hourColumn = el.querySelectorAll(".tedi-time-picker__column")[0];
        dispatchKey(hourColumn, "ArrowDown");

        expect(component.value()).toBe("06:00");
      });

      it("should select previous value with ArrowUp", () => {
        component.writeValue("05:00");
        fixture.detectChanges();

        const hourColumn = el.querySelectorAll(".tedi-time-picker__column")[0];
        dispatchKey(hourColumn, "ArrowUp");

        expect(component.value()).toBe("04:00");
      });

      it("should jump to first hour with Home", () => {
        component.writeValue("10:00");
        fixture.detectChanges();

        const hourColumn = el.querySelectorAll(".tedi-time-picker__column")[0];
        dispatchKey(hourColumn, "Home");

        expect(component.value()).toBe("00:00");
      });

      it("should jump to last hour with End", () => {
        component.writeValue("00:00");
        fixture.detectChanges();

        const hourColumn = el.querySelectorAll(".tedi-time-picker__column")[0];
        dispatchKey(hourColumn, "End");

        expect(component.value()).toBe("23:00");
      });

      it("should advance 5 with PageDown", () => {
        component.writeValue("00:00");
        fixture.detectChanges();

        const hourColumn = el.querySelectorAll(".tedi-time-picker__column")[0];
        dispatchKey(hourColumn, "PageDown");

        expect(component.value()).toBe("05:00");
      });

      it("should rewind 5 with PageUp", () => {
        component.writeValue("10:00");
        fixture.detectChanges();

        const hourColumn = el.querySelectorAll(".tedi-time-picker__column")[0];
        dispatchKey(hourColumn, "PageUp");

        expect(component.value()).toBe("05:00");
      });

      it("should advance focus to minute column on Enter from hour column", () => {
        const columns = el.querySelectorAll(".tedi-time-picker__column");
        (columns[0] as HTMLElement).focus();
        dispatchKey(columns[0], "Enter");

        expect(document.activeElement).toBe(columns[1]);
      });

      it("should wrap to last hour on ArrowUp at first", () => {
        component.writeValue("00:00");
        fixture.detectChanges();

        const hourColumn = el.querySelectorAll(".tedi-time-picker__column")[0];
        dispatchKey(hourColumn, "ArrowUp");

        expect(component.value()).toBe("23:00");
      });

      it("should wrap to first hour on ArrowDown at last", () => {
        component.writeValue("23:00");
        fixture.detectChanges();

        const hourColumn = el.querySelectorAll(".tedi-time-picker__column")[0];
        dispatchKey(hourColumn, "ArrowDown");

        expect(component.value()).toBe("00:00");
      });

      it("should wrap minute column on ArrowDown at last", () => {
        component.writeValue("01:59");
        fixture.detectChanges();

        const minuteColumn = el.querySelectorAll(
          ".tedi-time-picker__column",
        )[1];
        dispatchKey(minuteColumn, "ArrowDown");

        expect(component.value()).toBe("01:00");
      });

      it("should not trap Tab when trapFocus is false", () => {
        const columns = el.querySelectorAll(".tedi-time-picker__column");
        (columns[0] as HTMLElement).focus();
        dispatchKey(columns[0], "Tab");

        expect(document.activeElement).not.toBe(columns[1]);
      });

      describe("with trapFocus enabled", () => {
        beforeEach(() => {
          fixture.componentRef.setInput("trapFocus", true);
          fixture.detectChanges();
        });

        it("should move focus from hour to minute column on Tab", () => {
          const columns = el.querySelectorAll(".tedi-time-picker__column");
          (columns[0] as HTMLElement).focus();
          dispatchKey(columns[0], "Tab");

          expect(document.activeElement).toBe(columns[1]);
        });

        it("should move focus from minute to hour column on Tab", () => {
          const columns = el.querySelectorAll(".tedi-time-picker__column");
          (columns[1] as HTMLElement).focus();
          dispatchKey(columns[1], "Tab");

          expect(document.activeElement).toBe(columns[0]);
        });
      });
    });
  });

  describe("dropdown variant", () => {
    const slots = ["12:30", "13:00", "13:30", "14:00", "14:30"];

    beforeEach(() => {
      fixture.componentRef.setInput("variant", "dropdown");
      fixture.componentRef.setInput("timeSlots", slots);
      fixture.detectChanges();
    });

    it("should render dropdown items", () => {
      const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
      expect(items.length).toBe(5);
    });

    it("should have listbox role", () => {
      const list = el.querySelector(".tedi-time-picker__dropdown");
      expect(list?.getAttribute("role")).toBe("listbox");
    });

    it("should have an accessible name on the listbox", () => {
      const list = el.querySelector(".tedi-time-picker__dropdown");
      expect(list?.getAttribute("aria-label")).toBeTruthy();
    });

    it("should select item on click", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
      (items[2] as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(component.value()).toBe("13:30");
      expect(onChange).toHaveBeenCalledWith("13:30");
    });

    it("should highlight selected item", () => {
      component.writeValue("13:00");
      fixture.detectChanges();

      const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
      expect(
        items[1].classList.contains(
          "tedi-time-picker__dropdown-item--selected",
        ),
      ).toBe(true);
      expect(
        items[0].classList.contains(
          "tedi-time-picker__dropdown-item--selected",
        ),
      ).toBe(false);
    });

    it("should set aria-selected on selected item", () => {
      component.writeValue("14:00");
      fixture.detectChanges();

      const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
      expect(items[3].getAttribute("aria-selected")).toBe("true");
      expect(items[0].getAttribute("aria-selected")).toBe("false");
    });

    describe("roving tabindex", () => {
      it("should set tabindex 0 on first item when no selection", () => {
        const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
        expect(items[0].getAttribute("tabindex")).toBe("0");
        expect(items[1].getAttribute("tabindex")).toBe("-1");
      });

      it("should set tabindex 0 on selected item", () => {
        component.writeValue("13:30");
        fixture.detectChanges();

        const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
        expect(items[2].getAttribute("tabindex")).toBe("0");
        expect(items[0].getAttribute("tabindex")).toBe("-1");
      });
    });

    describe("keyboard navigation", () => {
      const dispatchKey = (element: HTMLElement, key: string) => {
        element.dispatchEvent(
          new KeyboardEvent("keydown", { key, bubbles: true }),
        );
      };

      it("should move focus with ArrowDown", () => {
        const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
        (items[0] as HTMLElement).focus();
        dispatchKey(items[0] as HTMLElement, "ArrowDown");
        expect(document.activeElement).toBe(items[1]);
      });

      it("should move focus with ArrowUp", () => {
        const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
        (items[2] as HTMLElement).focus();
        dispatchKey(items[2] as HTMLElement, "ArrowUp");
        expect(document.activeElement).toBe(items[1]);
      });

      it("should select item with Enter", () => {
        const onChange = jest.fn();
        component.registerOnChange(onChange);

        const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
        (items[1] as HTMLElement).focus();
        dispatchKey(items[1] as HTMLElement, "Enter");

        expect(component.value()).toBe("13:00");
        expect(onChange).toHaveBeenCalledWith("13:00");
      });

      it("should not move past first item with ArrowUp", () => {
        const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
        (items[0] as HTMLElement).focus();
        dispatchKey(items[0] as HTMLElement, "ArrowUp");
        expect(document.activeElement).toBe(items[0]);
      });

      it("should not move past last item with ArrowDown", () => {
        const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
        (items[4] as HTMLElement).focus();
        dispatchKey(items[4] as HTMLElement, "ArrowDown");
        expect(document.activeElement).toBe(items[4]);
      });

      it("should move focus to first item with Home", () => {
        const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
        (items[3] as HTMLElement).focus();
        dispatchKey(items[3] as HTMLElement, "Home");
        expect(document.activeElement).toBe(items[0]);
      });

      it("should move focus to last item with End", () => {
        const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
        (items[0] as HTMLElement).focus();
        dispatchKey(items[0] as HTMLElement, "End");
        expect(document.activeElement).toBe(items[4]);
      });

      it("should not trap Tab when trapFocus is false", () => {
        const closeRequested = jest.spyOn(component.closeRequested, "emit");
        const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
        (items[0] as HTMLElement).focus();
        dispatchKey(items[0] as HTMLElement, "Tab");

        expect(closeRequested).not.toHaveBeenCalled();
      });

      it("should emit closeRequested on Tab when trapFocus is true", () => {
        fixture.componentRef.setInput("trapFocus", true);
        fixture.detectChanges();

        const closeRequested = jest.spyOn(component.closeRequested, "emit");
        const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
        (items[0] as HTMLElement).focus();
        dispatchKey(items[0] as HTMLElement, "Tab");

        expect(closeRequested).toHaveBeenCalled();
      });
    });
  });

  describe("slots variant", () => {
    const slots = ["09:00", "10:30", "11:00", "14:00", "15:30", "16:00"];

    beforeEach(() => {
      fixture.componentRef.setInput("variant", "slots");
      fixture.componentRef.setInput("timeSlots", slots);
      fixture.detectChanges();
    });

    it("should render a radio card per slot", () => {
      const cards = el.querySelectorAll(".tedi-time-picker__slot");
      expect(cards.length).toBe(6);
      const inputs = el.querySelectorAll<HTMLInputElement>(
        '.tedi-time-picker__grid input[type="radio"]',
      );
      expect(inputs.length).toBe(6);
    });

    it("should select slot when its radio input changes", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const inputs = el.querySelectorAll<HTMLInputElement>(
        '.tedi-time-picker__grid input[type="radio"]',
      );
      inputs[2].checked = true;
      inputs[2].dispatchEvent(new Event("change", { bubbles: true }));
      fixture.detectChanges();

      expect(component.value()).toBe("11:00");
      expect(onChange).toHaveBeenCalledWith("11:00");
    });

    it("should mark the matching radio input as checked", () => {
      component.writeValue("10:30");
      fixture.detectChanges();

      const inputs = el.querySelectorAll<HTMLInputElement>(
        '.tedi-time-picker__grid input[type="radio"]',
      );
      expect(inputs[1].checked).toBe(true);
      expect(inputs[0].checked).toBe(false);
    });

    it("should render grid with configurable columns", () => {
      fixture.componentRef.setInput("columns", 2);
      fixture.detectChanges();

      const grid = el.querySelector(".tedi-time-picker__grid") as HTMLElement;
      expect(getComputedStyle(grid).display).toBe("grid");
      expect(grid.style.gridTemplateColumns).toBe("repeat(2, 1fr)");
    });

    it("should have radiogroup role on grid", () => {
      const grid = el.querySelector(".tedi-time-picker__grid");
      expect(grid?.getAttribute("role")).toBe("radiogroup");
    });

    it("should share a single radio group name across all slots", () => {
      const inputs = el.querySelectorAll<HTMLInputElement>(
        '.tedi-time-picker__grid input[type="radio"]',
      );
      const names = new Set(Array.from(inputs).map((i) => i.name));
      expect(names.size).toBe(1);
    });

    it("should hide the radio indicator by default", () => {
      const card = el.querySelector(".tedi-time-picker__slot");
      expect(card?.classList.contains("tedi-radio-card--hide-indicator")).toBe(
        true,
      );
    });

    it("should show the radio indicator when showSlotIndicator is true", () => {
      fixture.componentRef.setInput("showSlotIndicator", true);
      fixture.detectChanges();

      const card = el.querySelector(".tedi-time-picker__slot");
      expect(card?.classList.contains("tedi-radio-card--hide-indicator")).toBe(
        false,
      );
    });

    it("should disable every radio input when disabled", () => {
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();

      const inputs = el.querySelectorAll<HTMLInputElement>(
        '.tedi-time-picker__grid input[type="radio"]',
      );
      expect(Array.from(inputs).every((i) => i.disabled)).toBe(true);
    });
  });

  describe("ControlValueAccessor", () => {
    it("should set value via writeValue", () => {
      component.writeValue("16:45");
      expect(component.value()).toBe("16:45");
    });

    it("should handle null writeValue", () => {
      component.writeValue(null);
      expect(component.value()).toBeNull();
    });

    it("should call onTouched on selection", () => {
      const onTouched = jest.fn();
      component.registerOnTouched(onTouched);

      const hourItems = el
        .querySelectorAll(".tedi-time-picker__column")[0]
        .querySelectorAll(".tedi-time-picker__item");
      (hourItems[5] as HTMLButtonElement).click();

      expect(onTouched).toHaveBeenCalled();
    });

    it("should park the highlight on 12:00 when value is reset to null", () => {
      component.writeValue("14:30");
      fixture.detectChanges();

      let columns = el.querySelectorAll(".tedi-time-picker__column");
      let hourItems = columns[0].querySelectorAll(".tedi-time-picker__item");
      let minuteItems = columns[1].querySelectorAll(".tedi-time-picker__item");
      expect(
        hourItems[14].classList.contains("tedi-time-picker__item--selected"),
      ).toBe(true);
      expect(
        minuteItems[30].classList.contains("tedi-time-picker__item--selected"),
      ).toBe(true);

      component.writeValue(null);
      fixture.detectChanges();

      columns = el.querySelectorAll(".tedi-time-picker__column");
      hourItems = columns[0].querySelectorAll(".tedi-time-picker__item");
      minuteItems = columns[1].querySelectorAll(".tedi-time-picker__item");
      // No value → wheel parks on 12:00 (display only; nothing is selected/emitted).
      expect(
        hourItems[12].classList.contains("tedi-time-picker__item--selected"),
      ).toBe(true);
      expect(
        hourItems[14].classList.contains("tedi-time-picker__item--selected"),
      ).toBe(false);
      expect(
        minuteItems[0].classList.contains("tedi-time-picker__item--selected"),
      ).toBe(true);
      expect(
        minuteItems[30].classList.contains("tedi-time-picker__item--selected"),
      ).toBe(false);
    });

    it("should not emit a value while parked on the 12:00 default", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);
      component.writeValue(null);
      fixture.detectChanges();

      expect(component.value()).toBeNull();
      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe("focusActiveItem", () => {
    it("should focus the hour column in scroll variant", () => {
      const hourColumn = el.querySelectorAll(
        ".tedi-time-picker__column",
      )[0] as HTMLElement;
      const focusSpy = jest.spyOn(hourColumn, "focus");

      component.focusActiveItem();

      expect(focusSpy).toHaveBeenCalled();
    });

    it("should focus the checked radio in slots variant", () => {
      fixture.componentRef.setInput("variant", "slots");
      fixture.componentRef.setInput("timeSlots", ["09:00", "10:00", "11:00"]);
      component.writeValue("10:00");
      fixture.detectChanges();

      const inputs = el.querySelectorAll<HTMLInputElement>(
        '.tedi-time-picker__grid input[type="radio"]',
      );
      const focusSpy = jest.spyOn(inputs[1], "focus");

      component.focusActiveItem();

      expect(focusSpy).toHaveBeenCalled();
    });

    it("should focus the first radio in slots variant when nothing selected", () => {
      fixture.componentRef.setInput("variant", "slots");
      fixture.componentRef.setInput("timeSlots", ["09:00", "10:00"]);
      fixture.detectChanges();

      const inputs = el.querySelectorAll<HTMLInputElement>(
        '.tedi-time-picker__grid input[type="radio"]',
      );
      const focusSpy = jest.spyOn(inputs[0], "focus");

      component.focusActiveItem();

      expect(focusSpy).toHaveBeenCalled();
    });

    it("should focus the tabindex-0 item in dropdown variant", () => {
      fixture.componentRef.setInput("variant", "dropdown");
      fixture.componentRef.setInput("timeSlots", ["09:00", "10:00", "11:00"]);
      component.writeValue("10:00");
      fixture.detectChanges();

      const items = el.querySelectorAll<HTMLElement>(
        ".tedi-time-picker__dropdown-item",
      );
      const focusSpy = jest.spyOn(items[1], "focus");

      component.focusActiveItem();

      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe("scrollToSelected", () => {
    it("should not throw when called outside scroll variant", () => {
      fixture.componentRef.setInput("variant", "dropdown");
      fixture.componentRef.setInput("timeSlots", ["09:00"]);
      fixture.detectChanges();

      expect(() => component.scrollToSelected()).not.toThrow();
    });

    it("should align scroll for scroll variant without throwing", () => {
      component.writeValue("12:00");
      fixture.detectChanges();

      expect(() => component.scrollToSelected()).not.toThrow();
    });
  });

  describe("dropdown keyboard fall-through", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("variant", "dropdown");
      fixture.componentRef.setInput("timeSlots", ["09:00", "10:00"]);
      fixture.detectChanges();
    });

    it("should ignore unhandled keys without throwing", () => {
      const items = el.querySelectorAll(".tedi-time-picker__dropdown-item");
      const event = new KeyboardEvent("keydown", { key: "x", bubbles: true });
      const preventSpy = jest.spyOn(event, "preventDefault");

      items[0].dispatchEvent(event);

      expect(preventSpy).not.toHaveBeenCalled();
    });
  });

  describe("scroll variant unhandled keys", () => {
    it("should ignore non-navigation keys", () => {
      component.writeValue("05:00");
      fixture.detectChanges();

      const hourColumn = el.querySelectorAll(".tedi-time-picker__column")[0];
      const event = new KeyboardEvent("keydown", { key: "x", bubbles: true });
      const preventSpy = jest.spyOn(event, "preventDefault");

      hourColumn.dispatchEvent(event);

      expect(preventSpy).not.toHaveBeenCalled();
      expect(component.value()).toBe("05:00");
    });
  });

  describe("scroll-driven selection", () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should commit the value after the scroll debounce settles", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const hourColumn = el.querySelectorAll(
        ".tedi-time-picker__column",
      )[0] as HTMLElement;
      Object.defineProperty(hourColumn, "scrollTop", {
        value: 240,
        configurable: true,
      });
      // The wheel gesture that scrolled the column.
      hourColumn.dispatchEvent(new Event("wheel", { bubbles: true }));
      hourColumn.dispatchEvent(new Event("scroll"));

      jest.runAllTimers();

      expect(onChange).toHaveBeenCalled();
    });

    it("should clear pending debounce timers on destroy", () => {
      const hourColumn = el.querySelectorAll(
        ".tedi-time-picker__column",
      )[0] as HTMLElement;
      Object.defineProperty(hourColumn, "scrollTop", {
        value: 100,
        configurable: true,
      });
      hourColumn.dispatchEvent(new Event("wheel", { bubbles: true }));
      hourColumn.dispatchEvent(new Event("scroll"));

      const clearSpy = jest.spyOn(global, "clearTimeout");
      try {
        fixture.destroy();
        expect(clearSpy).toHaveBeenCalled();
      } finally {
        clearSpy.mockRestore();
      }
    });
  });

  describe("host gesture listeners", () => {
    it("should detach every gesture listener it attached on destroy", () => {
      const localFixture = TestBed.createComponent(TimePickerComponent);
      const localHost = localFixture.nativeElement as HTMLElement;
      const addSpy = jest.spyOn(localHost, "addEventListener");
      const removeSpy = jest.spyOn(localHost, "removeEventListener");

      localFixture.detectChanges();

      const attached = addSpy.mock.calls.filter(([name]) =>
        ["wheel", "touchstart", "pointerdown"].includes(name),
      );
      expect(attached.map(([name]) => name)).toEqual(
        expect.arrayContaining(["wheel", "touchstart", "pointerdown"]),
      );

      localFixture.destroy();

      // The exact same function reference and options object have to come back
      // off the host, which is what the arrow-function handler property buys.
      for (const [name, listener, options] of attached) {
        expect(removeSpy).toHaveBeenCalledWith(name, listener, options);
      }
    });
  });

  describe("programmatic scroll echo", () => {
    const SELECTED_CLASS = "tedi-time-picker__item--selected";

    // jsdom has no layout, so scrollTop is a read-only 0 and measureItemHeight()
    // falls back to DEFAULT_ITEM_HEIGHT (40). A writable stub lets a test place
    // the column at an offset that rounds to a different row than the one the
    // component scrolled to.
    const stubScrollTop = (element: HTMLElement): void => {
      let current = 0;
      Object.defineProperty(element, "scrollTop", {
        configurable: true,
        get: () => current,
        set: (next: number) => {
          current = next;
        },
      });
    };

    const columnAt = (index: number): HTMLElement =>
      el.querySelectorAll<HTMLElement>(".tedi-time-picker__column")[index];

    const itemsIn = (column: HTMLElement): NodeListOf<HTMLElement> =>
      column.querySelectorAll<HTMLElement>(".tedi-time-picker__item");

    // A user scroll is a gesture followed by the scroll it produced. An engine
    // scroll (Gecko handing a recreated column the offset of the one it
    // replaced) arrives with no gesture in front of it.
    const userScrollTo = (column: HTMLElement, top: number): void => {
      column.dispatchEvent(new Event("wheel", { bubbles: true }));
      column.scrollTop = top;
      column.dispatchEvent(new Event("scroll"));
    };

    const engineScrollTo = (column: HTMLElement, top: number): void => {
      column.scrollTop = top;
      column.dispatchEvent(new Event("scroll"));
    };

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should keep the programmatic index when an instant scroll echo rounds to another item", () => {
      const hourColumn = columnAt(0);
      stubScrollTop(hourColumn);

      component.writeValue("09:30");
      fixture.detectChanges();

      expect(component.highlightedHourIndex()).toBe(9);

      // The column settled one row away from the offset the component asked for
      // (384 / 40 rounds to 10). The echo of an instant programmatic scroll must
      // not move the highlight off the authoritative row.
      hourColumn.scrollTop = 384;
      hourColumn.dispatchEvent(new Event("scroll"));
      fixture.detectChanges();

      expect(component.highlightedHourIndex()).toBe(9);

      const hourItems = itemsIn(hourColumn);
      expect(hourItems[9].classList.contains(SELECTED_CLASS)).toBe(true);
      expect(hourItems[10].classList.contains(SELECTED_CLASS)).toBe(false);
    });

    it("should not commit a snap-adjustment echo that lands after the scroll lock expires", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const hourColumn = columnAt(0);
      stubScrollTop(hourColumn);

      component.writeValue("09:30");
      fixture.detectChanges();

      expect(hourColumn.scrollTop).toBe(9 * 40);

      // An echo of the programmatic scroll, delivered after the old fixed 50 ms
      // lock would have expired: with no gesture behind it and an offset the
      // scroll never asked for, it must not become the value.
      jest.advanceTimersByTime(60);

      hourColumn.scrollTop = 560;
      hourColumn.dispatchEvent(new Event("scroll"));
      jest.advanceTimersByTime(200);
      fixture.detectChanges();

      expect(component.value()).toBe("09:30");
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should not commit a snap-adjustment echo that trickles in over several frames", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const hourColumn = columnAt(0);
      stubScrollTop(hourColumn);

      component.writeValue("09:30");
      fixture.detectChanges();

      // A slow machine can stretch the settling well past any fixed window, so
      // each event has to keep the scroll marked programmatic.
      for (const offset of [420, 470, 520, 560, 600]) {
        jest.advanceTimersByTime(120);
        hourColumn.scrollTop = offset;
        hourColumn.dispatchEvent(new Event("scroll"));
      }

      jest.advanceTimersByTime(1000);
      fixture.detectChanges();

      expect(component.value()).toBe("09:30");
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should still commit a user scroll that follows a settled programmatic scroll", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const hourColumn = columnAt(0);
      stubScrollTop(hourColumn);

      component.writeValue("09:30");
      fixture.detectChanges();

      // Everything the programmatic scroll caused has been delivered and the
      // column has been still since; the wheel is the user's again.
      jest.advanceTimersByTime(1000);

      userScrollTo(hourColumn, 15 * 40);
      jest.advanceTimersByTime(200);
      fixture.detectChanges();

      expect(component.value()).toBe("15:30");
      expect(onChange).toHaveBeenCalledWith("15:30");
      expect(component.highlightedHourIndex()).toBe(15);
    });

    it("should put the column back when the engine scrolls it with no gesture", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const hourColumn = columnAt(0);
      stubScrollTop(hourColumn);

      component.writeValue("09:30");
      fixture.detectChanges();
      jest.advanceTimersByTime(1000);

      // Gecko drops the previous picker's offset onto this column.
      engineScrollTo(hourColumn, 14 * 40);
      jest.advanceTimersByTime(200);
      fixture.detectChanges();

      expect(component.value()).toBe("09:30");
      expect(onChange).not.toHaveBeenCalled();
      expect(hourColumn.scrollTop).toBe(9 * 40);
      expect(component.highlightedHourIndex()).toBe(9);
    });

    it("should put the column back when the engine scrolls it while the programmatic scroll is settling", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const hourColumn = columnAt(0);
      stubScrollTop(hourColumn);

      component.writeValue("09:30");
      fixture.detectChanges();

      // Inside the settle window of the alignment that the value triggered.
      jest.advanceTimersByTime(20);
      engineScrollTo(hourColumn, 14 * 40);
      jest.advanceTimersByTime(200);
      fixture.detectChanges();

      expect(component.value()).toBe("09:30");
      expect(onChange).not.toHaveBeenCalled();
      expect(hourColumn.scrollTop).toBe(9 * 40);
      expect(component.highlightedHourIndex()).toBe(9);
    });

    it("should leave a snap adjustment of the programmatic scroll alone", () => {
      const hourColumn = columnAt(0);
      stubScrollTop(hourColumn);

      component.writeValue("09:30");
      fixture.detectChanges();

      // Within one row of the offset asked for, which is as far as a snap
      // adjustment can move the column.
      jest.advanceTimersByTime(60);
      engineScrollTo(hourColumn, 9 * 40 + 24);
      jest.advanceTimersByTime(200);
      fixture.detectChanges();

      expect(component.value()).toBe("09:30");
      expect(hourColumn.scrollTop).toBe(9 * 40 + 24);
      expect(component.highlightedHourIndex()).toBe(9);
    });

    it("should track the highlight live while a smooth programmatic scroll runs", () => {
      const hourColumn = columnAt(0);
      stubScrollTop(hourColumn);

      itemsIn(hourColumn)[15].click();
      fixture.detectChanges();

      expect(component.highlightedHourIndex()).toBe(15);

      // Mid-animation position of the smooth scroll started by the click.
      hourColumn.scrollTop = 480;
      hourColumn.dispatchEvent(new Event("scroll"));
      fixture.detectChanges();

      expect(component.highlightedHourIndex()).toBe(12);
      expect(itemsIn(hourColumn)[12].classList.contains(SELECTED_CLASS)).toBe(
        true,
      );
    });

    it("should re-align the column for a new value while the previous scroll is still settling", () => {
      const hourColumn = columnAt(0);
      stubScrollTop(hourColumn);

      component.writeValue("09:30");
      fixture.detectChanges();

      expect(hourColumn.scrollTop).toBe(9 * 40);

      // Still inside the settle window of the first scroll.
      jest.advanceTimersByTime(20);

      component.writeValue("17:30");
      fixture.detectChanges();

      expect(hourColumn.scrollTop).toBe(17 * 40);
      expect(component.highlightedHourIndex()).toBe(17);
    });

    it("should re-align the columns when the measured item height changes", () => {
      let notifyResize: (() => void) | undefined;
      class ResizeObserverMock {
        constructor(callback: () => void) {
          notifyResize = callback;
        }
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      }
      const originalResizeObserver = globalThis.ResizeObserver;
      globalThis.ResizeObserver =
        ResizeObserverMock as unknown as typeof ResizeObserver;

      try {
        const localFixture = TestBed.createComponent(TimePickerComponent);
        const localEl = localFixture.nativeElement as HTMLElement;
        localFixture.detectChanges();

        const hourColumn = localEl.querySelectorAll<HTMLElement>(
          ".tedi-time-picker__column",
        )[0];
        stubScrollTop(hourColumn);

        localFixture.componentInstance.writeValue("09:30");
        localFixture.detectChanges();

        // Measured through the DEFAULT_ITEM_HEIGHT fallback jsdom forces.
        expect(hourColumn.scrollTop).toBe(9 * 40);

        const item = localEl.querySelector<HTMLElement>(
          ".tedi-time-picker__item",
        )!;
        Object.defineProperty(item, "offsetHeight", {
          value: 48,
          configurable: true,
        });
        notifyResize?.();

        expect(hourColumn.scrollTop).toBe(9 * 48);
        expect(localFixture.componentInstance.highlightedHourIndex()).toBe(9);
      } finally {
        globalThis.ResizeObserver = originalResizeObserver;
      }
    });

    // Every gesture in the suite used to be a wheel, so dropping "touchstart"
    // or "pointerdown" from the gesture list changed nothing. A scroll that
    // any of them started has to be read as the user's.
    const expectGestureScrollCommits = (gesture: string): void => {
      const hourColumn = columnAt(0);
      stubScrollTop(hourColumn);

      component.writeValue("09:30");
      fixture.detectChanges();
      jest.advanceTimersByTime(1000);

      hourColumn.dispatchEvent(new Event(gesture, { bubbles: true }));
      hourColumn.scrollTop = 15 * 40;
      hourColumn.dispatchEvent(new Event("scroll"));
      jest.advanceTimersByTime(200);
      fixture.detectChanges();

      expect(component.highlightedHourIndex()).toBe(15);
      expect(component.value()).toBe("15:30");
    };

    it("should commit a scroll that a touchstart started", () => {
      expectGestureScrollCommits("touchstart");
    });

    it("should commit a scroll that a pointerdown started", () => {
      expectGestureScrollCommits("pointerdown");
    });

    it("should commit the user's scroll when it starts while a smooth programmatic scroll is running", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const hourColumn = columnAt(0);
      stubScrollTop(hourColumn);

      itemsIn(hourColumn)[15].click();
      fixture.detectChanges();

      expect(component.value()).toBe("15:00");

      // The wheel starts spinning before the smooth scroll to 15 has finished.
      // The user owns the column from the first event, however many follow.
      for (const offset of [640, 680, 720]) {
        jest.advanceTimersByTime(16);
        hourColumn.dispatchEvent(new Event("wheel", { bubbles: true }));
        hourColumn.scrollTop = offset;
        hourColumn.dispatchEvent(new Event("scroll"));
      }

      jest.advanceTimersByTime(200);
      fixture.detectChanges();

      expect(component.highlightedHourIndex()).toBe(18);
      expect(component.value()).toBe("18:00");
      expect(onChange).toHaveBeenLastCalledWith("18:00");
    });

    it("should not let a gesture that never scrolled anything turn a later engine scroll into a value", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const hourColumn = columnAt(0);
      stubScrollTop(hourColumn);

      component.writeValue("09:30");
      fixture.detectChanges();
      jest.advanceTimersByTime(1000);

      // A pointer going down on the faded padding at the end of the column:
      // it is inside the column, it hits no item, and nothing scrolls.
      hourColumn.dispatchEvent(new Event("pointerdown", { bubbles: true }));
      jest.advanceTimersByTime(1000);

      // Long afterwards, Gecko drops the previous picker's offset onto this
      // column. There is no gesture behind it.
      engineScrollTo(hourColumn, 14 * 40);
      jest.advanceTimersByTime(200);
      fixture.detectChanges();

      expect(component.value()).toBe("09:30");
      expect(onChange).not.toHaveBeenCalled();
      expect(hourColumn.scrollTop).toBe(9 * 40);
      expect(component.highlightedHourIndex()).toBe(9);
    });

    it("should commit a user scroll that lands within one row of the programmatic target", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const hourColumn = columnAt(0);
      stubScrollTop(hourColumn);

      component.writeValue("09:30");
      fixture.detectChanges();

      // Still inside the settle window of the alignment, and one row is as
      // close as a scroll can start to where that alignment parked.
      jest.advanceTimersByTime(20);
      userScrollTo(hourColumn, 10 * 40);
      jest.advanceTimersByTime(200);
      fixture.detectChanges();

      expect(component.highlightedHourIndex()).toBe(10);
      expect(component.value()).toBe("10:30");
      expect(onChange).toHaveBeenCalledWith("10:30");
    });

    it("should keep the cached item height when a resize fires with no layout box", () => {
      let notifyResize: (() => void) | undefined;
      class ResizeObserverMock {
        constructor(callback: () => void) {
          notifyResize = callback;
        }
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {}
      }
      const originalResizeObserver = globalThis.ResizeObserver;
      globalThis.ResizeObserver =
        ResizeObserverMock as unknown as typeof ResizeObserver;

      try {
        const localFixture = TestBed.createComponent(TimePickerComponent);
        const localEl = localFixture.nativeElement as HTMLElement;
        localFixture.detectChanges();

        const hourColumn = localEl.querySelectorAll<HTMLElement>(
          ".tedi-time-picker__column",
        )[0];
        stubScrollTop(hourColumn);

        localFixture.componentInstance.writeValue("09:30");
        localFixture.detectChanges();

        const item = localEl.querySelector<HTMLElement>(
          ".tedi-time-picker__item",
        )!;
        Object.defineProperty(item, "offsetHeight", {
          value: 48,
          configurable: true,
        });
        notifyResize?.();
        expect(hourColumn.scrollTop).toBe(9 * 48);

        jest.advanceTimersByTime(1000);

        // The consumer hides the picker, so the observer fires with every box
        // collapsed to 0. A row is not 40px tall because it has no box.
        Object.defineProperty(item, "offsetHeight", {
          value: 0,
          configurable: true,
        });
        notifyResize?.();

        expect(hourColumn.scrollTop).toBe(9 * 48);

        // The cached height still has to be the one the rows actually have,
        // so the next user scroll reads the right row out of the offset.
        hourColumn.dispatchEvent(new Event("wheel", { bubbles: true }));
        hourColumn.scrollTop = 15 * 48;
        hourColumn.dispatchEvent(new Event("scroll"));
        jest.advanceTimersByTime(200);

        expect(localFixture.componentInstance.value()).toBe("15:30");
      } finally {
        globalThis.ResizeObserver = originalResizeObserver;
      }
    });
  });
});

@Component({
  standalone: true,
  imports: [TimePickerComponent, ReactiveFormsModule],
  template: `<tedi-time-picker [formControl]="control" />`,
})
class TestHostComponent {
  control = new FormControl<string | null>(null);
}

describe("TimePickerComponent with ReactiveFormsModule", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should sync FormControl value to component", () => {
    host.control.setValue("12:00");
    fixture.detectChanges();

    const hourItems = el
      .querySelectorAll(".tedi-time-picker__column")[0]
      .querySelectorAll(".tedi-time-picker__item");
    expect(
      hourItems[12].classList.contains("tedi-time-picker__item--selected"),
    ).toBe(true);
  });

  it("should sync component selection to FormControl", () => {
    const hourItems = el
      .querySelectorAll(".tedi-time-picker__column")[0]
      .querySelectorAll(".tedi-time-picker__item");
    (hourItems[8] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(host.control.value).toBe("08:00");
  });
});
