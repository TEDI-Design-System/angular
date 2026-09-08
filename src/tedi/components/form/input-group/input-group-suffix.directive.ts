import { Directive } from "@angular/core";
import { InputGroupAddonDirective } from "./input-group-addon.directive";

/**
 * Marks an element as the suffix (trailing) addon of a `tedi-input-group`.
 * Applied to any element, e.g. `<span tediInputGroupSuffix>EUR</span>` or a
 * wrapper around a button/dropdown.
 */
@Directive({
  selector: "[tediInputGroupSuffix]",
  standalone: true,
  host: {
    class: "tedi-input-group__suffix",
    "[class.tedi-input-group__suffix--text]": "isText()",
    "[attr.aria-disabled]": "disabled() || null",
  },
})
export class InputGroupSuffixDirective extends InputGroupAddonDirective {}
