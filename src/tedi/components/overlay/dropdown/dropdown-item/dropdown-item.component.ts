import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  Renderer2,
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

const INTERACTIVE_CONTENT_SELECTOR = "a[href], button";

@Component({
  selector: "li[tedi-dropdown-item]",
  standalone: true,
  imports: [DropdownItemValueComponent, DropdownItemValueLabelComponent],
  templateUrl: "./dropdown-item.component.html",
  styleUrl: "./dropdown-item.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[attr.role]": "hostRole()",
    "[attr.aria-selected]": "hostAriaSelected()",
    "[attr.aria-disabled]": "hostAriaDisabled()",
    "[attr.tabindex]": "hostTabindex()",
  },
})
export class DropdownItemComponent {
  /** Item value */
  readonly value = input<string>();

  /** Is item disabled? */
  readonly disabled = input(false);

  /**
   * Whether the projected content is itself the interactive control, e.g. a
   * button. In a `menu` or `listbox` the item role and the roving tabindex then
   * move onto that element instead of the host `li`, so assistive technology
   * reports one control per item and the control keeps its own activation
   * behaviour.
   *
   * A widget role replaces the control's own role, so a projected link stops
   * being announced as a link. For navigation links use
   * `dropdownRole="list"` instead, where this input is not needed: a plain list
   * adds no roles, and the links stay links and stay in the tab order.
   * @default false
   */
  readonly interactiveContent = input(false);

  /**
   * Whether the item's label clips overflowing content (for text ellipsis).
   * Set `false` when projecting content with decorations that intentionally
   * sit outside the line box, e.g. status indicator.
   * @default true
   */
  readonly clipContent = input(true);

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

  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);

  private control: HTMLElement | null = null;

  constructor() {
    this.destroyRef.onDestroy(
      this.renderer.listen(
        this.host.nativeElement,
        "click",
        (event: MouseEvent) => {
          if (!this.disabled()) return;

          event.preventDefault();
          event.stopPropagation();
        },
        { capture: true },
      ),
    );

    afterRenderEffect(() => {
      const control = this.controlElement();
      if (!control) return;

      if (this.disabled()) {
        control.setAttribute("aria-disabled", "true");
      } else {
        control.removeAttribute("aria-disabled");
      }

      // A plain `list` assigns no role, so the control keeps the semantics it
      // came with and a link is still announced as a link.
      const role = this.itemRole();
      if (!role) return;

      control.setAttribute("role", role);

      // The control carries `role="option"` in a listbox, so the selection
      // state has to travel with it instead of staying on the presentational
      // host `li`.
      if (this.dropdownContent.dropdownRole() === "listbox") {
        control.setAttribute("aria-selected", String(this.isSelected()));
      } else {
        control.removeAttribute("aria-selected");
      }
    });
  }

  /** The widget role for this item, or `null` in a plain `list`. */
  itemRole(): "menuitem" | "option" | null {
    switch (this.dropdownContent.dropdownRole()) {
      case "menu":
        return "menuitem";
      case "listbox":
        return "option";
      default:
        return null;
    }
  }

  hostRole() {
    if (!this.dropdownContent.isWidget()) return null;

    return this.controlOwnsSemantics() ? "none" : this.itemRole();
  }

  hostAriaSelected() {
    if (this.controlOwnsSemantics()) return null;

    return this.dropdownContent.dropdownRole() === "listbox"
      ? this.isSelected()
      : null;
  }

  hostAriaDisabled() {
    if (this.controlOwnsSemantics()) return null;

    return this.disabled() ? "true" : null;
  }

  hostTabindex() {
    if (this.controlOwnsSemantics()) return null;

    switch (this.dropdownContent.dropdownRole()) {
      case "menu":
        return "-1";
      default:
        return this.disabled() ? null : "-1";
    }
  }

  /**
   * Whether the item's ARIA state and focus belong on the projected control
   * rather than the host `li`. Always true in a plain `list`, where the
   * projected control is what the item is.
   */
  private controlOwnsSemantics() {
    return this.interactiveContent() || !this.dropdownContent.isWidget();
  }

  isSelected() {
    return this.dropdown.value() === this.value();
  }

  /**
   * The element that carries the item's role, roving tabindex and focus: the
   * projected control when it owns the item's semantics, the host `li`
   * otherwise.
   */
  focusTarget(): HTMLElement {
    return this.controlElement() ?? this.host.nativeElement;
  }

  focus() {
    this.focusTarget().focus();
  }

  setTabindex(value: string | null) {
    const element = this.focusTarget();

    if (value === null) {
      element.removeAttribute("tabindex");
    } else {
      element.setAttribute("tabindex", value);
    }
  }

  private controlElement(): HTMLElement | null {
    if (!this.controlOwnsSemantics()) return null;

    this.control ??= this.host.nativeElement.querySelector<HTMLElement>(
      INTERACTIVE_CONTENT_SELECTOR,
    );

    return this.control;
  }

  @HostListener("click")
  onClick() {
    // Clicks on a disabled item are already cancelled during capture.
    if (this.disabled()) return;

    this.onItemSelect();
  }

  // Disabled items keep `aria-disabled` (and a roving tabindex in menus) so they
  // stay discoverable, but they must not take focus on a mouse press: that focus
  // would otherwise trigger mouse-focus styling on a non-interactive item.
  @HostListener("mousedown", ["$event"])
  onMousedown(event: MouseEvent) {
    if (this.disabled()) event.preventDefault();
  }

  @HostListener("keydown", ["$event"])
  onKeydown(event: KeyboardEvent) {
    // A plain `list` is not a composite widget: arrow keys, Enter and Space
    // belong to the projected control, and the panel takes Escape and Tab.
    if (!this.dropdownContent.isWidget()) return;

    const key = event.key;

    if (this.disabled()) {
      event.preventDefault();
      return;
    }

    if (this.handleActivationKey(event)) return;

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

      case "Escape":
        event.preventDefault();
        this.dropdown.hideDropdown();
        this.dropdown.dropdownTrigger()?.focus();
        break;

      case "Tab":
        event.preventDefault();
        this.dropdown.tabOutOfDropdown(event.shiftKey);
        break;
    }
  }

  /** Returns whether the key was an activation key and has been dealt with. */
  private handleActivationKey(event: KeyboardEvent): boolean {
    if (event.key === "Enter") {
      // An interactive item's control activates itself, and preventing the
      // default would swallow a link's navigation. The resulting click bubbles
      // here and closes the dropdown.
      if (!this.controlOwnsSemantics()) {
        event.preventDefault();
        this.onItemSelect();
      }

      return true;
    }

    if (event.key !== " ") return false;

    event.preventDefault();

    if (this.controlOwnsSemantics()) {
      this.controlElement()?.click();
    } else {
      this.onItemSelect();
    }

    return true;
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
