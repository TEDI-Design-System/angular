import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SideNavComponent, SideNavItemSize } from "./sidenav.component";
import { SideNavService } from "../../../services/sidenav/sidenav.service";
import { signal } from "@angular/core";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

const mockCallbackHolder: { callback: (() => void) | null } = { callback: null };

jest.mock("@angular/core", () => {
  const actual = jest.requireActual("@angular/core");
  return {
    ...actual,
    afterNextRender: jest.fn((callback: () => void, _options?: unknown) => {
      mockCallbackHolder.callback = callback;
      return { destroy: jest.fn() };
    }),
  };
});

describe("SideNavComponent", () => {
  let fixture: ComponentFixture<SideNavComponent>;
  let sidenavElement: HTMLElement;
  let sidenavService: {
    items: ReturnType<typeof signal>;
    isCollapsed: ReturnType<typeof signal>;
    desktopBreakpoint: ReturnType<typeof signal>;
    isMobile: ReturnType<typeof signal>;
    isMobileItemOpen: ReturnType<typeof signal>;
    isMobileGroupOpen: ReturnType<typeof signal>;
    isMobileOpen: ReturnType<typeof signal>;
    openGroup: ReturnType<typeof signal>;
    openItemText: ReturnType<typeof signal>;
    tooltipEnabled: ReturnType<typeof signal>;
    registerItem: jest.Mock;
    unregisterItem: jest.Mock;
    handleGoToMainMenu: jest.Mock;
    handleBackToParentMenu: jest.Mock;
    handleCollapse: jest.Mock;
  };

  beforeEach(() => {
    sidenavService = {
      items: signal([]),
      isCollapsed: signal(false),
      desktopBreakpoint: signal("lg"),
      isMobile: signal(false),
      isMobileItemOpen: signal(false),
      isMobileGroupOpen: signal(false),
      isMobileOpen: signal(false),
      openGroup: signal(null),
      openItemText: signal(""),
      tooltipEnabled: signal(false),
      registerItem: jest.fn(),
      unregisterItem: jest.fn(),
      handleGoToMainMenu: jest.fn(),
      handleBackToParentMenu: jest.fn(),
      handleCollapse: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [SideNavComponent],
      providers: [
        { provide: SideNavService, useValue: sidenavService },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    TestBed.inject(SideNavService);
    fixture = TestBed.createComponent(SideNavComponent);
    sidenavElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("sets aria-label on the nav landmark from the ariaLabel input", () => {
    expect(sidenavElement.hasAttribute("aria-label")).toBe(false);
    fixture.componentRef.setInput("ariaLabel", "Peamenüü");
    fixture.detectChanges();
    expect(sidenavElement.getAttribute("aria-label")).toBe("Peamenüü");
  });

  it("should have default classes (large + dividers)", () => {
    expect(sidenavElement.classList.contains("tedi-sidenav")).toBe(true);
    expect(sidenavElement.classList.contains("tedi-sidenav--large")).toBe(true);
    expect(sidenavElement.classList.contains("tedi-sidenav--dividers")).toBe(
      true,
    );
  });

  it("should omit divider class when `dividers` input is false", () => {
    fixture.componentRef.setInput("dividers", false);
    fixture.detectChanges();
    expect(sidenavElement.classList).not.toContain("tedi-sidenav--dividers");
  });

  it("should reflect `size` input", () => {
    const sizes: SideNavItemSize[] = ["large", "medium", "small"];

    for (const size of sizes) {
      fixture.componentRef.setInput("size", size);
      fixture.detectChanges();
      expect(sidenavElement.classList.contains(`tedi-sidenav--${size}`)).toBe(
        true,
      );
    }
  });

  it("should include collapsed class when service.isCollapsed is true", () => {
    sidenavService.isCollapsed.set(true);
    fixture.detectChanges();
    expect(sidenavElement.classList.contains(`tedi-sidenav--collapsed`)).toBe(
      true,
    );
  });

  it("should include mobile class when service.isMobile is true", () => {
    sidenavService.isMobile.set(true);
    fixture.detectChanges();
    expect(sidenavElement.classList.contains(`tedi-sidenav--mobile`)).toBe(
      true,
    );
  });

  it("should include mobile item open class when service.isMobileItemOpen is true", () => {
    sidenavService.isMobileItemOpen.set(true);
    fixture.detectChanges();
    expect(
      sidenavElement.classList.contains(`tedi-sidenav--mobile-item-open`),
    ).toBe(true);
  });

  it("should include hidden class when service.isMobile is true and isMobileOpen is false", () => {
    sidenavService.isMobile.set(true);
    sidenavService.isMobileOpen.set(false);
    fixture.detectChanges();
    expect(sidenavElement.classList.contains(`tedi-sidenav--hidden`)).toBe(
      true,
    );
  });

  it("should include mobile group open class when service.isMobileGroupOpen is true", () => {
    sidenavService.isMobileGroupOpen.set(true);
    fixture.detectChanges();
    expect(
      sidenavElement.classList.contains(`tedi-sidenav--mobile-group-open`),
    ).toBe(true);
  });

  it("collapses on init when defaultCollapsed is true", () => {
    fixture.componentRef.setInput("defaultCollapsed", true);
    fixture.componentInstance.ngOnInit();
    expect(sidenavService.isCollapsed()).toBe(true);
  });

  it("does not collapse on init when defaultCollapsed is false", () => {
    fixture.componentInstance.ngOnInit();
    expect(sidenavService.isCollapsed()).toBe(false);
  });

  describe("handleBackToMainMenu", () => {
    afterEach(() => {
      mockCallbackHolder.callback = null;
    });

    it("should call service.handleGoToMainMenu", () => {
      fixture.componentInstance.handleBackToMainMenu();
      expect(sidenavService.handleGoToMainMenu).toHaveBeenCalled();
    });

    it("should find the open item before closing", () => {
      const openSignal = signal(true);
      const mockItem = {
        dropdown: { open: openSignal },
        host: { nativeElement: document.createElement("div") },
      };

      sidenavService.items.set([mockItem as never]);

      fixture.componentInstance.handleBackToMainMenu();
      expect(sidenavService.handleGoToMainMenu).toHaveBeenCalled();
    });

    it("should focus the trigger of the previously open item after closing", () => {
      const openSignal = signal(true);
      const mockHostEl = document.createElement("div");
      const mockTriggerBtn = document.createElement("button");
      mockTriggerBtn.className = "tedi-sidenav-item__title";
      mockHostEl.appendChild(mockTriggerBtn);

      const focusSpy = jest.spyOn(mockTriggerBtn, "focus");

      const mockItem = {
        dropdown: { open: openSignal },
        host: { nativeElement: mockHostEl },
      };

      sidenavService.items.set([mockItem as never]);

      fixture.componentInstance.handleBackToMainMenu();

      if (mockCallbackHolder.callback) {
        mockCallbackHolder.callback();
      }

      expect(focusSpy).toHaveBeenCalled();
    });

    it("should not throw when no item is open", () => {
      sidenavService.items.set([]);

      fixture.componentInstance.handleBackToMainMenu();

      if (mockCallbackHolder.callback) {
        mockCallbackHolder.callback();
      }

      expect(sidenavService.handleGoToMainMenu).toHaveBeenCalled();
    });
  });

  describe("handleBackToParentMenu", () => {
    afterEach(() => {
      mockCallbackHolder.callback = null;
    });

    it("should call service.handleBackToParentMenu", () => {
      fixture.componentInstance.handleBackToParentMenu();
      expect(sidenavService.handleBackToParentMenu).toHaveBeenCalled();
    });

    it("should focus the open group's parent trigger after going back", () => {
      const mockGroupEl = document.createElement("div");
      const mockParent = document.createElement("a");
      mockParent.className = "tedi-sidenav-dropdown-group__parent";
      mockGroupEl.appendChild(mockParent);
      const focusSpy = jest.spyOn(mockParent, "focus");

      sidenavService.openGroup.set({
        host: { nativeElement: mockGroupEl },
      } as never);

      fixture.componentInstance.handleBackToParentMenu();

      if (mockCallbackHolder.callback) {
        mockCallbackHolder.callback();
      }

      expect(focusSpy).toHaveBeenCalled();
    });

    it("should not throw when no group is open", () => {
      sidenavService.openGroup.set(null);

      fixture.componentInstance.handleBackToParentMenu();

      if (mockCallbackHolder.callback) {
        mockCallbackHolder.callback();
      }

      expect(sidenavService.handleBackToParentMenu).toHaveBeenCalled();
    });
  });
});
