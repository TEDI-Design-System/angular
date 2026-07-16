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
 * The active item is controlled via `activeId`: it gets the accent bar and
 * active link colour, and the branch leading to it auto-expands.
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
    "[style.--tedi-table-of-contents-padding]": "paddingVar()",
    "[attr.data-name]": "'table-of-contents'",
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
   * Inner padding of the container, in rem. Defaults to the card's medium
   * padding token.
   */
  readonly padding = input<number>();
  /** Id of the currently active item. */
  readonly activeId = input<string>();
  /**
   * Show a validation glyph before each item (multistep-form usage). Each state
   * uses a distinct icon shape with a localised text alternative.
   */
  readonly showIcons = input<boolean>(false);
  /** Show auto-generated hierarchical numbers (`1.`, `2.`, `2.1`, …). */
  readonly numbered = input<boolean>(false);
  /** Stick the container to the viewport while scrolling. */
  readonly sticky = input<boolean>(true);
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

  readonly paddingVar = computed(() => {
    const padding = this.padding();
    return padding !== undefined ? `${padding}rem` : null;
  });
}
