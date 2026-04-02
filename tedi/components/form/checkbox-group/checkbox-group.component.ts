import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { TextComponent } from "../../base/text/text.component";

export type CheckboxGroupDirection = "horizontal" | "vertical";

@Component({
  standalone: true,
  imports: [TextComponent],
  selector: "tedi-checkbox-group",
  templateUrl: "./checkbox-group.component.html",
  styleUrl: "./checkbox-group.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-checkbox-group",
  },
})
export class CheckboxGroupComponent {
  /**
   * Label text displayed above the checkbox group.
   */
  readonly label = input<string>();
  /**
   * Layout direction of the checkboxes.
   * @default horizontal
   */
  readonly direction = input<CheckboxGroupDirection>("horizontal");
}
