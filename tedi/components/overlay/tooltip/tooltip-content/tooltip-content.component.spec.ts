import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  TooltipContentComponent,
  TooltipWidth,
} from "./tooltip-content.component";
import { TooltipComponent } from "../tooltip.component";
import { Component, input, viewChild } from "@angular/core";

class MockTooltipComponent {
  hideTooltip = jest.fn();
  hideTimeout?: ReturnType<typeof setTimeout>;
  isContentHovered = {
    set: jest.fn(),
  };
}

@Component({
  standalone: true,
  imports: [TooltipContentComponent],
  template: `<tedi-tooltip-content
    [maxWidth]="width()"
  ></tedi-tooltip-content>`,
})
class TestHostComponent {
  width = input<TooltipWidth>("medium");
  content = viewChild.required(TooltipContentComponent);
}

describe("TooltipContentComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TooltipContentComponent;
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

    component = fixture.componentInstance.content();
    tooltip = TestBed.inject(
      TooltipComponent,
    ) as unknown as MockTooltipComponent;
    hostEl = fixture.nativeElement.querySelector("tedi-tooltip-content");
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should have default maxWidth value", () => {
    expect(component.maxWidth()).toBe("medium");
  });

  it("should compute correct classes for default width", () => {
    expect(component.classes()).toBe(
      "tedi-tooltip-content tedi-tooltip-content--medium",
    );
  });

  it("should update classes when width input changes", () => {
    fixture.componentRef.setInput("width", "large");
    fixture.detectChanges();

    expect(component.maxWidth()).toBe("large");
    expect(component.classes()).toBe(
      "tedi-tooltip-content tedi-tooltip-content--large",
    );
  });

  describe("Event listeners", () => {
    it("should clear hideTimeout and set isContentHovered to true on mouseenter", () => {
      const clearSpy = jest.spyOn(global, "clearTimeout");

      hostEl.dispatchEvent(new Event("mouseenter"));

      expect(clearSpy).toHaveBeenCalledWith(tooltip.hideTimeout);
      expect(tooltip.isContentHovered.set).toHaveBeenCalledWith(true);

      clearSpy.mockRestore();
    });

    it("should call hideTooltip and set isContentHovered to false on mouseleave", () => {
      hostEl.dispatchEvent(new Event("mouseleave"));

      expect(tooltip.hideTooltip).toHaveBeenCalled();
      expect(tooltip.isContentHovered.set).toHaveBeenCalledWith(false);
    });
  });
});
