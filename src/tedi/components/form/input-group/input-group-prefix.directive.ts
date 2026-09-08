import { Directive } from "@angular/core";
import { InputGroupAddonDirective } from "./input-group-addon.directive";

/**
 * Marks an element as the prefix (leading) addon of a `tedi-input-group`.
 * Applied to any element, e.g. `<span tediInputGroupPrefix>Street</span>` or a
 * wrapper around a button/dropdown.
 */
@Directive({
  selector: "[tediInputGroupPrefix]",
  standalone: true,
  host: {
    class: "tedi-input-group__prefix",
    "[class.tedi-input-group__prefix--text]": "isText()",
    "[attr.aria-disabled]": "disabled() || null",
  },
})
export class InputGroupPrefixDirective extends InputGroupAddonDirective {}
