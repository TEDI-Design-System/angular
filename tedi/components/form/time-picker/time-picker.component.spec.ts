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

    describe("roving tabindex", () => {
      it("should set tabindex 0 on first item when no selection", () => {
        const hourItems = el
          .querySelectorAll(".tedi-time-picker__column")[0]
          .querySelectorAll(".tedi-time-picker__item");
        expect(hourItems[0].getAttribute("tabindex")).toBe("0");
        expect(hourItems[1].getAttribute("tabindex")).toBe("-1");
      });

      it("should set tabindex 0 on selected item", () => {
        component.writeValue("05:30");
        fixture.detectChanges();

        const hourItems = el
          .querySelectorAll(".tedi-time-picker__column")[0]
          .querySelectorAll(".tedi-time-picker__item");
        expect(hourItems[5].getAttribute("tabindex")).toBe("0");
        expect(hourItems[0].getAttribute("tabindex")).toBe("-1");

        const minuteItems = el
          .querySelectorAll(".tedi-time-picker__column")[1]
          .querySelectorAll(".tedi-time-picker__item");
        expect(minuteItems[30].getAttribute("tabindex")).toBe("0");
        expect(minuteItems[0].getAttribute("tabindex")).toBe("-1");
      });
    });

    describe("keyboard navigation", () => {
      const dispatchKey = (element: HTMLElement, key: string) => {
        element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      };

      it("should move focus with ArrowDown", () => {
        const hourItems = el
          .querySelectorAll(".tedi-time-picker__column")[0]
          .querySelectorAll(".tedi-time-picker__item");
        (hourItems[0] as HTMLElement).focus();
        dispatchKey(hourItems[0] as HTMLElement, "ArrowDown");
        expect(document.activeElement).toBe(hourItems[1]);
      });

      it("should move focus with ArrowUp", () => {
        const hourItems = el
          .querySelectorAll(".tedi-time-picker__column")[0]
          .querySelectorAll(".tedi-time-picker__item");
        (hourItems[2] as HTMLElement).focus();
        dispatchKey(hourItems[2] as HTMLElement, "ArrowUp");
        expect(document.activeElement).toBe(hourItems[1]);
      });

      it("should move focus to first item with Home", () => {
        const hourItems = el
          .querySelectorAll(".tedi-time-picker__column")[0]
          .querySelectorAll(".tedi-time-picker__item");
        (hourItems[10] as HTMLElement).focus();
        dispatchKey(hourItems[10] as HTMLElement, "Home");
        expect(document.activeElement).toBe(hourItems[0]);
      });

      it("should move focus to last item with End", () => {
        const hourItems = el
          .querySelectorAll(".tedi-time-picker__column")[0]
          .querySelectorAll(".tedi-time-picker__item");
        (hourItems[0] as HTMLElement).focus();
        dispatchKey(hourItems[0] as HTMLElement, "End");
        expect(document.activeElement).toBe(hourItems[23]);
      });

      it("should jump 5 items with PageDown", () => {
        const hourItems = el
          .querySelectorAll(".tedi-time-picker__column")[0]
          .querySelectorAll(".tedi-time-picker__item");
        (hourItems[0] as HTMLElement).focus();
        dispatchKey(hourItems[0] as HTMLElement, "PageDown");
        expect(document.activeElement).toBe(hourItems[5]);
      });

      it("should jump 5 items with PageUp", () => {
        const hourItems = el
          .querySelectorAll(".tedi-time-picker__column")[0]
          .querySelectorAll(".tedi-time-picker__item");
        (hourItems[10] as HTMLElement).focus();
        dispatchKey(hourItems[10] as HTMLElement, "PageUp");
        expect(document.activeElement).toBe(hourItems[5]);
      });

      it("should select item with Enter", () => {
        const onChange = jest.fn();
        component.registerOnChange(onChange);

        const hourItems = el
          .querySelectorAll(".tedi-time-picker__column")[0]
          .querySelectorAll(".tedi-time-picker__item");
        (hourItems[8] as HTMLElement).focus();
        dispatchKey(hourItems[8] as HTMLElement, "Enter");

        expect(component.value()).toBe("08:00");
        expect(onChange).toHaveBeenCalledWith("08:00");
      });

      it("should select item with Space", () => {
        const onChange = jest.fn();
        component.registerOnChange(onChange);

        const minuteItems = el
          .querySelectorAll(".tedi-time-picker__column")[1]
          .querySelectorAll(".tedi-time-picker__item");
        (minuteItems[15] as HTMLElement).focus();
        dispatchKey(minuteItems[15] as HTMLElement, " ");

        expect(component.value()).toBe("00:15");
        expect(onChange).toHaveBeenCalledWith("00:15");
      });

      it("should not move past first item with ArrowUp", () => {
        const hourItems = el
          .querySelectorAll(".tedi-time-picker__column")[0]
          .querySelectorAll(".tedi-time-picker__item");
        (hourItems[0] as HTMLElement).focus();
        dispatchKey(hourItems[0] as HTMLElement, "ArrowUp");
        expect(document.activeElement).toBe(hourItems[0]);
      });

      it("should not move past last item with ArrowDown", () => {
        const hourItems = el
          .querySelectorAll(".tedi-time-picker__column")[0]
          .querySelectorAll(".tedi-time-picker__item");
        (hourItems[23] as HTMLElement).focus();
        dispatchKey(hourItems[23] as HTMLElement, "ArrowDown");
        expect(document.activeElement).toBe(hourItems[23]);
      });

      it("should not trap Tab when trapFocus is false", () => {
        const hourItems = el
          .querySelectorAll(".tedi-time-picker__column")[0]
          .querySelectorAll(".tedi-time-picker__item");
        const minuteItems = el
          .querySelectorAll(".tedi-time-picker__column")[1]
          .querySelectorAll(".tedi-time-picker__item");

        (hourItems[0] as HTMLElement).focus();
        dispatchKey(hourItems[0] as HTMLElement, "Tab");

        // Tab should not move focus to minute column (not trapped)
        expect(document.activeElement).not.toBe(minuteItems[0]);
      });

      describe("with trapFocus enabled", () => {
        beforeEach(() => {
          fixture.componentRef.setInput("trapFocus", true);
          fixture.detectChanges();
        });

        it("should move focus from hour to minute column on Tab", () => {
          const hourItems = el
            .querySelectorAll(".tedi-time-picker__column")[0]
            .querySelectorAll(".tedi-time-picker__item");
          const minuteItems = el
            .querySelectorAll(".tedi-time-picker__column")[1]
            .querySelectorAll(".tedi-time-picker__item");

          (hourItems[0] as HTMLElement).focus();
          dispatchKey(hourItems[0] as HTMLElement, "Tab");

          expect(document.activeElement).toBe(minuteItems[0]);
        });

        it("should move focus from minute to hour column on Tab", () => {
          const hourItems = el
            .querySelectorAll(".tedi-time-picker__column")[0]
            .querySelectorAll(".tedi-time-picker__item");
          const minuteItems = el
            .querySelectorAll(".tedi-time-picker__column")[1]
            .querySelectorAll(".tedi-time-picker__item");

          (minuteItems[0] as HTMLElement).focus();
          dispatchKey(minuteItems[0] as HTMLElement, "Tab");

          expect(document.activeElement).toBe(hourItems[0]);
        });

        it("should focus selected item in target column on Tab", () => {
          component.writeValue("05:30");
          fixture.detectChanges();

          const hourItems = el
            .querySelectorAll(".tedi-time-picker__column")[0]
            .querySelectorAll(".tedi-time-picker__item");
          const minuteItems = el
            .querySelectorAll(".tedi-time-picker__column")[1]
            .querySelectorAll(".tedi-time-picker__item");

          (hourItems[5] as HTMLElement).focus();
          dispatchKey(hourItems[5] as HTMLElement, "Tab");

          expect(document.activeElement).toBe(minuteItems[30]);
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

    it("should render slot buttons", () => {
      const slotButtons = el.querySelectorAll(".tedi-time-picker__slot");
      expect(slotButtons.length).toBe(6);
    });

    it("should select slot on click", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const slotButtons = el.querySelectorAll(".tedi-time-picker__slot");
      (slotButtons[2] as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(component.value()).toBe("11:00");
      expect(onChange).toHaveBeenCalledWith("11:00");
    });

    it("should highlight selected slot", () => {
      component.writeValue("10:30");
      fixture.detectChanges();

      const slotButtons = el.querySelectorAll(".tedi-time-picker__slot");
      expect(slotButtons[1].classList.contains("tedi-time-picker__slot--selected")).toBe(true);
      expect(slotButtons[0].classList.contains("tedi-time-picker__slot--selected")).toBe(false);
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

    it("should set aria-checked on selected slot", () => {
      component.writeValue("14:00");
      fixture.detectChanges();

      const slotButtons = el.querySelectorAll(".tedi-time-picker__slot");
      expect(slotButtons[3].getAttribute("aria-checked")).toBe("true");
      expect(slotButtons[0].getAttribute("aria-checked")).toBe("false");
    });

    describe("roving tabindex", () => {
      it("should set tabindex 0 on first item when no selection", () => {
        const slots = el.querySelectorAll(".tedi-time-picker__slot");
        expect(slots[0].getAttribute("tabindex")).toBe("0");
        expect(slots[1].getAttribute("tabindex")).toBe("-1");
      });

      it("should set tabindex 0 on selected item", () => {
        component.writeValue("11:00");
        fixture.detectChanges();

        const slots = el.querySelectorAll(".tedi-time-picker__slot");
        expect(slots[2].getAttribute("tabindex")).toBe("0");
        expect(slots[0].getAttribute("tabindex")).toBe("-1");
      });
    });

    describe("keyboard navigation", () => {
      const dispatchKey = (element: HTMLElement, key: string) => {
        element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
      };

      it("should move focus with ArrowRight", () => {
        const slots = el.querySelectorAll(".tedi-time-picker__slot");
        (slots[0] as HTMLElement).focus();
        dispatchKey(slots[0] as HTMLElement, "ArrowRight");
        expect(document.activeElement).toBe(slots[1]);
      });

      it("should move focus with ArrowLeft", () => {
        const slots = el.querySelectorAll(".tedi-time-picker__slot");
        (slots[2] as HTMLElement).focus();
        dispatchKey(slots[2] as HTMLElement, "ArrowLeft");
        expect(document.activeElement).toBe(slots[1]);
      });

      it("should move focus with ArrowDown by column count", () => {
        const slots = el.querySelectorAll(".tedi-time-picker__slot");
        (slots[0] as HTMLElement).focus();
        dispatchKey(slots[0] as HTMLElement, "ArrowDown");
        expect(document.activeElement).toBe(slots[3]);
      });

      it("should move focus with ArrowUp by column count", () => {
        const slots = el.querySelectorAll(".tedi-time-picker__slot");
        (slots[3] as HTMLElement).focus();
        dispatchKey(slots[3] as HTMLElement, "ArrowUp");
        expect(document.activeElement).toBe(slots[0]);
      });

      it("should select slot with Enter", () => {
        const onChange = jest.fn();
        component.registerOnChange(onChange);

        const slots = el.querySelectorAll(".tedi-time-picker__slot");
        (slots[1] as HTMLElement).focus();
        dispatchKey(slots[1] as HTMLElement, "Enter");

        expect(component.value()).toBe("10:30");
        expect(onChange).toHaveBeenCalledWith("10:30");
      });

      it("should not trap Tab when trapFocus is false", () => {
        const closeRequested = jest.spyOn(component.closeRequested, "emit");
        const slots = el.querySelectorAll(".tedi-time-picker__slot");
        (slots[0] as HTMLElement).focus();
        dispatchKey(slots[0] as HTMLElement, "Tab");

        expect(closeRequested).not.toHaveBeenCalled();
      });

      it("should emit closeRequested on Tab when trapFocus is true", () => {
        fixture.componentRef.setInput("trapFocus", true);
        fixture.detectChanges();

        const closeRequested = jest.spyOn(component.closeRequested, "emit");
        const slots = el.querySelectorAll(".tedi-time-picker__slot");
        (slots[0] as HTMLElement).focus();
        dispatchKey(slots[0] as HTMLElement, "Tab");

        expect(closeRequested).toHaveBeenCalled();
      });
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
