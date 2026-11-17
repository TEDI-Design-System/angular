import { FocusTrapFactory } from "@angular/cdk/a11y";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  HostListener,
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

/**
 * Hides everything outside `element` from assistive technology by setting `aria-hidden` on the
 * siblings of `element` and of each of its ancestors. Elements that already have an `aria-hidden`
 * attribute are left alone. Returns a function that removes the attributes it set.
 */
const hideOutside = (element: HTMLElement): (() => void) => {
  const hidden: Element[] = [];

  for (let node = element; node.parentElement; node = node.parentElement) {
    for (const sibling of Array.from(node.parentElement.children)) {
      if (sibling !== node && !sibling.hasAttribute("aria-hidden")) {
        sibling.setAttribute("aria-hidden", "true");
        hidden.push(sibling);
      }
    }
  }

  return () => hidden.forEach((el) => el.removeAttribute("aria-hidden"));
};

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
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly focusTrapFactory = inject(FocusTrapFactory);

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

    // While the mobile drawer is open, keep focus inside it, move focus in on open
    // and hide the page behind it from assistive technology.
    effect((onCleanup) => {
      if (!this.sidenavService.isMobileDrawerOpen()) {
        return;
      }

      const element = this.host.nativeElement;
      const focusTrap = this.focusTrapFactory.create(element);
      const showOutside = hideOutside(element);

      void focusTrap.focusInitialElementWhenReady();
      onCleanup(() => {
        focusTrap.destroy();
        showOutside();
      });
    });
  }

  @HostListener("document:keydown.escape")
  onEscape() {
    if (this.sidenavService.isMobileDrawerOpen()) {
      this.sidenavService.closeMobileDrawer();
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

  classes = computed(() => {
    const classList = [
      "tedi-sidenav",
      "no-print",
      `tedi-sidenav--${this.size()}`,
    ];

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
