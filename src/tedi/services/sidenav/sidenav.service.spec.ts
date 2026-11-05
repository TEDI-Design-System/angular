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
      const item1 = {
        dropdown: { open: openSignal1 },
      } as unknown as SideNavItemComponent;
      const item2 = {
        dropdown: { open: openSignal2 },
      } as unknown as SideNavItemComponent;

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
      const item = {
        dropdown: { open: openSignal },
      } as unknown as SideNavItemComponent;
      service.registerItem(item);

      expect(service.isMobileItemOpen()).toBe(false);
    });

    it("should return false when mobile but no dropdown open", () => {
      isBelowBreakpointSignal.set(true);
      const openSignal = signal(false);
      const item = {
        dropdown: { open: openSignal },
      } as unknown as SideNavItemComponent;
      service.registerItem(item);

      expect(service.isMobileItemOpen()).toBe(false);
    });

    it("should return true when mobile and dropdown is open", () => {
      isBelowBreakpointSignal.set(true);
      const openSignal = signal(true);
      const item = {
        dropdown: { open: openSignal },
      } as unknown as SideNavItemComponent;
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
      const item = {
        dropdown: { open: openSignal },
      } as unknown as SideNavItemComponent;
      service.registerItem(item);

      expect(service.tooltipEnabled()).toBe(true);
    });

    it("should return false when collapsed but dropdown is open", () => {
      service.isCollapsed.set(true);
      const openSignal = signal(true);
      const item = {
        dropdown: { open: openSignal },
      } as unknown as SideNavItemComponent;
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

  describe("drawerTop", () => {
    let header: HTMLElement;
    let toggle: HTMLElement;

    const openDrawer = () => {
      isBelowBreakpointSignal.set(true);
      service.isMobileOpen.set(true);
      TestBed.tick();
    };

    beforeEach(() => {
      header = document.createElement("header");
      toggle = document.createElement("button");
      header.appendChild(toggle);
      document.body.appendChild(header);
    });

    afterEach(() => {
      header.remove();
    });

    it("should be null while the mobile navigation is closed", () => {
      service.registerToggle(toggle);
      isBelowBreakpointSignal.set(true);
      TestBed.tick();

      expect(service.drawerTop()).toBeNull();
    });

    it("should measure the bottom of the header holding the toggle", () => {
      jest
        .spyOn(header, "getBoundingClientRect")
        .mockReturnValue({ bottom: 56 } as DOMRect);
      service.registerToggle(toggle);

      openDrawer();

      expect(service.drawerTop()).toBe(56);
    });

    it("should fall back to the toggle when it is not inside a header", () => {
      const standaloneToggle = document.createElement("button");
      document.body.appendChild(standaloneToggle);
      jest
        .spyOn(standaloneToggle, "getBoundingClientRect")
        .mockReturnValue({ bottom: 40 } as DOMRect);
      service.registerToggle(standaloneToggle);

      openDrawer();

      expect(service.drawerTop()).toBe(40);
      standaloneToggle.remove();
    });

    it("should clamp a header scrolled above the viewport to zero", () => {
      jest
        .spyOn(header, "getBoundingClientRect")
        .mockReturnValue({ bottom: -20 } as DOMRect);
      service.registerToggle(toggle);

      openDrawer();

      expect(service.drawerTop()).toBe(0);
    });

    it("should be 0 when no toggle is registered", () => {
      openDrawer();

      expect(service.drawerTop()).toBe(0);
    });

    it("should stop measuring the toggle once it is unregistered", () => {
      jest
        .spyOn(header, "getBoundingClientRect")
        .mockReturnValue({ bottom: 56 } as DOMRect);
      service.registerToggle(toggle);
      service.unregisterToggle(toggle);

      openDrawer();

      expect(service.drawerTop()).toBe(0);
    });

    it("should re-resolve the anchor when the toggle changes while open", () => {
      jest
        .spyOn(header, "getBoundingClientRect")
        .mockReturnValue({ bottom: 56 } as DOMRect);
      service.registerToggle(toggle);
      openDrawer();
      expect(service.drawerTop()).toBe(56);

      const otherHeader = document.createElement("header");
      const otherToggle = document.createElement("button");
      otherHeader.appendChild(otherToggle);
      document.body.appendChild(otherHeader);
      jest
        .spyOn(otherHeader, "getBoundingClientRect")
        .mockReturnValue({ bottom: 120 } as DOMRect);

      service.registerToggle(otherToggle);
      TestBed.tick();

      expect(service.drawerTop()).toBe(120);
      otherHeader.remove();
    });

    it("should disconnect the observer and reset the offset when the toggle unregisters while open", () => {
      const observers: { observe: jest.Mock; disconnect: jest.Mock }[] = [];
      const originalResizeObserver = global.ResizeObserver;

      global.ResizeObserver = class {
        observe = jest.fn();
        unobserve = jest.fn();
        disconnect = jest.fn();

        constructor() {
          observers.push(this as unknown as (typeof observers)[number]);
        }
      } as unknown as typeof ResizeObserver;

      try {
        jest
          .spyOn(header, "getBoundingClientRect")
          .mockReturnValue({ bottom: 56 } as DOMRect);
        service.registerToggle(toggle);
        openDrawer();

        expect(observers).toHaveLength(1);
        expect(observers[0].observe).toHaveBeenCalledWith(header);
        expect(observers[0].disconnect).not.toHaveBeenCalled();

        service.unregisterToggle(toggle);
        TestBed.tick();

        expect(observers[0].disconnect).toHaveBeenCalled();
        expect(service.drawerTop()).toBe(0);
      } finally {
        global.ResizeObserver = originalResizeObserver;
      }
    });
  });
});
