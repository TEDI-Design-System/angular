import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RatingComponent, RatingItem } from "./rating.component";

describe("RatingComponent", () => {
  let fixture: ComponentFixture<RatingComponent>;
  let component: RatingComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RatingComponent],
    });

    fixture = TestBed.createComponent(RatingComponent);
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

  it("should have radiogroup role on host", () => {
    expect(el.getAttribute("role")).toBe("radiogroup");
  });

  it("should set aria-label on host", () => {
    fixture.componentRef.setInput("ariaLabel", "Rate this");
    fixture.detectChanges();

    expect(el.getAttribute("aria-label")).toBe("Rate this");
  });

  describe("star variant", () => {
    it("should render 5 star buttons by default", () => {
      const stars = el.querySelectorAll(".tedi-rating__star");
      expect(stars.length).toBe(5);
    });

    it("should have radio role on each star", () => {
      const stars = el.querySelectorAll(".tedi-rating__star");
      stars.forEach((star) => {
        expect(star.getAttribute("role")).toBe("radio");
      });
    });

    it("should select star on click", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const stars = el.querySelectorAll(".tedi-rating__star");
      (stars[2] as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(component.value()).toBe(3);
      expect(onChange).toHaveBeenCalledWith(3);
    });

    it("should deselect on clicking same star", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      component.writeValue(3);
      fixture.detectChanges();

      const stars = el.querySelectorAll(".tedi-rating__star");
      (stars[2] as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(component.value()).toBeNull();
      expect(onChange).toHaveBeenCalledWith(null);
    });

    it("should fill all stars up to selected value", () => {
      component.writeValue(3);
      fixture.detectChanges();

      const stars = el.querySelectorAll(".tedi-rating__star");
      expect(
        stars[0].classList.contains("tedi-rating__star--selected"),
      ).toBe(true);
      expect(
        stars[1].classList.contains("tedi-rating__star--selected"),
      ).toBe(true);
      expect(
        stars[2].classList.contains("tedi-rating__star--selected"),
      ).toBe(true);
      expect(
        stars[3].classList.contains("tedi-rating__star--selected"),
      ).toBe(false);
      expect(
        stars[4].classList.contains("tedi-rating__star--selected"),
      ).toBe(false);
    });

    it("should set aria-checked on selected star", () => {
      component.writeValue(2);
      fixture.detectChanges();

      const stars = el.querySelectorAll(".tedi-rating__star");
      expect(stars[1].getAttribute("aria-checked")).toBe("true");
      expect(stars[0].getAttribute("aria-checked")).toBe("false");
      expect(stars[2].getAttribute("aria-checked")).toBe("false");
    });

    it("should have aria-label with index on each star", () => {
      const stars = el.querySelectorAll(".tedi-rating__star");
      expect(stars[0].getAttribute("aria-label")).toBe("1 / 5");
      expect(stars[4].getAttribute("aria-label")).toBe("5 / 5");
    });

    it("should use filled icon variant for selected stars", () => {
      component.writeValue(3);
      fixture.detectChanges();

      const icons = el.querySelectorAll("tedi-icon");
      expect(icons[0].classList.contains("tedi-icon--filled")).toBe(true);
      expect(icons[2].classList.contains("tedi-icon--filled")).toBe(true);
      expect(icons[3].classList.contains("tedi-icon--filled")).toBe(false);
    });

    it("should apply host variant class", () => {
      expect(el.classList.contains("tedi-rating--star")).toBe(true);
    });
  });

  describe("max input", () => {
    it("should render custom number of stars with max", () => {
      fixture.componentRef.setInput("max", 10);
      fixture.detectChanges();

      const stars = el.querySelectorAll(".tedi-rating__star");
      expect(stars.length).toBe(10);
    });
  });

  describe("number variant", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("variant", "number");
      fixture.componentRef.setInput("max", 10);
      fixture.detectChanges();
    });

    it("should render 10 number buttons", () => {
      const numbers = el.querySelectorAll(".tedi-rating__number");
      expect(numbers.length).toBe(10);
    });

    it("should display numbers 1-10", () => {
      const numbers = el.querySelectorAll(".tedi-rating__number");
      expect(numbers[0].textContent?.trim()).toBe("1");
      expect(numbers[9].textContent?.trim()).toBe("10");
    });

    it("should select number on click", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const numbers = el.querySelectorAll(".tedi-rating__number");
      (numbers[6] as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(component.value()).toBe(7);
      expect(onChange).toHaveBeenCalledWith(7);
    });

    it("should highlight only selected number", () => {
      component.writeValue(5);
      fixture.detectChanges();

      const numbers = el.querySelectorAll(".tedi-rating__number");
      expect(
        numbers[4].classList.contains("tedi-rating__number--selected"),
      ).toBe(true);
      expect(
        numbers[3].classList.contains("tedi-rating__number--selected"),
      ).toBe(false);
      expect(
        numbers[5].classList.contains("tedi-rating__number--selected"),
      ).toBe(false);
    });

    it("should render startLabel under first item", () => {
      fixture.componentRef.setInput("startLabel", "Väga halb");
      fixture.detectChanges();

      const labels = el.querySelectorAll(".tedi-rating__label");
      expect(labels.length).toBe(1);
      expect(labels[0].textContent?.trim()).toBe("Väga halb");
    });

    it("should render endLabel under last item", () => {
      fixture.componentRef.setInput("endLabel", "Suurepärane");
      fixture.detectChanges();

      const labels = el.querySelectorAll(".tedi-rating__label");
      expect(labels.length).toBe(1);
      expect(labels[0].textContent?.trim()).toBe("Suurepärane");
    });

    it("should render both startLabel and endLabel", () => {
      fixture.componentRef.setInput("startLabel", "Väga halb");
      fixture.componentRef.setInput("endLabel", "Suurepärane");
      fixture.detectChanges();

      const labels = el.querySelectorAll(".tedi-rating__label");
      expect(labels.length).toBe(2);
      expect(labels[0].textContent?.trim()).toBe("Väga halb");
      expect(labels[1].textContent?.trim()).toBe("Suurepärane");
    });

    it("should apply host variant class", () => {
      expect(el.classList.contains("tedi-rating--number")).toBe(true);
    });
  });

  describe("icon variant", () => {
    const items: RatingItem[] = [
      { icon: "sentiment_very_dissatisfied", label: "Väga halb" },
      { icon: "sentiment_dissatisfied", label: "Halb" },
      { icon: "sentiment_neutral", label: "Keskmine" },
      { icon: "sentiment_satisfied", label: "Hea" },
      { icon: "sentiment_very_satisfied", label: "Väga hea" },
    ];

    beforeEach(() => {
      fixture.componentRef.setInput("variant", "icon");
      fixture.componentRef.setInput("items", items);
      fixture.detectChanges();
    });

    it("should render icon buttons matching items length", () => {
      const buttons = el.querySelectorAll(".tedi-rating__icon-btn");
      expect(buttons.length).toBe(5);
    });

    it("should render tedi-icon inside each button", () => {
      const buttons = el.querySelectorAll(".tedi-rating__icon-btn");
      const icon = buttons[0].querySelector("tedi-icon");
      expect(icon).toBeTruthy();
    });

    it("should render labels below buttons", () => {
      const labelEls = el.querySelectorAll(".tedi-rating__label");
      expect(labelEls.length).toBe(5);
      expect(labelEls[0].textContent?.trim()).toBe("Väga halb");
      expect(labelEls[4].textContent?.trim()).toBe("Väga hea");
    });

    it("should select icon on click", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const buttons = el.querySelectorAll(".tedi-rating__icon-btn");
      (buttons[3] as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(component.value()).toBe(4);
      expect(onChange).toHaveBeenCalledWith(4);
    });

    it("should highlight only selected icon", () => {
      component.writeValue(3);
      fixture.detectChanges();

      const buttons = el.querySelectorAll(".tedi-rating__icon-btn");
      expect(
        buttons[2].classList.contains("tedi-rating__icon-btn--selected"),
      ).toBe(true);
      expect(
        buttons[1].classList.contains("tedi-rating__icon-btn--selected"),
      ).toBe(false);
    });

    it("should use label as aria-label on button", () => {
      const buttons = el.querySelectorAll(".tedi-rating__icon-btn");
      expect(buttons[0].getAttribute("aria-label")).toBe("Väga halb");
    });

    it("should not render labels when items have no label", () => {
      fixture.componentRef.setInput("items", [
        { icon: "star" },
        { icon: "favorite" },
      ]);
      fixture.detectChanges();

      const labelEls = el.querySelectorAll(".tedi-rating__label");
      expect(labelEls.length).toBe(0);
    });

    it("should apply host variant class", () => {
      expect(el.classList.contains("tedi-rating--icon")).toBe(true);
    });
  });

  describe("disabled state", () => {
    it("should disable buttons via setDisabledState", () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      const stars = el.querySelectorAll(".tedi-rating__star");
      stars.forEach((star) => {
        expect((star as HTMLButtonElement).disabled).toBe(true);
      });
    });

    it("should not change value when disabled", () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      const onChange = jest.fn();
      component.registerOnChange(onChange);

      component.select(3);
      expect(component.value()).toBeNull();
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should apply disabled host class", () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(el.classList.contains("tedi-rating--disabled")).toBe(true);
    });
  });

  describe("roving tabindex", () => {
    it("should set tabindex 0 on first item when no selection", () => {
      const stars = el.querySelectorAll(".tedi-rating__star");
      expect(stars[0].getAttribute("tabindex")).toBe("0");
      expect(stars[1].getAttribute("tabindex")).toBe("-1");
    });

    it("should set tabindex 0 on selected item", () => {
      component.writeValue(3);
      fixture.detectChanges();

      const stars = el.querySelectorAll(".tedi-rating__star");
      expect(stars[2].getAttribute("tabindex")).toBe("0");
      expect(stars[0].getAttribute("tabindex")).toBe("-1");
    });

    it("should set tabindex -1 on all items when disabled", () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      const stars = el.querySelectorAll(".tedi-rating__star");
      stars.forEach((star) => {
        expect(star.getAttribute("tabindex")).toBe("-1");
      });
    });
  });

  describe("keyboard navigation", () => {
    const dispatchKey = (element: HTMLElement, key: string) => {
      element.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true }),
      );
    };

    it("should move focus with ArrowRight", () => {
      const stars = el.querySelectorAll(".tedi-rating__star");
      (stars[0] as HTMLElement).focus();
      dispatchKey(stars[0] as HTMLElement, "ArrowRight");
      expect(document.activeElement).toBe(stars[1]);
    });

    it("should move focus with ArrowLeft", () => {
      const stars = el.querySelectorAll(".tedi-rating__star");
      (stars[2] as HTMLElement).focus();
      dispatchKey(stars[2] as HTMLElement, "ArrowLeft");
      expect(document.activeElement).toBe(stars[1]);
    });

    it("should move focus with ArrowDown", () => {
      const stars = el.querySelectorAll(".tedi-rating__star");
      (stars[0] as HTMLElement).focus();
      dispatchKey(stars[0] as HTMLElement, "ArrowDown");
      expect(document.activeElement).toBe(stars[1]);
    });

    it("should move focus with ArrowUp", () => {
      const stars = el.querySelectorAll(".tedi-rating__star");
      (stars[2] as HTMLElement).focus();
      dispatchKey(stars[2] as HTMLElement, "ArrowUp");
      expect(document.activeElement).toBe(stars[1]);
    });

    it("should wrap from last to first with ArrowRight", () => {
      const stars = el.querySelectorAll(".tedi-rating__star");
      (stars[4] as HTMLElement).focus();
      dispatchKey(stars[4] as HTMLElement, "ArrowRight");
      expect(document.activeElement).toBe(stars[0]);
    });

    it("should wrap from first to last with ArrowLeft", () => {
      const stars = el.querySelectorAll(".tedi-rating__star");
      (stars[0] as HTMLElement).focus();
      dispatchKey(stars[0] as HTMLElement, "ArrowLeft");
      expect(document.activeElement).toBe(stars[4]);
    });

    it("should move to first with Home", () => {
      const stars = el.querySelectorAll(".tedi-rating__star");
      (stars[3] as HTMLElement).focus();
      dispatchKey(stars[3] as HTMLElement, "Home");
      expect(document.activeElement).toBe(stars[0]);
    });

    it("should move to last with End", () => {
      const stars = el.querySelectorAll(".tedi-rating__star");
      (stars[0] as HTMLElement).focus();
      dispatchKey(stars[0] as HTMLElement, "End");
      expect(document.activeElement).toBe(stars[4]);
    });

    it("should select with Enter", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const stars = el.querySelectorAll(".tedi-rating__star");
      (stars[3] as HTMLElement).focus();
      dispatchKey(stars[3] as HTMLElement, "Enter");

      expect(component.value()).toBe(4);
      expect(onChange).toHaveBeenCalledWith(4);
    });

    it("should select with Space", () => {
      const onChange = jest.fn();
      component.registerOnChange(onChange);

      const stars = el.querySelectorAll(".tedi-rating__star");
      (stars[1] as HTMLElement).focus();
      dispatchKey(stars[1] as HTMLElement, " ");

      expect(component.value()).toBe(2);
      expect(onChange).toHaveBeenCalledWith(2);
    });
  });

  describe("ControlValueAccessor", () => {
    it("should set value via writeValue", () => {
      component.writeValue(4);
      expect(component.value()).toBe(4);
    });

    it("should handle null writeValue", () => {
      component.writeValue(null);
      expect(component.value()).toBeNull();
    });

    it("should call onTouched on blur", () => {
      const onTouched = jest.fn();
      component.registerOnTouched(onTouched);

      const stars = el.querySelectorAll(".tedi-rating__star");
      (stars[0] as HTMLElement).dispatchEvent(
        new Event("blur", { bubbles: true }),
      );

      expect(onTouched).toHaveBeenCalled();
    });
  });
});

@Component({
  standalone: true,
  imports: [RatingComponent, ReactiveFormsModule],
  template: `<tedi-rating [formControl]="control" />`,
})
class TestHostComponent {
  control = new FormControl<number | null>(null);
}

describe("RatingComponent with ReactiveFormsModule", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should sync FormControl value to component", () => {
    host.control.setValue(3);
    fixture.detectChanges();

    const stars = el.querySelectorAll(".tedi-rating__star");
    expect(
      stars[0].classList.contains("tedi-rating__star--selected"),
    ).toBe(true);
    expect(
      stars[2].classList.contains("tedi-rating__star--selected"),
    ).toBe(true);
    expect(
      stars[3].classList.contains("tedi-rating__star--selected"),
    ).toBe(false);
  });

  it("should sync component selection to FormControl", () => {
    const stars = el.querySelectorAll(".tedi-rating__star");
    (stars[3] as HTMLButtonElement).click();
    fixture.detectChanges();

    expect(host.control.value).toBe(4);
  });

  it("should disable component when FormControl is disabled", () => {
    host.control.disable();
    fixture.detectChanges();

    const ratingEl = el.querySelector("tedi-rating") as HTMLElement;
    expect(ratingEl.classList.contains("tedi-rating--disabled")).toBe(true);
  });
});
