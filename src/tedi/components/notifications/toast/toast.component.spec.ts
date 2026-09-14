import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ToastComponent, ToastType } from "./toast.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

describe("ToastComponent", () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("title", "Test Title");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should render alert component", () => {
    const alertElement = fixture.nativeElement.querySelector("tedi-alert");
    expect(alertElement).toBeTruthy();
  });

  it("should display title in the alert", () => {
    const titleElement =
      fixture.nativeElement.querySelector(".tedi-alert__title");
    expect(titleElement.textContent).toContain("Test Title");
  });

  it("should apply correct type class", () => {
    const types: ToastType[] = ["info", "success", "warning", "danger"];

    for (const type of types) {
      fixture.componentRef.setInput("type", type);
      fixture.detectChanges();

      const alertElement = fixture.nativeElement.querySelector("tedi-alert");
      expect(alertElement.classList.contains(`tedi-alert--${type}`)).toBe(true);
    }
  });

  it("should pass icon to alert when provided", () => {
    fixture.componentRef.setInput("icon", "info");
    fixture.detectChanges();

    // Use direct child selector to get the alert icon (not close button icon)
    const iconElement = fixture.nativeElement.querySelector(
      ".tedi-alert__head > tedi-icon",
    );
    expect(iconElement).toBeTruthy();
    expect(iconElement.textContent).toBe("info");
  });

  it("should not show icon when not provided", () => {
    fixture.componentRef.setInput("icon", undefined);
    fixture.detectChanges();

    // Use direct child selector to exclude the close button's icon
    const iconElement = fixture.nativeElement.querySelector(
      ".tedi-alert__head > tedi-icon",
    );
    expect(iconElement).toBeFalsy();
  });

  it("should always show close button", () => {
    const closeButton =
      fixture.nativeElement.querySelector(".tedi-alert__close");
    expect(closeButton).toBeTruthy();
  });

  it("should emit closed event when close button is clicked", () => {
    const closedSpy = jest.fn();
    component.closed.subscribe(closedSpy);

    const closeButton =
      fixture.nativeElement.querySelector(".tedi-alert__close");
    closeButton.click();
    fixture.detectChanges();

    expect(closedSpy).toHaveBeenCalled();
  });

  it("should have status role by default", () => {
    const alertElement = fixture.nativeElement.querySelector("tedi-alert");
    expect(alertElement.getAttribute("role")).toBe("status");
  });

  it("should apply custom role when provided", () => {
    fixture.componentRef.setInput("role", "alert");
    fixture.detectChanges();

    const alertElement = fixture.nativeElement.querySelector("tedi-alert");
    expect(alertElement.getAttribute("role")).toBe("alert");
  });

  it("should show progress bar when showProgressBar is true and duration > 0", () => {
    fixture.componentRef.setInput("duration", 5000);
    fixture.componentRef.setInput("showProgressBar", true);
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector(
      ".tedi-toast__progress",
    );
    expect(progressBar).toBeTruthy();
  });

  it("should not show progress bar when showProgressBar is false", () => {
    fixture.componentRef.setInput("duration", 5000);
    fixture.componentRef.setInput("showProgressBar", false);
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector(
      ".tedi-toast__progress",
    );
    expect(progressBar).toBeFalsy();
  });

  it("should not show progress bar when duration is 0", () => {
    fixture.componentRef.setInput("duration", 0);
    fixture.componentRef.setInput("showProgressBar", true);
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector(
      ".tedi-toast__progress",
    );
    expect(progressBar).toBeFalsy();
  });

  it("should apply correct type class to progress bar", () => {
    const types: ToastType[] = ["info", "success", "warning", "danger"];

    for (const type of types) {
      fixture.componentRef.setInput("type", type);
      fixture.componentRef.setInput("duration", 5000);
      fixture.componentRef.setInput("showProgressBar", true);
      fixture.detectChanges();

      const progressBar = fixture.nativeElement.querySelector(
        ".tedi-toast__progress",
      );
      expect(
        progressBar.classList.contains(`tedi-toast__progress--${type}`),
      ).toBe(true);
    }
  });

  it("should pause progress bar animation when paused is true", () => {
    fixture.componentRef.setInput("duration", 5000);
    fixture.componentRef.setInput("showProgressBar", true);
    fixture.componentRef.setInput("paused", true);
    fixture.detectChanges();

    const progressBar = fixture.nativeElement.querySelector(
      ".tedi-toast__progress",
    );
    expect(progressBar.classList.contains("tedi-toast__progress--paused")).toBe(
      true,
    );
  });

  it("should emit mouseEnter event on mouse enter", () => {
    const mouseEnterSpy = jest.fn();
    component.mouseEnter.subscribe(mouseEnterSpy);

    const wrapper = fixture.nativeElement.querySelector(".tedi-toast__wrapper");
    wrapper.dispatchEvent(new MouseEvent("mouseenter"));
    fixture.detectChanges();

    expect(mouseEnterSpy).toHaveBeenCalled();
  });

  it("should emit mouseLeave event on mouse leave", () => {
    const mouseLeaveSpy = jest.fn();
    component.mouseLeave.subscribe(mouseLeaveSpy);

    const wrapper = fixture.nativeElement.querySelector(".tedi-toast__wrapper");
    wrapper.dispatchEvent(new MouseEvent("mouseleave"));
    fixture.detectChanges();

    expect(mouseLeaveSpy).toHaveBeenCalled();
  });
});
