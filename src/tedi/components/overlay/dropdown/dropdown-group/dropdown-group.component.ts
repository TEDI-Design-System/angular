import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { DROPDOWN_CONTENT_API } from "../dropdown.tokens";
import { generateUUID } from "../../../../helpers/generate-uuid";

/**
 * A titled group of `li[tedi-dropdown-item]`s, placed straight inside it; the
 * title also names the group for screen readers.
 */
@Component({
  selector: "tedi-dropdown-group",
  standalone: true,
  templateUrl: "./dropdown-group.component.html",
  styleUrl: "./dropdown-group.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-dropdown-group",
    // In a plain `list` the host is the list's item, since a `ul` holds it directly.
    "[attr.role]": "isWidget() ? null : 'listitem'",
  },
})
export class DropdownGroupComponent {
  /** Title above the group's items, also used as the group's accessible name. */
  readonly label = input.required<string>();

  private readonly dropdownContent = inject(DROPDOWN_CONTENT_API);
  readonly isWidget = computed(() => this.dropdownContent.isWidget());
  readonly titleId = `tedi-dropdown-group-${generateUUID()}`;
}
