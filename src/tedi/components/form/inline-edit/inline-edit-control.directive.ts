import { Directive, TemplateRef, inject } from "@angular/core";

/**
 * Marks the template holding the control that `tedi-inline-edit` swaps in when
 * the value is clicked. The template is only instantiated while editing, so the
 * control is created on entry and destroyed on exit.
 *
 * The projected control keeps its own value binding and accessible label.
 * Configure exit keys for the control (for example, disable closeOnEnter for
 * a textarea). Overlays must be linked through aria-controls or aria-owns.
 *
 * @example
 * ```html
 * <tedi-inline-edit [displayValue]="name()" label="Name">
 *   <ng-template tediInlineEditControl>
 *     <input tedi-text-field [(ngModel)]="name" aria-label="Name" />
 *   </ng-template>
 * </tedi-inline-edit>
 * ```
 */
@Directive({
  selector: "[tediInlineEditControl]",
  standalone: true,
})
export class InlineEditControlDirective {
  template = inject<TemplateRef<unknown>>(TemplateRef);
}

/**
 * Marks an optional template that renders the read view, for values a plain
 * string cannot express — tags for a multiselect, a status badge, a formatted
 * date. Without it the read view shows `displayValue`.
 *
 * @example
 * ```html
 * <tedi-inline-edit [displayValue]="status.label" label="Olek">
 *   <ng-template tediInlineEditValue>
 *     <tedi-status-badge [color]="status.color" [text]="status.label" />
 *   </ng-template>
 *   <ng-template tediInlineEditControl>…</ng-template>
 * </tedi-inline-edit>
 * ```
 */
@Directive({
  selector: "[tediInlineEditValue]",
  standalone: true,
})
export class InlineEditValueDirective {
  template = inject<TemplateRef<unknown>>(TemplateRef);
}
