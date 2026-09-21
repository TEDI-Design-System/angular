import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  ViewEncapsulation,
} from "@angular/core";
import type { VerticalStepperLabelElement } from "../../vertical-stepper/vertical-stepper-item/vertical-stepper-item.component";
import type { VerticalStepperSubItemState } from "../../vertical-stepper/vertical-stepper-sub-item/vertical-stepper-sub-item.component";

/**
 * Progress state. Use the separate `disabled` input to prevent navigation.
 */
export type CardStepperSubStepState = Exclude<
  VerticalStepperSubItemState,
  "disabled"
>;

/**
 * Sub-step configuration for the step-list modal; renders no content itself.
 */
@Component({
  selector: "tedi-card-stepper-sub-step",
  template: "",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardStepperSubStepComponent {
  /**
   * Sub-step label.
   */
  label = input.required<string>();
  /**
   * Progress state shown in the step-list modal.
   * @default "default"
   */
  state = input<CardStepperSubStepState>("default");
  /**
   * Marks the sub-step as the one the user is on.
   * @default false
   */
  current = input(false, { transform: booleanAttribute });
  /**
   * Link destination in the modal. See `labelAs` for element overrides.
   */
  href = input<string>();
  /**
   * Excludes the sub-step from navigation and renders it as disabled.
   * @default false
   */
  disabled = input(false, { transform: booleanAttribute });
  /**
   * Label element in the step list. Defaults to a link with `href`, otherwise text.
   * Use `"button"` with `subStepSelect` for an action without a link.
   * Disabled and informative sub-steps always render as text.
   */
  labelAs = input<VerticalStepperLabelElement>();

  /**
   * Emits when the sub-step link or button is activated. Also closes the list.
   */
  subStepSelect = output<void>();
}
