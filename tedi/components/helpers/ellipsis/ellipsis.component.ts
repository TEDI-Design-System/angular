import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  effect,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { TooltipContentComponent, TooltipTriggerComponent, TooltipComponent } from "../../overlay/tooltip/index";

export type EllipsisPosition = "start" | "end";

@Component({
  standalone: true,
  selector: "tedi-ellipsis",
  imports: [NgTemplateOutlet, TooltipComponent, TooltipTriggerComponent, TooltipContentComponent],
  templateUrl: "./ellipsis.component.html",
  styleUrl: "./ellipsis.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-ellipsis",
  },
})
export class EllipsisComponent {
  /** Maximum number of lines before truncating. End (multi-line) only. */
  readonly lineClamp = input<number>(2);

  /** Whether truncated content shows a hover/focus tooltip with full text. */
  readonly tooltip = input<boolean>(true);

  /** Ellipsis position. 'start' = leading, single-line. 'end' = trailing, multi-line. */
  readonly position = input<EllipsisPosition>("end");

  readonly content = viewChild<ElementRef<HTMLElement>>("content");

  readonly isEllipsed = signal(false);
  readonly fullText = signal("");

  constructor() {
    effect((onCleanup) => {
      const el = this.content()?.nativeElement;
      if (!el || typeof ResizeObserver === "undefined") return;

      const measure = () => this.updateEllipsedState(el);
      measure();

      const observer = new ResizeObserver(measure);
      observer.observe(el);
      onCleanup(() => observer.disconnect());
    });
  }

  readonly contentClasses = computed(() => {
    const classes = ["tedi-ellipsis__content"];
    if (this.position() === "start") {
      classes.push("tedi-ellipsis__content--start");
    }
    return classes.join(" ");
  });

  readonly clampStyle = computed(() => {
    if (this.position() !== "end") return null;
    return String(this.lineClamp());
  });

  private updateEllipsedState(el: HTMLElement): void {
    // Truncation may be horizontal (single-line `text-overflow: ellipsis`, e.g.
    // Tag) or vertical (`-webkit-line-clamp`, multi-line). Checking only one axis
    // misses the other — a single-line `end` truncation overflows horizontally,
    // not vertically — so detect either.
    const isTruncated =
      el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;

    this.isEllipsed.set(isTruncated);
    this.fullText.set(el.textContent?.trim() ?? "");
  }
}
