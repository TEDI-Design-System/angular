import { TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { SideNavService } from "./sidenav.service";
import { BreakpointService } from "../breakpoint/breakpoint.service";
import { SideNavItemComponent } from "../../components/layout/sidenav/sidenav-item/sidenav-item.component";

describe("SideNavService", () => {
  let service: SideNavService;
  let isBelowBreakpointSignal: ReturnType<typeof signal<boolean>>;

  beforeEach(() => {
    isBelowBreakpointSignal = signal(false);

    const breakpointServiceMock = {
      isBelowBreakpoint: jest.fn().mockReturnValue(isBelowBreakpointSignal),
    };

    TestBed.configureTestingModule({
      providers: [
        SideNavService,
        { provide: BreakpointService, useValue: breakpointServiceMock },
      ],
    });

    service = TestBed.inject(SideNavService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("registerItem", () => {
    it("should add item to items array", () => {
      const item = {} as SideNavItemComponent;
      expect(service.items().length).toBe(0);

      service.registerItem(item);

      expect(service.items().length).toBe(1);
      expect(service.items()[0]).toBe(item);
    });
  });

  describe("unregisterItem", () => {
    it("should remove item from items array", () => {
      const item1 = { id: 1 } as unknown as SideNavItemComponent;
      const item2 = { id: 2 } as unknown as SideNavItemComponent;

      service.registerItem(item1);
      service.registerItem(item2);
      expect(service.items().length).toBe(2);

      service.unregisterItem(item1);

      expect(service.items().length).toBe(1);
      expect(service.items()[0]).toBe(item2);
    });
  });

  describe("handleGoToMainMenu", () => {
    it("should close all open dropdowns", () => {
      const openSignal1 = signal(true);
      const openSignal2 = signal(true);
      const item1 = { dropdown: { open: openSignal1 } } as unknown as SideNavItemComponent;
      const item2 = { dropdown: { open: openSignal2 } } as unknown as SideNavItemComponent;

      service.registerItem(item1);
      service.registerItem(item2);

      service.handleGoToMainMenu();

      expect(openSignal1()).toBe(false);
      expect(openSignal2()).toBe(false);
    });

    it("should handle items without dropdowns", () => {
      const item = { dropdown: undefined } as unknown as SideNavItemComponent;
      service.registerItem(item);

      expect(() => service.handleGoToMainMenu()).not.toThrow();
    });
  });

  describe("handleCollapse", () => {
    it("should toggle isCollapsed state", () => {
      expect(service.isCollapsed()).toBe(false);

      service.handleCollapse();
      expect(service.isCollapsed()).toBe(true);

      service.handleCollapse();
      expect(service.isCollapsed()).toBe(false);
    });
  });

  describe("isMobileItemOpen", () => {
    it("should return false when not mobile", () => {
      isBelowBreakpointSignal.set(false);
      const openSignal = signal(true);
      const item = { dropdown: { open: openSignal } } as unknown as SideNavItemComponent;
      service.registerItem(item);

      expect(service.isMobileItemOpen()).toBe(false);
    });

    it("should return false when mobile but no dropdown open", () => {
      isBelowBreakpointSignal.set(true);
      const openSignal = signal(false);
      const item = { dropdown: { open: openSignal } } as unknown as SideNavItemComponent;
      service.registerItem(item);

      expect(service.isMobileItemOpen()).toBe(false);
    });

    it("should return true when mobile and dropdown is open", () => {
      isBelowBreakpointSignal.set(true);
      const openSignal = signal(true);
      const item = { dropdown: { open: openSignal } } as unknown as SideNavItemComponent;
      service.registerItem(item);

      expect(service.isMobileItemOpen()).toBe(true);
    });
  });

  describe("group drill (3rd-level mobile)", () => {
    const makeGroup = () =>
      ({ open: signal(false) }) as unknown as Parameters<
        SideNavService["setOpenGroup"]
      >[0];

    it("isMobileGroupOpen is false until a group is opened", () => {
      isBelowBreakpointSignal.set(true);
      expect(service.isMobileGroupOpen()).toBe(false);

      service.setOpenGroup(makeGroup());
      expect(service.isMobileGroupOpen()).toBe(true);
    });

    it("isMobileGroupOpen is false on desktop even with an open group", () => {
      isBelowBreakpointSignal.set(false);
      service.setOpenGroup(makeGroup());
      expect(service.isMobileGroupOpen()).toBe(false);
    });

    it("setOpenGroup closes a previously open group (one panel deep)", () => {
      const first = makeGroup();
      const second = makeGroup();
      first.open.set(true);

      service.setOpenGroup(first);
      service.setOpenGroup(second);

      expect(first.open()).toBe(false);
      expect(service.openGroup()).toBe(second);
    });

    it("handleBackToParentMenu closes the group and clears the pointer", () => {
      isBelowBreakpointSignal.set(true);
      const group = makeGroup();
      group.open.set(true);
      service.setOpenGroup(group);

      service.handleBackToParentMenu();

      expect(group.open()).toBe(false);
      expect(service.openGroup()).toBeNull();
      expect(service.isMobileGroupOpen()).toBe(false);
    });

    it("handleGoToMainMenu also closes any open group", () => {
      const group = makeGroup();
      group.open.set(true);
      service.setOpenGroup(group);

      service.handleGoToMainMenu();

      expect(group.open()).toBe(false);
      expect(service.openGroup()).toBeNull();
    });

    it("openItemText reflects the open item that owns the drilled menu", () => {
      const item = {
        dropdown: { open: signal(true) },
        textContent: signal("Parent 1"),
      } as unknown as SideNavItemComponent;
      service.registerItem(item);

      expect(service.openItemText()).toBe("Parent 1");
    });
  });

  describe("tooltipEnabled", () => {
    it("should return false when not collapsed", () => {
      service.isCollapsed.set(false);
      expect(service.tooltipEnabled()).toBe(false);
    });

    it("should return true when collapsed and no dropdown open", () => {
      service.isCollapsed.set(true);
      const openSignal = signal(false);
      const item = { dropdown: { open: openSignal } } as unknown as SideNavItemComponent;
      service.registerItem(item);

      expect(service.tooltipEnabled()).toBe(true);
    });

    it("should return false when collapsed but dropdown is open", () => {
      service.isCollapsed.set(true);
      const openSignal = signal(true);
      const item = { dropdown: { open: openSignal } } as unknown as SideNavItemComponent;
      service.registerItem(item);

      expect(service.tooltipEnabled()).toBe(false);
    });
  });

  describe("effect: reset collapsed on mobile", () => {
    it("should reset isCollapsed to false when switching to mobile while collapsed", () => {
      service.isCollapsed.set(true);
      expect(service.isCollapsed()).toBe(true);

      isBelowBreakpointSignal.set(true);
      TestBed.tick();

      expect(service.isCollapsed()).toBe(false);
    });
  });
});
