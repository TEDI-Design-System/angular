import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import {
  SeparatorComponent,
  TediTranslationPipe,
} from "@tedi-design-system/angular/tedi";
import { PROCESS_TIMELINE } from "../process-timeline.token";

export type ProcessTimelineItemState = "completed" | "active" | "upcoming";

const STATE_LABEL_KEYS: Partial<Record<ProcessTimelineItemState, string>> = {
  completed: "process-timeline.completed",
  upcoming: "process-timeline.upcoming",
};

@Component({
  standalone: true,
  selector: "li[tedi-process-timeline-item]",
  imports: [SeparatorComponent, TediTranslationPipe],
  templateUrl: "./process-timeline-item.component.html",
  styleUrl: "./process-timeline-item.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-process-timeline-item",
    role: "listitem",
    "[class.tedi-process-timeline-item--completed]": "state() === 'completed'",
    "[class.tedi-process-timeline-item--active]": "state() === 'active'",
    "[class.tedi-process-timeline-item--upcoming]": "state() === 'upcoming'",
    "[class.tedi-process-timeline-item--vertical]": "vertical()",
    "[class.tedi-process-timeline-item--last]": "isLast()",
    "[attr.aria-current]": "state() === 'active' ? 'step' : null",
  },
})
export class ProcessTimelineItemComponent {
  private readonly timeline = inject(PROCESS_TIMELINE, { optional: true });

  /**
   * Status of the stage. Set per stage, so it can follow the business status rather than the order.
   * @default upcoming
   */
  readonly state = input<ProcessTimelineItemState>("upcoming");

  protected readonly index = computed(
    () => this.timeline?.items().indexOf(this) ?? 0,
  );

  protected readonly isLast = computed(() => {
    const items = this.timeline?.items();
    return !items || this.index() === items.length - 1;
  });

  protected readonly vertical = computed(
    () => this.timeline?.vertical() ?? false,
  );

  protected readonly connectorThickness = computed(
    () => this.timeline?.connectorThickness() ?? 1,
  );

  protected readonly stateLabelKey = computed(
    () => STATE_LABEL_KEYS[this.state()],
  );
}
