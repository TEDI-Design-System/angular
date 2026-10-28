import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  ViewEncapsulation,
} from "@angular/core";

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
   * Sub-step title.
   */
  title = input.required<string>();
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
   * Marks the sub-step as the one the user is on.
   * @default false
   */
  selected = input(false, { transform: booleanAttribute });
  /**
   * Excludes the sub-step from navigation and renders it as disabled.
   * @default false
   */
  disabled = input(false, { transform: booleanAttribute });
  /**
   * Non-interactive, secondary text treatment, e.g. for a sub-step filled in by
   * an official.
   * @default false
   */
  informative = input(false, { transform: booleanAttribute });
  /**
   * Emits when the sub-step is picked in the step list, which then closes.
   * Disabled and informative sub-steps render as text and cannot be picked.
   */
  itemSelect = output<void>();

  /** @internal Completed wins over error, as in `tedi-vertical-stepper-item`. */
  readonly progressState = computed(() => {
    if (this.completed()) {
      return "completed";
    }

    if (this.error()) {
      return "error";
    }

    return "default";
  });
}
