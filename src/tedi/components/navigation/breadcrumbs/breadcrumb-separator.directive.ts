import { Directive, TemplateRef, inject } from "@angular/core";

/**
 * Optional custom separator for `tedi-breadcrumbs`. Provide as a template to
 * render arbitrary content between crumbs; takes precedence over the
 * `separator` string input and the default chevron icon.
 */
@Directive({
  selector: "[tediBreadcrumbSeparator]",
  standalone: true,
})
export class BreadcrumbSeparatorDirective {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
