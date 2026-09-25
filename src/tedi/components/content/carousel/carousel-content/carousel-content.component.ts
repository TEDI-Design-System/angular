import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  contentChildren,
  signal,
  viewChild,
  viewChildren,
  AfterViewInit,
  OnDestroy,
  input,
  inject,
  booleanAttribute,
  effect,
  untracked,
  HostListener,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { CarouselSlideDirective } from "../carousel-slide.directive";
import {
  breakpointInput,
  BreakpointInput,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../../services";

/** Ignore tiny calculation differences when deciding the carousel’s position. */
const EPSILON = 0.001;

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
    "[attr.aria-label]": "resolvedAriaLabel()",
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

  /** Should carousel have fade? In mobile both left and right, in desktop only right. */
  readonly fade = input(false);

  /** Transition duration in ms */
  readonly transitionMs = input(400);

  /**
   * Whether navigation wraps around at the ends. When `false`, it stops at the
   * first and last reachable positions and disables the corresponding arrow.
   * @default true
   */
  readonly loop = input(true, { transform: booleanAttribute });

  /** Accessible label for the carousel region. Falls back to the `carousel` translation. */
  readonly ariaLabel = input<string>();

  readonly translationService = inject(TediTranslationService);
  private readonly breakpointService = inject(BreakpointService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly liveAnnouncer = inject(LiveAnnouncer);

  readonly track = viewChild.required<ElementRef<HTMLDivElement>>("track");
  readonly slideElements = viewChildren<ElementRef<HTMLDivElement>>("slide");
  readonly slides = contentChildren(CarouselSlideDirective);

  readonly resolvedAriaLabel = computed(
    () => this.ariaLabel() ?? this.translationService.track("carousel")(),
  );

  readonly trackIndex = signal(0);
  readonly animate = signal(false);
  readonly viewportWidth = signal(0);
  private readonly windowBase = signal(0);

  readonly currentSlidesPerView = computed(() => {
    if (
      this.slidesPerView().xxl &&
      this.breakpointService.isAboveBreakpoint("xxl")()
    ) {
      return this.slidesPerView().xxl as number;
    } else if (
      this.slidesPerView().xl &&
      this.breakpointService.isAboveBreakpoint("xl")()
    ) {
      return this.slidesPerView().xl as number;
    } else if (
      this.slidesPerView().lg &&
      this.breakpointService.isAboveBreakpoint("lg")()
    ) {
      return this.slidesPerView().lg as number;
    } else if (
      this.slidesPerView().md &&
      this.breakpointService.isAboveBreakpoint("md")()
    ) {
      return this.slidesPerView().md as number;
    } else if (
      this.slidesPerView().sm &&
      this.breakpointService.isAboveBreakpoint("sm")()
    ) {
      return this.slidesPerView().sm as number;
    } else {
      return this.slidesPerView().xs;
    }
  });

  readonly currentGap = computed(() => {
    if (this.gap().xxl && this.breakpointService.isAboveBreakpoint("xxl")()) {
      return this.gap().xxl as number;
    } else if (
      this.gap().xl &&
      this.breakpointService.isAboveBreakpoint("xl")()
    ) {
      return this.gap().xl as number;
    } else if (
      this.gap().lg &&
      this.breakpointService.isAboveBreakpoint("lg")()
    ) {
      return this.gap().lg as number;
    } else if (
      this.gap().md &&
      this.breakpointService.isAboveBreakpoint("md")()
    ) {
      return this.gap().md as number;
    } else if (
      this.gap().sm &&
      this.breakpointService.isAboveBreakpoint("sm")()
    ) {
      return this.gap().sm as number;
    } else {
      return this.gap().xs;
    }
  });

  readonly buffer = computed(() => (this.loop() ? this.slides().length : 0));

  /** Furthest track position in bounded mode; may be fractional to show the last slide fully. */
  readonly maxIndex = computed(() =>
    Math.max(0, this.slides().length - this.currentSlidesPerView()),
  );

  /** Number of indicator positions: one per slide when looping, or one per reachable stop when bounded. */
  readonly positionCount = computed(() => {
    if (this.loop() || !this.slides().length) {
      return this.slides().length;
    }

    return Math.ceil(this.maxIndex() - EPSILON) + 1;
  });

  /** Index of the active indicator; a fractional final stop gets its own index. */
  readonly activePosition = computed(() => {
    if (this.loop()) {
      return this.slideIndex();
    }

    const nearest = this.snap(this.trackIndex());
    return nearest >= this.maxIndex() - EPSILON
      ? this.positionCount() - 1
      : Math.round(nearest);
  });

  /** Index of the leftmost visible slide, skipping a partially visible one in bounded mode. */
  readonly slideIndex = computed(() => {
    const slidesCount = this.slides().length;

    if (slidesCount === 0) {
      return 0;
    }

    if (!this.loop()) {
      return Math.min(
        Math.max(Math.ceil(this.trackIndex() - EPSILON), 0),
        slidesCount - 1,
      );
    }

    const i = Math.floor(this.trackIndex());
    return ((i % slidesCount) + slidesCount) % slidesCount;
  });

  readonly renderedActiveIndex = computed(() => {
    if (!this.loop()) {
      return this.trackIndex();
    }

    return this.trackIndex() - this.windowBase() + this.buffer();
  });

  readonly canPrev = computed(() => this.loop() || this.trackIndex() > EPSILON);

  readonly canNext = computed(
    () => this.loop() || this.trackIndex() < this.maxIndex() - EPSILON,
  );

  /**
   * Checks if a slide at the given rendered index is currently visible in the viewport.
   * Used to determine which slides should be accessible to screen readers.
   */
  isSlideVisible(renderedIndex: number): boolean {
    const activeIndex = this.renderedActiveIndex();
    const slidesPerView = Math.ceil(this.currentSlidesPerView());
    return (
      renderedIndex >= activeIndex &&
      renderedIndex < activeIndex + slidesPerView
    );
  }

  readonly renderedIndices = computed(() => {
    const slidesCount = this.slides().length;

    if (!slidesCount) {
      return [];
    }

    if (!this.loop()) {
      return Array.from({ length: slidesCount }, (_, i) => i);
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
    const viewportWidth = this.viewportWidth();

    if (!viewportWidth) {
      return {
        gap: `${gap}px`,
        transform: "translate3d(0,0,0)",
        transition: "none",
      };
    }

    const totalGapWidth = gap * (slidesPerView - 1);
    const slideWidth = (viewportWidth - totalGapWidth) / slidesPerView;

    const offsetSlides = this.renderedActiveIndex();
    const translateX = -offsetSlides * (slideWidth + gap);

    return {
      gap: `${gap}px`,
      transform: `translate3d(${translateX}px, 0, 0)`,
      transition: this.animate()
        ? `transform ${this.transitionMs()}ms ease`
        : "none",
    };
  });

  constructor() {
    // Re-clamp without animation when bounded mode starts or its limit changes.
    // Don't track the current position: normal navigation must not rerun this effect.
    effect(() => {
      if (!this.loop()) {
        const max = this.maxIndex();
        untracked(() => this.clampIntoRange(max));
      }
    });
  }

  locked = false;
  dragging = false;
  private pendingFocus = false;
  private startX = 0;
  private startIndex = 0;
  private ro?: ResizeObserver;
  private wheelTimeout?: ReturnType<typeof setTimeout>;
  private scrollDelta = 0;

  @HostListener("scroll")
  onScroll() {
    // Prevent any scroll triggered by focus (e.g., VoiceOver navigation)
    this.host.nativeElement.scrollLeft = 0;
    this.host.nativeElement.scrollTop = 0;
  }

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
      (this.viewportWidth() -
        this.currentGap() * (this.currentSlidesPerView() - 1)) /
        this.currentSlidesPerView() +
      this.currentGap();

    if (!cellWidth) {
      return;
    }

    const deltaSlides = delta / cellWidth;
    this.scrollDelta += deltaSlides;

    const { min, max } = this.dragBounds(this.windowBase());

    const unclamped = this.trackIndex() + deltaSlides;
    const clamped = Math.min(Math.max(unclamped, min), max);
    const wasClamped = clamped !== unclamped;

    this.animate.set(false);
    this.trackIndex.set(clamped);

    clearTimeout(this.wheelTimeout);

    this.wheelTimeout = setTimeout(() => {
      this.animate.set(true);

      // Recalculate bounds: the viewport or slide count may have changed before snapping.
      const { min, max } = this.dragBounds(this.windowBase());
      const direction = Math.sign(this.scrollDelta);
      const current = this.trackIndex();

      let snapIndex = this.snap(current);

      if (Math.abs(this.scrollDelta) > 0.3) {
        snapIndex = direction > 0 ? Math.ceil(current) : Math.floor(current);
      }

      // If scrolling hit a limit, snap inward when looping or to the exact bound otherwise.
      if (wasClamped) {
        if (current <= min) snapIndex = this.loop() ? Math.ceil(min) : min;
        if (current >= max) snapIndex = this.loop() ? Math.floor(max) : max;
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

    if (this.loop()) {
      this.windowBase.set(Math.floor(this.startIndex));
    }
  }

  @HostListener("pointermove", ["$event"])
  onPointerMove(ev: PointerEvent) {
    if (!this.dragging) {
      return;
    }

    const dx = ev.clientX - this.startX;
    const cellWidth =
      (this.viewportWidth() -
        this.currentGap() * (this.currentSlidesPerView() - 1)) /
        this.currentSlidesPerView() +
      this.currentGap();

    if (!cellWidth) {
      return;
    }

    const deltaSlides = dx / cellWidth;
    const targetIndex = this.startIndex - deltaSlides;

    const { min, max } = this.dragBounds(Math.floor(this.startIndex));
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
    this.trackIndex.set(this.snap(this.trackIndex()));
  }

  ngAfterViewInit(): void {
    const viewport = this.host.nativeElement;
    this.viewportWidth.set(viewport.clientWidth);

    // Use the fractional width to keep track translation aligned with CSS-sized slides.
    this.ro = new ResizeObserver(([entry]) => {
      this.viewportWidth.set(entry.contentRect.width);
    });

    this.ro.observe(viewport);
  }

  ngOnDestroy(): void {
    this.ro?.disconnect();
  }

  next(): void {
    if (!this.slides().length || this.locked || !this.canNext()) {
      return;
    }

    this.animate.set(true);
    // Move to the next whole position, clamping to a fractional final position.
    this.trackIndex.update((i) => this.clampIndex(Math.floor(i + EPSILON) + 1));
    this.lockNavigation();
    this.announceSlideChange();
  }

  prev(): void {
    if (!this.slides().length || this.locked || !this.canPrev()) {
      return;
    }

    this.animate.set(true);
    this.trackIndex.update((i) => this.clampIndex(Math.ceil(i - EPSILON) - 1));
    this.lockNavigation();
    this.announceSlideChange();
  }

  goToIndex(index: number, options?: { focusSlide?: boolean }) {
    const slidesCount = this.slides().length;

    if (!slidesCount || this.locked) {
      return;
    }

    this.animate.set(true);

    if (this.loop()) {
      const current = this.slideIndex();
      const normalized = ((index % slidesCount) + slidesCount) % slidesCount;
      const delta = normalized - current;
      this.trackIndex.update((i) => i + delta);
    } else {
      this.trackIndex.set(this.clampIndex(index));
    }

    if (options?.focusSlide) {
      // Focus after transition completes so DOM positions are stable
      this.pendingFocus = true;
    } else {
      this.announceSlideChange();
    }
  }

  /**
   * Focuses the currently active slide for screen reader users.
   * Uses preventScroll to avoid breaking carousel layout.
   */
  focusActiveSlide(): void {
    setTimeout(() => {
      // A bounded track can rest at a fractional index; focus the first fully visible slide.
      const activeIndex = Math.ceil(this.renderedActiveIndex() - EPSILON);
      const slideElement = this.slideElements()[activeIndex];
      if (slideElement) {
        slideElement.nativeElement.focus({ preventScroll: true });
      }
    });
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

    if (this.pendingFocus) {
      this.pendingFocus = false;
      this.focusActiveSlide();
    }
  }

  private clampIntoRange(max: number): void {
    const current = this.trackIndex();
    const clamped = Math.min(Math.max(current, 0), max);

    if (clamped !== current) {
      this.animate.set(false);
      this.trackIndex.set(clamped);
      this.windowBase.set(Math.floor(clamped));
    }
  }

  private clampIndex(value: number): number {
    return this.loop() ? value : Math.min(Math.max(value, 0), this.maxIndex());
  }

  /** Snap to the nearest reachable position, including a fractional end. */
  private snap(value: number): number {
    if (this.loop()) {
      return Math.round(value);
    }

    const below = this.clampIndex(Math.floor(value));
    const above = this.clampIndex(Math.ceil(value));

    return value - below <= above - value ? below : above;
  }

  /**
   * Range the track may be dragged or wheeled within. A looping track stays inside
   * its rendered duplicate buffer around `base`; a bounded one stops at the ends.
   */
  private dragBounds(base: number): { min: number; max: number } {
    if (!this.loop()) {
      return { min: 0, max: this.maxIndex() };
    }

    const maxDelta = this.buffer() * 0.9;

    return { min: base - maxDelta, max: base + maxDelta };
  }

  lockNavigation() {
    this.locked = true;
    setTimeout(() => (this.locked = false), this.transitionMs());
  }

  announceSlideChange(): void {
    setTimeout(() => {
      const slideNumber = this.slideIndex() + 1;
      const totalSlides = this.slides().length;
      const message = this.translationService.translate(
        "carousel.slide",
        slideNumber,
        totalSlides,
      );

      this.liveAnnouncer.announce(message, "polite");
    }, 100);
  }
}
