import { Directive, TemplateRef, inject } from "@angular/core";

/**
 * Context provided to custom option templates.
 */
export interface SelectOptionContext<T = unknown> {
  /** The option item data */
  $implicit: T;
  /** The option item data (explicit reference) */
  item: T;
  /** Index of the option in the list */
  index: number;
  /** Whether this option is currently selected */
  selected: boolean;
  /** Whether this option is disabled */
  disabled: boolean;
}

/**
 * Context provided to custom value templates (for displaying selected value in trigger).
 */
export interface SelectValueContext<T = unknown> {
  /** The selected item data */
  $implicit: T;
  /** The selected item data (explicit reference) */
  item: T;
  /** The label string for the selected item */
  label: string;
}

/**
 * Directive for custom option template rendering in the dropdown.
 *
 * @example
 * ```html
 * <tedi-select [options]="options">
 *   <ng-template tediSelectOption let-item>
 *     <div class="custom-option">
 *       <strong>{{ item.title }}</strong>
 *       <span>{{ item.description }}</span>
 *     </div>
 *   </ng-template>
 * </tedi-select>
 * ```
 */
@Directive({
  selector: "[tediSelectOption]",
  standalone: true,
})
export class SelectOptionTemplateDirective<T = unknown> {
  template = inject<TemplateRef<SelectOptionContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: SelectOptionTemplateDirective<T>,
    _ctx: unknown,
  ): _ctx is SelectOptionContext<T> {
    return true;
  }
}

/**
 * Directive for custom value template rendering (selected value display in trigger).
 * Used for single-select to display custom content like colors, icons, etc.
 *
 * @example
 * ```html
 * <tedi-select [options]="colors" bindLabel="name" bindValue="id">
 *   <ng-template tediSelectValue let-item>
 *     <div class="color-swatch" [style.background]="item.color"></div>
 *   </ng-template>
 * </tedi-select>
 * ```
 */
@Directive({
  selector: "[tediSelectValue]",
  standalone: true,
})
export class SelectValueTemplateDirective<T = unknown> {
  template = inject<TemplateRef<SelectValueContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: SelectValueTemplateDirective<T>,
    _ctx: unknown,
  ): _ctx is SelectValueContext<T> {
    return true;
  }
}

/**
 * Directive for custom tooltip content next to the label. Use when the tooltip
 * needs formatting the plain `tooltip` string input cannot express (bold,
 * italic, links). Takes precedence over the `tooltip` input.
 *
 * @example
 * ```html
 * <tedi-select [options]="options" label="Ravim">
 *   <ng-template tediSelectTooltip>
 *     Vali <b>toimeaine</b>, mitte ravimi nimi.
 *   </ng-template>
 * </tedi-select>
 * ```
 */
@Directive({
  selector: "[tediSelectTooltip]",
  standalone: true,
})
export class SelectTooltipTemplateDirective {
  template = inject<TemplateRef<unknown>>(TemplateRef);
}
