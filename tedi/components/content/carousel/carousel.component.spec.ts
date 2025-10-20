/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ElementRef, input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { CarouselContentComponent } from "./carousel-content/carousel-content.component";
import { BreakpointService } from "../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { CarouselIndicatorsComponent } from "./carousel-indicators/carousel-indicators.component";
import { CarouselComponent } from "./carousel.component";
import { CarouselNavigationComponent } from "./carousel-navigation/carousel-navigation.component";

@Component({
  standalone: true,
  imports: [CarouselContentComponent],
  template: `
    <tedi-carousel-content
      [slidesPerView]="slidesPerView"
      [gap]="gap"
      [fade]="fade"
      [transitionMs]="transitionMs"
    ></tedi-carousel-content>
  `,
})
class TestHostComponent {
  slidesPerView = input({ xs: 1 });
  gap = input({ xs: 16 });
  fade = input(false);
  transitionMs = input(400);
}

describe("CarouselContentComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
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
      imports: [TestHostComponent],
      providers: [
        { provide: BreakpointService, useValue: mockBreakpointService },
        { provide: TediTranslationService, useValue: mockTranslationService },
        { provide: ElementRef, useValue: new ElementRef(fakeViewport) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();

    const carouselDebug = fixture.debugElement.query(
      By.directive(CarouselContentComponent),
    );
    component = carouselDebug.componentInstance;
    hostElement = carouselDebug.nativeElement;
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

    (component as any).viewportWidth.set(1000);

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

    (component as any).dragging = false;
    component.animate.set(true);
    component.trackIndex.set(2);

    const evt = {
      target: fakeNative,
      propertyName: "transform",
    } as unknown as TransitionEvent;

    component.onTransitionEnd(evt);

    expect(component.animate()).toBe(false);
  });

  it("should handle onTransitionEnd and reset animation flags", () => {
    const fakeNative = {};
    Object.defineProperty(component, "track", {
      configurable: true,
      value: () => ({ nativeElement: fakeNative }) as any,
    });

    (component as any).dragging = false;
    component.animate.set(true);
    component.trackIndex.set(2);

    const event = {
      target: fakeNative,
      propertyName: "transform",
    } as unknown as TransitionEvent;

    component.onTransitionEnd(event);
    expect(component.animate()).toBe(false);
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
