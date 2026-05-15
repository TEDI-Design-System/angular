import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

/**
 * Mobile-only secondary row rendered below the main header bar.
 *
 * Typical use: a compact search bar or mobile-specific navigation that only
 * appears below the `md` breakpoint. Above `md` the component is hidden via
 * CSS, so consumers can include it unconditionally — desktop users won't see it.
 *
 * @example
 * <header tedi-header>
 *   <!-- main content -->
 *   <tedi-header-bottom>
 *     <tedi-header-search mobileVariant="inline">
 *       <tedi-search inputId="search" placeholder="Search..." />
 *     </tedi-header-search>
 *   </tedi-header-bottom>
 * </header>
 */
@Component({
  selector: "tedi-header-bottom",
  standalone: true,
  template: "<ng-content />",
  styleUrl: "./header-bottom.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "class": "tedi-header-bottom",
  },
})
export class HeaderBottomComponent {}
