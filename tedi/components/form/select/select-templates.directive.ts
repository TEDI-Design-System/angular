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
 * Context provided to custom label templates (for displaying selected value).
 */
export interface SelectLabelContext<T = unknown> {
  /** The selected item (single select) or items (multiple select) */
  $implicit: T | T[];
  /** The selected item(s) */
  item: T | T[];
  /** Function to clear a specific item (for multiple select) */
  clear: (item: T) => void;
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
    ctx: unknown
  ): ctx is SelectOptionContext<T> {
    return true;
  }
}

/**
 * Directive for custom label template rendering (selected value display).
 *
 * @example
 * ```html
 * <tedi-select [options]="options">
 *   <ng-template tediSelectLabel let-item>
 *     <span class="custom-label">{{ item.name }} ({{ item.code }})</span>
 *   </ng-template>
 * </tedi-select>
 * ```
 */
@Directive({
  selector: "[tediSelectLabel]",
  standalone: true,
})
export class SelectLabelTemplateDirective<T = unknown> {
  template = inject<TemplateRef<SelectLabelContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _dir: SelectLabelTemplateDirective<T>,
    ctx: unknown
  ): ctx is SelectLabelContext<T> {
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
    ctx: unknown
  ): ctx is SelectValueContext<T> {
    return true;
  }
}
