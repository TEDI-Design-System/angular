import {
  Directive,
  ElementRef,
  Renderer2,
  afterRenderEffect,
  computed,
  inject,
  input,
} from "@angular/core";

export type PrintBreak =
  "auto" | "avoid" | "avoid-column" | "avoid-page" | "avoid-region";

export type PrintVisibility = "show" | "hide";

/**
 * Applies the print helper classes from `@tedi-design-system/core` to the host element.
 */
@Directive({
  selector: "[tediPrint]",
  standalone: true,
})
export class PrintDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);

  /**
   * Controls the visibility of the element when printing.
   * - `'hide'` — the element is not printed.
   * - `'show'` — the element opts out of a `no-print` applied to the same
   *   element. It cannot reveal an element that an ancestor hid.
   *
   * Leave empty when only the break inputs are needed — the `tediPrint`
   * attribute still has to be present for the directive to apply.
   */
  tediPrint = input<PrintVisibility | "">("");
  /**
   * Determines how page, column, or region breaks behave before the element.
   * Uses the CSS `break-before` property values.
   */
  breakBefore = input<PrintBreak>();
  /**
   * Determines how page, column, or region breaks behave after the element.
   * Uses the CSS `break-after` property values.
   */
  breakAfter = input<PrintBreak>();
  /**
   * Determines how page, column, or region breaks behave inside the element.
   * Uses the CSS `break-inside` property values.
   */
  breakInside = input<PrintBreak>();

  private readonly classes = computed(() => {
    const visibility = this.tediPrint();
    const breakBefore = this.breakBefore();
    const breakAfter = this.breakAfter();
    const breakInside = this.breakInside();

    return [
      visibility === "hide" && "no-print",
      visibility === "show" && "show-print",
      breakBefore && `break-before-${breakBefore}`,
      breakAfter && `break-after-${breakAfter}`,
      breakInside && `break-inside-${breakInside}`,
    ].filter((className): className is string => !!className);
  });

  constructor() {
    /** Classes this directive added itself and is therefore allowed to remove. */
    let owned: string[] = [];

    /**
     * Classes are synced through Renderer2 rather than host bindings so the
     * directive never fights the element's own classes. A host binding takes
     * precedence over a component's `[class]` binding and would strip classes
     * that component set — e.g. the `no-print` that buttons and links apply to
     * themselves. Here a class that is already on the element is left alone:
     * the directive only removes what it added.
     */
    afterRenderEffect(() => {
      const next = this.classes();
      const element = this.elementRef.nativeElement;

      for (const className of owned) {
        if (!next.includes(className)) {
          this.renderer.removeClass(element, className);
        }
      }

      owned = next.filter((className) => {
        if (element.classList.contains(className)) {
          return owned.includes(className);
        }

        this.renderer.addClass(element, className);
        return true;
      });
    });
  }
}
