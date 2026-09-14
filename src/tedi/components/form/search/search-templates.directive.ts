import { Directive, TemplateRef, inject } from "@angular/core";

/**
 * Context passed to a custom suggestion row template.
 */
export interface SearchSuggestionContext<T = unknown> {
  $implicit: T;
  item: T;
  index: number;
  /** Resolved display label, via `bindLabel`. */
  label: string;
  /** Current trimmed field value, for custom match highlighting. */
  query: string;
}

/**
 * Renders each suggestion row. Without it, rows show the resolved label with the
 * matched substring bolded.
 *
 * @example
 * ```html
 * <tedi-search [suggestions]="people" bindLabel="name">
 *   <ng-template tediSearchSuggestion let-item>
 *     <span tedi-text modifiers="bold">{{ item.name }}</span>
 *     <span tedi-text color="tertiary">{{ item.code }}</span>
 *   </ng-template>
 * </tedi-search>
 * ```
 */
@Directive({
  selector: "[tediSearchSuggestion]",
  standalone: true,
})
export class SearchSuggestionTemplateDirective<T = unknown> {
  template = inject<TemplateRef<SearchSuggestionContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: SearchSuggestionTemplateDirective<T>,
    _ctx: unknown,
  ): _ctx is SearchSuggestionContext<T> {
    return true;
  }
}

/**
 * Extra content pinned below the suggestions — fallback actions and a hint, for
 * example. It shows whenever the panel is open, including the no-results state,
 * which is what makes it useful for "nothing matched, try this instead".
 *
 * Suggestions keep behaving exactly as they do without it: filtering, arrow-key
 * navigation and Enter to select are unchanged. Tab moves from the field into the
 * footer's controls.
 *
 * @example
 * ```html
 * <tedi-search [suggestions]="matches()">
 *   <ng-template tediSearchFooter>
 *     <tedi-search-footer-actions>
 *       <button tedi-button variant="secondary">Isik teadmata</button>
 *     </tedi-search-footer-actions>
 *   </ng-template>
 * </tedi-search>
 * ```
 */
@Directive({
  selector: "[tediSearchFooter]",
  standalone: true,
})
export class SearchFooterTemplateDirective {
  template = inject<TemplateRef<unknown>>(TemplateRef);
}
