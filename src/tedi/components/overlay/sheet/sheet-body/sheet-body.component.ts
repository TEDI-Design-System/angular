import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { CdkScrollable } from "@angular/cdk/scrolling";
import { SheetComponent } from "../sheet.component";

export type SheetBodyPadding = "default" | "none";

/** Sheet body. Scrolls when its content is taller than the sheet. */
@Component({
  standalone: true,
  selector: "tedi-sheet-body",
  template: "<ng-content />",
  styleUrl: "../sheet.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [CdkScrollable],
  host: {
    class: "tedi-sheet-body",
    "[class.tedi-sheet-body--no-padding]": "padding() === 'none'",
    "[hidden]": "sheet.collapsed()",
  },
})
export class SheetBodyComponent {
  /**
   * Use `none` for content that brings its own padding, e.g. tabs or a full-width list.
   * @default default
   */
  readonly padding = input<SheetBodyPadding>("default");

  protected readonly sheet = inject(SheetComponent);
}
