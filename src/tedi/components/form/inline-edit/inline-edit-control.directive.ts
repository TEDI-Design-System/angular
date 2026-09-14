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
