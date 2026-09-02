import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input, ViewEncapsulation } from "@angular/core";
import { ComponentInputs, FeedbackTextComponent, generateUUID, LabelComponent } from "@tedi-design-system/angular/tedi";

/**
 * @deprecated Use the TEDI-Ready `ProgressBarComponent` from
 * `@tedi-design-system/angular/tedi` instead. Same selector, but the API
 * differs: the `feedbackText` input is gone — project a
 * `<tedi-feedback-text>` child instead — and `small` is replaced by
 * `size: "default" | "small"`. The TEDI-Ready version also adds
 * `label`, `labelPosition`, `required`, `showValue`, `valuePosition`,
 * `valueLabel`, `ariaLabel`, `mobile`, and `mobileBreakpoint`. The CSS host
 * class is renamed from `.tedi-progress` to `.tedi-progress-bar`.
 */
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
