import { Directive } from "@angular/core";

/**
 * Marks projected content as the trailing suffix of a
 * `tedi-table-of-contents-item`. The item renders it right-aligned at the end of
 * the row — e.g. a `tedi-tag`.
 */
@Directive({
  selector: "[tediTocItemSuffix]",
  standalone: true,
  host: {
    class: "tedi-table-of-contents__suffix",
  },
})
export class TableOfContentsItemSuffixDirective {}
