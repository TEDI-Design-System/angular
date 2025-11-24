import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { DropdownComponent } from "../dropdown.component";
import { DropdownContentComponent } from "../dropdown-content/dropdown-content.component";

@Component({
  selector: "li[tedi-dropdown-item]",
  standalone: true,
  template: "<ng-content />",
  styleUrl: "./dropdown-item.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[attr.role]":
      "dropdownContent.dropdownRole() === 'menu' ? 'menuitem' : 'option'",
    "[attr.aria-selected]":
      "dropdownContent.dropdownRole() === 'listbox' ? isSelected() : null",
    "[attr.aria-disabled]": "disabled() ? 'true' : null",
    "[tabindex]":
      "dropdownContent.dropdownRole() === 'menu' ? '-1' : (disabled() ? null : '-1')",
  },
})
export class DropdownItemComponent {
  /** Item value */
  readonly value = input<string>();

  /** Is item disabled? */
  readonly disabled = input(false);

  readonly host = inject<ElementRef<HTMLLIElement>>(ElementRef);
  readonly dropdown = inject(DropdownComponent);
  readonly dropdownContent = inject(DropdownContentComponent);

  isSelected() {
    return this.dropdown.value() === this.value();
  }

  focus() {
    this.host.nativeElement.focus();
  }

  @HostListener("click")
  onClick() {
    if (this.disabled()) return;

    this.onItemSelect();
  }

  @HostListener("keydown", ["$event"])
  onKeydown(event: KeyboardEvent) {
    const key = event.key;

    if (this.disabled()) {
      event.preventDefault();
      return;
    }

    switch (key) {
      case "ArrowDown":
        event.preventDefault();
        this.dropdown.focusNextItem(this.host.nativeElement);
        break;

      case "ArrowUp":
        event.preventDefault();
        this.dropdown.focusPrevItem(this.host.nativeElement);
        break;

      case "Home":
        event.preventDefault();
        this.dropdown.focusFirstItem();
        break;

      case "End":
        event.preventDefault();
        this.dropdown.focusLastItem();
        break;

      case "Enter":
      case " ":
        event.preventDefault();
        this.onItemSelect();
        break;

      case "Escape":
        event.preventDefault();
        this.dropdown.hideDropdown();
        this.dropdown.dropdownTrigger()?.host.nativeElement.focus();
        break;
    }
  }

  private onItemSelect() {
    if (this.dropdownContent.dropdownRole() === "listbox") {
      this.dropdown.value.set(this.value());
    }

    this.dropdown.hideDropdown();
    this.dropdown.dropdownTrigger()?.host.nativeElement.focus();
  }
}
