import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";

export type CheckboxSize = "default" | "large";

@Component({
  standalone: true,
  selector: "input[type=checkbox][tedi-checkbox]",
  template: "",
  styleUrl: "./checkbox.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-checkbox--large]": "size() === 'large'",
    "[class.tedi-checkbox--invalid]": "invalid()",
  },
})
export class CheckboxComponent {
  /**
   * Size of the checkbox.
   * @default default
   */
  readonly size = input<CheckboxSize>("default");
  /**
   * Is checkbox invalid?
   * @default false
   */
  readonly invalid = input(false);
}
