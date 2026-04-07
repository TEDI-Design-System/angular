import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  selector: "tedi-filter-group",
  standalone: true,
  template: `<ng-content />`,
  styleUrl: "./filter-group.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-filter-group",
  },
})
export class FilterGroupComponent {}
