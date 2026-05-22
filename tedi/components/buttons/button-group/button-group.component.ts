import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  output,
  ViewEncapsulation,
} from "@angular/core";
import { ButtonGroupItemDirective } from "./button-group-item/button-group-item.directive";
import {
  Breakpoint,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
import { IconComponent } from "../../base/icon/icon.component";
import { DropdownComponent } from "../../overlay/dropdown/dropdown.component";
import { DropdownTriggerDirective } from "../../overlay/dropdown/dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "../../overlay/dropdown/dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../../overlay/dropdown/dropdown-item/dropdown-item.component";
import { TediTranslationService } from "../../../services/translation/translation.service";

export type ButtonGroupVariant = "primary" | "secondary";
export type ButtonGroupSize = "default" | "small";
export type ButtonGroupDropdownLabelMode = "selected" | "static";

@Component({
  selector: "tedi-button-group",
  standalone: true,
  imports: [
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
   * Visual style of the group, controlling colors and selected-state treatment.
   * @default primary
   */
  readonly variant = input<ButtonGroupVariant>("primary");

  /**
   * Size of the buttons inside the group.
   * @default default
   */
  readonly size = input<ButtonGroupSize>("default");

  /**
   * When true, items share the available horizontal space equally.
   * When false, items size to their content. Below the `mobileBreakpoint`,
   * items always stretch to fill the row.
   * @default false
   */
  readonly stretch = input(false, { transform: booleanAttribute });

  /**
   * Accessible name for the group. Required if there is no visible heading
   * labelling the group.
   */
  readonly ariaLabel = input<string>();

  /**
   * When true, the strip collapses into a dropdown menu below
   * `mobileBreakpoint`.
   * @default false
   */
  readonly enableMobileDropdown = input(false, { transform: booleanAttribute });

  /**
   * Viewport breakpoint at which the strip switches to a dropdown
   * (requires `enableMobileDropdown`).
   * @default md
   */
  readonly mobileBreakpoint = input<Breakpoint>("md");

  /**
   * Label rendered inside the dropdown trigger when the group collapses on
   * mobile. Falls back to the `buttonGroup.menu` translation.
   */
  readonly dropdownLabel = input<string>();

  /**
   * Source for the dropdown trigger label.
   * - `static` (default) — always show `dropdownLabel`.
   * - `selected` — show the selected item's label, falling back to `dropdownLabel`.
   * @default static
   */
  readonly dropdownLabelMode = input<ButtonGroupDropdownLabelMode>("static");

  /**
   * Emits the `id` of the item that the user activated.
   */
  readonly selectionChange = output<string>();

  protected readonly items = contentChildren(
    forwardRef(() => ButtonGroupItemDirective),
  );

  private readonly breakpointService = inject(BreakpointService);
  private readonly translations = inject(TediTranslationService);

  private readonly isBelowMobile = this.breakpointService.isBelowBreakpoint(
    this.mobileBreakpoint,
  );

  protected readonly isDropdownMode = computed(
    () => this.enableMobileDropdown() && this.isBelowMobile(),
  );

  protected readonly selectedItem = computed(() =>
    this.items().find((item) => item.selected()),
  );

  protected readonly triggerLabel = computed(() => {
    const fallback =
      this.dropdownLabel() ?? this.translations.translate("buttonGroup.menu");
    if (this.dropdownLabelMode() === "static") return fallback;
    return this.selectedItem()?.label() ?? fallback;
  });

  protected readonly triggerIcon = computed(() => {
    const selected = this.selectedItem();
    return selected?.iconLeft() ?? selected?.icon() ?? "menu";
  });

  protected readonly hostClasses = computed(() => {
    const list = ["tedi-button-group", `tedi-button-group--${this.variant()}`];
    if (this.stretch()) list.push("tedi-button-group--stretch");
    if (this.isDropdownMode()) list.push("tedi-button-group--dropdown-mode");
    return list.join(" ");
  });

  /** @internal Called by ButtonGroupItemDirective on click. */
  emitSelection(id: string) {
    this.selectionChange.emit(id);
  }

  protected onDropdownItemClick(item: ButtonGroupItemDirective) {
    if (item.disabled()) return;
    this.emitSelection(item.id());
  }
}
