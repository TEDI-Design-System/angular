import { Directive, inject } from "@angular/core";
import { SheetComponent } from "./sheet.component";

/** Opens and closes the surrounding `<tedi-sheet>` on click. */
@Directive({
  standalone: true,
  selector: "[tediSheetTrigger]",
  host: {
    "aria-haspopup": "dialog",
    "[attr.aria-expanded]": "sheet.open()",
    "[attr.aria-controls]": "sheet.open() ? sheet.panelId : null",
    "(click)": "sheet.toggle()",
  },
})
export class SheetTriggerDirective {
  protected readonly sheet = inject(SheetComponent);
}
