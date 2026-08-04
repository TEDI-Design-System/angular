import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";

import { IconComponent } from "../../base/icon/icon.component";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";
import { TediTranslationService } from "../../../services/translation/translation.service";
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
    "[attr.aria-label]": "ariaLabel()",
  },
})
export class SideNavComponent implements OnInit {
  sidenavService = inject(SideNavService);
  private readonly translationService = inject(TediTranslationService);

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
  /**
   * Whether the (collapsible) nav starts collapsed on desktop. Requires
   * `collapsible` to be able to expand it again via the toggle.
   * @default false
   */
  defaultCollapsed = input<boolean>(false);
  /** Breakpoint when to show desktop navigation
   * @default lg
   */
  desktopBreakpoint = input<Breakpoint>("lg");
  /**
   * Accessible name for the `<nav>` landmark. Recommended when the page has more
   * than one navigation landmark (e.g. a header nav and this sidenav).
   */
  ariaLabel = input<string>();
  /**
   * Overrides the mobile "back to main menu" button text. When omitted, falls
   * back to the translated `sidenav.backToMainMenu` label.
   */
  backToMainMenuLabel = input<string>();
  /**
   * Overrides the mobile "back to parent menu" button text shown when a group is
   * drilled open. When omitted, falls back to the translated
   * `sidenav.backToParentMenu` label (which includes the parent item's name).
   */
  backToParentMenuLabel = input<string>();

  protected readonly backToMainText = computed(
    () =>
      this.backToMainMenuLabel() ??
      this.translationService.translate("sidenav.backToMainMenu"),
  );
  protected readonly backToParentText = computed(
    () =>
      this.backToParentMenuLabel() ??
      this.translationService.translate(
        "sidenav.backToParentMenu",
        this.sidenavService.openItemText(),
      ),
  );

  private readonly injector = inject(Injector);

  constructor() {
    effect(() => {
      this.sidenavService.desktopBreakpoint.set(this.desktopBreakpoint());
    });
  }

  ngOnInit() {
    if (this.defaultCollapsed()) {
      this.sidenavService.isCollapsed.set(true);
    }
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

  handleBackToParentMenu() {
    const groupEl = this.sidenavService.openGroup()?.["host"]?.nativeElement as
      | HTMLElement
      | undefined;

    this.sidenavService.handleBackToParentMenu();

    afterNextRender(
      () => {
        const trigger = groupEl?.querySelector(
          ".tedi-sidenav-dropdown-group__parent",
        ) as HTMLElement | null;
        trigger?.focus();
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

    if (this.sidenavService.isMobileGroupOpen()) {
      classList.push("tedi-sidenav--mobile-group-open");
    }

    if (this.sidenavService.isMobile() && !this.sidenavService.isMobileOpen()) {
      classList.push("tedi-sidenav--hidden");
    }

    return classList.join(" ");
  });
}
