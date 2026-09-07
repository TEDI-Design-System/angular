import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { CheckboxComponent } from "../../../form/checkbox/checkbox.component";

export type DropdownItemValueType = "default" | "checkbox" | "radio";
export type DropdownItemValueLayout = "horizontal" | "vertical";

@Component({
  selector: "tedi-dropdown-item-value",
  templateUrl: "./dropdown-item-value.component.html",
  styleUrl: "./dropdown-item-value.component.scss",
  standalone: true,
  imports: [CheckboxComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-dropdown-item-value",
    "[class.tedi-dropdown-item-value--vertical]": "layout() === 'vertical'",
    "[class.tedi-dropdown-item-value--horizontal]": "layout() === 'horizontal'",
    "[class.tedi-dropdown-item-value--checkbox]": "type() === 'checkbox'",
    "[class.tedi-dropdown-item-value--radio]": "type() === 'radio'",
  },
})
export class DropdownItemValueComponent {
  /**
   * Type of item value - controls selection indicator
   * - 'default': No selection indicator
   * - 'checkbox': Shows checkbox (for multiselect)
   * - 'radio': Shows radio button (for single select listbox)
   * @default 'default'
   */
  readonly type = input<DropdownItemValueType>("default");

  /**
   * Layout: 'horizontal' (side-by-side) or 'vertical' (stacked)
   * @default 'horizontal'
   */
  readonly layout = input<DropdownItemValueLayout>("horizontal");

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
