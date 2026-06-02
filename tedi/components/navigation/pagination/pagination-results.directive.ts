import { Directive, inject, TemplateRef } from "@angular/core";

/**
 * Marker / template directive that lets consumers fully replace the default
 * "X results" label inside `<tedi-pagination>`. Supports two forms:
 *
 * - **Attribute on an element** — works inside `<tedi-pagination>` directly.
 *   The pagination component picks the marked element up via content
 *   projection.
 *
 *   ```html
 *   <tedi-pagination [pageCount]="10" [totalItems]="1000">
 *     <span tediPaginationResults>1000+ tulemust</span>
 *   </tedi-pagination>
 *   ```
 *
 * - **On an `<ng-template>`** — required when used inside a wrapper component
 *   like `<tedi-table>` that needs to forward the slot through to its inner
 *   pagination instance(s). The wrapper captures `this.template` and renders
 *   it via `*ngTemplateOutlet`.
 *
 *   ```html
 *   <tedi-table [pagination]="opts">
 *     <ng-template tediPaginationResults>1000+ kirjet</ng-template>
 *   </tedi-table>
 *   ```
 */
@Directive({
  selector: "[tediPaginationResults]",
  standalone: true,
})
export class TediPaginationResultsDirective {
  /**
   * Set when the directive is placed on an `<ng-template>`. Wrapper components
   * (e.g. `<tedi-table>`) read it to render the slot via `*ngTemplateOutlet`.
   * `null` when the directive is used as an attribute on a regular element —
   * in that case content projection handles the rendering.
   */
  readonly template = inject<TemplateRef<unknown>>(TemplateRef, {
    optional: true,
  });
}
