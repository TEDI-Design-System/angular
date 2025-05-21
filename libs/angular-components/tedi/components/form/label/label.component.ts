import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from "@angular/core";

export type LabelSize = "small" | "default";

@Component({
  selector: "label[tedi-label]",
  templateUrl: "./label.component.html",
  styleUrl: "./label.component.scss",
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  classes = computed(() => {
    const classList = ["tedi-label"];

    if (this.size() === "small") {
      classList.push("tedi-label--small");
    }

    return classList.join(" ");
  });
}
