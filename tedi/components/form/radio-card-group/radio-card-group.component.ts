import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  standalone: true,
  selector: "tedi-radio-card-group",
  template: "<ng-content />",
  styleUrl: "./radio-card-group.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-radio-card-group",
  },
})
export class RadioCardGroupComponent {}
