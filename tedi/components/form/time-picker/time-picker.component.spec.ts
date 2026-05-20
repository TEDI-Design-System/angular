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
      providers: [
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
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
      expect(hourItems[9].classList.contains("tedi-time-picker__item--selected")).toBe(true);

      const minuteItems = el
        .querySelectorAll(".tedi-time-picker__column")[1]
        .querySelectorAll(".tedi-time-picker__item");
      expect(minuteItems[15].classList.contains("tedi-time-picker__item--selected")).toBe(true);
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
        const hourItems = columns[0].querySelectorAll(".tedi-time-picker__item");
        const minuteItems = columns[1].querySelectorAll(".tedi-time-picker__item");

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
        element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
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

        const minuteColumn = el.querySelectorAll(".tedi-time-picker__column")[1];
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
      expect(items[1].classList.contains("tedi-time-picker__dropdown-item--selected")).toBe(true);
      expect(items[0].classList.contains("tedi-time-picker__dropdown-item--selected")).toBe(false);
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
        element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
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

    it("should clear visual highlight when value is reset to null", () => {
      component.writeValue("14:30");
      fixture.detectChanges();

      let columns = el.querySelectorAll(".tedi-time-picker__column");
      let hourItems = columns[0].querySelectorAll(".tedi-time-picker__item");
      let minuteItems = columns[1].querySelectorAll(".tedi-time-picker__item");
      expect(hourItems[14].classList.contains("tedi-time-picker__item--selected")).toBe(true);
      expect(minuteItems[30].classList.contains("tedi-time-picker__item--selected")).toBe(true);

      component.writeValue(null);
      fixture.detectChanges();

      columns = el.querySelectorAll(".tedi-time-picker__column");
      hourItems = columns[0].querySelectorAll(".tedi-time-picker__item");
      minuteItems = columns[1].querySelectorAll(".tedi-time-picker__item");
      expect(hourItems[0].classList.contains("tedi-time-picker__item--selected")).toBe(true);
      expect(hourItems[14].classList.contains("tedi-time-picker__item--selected")).toBe(false);
      expect(minuteItems[0].classList.contains("tedi-time-picker__item--selected")).toBe(true);
      expect(minuteItems[30].classList.contains("tedi-time-picker__item--selected")).toBe(false);
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
      providers: [
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
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
    expect(hourItems[12].classList.contains("tedi-time-picker__item--selected")).toBe(true);
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
