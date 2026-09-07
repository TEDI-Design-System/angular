import { TestBed, fakeAsync, tick } from "@angular/core/testing";
import { DOCUMENT } from "@angular/common";
import { ToastAnnouncerService } from "./toast-announcer.service";

describe("ToastAnnouncerService", () => {
  let service: ToastAnnouncerService;
  let document: Document;

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

  describe("announce", () => {
    it("should create polite announcer element", fakeAsync(() => {
      service.announce("Test message", "polite");

      tick(100);

      const element = document.getElementById("tedi-toast-announcer-polite");
      expect(element).toBeTruthy();
      expect(element?.getAttribute("aria-live")).toBe("polite");
      expect(element?.getAttribute("aria-atomic")).toBe("true");
      expect(element?.getAttribute("role")).toBe("status");
      expect(element?.classList.contains("sr-only")).toBe(true);
    }));

    it("should create assertive announcer element", fakeAsync(() => {
      service.announce("Test message", "assertive");

      tick(100);

      const element = document.getElementById("tedi-toast-announcer-assertive");
      expect(element).toBeTruthy();
      expect(element?.getAttribute("aria-live")).toBe("assertive");
      expect(element?.getAttribute("aria-atomic")).toBe("true");
      expect(element?.getAttribute("role")).toBe("alert");
      expect(element?.classList.contains("sr-only")).toBe(true);
    }));

    it("should set message content after delay", fakeAsync(() => {
      service.announce("Test message", "polite");

      const element = document.getElementById("tedi-toast-announcer-polite");
      expect(element?.textContent).toBe("");

      tick(100);

      expect(element?.textContent).toBe("Test message");
    }));

    it("should clear message after clearAfterMs", fakeAsync(() => {
      service.announce("Test message", "polite", 500);

      tick(100);
      expect(
        document.getElementById("tedi-toast-announcer-polite")?.textContent,
      ).toBe("Test message");

      tick(500);
      expect(
        document.getElementById("tedi-toast-announcer-polite")?.textContent,
      ).toBe("");
    }));

    it("should use default polite politeness", fakeAsync(() => {
      service.announce("Test message");

      tick(100);

      const politeElement = document.getElementById(
        "tedi-toast-announcer-polite",
      );
      expect(politeElement?.textContent).toBe("Test message");
    }));

    it("should reuse existing element for same politeness", fakeAsync(() => {
      service.announce("First message", "polite");
      tick(100);

      const firstElement = document.getElementById(
        "tedi-toast-announcer-polite",
      );

      service.announce("Second message", "polite");
      tick(100);

      const secondElement = document.getElementById(
        "tedi-toast-announcer-polite",
      );
      expect(firstElement).toBe(secondElement);
      expect(secondElement?.textContent).toBe("Second message");
    }));

    it("should create separate elements for different politeness levels", fakeAsync(() => {
      service.announce("Polite message", "polite");
      service.announce("Assertive message", "assertive");

      tick(100);

      const politeElement = document.getElementById(
        "tedi-toast-announcer-polite",
      );
      const assertiveElement = document.getElementById(
        "tedi-toast-announcer-assertive",
      );

      expect(politeElement).toBeTruthy();
      expect(assertiveElement).toBeTruthy();
      expect(politeElement).not.toBe(assertiveElement);
    }));

    it("should clear content before setting new message for re-announcement", fakeAsync(() => {
      service.announce("First message", "polite");
      tick(100);

      const element = document.getElementById("tedi-toast-announcer-polite");
      expect(element?.textContent).toBe("First message");

      // Announce same message again
      service.announce("First message", "polite");

      expect(element?.textContent).toBe("");

      tick(100);
      expect(element?.textContent).toBe("First message");
    }));
  });

  describe("clear", () => {
    it("should clear polite element content", fakeAsync(() => {
      service.announce("Test message", "polite");
      tick(100);

      service.clear();

      const element = document.getElementById("tedi-toast-announcer-polite");
      expect(element?.textContent).toBe("");
    }));

    it("should clear assertive element content", fakeAsync(() => {
      service.announce("Test message", "assertive");
      tick(100);

      service.clear();

      const element = document.getElementById("tedi-toast-announcer-assertive");
      expect(element?.textContent).toBe("");
    }));

    it("should clear both elements", fakeAsync(() => {
      service.announce("Polite message", "polite");
      service.announce("Assertive message", "assertive");
      tick(100);

      service.clear();

      expect(
        document.getElementById("tedi-toast-announcer-polite")?.textContent,
      ).toBe("");
      expect(
        document.getElementById("tedi-toast-announcer-assertive")?.textContent,
      ).toBe("");
    }));

    it("should not throw when no elements exist", () => {
      expect(() => service.clear()).not.toThrow();
    });
  });

  describe("destroy", () => {
    it("should remove polite element from DOM", fakeAsync(() => {
      service.announce("Test message", "polite");
      tick(100);

      expect(
        document.getElementById("tedi-toast-announcer-polite"),
      ).toBeTruthy();

      service.destroy();

      expect(document.getElementById("tedi-toast-announcer-polite")).toBeNull();
    }));

    it("should remove assertive element from DOM", fakeAsync(() => {
      service.announce("Test message", "assertive");
      tick(100);

      expect(
        document.getElementById("tedi-toast-announcer-assertive"),
      ).toBeTruthy();

      service.destroy();

      expect(
        document.getElementById("tedi-toast-announcer-assertive"),
      ).toBeNull();
    }));

    it("should remove both elements", fakeAsync(() => {
      service.announce("Polite", "polite");
      service.announce("Assertive", "assertive");
      tick(100);

      service.destroy();

      expect(document.getElementById("tedi-toast-announcer-polite")).toBeNull();
      expect(
        document.getElementById("tedi-toast-announcer-assertive"),
      ).toBeNull();
    }));

    it("should not throw when no elements exist", () => {
      expect(() => service.destroy()).not.toThrow();
    });

    it("should allow creating new elements after destroy", fakeAsync(() => {
      service.announce("First", "polite");
      tick(100);
      service.destroy();

      service.announce("Second", "polite");
      tick(100);

      const element = document.getElementById("tedi-toast-announcer-polite");
      expect(element).toBeTruthy();
      expect(element?.textContent).toBe("Second");
    }));
  });

  describe("ngOnDestroy", () => {
    it("should call destroy on ngOnDestroy", fakeAsync(() => {
      const destroySpy = jest.spyOn(service, "destroy");

      service.announce("Test", "polite");
      tick(100);

      service.ngOnDestroy();

      expect(destroySpy).toHaveBeenCalled();
    }));
  });
});
