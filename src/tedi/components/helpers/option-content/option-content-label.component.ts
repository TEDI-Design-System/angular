import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  selector: "tedi-option-content-label",
  template: `<ng-content />`,
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-option-content__label",
    "[class.tedi-option-content__label--no-clip]": "!clipContent()",
  },
})
export class OptionContentLabelComponent {
  /**
   * Cuts a label too long for the item off with an ellipsis; `false` lets it
   * wrap and keeps decorations outside the line box, such as a status
   * indicator, visible.
   * @default true
   */
  readonly clipContent = input(true);
}
