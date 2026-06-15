import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  ElementRef,
  forwardRef,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { DropdownItemComponent } from "../dropdown-item/dropdown-item.component";
import { DROPDOWN_API, DROPDOWN_CONTENT_API } from "../dropdown.tokens";

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
    "[attr.aria-labelledby]": "containerId() + '_trigger'",
  },
  providers: [
    {
      provide: DROPDOWN_CONTENT_API,
      useExisting: forwardRef(() => DropdownContentComponent),
    },
  ],
})
export class DropdownContentComponent {
  /**
   * Role for content, use listbox for list and menu for actions
   * @default menu
   */
  readonly dropdownRole = input<DropdownRole>("menu");

  readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly dropdownApi = inject(DROPDOWN_API);
  readonly containerId = computed(() => this.dropdownApi.containerId());
  readonly items = contentChildren(DropdownItemComponent);
}
