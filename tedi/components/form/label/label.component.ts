import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { TediTranslationPipe } from "../../../services";

export type LabelSize = "small" | "default";
export type LabelColor = "primary" | "secondary";

@Component({
  selector: "label[tedi-label]",
  templateUrl: "./label.component.html",
  styleUrl: "./label.component.scss",
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TediTranslationPipe
  ],
  host: {
    "[class]": "classes()",
  },
})
export class LabelComponent {
  /**
   * Size of the label.
   * @default default
   */
  size = input<LabelSize>("default");
  /**
   * Whether label is required.
   * @default false
   */
  required = input<boolean>(false);
  /**
   * Color of the label.
   * @default secondary
   */
  color = input<LabelColor>("secondary");

  classes = computed(() => {
    const classList = ["tedi-label", `tedi-label--${this.color()}`];

    if (this.size() === "small") {
      classList.push("tedi-label--small");
    }

    return classList.join(" ");
  });
}
