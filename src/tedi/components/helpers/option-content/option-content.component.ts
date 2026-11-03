import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { CheckboxComponent } from "../../form/checkbox/checkbox.component";
import {
  IconColor,
  IconComponent,
  IconSize,
  IconType,
  IconVariant,
} from "../../base/icon/icon.component";

export type OptionContentType = "default" | "checkbox" | "radio";
export type OptionContentLayout = "horizontal" | "vertical";

export interface OptionContentIcon {
  name: string;
  size?: IconSize;
  color?: IconColor;
  type?: IconType;
  variant?: IconVariant;
}

@Component({
  selector: "tedi-option-content",
  templateUrl: "./option-content.component.html",
  styleUrl: "./option-content.component.scss",
  standalone: true,
  imports: [CheckboxComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-option-content",
    "[class.tedi-option-content--vertical]": "layout() === 'vertical'",
    "[class.tedi-option-content--horizontal]": "layout() === 'horizontal'",
    "[class.tedi-option-content--checkbox]": "type() === 'checkbox'",
    "[class.tedi-option-content--radio]": "type() === 'radio'",
  },
})
export class OptionContentComponent {
  /**
   * Type of option content - controls selection indicator
   * - 'default': No selection indicator
   * - 'checkbox': Shows checkbox (for multiselect)
   * - 'radio': Shows radio button (for single select listbox)
   * @default 'default'
   */
  readonly type = input<OptionContentType>("default");

  /**
   * Layout: 'horizontal' (side-by-side) or 'vertical' (stacked)
   * @default 'horizontal'
   */
  readonly layout = input<OptionContentLayout>("horizontal");

  /**
   * Whether the item is selected (controls checkbox/radio state)
   * @default false
   */
  readonly selected = input<boolean>(false);

  /**
   * Whether the checkbox is in indeterminate state
   * @default false
   */
  readonly indeterminate = input<boolean>(false);

  /**
   * Whether the item is disabled
   * @default false
   */
  readonly disabled = input<boolean>(false);

  /**
   * Leading icon: a Material Symbols name, or an object to override its size,
   * colour, type or variant. Rendered at 16px in the secondary colour; it
   * follows the item's text colour on hover, active, selected and disabled.
   * For anything custom, project a `tedi-icon` instead.
   */
  readonly icon = input<string | OptionContentIcon>();

  readonly resolvedIcon = computed(() => {
    const icon = this.icon();
    if (!icon) return null;
    const { name, ...options } =
      typeof icon === "string" ? { name: icon } : icon;
    return {
      size: 16 as IconSize,
      color: "secondary" as IconColor,
      ...options,
      name,
    };
  });

  /**
   * The checkbox/radio only pictures the item's state — the item itself owns the
   * interaction. Cancelling the default action keeps the browser from toggling the
   * indicator on its own, which would leave it showing the opposite of `selected`.
   * The click is left to bubble, so hitting the indicator selects the item just
   * like hitting anywhere else on it.
   */
  onIndicatorClick(event: MouseEvent): void {
    event.preventDefault();
  }
}
