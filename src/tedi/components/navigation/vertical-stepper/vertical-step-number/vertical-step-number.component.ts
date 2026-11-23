import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";

export type VerticalStepNumberType =
  "default" | "success" | "danger" | "selected" | "disabled";

/**
 * Numbered step circle used by the steppers. Display only: it carries no
 * semantics, so the surrounding control names the step and its status.
 */
@Component({
  selector: "tedi-vertical-step-number",
  template: "{{ number() }}",
  styleUrl: "./vertical-step-number.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-vertical-step-number",
    "[class.tedi-vertical-step-number--default]": "type() === 'default'",
    "[class.tedi-vertical-step-number--success]": "type() === 'success'",
    "[class.tedi-vertical-step-number--danger]": "type() === 'danger'",
    "[class.tedi-vertical-step-number--selected]": "type() === 'selected'",
    "[class.tedi-vertical-step-number--disabled]": "type() === 'disabled'",
  },
})
export class VerticalStepNumberComponent {
  /**
   * Step number shown in the circle.
   */
  number = input.required<number | string>();
  /**
   * Visual state.
   * @default "default"
   */
  type = input<VerticalStepNumberType>("default");
}
