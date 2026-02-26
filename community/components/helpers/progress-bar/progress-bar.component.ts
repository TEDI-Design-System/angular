import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from "@angular/core";
import { ComponentInputs, FeedbackTextComponent, generateUUID, LabelComponent } from "@tedi-design-system/angular/tedi";

@Component({
  selector: "tedi-progress-bar",
  imports: [FeedbackTextComponent, LabelComponent],
  templateUrl: "./progress-bar.component.html",
  styleUrl: "./progress-bar.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class.tedi-progress]": "true",
    "[class.tedi-progress--small]": "small()",
    "[class.tedi-progress--horizontal]": "direction() === 'horizontal'",
  },
})
export class ProgressBarComponent {
  progressId = input<string>();
  value = input<number>(0);
  direction = input<'horizontal' | 'vertical'>("horizontal");
  small = input(false, { transform: booleanAttribute });
  feedbackText = input<ComponentInputs<FeedbackTextComponent>>();

  feedbackTextId = computed(() => {
    if (this.feedbackText()) {
      return generateUUID();
    }
    return;
  });
}
