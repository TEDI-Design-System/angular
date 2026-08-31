import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { OverlayContainer } from "@angular/cdk/overlay";
import { SliderComponent } from "./slider.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

describe("SliderComponent", () => {
  let fixture: ComponentFixture<SliderComponent>;
  let component: SliderComponent;
  let el: HTMLElement;
  let overlayContainer: OverlayContainer;

  const getInput = () =>
    el.querySelector<HTMLInputElement>("input[type='range']")!;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SliderComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    });

    fixture = TestBed.createComponent(SliderComponent);
    fixture.componentRef.setInput("inputId", "slider-test");
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it("creates the component with a range input", () => {
    expect(component).toBeTruthy();
    expect(getInput()).toBeTruthy();
  });

  it("forwards min, max and step to the input", () => {
    fixture.componentRef.setInput("min", 10);
    fixture.componentRef.setInput("max", 20);
    fixture.componentRef.setInput("step", 2);
    fixture.detectChanges();

    const input = getInput();
    expect(input.getAttribute("min")).toBe("10");
    expect(input.getAttribute("max")).toBe("20");
    expect(input.getAttribute("step")).toBe("2");
  });

  it("clamps the displayed value into range", () => {
    fixture.componentRef.setInput("min", 0);
    fixture.componentRef.setInput("max", 100);
    fixture.componentRef.setInput("value", 150);
    fixture.detectChanges();

    expect(component.clampedValue()).toBe(100);
    expect(getInput().value).toBe("100");
  });

  it("computes progress as a percentage", () => {
    fixture.componentRef.setInput("min", 0);
    fixture.componentRef.setInput("max", 200);
    fixture.componentRef.setInput("value", 50);
    fixture.detectChanges();

    expect(component.progress()).toBe(25);
  });

  it("guards against a zero-width range", () => {
    fixture.componentRef.setInput("min", 5);
    fixture.componentRef.setInput("max", 5);
    fixture.detectChanges();

    expect(component.progress()).toBe(0);
  });

  it("updates the value on input", () => {
    const input = getInput();
    input.value = "42";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    expect(component.value()).toBe(42);
  });

  it("reflects disabled input", () => {
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();

    expect(getInput().disabled).toBe(true);
    expect(el.classList.contains("tedi-slider--disabled")).toBe(true);
  });

  it("marks the input invalid and adds the modifier class", () => {
    fixture.componentRef.setInput("invalid", true);
    fixture.detectChanges();

    expect(getInput().getAttribute("aria-invalid")).toBe("true");
    expect(el.classList.contains("tedi-slider--invalid")).toBe(true);
  });

  it("treats an error feedback type as invalid and links aria-describedby", () => {
    fixture.componentRef.setInput("feedbackText", {
      text: "Required",
      type: "error",
    });
    fixture.detectChanges();

    expect(component.isInvalid()).toBe(true);
    expect(getInput().getAttribute("aria-describedby")).toBe(
      "slider-test-feedback",
    );
    expect(el.querySelector("tedi-feedback-text")?.textContent).toContain(
      "Required",
    );
  });

  it("renders min and max labels", () => {
    fixture.componentRef.setInput("minLabel", "0%");
    fixture.componentRef.setInput("maxLabel", "100%");
    fixture.detectChanges();

    const labels = el.querySelectorAll(".tedi-slider__range-label");
    expect(labels[0].textContent?.trim()).toBe("0%");
    expect(labels[1].textContent?.trim()).toBe("100%");
  });

  it("shows the formatted current value instead of maxLabel", () => {
    fixture.componentRef.setInput("maxLabel", "100%");
    fixture.componentRef.setInput("showCurrentValue", true);
    fixture.componentRef.setInput("valueFormatter", (v: number) => `${v}%`);
    fixture.componentRef.setInput("value", 30);
    fixture.detectChanges();

    const labels = el.querySelectorAll(".tedi-slider__range-label");
    expect(labels[labels.length - 1].textContent?.trim()).toBe("30%");
  });

  it("exposes the tooltip only while interacted with and not disabled", () => {
    expect(component.tooltipOpen()).toBe(false);

    component.handleMouseEnter();
    expect(component.tooltipOpen()).toBe(true);

    component.handleMouseLeave();
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();
    component.handleFocus();
    expect(component.canShowTooltip()).toBe(false);
    expect(component.tooltipOpen()).toBe(false);
  });

  it("suppresses the tooltip when tooltip is false", () => {
    fixture.componentRef.setInput("tooltip", false);
    fixture.detectChanges();

    expect(component.canShowTooltip()).toBe(false);
    expect(el.querySelector("tedi-tooltip")).toBeNull();
  });

  it("tracks dragging state and cleans up on drag end", () => {
    const removeSpy = jest.spyOn(window, "removeEventListener");
    component.handlePointerDown();
    expect(component.isDragging()).toBe(true);

    window.dispatchEvent(new Event("pointerup"));
    expect(component.isDragging()).toBe(false);
    expect(removeSpy).toHaveBeenCalledWith("pointerup", expect.any(Function));
    removeSpy.mockRestore();
  });

  it("does not start dragging when disabled", () => {
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();
    component.handlePointerDown();
    expect(component.isDragging()).toBe(false);
  });

  describe("hideLabel", () => {
    const label = (): HTMLElement =>
      fixture.nativeElement.querySelector("label[tedi-label]");

    beforeEach(() => {
      fixture.componentRef.setInput("label", "Maht");
      fixture.detectChanges();
    });

    it("shows the label by default", () => {
      expect(label().classList).not.toContain("sr-only");
      expect(label().classList).not.toContain("tedi-label--reserve-space");
    });

    it("hides the label visually when true", () => {
      fixture.componentRef.setInput("hideLabel", true);
      fixture.detectChanges();

      expect(label().classList).toContain("sr-only");
    });

    it("maps keep-space onto the label's reserve-space treatment", () => {
      fixture.componentRef.setInput("hideLabel", "keep-space");
      fixture.detectChanges();

      expect(label().classList).toContain("tedi-label--reserve-space");
      expect(label().classList).not.toContain("sr-only");
    });
  });
});

@Component({
  standalone: true,
  imports: [SliderComponent, ReactiveFormsModule],
  template: `
    <tedi-slider inputId="host-slider" [formControl]="control" [max]="100">
      <div sliderAddon data-testid="addon">addon</div>
    </tedi-slider>
  `,
})
class TestHostComponent {
  control = new FormControl<number>(25);
}

describe("SliderComponent with reactive forms", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let el: HTMLElement;
  let overlayContainer: OverlayContainer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    el = fixture.nativeElement;
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it("writes the form control value to the input", () => {
    const input = el.querySelector<HTMLInputElement>("input[type='range']")!;
    expect(input.value).toBe("25");
  });

  it("propagates input changes back to the form control", () => {
    const input = el.querySelector<HTMLInputElement>("input[type='range']")!;
    input.value = "80";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    expect(host.control.value).toBe(80);
  });

  it("reflects a disabled form control", () => {
    host.control.disable();
    fixture.detectChanges();

    const input = el.querySelector<HTMLInputElement>("input[type='range']")!;
    expect(input.disabled).toBe(true);
  });

  it("projects addon content", () => {
    const addon = el.querySelector("[data-testid='addon']");
    expect(addon?.textContent?.trim()).toBe("addon");
  });
});
