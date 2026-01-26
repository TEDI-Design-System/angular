import { ComponentFixture, TestBed } from "@angular/core/testing";
import { signal, Signal, WritableSignal } from "@angular/core";
import { ToastContainerComponent, ToastItem } from "./toast-container.component";
import { ToastService } from "../../../services/toast/toast.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

describe("ToastContainerComponent", () => {
  let component: ToastContainerComponent;
  let fixture: ComponentFixture<ToastContainerComponent>;
  let toastsSignal: WritableSignal<ToastItem[]>;
  let mockToastService: {
    toasts$: Signal<ToastItem[]>;
    getToasts: jest.Mock;
    close: jest.Mock;
    pause: jest.Mock;
    resume: jest.Mock;
  };

  const createMockToast = (overrides: Partial<ToastItem> = {}): ToastItem => ({
    id: "test-toast-1",
    title: "Test Toast",
    content: "Test content",
    type: "info",
    role: "status",
    position: "bottom-right",
    ...overrides,
  });

  beforeEach(async () => {
    toastsSignal = signal<ToastItem[]>([]);
    mockToastService = {
      toasts$: toastsSignal.asReadonly(),
      getToasts: jest.fn().mockImplementation(() => toastsSignal()),
      close: jest.fn(),
      pause: jest.fn(),
      resume: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should have all positions defined", () => {
    expect(component.positions).toEqual([
      "top-left",
      "top-right",
      "bottom-left",
      "bottom-right",
    ]);
  });

  describe("hasToastsForPosition", () => {
    it("should return true when there are toasts for position", () => {
      toastsSignal.set([createMockToast({ position: "top-left" })]);

      expect(component.hasToastsForPosition("top-left")).toBe(true);
    });

    it("should return false when there are no toasts for position", () => {
      toastsSignal.set([createMockToast({ position: "top-left" })]);

      expect(component.hasToastsForPosition("bottom-right")).toBe(false);
    });

    it("should return false when there are no toasts at all", () => {
      toastsSignal.set([]);

      expect(component.hasToastsForPosition("top-left")).toBe(false);
    });
  });

  describe("getToastsForPosition", () => {
    it("should return toasts for specific position", () => {
      const topLeftToast = createMockToast({
        id: "toast-1",
        position: "top-left",
      });
      const bottomRightToast = createMockToast({
        id: "toast-2",
        position: "bottom-right",
      });

      toastsSignal.set([topLeftToast, bottomRightToast]);

      const result = component.getToastsForPosition("top-left");

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(topLeftToast);
    });

    it("should return empty array when no toasts for position", () => {
      toastsSignal.set([createMockToast({ position: "top-left" })]);

      const result = component.getToastsForPosition("bottom-right");

      expect(result).toHaveLength(0);
    });

    it("should return multiple toasts for same position", () => {
      toastsSignal.set([
        createMockToast({ id: "toast-1", position: "top-left" }),
        createMockToast({ id: "toast-2", position: "top-left" }),
        createMockToast({ id: "toast-3", position: "top-left" }),
      ]);

      const result = component.getToastsForPosition("top-left");

      expect(result).toHaveLength(3);
    });
  });

  describe("event handlers", () => {
    it("should call toastService.close when onClosed is called", () => {
      const toastId = "test-toast-id";

      component.onClosed(toastId);

      expect(mockToastService.close).toHaveBeenCalledWith(toastId);
    });

    it("should call toastService.pause when onMouseEnter is called", () => {
      const toastId = "test-toast-id";

      component.onMouseEnter(toastId);

      expect(mockToastService.pause).toHaveBeenCalledWith(toastId);
    });

    it("should call toastService.resume when onMouseLeave is called", () => {
      const toastId = "test-toast-id";

      component.onMouseLeave(toastId);

      expect(mockToastService.resume).toHaveBeenCalledWith(toastId);
    });
  });

  describe("rendering", () => {
    it("should render toast container", () => {
      const container = fixture.nativeElement;
      expect(container.classList.contains("tedi-toast-container")).toBe(true);
    });

    it("should render position container when toasts exist", () => {
      toastsSignal.set([createMockToast({ position: "top-right" })]);

      fixture.detectChanges();

      const positionContainer = fixture.nativeElement.querySelector(
        ".tedi-toast-container__position--top-right"
      );
      expect(positionContainer).toBeTruthy();
    });

    it("should not render position container when no toasts", () => {
      toastsSignal.set([]);

      fixture.detectChanges();

      const positionContainer = fixture.nativeElement.querySelector(
        ".tedi-toast-container__position"
      );
      expect(positionContainer).toBeFalsy();
    });

    it("should render toast component for each toast", () => {
      toastsSignal.set([
        createMockToast({ id: "toast-1", position: "bottom-right" }),
        createMockToast({ id: "toast-2", position: "bottom-right" }),
      ]);

      fixture.detectChanges();

      const toasts = fixture.nativeElement.querySelectorAll("tedi-toast");
      expect(toasts.length).toBe(2);
    });

    it("should pass correct props to toast component", () => {
      toastsSignal.set([
        createMockToast({
          title: "Test Title",
          type: "success",
          icon: "check",
          role: "alert",
          duration: 5000,
          showProgressBar: true,
          paused: true,
          position: "top-right",
        }),
      ]);

      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector("tedi-toast");
      expect(toast).toBeTruthy();
    });

    it("should apply exiting class when toast is exiting", () => {
      toastsSignal.set([
        createMockToast({ exiting: true, position: "bottom-right" }),
      ]);

      fixture.detectChanges();

      const toast = fixture.nativeElement.querySelector("tedi-toast");
      expect(toast.classList.contains("tedi-toast--exiting")).toBe(true);
    });

    it("should render toast content when provided", () => {
      toastsSignal.set([
        createMockToast({ content: "Toast content text", position: "bottom-right" }),
      ]);

      fixture.detectChanges();

      const container = fixture.nativeElement.querySelector(
        ".tedi-toast-container__position"
      );
      expect(container.textContent).toContain("Toast content text");
    });
  });

  describe("multiple positions", () => {
    it("should render toasts in multiple positions", () => {
      toastsSignal.set([
        createMockToast({ id: "toast-1", position: "top-left" }),
        createMockToast({ id: "toast-2", position: "top-right" }),
        createMockToast({ id: "toast-3", position: "bottom-right" }),
      ]);

      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelector(
          ".tedi-toast-container__position--top-left"
        )
      ).toBeTruthy();
      expect(
        fixture.nativeElement.querySelector(
          ".tedi-toast-container__position--top-right"
        )
      ).toBeTruthy();
      expect(
        fixture.nativeElement.querySelector(
          ".tedi-toast-container__position--bottom-right"
        )
      ).toBeTruthy();
    });
  });
});
