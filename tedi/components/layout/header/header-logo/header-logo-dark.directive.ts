import { Directive } from "@angular/core";

/**
 * Marks a projected child of `<tedi-header-logo>` as the dark-theme variant.
 * `HeaderLogoComponent` detects it via `contentChild` and swaps to the dark
 * slot when the active theme is `dark`.
 */
@Directive({
  selector: "[tediHeaderLogoDark]",
  standalone: true,
})
export class HeaderLogoDarkDirective {}
