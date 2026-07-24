import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

/**
 * Semantic container for `SideNav` menu items. Renders as a real `<ul>` so its
 * `li[tedi-sidenav-item]` children are valid direct list children, and lets the
 * `nav[tedi-sidenav]` host arbitrary sibling content (header, footer) alongside
 * the menu.
 *
 * ```html
 * <nav tedi-sidenav>
 *   <ul tedi-sidenav-list>
 *     <li tedi-sidenav-item icon="home" href="#">Home</li>
 *   </ul>
 * </nav>
 * ```
 */
@Component({
  selector: "ul[tedi-sidenav-list]",
  standalone: true,
  template: "<ng-content></ng-content>",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "class": "tedi-sidenav__list",
  },
})
export class SideNavListComponent {}
