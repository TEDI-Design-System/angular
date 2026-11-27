import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  DestroyRef,
  ElementRef,
  inject,
  input,
  Renderer2,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { FooterListItemDirective } from "./footer-list-item.directive";

const FOLLOWED_CLASS = "tedi-footer-list__item--followed";

/**
 * Exposes a group of footer links as a list. Project one `<li tedi-footer-list-item>` per link
 * (or per link group, such as a contact row with an icon).
 */
@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  selector: "tedi-footer-list",
  imports: [NgTemplateOutlet],
  templateUrl: "./footer-list.component.html",
  styleUrl: "./footer-list.component.scss",
  host: { class: "tedi-footer-list-host" },
})
export class FooterListComponent {
  private readonly renderer = inject(Renderer2);

  /**
   * Shows a small dot between items (the Figma "with separator" bottom variant). The dots are drawn with CSS, so they are not part of the list and are not announced. A dot is hidden when it would end a wrapped line.
   * @default false
   */
  readonly separator = input<boolean>(false);
  /**
   * Wraps the list in a `<nav>` landmark with this label. Opt-in: leave it out for groups that are not navigation (for example contact details). The label must be unique within the page.
   */
  readonly navigationLabel = input<string>();
  /**
   * Accessible name of the list itself, for example the section heading it belongs to.
   */
  readonly ariaLabel = input<string>();

  private readonly items = contentChildren(FooterListItemDirective, {
    read: ElementRef,
  });
  // The rendered <ul>; it is recreated when `navigationLabel` adds or removes the <nav> wrapper.
  private readonly list = viewChild<ElementRef<HTMLUListElement>>("list");

  private resizeObserver?: ResizeObserver;

  constructor() {
    afterRenderEffect(() => {
      const list = this.list()?.nativeElement;
      const items = this.items().map(
        (item) => item.nativeElement as HTMLElement,
      );
      this.resizeObserver?.disconnect();
      this.resizeObserver = undefined;

      if (!this.separator() || !list) {
        items.forEach((item) =>
          this.renderer.removeClass(item, FOLLOWED_CLASS),
        );
        return;
      }

      const update = () => this.updateSeparators(items);
      update();

      if (typeof ResizeObserver !== "undefined" && items.length) {
        const observer = new ResizeObserver(update);
        items.forEach((item) => observer.observe(item));
        observer.observe(list);
        this.resizeObserver = observer;
      }
    });
    inject(DestroyRef).onDestroy(() => this.resizeObserver?.disconnect());
  }

  /** A dot follows an item only when the next item sits on the same row. */
  private updateSeparators(items: HTMLElement[]): void {
    const centers = items.map((item) => {
      const rect = item.getBoundingClientRect();
      return rect.top + rect.height / 2;
    });

    items.forEach((item, index) => {
      const followed =
        index < items.length - 1 &&
        Math.abs(centers[index] - centers[index + 1]) < 1;

      if (followed) {
        this.renderer.addClass(item, FOLLOWED_CLASS);
      } else {
        this.renderer.removeClass(item, FOLLOWED_CLASS);
      }
    });
  }
}
