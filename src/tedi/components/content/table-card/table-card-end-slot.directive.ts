import { Directive } from "@angular/core";

/**
 * Marks the element a `tedi-table-card` shows at the end of its header, e.g.
 * `<tedi-status-badge tediTableCardEndSlot color="success" text="Kehtiv" />`.
 *
 * It can hold links and buttons: clicking one does not toggle a `collapsible`
 * card.
 *
 * The card queries for this directive to know it has a header, so import it
 * wherever the attribute is used — the attribute alone projects but brings no
 * header with it.
 */
@Directive({
  selector: "[tediTableCardEndSlot]",
  standalone: true,
})
export class TableCardEndSlotDirective {}
