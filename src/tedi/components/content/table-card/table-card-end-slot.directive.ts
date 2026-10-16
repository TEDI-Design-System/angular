import { Directive } from "@angular/core";

/**
 * Marks the element a `tedi-table-card` shows at the end of its header, e.g.
 * `<tedi-status-badge tediTableCardEndSlot color="success" text="Kehtiv" />`.
 *
 * Keep the content non-interactive. A `collapsible` card renders its header
 * inside the toggle button, and a link or button nested in a button is invalid
 * markup that assistive technology and keyboard users cannot reach.
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
