import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  ElementRef,
  forwardRef,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { DropdownItemComponent } from "../dropdown-item/dropdown-item.component";
import { DropdownHeaderDirective } from "../dropdown-header/dropdown-header.directive";
import {
  DROPDOWN_API,
  DROPDOWN_CONTENT_API,
  DropdownRole,
  DropdownVariant,
} from "../dropdown.tokens";

export type { DropdownRole, DropdownVariant };

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
    "[class.tedi-dropdown-content--divided]": "divided()",
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
   * in Safari, which drops list semantics from a list with no marker. A `list`
   * panel also renders in the dropdown's own place in the DOM rather than at the
   * end of `<body>`, so it keeps its place in reading order for the screen
   * readers that navigate by DOM order instead of by `Tab`.
   * @default menu
   */
  readonly dropdownRole = input<DropdownRole>("menu");

  /**
   * Draws a line between every item. For lines between groups only, use
   * `li[tedi-dropdown-separator]` instead.
   * @default false
   */
  readonly divided = input(false);

  /**
   * Visual variant. `tree` draws connector lines from indented items
   * (`indent`) to their parent; mark a parent sitting on the line with
   * `isParent`.
   * @default default
   */
  readonly variant = input<DropdownVariant>("default");

  readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly dropdownApi = inject(DROPDOWN_API);
  readonly containerId = computed(() => this.dropdownApi.containerId());
  readonly items = contentChildren(DropdownItemComponent);
  readonly header = contentChild(DropdownHeaderDirective);

  readonly isWidget = computed(() => this.dropdownRole() !== "list");

  /** A listbox of checkbox items allows more than one selected option. */
  readonly multiselectable = computed(
    () =>
      this.dropdownRole() === "listbox" &&
      this.items().some((item) => item.checkable()?.type === "checkbox"),
  );
}
