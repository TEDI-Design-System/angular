import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  selector: "li[tedi-sidenav-group-title]",
  standalone: true,
  templateUrl: "./sidenav-group-title.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-sidenav-group-title",
  },
})
export class SideNavGroupTitleComponent {}
