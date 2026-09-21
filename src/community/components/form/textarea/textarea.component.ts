import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { InputComponent } from "../input/input.component";

/**
 * @deprecated Use the TEDI-Ready `TextareaComponent` from
 * `@tedi-design-system/angular/tedi` instead. Same `textarea[tedi-textarea]`
 * selector, but the API differs: the `resizeX`/`resizeY` booleans are replaced
 * by a single `resizable` boolean (only vertical resizing is supported), and
 * the field is composed inside a `<tedi-form-field>` wrapper. The TEDI-Ready
 * version also adds `autoGrow`, `minRows`, `maxRows`, `height`, and `maxHeight`.
 */
@Component({
  selector: "[tedi-textarea]",
  standalone: true,
  template: "<ng-content />",
  styleUrls: ["../input/input.component.scss", "./textarea.component.scss"],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-textarea]": "true",
    "[class.tedi-textarea--resizeX]": "this.resizeX()",
    "[class.tedi-textarea--resizeY]": "this.resizeY()",
  },
})
export class TextareaComponent extends InputComponent {
  /**
   * Whether the textarea should be resizable in the X direction.
   * @default false
   */
  resizeX = input(false);
  /**
   * Whether the textarea should be resizable in the Y direction.
   * @default true
   */
  resizeY = input(true);
}
