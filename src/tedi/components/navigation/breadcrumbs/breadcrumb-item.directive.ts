import { Directive, TemplateRef, inject } from "@angular/core";

/**
 * Marks a projected element as a single breadcrumb. Apply as a structural
 * directive on the crumb element; `tedi-breadcrumbs` collects each one and
 * renders it into the trail, inserting separators between them.
 *
 * Use a link (e.g. `a tedi-link`) for navigable crumbs and a plain element
 * (e.g. `span`) for the current page — add `aria-current="page"` to it yourself.
 */
@Directive({
  selector: "[tediBreadcrumbItem]",
  standalone: true,
})
export class BreadcrumbItemDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
