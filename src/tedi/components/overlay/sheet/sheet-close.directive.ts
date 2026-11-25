import { Directive, inject } from "@angular/core";
import { SheetComponent } from "./sheet.component";

/** Closes the surrounding `<tedi-sheet>` on click, e.g. from a footer button. */
@Directive({
  standalone: true,
  selector: "[tediSheetClose]",
  host: {
    "(click)": "sheet.close()",
  },
})
export class SheetCloseDirective {
  protected readonly sheet = inject(SheetComponent);
}
