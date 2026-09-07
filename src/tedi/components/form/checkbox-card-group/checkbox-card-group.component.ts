import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  standalone: true,
  selector: "tedi-checkbox-card-group",
  template: "<ng-content />",
  styleUrl: "./checkbox-card-group.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-checkbox-card-group",
  },
})
export class CheckboxCardGroupComponent {}
