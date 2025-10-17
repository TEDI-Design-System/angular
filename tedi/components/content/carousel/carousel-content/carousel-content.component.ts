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
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { CarouselSlideDirective } from "../carousel-slide.directive";
import {
  breakpointInput,
  BreakpointInput,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";

@Component({
  standalone: true,
  selector: "tedi-carousel-content",
  templateUrl: "./carousel-content.component.html",
  styleUrls: ["./carousel-content.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [NgTemplateOutlet],
})
export class CarouselContentComponent implements AfterViewInit, OnDestroy {
  /** Slides per view (minimum 1, can be fractional, e.g. 1.25 for peeking) */
  readonly slidesPerView = input(
    { xs: 1, md: 4 },
    { transform: (v: BreakpointInput<number>) => breakpointInput(v) },
  );

  private readonly breakpointService = inject(BreakpointService);

  readonly viewport =
    viewChild.required<ElementRef<HTMLDivElement>>("viewport");
  readonly track = viewChild.required<ElementRef<HTMLDivElement>>("track");

  readonly slides = contentChildren(CarouselSlideDirective);

  readonly trackIndex = signal(0);
  readonly animate = signal(false);
  private readonly windowBase = signal(0);

  private readonly currentSlidesPerView = computed(() => {
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

  readonly transform = computed(() => {
    const cellPercent = 100 / this.currentSlidesPerView();
    const offsetSlides = this.trackIndex() - this.windowBase() + this.buffer();
    return `translate3d(${-offsetSlides * cellPercent}%, 0, 0)`;
  });

  readonly transitionStyle = computed(() =>
    this.animate() ? `transform ${this.transitionMs}ms ease` : "none",
  );

  readonly slideFlex = computed(
    () => `0 0 ${100 / this.currentSlidesPerView()}%`,
  );

  private locked = false;
  private dragging = false;
  private startX = 0;
  private startIndex = 0;
  private viewportWidth = 0;
  private readonly transitionMs = 400;
  private ro?: ResizeObserver;

  ngAfterViewInit(): void {
    const viewport = this.viewport().nativeElement;
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

  private lockNavigation() {
    this.locked = true;
    setTimeout(() => (this.locked = false), this.transitionMs);
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

  onPointerDown(ev: PointerEvent) {
    if (!this.slides().length) {
      return;
    }

    this.viewport().nativeElement.setPointerCapture(ev.pointerId);
    this.dragging = true;
    this.animate.set(false);
    this.startX = ev.clientX;
    this.startIndex = this.trackIndex();
    this.windowBase.set(Math.floor(this.startIndex));
  }

  onPointerMove(ev: PointerEvent) {
    if (!this.dragging) {
      return;
    }

    const dx = ev.clientX - this.startX;
    const cellWidth = this.viewportWidth / this.currentSlidesPerView();

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

  onPointerUp() {
    if (!this.dragging) {
      return;
    }

    this.dragging = false;
    this.animate.set(true);
    this.trackIndex.set(Math.round(this.trackIndex()));
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
}
