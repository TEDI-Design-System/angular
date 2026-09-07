import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  PLATFORM_ID,
  ViewEncapsulation,
} from "@angular/core";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";

import { IconComponent } from "../../base/icon/icon.component";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";
import { SideNavService } from "../../../services/sidenav/sidenav.service";
import { Breakpoint } from "../../../services/breakpoint/breakpoint.service";

export type SideNavItemSize = "small" | "medium" | "large";

@Component({
  selector: "nav[tedi-sidenav]",
  standalone: true,
  templateUrl: "./sidenav.component.html",
  styleUrl: "./sidenav.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [IconComponent, TediTranslationPipe],
  host: {
    "[class]": "classes()",
    "[style.top.px]": "sidenavService.drawerTop()",
  },
})
export class SideNavComponent {
  sidenavService = inject(SideNavService);

  /**
   * Show dividers between items
   * @default true
   */
  dividers = input<boolean>(true);
  /**
   * Size of navigation item
   * @default large
   */
  size = input<SideNavItemSize>("large");
  /**
   * Is navigation collapsible in desktop?
   * @default false
   */
  collapsible = input<boolean>(false);
  /** Breakpoint when to show desktop navigation
   * @default lg
   */
  desktopBreakpoint = input<Breakpoint>("lg");

  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    effect(() => {
      this.sidenavService.desktopBreakpoint.set(this.desktopBreakpoint());
    });

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    effect((onCleanup) => {
      if (!this.sidenavService.isMobileDrawerOpen()) {
        return;
      }

      const previousOverflow = this.document.body.style.overflow;

      this.document.body.style.overflow = "hidden";
      onCleanup(() => {
        this.document.body.style.overflow = previousOverflow;
      });
    });
  }

  handleBackToMainMenu() {
    // Find the parent menu item to focus on
    const openItem = this.sidenavService
      .items()
      .find((item) => item.dropdown?.open());

    this.sidenavService.handleGoToMainMenu();

    afterNextRender(
      () => {
        if (openItem) {
          const itemEl = openItem["host"]?.nativeElement as HTMLElement;
          const trigger = itemEl?.querySelector(
            ".tedi-sidenav-item__title",
          ) as HTMLElement | null;
          trigger?.focus();
        }
      },
      { injector: this.injector },
    );
  }

  classes = computed(() => {
    const classList = ["tedi-sidenav", `tedi-sidenav--${this.size()}`];

    if (this.dividers()) {
      classList.push("tedi-sidenav--dividers");
    }

    if (this.sidenavService.isCollapsed()) {
      classList.push("tedi-sidenav--collapsed");
    }

    if (this.sidenavService.isMobile()) {
      classList.push("tedi-sidenav--mobile");
    }

    if (this.sidenavService.isMobileItemOpen()) {
      classList.push("tedi-sidenav--mobile-item-open");
    }

    if (
      this.sidenavService.isMobile() &&
      !this.sidenavService.isMobileDrawerOpen()
    ) {
      classList.push("tedi-sidenav--hidden");
    }

    return classList.join(" ");
  });
}
