import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  TimePickerModalComponent,
  TimePickerModalData,
} from "./time-picker-modal.component";
import { ModalRef } from "../../overlay/modal/modal-ref";
import { MODAL_DATA } from "../../overlay/modal/modal.types";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

describe("TimePickerModalComponent", () => {
  let fixture: ComponentFixture<TimePickerModalComponent>;
  let component: TimePickerModalComponent;
  let el: HTMLElement;
  let closeSpy: jest.Mock;

  const baseData: TimePickerModalData = {
    value: "09:30",
    variant: "scroll",
    timeSlots: [],
    columns: 3,
    showSlotIndicator: false,
    minuteStep: 1,
  };

  const setup = (data: Partial<TimePickerModalData> = {}) => {
    closeSpy = jest.fn();
    TestBed.configureTestingModule({
      imports: [TimePickerModalComponent],
      providers: [
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        { provide: MODAL_DATA, useValue: { ...baseData, ...data } },
        { provide: ModalRef, useValue: { close: closeSpy } },
      ],
    });
    fixture = TestBed.createComponent(TimePickerModalComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  };

  it("should initialize draft from the provided value", () => {
    setup();
    expect(component.draft()).toBe("09:30");
  });

  it("should close with undefined when cancel is clicked", () => {
    setup();
    component.cancel();
    expect(closeSpy).toHaveBeenCalledWith(undefined);
  });

  it("should close with the current draft when confirm is called", () => {
    setup();
    component.draft.set("14:45");
    component.confirm();
    expect(closeSpy).toHaveBeenCalledWith("14:45");
  });

  it("should close with the current draft when the form is submitted", () => {
    setup();
    component.draft.set("11:00");
    const form = el.querySelector("form")!;
    form.dispatchEvent(new Event("submit", { cancelable: true }));
    expect(closeSpy).toHaveBeenCalledWith("11:00");
  });

  it("should submit when Enter is pressed on a non-button target outside the picker", () => {
    setup();
    component.draft.set("10:15");

    const target = el.querySelector("h2") as HTMLElement;
    expect(target).toBeTruthy();

    target.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    expect(closeSpy).toHaveBeenCalledWith("10:15");
  });

  it("should NOT submit when Enter is pressed inside the time-picker", () => {
    setup();
    component.draft.set("10:15");

    const target = el.querySelector(".tedi-time-picker__column") as HTMLElement;
    expect(target).toBeTruthy();

    target.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    expect(closeSpy).not.toHaveBeenCalled();
  });

  it("should NOT intercept Enter when pressed on a footer button", () => {
    setup();
    component.draft.set("12:00");

    const submitButton = el.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    expect(submitButton).toBeTruthy();

    submitButton.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );

    expect(closeSpy).not.toHaveBeenCalled();
  });

  it("should not submit on non-Enter keys", () => {
    setup();
    const target = el.querySelector(".tedi-time-picker__column") as HTMLElement;
    target.dispatchEvent(
      new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
    );
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it("should remove the keydown listener on destroy", () => {
    setup();
    fixture.destroy();

    const stray = document.createElement("div");
    stray.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true }),
    );
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it("should render the slots variant when configured", () => {
    setup({ variant: "slots", timeSlots: ["08:00", "08:30", "09:00"] });
    expect(el.querySelector(".tedi-time-picker__grid")).toBeTruthy();
    expect(el.querySelectorAll(".tedi-time-picker__slot").length).toBe(3);
  });

  it("should update draft when the inner time-picker emits valueChange", () => {
    setup({ variant: "slots", timeSlots: ["08:00", "08:30", "09:00"] });
    const inputs = el.querySelectorAll<HTMLInputElement>(
      '.tedi-time-picker__grid input[type="radio"]',
    );
    inputs[1].checked = true;
    inputs[1].dispatchEvent(new Event("change", { bubbles: true }));
    fixture.detectChanges();
    expect(component.draft()).toBe("08:30");
  });
});
