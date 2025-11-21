import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
} from "@angular/core";
import { DropdownComponent } from "../dropdown.component";

@Directive({
  standalone: true,
  selector: "[tedi-dropdown-trigger]",
  host: {
    "[attr.id]": "dropdown.containerId() + '_trigger'",
    "[attr.aria-controls]": "dropdown.containerId()",
    "[attr.aria-expanded]": "dropdown.floatUiComponent().state",
    "[attr.aria-haspopup]": "'menu'",
    "[attr.role]": "isButton ? null : 'button'",
    "[attr.tabindex]": "isButton ? null : '0'",
  },
})
export class DropdownTriggerDirective {
  readonly ariaHaspopup = input<"menu" | "listbox" | "true">("menu");

  readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly dropdown = inject(DropdownComponent);

  get isButton(): boolean {
    return this.host.nativeElement.tagName === "BUTTON";
  }

  @HostListener("click")
  onClick() {
    this.dropdown.toggleDropdown();
  }

  @HostListener("keydown", ["$event"])
  onKeydown(event: KeyboardEvent) {
    const key = event.key;

    switch (key) {
      case "ArrowDown":
        event.preventDefault();
        this.openAndFocusFirst();
        break;

      case "ArrowUp":
        event.preventDefault();
        this.openAndFocusLast();
        break;

      case "Escape":
        event.preventDefault();
        this.dropdown.hideDropdown();
        this.host.nativeElement.focus();
        break;
    }
  }

  private openAndFocusFirst() {
    if (!this.dropdown.floatUiComponent().state) {
      this.dropdown.showDropdown();
    }
    this.dropdown.focusFirstItem?.();
  }

  private openAndFocusLast() {
    if (!this.dropdown.floatUiComponent().state) {
      this.dropdown.showDropdown();
    }
    this.dropdown.focusLastItem?.();
  }
}
