import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  signal,
  viewChild,
  AfterViewInit,
  OnDestroy,
  input,
  inject,
  HostListener,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { CarouselSlideDirective } from "../carousel-slide.directive";
import {
  breakpointInput,
  BreakpointInput,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../../services";

@Component({
  standalone: true,
  selector: "tedi-carousel-content",
  templateUrl: "./carousel-content.component.html",
  styleUrls: ["./carousel-content.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet],
  host: {
    tabindex: "0",
    role: "region",
    "aria-roledescription": "carousel",
    "[attr.aria-label]": "translationService.track('carousel')()",
    "aria-live": "off",
    "[class]": "classes()",
  },
})
export class CarouselContentComponent implements AfterViewInit, OnDestroy {
  /** Slides per view (minimum 1, can be fractional, e.g. 1.25 for peeking) */
  readonly slidesPerView = input(
    { xs: 1 },
    { transform: (v: BreakpointInput<number>) => breakpointInput(v) },
  );

  /** Gap between slides in px */
  readonly gap = input(
    { xs: 16 },
    { transform: (v: BreakpointInput<number>) => breakpointInput(v) },
  );

  /** Should fade at the end of carousel? Great to use when slidesPerView is fractional (peeking effect) */
  readonly fade = input(false);

  readonly translationService = inject(TediTranslationService);
  private readonly breakpointService = inject(BreakpointService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly track = viewChild.required<ElementRef<HTMLDivElement>>("track");
  readonly slides = contentChildren(CarouselSlideDirective);

  readonly trackIndex = signal(0);
  readonly animate = signal(false);
  private readonly windowBase = signal(0);

  readonly currentSlidesPerView = computed(() => {
    if (
      this.slidesPerView().xxl &&
      this.breakpointService.isAboveBreakpoint("xxl")
    ) {
      return this.slidesPerView().xxl as number;
    } else if (
      this.slidesPerView().xl &&
      this.breakpointService.isAboveBreakpoint("xl")
    ) {
      return this.slidesPerView().xl as number;
    } else if (
      this.slidesPerView().lg &&
      this.breakpointService.isAboveBreakpoint("lg")
    ) {
      return this.slidesPerView().lg as number;
    } else if (
      this.slidesPerView().md &&
      this.breakpointService.isAboveBreakpoint("md")
    ) {
      return this.slidesPerView().md as number;
    } else if (
      this.slidesPerView().sm &&
      this.breakpointService.isAboveBreakpoint("sm")
    ) {
      return this.slidesPerView().sm as number;
    } else {
      return this.slidesPerView().xs;
    }
  });

  readonly currentGap = computed(() => {
    if (this.gap().xxl && this.breakpointService.isAboveBreakpoint("xxl")) {
      return this.gap().xxl as number;
    } else if (
      this.gap().xl &&
      this.breakpointService.isAboveBreakpoint("xl")
    ) {
      return this.gap().xl as number;
    } else if (
      this.gap().lg &&
      this.breakpointService.isAboveBreakpoint("lg")
    ) {
      return this.gap().lg as number;
    } else if (
      this.gap().md &&
      this.breakpointService.isAboveBreakpoint("md")
    ) {
      return this.gap().md as number;
    } else if (
      this.gap().sm &&
      this.breakpointService.isAboveBreakpoint("sm")
    ) {
      return this.gap().sm as number;
    } else {
      return this.gap().xs;
    }
  });

  private readonly buffer = computed(() => this.slides().length);

  readonly slideIndex = computed(() => {
    const slidesCount = this.slides().length;

    if (slidesCount === 0) {
      return 0;
    }

    const i = Math.floor(this.trackIndex());
    return ((i % slidesCount) + slidesCount) % slidesCount;
  });

  readonly renderedIndices = computed(() => {
    const slidesCount = this.slides().length;

    if (!slidesCount) {
      return [];
    }

    const total = 2 * this.buffer() + Math.ceil(this.currentSlidesPerView());
    const start = this.windowBase() - this.buffer();

    return Array.from(
      { length: total },
      (_, i) => (((start + i) % slidesCount) + slidesCount) % slidesCount,
    );
  });

  readonly slideFlex = computed(() => {
    const slidesPerView = this.currentSlidesPerView();
    const gap = this.currentGap();
    return `0 0 calc((100% - ${(slidesPerView - 1) * gap}px) / ${slidesPerView})`;
  });

  readonly classes = computed(() => {
    const classList = ["tedi-carousel__content"];

    if (this.fade() && this.currentSlidesPerView() > 1) {
      classList.push("tedi-carousel__content--fade-right");
    } else if (this.fade() && this.currentSlidesPerView() <= 1) {
      classList.push("tedi-carousel__content--fade-x");
    }

    return classList.join(" ");
  });

  readonly trackStyle = computed(() => {
    const slidesPerView = this.currentSlidesPerView();
    const gap = this.currentGap();
    const viewportWidth =
      this.viewportWidth || this.host.nativeElement.clientWidth;

    const totalGapWidth = gap * (slidesPerView - 1);
    const slideWidth = (viewportWidth - totalGapWidth) / slidesPerView;

    const offsetSlides = this.trackIndex() - this.windowBase() + this.buffer();
    const translateX = -offsetSlides * (slideWidth + gap);

    return {
      gap: `${gap}px`,
      transform: viewportWidth
        ? `translate3d(${translateX}px, 0, 0)`
        : "translate3d(0, 0, 0)",
      transition: this.animate()
        ? `transform ${this.transitionMs}ms ease`
        : "none",
    };
  });

  private locked = false;
  private dragging = false;
  private startX = 0;
  private startIndex = 0;
  private viewportWidth = 0;
  private readonly transitionMs = 400;
  private ro?: ResizeObserver;
  private wheelTimeout?: ReturnType<typeof setTimeout>;
  private scrollDelta = 0;

  @HostListener("wheel", ["$event"])
  onWheel(event: WheelEvent) {
    const slidesCount = this.slides().length;

    if (!slidesCount) {
      return;
    }

    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.shiftKey
          ? event.deltaY
          : 0;

    if (!delta) {
      return;
    }

    event.preventDefault();

    const cellWidth =
      (this.viewportWidth -
        this.currentGap() * (this.currentSlidesPerView() - 1)) /
        this.currentSlidesPerView() +
      this.currentGap();

    if (!cellWidth) {
      return;
    }

    const deltaSlides = delta / cellWidth;
    this.scrollDelta += deltaSlides;

    const maxDelta = this.buffer() * 0.9;
    const min = this.windowBase() - maxDelta;
    const max = this.windowBase() + maxDelta;

    const unclamped = this.trackIndex() + deltaSlides;
    const clamped = Math.min(Math.max(unclamped, min), max);
    const wasClamped = clamped !== unclamped;

    this.animate.set(false);
    this.trackIndex.set(clamped);

    clearTimeout(this.wheelTimeout);

    this.wheelTimeout = setTimeout(() => {
      this.animate.set(true);

      const direction = Math.sign(this.scrollDelta);
      const current = this.trackIndex();

      let snapIndex = Math.round(current);

      if (Math.abs(this.scrollDelta) > 0.3) {
        snapIndex = direction > 0 ? Math.ceil(current) : Math.floor(current);
      }

      if (wasClamped) {
        if (current <= min) snapIndex = Math.ceil(min);
        if (current >= max) snapIndex = Math.floor(max);
      }

      const finalIndex = Math.min(Math.max(snapIndex, min), max);
      this.trackIndex.set(finalIndex);
      this.scrollDelta = 0;
    }, 120);
  }

  @HostListener("keydown", ["$event"])
  onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowRight":
      case "PageDown":
        event.preventDefault();
        this.next();
        break;

      case "ArrowLeft":
      case "PageUp":
        event.preventDefault();
        this.prev();
        break;

      case "Home":
        event.preventDefault();
        this.goToIndex(0);
        break;

      case "End": {
        event.preventDefault();
        this.goToIndex(this.slides().length - 1);
        break;
      }

      default:
        break;
    }
  }

  @HostListener("pointerdown", ["$event"])
  onPointerDown(ev: PointerEvent) {
    if (!this.slides().length) {
      return;
    }

    this.host.nativeElement.setPointerCapture(ev.pointerId);
    this.dragging = true;
    this.animate.set(false);
    this.startX = ev.clientX;
    this.startIndex = this.trackIndex();
    this.windowBase.set(Math.floor(this.startIndex));
  }

  @HostListener("pointermove", ["$event"])
  onPointerMove(ev: PointerEvent) {
    if (!this.dragging) {
      return;
    }

    const dx = ev.clientX - this.startX;
    const cellWidth =
      (this.viewportWidth -
        this.currentGap() * (this.currentSlidesPerView() - 1)) /
        this.currentSlidesPerView() +
      this.currentGap();

    if (!cellWidth) {
      return;
    }

    const deltaSlides = dx / cellWidth;
    const targetIndex = this.startIndex - deltaSlides;

    const maxDelta = this.buffer() * 0.9;
    const min = this.windowBase() - maxDelta;
    const max = this.windowBase() + maxDelta;
    const clamped = Math.min(Math.max(targetIndex, min), max);
    this.trackIndex.set(clamped);
  }

  @HostListener("pointerup")
  @HostListener("pointercancel")
  @HostListener("lostpointercapture")
  onPointerUp() {
    if (!this.dragging) {
      return;
    }

    this.dragging = false;
    this.animate.set(true);
    this.trackIndex.set(Math.round(this.trackIndex()));
  }

  ngAfterViewInit(): void {
    const viewport = this.host.nativeElement;
    this.viewportWidth = viewport.clientWidth;

    this.ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        if (e.target === viewport) {
          this.viewportWidth = viewport.clientWidth;
        }
      }
    });

    this.ro.observe(viewport);
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
  }

  next(): void {
    if (!this.slides().length || this.locked) {
      return;
    }

    this.animate.set(true);
    this.trackIndex.update((i) => i + 1);
    this.lockNavigation();
  }

  prev(): void {
    if (!this.slides().length || this.locked) {
      return;
    }

    this.animate.set(true);
    this.trackIndex.update((i) => i - 1);
    this.lockNavigation();
  }

  goToIndex(index: number) {
    const slidesCount = this.slides().length;

    if (!slidesCount || this.locked) {
      return;
    }

    const current = this.slideIndex();
    const normalized = ((index % slidesCount) + slidesCount) % slidesCount;
    const delta = normalized - current;
    this.animate.set(true);
    this.trackIndex.update((i) => i + delta);
  }

  onTransitionEnd(e: TransitionEvent) {
    if (
      e.target !== this.track().nativeElement ||
      e.propertyName !== "transform" ||
      this.dragging
    ) {
      return;
    }

    this.animate.set(false);
    this.windowBase.set(Math.floor(this.trackIndex()));
  }

  private lockNavigation() {
    this.locked = true;
    setTimeout(() => (this.locked = false), this.transitionMs);
  }
}
