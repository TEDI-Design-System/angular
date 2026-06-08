import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  ViewEncapsulation,
} from "@angular/core";
import {
  DROPDOWN_API,
  DROPDOWN_CONTENT_API,
  DropdownApi,
  DropdownContentApi,
} from "../dropdown.tokens";
import { DropdownItemValueComponent } from "../dropdown-item-value/dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "../dropdown-item-value/dropdown-item-value-label.component";

@Component({
  selector: "li[tedi-dropdown-item]",
  standalone: true,
  imports: [DropdownItemValueComponent, DropdownItemValueLabelComponent],
  templateUrl: "./dropdown-item.component.html",
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

  /**
   * Whether selecting this item closes the dropdown. Set `false` for items
   * that should keep the dropdown open after selection (e.g. multi-select
   * checkboxes).
   * @default true
   */
  readonly closeOnSelect = input(true);

  /**
   * Fires when the item is activated via click or keyboard (Enter / Space).
   * Use to react to selection without depending on click event ordering with
   * the host's built-in `onClick` handler.
   */
  readonly itemSelect = output<void>();

  readonly host = inject<ElementRef<HTMLLIElement>>(ElementRef);
  readonly dropdown = inject<DropdownApi>(DROPDOWN_API);
  readonly dropdownContent = inject<DropdownContentApi>(DROPDOWN_CONTENT_API);

  /** Check if custom dropdown-item-value is provided */
  readonly customItemValue = contentChild(DropdownItemValueComponent);

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
        this.dropdown.dropdownTrigger()?.focus();
        break;
    }
  }

  private onItemSelect() {
    if (this.dropdownContent.dropdownRole() === "listbox") {
      this.dropdown.value.set(this.value());
    }

    this.itemSelect.emit();

    if (!this.closeOnSelect()) return;

    this.dropdown.hideDropdown();
    this.dropdown.dropdownTrigger()?.focus();
  }
}
