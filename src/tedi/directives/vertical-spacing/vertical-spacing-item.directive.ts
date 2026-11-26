import { computed, Directive, input } from "@angular/core";
import type { VerticalSpacingSize } from "./vertical-spacing.directive";

@Directive({
  selector: "[tediVerticalSpacingItem]",
  standalone: true,
  host: {
    class: "tedi-vertical-spacing__item",
    "[style.--vertical-spacing-internal]": "spacingValue()",
  },
})
export class VerticalSpacingItemDirective {
  tediVerticalSpacingItem = input<VerticalSpacingSize>(0);

  readonly spacingValue = computed(() => `${this.tediVerticalSpacingItem()}em`);
}
