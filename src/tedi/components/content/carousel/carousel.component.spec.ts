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

/**
 * Simulates a released drag: the track moved from `from` to `to` (in slides), the pointer
 * moved `dx` px (negative is towards the next slide) over `ms` milliseconds, and was
 * released at `releasedAt` ms (defaults to right after the last move).
 */
function releaseDrag(
  component: CarouselContentComponent,
  {
    from,
    to,
    dx,
    ms,
    releasedAt,
  }: { from: number; to: number; dx: number; ms: number; releasedAt?: number },
) {
  const drag = component as unknown as Record<string, unknown>;
  component.dragging = true;
  drag["startIndex"] = from;
  drag["startX"] = 500;
  drag["lastX"] = 500 + dx;
  drag["lastTime"] = ms;
  drag["samples"] = [
    { x: 500, t: 0 },
    { x: 500 + dx, t: ms },
  ];
  component.trackIndex.set(to);
  component.onPointerUp({ timeStamp: releasedAt ?? ms } as PointerEvent);
}

/**
 * Drives the real pointer handlers: presses at the first `[x, timeStamp]` point, moves
 * through the rest, then ends with `end` at `endAt` ms (a `pointerup` at `endX`, which
 * defaults to the last point).
 */
function gesture(
  component: CarouselContentComponent,
  points: [number, number][],
  end: "pointerup" | "pointercancel" | "lostpointercapture",
  endAt: number,
  endX = points[points.length - 1][0],
) {
  const [[x0, t0], ...moves] = points;
  component.onPointerDown({
    clientX: x0,
    pointerId: 1,
    timeStamp: t0,
  } as PointerEvent);
  for (const [x, t] of moves) {
    component.onPointerMove({ clientX: x, timeStamp: t } as PointerEvent);
  }
  if (end === "pointerup") {
    component.onPointerUp({ clientX: endX, timeStamp: endAt } as PointerEvent);
  } else {
    component.onPointerCancel();
  }
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

  it("should use the custom aria-label when provided", () => {
    fixture.componentRef.setInput("ariaLabel", "Minu karussell");
    fixture.detectChanges();

    expect(hostElement.getAttribute("aria-label")).toBe("Minu karussell");
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

  it("uses the fractional observed width so the track does not drift by sub-pixels", () => {
    const ro = component["ro"] as unknown as {
      callback: ResizeObserverCallback;
    };

    ro.callback(
      [{ contentRect: { width: 1422.39 } } as ResizeObserverEntry],
      ro as unknown as ResizeObserver,
    );

    expect(component.viewportWidth()).toBe(1422.39);
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
    component.animate.set(false);
    releaseDrag(component, { from: 0, to: 1.6, dx: -600, ms: 2000 });
    expect(component.dragging).toBe(false);
    expect(component.animate()).toBe(true);
    expect(component.trackIndex()).toBe(2);
  });

  describe("swipe release", () => {
    beforeEach(() => {
      component.viewportWidth.set(1000);
    });

    it("defaults the threshold to 0.3 of a slide", () => {
      expect(component.swipeThreshold()).toBe(0.3);
    });

    it.each([
      ["forwards past the threshold", 1, 1.35, -350, 2],
      ["forwards short of the threshold", 1, 1.25, -250, 1],
      ["backwards past the threshold", 1, 0.65, 350, 0],
      ["backwards short of the threshold", 1, 0.75, 250, 1],
    ])("moves on a slow drag %s", (_, from, to, dx, expected) => {
      releaseDrag(component, { from, to, dx, ms: 2000 });

      expect(component.trackIndex()).toBe(expected);
    });

    it("counts each whole slide dragged, plus the remainder past the threshold", () => {
      releaseDrag(component, { from: 0, to: 1.2, dx: -1200, ms: 3000 });
      expect(component.trackIndex()).toBe(1);

      releaseDrag(component, { from: 0, to: 1.4, dx: -1400, ms: 3000 });
      expect(component.trackIndex()).toBe(2);
    });

    it("moves one slide on a quick flick, however short", () => {
      // 40px in 20ms is ~2 slides per second.
      releaseDrag(component, { from: 1, to: 1.04, dx: -40, ms: 20 });
      expect(component.trackIndex()).toBe(2);

      releaseDrag(component, { from: 1, to: 0.96, dx: 40, ms: 20 });
      expect(component.trackIndex()).toBe(0);
    });

    it("does not treat a slow short drag as a flick", () => {
      releaseDrag(component, { from: 1, to: 1.04, dx: -40, ms: 400 });

      expect(component.trackIndex()).toBe(1);
    });

    it("does not treat a drag without a measurable duration as a flick", () => {
      releaseDrag(component, { from: 1, to: 1.04, dx: -40, ms: 0 });

      expect(component.trackIndex()).toBe(1);
    });

    it("does not count a quick move followed by a hold as a flick", () => {
      releaseDrag(component, {
        from: 1,
        to: 1.04,
        dx: -40,
        ms: 20,
        releasedAt: 1000,
      });

      expect(component.trackIndex()).toBe(1);
    });

    it("does not add a step for an exact whole-slide drag at threshold 0", () => {
      fixture.componentRef.setInput("swipeThreshold", 0);
      fixture.detectChanges();
      // One slide is 1000px plus the 16px gap.
      releaseDrag(component, { from: 0, to: 1, dx: -1016, ms: 2000 });

      expect(component.trackIndex()).toBe(1);
    });

    describe("with the real pointer handlers", () => {
      beforeEach(() => {
        Object.defineProperty(component, "slides", {
          configurable: true,
          value: () => Array.from({ length: 5 }, () => ({})),
        });
        hostElement.setPointerCapture = jest.fn();
      });

      // 80px in 40ms is ~2 slides per second; a slide is 1016px here.
      const quickSwipe: [number, number][] = [
        [500, 0],
        [460, 20],
        [420, 40],
      ];

      it("moves on a quick swipe released normally", () => {
        gesture(component, quickSwipe, "pointerup", 41);

        expect(component.trackIndex()).toBe(1);
      });

      it.each(["pointercancel", "lostpointercapture"] as const)(
        "returns to the start when the drag ends with %s",
        (end) => {
          // The browser took over, e.g. to scroll the page; not a swipe.
          gesture(component, quickSwipe, end, 41);

          expect(component.dragging).toBe(false);
          expect(component.trackIndex()).toBe(0);
        },
      );

      it("keeps a released swipe when lostpointercapture follows pointerup", () => {
        gesture(component, quickSwipe, "pointerup", 41);
        component.onPointerCancel();

        expect(component.trackIndex()).toBe(1);
      });

      it("detects a quick swipe after holding the pointer down", () => {
        gesture(
          component,
          [
            [500, 0],
            [500, 600],
            [460, 620],
            [420, 640],
          ],
          "pointerup",
          641,
        );

        expect(component.trackIndex()).toBe(1);
      });

      it("counts movement that only the release event reports", () => {
        // After a hold, one move is seen; the pointer moves 40px more before release
        // without another pointermove.
        gesture(
          component,
          [
            [500, 0],
            [460, 620],
          ],
          "pointerup",
          640,
          420,
        );

        expect(component.trackIndex()).toBe(1);
      });

      it("ignores a quick jitter at the end of a slow drag", () => {
        gesture(
          component,
          [
            [500, 0],
            [400, 1000],
            [300, 2000],
            [297, 2005],
          ],
          "pointerup",
          2006,
        );

        expect(component.trackIndex()).toBe(0);
      });

      it("does not flick when the quick movement reverses the drag", () => {
        gesture(
          component,
          [
            [500, 0],
            [300, 1500],
            [340, 1530],
            [380, 1560],
          ],
          "pointerup",
          1561,
        );

        expect(component.trackIndex()).toBe(0);
      });
    });

    it("ignores taps and jitter under 10px, even when quick", () => {
      releaseDrag(component, { from: 1, to: 1.009, dx: -9, ms: 5 });

      expect(component.trackIndex()).toBe(1);
    });

    it("uses a custom threshold", () => {
      fixture.componentRef.setInput("swipeThreshold", 0.1);
      fixture.detectChanges();

      releaseDrag(component, { from: 1, to: 1.15, dx: -150, ms: 2000 });

      expect(component.trackIndex()).toBe(2);
    });

    it.each([
      [2, 1],
      [-1, 0],
      ["0.5", 0.5],
    ])("keeps the threshold between 0 and 1 (%s → %s)", (value, expected) => {
      fixture.componentRef.setInput("swipeThreshold", value);
      fixture.detectChanges();

      expect(component.swipeThreshold()).toBe(expected);
    });
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

  describe("when looping with slides", () => {
    beforeEach(() => {
      // Fresh fixture so the slide stub is in place before the first render.
      fixture = TestBed.createComponent(CarouselContentComponent);
      component = fixture.componentInstance;
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => [{}, {}, {}],
      });
      fixture.detectChanges();
    });

    it("renders a duplicate buffer of slides on both sides of the view", () => {
      // 3 slides before, 1 in view, 3 after.
      expect(component.renderedIndices()).toEqual([0, 1, 2, 0, 1, 2, 0]);
    });

    it("uses the wrapped slide index as the active position", () => {
      component.trackIndex.set(4);

      expect(component.activePosition()).toBe(1);
      expect(component.positionCount()).toBe(3);
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

  describe("loop", () => {
    const withSlides = (count: number) =>
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => Array.from({ length: count }, () => ({})),
      });

    it("loops by default, so both directions are always available", () => {
      withSlides(5);

      expect(component.loop()).toBe(true);
      expect(component.canPrev()).toBe(true);
      expect(component.canNext()).toBe(true);
    });

    describe("when false", () => {
      beforeEach(() => {
        // Fresh fixture so the slide stub is in place before the first render.
        fixture = TestBed.createComponent(CarouselContentComponent);
        component = fixture.componentInstance;
        withSlides(5);
        fixture.componentRef.setInput("slidesPerView", { xs: 3 });
        fixture.componentRef.setInput("loop", false);
        fixture.detectChanges();
      });

      it("stops at the last position where the final slide is fully in view", () => {
        expect(component.maxIndex()).toBe(2);
      });

      it("disables prev at the start and next at the end", () => {
        expect(component.canPrev()).toBe(false);
        expect(component.canNext()).toBe(true);

        component.trackIndex.set(2);

        expect(component.canPrev()).toBe(true);
        expect(component.canNext()).toBe(false);
      });

      it("does not move past either bound with next() / prev()", () => {
        component.prev();
        expect(component.trackIndex()).toBe(0);

        component.trackIndex.set(2);
        component.next();
        expect(component.trackIndex()).toBe(2);
      });

      it("steps one slide at a time within the bounds", () => {
        component.next();
        expect(component.trackIndex()).toBe(1);
      });

      it("renders each slide exactly once, without loop duplicates", () => {
        expect(component.renderedIndices()).toEqual([0, 1, 2, 3, 4]);
      });

      it("uses the track index as the rendered active index", () => {
        component.trackIndex.set(2);
        expect(component.renderedActiveIndex()).toBe(2);
        expect(component.slideIndex()).toBe(2);
      });

      it("clamps goToIndex to the last reachable position", () => {
        component.goToIndex(4);
        expect(component.trackIndex()).toBe(2);
      });

      it("clamps dragging to the bounds", () => {
        component.viewportWidth.set(1000);
        component.dragging = true;
        component["startX"] = 500;
        component["startIndex"] = 0;

        component.onPointerMove({ clientX: 900 } as PointerEvent);

        expect(component.trackIndex()).toBe(0);

        component.onPointerMove({ clientX: -5000 } as PointerEvent);

        expect(component.trackIndex()).toBe(2);
      });

      it("has one stop position per reachable index", () => {
        expect(component.positionCount()).toBe(3);

        component.trackIndex.set(2);

        expect(component.activePosition()).toBe(2);
      });

      it("clamps wheel scrolling to the bounds", () => {
        component.viewportWidth.set(1000);
        component.onWheel(new WheelEvent("wheel", { deltaX: -2000 }));

        expect(component.trackIndex()).toBe(0);

        component.onWheel(new WheelEvent("wheel", { deltaX: 10000 }));

        expect(component.trackIndex()).toBe(2);
      });
    });
  });

  describe("loop false with fractional slidesPerView", () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(CarouselContentComponent);
      component = fixture.componentInstance;
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => Array.from({ length: 5 }, () => ({})),
      });
      fixture.componentRef.setInput("slidesPerView", { xs: 2.5 });
      fixture.componentRef.setInput("loop", false);
      fixture.detectChanges();
    });

    it("ends where the last slide is fully in view", () => {
      expect(component.maxIndex()).toBe(2.5);
      expect(component.positionCount()).toBe(4);
    });

    it("takes a partial final step and then stops", () => {
      const steps: number[] = [];
      for (let i = 0; i < 4; i++) {
        component.locked = false;
        component.next();
        steps.push(component.trackIndex());
      }

      expect(steps).toEqual([1, 2, 2.5, 2.5]);
      expect(component.canNext()).toBe(false);
      expect(component.activePosition()).toBe(3);
      expect(component.slideIndex()).toBe(3);
    });

    it("steps back from the fractional end onto whole positions", () => {
      component.trackIndex.set(2.5);
      component.prev();

      expect(component.trackIndex()).toBe(2);
    });

    it("goes to the fractional end for the last position and the End key", () => {
      component.goToIndex(3);
      expect(component.trackIndex()).toBe(2.5);

      component.trackIndex.set(0);
      component.onKeyDown(new KeyboardEvent("keydown", { key: "End" }));
      expect(component.trackIndex()).toBe(2.5);
    });

    // The final gap, 2 → 2.5, is half a slide, so 0.3 of it is 0.15.
    it.each([
      [2, 2.1, -50, 2],
      [2, 2.2, -100, 2.5],
      [2.5, 2.4, 50, 2.5],
      [2.5, 2.3, 100, 2],
      [0, 0.2, -100, 0],
      [0, 0.6, -300, 1],
    ])(
      "settles a slow drag from %s released at %s on a stop position",
      (from, to, dx, expected) => {
        releaseDrag(component, { from, to, dx, ms: 2000 });

        expect(component.trackIndex()).toBe(expected);
      },
    );

    it("does not step past the end on a long drag", () => {
      releaseDrag(component, { from: 2, to: 2.5, dx: -1500, ms: 2000 });

      expect(component.trackIndex()).toBe(2.5);
    });

    it("stays at the fractional end when wheel scrolling past it", () => {
      jest.useFakeTimers();
      component.viewportWidth.set(1000);
      component.trackIndex.set(2);
      component.onWheel(new WheelEvent("wheel", { deltaX: 10000 }));
      jest.advanceTimersByTime(200);

      expect(component.trackIndex()).toBe(2.5);
      jest.useRealTimers();
    });
  });

  describe("loop false with a small final step", () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(CarouselContentComponent);
      component = fixture.componentInstance;
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => Array.from({ length: 5 }, () => ({})),
      });
      fixture.componentRef.setInput("slidesPerView", { xs: 2.9 });
      fixture.componentRef.setInput("loop", false);
      fixture.detectChanges();
    });

    it("marks the last position active at the fractional end", () => {
      component.goToIndex(3);

      expect(component.trackIndex()).toBeCloseTo(2.1);
      expect(component.positionCount()).toBe(4);
      expect(component.activePosition()).toBe(3);
    });

    it("reaches and leaves the short final step with a slow swipe", () => {
      component.viewportWidth.set(1000);

      // Only 0.1 of a slide separates 2 and the end at 2.1.
      releaseDrag(component, { from: 2, to: 2.1, dx: -60, ms: 2000 });
      expect(component.trackIndex()).toBeCloseTo(2.1);

      releaseDrag(component, { from: 2.1, to: 2, dx: 60, ms: 2000 });
      expect(component.trackIndex()).toBe(2);
    });

    it("stays at the end on a quick swipe towards it", () => {
      component.viewportWidth.set(1000);
      component.trackIndex.set(2.1);

      // The track is already clamped, so only the pointer shows the direction.
      releaseDrag(component, { from: 2.1, to: 2.1, dx: -40, ms: 20 });

      expect(component.trackIndex()).toBeCloseTo(2.1);
    });

    it("keeps the whole position active until the end is nearer", () => {
      component.trackIndex.set(2.04);
      expect(component.activePosition()).toBe(2);

      component.trackIndex.set(2.06);
      expect(component.activePosition()).toBe(3);
    });
  });

  describe("loop false when the bound shrinks", () => {
    const slideCount = signal(5);

    beforeEach(() => {
      slideCount.set(5);
      fixture = TestBed.createComponent(CarouselContentComponent);
      component = fixture.componentInstance;
      Object.defineProperty(component, "slides", {
        configurable: true,
        value: () => Array.from({ length: slideCount() }, () => ({})),
      });
      fixture.componentRef.setInput("slidesPerView", { xs: 1 });
      fixture.componentRef.setInput("loop", false);
      fixture.detectChanges();
      component.trackIndex.set(4);
    });

    it("moves back into range when more slides fit in view", () => {
      // E.g. a phone at 1 per view resized to a desktop breakpoint at 4 per view.
      fixture.componentRef.setInput("slidesPerView", { xs: 4 });
      fixture.detectChanges();

      expect(component.maxIndex()).toBe(1);
      expect(component.trackIndex()).toBe(1);
      expect(component.canNext()).toBe(false);
    });

    it("moves back into range when slides are removed", () => {
      slideCount.set(3);
      fixture.detectChanges();

      expect(component.trackIndex()).toBe(2);
    });

    it("jumps without animating", () => {
      component.animate.set(true);
      fixture.componentRef.setInput("slidesPerView", { xs: 4 });
      fixture.detectChanges();

      expect(component.animate()).toBe(false);
    });

    it("keeps a pending wheel snap within the new bound", () => {
      jest.useFakeTimers();
      component.viewportWidth.set(1000);
      component.trackIndex.set(3);
      // Half a slide forwards: the pending snap would round up to 4.
      component.onWheel(new WheelEvent("wheel", { deltaX: 500 }));

      // Before the snap fires, the bound shrinks to a fractional end.
      fixture.componentRef.setInput("slidesPerView", { xs: 3.5 });
      fixture.detectChanges();
      expect(component.trackIndex()).toBe(1.5);

      jest.advanceTimersByTime(200);

      expect(component.trackIndex()).toBe(1.5);
      jest.useRealTimers();
    });

    it("leaves an in-range position alone", () => {
      component.trackIndex.set(1);
      fixture.componentRef.setInput("slidesPerView", { xs: 4 });
      fixture.detectChanges();

      expect(component.trackIndex()).toBe(1);
    });
  });

  it("clamps into range when loop is switched off", () => {
    Object.defineProperty(component, "slides", {
      configurable: true,
      value: () => Array.from({ length: 5 }, () => ({})),
    });
    // A looping track can sit below 0 after navigating back from the first slide.
    component.trackIndex.set(-2);
    fixture.componentRef.setInput("loop", false);
    fixture.detectChanges();

    expect(component.trackIndex()).toBe(0);
  });

  it("has no stop positions without slides, looping or not", () => {
    expect(component.positionCount()).toBe(0);

    fixture.componentRef.setInput("loop", false);
    fixture.detectChanges();

    expect(component.positionCount()).toBe(0);
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
      positionCount: signal(3),
      activePosition: signal(1),
      canPrev: signal(true),
      canNext: signal(true),
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

  it("renders one dot per stop position and marks the active one", () => {
    // A bounded carousel with 5 slides, 3 in view, stops at 3 positions.
    mockCarouselContent.positionCount.set(3);
    mockCarouselContent.activePosition.set(2);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const dots = Array.from<HTMLElement>(
      fixture.nativeElement.querySelectorAll(".tedi-carousel__indicator"),
    );

    expect(dots.length).toBe(3);
    expect(dots[2].classList).toContain("tedi-carousel__indicator--active");
  });

  it("counts stop positions in the numbers variant", () => {
    fixture.componentInstance.variant = "numbers";
    mockCarouselContent.positionCount.set(4);
    mockCarouselContent.activePosition.set(3);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.replace(/\s+/g, "")).toContain(
      "4/4",
    );
  });

  it("shows no numbers when there are no stop positions", () => {
    fixture.componentInstance.variant = "numbers";
    mockCarouselContent.positionCount.set(0);
    mockCarouselContent.activePosition.set(0);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent.trim()).toBe("");
  });

  it("disables the arrows at the bounds of a non-looping carousel", () => {
    fixture.componentInstance.withArrows = true;
    mockCarouselContent.canPrev.set(false);
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const [back, next] = Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll("button[tedi-button]"),
    );

    expect(back.disabled).toBe(true);
    expect(next.disabled).toBe(false);
  });
});

@Component({
  standalone: true,
  imports: [CarouselNavigationComponent],
  template: ` <tedi-carousel-navigation [overlay]="overlay()" /> `,
})
class TestNavigationHostComponent {
  overlay = signal(false);
}

describe("CarouselNavigationComponent", () => {
  let fixture: ComponentFixture<TestNavigationHostComponent>;
  let component: CarouselNavigationComponent;

  let mockCarouselContent: any;
  let mockCarousel: any;
  let mockTranslationService: { track: jest.Mock };

  beforeEach(async () => {
    mockCarouselContent = {
      canPrev: signal(true),
      canNext: signal(true),
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

  const buttons = () =>
    Array.from<HTMLButtonElement>(
      fixture.nativeElement.querySelectorAll("button"),
    );

  it("renders regular secondary buttons by default", () => {
    const [back, next] = buttons();

    expect(back.classList).toContain("tedi-button");
    expect(next.classList).toContain("tedi-button");
    expect(back.getAttribute("aria-label")).toBe("carousel.moveBack");
    expect(next.getAttribute("aria-label")).toBe("carousel.moveForward");
  });

  it("renders static secondary floating buttons when overlay is set", () => {
    fixture.componentInstance.overlay.set(true);
    fixture.detectChanges();

    const host = fixture.nativeElement.querySelector(
      "tedi-carousel-navigation",
    ) as HTMLElement;
    const [back, next] = buttons();

    expect(host.classList).toContain("tedi-carousel-navigation--overlay");
    for (const button of [back, next]) {
      expect(button.classList).toContain("tedi-floating-button");
      expect(button.classList).toContain("tedi-floating-button--secondary");
      expect(button.classList).toContain("tedi-floating-button--icon-only");
      expect(button.style.position).toBe("static");
    }
    expect(back.getAttribute("aria-label")).toBe("carousel.moveBack");
    expect(next.getAttribute("aria-label")).toBe("carousel.moveForward");
  });

  it.each([false, true])(
    "disables the arrows at the bounds (overlay: %s)",
    (overlay) => {
      fixture.componentInstance.overlay.set(overlay);
      mockCarouselContent.canNext.set(false);
      fixture.detectChanges();

      const [back, next] = buttons();

      expect(back.disabled).toBe(false);
      expect(next.disabled).toBe(true);
    },
  );

  it("wires the overlay buttons to prev / next", () => {
    fixture.componentInstance.overlay.set(true);
    fixture.detectChanges();

    const [back, next] = buttons();
    back.click();
    next.click();

    expect(mockCarouselContent.prev).toHaveBeenCalledTimes(1);
    expect(mockCarouselContent.next).toHaveBeenCalledTimes(1);
  });
});
