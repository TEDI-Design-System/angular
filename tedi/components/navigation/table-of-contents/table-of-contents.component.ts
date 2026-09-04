import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";

import { CardComponent, CardContentComponent } from "../../content/card";
import { TextComponent } from "../../base/text/text.component";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TableOfContentsItemComponent } from "./table-of-contents-item/table-of-contents-item.component";

export type TableOfContentsVariant = "default" | "transparent";
export type TableOfContentsHeadingLevel =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6";

let nextUniqueId = 0;

/**
 * A navigation aid that lists the sections of a page and highlights the one the
 * reader is on. Compose it from `tedi-table-of-contents-item` elements; nest
 * items to build a two-level hierarchy.
 *
 * The active item is controlled via `activeId`: it gets the accent bar and active link colour.
 *
 * When `sticky` is enabled the container pins while the page scrolls. Two knobs
 * adapt it to the surrounding layout: `stickyOffset` moves where it pins (raise
 * it to clear a fixed header), and `stickyMaxHeight` overrides the height cap
 * for when the TOC scrolls inside a fixed-height container rather than the window.
 */
@Component({
  selector: "tedi-table-of-contents",
  standalone: true,
  imports: [CardComponent, CardContentComponent, TextComponent, NgTemplateOutlet],
  templateUrl: "./table-of-contents.component.html",
  styleUrl: "./table-of-contents.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-table-of-contents",
    "[class.tedi-table-of-contents--bordered]": "bordered()",
    "[attr.data-name]": "'table-of-contents'",
    "[style.--tedi-table-of-contents-sticky-top]": "stickyOffset()",
    "[style.--tedi-table-of-contents-sticky-max-height]": "stickyMaxHeight()",
  },
})
export class TableOfContentsComponent {
  /**
   * Heading rendered above the list. Defaults to the localised "Table of
   * contents" label; pass `null` (or an empty string) to render it headless —
   * the navigation keeps an accessible name via `aria-label`.
   */
  readonly heading = input<string | null | undefined>(undefined);
  /**
   * Semantic level of the heading element (`h1`–`h6`). The visual style stays
   * h4 regardless; set this to match the surrounding page's heading outline
   * (e.g. `h2` when the TOC follows only a page `h1`).
   */
  readonly headingLevel = input<TableOfContentsHeadingLevel>("h3");
  /**
   * Visual variant:
   * - `default` — rendered inside a bordered card.
   * - `transparent` — no card chrome; the list sits on the page with a
   *   continuous grey left rail.
   */
  readonly variant = input<TableOfContentsVariant>("default");
  /**
   * Draws a divider under each item except the last — sub-items included — so the
   * list reads as a set of separated rows.
   * @default false
   */
  readonly bordered = input<boolean>(false);
  /** Id of the currently active item. */
  readonly activeId = input<string>();
  /**
   * Whether nested items are expanded by default. When `true` (default) the full
   * outline is always visible. When `false`, a branch reveals its sub-items only
   * while it is on the active trail (the active item or one of its ancestors).
   * @default true
   */
  readonly defaultOpen = input<boolean>(true);
  /** Show auto-generated hierarchical numbers (`1.`, `2.`, `2.1`, …). */
  readonly numbered = input<boolean>(false);
  /** Stick the container to the viewport while scrolling. */
  readonly sticky = input<boolean>(true);
  /**
   * Distance from the top of the scroll container at which the sticky TOC pins,
   * as any CSS length or expression. Raise it to clear a fixed header — e.g.
   * `"calc(var(--layout-header-height) + 1.5rem)"`. Drives both `top` and the
   * default `max-height`. Only applies while `sticky` is `true`.
   * @default "1.5rem"
   */
  readonly stickyOffset = input<string>();
  /**
   * Overrides the sticky height cap. The default keeps the TOC within the
   * viewport (`calc(100dvh - offset - 1.5rem)`); set this when the TOC scrolls
   * inside a fixed-height container rather than the window — e.g.
   * `"calc(30rem - 3rem)"` for a 30rem scroll region. Only applies while
   * `sticky` is `true`.
   */
  readonly stickyMaxHeight = input<string>();
  /**
   * Accessible name for the navigation landmark. Overrides the default, which is
   * the heading (via `aria-labelledby`) or the localised title when headless.
   * Useful to disambiguate multiple tables of contents on one page.
   */
  readonly ariaLabel = input<string>();

  private readonly translations = inject(TediTranslationService);

  /** Top-level items, used by items to compute their hierarchical numbers. */
  readonly items = contentChildren(
    forwardRef(() => TableOfContentsItemComponent),
  );

  private readonly titleLabel = this.translations.track("table-of-contents.title");

  readonly resolvedHeading = computed(() => {
    const heading = this.heading();
    return heading === undefined ? this.titleLabel() : heading;
  });
  readonly navLabel = computed(() => this.ariaLabel() || this.titleLabel());

  readonly headingId = `tedi-table-of-contents-heading-${(nextUniqueId += 1)}`;
}
