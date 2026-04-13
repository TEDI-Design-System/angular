import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";

export type RadioSize = "default" | "large";

@Component({
  standalone: true,
  selector: "input[type=radio][tedi-radio]",
  template: "",
  styleUrl: "./radio.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-radio--large]": "size() === 'large'",
    "[class.tedi-radio--invalid]": "invalid()",
  },
})
export class RadioComponent {
  /**
   * Size of the radio.
   * @default default
   */
  readonly size = input<RadioSize>("default");
  /**
   * Is radio invalid?
   * @default false
   */
  readonly invalid = input(false);
}
