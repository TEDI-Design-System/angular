import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

/**
 * Nested list of a native `li[tedi-sidenav-dropdown-group]`. Renders as a real
 * `<ul>` holding the group's child `li[tedi-sidenav-dropdown-item]`s.
 */
@Component({
  selector: "ul[tedi-sidenav-dropdown-group-list]",
  standalone: true,
  template: "<ng-content></ng-content>",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "class": "tedi-sidenav-dropdown-group__list",
  },
})
export class SideNavDropdownGroupListComponent {}
