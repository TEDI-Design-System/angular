import { Directive } from "@angular/core";

/**
 * Marks a native `<li>` as an item of a `<tedi-footer-list>`.
 */
@Directive({
  standalone: true,
  selector: "li[tedi-footer-list-item]",
  host: { class: "tedi-footer-list__item" },
})
export class FooterListItemDirective {}
