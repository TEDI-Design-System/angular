import {
  computed,
  effect,
  inject,
  Injectable,
  PLATFORM_ID,
  signal,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import {
  Breakpoint,
  BreakpointService,
} from "../breakpoint/breakpoint.service";
import { SideNavItemComponent } from "../../components/layout/sidenav/sidenav-item/sidenav-item.component";

@Injectable({ providedIn: "root" })
export class SideNavService {
  private readonly breakpointService = inject(BreakpointService);
  private readonly platformId = inject(PLATFORM_ID);

  items = signal<SideNavItemComponent[]>([]);
  desktopBreakpoint = signal<Breakpoint>("lg");
  isMobile = this.breakpointService.isBelowBreakpoint(this.desktopBreakpoint);
  isMobileOpen = signal(false);
  isCollapsed = signal(false);
  isMobileDrawerOpen = computed(() => this.isMobile() && this.isMobileOpen());

  /** Last registered toggle. Registering a second one supersedes the first. */
  private toggle: HTMLElement | null = null;
  private readonly offsetTop = signal(0);

  /**
   * Distance in pixels from the top of the viewport where the mobile navigation and
   * its overlay start, so both open below the header that holds the toggle.
   * `null` whenever the mobile navigation is not open.
   */
  drawerTop = computed(() =>
    this.isMobileDrawerOpen() ? this.offsetTop() : null,
  );

  constructor() {
    effect(() => {
      if (this.isMobile() && this.isCollapsed()) {
        this.isCollapsed.set(false);
      }
    });

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    effect((onCleanup) => {
      if (!this.isMobileDrawerOpen()) {
        return;
      }

      const anchor = this.toggle?.closest("header") ?? this.toggle;

      if (!anchor) {
        this.offsetTop.set(0);
        return;
      }

      const measure = () =>
        this.offsetTop.set(Math.max(0, anchor.getBoundingClientRect().bottom));

      measure();

      if (typeof ResizeObserver === "undefined") {
        return;
      }

      const observer = new ResizeObserver(measure);

      observer.observe(anchor);
      onCleanup(() => observer.disconnect());
    });
  }

  registerItem(item: SideNavItemComponent) {
    this.items.update((list) => [...list, item]);
  }

  unregisterItem(item: SideNavItemComponent) {
    this.items.update((list) => list.filter((i) => i !== item));
  }

  registerToggle(element: HTMLElement) {
    this.toggle = element;
  }

  unregisterToggle(element: HTMLElement) {
    if (this.toggle === element) {
      this.toggle = null;
    }
  }

  handleGoToMainMenu() {
    this.items().forEach((item) => item.dropdown?.open.set(false));
  }

  handleCollapse() {
    this.isCollapsed.update((prev) => !prev);
  }

  isMobileItemOpen = computed(() => {
    return (
      this.isMobile() && this.items().some((item) => item.dropdown?.open())
    );
  });

  tooltipEnabled = computed(() => {
    return (
      this.isCollapsed() && !this.items().some((item) => item.dropdown?.open())
    );
  });
}
