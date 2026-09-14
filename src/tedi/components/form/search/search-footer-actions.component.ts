import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

/**
 * Row of buttons inside a `tediSearchFooter`. Centres them and wraps to a new
 * line when they no longer fit side by side.
 */
@Component({
  standalone: true,
  selector: "tedi-search-footer-actions",
  template: "<ng-content />",
  styleUrl: "./search.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-search-footer-actions",
  },
})
export class SearchFooterActionsComponent {}
