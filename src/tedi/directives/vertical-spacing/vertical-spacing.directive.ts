import { computed, Directive, input } from "@angular/core";

export type VerticalSpacingSize =
  0 | 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2 | 2.5 | 3 | 4 | 5;

@Directive({
  selector: "[tediVerticalSpacing]",
  standalone: true,
  host: {
    class: "tedi-vertical-spacing",
    "[style.--vertical-spacing-internal]": "spacingValue()",
  },
})
export class VerticalSpacingDirective {
  tediVerticalSpacing = input<VerticalSpacingSize>(0);

  readonly spacingValue = computed(() => `${this.tediVerticalSpacing()}em`);
}
