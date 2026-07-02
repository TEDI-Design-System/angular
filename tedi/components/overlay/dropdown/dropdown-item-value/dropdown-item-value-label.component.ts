import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  selector: "tedi-dropdown-item-value-label",
  template: `<ng-content />`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-dropdown-item-value__label",
    "[class.tedi-dropdown-item-value__label--no-clip]": "!clipContent()",
  },
})
export class DropdownItemValueLabelComponent {
  /**
   * Whether the label clips overflowing content for text ellipsis. Set `false`
   * when the label holds content with decorations that intentionally sit
   * outside the line box (e.g. status indicator), so they are not cut off.
   * @default true
   */
  readonly clipContent = input(true);
}
