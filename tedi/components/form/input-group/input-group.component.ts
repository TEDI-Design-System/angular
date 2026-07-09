import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  forwardRef,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { InputGroupPrefixDirective } from "./input-group-prefix.directive";
import { InputGroupSuffixDirective } from "./input-group-suffix.directive";
import { InputGroupContext, TEDI_INPUT_GROUP } from "./input-group.token";

/**
 * A flexible wrapper that composes a form control with leading/trailing addons
 * (prefix/suffix). Project a `label[tedi-label]` for the label, a control
 * (`tedi-form-field`, `tedi-select`, …) as the input, optional
 * `[tediInputGroupPrefix]` / `[tediInputGroupSuffix]` addons, and a
 * `tedi-feedback-text` for helper/error messages.
 */
@Component({
  selector: "tedi-input-group",
  standalone: true,
  templateUrl: "./input-group.component.html",
  styleUrl: "./input-group.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: TEDI_INPUT_GROUP,
      useExisting: forwardRef(() => InputGroupComponent),
    },
  ],
  host: {
    class: "tedi-input-group",
    role: "group",
    "[class.tedi-input-group--addons]": "addons()",
    "[class.tedi-input-group--has-prefix]": "prefix()",
    "[class.tedi-input-group--has-suffix]": "suffix()",
    "[class.tedi-input-group--disabled]": "disabled()",
    "[class.tedi-input-group--invalid]": "invalid()",
    "[attr.aria-disabled]": "disabled() || null",
  },
})
export class InputGroupComponent implements InputGroupContext {
  /**
   * Merges the borders and radii of the addons and the control into a single
   * visual unit. Disable when using addons that should stay detached, e.g. a
   * standalone action button.
   * @default true
   */
  addons = input<boolean>(true);
  /**
   * Disables the whole group. Greys out the addons and propagates the disabled
   * state to the wrapped control.
   * @default false
   */
  disabled = input<boolean>(false);
  /**
   * Marks the whole group as invalid. Applies the error border to the addons
   * and propagates `invalid` to the wrapped control. Pair with an error
   * `tedi-feedback-text`.
   * @default false
   */
  invalid = input<boolean>(false);

  protected readonly prefix = contentChild(InputGroupPrefixDirective);
  protected readonly suffix = contentChild(InputGroupSuffixDirective);
}
