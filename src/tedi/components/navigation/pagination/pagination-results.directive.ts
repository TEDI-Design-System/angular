import { Directive } from "@angular/core";

/**
 * Marker directive that lets consumers fully replace the default
 * "X results" label inside `<tedi-pagination>`.
 *
 * @example
 * ```html
 * <tedi-pagination [pageCount]="10" [totalItems]="1000">
 *   <span tediPaginationResults>1000+ tulemust</span>
 * </tedi-pagination>
 * ```
 */
@Directive({
  selector: "[tediPaginationResults]",
  standalone: true,
})
export class TediPaginationResultsDirective {}
