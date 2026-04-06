import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { TextComponent } from "../../base/text/text.component";

export type RadioGroupDirection = "horizontal" | "vertical";

@Component({
  standalone: true,
  imports: [TextComponent],
  selector: "tedi-radio-group",
  templateUrl: "./radio-group.component.html",
  styleUrl: "./radio-group.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-radio-group",
  },
})
export class RadioGroupComponent {
  /**
   * Label text displayed above the radio group.
   */
  readonly label = input<string>();
  /**
   * Layout direction of the radios.
   * @default horizontal
   */
  readonly direction = input<RadioGroupDirection>("horizontal");
}
