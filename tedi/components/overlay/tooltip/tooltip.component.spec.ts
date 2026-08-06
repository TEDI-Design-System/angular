import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TooltipComponent, TooltipPosition } from "./tooltip.component";
import { Component, input, viewChild } from "@angular/core";
import { OverlayContainer } from "@angular/cdk/overlay";
import { TooltipTriggerComponent } from "./tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "./tooltip-content/tooltip-content.component";

@Component({
  standalone: true,
  imports: [TooltipComponent, TooltipTriggerComponent, TooltipContentComponent],
  template: `
    <tedi-tooltip
      [position]="position()"
      [preventOverflow]="preventOverflow()"
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
  timeoutDelay = input(100);

  tooltip = viewChild.required(TooltipComponent);
}

describe("TooltipComponent", () => {
  let fixture: ComponentFixture<TestTooltipComponent>;
  let component: TestTooltipComponent;
  let overlayContainer: OverlayContainer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestTooltipComponent],
    });

    fixture = TestBed.createComponent(TestTooltipComponent);
    component = fixture.componentInstance;
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should have default input values", () => {
    expect(component.position()).toBe("top");
    expect(component.preventOverflow()).toBe(true);
    expect(component.timeoutDelay()).toBe(100);
  });

  it("should have isOpen initially false", () => {
    expect(component.tooltip().isOpen()).toBe(false);
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
    const tooltip = component.tooltip();
    expect(tooltip.isOpen()).toBe(false);

    const clearSpy = jest.spyOn(global, "clearTimeout");
    tooltip.showTooltip();

    expect(clearSpy).toHaveBeenCalledWith(tooltip.hideTimeout);
    expect(tooltip.isOpen()).toBe(true);
  });

  it("should not show tooltip again if already visible", () => {
    const tooltip = component.tooltip();
    tooltip.showTooltip();

    tooltip.showTooltip();

    expect(tooltip.isOpen()).toBe(true);
  });

  it("should hide tooltip when visible", () => {
    const tooltip = component.tooltip();
    tooltip.showTooltip();

    tooltip.hideTooltip();

    expect(tooltip.isOpen()).toBe(false);
  });

  it("should not hide tooltip if not visible", () => {
    const tooltip = component.tooltip();
    expect(tooltip.isOpen()).toBe(false);

    tooltip.hideTooltip();

    expect(tooltip.isOpen()).toBe(false);
  });

  it("should call hideTooltip when tooltip is visible", () => {
    const tooltip = component.tooltip();
    tooltip.showTooltip();

    const hideSpy = jest.spyOn(tooltip, "hideTooltip");
    const showSpy = jest.spyOn(tooltip, "showTooltip");

    tooltip.toggleTooltip();

    expect(hideSpy).toHaveBeenCalled();
    expect(showSpy).not.toHaveBeenCalled();
  });

  it("should call showTooltip when tooltip is hidden", () => {
    const tooltip = component.tooltip();
    expect(tooltip.isOpen()).toBe(false);

    const hideSpy = jest.spyOn(tooltip, "hideTooltip");
    const showSpy = jest.spyOn(tooltip, "showTooltip");

    tooltip.toggleTooltip();

    expect(showSpy).toHaveBeenCalled();
    expect(hideSpy).not.toHaveBeenCalled();
  });
});

@Component({
  standalone: true,
  imports: [TooltipComponent, TooltipTriggerComponent, TooltipContentComponent],
  template: `
    <tedi-tooltip
      [open]="open()"
      [openWith]="openWith()"
      [trackPosition]="trackPosition()"
    >
      <tedi-tooltip-trigger [interactive]="interactive()">
        <span>Anchor</span>
      </tedi-tooltip-trigger>
      <tedi-tooltip-content>Content</tedi-tooltip-content>
    </tedi-tooltip>
  `,
})
class ControlledTooltipComponent {
  open = input<boolean | undefined>(undefined);
  openWith = input<"hover" | "click" | "both" | "none">("none");
  trackPosition = input(false);
  interactive = input(true);

  tooltip = viewChild.required(TooltipComponent);
  trigger = viewChild.required(TooltipTriggerComponent);
}

describe("TooltipComponent controlled/tracking", () => {
  let fixture: ComponentFixture<ControlledTooltipComponent>;
  let component: ControlledTooltipComponent;
  let overlayContainer: OverlayContainer;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ControlledTooltipComponent] });
    fixture = TestBed.createComponent(ControlledTooltipComponent);
    component = fixture.componentInstance;
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it("reflects the controlled open input", () => {
    const tooltip = component.tooltip();
    expect(tooltip.isOpen()).toBe(false);

    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();
    expect(tooltip.isOpen()).toBe(true);

    fixture.componentRef.setInput("open", false);
    fixture.detectChanges();
    expect(tooltip.isOpen()).toBe(false);
  });

  it("ignores internal show/hide while controlled", () => {
    const tooltip = component.tooltip();
    fixture.componentRef.setInput("open", false);
    fixture.detectChanges();

    tooltip.showTooltip();
    expect(tooltip.isOpen()).toBe(false);
  });

  it("skips focus/tabindex synthesis when interactive is false", () => {
    const freshFixture = TestBed.createComponent(ControlledTooltipComponent);
    freshFixture.componentRef.setInput("interactive", false);
    freshFixture.detectChanges();

    const anchor = freshFixture.nativeElement.querySelector("span");
    expect(anchor.getAttribute("tabindex")).toBeNull();
    expect(anchor.classList.contains("tedi-tooltip-trigger--focus")).toBe(false);
  });

  it("synthesizes focusability when interactive is true", () => {
    fixture.componentRef.setInput("interactive", true);
    fixture.detectChanges();

    const anchor = fixture.nativeElement.querySelector("span");
    expect(anchor.getAttribute("tabindex")).toBe("0");
  });

  it("updatePosition delegates to the overlayRef", () => {
    const tooltip = component.tooltip();
    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();

    const overlayRef = (
      tooltip as unknown as {
        connectedOverlay: () => { overlayRef?: { updatePosition: () => void } };
      }
    ).connectedOverlay()?.overlayRef;
    const spy = jest.spyOn(overlayRef!, "updatePosition");

    tooltip.updatePosition();
    expect(spy).toHaveBeenCalled();
  });

  it("starts a rAF loop while open with trackPosition, and stops when closed", () => {
    const rafSpy = jest
      .spyOn(global, "requestAnimationFrame")
      .mockImplementation(() => 1 as unknown as number);
    const cancelSpy = jest
      .spyOn(global, "cancelAnimationFrame")
      .mockImplementation(() => undefined);

    fixture.componentRef.setInput("trackPosition", true);
    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();
    expect(rafSpy).toHaveBeenCalled();

    fixture.componentRef.setInput("open", false);
    fixture.detectChanges();
    expect(cancelSpy).toHaveBeenCalled();

    rafSpy.mockRestore();
    cancelSpy.mockRestore();
  });
});
