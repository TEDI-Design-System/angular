import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { RatingComponent } from "./rating.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

describe("RatingComponent", () => {
  let fixture: ComponentFixture<RatingComponent>;
  let component: RatingComponent;
  let el: HTMLElement;

  const radios = () =>
    Array.from(el.querySelectorAll<HTMLInputElement>("input[type='radio']"));
  const radio = (name: string) =>
    radios().find((input) => input.getAttribute("aria-label") === name)!;
  const visuals = () =>
    Array.from(el.querySelectorAll<HTMLElement>(".tedi-rating__visual"));
  const isSelected = (v: HTMLElement) =>
    v.classList.contains("tedi-rating__visual--selected");
  const isHovered = (v: HTMLElement) =>
    v.classList.contains("tedi-rating__visual--hover");
  const hover = (name: string) => {
    radio(name).closest("label")!.dispatchEvent(new MouseEvent("mouseenter"));
    fixture.detectChanges();
  };

  const setInputs = (inputs: Record<string, unknown>) => {
    Object.entries(inputs).forEach(([key, value]) =>
      fixture.componentRef.setInput(key, value),
    );
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RatingComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    });

    fixture = TestBed.createComponent(RatingComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.componentRef.setInput("label", "Feedback");
    fixture.detectChanges();
  });

  it("renders a labelled radiogroup with 5 items by default", () => {
    expect(el.getAttribute("role")).toBe("radiogroup");
    expect(el.getAttribute("aria-label")).toBe("Feedback");
    expect(radios()).toHaveLength(5);
  });

  it("defaults to 10 items for the number type", () => {
    setInputs({ type: "number" });
    expect(radios()).toHaveLength(10);
  });

  it("falls back to the type default when count is not a positive integer", () => {
    for (const count of [0, -3, 3.5]) {
      setInputs({ count });
      expect(radios()).toHaveLength(5);
    }
  });

  it("checks the radio matching the value", () => {
    setInputs({ value: 3 });
    expect(radio("3/5").checked).toBe(true);
  });

  it("updates the value and emits valueChange when an item is chosen", () => {
    const emitted: number[] = [];
    component.value.subscribe((v) => emitted.push(v));

    radio("4/5").click();
    fixture.detectChanges();

    expect(component.value()).toBe(4);
    expect(emitted).toContain(4);
  });

  it("uses itemLabels as accessible names and falls back to value/total", () => {
    setInputs({
      type: "number",
      itemLabels: ["Low", "", "", "", "", "", "", "", "", "High"],
    });
    expect(radio("Low")).toBeTruthy();
    expect(radio("High")).toBeTruthy();
    expect(radio("5/10")).toBeTruthy();
  });

  it("shows captions only at the endpoints of the number scale", () => {
    setInputs({
      type: "number",
      itemLabels: ["Low", "x", "", "", "", "", "", "", "", "High"],
    });
    const captions = Array.from(
      el.querySelectorAll(".tedi-rating__caption"),
    ).map((c) => c.textContent?.trim());
    expect(captions).toEqual(["Low", "High"]);
    expect(el.querySelector(".tedi-rating__items--captioned")).not.toBeNull();
  });

  it("does not reserve caption space without labels", () => {
    setInputs({ type: "number" });
    expect(el.querySelector(".tedi-rating__items--captioned")).toBeNull();
  });

  it("shows the star caption for the current value and keeps its slot when empty", () => {
    setInputs({ itemLabels: ["A", "B", "C", "D", "E"] });
    const caption = () =>
      el.querySelector(".tedi-rating__star-caption")?.textContent?.trim();
    expect(caption()).toBe("");

    setInputs({ value: 2 });
    expect(caption()).toBe("B");

    hover("D");
    expect(caption()).toBe("D");
  });

  it("disables every radio when disabled", () => {
    setInputs({ disabled: true });
    radios().forEach((input) => expect(input.disabled).toBe(true));
    expect(el.classList).toContain("tedi-rating--disabled");
  });

  it("applies the vertical orientation", () => {
    setInputs({ orientation: "vertical" });
    expect(el.classList).toContain("tedi-rating--vertical");
  });

  describe("hover preview", () => {
    it("marks the hovered range as hover and keeps only committed items in it selected", () => {
      setInputs({ value: 2 });
      hover("4/5");
      expect(visuals().map(isHovered)).toEqual([true, true, true, true, false]);
      expect(visuals().map(isSelected)).toEqual([
        true,
        true,
        false,
        false,
        false,
      ]);
    });

    it("shows committed items past the hovered range as unselected, and restores them on leave", () => {
      setInputs({ value: 4 });
      hover("2/5");
      expect(visuals().map(isSelected)).toEqual([
        true,
        true,
        false,
        false,
        false,
      ]);

      el.querySelector(".tedi-rating__items")!.dispatchEvent(
        new MouseEvent("mouseleave"),
      );
      fixture.detectChanges();
      expect(visuals().map(isSelected)).toEqual([
        true,
        true,
        true,
        true,
        false,
      ]);
      expect(visuals().some(isHovered)).toBe(false);
    });

    it("keeps the current pick selected while hovering another icon", () => {
      setInputs({ type: "icon", value: 3 });
      hover("5/5");
      expect(visuals().map(isHovered)).toEqual([
        false,
        false,
        false,
        false,
        true,
      ]);
      expect(visuals().map(isSelected)).toEqual([
        false,
        false,
        true,
        false,
        false,
      ]);
    });

    it("does not preview while disabled", () => {
      setInputs({ disabled: true });
      hover("3/5");
      expect(visuals().some(isHovered)).toBe(false);
    });
  });

  describe("readOnly summary", () => {
    it("renders a non-interactive summary with the value, max and rater count", () => {
      setInputs({
        label: "Teenuse hinnang",
        readOnly: true,
        value: 3.5,
        ratingsCount: 271,
      });
      expect(radios()).toHaveLength(0);
      expect(el.getAttribute("role")).toBe("img");
      expect(el.getAttribute("aria-label")).toBe(
        "Teenuse hinnang: 3,5/5 - 271 hindajat",
      );
    });

    it("uses the singular rater form for one rating", () => {
      setInputs({ readOnly: true, value: 4, ratingsCount: 1 });
      expect(el.getAttribute("aria-label")).toBe("Feedback: 4/5 - 1 hindaja");
    });

    it("omits the rater count when ratingsCount is not set", () => {
      setInputs({ readOnly: true, value: 4 });
      expect(el.getAttribute("aria-label")).toBe("Feedback: 4/5");
    });

    it("shows the count number only when showRatingsCountLabel is false", () => {
      setInputs({
        readOnly: true,
        value: 3.5,
        ratingsCount: 271,
        showRatingsCountLabel: false,
      });
      expect(el.getAttribute("aria-label")).toBe("Feedback: 3,5/5 - 271");
    });

    it("partially fills the boundary star in the scale variant", () => {
      setInputs({ readOnly: true, readOnlyVariant: "scale", value: 3.5 });
      const fills = Array.from(
        el.querySelectorAll<HTMLElement>(".tedi-rating__star-partial-fill"),
      ).map((f) => f.style.getPropertyValue("--tedi-rating-star-fill"));
      expect(fills).toEqual(["100%", "100%", "100%", "50%"]);
    });

    it("always renders the summary visual filled, even for a zero rating", () => {
      setInputs({ type: "icon", readOnly: true, value: 0 });
      expect(el.getAttribute("aria-label")).toBe("Feedback: 0/5");
      expect(el.querySelector(".tedi-rating__circle--filled")).not.toBeNull();
    });
  });
});

@Component({
  standalone: true,
  imports: [RatingComponent],
  template: `<tedi-rating label="Hinnang" readOnly [value]="3" />`,
})
class BareAttributeHostComponent {}

describe("RatingComponent boolean attributes", () => {
  it("treats a bare readOnly attribute as true", () => {
    TestBed.configureTestingModule({
      imports: [BareAttributeHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    });
    const fixture = TestBed.createComponent(BareAttributeHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector("input[type='radio']")).toBeNull();
    expect(el.querySelector("tedi-rating")?.getAttribute("role")).toBe("img");
  });
});

@Component({
  standalone: true,
  imports: [RatingComponent, ReactiveFormsModule],
  template: `<tedi-rating label="Hinnang" [formControl]="control" />`,
})
class TestHostComponent {
  control = new FormControl<number>(2);
}

describe("RatingComponent with reactive forms", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let el: HTMLElement;

  const radios = () =>
    Array.from(el.querySelectorAll<HTMLInputElement>("input[type='radio']"));

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

  it("reflects the form control value", () => {
    expect(radios()[1].checked).toBe(true);
    host.control.setValue(5);
    fixture.detectChanges();
    expect(radios()[4].checked).toBe(true);
  });

  it("writes the chosen value back and marks the control touched on blur", () => {
    radios()[3].click();
    radios()[3].dispatchEvent(new Event("blur"));
    fixture.detectChanges();
    expect(host.control.value).toBe(4);
    expect(host.control.touched).toBe(true);
  });

  it("disables the radios when the control is disabled", () => {
    host.control.disable();
    fixture.detectChanges();
    radios().forEach((input) => expect(input.disabled).toBe(true));
  });
});
