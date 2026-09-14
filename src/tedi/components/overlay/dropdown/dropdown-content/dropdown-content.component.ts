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
import {
  DROPDOWN_API,
  DROPDOWN_CONTENT_API,
  DropdownRole,
} from "../dropdown.tokens";

export type { DropdownRole };

@Component({
  selector: "tedi-dropdown-content",
  standalone: true,
  templateUrl: "./dropdown-content.component.html",
  styleUrl: "./dropdown-content.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-dropdown-content",
    role: "presentation",
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
   * How the panel is exposed to assistive technology: `menu` for actions,
   * `listbox` for selectable options, `list` for a plain list of links.
   *
   * `menu` and `listbox` are composite widgets, so the panel is a single tab
   * stop with arrow-key navigation and the items carry `menuitem` / `option`.
   * `list` is not a widget: it adds no item roles and no key handling, so
   * projected links keep the link role and each one is its own tab stop. A
   * panel of navigation links belongs in `list`, because a widget role would
   * replace the link role and screen readers would stop announcing them as
   * links. The `role="list"` it puts on the `ul` is redundant on paper but not
   * in Safari, which drops list semantics from a list with no marker.
   * @default menu
   */
  readonly dropdownRole = input<DropdownRole>("menu");

  readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly dropdownApi = inject(DROPDOWN_API);
  readonly containerId = computed(() => this.dropdownApi.containerId());
  readonly items = contentChildren(DropdownItemComponent);

  readonly isWidget = computed(() => this.dropdownRole() !== "list");
}
