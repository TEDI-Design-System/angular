import { computed, effect, inject, Injectable, signal } from "@angular/core";
import {
  Breakpoint,
  BreakpointService,
} from "../breakpoint/breakpoint.service";
import { SideNavItemComponent } from "../../components/layout/sidenav/sidenav-item/sidenav-item.component";
import type { SideNavDropdownGroupComponent } from "../../components/layout/sidenav/sidenav-dropdown-group/sidenav-dropdown-group.component";

@Injectable({ providedIn: "root" })
export class SideNavService {
  private readonly breakpointService = inject(BreakpointService);

  items = signal<SideNavItemComponent[]>([]);
  desktopBreakpoint = signal<Breakpoint>("lg");
  isMobile = this.breakpointService.isBelowBreakpoint(this.desktopBreakpoint);
  isMobileOpen = signal(false);
  isCollapsed = signal(false);

  // The non-link dropdown group currently drilled open on mobile (3rd level).
  openGroup = signal<SideNavDropdownGroupComponent | null>(null);

  constructor() {
    effect(() => {
      if (this.isMobile() && this.isCollapsed()) {
        this.isCollapsed.set(false);
      }
    });
  }

  registerItem(item: SideNavItemComponent) {
    this.items.update((list) => [...list, item]);
  }

  unregisterItem(item: SideNavItemComponent) {
    this.items.update((list) => list.filter((i) => i !== item));
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
