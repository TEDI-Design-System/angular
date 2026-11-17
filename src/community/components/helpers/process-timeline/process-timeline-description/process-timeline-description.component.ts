import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  standalone: true,
  selector: "tedi-process-timeline-description",
  template: "<ng-content />",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "tedi-process-timeline-description" },
})
export class ProcessTimelineDescriptionComponent {}
