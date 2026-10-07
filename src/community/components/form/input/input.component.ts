import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { warnDeprecated } from "@tedi-design-system/angular/tedi";

export type InputSize = "small" | "default";
export type InputState = "valid" | "error" | "default";

/**
 * @deprecated Use TextField from TEDI-ready instead. This component will be removed from future versions.
 */
@Component({
  selector: "[tedi-input]",
  standalone: true,
  template: "<ng-content />",
  styleUrl: "./input.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-input]": "true",
    "[class]": "modifierClasses()",
  },
})
export class InputComponent {
  /**
   * Size of the input.
   * @default default
   */
  size = input<InputSize>("default");

  /**
   * State of the input.
   * @default default
   */
  state = input<InputState>("default");

  modifierClasses = computed(() => {
    const modifiers = [];
    if (this.size()) modifiers.push(`tedi-input--${this.size()}`);
    if (this.state()) modifiers.push(`tedi-input--${this.state()}`);
    return modifiers.join(" ");
  });

  constructor() {
    if (new.target !== InputComponent) return;
    warnDeprecated(
      "Community [tedi-input]",
      "Use TextField from TEDI-ready instead.",
    );
  }
}
