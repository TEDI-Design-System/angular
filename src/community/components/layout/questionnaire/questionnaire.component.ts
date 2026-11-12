import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  ViewEncapsulation,
} from "@angular/core";
import {
  ButtonComponent,
  IconComponent,
  TediTranslationPipe,
} from "@tedi-design-system/angular/tedi";
import { SegmentedProgressComponent } from "../../helpers/segmented-progress/segmented-progress.component";

export type QuestionnaireStep = {
  label: string;
  disabled?: boolean;
};

@Component({
  selector: "tedi-questionnaire",
  imports: [
    ButtonComponent,
    IconComponent,
    SegmentedProgressComponent,
    TediTranslationPipe,
  ],
  templateUrl: "./questionnaire.component.html",
  styleUrl: "./questionnaire.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-questionnaire",
  },
})
export class QuestionnaireComponent {
  /**
   * Page heading, rendered as `h1`.
   */
  heading = input.required<string>();
  /**
   * Steps shown in the side navigation and as segments of the progress bar.
   */
  steps = input.required<QuestionnaireStep[]>();
  /**
   * Index of the active step. Updated when the user selects a step.
   * @default 0
   */
  activeStep = model(0);
  /**
   * Progress in steps, from 0 to `steps.length`. A fraction partly fills a segment. Pass an array
   * to fill each step's segment on its own, with values from 0 to 1.
   * @default activeStep
   */
  progress = input<number | number[]>();
  /**
   * Text above the progress bar, on the left.
   */
  progressLabel = input<string>();
  /**
   * Text above the progress bar, on the right, e.g. `1/6`.
   */
  progressValueLabel = input<string>();
  /**
   * Shows the back button before the heading.
   * @default true
   */
  showBack = input(true, { transform: booleanAttribute });
  /**
   * Emitted when the back button is clicked.
   */
  back = output<void>();

  resolvedProgress = computed(() => this.progress() ?? this.activeStep());

  selectStep(index: number) {
    if (!this.steps()[index]?.disabled) {
      this.activeStep.set(index);
    }
  }
}
