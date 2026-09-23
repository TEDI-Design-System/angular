import { Directive, input } from "@angular/core";

@Directive({
  selector: "[tediFilterPrepend]",
  standalone: true,
})
export class FilterPrependDirective {
  /**
   * Whether to hide the prepend content when the filter is selected.
   * When true, the prepend is replaced by a check icon on selection.
   * @default true
   */
  readonly hideWhenSelected = input(true);
}
