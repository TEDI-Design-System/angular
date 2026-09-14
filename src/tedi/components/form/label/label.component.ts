import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { TediTranslationPipe } from "../../../services";
import { TEDI_FIELD_CONTEXT } from "../form-field/field-context.token";

export type LabelSize = "small" | "default";
export type LabelColor = "primary" | "secondary";
export type LabelVisuallyHidden = boolean | "reserve-space";

@Component({
  selector: "[tedi-label]",
  templateUrl: "./label.component.html",
  styleUrl: "./label.component.scss",
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TediTranslationPipe],
  host: {
    "[class]": "classes()",
  },
})
export class LabelComponent {
  private readonly field = inject(TEDI_FIELD_CONTEXT, { optional: true });

  /**
   * Size of the label. Falls back to the size of a wrapping `tedi-form-field`,
   * so the label and the control scale together without being set twice.
   * @default default
   */
  size = input<LabelSize | undefined>();

  readonly resolvedSize = computed<LabelSize>(() => {
    const own = this.size();
    if (own) return own;

    return this.field?.size() === "small" ? "small" : "default";
  });
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
  /**
   * Hides the label visually while keeping it in the accessibility tree, so the
   * control it names stays named. `"reserve-space"` also keeps the label's line
   * of layout, to align the field with labelled siblings in the same row.
   * @default false
   */
  visuallyHidden = input<LabelVisuallyHidden>(false);

  classes = computed(() => {
    const classList = ["tedi-label", `tedi-label--${this.color()}`];

    if (this.resolvedSize() === "small") {
      classList.push("tedi-label--small");
    }

    const visuallyHidden = this.visuallyHidden();
    if (visuallyHidden === "reserve-space") {
      classList.push("tedi-label--reserve-space");
    } else if (visuallyHidden) {
      classList.push("sr-only");
    }

    return classList.join(" ");
  });
}
