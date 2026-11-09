import { Directive } from "@angular/core";

/**
 * Custom header content. Replaces the header's whole default layout: title,
 * slots, and the collapse and close buttons. The content then labels nothing,
 * so set `ariaLabelledBy` or `ariaLabel` on `tediSheetContent`, and add your
 * own `tediSheetClose` control if the sheet should be closable from it.
 */
@Directive({
  standalone: true,
  selector: "[tedi-sheet-header-content]",
  host: {
    class: "tedi-sheet-header__content",
  },
})
export class SheetHeaderContentDirective {}
