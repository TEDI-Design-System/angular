import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TooltipComponent, TooltipPosition } from "./tooltip.component";
import { NgxFloatUiContentComponent } from "ngx-float-ui";
import { Component, input, viewChild } from "@angular/core";
import { TooltipTriggerComponent } from "./tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "./tooltip-content/tooltip-content.component";

@Component({
  standalone: true,
  imports: [TooltipComponent, TooltipTriggerComponent, TooltipContentComponent],
  template: `
    <tedi-tooltip
      [position]="position()"
      [preventOverflow]="preventOverflow()"
      [appendTo]="appendTo()"
      [timeoutDelay]="timeoutDelay()"
    >
      <tedi-tooltip-trigger>Trigger</tedi-tooltip-trigger>
      <tedi-tooltip-content>Content</tedi-tooltip-content>
    </tedi-tooltip>
  `,
})
class TestTooltipComponent {
  position = input<TooltipPosition>("top");
  preventOverflow = input(true);
  appendTo = input("body");
  timeoutDelay = input(100);

  tooltip = viewChild.required(TooltipComponent);
}

describe("TooltipComponent", () => {
  let fixture: ComponentFixture<TestTooltipComponent>;
  let component: TestTooltipComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestTooltipComponent],
    });

    fixture = TestBed.createComponent(TestTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should have default input values", () => {
    expect(component.position()).toBe("top");
    expect(component.preventOverflow()).toBe(true);
    expect(component.appendTo()).toBe("body");
    expect(component.timeoutDelay()).toBe(100);
  });

  it("should initialize the viewChild floatUiComponent", () => {
    expect(component.tooltip().floatUiComponent()).toBeInstanceOf(
      NgxFloatUiContentComponent,
    );
  });

  it("should clear hide timeout when showing tooltip", () => {
    component.tooltip().hideTimeout = setTimeout(() => {}, 100);
    const spy = jest.spyOn(global, "clearTimeout");
    component.tooltip().showTooltip();
    expect(spy).toHaveBeenCalledWith(component.tooltip().hideTimeout);
  });

  it("should update position input correctly", () => {
    const POSITIONS: TooltipPosition[] = [
      "top",
      "top-start",
      "top-end",
      "bottom",
      "bottom-start",
      "bottom-end",
      "left",
      "left-start",
      "left-end",
      "right",
      "right-start",
      "right-end",
    ];

    for (const pos of POSITIONS) {
      fixture.componentRef.setInput("position", pos);
      fixture.detectChanges();
      expect(component.position()).toBe(pos);
    }
  });

  it("should update appendTo when input changes", () => {
    fixture.componentRef.setInput("appendTo", "custom-container");
    fixture.detectChanges();
    expect(component.appendTo()).toBe("custom-container");
  });

  it("should update preventOverflow when input changes", () => {
    fixture.componentRef.setInput("preventOverflow", false);
    fixture.detectChanges();
    expect(component.preventOverflow()).toBe(false);
  });

  it("should update timeoutDelay when input changes", () => {
    fixture.componentRef.setInput("timeoutDelay", 250);
    fixture.detectChanges();
    expect(component.timeoutDelay()).toBe(250);
  });

  it("should show tooltip when not visible", () => {
    const floatUi = component.tooltip().floatUiComponent();
    floatUi.state = false;
    const showSpy = jest.spyOn(floatUi, "show");
    const clearSpy = jest.spyOn(global, "clearTimeout");

    component.tooltip().showTooltip();

    expect(clearSpy).toHaveBeenCalledWith(component.tooltip().hideTimeout);
    expect(showSpy).toHaveBeenCalled();
    expect(component.tooltip().floatUiDisplay()).toBe("block");
  });

  it("should not call showTooltip again if already visible", () => {
    const floatUi = component.tooltip().floatUiComponent();
    floatUi.state = true;
    const showSpy = jest.spyOn(floatUi, "show");

    component.tooltip().showTooltip();

    expect(showSpy).not.toHaveBeenCalled();
  });

  it("should hide tooltip when visible", () => {
    const floatUi = component.tooltip().floatUiComponent();
    floatUi.state = true;
    const hideSpy = jest.spyOn(floatUi, "hide");

    component.tooltip().hideTooltip();

    expect(hideSpy).toHaveBeenCalled();
    expect(component.tooltip().floatUiDisplay()).toBe("inline");
  });

  it("should not hide tooltip if not visible", () => {
    const floatUi = component.tooltip().floatUiComponent();
    floatUi.state = false;
    const hideSpy = jest.spyOn(floatUi, "hide");

    component.tooltip().hideTooltip();

    expect(hideSpy).not.toHaveBeenCalled();
  });

  it("should call hideTooltip when tooltip is visible", () => {
    const tooltip = component.tooltip();
    const floatUi = tooltip.floatUiComponent();
    floatUi.state = true;

    const hideSpy = jest.spyOn(tooltip, "hideTooltip");
    const showSpy = jest.spyOn(tooltip, "showTooltip");

    tooltip.toggleTooltip();

    expect(hideSpy).toHaveBeenCalled();
    expect(showSpy).not.toHaveBeenCalled();
  });

  it("should call showTooltip when tooltip is hidden", () => {
    const tooltip = component.tooltip();
    const floatUi = tooltip.floatUiComponent();
    floatUi.state = false;

    const hideSpy = jest.spyOn(tooltip, "hideTooltip");
    const showSpy = jest.spyOn(tooltip, "showTooltip");

    tooltip.toggleTooltip();

    expect(showSpy).toHaveBeenCalled();
    expect(hideSpy).not.toHaveBeenCalled();
  });
});
