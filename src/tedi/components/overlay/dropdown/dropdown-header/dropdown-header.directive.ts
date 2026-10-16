import { Directive, ElementRef, inject } from "@angular/core";
import { DROPDOWN_API } from "../dropdown.tokens";
import { getFocusableElements } from "../../../../utils/elements.util";

/**
 * Content above the items, such as a search field that filters them. It is not
 * part of the `menu` / `listbox`, so its controls keep their own roles and keys.
 *
 * When it holds a focusable control, opening the dropdown focuses that control;
 * ArrowDown moves to the first item, ArrowUp on the first item comes back, and
 * Escape or Shift+Tab closes the dropdown and returns focus to the trigger.
 */
@Directive({
  selector: "[tedi-dropdown-header]",
  standalone: true,
  host: {
    class: "tedi-dropdown-header",
    "(keydown)": "onKeydown($event)",
  },
})
export class DropdownHeaderDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly dropdown = inject(DROPDOWN_API);

  /** Focuses the first focusable control. Returns whether there was one. */
  focus(): boolean {
    const target = getFocusableElements(this.host.nativeElement)[0];
    target?.focus();
    return !!target;
  }

  onKeydown(event: KeyboardEvent) {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.dropdown.focusFirstItem();
        break;

      case "Escape":
        event.preventDefault();
        this.dropdown.closeAndFocusTrigger();
        break;

      case "Tab":
        if (!event.shiftKey) break;
        event.preventDefault();
        this.dropdown.closeAndFocusTrigger();
        break;
    }
  }
}
