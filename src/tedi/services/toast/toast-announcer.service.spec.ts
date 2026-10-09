import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { DOCUMENT } from "@angular/common";
import { ToastAnnouncerService } from "./toast-announcer.service";

describe("ToastAnnouncerService", () => {
  let service: ToastAnnouncerService;
  let document: Document;

  const region = (politeness: "polite" | "assertive") =>
    document.getElementById(`tedi-toast-announcer-${politeness}`);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastAnnouncerService],
    });

    service = TestBed.inject(ToastAnnouncerService);
    document = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    service.destroy();
  });

  describe("live regions", () => {
    it("should create both live regions up front, before anything is announced", () => {
      expect(region("polite")).toBeTruthy();
      expect(region("assertive")).toBeTruthy();
      expect(region("polite")?.textContent).toBe("");
      expect(region("assertive")?.textContent).toBe("");
    });

    it("should set a fixed aria-live and non-atomic semantics on each region", () => {
      expect(region("polite")?.getAttribute("aria-live")).toBe("polite");
      expect(region("assertive")?.getAttribute("aria-live")).toBe("assertive");

      for (const politeness of ["polite", "assertive"] as const) {
        expect(region(politeness)?.getAttribute("aria-atomic")).toBe("false");
        expect(region(politeness)?.classList.contains("sr-only")).toBe(true);
      }
    });

    it("should not set a role that would duplicate the aria-live semantics", () => {
      expect(region("polite")?.getAttribute("role")).toBeNull();
      expect(region("assertive")?.getAttribute("role")).toBeNull();
    });
  });

  describe("announce", () => {
    it("should append the message to the matching region after a short delay", fakeAsync(() => {
      service.announce("Test message", "polite");

      expect(region("polite")?.textContent).toBe("");

      tick(100);

      expect(region("polite")?.textContent).toBe("Test message");
      expect(region("assertive")?.textContent).toBe("");
    }));

    it("should default to polite", fakeAsync(() => {
      service.announce("Test message");

      tick(100);

      expect(region("polite")?.textContent).toBe("Test message");
    }));

    it("should route assertive messages to the assertive region", fakeAsync(() => {
      service.announce("Test message", "assertive");

      tick(100);

      expect(region("assertive")?.textContent).toBe("Test message");
      expect(region("polite")?.textContent).toBe("");
    }));

    it("should remove the message after clearAfterMs", fakeAsync(() => {
      service.announce("Test message", "polite", 500);

      tick(100);
      expect(region("polite")?.textContent).toBe("Test message");

      tick(500);
      expect(region("polite")?.textContent).toBe("");
    }));

    it("should keep the region in place after the message is removed", fakeAsync(() => {
      const before = region("polite");

      service.announce("Test message", "polite", 500);
      tick(600);

      expect(region("polite")).toBe(before);
    }));

    it("should announce both messages when two toasts arrive in quick succession", fakeAsync(() => {
      service.announce("First message", "polite");
      tick(50);
      service.announce("Second message", "polite");
      tick(100);

      const text = region("polite")?.textContent ?? "";
      expect(text).toContain("First message");
      expect(text).toContain("Second message");

      tick(1000);
      expect(region("polite")?.textContent).toBe("");
    }));

    it("should announce a repeated message as a new addition", fakeAsync(() => {
      service.announce("Same message", "polite");
      tick(1100);
      expect(region("polite")?.textContent).toBe("");

      service.announce("Same message", "polite");
      tick(100);

      expect(region("polite")?.textContent).toBe("Same message");
    }));
  });

  describe("clear", () => {
    it("should remove announced messages from both regions", fakeAsync(() => {
      service.announce("Polite message", "polite");
      service.announce("Assertive message", "assertive");
      tick(100);

      service.clear();

      expect(region("polite")?.textContent).toBe("");
      expect(region("assertive")?.textContent).toBe("");
    }));

    it("should cancel messages that have not been announced yet", fakeAsync(() => {
      service.announce("Test message", "polite");

      service.clear();
      tick(100);

      expect(region("polite")?.textContent).toBe("");
    }));

    it("should keep the regions in the DOM", () => {
      service.clear();

      expect(region("polite")).toBeTruthy();
      expect(region("assertive")).toBeTruthy();
    });
  });

  describe("destroy", () => {
    it("should remove both regions from the DOM", () => {
      service.destroy();

      expect(region("polite")).toBeNull();
      expect(region("assertive")).toBeNull();
    });

    it("should not throw when called twice", () => {
      service.destroy();

      expect(() => service.destroy()).not.toThrow();
    });

    it("should cancel pending announcements", fakeAsync(() => {
      service.announce("Test message", "polite");

      service.destroy();
      tick(100);

      expect(region("polite")).toBeNull();
    }));

    it("should recreate regions when announcing after destroy", fakeAsync(() => {
      service.destroy();

      service.announce("Second", "polite");
      tick(100);

      expect(region("polite")?.textContent).toBe("Second");
    }));
  });

  describe("ngOnDestroy", () => {
    it("should call destroy on ngOnDestroy", () => {
      const destroySpy = jest.spyOn(service, "destroy");

      service.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
    });
  });
});
