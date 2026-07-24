import { Directive } from "@angular/core";

/**
 * Styles the parent element that heads a native `li[tedi-sidenav-dropdown-group]`.
 * Apply it to an `<a>` when the parent is itself a link, or to any non-anchor
 * element (e.g. `<span>`, `<button>`) for a plain, non-link heading — the group
 * decides between its inline (link) and drillable (non-link) behaviour based on
 * whether this element is an `<a>`:
 *
 * ```html
 * <li tedi-sidenav-dropdown-group>
 *   <a tedi-sidenav-dropdown-group-parent href="#">Treatments</a>
 *   <ul tedi-sidenav-dropdown-group-list>…</ul>
 * </li>
 * ```
 */
@Directive({
  selector: "[tedi-sidenav-dropdown-group-parent]",
  standalone: true,
  host: {
    class: "tedi-sidenav-dropdown-item__trigger",
  },
})
export class SideNavDropdownGroupParentDirective {}
