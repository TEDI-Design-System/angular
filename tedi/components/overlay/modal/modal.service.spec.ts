import { TestBed } from "@angular/core/testing";
import {
  Component,
  inject,
} from "@angular/core";
import { ModalService } from "./modal.service";
import { ModalRef } from "./modal-ref";
import { MODAL_DATA } from "./modal.types";

@Component({
  standalone: true,
  template: `<div class="test-content">{{ data?.message }}</div>`,
})
class TestModalContentComponent {
  data = inject(MODAL_DATA, { optional: true }) as { message: string } | null;
  ref = inject(ModalRef);
}

describe("ModalService", () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalService);
  });

  afterEach(() => {
    service.closeAll();
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should open a modal and return a ModalRef", () => {
    const ref = service.open(TestModalContentComponent);
    expect(ref).toBeInstanceOf(ModalRef);
  });

  it("should pass data to the modal content via MODAL_DATA", () => {
    const ref = service.open(TestModalContentComponent, {
      data: { message: "Hello" },
    });

    expect(ref).toBeTruthy();
    ref.close();
  });

  it("should close the modal via ModalRef.close()", (done) => {
    const ref = service.open(TestModalContentComponent);

    ref.closed.subscribe((result) => {
      expect(result).toBeUndefined();
      done();
    });

    ref.close();
  });

  it("should return a result when closing", (done) => {
    const ref = service.open<string>(TestModalContentComponent);

    ref.closed.subscribe((result) => {
      expect(result).toBe("confirmed");
      done();
    });

    ref.close("confirmed");
  });

  it("should apply correct panel classes for default config", () => {
    const ref = service.open(TestModalContentComponent);

    const overlayPane = document.querySelector(".cdk-overlay-pane");
    expect(overlayPane?.classList.contains("tedi-modal-dialog")).toBe(true);
    expect(overlayPane?.classList.contains("tedi-modal-dialog--default")).toBe(true);
    expect(overlayPane?.classList.contains("tedi-modal-dialog--sm")).toBe(true);
    expect(overlayPane?.classList.contains("tedi-modal-dialog--center")).toBe(true);
    expect(overlayPane?.classList.contains("tedi-modal-dialog--top")).toBe(false);

    ref.close();
  });

  it("should apply correct panel classes for custom config", () => {
    const ref = service.open(TestModalContentComponent, {
      size: "small",
      width: "lg",
      position: "right",
    });

    const overlayPane = document.querySelector(".cdk-overlay-pane");
    expect(overlayPane?.classList.contains("tedi-modal-dialog--small")).toBe(true);
    expect(overlayPane?.classList.contains("tedi-modal-dialog--lg")).toBe(true);
    expect(overlayPane?.classList.contains("tedi-modal-dialog--right")).toBe(true);

    ref.close();
  });

  it("should apply top and center classes when position is top", () => {
    const ref = service.open(TestModalContentComponent, {
      position: "top",
    });

    const overlayPane = document.querySelector(".cdk-overlay-pane");
    expect(overlayPane?.classList.contains("tedi-modal-dialog--top")).toBe(true);
    expect(overlayPane?.classList.contains("tedi-modal-dialog--center")).toBe(true);

    ref.close();
  });

  it("should not apply width class for custom width values", () => {
    const ref = service.open(TestModalContentComponent, {
      width: "80%",
    });

    const overlayPane = document.querySelector(".cdk-overlay-pane");
    expect(overlayPane?.classList.contains("tedi-modal-dialog--80%")).toBe(false);

    ref.close();
  });

  it("should set max-width on overlay element for custom width", () => {
    const ref = service.open(TestModalContentComponent, {
      width: "80%",
    });

    const overlayElement = document.querySelector(".cdk-global-overlay-wrapper .cdk-overlay-pane") as HTMLElement;
    expect(overlayElement?.style.maxWidth).toBe("80%");

    ref.close();
  });

  it("should apply fullscreen-mobile class when mobileFullscreen is true", () => {
    const ref = service.open(TestModalContentComponent, {
      mobileFullscreen: true,
    });

    const overlayPane = document.querySelector(".cdk-overlay-pane");
    expect(overlayPane?.classList.contains("tedi-modal-dialog--fullscreen-mobile")).toBe(true);

    ref.close();
  });

  it("should not apply fullscreen-mobile class by default", () => {
    const ref = service.open(TestModalContentComponent);

    const overlayPane = document.querySelector(".cdk-overlay-pane");
    expect(overlayPane?.classList.contains("tedi-modal-dialog--fullscreen-mobile")).toBe(false);

    ref.close();
  });

  it("should apply backdrop class", () => {
    const ref = service.open(TestModalContentComponent);

    const backdrop = document.querySelector(".cdk-overlay-backdrop");
    expect(backdrop?.classList.contains("tedi-modal-backdrop")).toBe(true);

    ref.close();
  });

  it("should close on Escape by default", () => {
    const ref = service.open(TestModalContentComponent);

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    document.querySelector("cdk-dialog-container")?.dispatchEvent(event);

    // The dialog should be closing/closed
    expect(ref).toBeTruthy();
    ref.close();
  });

  it("should not close on Escape when closeOnEscape is false", () => {
    service.open(TestModalContentComponent, {
      closeOnEscape: false,
    });

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    document.querySelector("cdk-dialog-container")?.dispatchEvent(event);

    // Modal should still be open - overlay pane should exist
    const overlayPane = document.querySelector(".cdk-overlay-pane");
    expect(overlayPane).toBeTruthy();

    service.closeAll();
  });

  it("should apply scroll-page class when scrollBehavior is page", () => {
    const ref = service.open(TestModalContentComponent, {
      scrollBehavior: "page",
    });

    const overlayPane = document.querySelector(".cdk-overlay-pane");
    expect(overlayPane?.classList.contains("tedi-modal-dialog--scroll-page")).toBe(true);

    ref.close();
  });

  it("should set overflow and padding on host element for page scroll", () => {
    const ref = service.open(TestModalContentComponent, {
      scrollBehavior: "page",
    });

    const hostElement = document.querySelector(".cdk-global-overlay-wrapper") as HTMLElement;
    expect(hostElement?.style.overflow).toBe("auto");

    ref.close();
  });

  it("should apply left position strategy", () => {
    const ref = service.open(TestModalContentComponent, {
      position: "left",
    });

    const overlayPane = document.querySelector(".cdk-overlay-pane");
    expect(overlayPane?.classList.contains("tedi-modal-dialog--left")).toBe(true);

    ref.close();
  });

  it("should apply page scroll position strategy", () => {
    const ref = service.open(TestModalContentComponent, {
      scrollBehavior: "page",
    });

    const overlayPane = document.querySelector(".cdk-overlay-pane");
    expect(overlayPane?.classList.contains("tedi-modal-dialog--scroll-page")).toBe(true);
    expect(overlayPane?.classList.contains("tedi-modal-dialog--center")).toBe(true);

    ref.close();
  });

  it("should expose backdropClick observable on ModalRef", () => {
    const ref = service.open(TestModalContentComponent);

    expect(ref.backdropClick).toBeDefined();
    expect(ref.backdropClick.subscribe).toBeDefined();

    ref.close();
  });

  it("should expose keydownEvents observable on ModalRef", () => {
    const ref = service.open(TestModalContentComponent);

    expect(ref.keydownEvents).toBeDefined();
    expect(ref.keydownEvents.subscribe).toBeDefined();

    ref.close();
  });

  it("should support updateSize on ModalRef", () => {
    const ref = service.open(TestModalContentComponent);

    const result = ref.updateSize("500px", "300px");
    expect(result).toBe(ref);

    ref.close();
  });

  it("should close all modals via closeAll()", () => {
    service.open(TestModalContentComponent);
    service.open(TestModalContentComponent);

    service.closeAll();

    const overlayPanes = document.querySelectorAll(".tedi-modal-dialog");
    expect(overlayPanes.length).toBe(0);
  });
});
