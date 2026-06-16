import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  model,
  output,
  ViewEncapsulation,
} from "@angular/core";
import { ButtonGroupButtonDirective } from "./button-group-button/button-group-button.directive";
import {
  Breakpoint,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
import {
  ButtonComponent,
  ButtonSize,
  ButtonVariant,
} from "../button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { DropdownComponent } from "../../overlay/dropdown/dropdown.component";
import { DropdownTriggerDirective } from "../../overlay/dropdown/dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "../../overlay/dropdown/dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../../overlay/dropdown/dropdown-item/dropdown-item.component";
import { TediTranslationService } from "../../../services/translation/translation.service";

export type ButtonGroupDropdownLabelMode = "selected" | "static";

@Component({
  selector: "tedi-button-group",
  standalone: true,
  imports: [
    ButtonComponent,
    IconComponent,
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemComponent,
  ],
  templateUrl: "./button-group.component.html",
  styleUrl: "./button-group.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "hostClasses()",
    "[attr.role]": "isDropdownMode() ? null : 'group'",
    "[attr.aria-label]": "ariaLabel() || null",
  },
})
export class ButtonGroupComponent {
  /**
   * Variant applied to every item button (each item may override via its own
   * `variant`). Accepts the full `ButtonVariant` union. Only the
   * `*-button-group` variants get the connected/segmented strip geometry; other
   * variants keep their own radius and show their active colors when selected.
   * @default primary-button-group
   */
  readonly variant = input<ButtonVariant>("primary-button-group");

  /**
   * Size applied to every item button.
   * @default default
   */
  readonly size = input<ButtonSize>("default");

  /**
   * When true, multiple items can be toggled on and `value` is a string array.
   * @default false
   */
  readonly multiple = input(false, { transform: booleanAttribute });

  /**
   * Selected value(s). A single `string` (or `undefined`) in single mode, a
   * `string[]` in `multiple` mode. Two-way bindable via `[(value)]`.
   */
  readonly value = model<string | string[]>();

  /**
   * Variant for the mobile dropdown trigger. When unset, it is derived from
   * `variant`: `primary-button-group` → `primary`, `secondary-button-group` →
   * `secondary`, and any other variant is used as-is.
   */
  readonly dropdownTriggerVariant = input<ButtonVariant>();

  /**
   * When true, items share the available horizontal space equally.
   * @default false
   */
  readonly stretch = input(false, { transform: booleanAttribute });

  /** Accessible name for the group. Required if no visible heading labels it. */
  readonly ariaLabel = input<string>();

  /**
   * When true, the strip collapses into a dropdown below `mobileBreakpoint`.
   * @default false
   */
  readonly enableMobileDropdown = input(false, { transform: booleanAttribute });

  /**
   * Viewport breakpoint at which the strip switches to a dropdown.
   * @default md
   */
  readonly mobileBreakpoint = input<Breakpoint>("md");

  /** Label for the dropdown trigger. Falls back to the `buttonGroup.menu` translation. */
  readonly dropdownLabel = input<string>();

  /**
   * Source for the dropdown trigger label.
   * - `static` (default) — always show `dropdownLabel`.
   * - `selected` — show the selected item's label (single mode only).
   * @default static
   */
  readonly dropdownLabelMode = input<ButtonGroupDropdownLabelMode>("static");

  /** Emits the value of the item the user toggled. */
  readonly selectionChange = output<string>();

  protected readonly items = contentChildren(
    forwardRef(() => ButtonGroupButtonDirective),
  );

  private readonly breakpointService = inject(BreakpointService);
  private readonly translations = inject(TediTranslationService);

  private readonly isBelowMobile = this.breakpointService.isBelowBreakpoint(
    this.mobileBreakpoint,
  );

  protected readonly isDropdownMode = computed(
    () => this.enableMobileDropdown() && this.isBelowMobile(),
  );

  readonly triggerVariant = computed<ButtonVariant>(() => {
    const explicit = this.dropdownTriggerVariant();
    if (explicit) return explicit;
    const variant = this.variant();
    switch (variant) {
      case "primary-button-group":
        return "primary";
      case "secondary-button-group":
        return "secondary";
      default:
        return variant;
    }
  });

  protected readonly selectedItem = computed(() =>
    this.items().find((item) => item.selected()),
  );

  protected readonly triggerLabel = computed(() => {
    const fallback =
      this.dropdownLabel() ?? this.translations.translate("buttonGroup.menu");
    if (this.dropdownLabelMode() === "static" || this.multiple()) return fallback;
    return this.selectedItem()?.label() ?? fallback;
  });

  protected readonly triggerIcon = computed(() => {
    const selected = this.selectedItem();
    return selected?.iconLeft() ?? selected?.icon() ?? "menu";
  });

  protected readonly hostClasses = computed(() => {
    const list = ["tedi-button-group"];
    if (this.stretch()) list.push("tedi-button-group--stretch");
    if (this.isDropdownMode()) list.push("tedi-button-group--dropdown-mode");
    return list.join(" ");
  });

  /** Whether `value` is currently selected. */
  isSelected(value: string): boolean {
    const current = this.value();
    if (this.multiple()) {
      return Array.isArray(current) && current.includes(value);
    }
    return current === value;
  }

  /** Toggles `value` in the selection and emits `selectionChange`. */
  toggle(value: string) {
    if (this.multiple()) {
      const current = Array.isArray(this.value())
        ? [...(this.value() as string[])]
        : [];
      const index = current.indexOf(value);
      if (index >= 0) {
        current.splice(index, 1);
      } else {
        current.push(value);
      }
      this.value.set(current);
    } else {
      this.value.set(this.value() === value ? undefined : value);
    }
    this.selectionChange.emit(value);
  }

  protected onDropdownItemClick(item: ButtonGroupButtonDirective) {
    if (item.disabled()) return;
    this.toggle(item.value());
  }
}
