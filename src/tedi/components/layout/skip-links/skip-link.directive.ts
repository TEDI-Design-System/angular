import { Directive, TemplateRef, inject } from "@angular/core";

/**
 * Marks a projected link as a skip link. Its `href` should point to the `id` of an element on the page.
 */
@Directive({
  selector: "[tediSkipLink]",
  standalone: true,
})
export class SkipLinkDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
