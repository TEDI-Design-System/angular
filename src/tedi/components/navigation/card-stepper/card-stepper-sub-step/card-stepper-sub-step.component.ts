import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  ViewEncapsulation,
} from "@angular/core";

/**
 * Progress state. `informative` marks a sub-step someone else completes, such as
 * an official; it renders as secondary text. Use the separate `disabled` input to
 * prevent navigation.
 */
export type CardStepperSubStepState =
  "default" | "completed" | "error" | "informative";

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
   * Excludes the sub-step from navigation and renders it as disabled.
   * @default false
   */
  disabled = input(false, { transform: booleanAttribute });
  /**
   * Emits when the sub-step is picked in the step list, which then closes.
   * Disabled and informative sub-steps render as text and cannot be picked.
   */
  subStepSelect = output<void>();
}
