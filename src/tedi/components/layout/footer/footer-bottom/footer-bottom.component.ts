import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  Renderer2,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { injectFooter } from "../footer-context";

const DOT_CLASS = "tedi-footer-bottom__dot";
const VISIBLE_DOT_CLASS = "tedi-footer-bottom__dot--visible";

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  selector: "tedi-footer-bottom",
  templateUrl: "./footer-bottom.component.html",
  styleUrl: "./footer-bottom.component.scss",
  host: {
    class: "tedi-footer-bottom",
    "[class.tedi-footer-bottom--mobile]": "isMobile()",
  },
})
export class FooterBottomComponent {
  private readonly renderer = inject(Renderer2);
  private readonly context = injectFooter();

  /**
   * Shows a dot between items.
   * @default false
   */
  readonly separator = input<boolean>(false);

  readonly isMobile = this.context.isMobile;
  readonly maxWidth = this.context.footer?.maxWidthValue;

  private readonly inner = viewChild.required<ElementRef<HTMLElement>>("inner");
  private mutationObserver?: MutationObserver;
  private resizeObserver?: ResizeObserver;

  constructor() {
    afterRenderEffect(() => {
      // A breakpoint can change the gap even when the strip has a fixed width.
      this.isMobile();
      this.syncDots(this.separator());
    });
    inject(DestroyRef).onDestroy(() => {
      this.mutationObserver?.disconnect();
      this.resizeObserver?.disconnect();
    });
  }

  private syncDots(separator: boolean): void {
    const inner = this.inner().nativeElement;
    this.mutationObserver?.disconnect();
    this.resizeObserver?.disconnect();

    inner
      .querySelectorAll(`:scope > .${DOT_CLASS}`)
      .forEach((dot) => this.renderer.removeChild(inner, dot));

    if (!separator) return;

    const items = Array.from(inner.children);
    const dots = items.slice(0, -1).map((item) => {
      const dot = this.renderer.createElement("span") as HTMLElement;
      this.renderer.addClass(dot, DOT_CLASS);
      this.renderer.setAttribute(dot, "aria-hidden", "true");
      this.renderer.insertBefore(inner, dot, item.nextSibling);

      return dot;
    });

    if (dots.length) {
      const positionDots = () => this.positionDots(inner, items, dots);
      positionDots();

      if (typeof ResizeObserver !== "undefined") {
        const observer = new ResizeObserver(positionDots);
        observer.observe(inner);
        items.forEach((item) => observer.observe(item));
        this.resizeObserver = observer;
      }
    }

    this.mutationObserver ??= new MutationObserver(() =>
      this.syncDots(this.separator()),
    );
    this.mutationObserver.observe(inner, { childList: true });
  }

  private positionDots(
    inner: HTMLElement,
    items: Element[],
    dots: HTMLElement[],
  ): void {
    const bounds = inner.getBoundingClientRect();
    const rects = items.map((item) => item.getBoundingClientRect());

    dots.forEach((dot, index) => {
      const before = rects[index];
      const after = rects[index + 1];
      const centerY = before.top + before.height / 2;
      // Flex items on the same row share their vertical center.
      if (
        !before.height ||
        !after.height ||
        Math.abs(centerY - after.top - after.height / 2) >= 1
      ) {
        this.renderer.removeClass(dot, VISIBLE_DOT_CLASS);
        return;
      }

      const [left, right] =
        before.left < after.left ? [before, after] : [after, before];
      const centerX = (left.right + right.left) / 2;

      this.renderer.setStyle(dot, "left", `${centerX - bounds.left}px`);
      this.renderer.setStyle(dot, "top", `${centerY - bounds.top}px`);
      this.renderer.addClass(dot, VISIBLE_DOT_CLASS);
    });
  }
}
