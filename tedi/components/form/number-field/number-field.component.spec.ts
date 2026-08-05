import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { NumberFieldComponent } from "./number-field.component";
import { LabelComponent } from "../label/label.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TextComponent } from "../../base/text/text.component";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

describe("NumberFieldComponent", () => {
  let fixture: ComponentFixture<NumberFieldComponent>;
  let component: NumberFieldComponent;
  let el: HTMLElement;
  let mockLiveAnnouncer: jest.Mocked<LiveAnnouncer>;

  beforeEach(() => {
    mockLiveAnnouncer = {
      announce: jest.fn().mockResolvedValue(undefined),
      clear: jest.fn(),
    } as unknown as jest.Mocked<LiveAnnouncer>;

    TestBed.configureTestingModule({
      imports: [
        NumberFieldComponent,
        LabelComponent,
        ButtonComponent,
        IconComponent,
        TextComponent,
        FeedbackTextComponent,
      ],
      providers: [
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        { provide: LiveAnnouncer, useValue: mockLiveAnnouncer },
      ],
    });

    fixture = TestBed.createComponent(NumberFieldComponent);
    fixture.componentRef.setInput("inputId", "test-id");
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with default value (0)", () => {
    expect(component.value()).toBe(0);
  });

  it("should render aria-label on the input when ariaLabel is set and no visible label", () => {
    fixture.componentRef.setInput("ariaLabel", "Väärtus");
    fixture.detectChanges();

    const input = el.querySelector("input") as HTMLInputElement;
    expect(input.getAttribute("aria-label")).toBe("Väärtus");
  });

  it("should not render aria-label when a visible label is provided", () => {
    fixture.componentRef.setInput("label", "Kogus");
    fixture.componentRef.setInput("ariaLabel", "Väärtus");
    fixture.detectChanges();

    const input = el.querySelector("input") as HTMLInputElement;
    expect(input.hasAttribute("aria-label")).toBe(false);
  });

  it("should increment the value on increment button click", () => {
    const onChange = jest.fn<number, [number]>();
    const onTouched = jest.fn();
    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    const buttons = el.querySelectorAll("button");
    const incrementBtn = buttons[1] as HTMLButtonElement;

    incrementBtn.click();
    fixture.detectChanges();

    expect(component.value()).toBe(1);
    expect(onChange).toHaveBeenCalledWith(1);
    expect(onTouched).toHaveBeenCalled();
  });

  it("should announce value change on increment button click", () => {
    const buttons = el.querySelectorAll("button");
    const incrementBtn = buttons[1] as HTMLButtonElement;

    incrementBtn.click();
    fixture.detectChanges();

    expect(mockLiveAnnouncer.announce).toHaveBeenCalledWith(
      expect.any(String),
      "polite"
    );
  });

  it("should decrement the value on decrement button click", () => {
    component.writeValue(5);
    fixture.detectChanges();

    const onChange = jest.fn<number, [number]>();
    component.registerOnChange(onChange);

    const buttons = el.querySelectorAll("button");
    const decrementBtn = buttons[0] as HTMLButtonElement;

    decrementBtn.click();
    fixture.detectChanges();

    expect(component.value()).toBe(4);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("should announce value change on decrement button click", () => {
    component.writeValue(5);
    fixture.detectChanges();

    const decrementBtn = el.querySelector("button") as HTMLButtonElement;

    decrementBtn.click();
    fixture.detectChanges();

    expect(mockLiveAnnouncer.announce).toHaveBeenCalledWith(
      expect.any(String),
      "polite"
    );
  });

  it("should have aria-label on decrement button", () => {
    const decrementBtn = el.querySelector("button") as HTMLButtonElement;
    expect(decrementBtn.getAttribute("aria-label")).toBeTruthy();
  });

  it("should have aria-label on increment button", () => {
    const buttons = el.querySelectorAll("button");
    const incrementBtn = buttons[1] as HTMLButtonElement;
    expect(incrementBtn.getAttribute("aria-label")).toBeTruthy();
  });

  it("should have aria-hidden icons inside buttons", () => {
    const icons = el.querySelectorAll("tedi-icon");
    icons.forEach((icon) => {
      expect(icon.getAttribute("aria-hidden")).toBe("true");
    });
  });

  it("should disable decrement button when value === min", () => {
    component.writeValue(3);
    fixture.componentRef.setInput("min", 3);
    fixture.detectChanges();

    const decrementBtn = el.querySelector("button") as HTMLButtonElement;
    expect(decrementBtn.disabled).toBeTruthy();
  });

  it("should disable increment button when value === max", () => {
    component.writeValue(2);
    fixture.componentRef.setInput("max", 2);
    fixture.detectChanges();

    const buttons = el.querySelectorAll("button");
    const incrementBtn = buttons[1] as HTMLButtonElement;
    expect(incrementBtn.disabled).toBeTruthy();
  });

  it("should set aria-invalid to true when value is below min", () => {
    component.writeValue(2);
    fixture.componentRef.setInput("min", 5);
    fixture.detectChanges();

    const inputEl = el.querySelector("input") as HTMLInputElement;
    expect(inputEl.getAttribute("aria-invalid")).toBe("true");
  });

  it("should set aria-invalid to true when value is above max", () => {
    component.writeValue(10);
    fixture.componentRef.setInput("max", 5);
    fixture.detectChanges();

    const inputEl = el.querySelector("input") as HTMLInputElement;
    expect(inputEl.getAttribute("aria-invalid")).toBe("true");
  });

  it("should set aria-invalid to true when invalid input is true", () => {
    fixture.componentRef.setInput("invalid", true);
    fixture.detectChanges();

    const inputEl = el.querySelector("input") as HTMLInputElement;
    expect(inputEl.getAttribute("aria-invalid")).toBe("true");
  });

  it("should call onChange when input is changed", () => {
    const onChange = jest.fn<number, [number]>();
    component.registerOnChange(onChange);

    const inputEl = el.querySelector("input") as HTMLInputElement;
    inputEl.value = "10";
    inputEl.dispatchEvent(new Event("input"));
    fixture.detectChanges();

    expect(component.value()).toBe(10);
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("should call onTouched when input is blurred", () => {
    const onTouched = jest.fn();
    component.registerOnTouched(onTouched);

    const inputEl = el.querySelector("input") as HTMLInputElement;
    inputEl.dispatchEvent(new Event("blur"));
    fixture.detectChanges();

    expect(onTouched).toHaveBeenCalled();
  });

  it("should respect disabled input and disable all controls", () => {
    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();

    const inputEl = el.querySelector("input") as HTMLInputElement;
    const buttons = Array.from(
      el.querySelectorAll("button"),
    ) as HTMLButtonElement[];

    expect(component.isDisabled()).toBeTruthy();
    expect(inputEl.disabled).toBeTruthy();
    buttons.forEach((btn) => expect(btn.disabled).toBeTruthy());
  });

  it("writeValue() should default to 0 when given null or undefined", () => {
    component.writeValue(undefined);
    expect(component.value()).toBe(0);
  });

  it("writeValue() should set the passed-in value", () => {
    component.writeValue(42);
    expect(component.value()).toBe(42);
  });

  it("setDisabledState() should toggle formDisabled and disable input & buttons", () => {
    component.setDisabledState(false);
    fixture.detectChanges();

    let inputEl = el.querySelector("input") as HTMLInputElement;
    let buttons = Array.from(
      el.querySelectorAll("button"),
    ) as HTMLButtonElement[];

    expect(component.isDisabled()).toBeFalsy();
    expect(inputEl.disabled).toBeFalsy();
    buttons.forEach((btn) => expect(btn.disabled).toBeFalsy());

    component.setDisabledState(true);
    fixture.detectChanges();

    inputEl = el.querySelector("input") as HTMLInputElement;
    buttons = Array.from(el.querySelectorAll("button")) as HTMLButtonElement[];

    expect(component.isDisabled()).toBeTruthy();
    expect(inputEl.disabled).toBeTruthy();
    buttons.forEach((btn) => expect(btn.disabled).toBeTruthy());
  });

  it("focus() should call focus() on the native input element", () => {
    fixture.detectChanges();
    const inputEl = component.inputRef.nativeElement;
    const spy = jest.spyOn(inputEl, "focus");

    component.focus();

    expect(spy).toHaveBeenCalled();
  });

  it("blur() should call blur() on the native input element and mark touched", () => {
    fixture.detectChanges();
    const inputEl = component.inputRef.nativeElement;
    const blurSpy = jest.spyOn(inputEl, "blur");
    const onTouched = jest.fn();
    component.registerOnTouched(onTouched);

    component.blur();

    expect(blurSpy).toHaveBeenCalled();
    expect(onTouched).toHaveBeenCalled();
  });

  it("should set aria-describedby when feedbackText is provided", () => {
    fixture.componentRef.setInput("feedbackText", {
      text: "Error message",
      type: "error",
    });
    fixture.detectChanges();

    const inputEl = el.querySelector("input") as HTMLInputElement;
    expect(inputEl.getAttribute("aria-describedby")).toBe("test-id-feedback");
  });

  it("should not set aria-describedby when feedbackText is not provided", () => {
    const inputEl = el.querySelector("input") as HTMLInputElement;
    expect(inputEl.getAttribute("aria-describedby")).toBeNull();
  });

  it("should set id on feedback-text element matching aria-describedby", () => {
    fixture.componentRef.setInput("feedbackText", {
      text: "Error message",
      type: "error",
    });
    fixture.detectChanges();

    const feedbackEl = el.querySelector("tedi-feedback-text");
    expect(feedbackEl?.getAttribute("id")).toBe("test-id-feedback");
  });
});
