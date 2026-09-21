import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  input,
  ViewEncapsulation,
} from "@angular/core";
import type { VerticalStepperItemState } from "../../vertical-stepper/vertical-stepper-item/vertical-stepper-item.component";
import { CardStepperSubStepComponent } from "../card-stepper-sub-step/card-stepper-sub-step.component";
import { CardStepperStepContentDirective } from "./card-stepper-step-content.directive";

/**
 * Progress state. Use the separate `disabled` input to exclude a step from
 * arrow and list navigation.
 */
export type CardStepperStepState = Exclude<
  VerticalStepperItemState,
  "disabled"
>;

/**
 * Step configuration read by `tedi-card-stepper`; renders no content itself.
 */
@Component({
  selector: "tedi-card-stepper-step",
  template: "",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardStepperStepComponent {
  /**
   * Step label, shown as the card heading while the step is active.
   */
  label = input.required<string>();
  /**
   * Secondary text on the card and below the label in the step-list modal.
   */
  description = input<string>();
  /**
   * Progress state shown in the step-list modal and by the status icon. Use the
   * `disabled` input to exclude a step from arrow and list navigation.
   * @default "default"
   */
  state = input<CardStepperStepState>("default");
  /**
   * Remove the step from the stepper's own navigation: the arrows skip it and
   * the step list renders it as non-selectable. Setting `activeStep` to it
   * still works, so the app can place the user here deliberately — the arrows
   * then navigate away from it as usual.
   * @default false
   */
  disabled = input(false, { transform: booleanAttribute });
  /**
   * Whether this step's sub-steps start expanded in the modal. Defaults to
   * expanded for the active step.
   */
  expanded = input(undefined, { transform: booleanAttribute });

  readonly subSteps = contentChildren(CardStepperSubStepComponent, {
    descendants: false,
  });
  readonly content = contentChild(CardStepperStepContentDirective);

  readonly hasCurrentSubStep = computed(() =>
    this.subSteps().some((subStep) => subStep.current()),
  );
}
