import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { SheetComponent } from "../sheet.component";

export type SheetFooterAlign = "left" | "center" | "right";

/**
 * Sheet footer. Add `tedi-sheet-footer-end` to the elements that should sit
 * at the end edge, e.g. an overflow menu button; the rest then align to the start.
 */
@Component({
  standalone: true,
  selector: "tedi-sheet-footer",
  template: "<ng-content />",
  styleUrl: "../sheet.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "'tedi-sheet-footer tedi-sheet-footer--' + align()",
    "[class.tedi-sheet-footer--full-width]": "fullWidth()",
    "[hidden]": "sheet.collapsed()",
  },
})
export class SheetFooterComponent {
  /**
   * Placement of the actions. Ignored when an element has `tedi-sheet-footer-end`.
   * @default left
   */
  readonly align = input<SheetFooterAlign>("left");

  /**
   * Stretch the actions to share the footer width equally. Elements with
   * `tedi-sheet-footer-end` keep their own width.
   * @default false
   */
  readonly fullWidth = input(false, { transform: booleanAttribute });

  protected readonly sheet = inject(SheetComponent);
}
