import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from "@angular/core";

import { IconComponent, IconSize } from "../../../base/icon/icon.component";

@Component({
  standalone: true,
  selector: "button[tedi-table-header-button]",
  imports: [IconComponent],
  template:
    '<ng-content /><tedi-icon [name]="icon()" [variant]="iconVariant()" color="inherit" [size]="iconSize()" />',
  styleUrl: "./table-header-button.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    type: "button",
    class: "tedi-table-header-button",
    "[class.tedi-table-header-button--selected]": "selected()",
    "[disabled]": "disabled() || null",
    "[attr.aria-label]": "ariaLabel() || null",
  },
})
export class TediTableHeaderButtonComponent {
  /** Material icon name rendered inside the button. */
  readonly icon = input.required<string>();

  /**
   * Render the icon's "filled" variant.
   * @default false
   */
  readonly filled = input(false, { transform: booleanAttribute });

  /**
   * Paint the icon in the brand colour to indicate an active sort/filter.
   * @default false
   */
  readonly selected = input(false, { transform: booleanAttribute });

  /**
   * Disabled state.
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Size of the icon, in pixels.
   * @default 18
   */
  readonly iconSize = input<IconSize>(18);

  /**
   * Accessible name override. Optional when visible text is projected into the
   * button — the projected text already serves as the accessible name. Required
   * for icon-only usage (e.g. filter triggers) where no visible label exists.
   */
  readonly ariaLabel = input<string | undefined>(undefined, {
    alias: "aria-label",
  });

  protected readonly iconVariant = computed(() =>
    this.filled() ? "filled" : "outlined",
  );
}
