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
import type { SideNavDropdownGroupComponent } from "../../components/layout/sidenav/sidenav-dropdown-group/sidenav-dropdown-group.component";

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

  /**
   * Last registered toggle. Registering a second one supersedes the first. Reactive so
   * that (un)registering while the drawer is open re-resolves the measured anchor.
   */
  private readonly toggle = signal<HTMLElement | null>(null);
  private readonly offsetTop = signal(0);

  /**
   * Distance in pixels from the top of the viewport where the mobile navigation and
   * its overlay start, so both open below the header that holds the toggle.
   * `null` whenever the mobile navigation is not open.
   */
  drawerTop = computed(() =>
    this.isMobileDrawerOpen() ? this.offsetTop() : null,
  );

  // The non-link dropdown group currently drilled open on mobile (3rd level).
  openGroup = signal<SideNavDropdownGroupComponent | null>(null);

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

      const toggle = this.toggle();
      const anchor = toggle?.closest("header") ?? toggle;

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
    this.toggle.set(element);
  }

  unregisterToggle(element: HTMLElement) {
    if (this.toggle() === element) {
      this.toggle.set(null);
    }
  }

  // Drilling a non-link group replaces any previously open one (one panel deep).
  setOpenGroup(group: SideNavDropdownGroupComponent) {
    const current = this.openGroup();
    if (current && current !== group) {
      current.open.set(false);
    }
    this.openGroup.set(group);
  }

  clearOpenGroup(group: SideNavDropdownGroupComponent) {
    if (this.openGroup() === group) {
      this.openGroup.set(null);
    }
  }

  handleGoToMainMenu() {
    this.openGroup()?.open.set(false);
    this.openGroup.set(null);
    this.items().forEach((item) => item.dropdown?.open.set(false));
  }

  handleBackToParentMenu() {
    this.openGroup()?.open.set(false);
    this.openGroup.set(null);
  }

  handleCollapse() {
    this.isCollapsed.update((prev) => !prev);
  }

  isMobileItemOpen = computed(() => {
    return (
      this.isMobile() && this.items().some((item) => item.dropdown?.open())
    );
  });

  // A 3rd-level (non-link group) panel is drilled open on mobile.
  isMobileGroupOpen = computed(
    () => this.isMobile() && this.openGroup() !== null,
  );

  // Label for the second back button: the top-level item that owns the open
  // group's menu (e.g. "Parent 1" → "Parent 1 menüüsse").
  openItemText = computed(
    () =>
      this.items()
        .find((item) => item.dropdown?.open())
        ?.textContent() ?? "",
  );

  tooltipEnabled = computed(() => {
    return (
      this.isCollapsed() && !this.items().some((item) => item.dropdown?.open())
    );
  });
}
