import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  standalone: true,
  selector: "tedi-process-timeline-title",
  template: "<ng-content />",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "tedi-process-timeline-title" },
})
export class ProcessTimelineTitleComponent {}
