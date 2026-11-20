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
import { CardStepperSubStepComponent } from "../card-stepper-sub-step/card-stepper-sub-step.component";
import { CardStepperStepContentDirective } from "./card-stepper-step-content.directive";

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
   * Step title, shown as the card heading while the step is active.
   */
  title = input.required<string>();
  /**
   * Secondary text on the card and below the title in the step-list modal.
   */
  description = input<string>();
  /**
   * Completed progress state, independent of `disabled`. Takes precedence over
   * `error`.
   * @default false
   */
  completed = input(false, { transform: booleanAttribute });
  /**
   * Error progress state, independent of `disabled`.
   * @default false
   */
  error = input(false, { transform: booleanAttribute });
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
  opened = input(undefined, {
    transform: (v: unknown) => (v == null ? undefined : booleanAttribute(v)),
  });

  readonly subSteps = contentChildren(CardStepperSubStepComponent, {
    descendants: false,
  });
  readonly content = contentChild(CardStepperStepContentDirective);

  readonly hasSelectedSubStep = computed(() =>
    this.subSteps().some((subStep) => subStep.selected()),
  );
  /** @internal Completed wins over error, as in `tedi-vertical-stepper-item`. */
  readonly progressState = computed(() =>
    this.completed() ? "completed" : this.error() ? "error" : "default",
  );
}
