import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ViewEncapsulation,
} from "@angular/core";
import { DROPDOWN_CONTENT_API } from "../dropdown.tokens";

/**
 * A line between groups of dropdown items. Exposed as a `separator` in a
 * `menu`; a `listbox` or `list` allows no such child, so there it is hidden
 * from assistive technology and stays purely visual.
 */
@Component({
  selector: "li[tedi-dropdown-separator]",
  standalone: true,
  template: "",
  styleUrl: "./dropdown-separator.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-dropdown-separator",
    "[attr.role]": "isMenu() ? 'separator' : 'none'",
    "[attr.aria-hidden]": "isMenu() ? null : 'true'",
  },
})
export class DropdownSeparatorComponent {
  private readonly dropdownContent = inject(DROPDOWN_CONTENT_API);

  readonly isMenu = computed(
    () => this.dropdownContent.dropdownRole() === "menu",
  );
}
