import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { DropdownItemComponent } from "../dropdown-item/dropdown-item.component";
import { DropdownComponent } from "../dropdown.component";

export type DropdownRole = "menu" | "listbox";

@Component({
  selector: "tedi-dropdown-content",
  standalone: true,
  templateUrl: "./dropdown-content.component.html",
  styleUrl: "./dropdown-content.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: "presentation",
    "[attr.aria-labelledby]": "dropdown.containerId() + '_trigger'",
  },
})
export class DropdownContentComponent {
  /**
   * Role for content, use listbox for list and menu for actions
   * @default menu
   */
  readonly dropdownRole = input<DropdownRole>("menu");

  readonly dropdown = inject(DropdownComponent);
  readonly items = contentChildren(DropdownItemComponent);
}
