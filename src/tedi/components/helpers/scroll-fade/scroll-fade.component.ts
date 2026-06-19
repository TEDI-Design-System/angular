import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  computed,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { CdkScrollable } from "@angular/cdk/scrolling";

export type ScrollFadeSize = 0 | 10 | 20;
export type ScrollFadePosition = "top" | "bottom" | "both";
export type ScrollFadeScrollbar = "default" | "custom";

@Component({
  standalone: true,
  selector: "tedi-scroll-fade",
  imports: [CdkScrollable],
  templateUrl: "./scroll-fade.component.html",
  styleUrl: "./scroll-fade.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "classes()",
  },
})
export class ScrollFadeComponent implements AfterViewInit, OnDestroy {
  /** Size of the fade gradient in percentages. */
  readonly fadeSize = input<ScrollFadeSize>(20);

  /** Which edges show the fade. */
  readonly fadePosition = input<ScrollFadePosition>("both");

  /** Scrollbar style. */
  readonly scrollBar = input<ScrollFadeScrollbar>("custom");

  /** Emitted when scrolled to the top. */
  readonly scrolledToTop = output<void>();

  /** Emitted when scrolled to the bottom. */
  readonly scrolledToBottom = output<void>();

  private readonly innerRef =
    viewChild.required<ElementRef<HTMLDivElement>>("inner");
  private resizeObserver: ResizeObserver | null = null;

  private readonly fade = signal({ top: false, bottom: false });

  readonly classes = computed(() => {
    const classList = ["tedi-scroll-fade"];
    const { top, bottom } = this.fade();
    const pos = this.fadePosition();
    const size = this.fadeSize();

    if (top && (pos === "both" || pos === "top")) {
      classList.push(`tedi-scroll-fade--top-${size}`);
    }

    if (bottom && (pos === "both" || pos === "bottom")) {
      classList.push(`tedi-scroll-fade--bottom-${size}`);
    }

    return classList.join(" ");
  });

  readonly innerClasses = computed(() => {
    const classList = ["tedi-scroll-fade__inner"];

    if (this.scrollBar() === "custom") {
      classList.push("tedi-scroll-fade__inner--custom-scroll");
    }

    return classList.join(" ");
  });

  onScroll(): void {
    const el = this.innerRef().nativeElement;
    this.updateFade(el.scrollTop, el.scrollHeight, el.clientHeight);
  }

  ngAfterViewInit(): void {
    const el = this.innerRef().nativeElement;
    this.updateFade(el.scrollTop, el.scrollHeight, el.clientHeight);

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this.updateFade(el.scrollTop, el.scrollHeight, el.clientHeight);
      });
      this.resizeObserver.observe(el);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  private updateFade(
    scrollTop: number,
    scrollHeight: number,
    clientHeight: number,
  ): void {
    const atTop = scrollTop === 0;
    const atBottom = Math.abs(scrollHeight - scrollTop - clientHeight) <= 1;

    if (atTop) {
      this.scrolledToTop.emit();
    }

    if (atBottom) {
      this.scrolledToBottom.emit();
    }

    this.fade.set({ top: !atTop, bottom: !atBottom });
  }
}
