import { Component, ElementRef } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
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

  let mockBreakpointService: { isAboveBreakpoint: jest.Mock };
  let mockTranslationService: { track: jest.Mock };
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
      isAboveBreakpoint: jest.fn().mockReturnValue(false),
    };

    mockTranslationService = {
      track: jest.fn((key: string) => () => key),
    };

    await TestBed.configureTestingModule({
      imports: [CarouselContentComponent],
      providers: [
        { provide: BreakpointService, useValue: mockBreakpointService },
        { provide: TediTranslationService, useValue: mockTranslationService },
        { provide: ElementRef, useValue: new ElementRef(fakeViewport) },
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
    expect(index).toBeGreaterThanOrEqual(0);
    expect(index).toBeLessThan(3);
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

  it("should respect breakpoint priority for currentSlidesPerView", () => {
    const slidesPerView: Record<Breakpoint, number> = {
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xl: 5,
      xxl: 6,
    };
    fixture.componentRef.setInput("slidesPerView", slidesPerView);
    fixture.detectChanges();

    const breakpoints = Object.keys(slidesPerView) as Breakpoint[];
    breakpoints.forEach((bp) => {
      mockBreakpointService.isAboveBreakpoint.mockReturnValueOnce(true);
      fixture.whenStable().then(() => {
        expect(component.currentSlidesPerView()).toBe(slidesPerView[bp]);
      });
    });
  });

  it("should respect breakpoint priority for currentGap", () => {
    const gaps: Record<Breakpoint, number> = {
      xs: 2,
      sm: 4,
      md: 6,
      lg: 8,
      xl: 10,
      xxl: 12,
    };
    fixture.componentRef.setInput("gap", gaps);
    fixture.detectChanges();

    const breakpoints = Object.keys(gaps) as Breakpoint[];
    breakpoints.forEach((bp) => {
      mockBreakpointService.isAboveBreakpoint.mockReturnValueOnce(true);
      fixture.whenStable().then(() => {
        expect(component.currentGap()).toBe(gaps[bp]);
      });
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockCarouselContent: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  it("should call carouselContent.goToIndex() when handleIndicatorClick() is triggered", () => {
    component.handleIndicatorClick(2);
    expect(mockCarouselContent.goToIndex).toHaveBeenCalledWith(2);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockCarouselContent: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
