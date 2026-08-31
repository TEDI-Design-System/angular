import { Directive } from "@angular/core";

/**
 * Marker directive applied to a projected child of `<tedi-header-role>` to mark it
 * as the title content (e.g. a `<tedi-tag>`). The directive itself adds no DOM or
 * behavior — it only exists so `HeaderRoleComponent` can detect, via `contentChild`,
 * whether a consumer has projected title content. When projected, the title slot
 * replaces the bold `role` string fallback.
 *
 * @example
 * <tedi-header-role [representatives]="..." [currentRepresentative]="...">
 *   <tedi-tag tedi-header-role-title>Esindatav</tedi-tag>
 * </tedi-header-role>
 */
@Directive({
  selector: "[tedi-header-role-title]",
  standalone: true,
})
export class HeaderRoleTitleDirective {}
