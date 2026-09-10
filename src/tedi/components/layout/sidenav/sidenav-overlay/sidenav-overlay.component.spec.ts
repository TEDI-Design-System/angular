import { ComponentFixture, TestBed } from "@angular/core/testing";
import { computed, signal, Signal } from "@angular/core";
import { SideNavOverlayComponent } from "./sidenav-overlay.component";
import { SideNavService } from "../../../../services/sidenav/sidenav.service";

describe("SideNavOverlayComponent", () => {
  let fixture: ComponentFixture<SideNavOverlayComponent>;
  let overlayElement: HTMLElement;
  let sidenavService: {
    items: ReturnType<typeof signal>;
    isCollapsed: ReturnType<typeof signal>;
    isMobile: ReturnType<typeof signal>;
    isMobileItemOpen: ReturnType<typeof signal>;
    isMobileOpen: ReturnType<typeof signal>;
    isMobileDrawerOpen: Signal<boolean>;
    drawerTop: ReturnType<typeof signal>;
    tooltipEnabled: ReturnType<typeof signal>;
    registerItem: jest.Mock;
    unregisterItem: jest.Mock;
    registerToggle: jest.Mock;
    unregisterToggle: jest.Mock;
    handleGoToMainMenu: jest.Mock;
    handleCollapse: jest.Mock;
  };

  beforeEach(() => {
    const isMobile = signal(false);
    const isMobileOpen = signal(false);

    sidenavService = {
      items: signal([]),
      isCollapsed: signal(false),
      isMobile,
      isMobileItemOpen: signal(false),
      isMobileOpen,
      isMobileDrawerOpen: computed(() => isMobile() && isMobileOpen()),
      drawerTop: signal<number | null>(null),
      tooltipEnabled: signal(false),
      registerItem: jest.fn(),
      unregisterItem: jest.fn(),
      registerToggle: jest.fn(),
      unregisterToggle: jest.fn(),
      handleGoToMainMenu: jest.fn(),
      handleCollapse: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [SideNavOverlayComponent],
      providers: [{ provide: SideNavService, useValue: sidenavService }],
    });

    fixture = TestBed.createComponent(SideNavOverlayComponent);
    overlayElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create the component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should have base class only when mobile is false or closed", () => {
    expect(overlayElement.classList.contains("tedi-sidenav-overlay")).toBe(
      true,
    );
    expect(
      overlayElement.classList.contains("tedi-sidenav-overlay--visible"),
    ).toBe(false);
  });

  it("should add visible class when service.isMobile and isMobileOpen are true", () => {
    sidenavService.isMobile.set(true);
    sidenavService.isMobileOpen.set(true);
    fixture.detectChanges();
    expect(
      overlayElement.classList.contains("tedi-sidenav-overlay--visible"),
    ).toBe(true);
  });

  it("should not add visible class when only one condition is true", () => {
    sidenavService.isMobile.set(true);
    sidenavService.isMobileOpen.set(false);
    fixture.detectChanges();
    expect(
      overlayElement.classList.contains("tedi-sidenav-overlay--visible"),
    ).toBe(false);

    sidenavService.isMobile.set(false);
    sidenavService.isMobileOpen.set(true);
    fixture.detectChanges();
    expect(
      overlayElement.classList.contains("tedi-sidenav-overlay--visible"),
    ).toBe(false);
  });

  it("should apply the drawer offset as an inline top style", () => {
    expect(overlayElement.style.top).toBe("");

    sidenavService.drawerTop.set(56);
    fixture.detectChanges();

    expect(overlayElement.style.top).toBe("56px");
  });

  it("should close mobile on click and call handleGoToMainMenu", () => {
    sidenavService.isMobileOpen.set(true);
    fixture.detectChanges();
    expect(sidenavService.isMobileOpen()).toBe(true);

    overlayElement.click();
    fixture.detectChanges();
    expect(sidenavService.isMobileOpen()).toBe(false);
    expect(sidenavService.handleGoToMainMenu).toHaveBeenCalledTimes(1);
  });
});
