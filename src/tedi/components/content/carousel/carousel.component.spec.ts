/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { CarouselContentComponent } from "./carousel-content/carousel-content.component";
import {
  Breakpoint,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { CarouselIndicatorsComponent } from "./carousel-indicators/carousel-indicators.component";
import { CarouselComponent } from "./carousel.component";
import { CarouselNavigationComponent } from "./carousel-navigation/carousel-navigation.component";

function dispatchPointerLike(
  el: HTMLElement,
  type: "pointerdown" | "pointermove" | "pointerup" | "lostpointercapture",
  props: { clientX?: number; pointerId?: number } = {},
) {
  const ev = new Event(type, { bubbles: true, cancelable: true });
  if (props.clientX !== undefined) {
    Object.defineProperty(ev, "clientX", { value: props.clientX });
  }
  if (props.pointerId !== undefined) {
    Object.defineProperty(ev, "pointerId", { value: props.pointerId });
  }
  el.dispatchEvent(ev);
  return ev;
}

describe("CarouselContentComponent", () => {
  let fixture: ComponentFixture<CarouselContentComponent>;
  let component: CarouselContentComponent;
  let hostElement: HTMLElement;

  let mockBreakpointService: any;
  let mockTranslationService: { track: jest.Mock; translate: jest.Mock };
  let mockLiveAnnouncer: { announce: jest.Mock };
  let fakeViewport: HTMLDivElement;

  beforeEach(async () => {
    class MockResizeObserver {
      callback: ResizeObserverCallback;
      observe = jest.fn();
      unobserve = jest.fn();
      disconnect = jest.fn();
      constructor(cb: ResizeObserverCallback) {
        this.callback = cb;
      }
    }

    global.ResizeObserver =
      MockResizeObserver as unknown as typeof ResizeObserver;

    fakeViewport = document.createElement("div");
    fakeViewport.style.width = "1000px";

    mockBreakpointService = {
      isAboveBreakpoint: () => signal(false),
    };

    mockTranslationService = {
      track: jest.fn((key: string) => () => key),
      translate: jest.fn((key: string) => key),
    };

    mockLiveAnnouncer = {
      announce: jest.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [CarouselContentComponent],
      providers: [
        { provide: BreakpointService, useValue: mockBreakpointService },
        { provide: TediTranslationService, useValue: mockTranslationService },
        { provide: ElementRef, useValue: new ElementRef(fakeViewport) },
        { provide: LiveAnnouncer, useValue: mockLiveAnnouncer },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CarouselContentComponent);
    fixture.detectChanges();

    component = fixture.componentInstance;
    hostElement = fixture.nativeElement;
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should have correct base aria attributes", () => {
    expect(hostElement.getAttribute("role")).toBe("region");
    expect(hostElement.getAttribute("aria-roledescription")).toBe("carousel");
    expect(hostElement.getAttribute("aria-live")).toBe("off");
  });

  it("should call translationService.track for aria label", () => {
    expect(mockTranslationService.track).toHaveBeenCalledWith("carousel");
  });

  it("should compute correct flex style for slides", () => {
    const flex = component.slideFlex();
    expect(flex).toContain("calc(");
    expect(flex).toContain("100%");
  });

  it("should clamp slideIndex when no slides exist", () => {
    expect(component.slideIndex()).toBe(0);
  });

  it("should compute trackStyle correctly when viewportWidth is 0", () => {
    const style = component.trackStyle();
    expect(style.transform).toBe("translate3d(0,0,0)");
    expect(style.transition).toBe("none");
  });

  it("should not fail if ngOnDestroy called without ResizeObserver", () => {
    expect(() => component.ngOnDestroy()).not.toThrow();
  });

  it("should handle wheel event and update trackIndex", () => {
    Object.defineProperty(component, "slides", {
      configurable: true,
      value: () => [{}, {}, {}],
    });

    const event = new WheelEvent("wheel", { deltaX: 120 });
    const preventDefaultSpy = jest.spyOn(event, "preventDefault");
    component.onWheel(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(component.trackIndex()).not.toBe(0);
  });

  it("should reset animation on transition end for track transform", () => {
    const fakeNative = {};
    Object.defineProperty(component, "track", {
      configurable: true,
      value: () => ({ nativeElement: fakeNative }),
    });

    component.animate.set(true);
    component.trackIndex.set(2);

    const evt = {
      target: fakeNative,
      propertyName: "transform",
    } as TransitionEvent;

    component.onTransitionEnd(evt);
    expect(component.animate()).toBe(false);
  });

  it("should handle onTransitionEnd and reset animation flags", () => {
    const fakeNative = {};
    Object.defineProperty(component, "track", {
      configurable: true,
      value: () => ({ nativeElement: fakeNative }),
    });

    component.animate.set(true);
    component.trackIndex.set(2);

    const event = {
      target: fakeNative,
      propertyName: "transform",
    } as TransitionEvent;

    component.onTransitionEnd(event);
    expect(component.animate()).toBe(false);
  });

  it("should call next and increase trackIndex", () => {
    Object.defineProperty(component, "slides", {
      configurable: true,
      value: () => [{}, {}, {}],
    });

    const initial = component.trackIndex();
    component.next();
    expect(component.trackIndex()).toBeGreaterThan(initial);
  });

  it("should call prev and decrease trackIndex", () => {
    Object.defineProperty(component, "slides", {
      configurable: true,
      value: () => [{}, {}, {}],
    });

    component.trackIndex.set(2);
    component.prev();
    expect(component.trackIndex()).toBeLessThan(2);
  });

  it("should not navigate when locked", () => {
    Object.defineProperty(component, "slides", {
      configurable: true,
      value: () => [{}, {}, {}],
    });

    component.locked = true;
    const before = component.trackIndex();
    component.next();
    expect(component.trackIndex()).toBe(before);
  });

  it("should goToIndex and update trackIndex correctly", () => {
    Object.defineProperty(component, "slides", {
      configurable: true,
      value: () => [{}, {}, {}],
    });

    component.trackIndex.set(0);
    component.goToIndex(2);
    expect(component.trackIndex()).not.toBe(0);
  });

  it("should handle ArrowRight and call next()", () => {
    const spy = jest.spyOn(component, "next");
    const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
    component.onKeyDown(event);
    expect(spy).toHaveBeenCalled();
  });

  it("should handle ArrowLeft and call prev()", () => {
    const spy = jest.spyOn(component, "prev");
    const event = new KeyboardEvent("keydown", { key: "ArrowLeft" });
    component.onKeyDown(event);
    expect(spy).toHaveBeenCalled();
  });

  it("should handle Home key and go to first slide", () => {
    const spy = jest.spyOn(component, "goToIndex");
    const event = new KeyboardEvent("keydown", { key: "Home" });
    component.onKeyDown(event);
    expect(spy).toHaveBeenCalledWith(0);
  });

  it("should handle End key and go to last slide", () => {
    const spy = jest.spyOn(component, "goToIndex");
    Object.defineProperty(component, "slides", {
      configurable: true,
      value: () => [{}, {}, {}],
    });
    const event = new KeyboardEvent("keydown", { key: "End" });
    component.onKeyDown(event);
    expect(spy).toHaveBeenCalledWith(2);
  });

  it("starts dragging on pointerdown and uses setPointerCapture", () => {
    Object.defineProperty(component, "slides", {
      configurable: true,
      value: () => [{}, {}, {}],
    });

    hostElement.setPointerCapture = jest.fn();

    dispatchPointerLike(hostElement, "pointerdown", {
      clientX: 120,
      pointerId: 42,
    });

    expect(hostElement.setPointerCapture).toHaveBeenCalledWith(42);
    expect(component.dragging).toBe(true);
    expect(component.animate()).toBe(false);
  });

  it("should handle pointer up and stop dragging", () => {
    component.dragging = true;
    component.animate.set(false);
    component.trackIndex.set(1.6);
    component.onPointerUp();
    expect(component.dragging).toBe(false);
    expect(component.animate()).toBe(true);
    expect(component.trackIndex()).toBe(Math.round(1.6));
  });

  it("should compute trackStyle correctly with viewportWidth set", () => {
    component.viewportWidth.set(1000);
    component.trackIndex.set(2);
    const style = component.trackStyle();
    expect(style.transform).toContain("translate3d(");
    expect(style.gap).toContain("px");
  });

  it("should compute slideIndex properly when slides exist", () => {
    Object.defineProperty(component, "slides", {
      configurable: true,
      value: () => [{}, {}, {}],
    });

    component.trackIndex.set(5);
    const index = component.slideIndex();
    expect(index).toEqual(2);
  });

  it("should compute renderedActiveIndex properly when slides exist", () => {
    Object.defineProperty(component, "slides", {
      configurable: true,
      value: () => [{}, {}, {}],
    });

    component.trackIndex.set(5);
    const index = component.renderedActiveIndex();
    expect(index).toEqual(8);
  });

  it("should apply fade-right class when fade true and slidesPerView > 1", () => {
    fixture.componentRef.setInput("slidesPerView", { xs: 2 });
    fixture.componentRef.setInput("fade", true);
    fixture.detectChanges();
    expect(component.classes()).toContain("tedi-carousel__content--fade-right");
  });

  it("should apply fade-x class when fade true and slidesPerView <= 1", () => {
    fixture.componentRef.setInput("slidesPerView", { xs: 1 });
    fixture.componentRef.setInput("fade", true);
    fixture.detectChanges();
    expect(component.classes()).toContain("tedi-carousel__content--fade-x");
  });

  describe("breakpoint-specific currentSlidesPerView", () => {
    const slidesPerView: Record<Breakpoint, number> = {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
      xxl: 6,
    };

    it("should return xxl value when above xxl breakpoint", async () => {
      (mockBreakpointService as any).isAboveBreakpoint = (bp: Breakpoint) =>
        signal(
          bp === "xxl" ||
            bp === "xl" ||
            bp === "lg" ||
            bp === "md" ||
            bp === "sm",
        );

      fixture.componentRef.setInput("slidesPerView", slidesPerView);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.currentSlidesPerView()).toBe(6);
    });

    it("should return xl value when above xl but not xxl", async () => {
      (mockBreakpointService as any).isAboveBreakpoint = (bp: Breakpoint) =>
        signal(bp === "xl" || bp === "lg" || bp === "md" || bp === "sm");

      fixture.componentRef.setInput("slidesPerView", slidesPerView);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.currentSlidesPerView()).toBe(5);
    });

    it("should return lg value when above lg but not xl", async () => {
      (mockBreakpointService as any).isAboveBreakpoint = (bp: Breakpoint) =>
        signal(bp === "lg" || bp === "md" || bp === "sm");

      fixture.componentRef.setInput("slidesPerView", slidesPerView);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.currentSlidesPerView()).toBe(4);
    });

    it("should return md value when above md but not lg", async () => {
      (mockBreakpointService as any).isAboveBreakpoint = (bp: Breakpoint) =>
        signal(bp === "md" || bp === "sm");

      fixture.componentRef.setInput("slidesPerView", slidesPerView);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.currentSlidesPerView()).toBe(3);
    });

    it("should return sm value when above sm but not md", async () => {
      (mockBreakpointService as any).isAboveBreakpoint = (bp: Breakpoint) =>
        signal(bp === "sm");

      fixture.componentRef.setInput("slidesPerView", slidesPerView);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.currentSlidesPerView()).toBe(2);
    });

    it("should return xs value when below sm", async () => {
      (mockBreakpointService as any).isAboveBreakpoint = () => signal(false);

      fixture.componentRef.setInput("slidesPerView", slidesPerView);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.currentSlidesPerView()).toBe(1);
    });
  });

  describe("breakpoint-specific currentGap", () => {
    const gaps: Record<Breakpoint, number> = {
      xs: 2,
      sm: 4,
      md: 6,
      lg: 8,
      xl: 10,
      xxl: 12,
    };

    it("should return xxl gap when above xxl breakpoint", async () => {
      (mockBreakpointService as any).isAboveBreakpoint = (bp: Breakpoint) =>
        signal(
          bp === "xxl" ||
            bp === "xl" ||
            bp === "lg" ||
            bp === "md" ||
            bp === "sm",
        );

      fixture.componentRef.setInput("gap", gaps);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.currentGap()).toBe(12);
    });

    it("should return xl gap when above xl but not xxl", async () => {
      (mockBreakpointService as any).isAboveBreakpoint = (bp: Breakpoint) =>
        signal(bp === "xl" || bp === "lg" || bp === "md" || bp === "sm");

      fixture.componentRef.setInput("gap", gaps);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.currentGap()).toBe(10);
    });

    it("should return lg gap when above lg but not xl", async () => {
      (mockBreakpointService as any).isAboveBreakpoint = (bp: Breakpoint) =>
        signal(bp === "lg" || bp === "md" || bp === "sm");

      fixture.componentRef.setInput("gap", gaps);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.currentGap()).toBe(8);
    });

    it("should return md gap when above md but not lg", async () => {
      (mockBreakpointService as any).isAboveBreakpoint = (bp: Breakpoint) =>
        signal(bp === "md" || bp === "sm");

      fixture.componentRef.setInput("gap", gaps);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.currentGap()).toBe(6);
    });

    it("should return sm gap when above sm but not md", async () => {
      (mockBreakpointService as any).isAboveBreakpoint = (bp: Breakpoint) =>
        signal(bp === "sm");

      fixture.componentRef.setInput("gap", gaps);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.currentGap()).toBe(4);
    });

    it("should return xs gap when below sm", async () => {
      (mockBreakpointService as any).isAboveBreakpoint = () => signal(false);

      fixture.componentRef.setInput("gap", gaps);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.currentGap()).toBe(2);
    });
  });

  it("should unlock navigation after transition timeout", () => {
    jest.useFakeTimers();
    component.locked = false;
    component.lockNavigation();
    expect(component.locked).toBe(true);
    jest.advanceTimersByTime(component.transitionMs());
    expect(component.locked).toBe(false);
    jest.useRealTimers();
  });

  it("should handle wheel deltaY when shiftKey is pressed", () => {
    Object.defineProperty(component, "slides", {
      configurable: true,
      value: () => [{}, {}, {}],
    });
    component.viewportWidth.set(1000);
    const event = new WheelEvent("wheel", { deltaY: 200, shiftKey: true });
    const preventDefaultSpy = jest.spyOn(event, "preventDefault");
    component.onWheel(event);
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(component.trackIndex()).not.toBe(0);
  });

  describe("announceSlideChange", () => {
    it("should call announceSlideChange when next() is called", () => {
      const spy = jest.spyOn(component, "announceSlideChange");

      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}],
      });

      component.next();
      expect(spy).toHaveBeenCalled();
    });

    it("should call announceSlideChange when prev() is called", () => {
      const spy = jest.spyOn(component, "announceSlideChange");

      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}],
      });

      component.trackIndex.set(2);
      component.prev();
      expect(spy).toHaveBeenCalled();
    });

    it("should call announceSlideChange when goToIndex() is called", () => {
      const spy = jest.spyOn(component, "announceSlideChange");

      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}],
      });

      component.goToIndex(2);
      expect(spy).toHaveBeenCalled();
    });

    it("should call announceSlideChange on keyboard navigation", () => {
      const spy = jest.spyOn(component, "announceSlideChange");

      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}],
      });

      const event = new KeyboardEvent("keydown", { key: "ArrowRight" });
      component.onKeyDown(event);
      expect(spy).toHaveBeenCalled();
    });
  });

  describe("isSlideVisible", () => {
    it("should return true for slides within the visible range", () => {
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}, {}, {}],
      });
      fixture.componentRef.setInput("slidesPerView", { xs: 3 });
      fixture.detectChanges();

      const activeIndex = component.renderedActiveIndex();

      // Slides at activeIndex, activeIndex+1, activeIndex+2 should be visible
      expect(component.isSlideVisible(activeIndex)).toBe(true);
      expect(component.isSlideVisible(activeIndex + 1)).toBe(true);
      expect(component.isSlideVisible(activeIndex + 2)).toBe(true);

      // Slide before activeIndex should not be visible
      expect(component.isSlideVisible(activeIndex - 1)).toBe(false);

      // Slide after the visible range should not be visible
      expect(component.isSlideVisible(activeIndex + 3)).toBe(false);
    });

    it("should handle fractional slidesPerView by rounding up", () => {
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}, {}, {}],
      });
      fixture.componentRef.setInput("slidesPerView", { xs: 2.5 });
      fixture.detectChanges();

      const activeIndex = component.renderedActiveIndex();

      // With 2.5 slides per view, Math.ceil(2.5) = 3 slides should be visible
      expect(component.isSlideVisible(activeIndex)).toBe(true);
      expect(component.isSlideVisible(activeIndex + 1)).toBe(true);
      expect(component.isSlideVisible(activeIndex + 2)).toBe(true);
      expect(component.isSlideVisible(activeIndex + 3)).toBe(false);
    });

    it("should work correctly with single slide per view", () => {
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}],
      });
      fixture.componentRef.setInput("slidesPerView", { xs: 1 });
      fixture.detectChanges();

      const activeIndex = component.renderedActiveIndex();

      expect(component.isSlideVisible(activeIndex)).toBe(true);
      expect(component.isSlideVisible(activeIndex + 1)).toBe(false);
      expect(component.isSlideVisible(activeIndex - 1)).toBe(false);
    });
  });

  describe("onScroll", () => {
    it("should reset scroll position to 0", () => {
      hostElement.scrollLeft = 100;
      hostElement.scrollTop = 50;

      component.onScroll();

      expect(hostElement.scrollLeft).toBe(0);
      expect(hostElement.scrollTop).toBe(0);
    });
  });

  describe("focusActiveSlide", () => {
    it("should focus the slide element at renderedActiveIndex", () => {
      jest.useFakeTimers();

      const mockSlideElement = {
        nativeElement: { focus: jest.fn() },
      };

      Object.defineProperty(component, "slideElements", {
        configurable: true,
        value: () => [mockSlideElement, mockSlideElement, mockSlideElement],
      });

      Object.defineProperty(component, "renderedActiveIndex", {
        configurable: true,
        value: () => 1,
      });

      component.focusActiveSlide();
      jest.runAllTimers();

      expect(mockSlideElement.nativeElement.focus).toHaveBeenCalledWith({
        preventScroll: true,
      });

      jest.useRealTimers();
    });

    it("should not throw if slide element does not exist", () => {
      jest.useFakeTimers();

      Object.defineProperty(component, "slideElements", {
        configurable: true,
        value: () => [],
      });

      Object.defineProperty(component, "renderedActiveIndex", {
        configurable: true,
        value: () => 5,
      });

      expect(() => {
        component.focusActiveSlide();
        jest.runAllTimers();
      }).not.toThrow();

      jest.useRealTimers();
    });
  });

  describe("goToIndex with focusSlide option", () => {
    it("should set pendingFocus when focusSlide is true", () => {
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}],
      });

      component.goToIndex(1, { focusSlide: true });

      expect(component["pendingFocus"]).toBe(true);
    });

    it("should not set pendingFocus when focusSlide is false or undefined", () => {
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}],
      });

      component.goToIndex(1);

      expect(component["pendingFocus"]).toBe(false);
    });
  });

  describe("onTransitionEnd with pendingFocus", () => {
    it("should call focusActiveSlide when pendingFocus is true", () => {
      const focusSpy = jest.spyOn(component, "focusActiveSlide");
      const fakeNative = {};

      Object.defineProperty(component, "track", {
        configurable: true,
        value: () => ({ nativeElement: fakeNative }),
      });

      component["pendingFocus"] = true;
      component.animate.set(true);

      const evt = {
        target: fakeNative,
        propertyName: "transform",
      } as TransitionEvent;

      component.onTransitionEnd(evt);

      expect(focusSpy).toHaveBeenCalled();
      expect(component["pendingFocus"]).toBe(false);
    });

    it("should not call focusActiveSlide when pendingFocus is false", () => {
      const focusSpy = jest.spyOn(component, "focusActiveSlide");
      const fakeNative = {};

      Object.defineProperty(component, "track", {
        configurable: true,
        value: () => ({ nativeElement: fakeNative }),
      });

      component["pendingFocus"] = false;
      component.animate.set(true);

      const evt = {
        target: fakeNative,
        propertyName: "transform",
      } as TransitionEvent;

      component.onTransitionEnd(evt);

      expect(focusSpy).not.toHaveBeenCalled();
    });
  });

  describe("announceSlideChange", () => {
    it("should call liveAnnouncer.announce with translated message", () => {
      jest.useFakeTimers();

      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}],
      });

      component.trackIndex.set(1);
      component.announceSlideChange();
      jest.runAllTimers();

      expect(mockLiveAnnouncer.announce).toHaveBeenCalledWith(
        "carousel.slide",
        "polite",
      );

      jest.useRealTimers();
    });
  });

  describe("renderedIndices", () => {
    it("should return empty array when no slides", () => {
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [],
      });

      expect(component.renderedIndices()).toEqual([]);
    });
  });

  describe("pointer events", () => {
    it("should update trackIndex on pointermove when dragging", () => {
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}],
      });

      component.viewportWidth.set(1000);
      component.dragging = true;
      component["startX"] = 500;
      component["startIndex"] = 0;

      const event = { clientX: 400 } as PointerEvent;
      component.onPointerMove(event);

      expect(component.trackIndex()).not.toBe(0);
    });

    it("should not update trackIndex on pointermove when not dragging", () => {
      component.dragging = false;
      const initialIndex = component.trackIndex();

      const event = { clientX: 400 } as PointerEvent;
      component.onPointerMove(event);

      expect(component.trackIndex()).toBe(initialIndex);
    });
  });

  describe("wheel event edge cases", () => {
    it("should not handle wheel when no slides", () => {
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [],
      });

      const event = new WheelEvent("wheel", { deltaX: 100 });
      const preventDefaultSpy = jest.spyOn(event, "preventDefault");

      component.onWheel(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });

    it("should not handle wheel when delta is 0", () => {
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}],
      });

      const event = new WheelEvent("wheel", { deltaX: 0, deltaY: 0 });
      const preventDefaultSpy = jest.spyOn(event, "preventDefault");

      component.onWheel(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe("keyboard navigation edge cases", () => {
    it("should handle PageDown same as ArrowRight", () => {
      const spy = jest.spyOn(component, "next");
      const event = new KeyboardEvent("keydown", { key: "PageDown" });
      component.onKeyDown(event);
      expect(spy).toHaveBeenCalled();
    });

    it("should handle PageUp same as ArrowLeft", () => {
      const spy = jest.spyOn(component, "prev");
      const event = new KeyboardEvent("keydown", { key: "PageUp" });
      component.onKeyDown(event);
      expect(spy).toHaveBeenCalled();
    });

    it("should not handle unrecognized keys", () => {
      const nextSpy = jest.spyOn(component, "next");
      const prevSpy = jest.spyOn(component, "prev");
      const goToIndexSpy = jest.spyOn(component, "goToIndex");

      const event = new KeyboardEvent("keydown", { key: "Enter" });
      component.onKeyDown(event);

      expect(nextSpy).not.toHaveBeenCalled();
      expect(prevSpy).not.toHaveBeenCalled();
      expect(goToIndexSpy).not.toHaveBeenCalled();
    });
  });

  describe("wheel timeout and snap behavior", () => {
    it("should snap to nearest slide after wheel timeout", () => {
      jest.useFakeTimers();

      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}, {}, {}],
      });

      component.viewportWidth.set(1000);

      const event = new WheelEvent("wheel", { deltaX: 50 });
      component.onWheel(event);

      jest.advanceTimersByTime(120);

      expect(component.animate()).toBe(true);
      expect(Number.isInteger(component.trackIndex())).toBe(true);

      jest.useRealTimers();
    });

    it("should snap in scroll direction when scrollDelta > 0.3", () => {
      jest.useFakeTimers();

      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}, {}, {}],
      });

      component.viewportWidth.set(1000);
      component.trackIndex.set(0);

      // Large positive delta should snap forward
      const event = new WheelEvent("wheel", { deltaX: 500 });
      component.onWheel(event);

      jest.advanceTimersByTime(120);

      expect(component.trackIndex()).toBeGreaterThanOrEqual(1);

      jest.useRealTimers();
    });

    it("should handle clamped wheel at min boundary", () => {
      jest.useFakeTimers();

      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}],
      });

      component.viewportWidth.set(1000);
      component.trackIndex.set(0);

      // Large negative delta should be clamped
      const event = new WheelEvent("wheel", { deltaX: -5000 });
      component.onWheel(event);

      jest.advanceTimersByTime(120);

      // Should snap to valid index
      expect(Number.isInteger(component.trackIndex())).toBe(true);

      jest.useRealTimers();
    });

    it("should handle clamped wheel at max boundary", () => {
      jest.useFakeTimers();

      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}],
      });

      component.viewportWidth.set(1000);
      component.trackIndex.set(0);

      // Large positive delta should be clamped
      const event = new WheelEvent("wheel", { deltaX: 5000 });
      component.onWheel(event);

      jest.advanceTimersByTime(120);

      // Should snap to valid index
      expect(Number.isInteger(component.trackIndex())).toBe(true);

      jest.useRealTimers();
    });
  });

  describe("onTransitionEnd edge cases", () => {
    it("should ignore transition events from other elements", () => {
      const fakeNative = {};
      const otherElement = {};

      Object.defineProperty(component, "track", {
        configurable: true,
        value: () => ({ nativeElement: fakeNative }),
      });

      component.animate.set(true);

      const evt = {
        target: otherElement,
        propertyName: "transform",
      } as TransitionEvent;

      component.onTransitionEnd(evt);

      // animate should not change because event target doesn't match
      expect(component.animate()).toBe(true);
    });

    it("should ignore transition events for non-transform properties", () => {
      const fakeNative = {};

      Object.defineProperty(component, "track", {
        configurable: true,
        value: () => ({ nativeElement: fakeNative }),
      });

      component.animate.set(true);

      const evt = {
        target: fakeNative,
        propertyName: "opacity",
      } as TransitionEvent;

      component.onTransitionEnd(evt);

      // animate should not change because propertyName is not transform
      expect(component.animate()).toBe(true);
    });

    it("should ignore transition events while dragging", () => {
      const fakeNative = {};

      Object.defineProperty(component, "track", {
        configurable: true,
        value: () => ({ nativeElement: fakeNative }),
      });

      component.animate.set(true);
      component.dragging = true;

      const evt = {
        target: fakeNative,
        propertyName: "transform",
      } as TransitionEvent;

      component.onTransitionEnd(evt);

      // animate should not change because dragging is true
      expect(component.animate()).toBe(true);
    });
  });

  describe("navigation when no slides", () => {
    it("should not navigate next when no slides", () => {
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [],
      });

      const initialIndex = component.trackIndex();
      component.next();
      expect(component.trackIndex()).toBe(initialIndex);
    });

    it("should not navigate prev when no slides", () => {
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [],
      });

      const initialIndex = component.trackIndex();
      component.prev();
      expect(component.trackIndex()).toBe(initialIndex);
    });

    it("should not goToIndex when no slides", () => {
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [],
      });

      const initialIndex = component.trackIndex();
      component.goToIndex(2);
      expect(component.trackIndex()).toBe(initialIndex);
    });

    it("should not goToIndex when locked", () => {
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}],
      });

      component.locked = true;
      const initialIndex = component.trackIndex();
      component.goToIndex(2);
      expect(component.trackIndex()).toBe(initialIndex);
    });
  });

  describe("pointerdown when no slides", () => {
    it("should not start dragging when no slides", () => {
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [],
      });

      hostElement.setPointerCapture = jest.fn();

      dispatchPointerLike(hostElement, "pointerdown", {
        clientX: 120,
        pointerId: 42,
      });

      expect(component.dragging).toBe(false);
    });
  });

  describe("onPointerUp when not dragging", () => {
    it("should do nothing when not dragging", () => {
      component.dragging = false;
      component.animate.set(false);
      const initialAnimate = component.animate();

      component.onPointerUp();

      expect(component.animate()).toBe(initialAnimate);
    });
  });
});

@Component({
  standalone: true,
  imports: [CarouselIndicatorsComponent],
  template: `
    <tedi-carousel-indicators
      [withArrows]="withArrows"
      [variant]="variant"
    ></tedi-carousel-indicators>
  `,
})
class TestIndicatorsHostComponent {
  withArrows = false;
  variant: "dots" | "numbers" = "dots";
}

describe("CarouselIndicatorsComponent", () => {
  let fixture: ComponentFixture<TestIndicatorsHostComponent>;
  let component: CarouselIndicatorsComponent;

  let mockCarouselContent: any;
  let mockCarousel: any;
  let mockTranslationService: { track: jest.Mock };

  beforeEach(async () => {
    mockCarouselContent = {
      slides: jest.fn().mockReturnValue([{}, {}, {}]),
      slideIndex: jest.fn().mockReturnValue(1),
      next: jest.fn(),
      prev: jest.fn(),
      goToIndex: jest.fn(),
    };

    mockCarousel = {
      carouselContent: jest.fn().mockReturnValue(mockCarouselContent),
    };

    mockTranslationService = {
      track: jest.fn((key: string) => () => key),
    };

    await TestBed.configureTestingModule({
      imports: [TestIndicatorsHostComponent],
      providers: [
        { provide: CarouselComponent, useValue: mockCarousel },
        { provide: TediTranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestIndicatorsHostComponent);
    fixture.detectChanges();

    const indicatorsDebug = fixture.debugElement.query(
      By.directive(CarouselIndicatorsComponent),
    );
    component = indicatorsDebug.componentInstance;
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should inject CarouselComponent and TranslationService", () => {
    expect(component.carousel).toBe(mockCarousel);
    expect(component.translationService).toBe(mockTranslationService);
  });

  it("should have default input values", () => {
    expect(component.withArrows()).toBe(false);
    expect(component.variant()).toBe("dots");
  });

  it("should compute correct indicatorsArray", () => {
    const arr = component.indicatorsArray();
    expect(arr.length).toBe(3);
    expect(arr[1].active).toBe(true);
  });

  it("should compute correct activeSlideNumber", () => {
    expect(component.activeSlideNumber()).toBe(2);
  });

  it("should call carouselContent.next() when handleNext() is triggered", () => {
    component.handleNext();
    expect(mockCarouselContent.next).toHaveBeenCalled();
  });

  it("should call carouselContent.prev() when handlePrev() is triggered", () => {
    component.handlePrev();
    expect(mockCarouselContent.prev).toHaveBeenCalled();
  });

  it("should call carouselContent.goToIndex() with focusSlide when handleIndicatorClick() is triggered", () => {
    component.handleIndicatorClick(2);
    expect(mockCarouselContent.goToIndex).toHaveBeenCalledWith(2, {
      focusSlide: true,
    });
  });
});

@Component({
  standalone: true,
  imports: [CarouselNavigationComponent],
  template: ` <tedi-carousel-navigation></tedi-carousel-navigation> `,
})
class TestNavigationHostComponent {}

describe("CarouselNavigationComponent", () => {
  let fixture: ComponentFixture<TestNavigationHostComponent>;
  let component: CarouselNavigationComponent;

  let mockCarouselContent: any;
  let mockCarousel: any;
  let mockTranslationService: { track: jest.Mock };

  beforeEach(async () => {
    mockCarouselContent = {
      next: jest.fn(),
      prev: jest.fn(),
    };

    mockCarousel = {
      carouselContent: jest.fn().mockReturnValue(mockCarouselContent),
    };

    mockTranslationService = {
      track: jest.fn((key: string) => () => key),
    };

    await TestBed.configureTestingModule({
      imports: [TestNavigationHostComponent],
      providers: [
        { provide: CarouselComponent, useValue: mockCarousel },
        { provide: TediTranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestNavigationHostComponent);
    fixture.detectChanges();

    const navDebug = fixture.debugElement.query(
      By.directive(CarouselNavigationComponent),
    );
    component = navDebug.componentInstance;
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should inject CarouselComponent and TranslationService", () => {
    expect(component["carousel"]).toBe(mockCarousel);
    expect(component.translationService).toBe(mockTranslationService);
  });

  it("should call carouselContent.next() when handleNext() is called", () => {
    component.handleNext();
    expect(mockCarouselContent.next).toHaveBeenCalledTimes(1);
  });

  it("should call carouselContent.prev() when handlePrev() is called", () => {
    component.handlePrev();
    expect(mockCarouselContent.prev).toHaveBeenCalledTimes(1);
  });
});
