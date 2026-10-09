import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  standalone: true,
  selector: "tedi-table-toolbar",
  template: "<ng-content />",
  styleUrl: "./table-toolbar.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-table-toolbar",
    "data-name": "tedi-table-toolbar",
  },
})
export class TediTableToolbarComponent {}
