import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { PopoverComponent, PopoverPosition } from "./popover.component";
import { NgxFloatUiContentComponent } from "ngx-float-ui";
import { PopoverTriggerDirective } from "./popover-trigger/popover-trigger.directive";
import { PopoverContentComponent } from "./popover-content/popover-content.component";

@Component({
  standalone: true,
  imports: [PopoverComponent, PopoverTriggerDirective, PopoverContentComponent],
  template: `
    <tedi-popover
      [position]="position"
      [preventOverflow]="preventOverflow"
      [dismissible]="dismissible"
      [hideOnScroll]="hideOnScroll"
      [withBorder]="withBorder"
      [withArrow]="withArrow"
      [lockScroll]="lockScroll"
    >
      <button tedi-popover-trigger>Open Popover</button>
      <tedi-popover-content>
        <p>Popover content</p>
      </tedi-popover-content>
    </tedi-popover>
  `,
})
class TestHostComponent {
  position: PopoverPosition = "top";
  preventOverflow = false;
  dismissible = true;
  hideOnScroll = false;
  withBorder = false;
  withArrow = true;
  lockScroll = false;
}

describe("PopoverComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;
  let component: PopoverComponent;
  let hostEl: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    hostEl = fixture.nativeElement;
    fixture.detectChanges();

    const popoverDebugEl = fixture.debugElement.children.find(
      (el) => el.componentInstance instanceof PopoverComponent,
    );
    component = popoverDebugEl?.componentInstance as PopoverComponent;
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should have default inputs", () => {
    expect(component.position()).toBe("top");
    expect(component.preventOverflow()).toBe(false);
    expect(component.dismissible()).toBe(true);
    expect(component.hideOnScroll()).toBe(false);
    expect(component.withBorder()).toBe(false);
  });

  it("should update preventOverflow when input changes", () => {
    hostComponent.preventOverflow = true;
    fixture.detectChanges();
    expect(component.preventOverflow()).toBe(true);
  });

  it("should initialize the ViewChild floatUiComponent", () => {
    const instance = component.floatUiComponent();
    expect(instance).toBeInstanceOf(NgxFloatUiContentComponent);
  });

  it("should render trigger button", () => {
    const trigger = hostEl.querySelector("[tedi-popover-trigger]");
    expect(trigger).toBeTruthy();
    expect(trigger?.textContent?.trim()).toBe("Open Popover");
  });

  it('should render trigger with aria-haspopup="dialog"', () => {
    const trigger = hostEl.querySelector("[tedi-popover-trigger]");
    expect(trigger?.getAttribute("aria-haspopup")).toBe("dialog");
  });

  it('should have appendTo="body" on float-ui-content', () => {
    const floatUiContent = hostEl.querySelector("float-ui-content");
    expect(floatUiContent?.getAttribute("appendTo")).toBe("body");
  });

  it("should not include the border class by default", () => {
    expect(component.floatUiContainerClass()).not.toContain("border");
  });

  it("should apply the border class when withBorder is true", () => {
    hostComponent.withBorder = true;
    fixture.detectChanges();

    expect(component.floatUiContainerClass()).toContain(
      "float-ui-container-popover--border",
    );
  });

  it("should include arrow class when withArrow is true", () => {
    expect(component.floatUiContainerClass()).toContain(
      "float-ui-container-popover--arrow",
    );
  });

  it("should not include arrow class when withArrow is false", () => {
    hostComponent.withArrow = false;
    fixture.detectChanges();

    expect(component.floatUiContainerClass()).not.toContain("arrow");
  });

  it("should update position when input changes", () => {
    const POSITIONS: PopoverPosition[] = [
      "top",
      "top-start",
      "top-end",
      "bottom",
      "bottom-start",
      "bottom-end",
      "right",
      "right-start",
      "right-end",
      "left",
      "left-start",
      "left-end",
    ];

    for (const pos of POSITIONS) {
      hostComponent.position = pos;
      fixture.detectChanges();
      expect(component.position()).toBe(pos);
    }
  });

  it("should update dismissible when input changes", () => {
    hostComponent.dismissible = false;
    fixture.detectChanges();
    expect(component.dismissible()).toBe(false);
  });

  it("should update hideOnScroll when input changes", () => {
    hostComponent.hideOnScroll = true;
    fixture.detectChanges();
    expect(component.hideOnScroll()).toBe(true);
  });

  describe("showPopover()", () => {
    it("should not show popover if already open", () => {
      const floatUi = component.floatUiComponent();
      Object.defineProperty(floatUi, "state", { value: true, writable: true });
      const showSpy = jest.spyOn(floatUi, "show");

      component.showPopover();

      expect(showSpy).not.toHaveBeenCalled();
    });

    it("should call floatUiComponent.show() when closed", () => {
      const floatUi = component.floatUiComponent();
      Object.defineProperty(floatUi, "state", { value: false, writable: true });
      const showSpy = jest.spyOn(floatUi, "show");

      component.showPopover();

      expect(showSpy).toHaveBeenCalled();
    });

    it("should set body overflow:hidden when lockScroll is true", () => {
      hostComponent.dismissible = false;
      hostComponent.hideOnScroll = false;
      hostComponent.lockScroll = true;
      fixture.detectChanges();

      const floatUi = component.floatUiComponent();
      Object.defineProperty(floatUi, "state", { value: false, writable: true });

      const renderer = component["renderer"];
      const setStyleSpy = jest.spyOn(renderer, "setStyle");

      component.showPopover();

      expect(setStyleSpy).toHaveBeenCalledWith(
        document.body,
        "overflow",
        "hidden",
      );

      Object.defineProperty(floatUi, "state", { value: true, writable: true });
      component.hidePopover();
    });

    it("should setup scroll listener when hideOnScroll is true", () => {
      hostComponent.hideOnScroll = true;
      hostComponent.dismissible = false;
      fixture.detectChanges();

      const floatUi = component.floatUiComponent();
      Object.defineProperty(floatUi, "state", { value: false, writable: true });

      component.showPopover();

      expect(component["scrollListener"]).toBeDefined();

      Object.defineProperty(floatUi, "state", { value: true, writable: true });
      component.hidePopover();
    });

    it("should setup dismiss listeners when dismissible is true", () => {
      hostComponent.dismissible = true;
      hostComponent.hideOnScroll = false;
      fixture.detectChanges();

      const floatUi = component.floatUiComponent();
      Object.defineProperty(floatUi, "state", { value: false, writable: true });

      component.showPopover();

      expect(component["focusinListener"]).toBeDefined();
      expect(component["mousedownListener"]).toBeDefined();

      Object.defineProperty(floatUi, "state", { value: true, writable: true });
      component.hidePopover();
    });
  });

  describe("hidePopover()", () => {
    beforeEach(() => {
      const floatUi = component.floatUiComponent();
      Object.defineProperty(floatUi, "state", { value: false, writable: true });
      component.showPopover();
      Object.defineProperty(floatUi, "state", { value: true, writable: true });
    });

    it("should not hide popover if already closed", () => {
      const floatUi = component.floatUiComponent();
      Object.defineProperty(floatUi, "state", { value: false, writable: true });
      const hideSpy = jest.spyOn(floatUi, "hide");

      component.hidePopover();

      expect(hideSpy).not.toHaveBeenCalled();
    });

    it("should call floatUiComponent.hide() when open", () => {
      const floatUi = component.floatUiComponent();
      const hideSpy = jest.spyOn(floatUi, "hide");

      component.hidePopover();

      expect(hideSpy).toHaveBeenCalled();
    });

    it("should remove body overflow style when lockScroll is true", () => {
      hostComponent.lockScroll = true;
      fixture.detectChanges();

      const renderer = component["renderer"];
      const removeStyleSpy = jest.spyOn(renderer, "removeStyle");

      component.hidePopover();

      expect(removeStyleSpy).toHaveBeenCalledWith(document.body, "overflow");
    });

    it("should focus trigger when focusTrigger is true", () => {
      const trigger = component.popoverTrigger().host.nativeElement;
      const focusSpy = jest.spyOn(trigger, "focus");

      component.hidePopover(true);

      expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    });

    it("should not focus trigger when focusTrigger is false", () => {
      const trigger = component.popoverTrigger().host.nativeElement;
      const focusSpy = jest.spyOn(trigger, "focus");

      component.hidePopover(false);

      expect(focusSpy).not.toHaveBeenCalled();
    });

    it("should cleanup all listeners", () => {
      component.hidePopover();

      expect(component["keydownListener"]).toBeUndefined();
      expect(component["scrollListener"]).toBeUndefined();
      expect(component["focusinListener"]).toBeUndefined();
      expect(component["mousedownListener"]).toBeUndefined();
    });
  });

  describe("togglePopover()", () => {
    it("should call hidePopover(true) when popover is open", () => {
      const floatUi = component.floatUiComponent();
      Object.defineProperty(floatUi, "state", { value: true, writable: true });
      const hideSpy = jest.spyOn(component, "hidePopover");

      component.togglePopover();

      expect(hideSpy).toHaveBeenCalledWith(true);
    });

    it("should call showPopover() when popover is closed", () => {
      const floatUi = component.floatUiComponent();
      Object.defineProperty(floatUi, "state", { value: false, writable: true });
      const showSpy = jest.spyOn(component, "showPopover");

      component.togglePopover();

      expect(showSpy).toHaveBeenCalled();
    });
  });

  describe("Keyboard navigation", () => {
    beforeEach(() => {
      const floatUi = component.floatUiComponent();
      Object.defineProperty(floatUi, "state", { value: false, writable: true });
      component.showPopover();
      Object.defineProperty(floatUi, "state", { value: true, writable: true });
    });

    afterEach(() => {
      component.hidePopover();
    });

    it("should close popover and focus trigger on Escape key", () => {
      const container = document.querySelector(
        ".float-ui-container-popover",
      ) as HTMLElement;
      const trigger = component.popoverTrigger().host.nativeElement;
      const focusSpy = jest.spyOn(trigger, "focus");

      const event = new KeyboardEvent("keydown", { key: "Escape" });
      const preventDefaultSpy = jest.spyOn(event, "preventDefault");

      container?.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    });

    it("should handle Tab key when at last focusable element", () => {
      const container = document.querySelector(
        ".float-ui-container-popover",
      ) as HTMLElement;

      if (container) {
        const button = document.createElement("button");
        button.textContent = "Test";
        container.appendChild(button);
        button.focus();

        const event = new KeyboardEvent("keydown", { key: "Tab" });
        const preventDefaultSpy = jest.spyOn(event, "preventDefault");

        container.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();

        button.remove();
      }
    });

    it("should handle Shift+Tab when at first focusable element", () => {
      const container = document.querySelector(
        ".float-ui-container-popover",
      ) as HTMLElement;

      if (container) {
        const button = document.createElement("button");
        button.textContent = "Test";
        container.appendChild(button);
        button.focus();

        const event = new KeyboardEvent("keydown", {
          key: "Tab",
          shiftKey: true,
        });
        const preventDefaultSpy = jest.spyOn(event, "preventDefault");

        container.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();

        button.remove();
      }
    });
  });

  describe("Scroll listener", () => {
    it("should hide popover on scroll when hideOnScroll is true", () => {
      hostComponent.hideOnScroll = true;
      hostComponent.dismissible = false;
      fixture.detectChanges();

      const floatUi = component.floatUiComponent();
      Object.defineProperty(floatUi, "state", { value: false, writable: true });
      component.showPopover();
      Object.defineProperty(floatUi, "state", { value: true, writable: true });

      const hideSpy = jest.spyOn(component, "hidePopover");

      const scrollEvent = new Event("scroll");
      document.dispatchEvent(scrollEvent);

      expect(hideSpy).toHaveBeenCalledWith(false);
    });
  });

  describe("Dismissible (click/focus outside)", () => {
    beforeEach(() => {
      hostComponent.dismissible = true;
      hostComponent.hideOnScroll = false;
      fixture.detectChanges();

      const floatUi = component.floatUiComponent();
      Object.defineProperty(floatUi, "state", { value: false, writable: true });
      component.showPopover();
      Object.defineProperty(floatUi, "state", { value: true, writable: true });
    });

    afterEach(() => {
      component.hidePopover();
    });

    it("should close popover on mousedown outside", () => {
      const hideSpy = jest.spyOn(component, "hidePopover");
      const outsideElement = document.createElement("div");
      document.body.appendChild(outsideElement);

      const event = new MouseEvent("mousedown", { bubbles: true });
      outsideElement.dispatchEvent(event);

      expect(hideSpy).toHaveBeenCalledWith(true);

      outsideElement.remove();
    });

    it("should NOT close popover on mousedown inside trigger", () => {
      const hideSpy = jest.spyOn(component, "hidePopover");
      const trigger = component.popoverTrigger().host.nativeElement;

      const event = new MouseEvent("mousedown", { bubbles: true });
      trigger.dispatchEvent(event);

      expect(hideSpy).not.toHaveBeenCalled();
    });

    it("should NOT close popover on mousedown inside container", () => {
      const hideSpy = jest.spyOn(component, "hidePopover");
      const container = document.querySelector(
        ".float-ui-container-popover",
      ) as HTMLElement;

      const event = new MouseEvent("mousedown", { bubbles: true });
      container?.dispatchEvent(event);

      expect(hideSpy).not.toHaveBeenCalled();
    });

    it("should close popover on focusin outside", () => {
      const hideSpy = jest.spyOn(component, "hidePopover");
      const outsideElement = document.createElement("button");
      document.body.appendChild(outsideElement);

      const event = new FocusEvent("focusin", { bubbles: true });
      Object.defineProperty(event, "target", {
        value: outsideElement,
        enumerable: true,
      });
      document.dispatchEvent(event);

      expect(hideSpy).toHaveBeenCalledWith(true);

      outsideElement.remove();
    });
  });
});
