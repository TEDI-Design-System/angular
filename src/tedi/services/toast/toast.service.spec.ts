import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { ToastService } from "./toast.service";
import { ToastAnnouncerService } from "./toast-announcer.service";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";

describe("ToastService", () => {
  let service: ToastService;
  let announcerSpy: jest.SpyInstance;
  let mockOverlayRef: Partial<OverlayRef>;
  let mockOverlay: Partial<Overlay>;

  beforeEach(() => {
    // Reset static state before each test
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ToastService as any).sharedToasts.set([]);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ToastService as any).sharedTimerMap.clear();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (ToastService as any).sharedOverlayRef = null;

    mockOverlayRef = {
      attach: jest.fn(),
      dispose: jest.fn(),
      hasAttached: jest.fn().mockReturnValue(true),
      overlayElement: { isConnected: true } as HTMLElement,
    };

    mockOverlay = {
      create: jest.fn().mockReturnValue(mockOverlayRef),
      scrollStrategies: {
        noop: jest.fn().mockReturnValue({}),
      } as unknown as Overlay["scrollStrategies"],
      position: jest.fn().mockReturnValue({
        global: jest.fn().mockReturnValue({}),
      }),
    };

    TestBed.configureTestingModule({
      providers: [
        ToastService,
        ToastAnnouncerService,
        { provide: Overlay, useValue: mockOverlay },
      ],
    });

    service = TestBed.inject(ToastService);
    const announcer = TestBed.inject(ToastAnnouncerService);
    announcerSpy = jest.spyOn(announcer, "announce");
  });

  afterEach(fakeAsync(() => {
    const toasts = service.getToasts();
    toasts.forEach((toast) => {
      service.close(toast.id);
    });
    tick(300);
  }));

  describe("show methods", () => {
    it("should show info toast", fakeAsync(() => {
      const id = service.info("Info Title", "Info content");

      expect(id).toBeDefined();
      expect(service.getToasts().length).toBe(1);
      expect(service.getToasts()[0].type).toBe("info");
      expect(service.getToasts()[0].title).toBe("Info Title");
      expect(service.getToasts()[0].content).toBe("Info content");

      service.close(id);
      tick(300);
    }));

    it("should show success toast", fakeAsync(() => {
      const id = service.success("Success Title", "Success content");

      expect(service.getToasts()[0].type).toBe("success");

      service.close(id);
      tick(300);
    }));

    it("should show warning toast", fakeAsync(() => {
      const id = service.warning("Warning Title", "Warning content");

      expect(service.getToasts()[0].type).toBe("warning");

      service.close(id);
      tick(300);
    }));

    it("should show danger toast with alert role by default", fakeAsync(() => {
      const id = service.danger("Danger Title", "Danger content");

      expect(service.getToasts()[0].type).toBe("danger");
      expect(service.getToasts()[0].role).toBe("alert");

      service.close(id);
      tick(300);
    }));

    it("should show toast with custom options", fakeAsync(() => {
      const id = service.show({
        title: "Custom Toast",
        content: "Custom content",
        type: "success",
        icon: "check",
        position: "top-left",
        duration: 5000,
        showProgressBar: true,
        pauseOnHover: false,
        role: "alert",
      });

      const toast = service.getToasts()[0];
      expect(toast.title).toBe("Custom Toast");
      expect(toast.content).toBe("Custom content");
      expect(toast.type).toBe("success");
      expect(toast.icon).toBe("check");
      expect(toast.position).toBe("top-left");
      expect(toast.duration).toBe(5000);
      expect(toast.showProgressBar).toBe(true);
      expect(toast.pauseOnHover).toBe(false);
      expect(toast.role).toBe("alert");

      service.close(id);
      tick(300);
    }));

    it("should use custom id when provided", fakeAsync(() => {
      const customId = "my-custom-toast-id";
      const id = service.info("Title", "Content", { id: customId });

      expect(id).toBe(customId);
      expect(service.getToasts()[0].id).toBe(customId);

      service.close(id);
      tick(300);
    }));

    it("should use default values when not provided", fakeAsync(() => {
      const id = service.show({ title: "Minimal Toast" });

      const toast = service.getToasts()[0];
      expect(toast.type).toBe("info");
      expect(toast.position).toBe("bottom-right");
      expect(toast.role).toBe("status");
      expect(toast.showProgressBar).toBe(false);
      expect(toast.pauseOnHover).toBe(true);

      service.close(id);
      tick(300);
    }));
  });

  describe("auto-close", () => {
    it("should auto-close toast after duration", fakeAsync(() => {
      service.info("Auto close", "Content", { duration: 1000 });

      expect(service.getToasts().length).toBe(1);

      tick(1000); // Duration
      tick(300); // Animation

      expect(service.getToasts().length).toBe(0);
    }));

    it("should not auto-close when duration is 0", fakeAsync(() => {
      const id = service.info("Persistent", "Content", { duration: 0 });

      expect(service.getToasts().length).toBe(1);

      tick(10000);

      expect(service.getToasts().length).toBe(1);

      service.close(id);
      tick(300);
    }));
  });

  describe("close", () => {
    it("should close toast by id", fakeAsync(() => {
      const id = service.info("Title", "Content");

      expect(service.getToasts().length).toBe(1);

      service.close(id);

      expect(service.getToasts()[0].exiting).toBe(true);
      tick(300);

      expect(service.getToasts().length).toBe(0);
    }));

    it("should not throw when closing non-existent toast", fakeAsync(() => {
      expect(() => service.close("non-existent-id")).not.toThrow();
    }));

    it("should not close already exiting toast", fakeAsync(() => {
      const id = service.info("Title", "Content");
      service.close(id);

      // Try to close again while exiting
      service.close(id);

      tick(300);
      expect(service.getToasts().length).toBe(0);
    }));
  });

  describe("pause and resume", () => {
    it("should pause toast timer", fakeAsync(() => {
      const id = service.info("Title", "Content", {
        duration: 2000,
        pauseOnHover: true,
      });

      tick(500);
      service.pause(id);

      expect(service.getToasts()[0].paused).toBe(true);

      tick(5000); // Wait longer than original duration

      expect(service.getToasts().length).toBe(1);

      service.close(id);
      tick(300);
    }));

    it("should resume toast timer", fakeAsync(() => {
      const id = service.info("Title", "Content", {
        duration: 2000,
        pauseOnHover: true,
      });

      tick(500);
      service.pause(id);

      tick(1000);
      service.resume(id);

      expect(service.getToasts()[0].paused).toBe(false);

      tick(1500);
      tick(300); // Animation

      expect(service.getToasts().length).toBe(0);
    }));

    it("should not pause when pauseOnHover is false", fakeAsync(() => {
      const id = service.info("Title", "Content", {
        duration: 2000,
        pauseOnHover: false,
      });

      service.pause(id);

      expect(service.getToasts()[0].paused).toBeFalsy();

      tick(2000);
      tick(300);
    }));

    it("should not pause exiting toast", fakeAsync(() => {
      const id = service.info("Title", "Content", {
        duration: 2000,
        pauseOnHover: true,
      });

      service.close(id);
      service.pause(id);

      tick(300);
    }));

    it("should not resume when not paused", fakeAsync(() => {
      const id = service.info("Title", "Content", {
        duration: 2000,
        pauseOnHover: true,
      });

      service.resume(id);

      service.close(id);
      tick(300);
    }));

    it("should not resume exiting toast", fakeAsync(() => {
      const id = service.info("Title", "Content", {
        duration: 2000,
        pauseOnHover: true,
      });

      service.pause(id);
      service.close(id);
      service.resume(id);

      tick(300);
    }));

    it("should not pause non-existent toast", fakeAsync(() => {
      expect(() => service.pause("non-existent")).not.toThrow();
    }));

    it("should not resume non-existent toast", fakeAsync(() => {
      expect(() => service.resume("non-existent")).not.toThrow();
    }));
  });

  describe("screen reader announcements", () => {
    it("should announce with polite politeness for status role", fakeAsync(() => {
      const id = service.info("Title", "Content", { role: "status" });

      expect(announcerSpy).toHaveBeenCalledWith("Title: Content", "polite");

      service.close(id);
      tick(300);
    }));

    it("should announce with assertive politeness for alert role", fakeAsync(() => {
      const id = service.danger("Error", "Something went wrong");

      expect(announcerSpy).toHaveBeenCalledWith(
        "Error: Something went wrong",
        "assertive",
      );

      service.close(id);
      tick(300);
    }));

    it("should not announce when role is none", fakeAsync(() => {
      const id = service.info("Title", "Content", { role: "none" });

      expect(announcerSpy).not.toHaveBeenCalled();

      service.close(id);
      tick(300);
    }));

    it("should announce only title when no content", fakeAsync(() => {
      const id = service.info("Title Only");

      expect(announcerSpy).toHaveBeenCalledWith("Title Only", "polite");

      service.close(id);
      tick(300);
    }));
  });

  describe("multiple toasts", () => {
    it("should manage multiple toasts", fakeAsync(() => {
      const id1 = service.info("Toast 1");
      const id2 = service.success("Toast 2");
      const id3 = service.warning("Toast 3");

      expect(service.getToasts().length).toBe(3);

      service.close(id2);
      tick(300);

      expect(service.getToasts().length).toBe(2);
      expect(service.getToasts().find((t) => t.id === id2)).toBeUndefined();

      service.close(id1);
      service.close(id3);
      tick(300);
    }));

    it("should handle toasts in different positions", fakeAsync(() => {
      const id1 = service.info("Top Left", undefined, { position: "top-left" });
      const id2 = service.info("Bottom Right", undefined, {
        position: "bottom-right",
      });

      const toasts = service.getToasts();
      expect(toasts.find((t) => t.id === id1)?.position).toBe("top-left");
      expect(toasts.find((t) => t.id === id2)?.position).toBe("bottom-right");

      service.close(id1);
      service.close(id2);
      tick(300);
    }));
  });

  describe("overlay management", () => {
    it("should create overlay on first toast", fakeAsync(() => {
      const id = service.info("Title");

      expect(mockOverlay.create).toHaveBeenCalled();
      expect(mockOverlayRef.attach).toHaveBeenCalled();

      service.close(id);
      tick(300);
    }));

    it("should reuse existing overlay for subsequent toasts", fakeAsync(() => {
      const id1 = service.info("Toast 1");
      const id2 = service.info("Toast 2");

      expect(mockOverlay.create).toHaveBeenCalledTimes(1);

      service.close(id1);
      service.close(id2);
      tick(300);
    }));

    it("should dispose overlay when all toasts are closed", fakeAsync(() => {
      const id = service.info("Title");

      service.close(id);
      tick(300);

      expect(mockOverlayRef.dispose).toHaveBeenCalled();
    }));
  });
});
