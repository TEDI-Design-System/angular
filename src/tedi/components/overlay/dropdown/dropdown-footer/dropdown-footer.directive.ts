import { Directive, ElementRef, inject } from "@angular/core";
import { DROPDOWN_API } from "../dropdown.tokens";
import {
  focusFirstFocusable,
  getFocusableElements,
} from "../../../../utils/elements.util";

/**
 * Content below the items, such as a "Log out" button, outside the menu and the
 * scrolling items; Tab from an item or ArrowDown from the last item moves to it.
 */
@Directive({
  selector: "[tedi-dropdown-footer]",
  standalone: true,
  host: {
    class: "tedi-dropdown-footer",
    "(keydown)": "onKeydown($event)",
  },
})
export class DropdownFooterDirective {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly dropdown = inject(DROPDOWN_API);

  /** Focuses the first focusable control. Returns whether there was one. */
  focus(): boolean {
    return focusFirstFocusable(this.host.nativeElement);
  }

  onKeydown(event: KeyboardEvent) {
    const focusables = this.focusables();

    switch (event.key) {
      // Back to the items only when there is an active one to go to, e.g. not in
      // a plain `list`; otherwise the key stays with the browser.
      case "ArrowUp":
        if (this.dropdown.focusActiveItem()) event.preventDefault();
        break;

      case "Escape":
        event.preventDefault();
        this.dropdown.closeAndFocusTrigger();
        break;

      case "Tab":
        if (event.shiftKey && event.target === focusables[0]) {
          if (this.dropdown.focusActiveItem()) event.preventDefault();
        } else if (!event.shiftKey && event.target === focusables.at(-1)) {
          event.preventDefault();
          this.dropdown.tabOutOfDropdown(false);
        }
        break;
    }
  }

  private focusables(): HTMLElement[] {
    return getFocusableElements(this.host.nativeElement);
  }
}
