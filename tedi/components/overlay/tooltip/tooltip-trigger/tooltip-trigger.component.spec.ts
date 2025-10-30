import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TooltipTriggerComponent } from "./tooltip-trigger.component";
import { TooltipComponent } from "../tooltip.component";
import { Component, viewChild } from "@angular/core";
import { Renderer2 } from "@angular/core";

class MockTooltipComponent {
  containerId = jest.fn(() => "mockContainer");
  isContentHovered = jest.fn(() => false);
  timeoutDelay = jest.fn(() => 100);
  hideTimeout?: ReturnType<typeof setTimeout>;
  showTooltip = jest.fn();
  hideTooltip = jest.fn();
  toggleTooltip = jest.fn();
}

@Component({
  standalone: true,
  imports: [TooltipTriggerComponent],
  template: `<tedi-tooltip-trigger>Trigger text</tedi-tooltip-trigger>`,
})
class TestHostComponent {
  trigger = viewChild.required(TooltipTriggerComponent);
}

describe("TooltipTriggerComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TooltipTriggerComponent;
  let tooltip: MockTooltipComponent;
  let hostEl: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: TooltipComponent, useClass: MockTooltipComponent },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    component = fixture.componentInstance.trigger();
    tooltip = TestBed.inject(
      TooltipComponent,
    ) as unknown as MockTooltipComponent;
    hostEl = component.host.nativeElement;
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  describe("Event listeners", () => {
    it("should call toggleTooltip on click", () => {
      hostEl.click();
      expect(tooltip.toggleTooltip).toHaveBeenCalled();
    });

    it("should call showTooltip on mouseenter", () => {
      hostEl.dispatchEvent(new Event("mouseenter"));
      expect(tooltip.showTooltip).toHaveBeenCalled();
    });

    it("should call showTooltip on focusin", () => {
      hostEl.dispatchEvent(new Event("focusin"));
      expect(tooltip.showTooltip).toHaveBeenCalled();
    });

    it("should call hideTooltip on focusout when not hovering content", () => {
      hostEl.dispatchEvent(new Event("focusout"));
      expect(tooltip.hideTooltip).toHaveBeenCalled();
    });

    it("should not hideTooltip on focusout when content is hovered", () => {
      tooltip.isContentHovered = jest.fn(() => true);
      hostEl.dispatchEvent(new Event("focusout"));
      expect(tooltip.hideTooltip).not.toHaveBeenCalled();
    });
  });

  describe("ngAfterContentChecked", () => {
    let renderer: Renderer2;

    beforeEach(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderer = (component as any).renderer;
      jest.spyOn(renderer, "addClass");
      jest.spyOn(renderer, "setAttribute");
      jest.spyOn(renderer, "insertBefore");
      jest.spyOn(renderer, "appendChild");
    });

    it("should do nothing if element has no children", () => {
      hostEl.innerHTML = "";
      component.ngAfterContentChecked();
      expect(renderer.addClass).not.toHaveBeenCalled();
    });

    it("should wrap text node inside span with classes and tabindex", () => {
      hostEl.innerHTML = "Just text";
      component.ngAfterContentChecked();
      const span = hostEl.querySelector("span");
      expect(span).toBeTruthy();
      expect(span?.classList.contains("tedi-tooltip-trigger__text")).toBe(true);
      expect(span?.getAttribute("tabindex")).toBe("0");
    });

    it("should add focus class and tabindex to element child", () => {
      hostEl.innerHTML = `<button>Click me</button>`;
      const btn = hostEl.querySelector("button")!;
      component.ngAfterContentChecked();
      expect(btn.classList.contains("tedi-tooltip-trigger--focus")).toBe(true);
      expect(btn.getAttribute("tabindex")).toBe("0");
    });

    it("should not override existing tabindex on child", () => {
      hostEl.innerHTML = `<button tabindex="2">Click me</button>`;
      const btn = hostEl.querySelector("button")!;
      component.ngAfterContentChecked();
      expect(btn.getAttribute("tabindex")).toBe("2");
    });
  });
});
