import { ComponentFixture, TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { SideNavItemComponent } from "./sidenav-item.component";
import { SideNavService } from "../../../../services/sidenav/sidenav.service";

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

describe("SideNavItemComponent", () => {
  afterEach(() => {
    mockCallbackHolder.callback = null;
  });
  let fixture: ComponentFixture<SideNavItemComponent>;
  let itemElement: HTMLElement;
  let sidenavService: {
    items: ReturnType<typeof signal>,
    isCollapsed: ReturnType<typeof signal>,
    isMobile: ReturnType<typeof signal>,
    isMobileItemOpen: ReturnType<typeof signal>,
    isMobileOpen: ReturnType<typeof signal>,
    tooltipEnabled: ReturnType<typeof signal>,
    registerItem: jest.Mock,
    unregisterItem: jest.Mock,
    handleGoToMainMenu: jest.Mock,
    handleCollapse: jest.Mock
  }

  beforeEach(() => {
    sidenavService = {
      items: signal([]),
      isCollapsed: signal(false),
      isMobile: signal(false),
      isMobileItemOpen: signal(false),
      isMobileOpen: signal(false),
      tooltipEnabled: signal(false),
      registerItem: jest.fn(),
      unregisterItem: jest.fn(),
      handleGoToMainMenu: jest.fn(),
      handleCollapse: jest.fn()
    };

    TestBed.configureTestingModule({
      imports: [SideNavItemComponent],
      providers: [
        { provide: SideNavService, useValue: sidenavService },
      ],
    });

    fixture = TestBed.createComponent(SideNavItemComponent);
    fixture.detectChanges();
    itemElement = fixture.nativeElement;
  });

  it("should register on init and unregister on destroy", () => {
    expect(sidenavService.registerItem).toHaveBeenCalledWith(fixture.componentInstance);
    fixture.destroy();
    expect(sidenavService.unregisterItem).toHaveBeenCalledWith(fixture.componentInstance);
  });

  it("should always have base class on li element", () => {
    expect(itemElement.classList.contains("tedi-sidenav-item")).toBe(true);
  });

  it("should read textContent in ngAfterViewInit", () => {
    const textSpan = itemElement.querySelector(".tedi-sidenav-item__text");
    if (textSpan) {
      textSpan.textContent = "Item Text";
    }
    fixture.componentInstance.ngAfterViewInit();
    expect(fixture.componentInstance.textContent()).toBe("Item Text");
  });

  it("should add selected class when selected input is true", () => {
    fixture.componentRef.setInput("selected", true);
    fixture.detectChanges();
    itemElement = fixture.nativeElement;
    expect(itemElement.classList.contains("tedi-sidenav-item--selected")).toBe(true);
  });

  it("should add hidden class when mobile item open and no dropdown open", () => {
    sidenavService.isMobileItemOpen.set(true);
    fixture.detectChanges();
    itemElement = fixture.nativeElement;
    expect(itemElement.classList.contains("tedi-sidenav-item--hidden")).toBe(true);
  });

  it("should not add hidden class when dropdown open", () => {
    const dropdownStub = { open: signal(true) };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixture.componentInstance.dropdown = dropdownStub as any;
    sidenavService.isMobileItemOpen.set(true);
    fixture.detectChanges();
    itemElement = fixture.nativeElement;
    expect(itemElement.classList.contains("tedi-sidenav-item--hidden")).toBe(false);
  });

  it("toggleDropdown should flip dropdown.open signal", () => {
    const openSignal = signal(false);
    const dropdownStub = { open: openSignal, element: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixture.componentInstance.dropdown = dropdownStub as any;
    fixture.detectChanges();
    expect(openSignal()).toBe(false);

    fixture.componentInstance.toggleDropdown();
    expect(openSignal()).toBe(true);

    fixture.componentInstance.toggleDropdown();
    expect(openSignal()).toBe(false);
  });

  it("click outside should close dropdown when collapsed", () => {
    const childEl = document.createElement("div");
    const dropdownStub = {
      open: signal(true),
      element: () => childEl,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixture.componentInstance.dropdown = dropdownStub as any;
    fixture.componentInstance.ngAfterViewInit();

    sidenavService.isCollapsed.set(true);
    fixture.detectChanges();

    document.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(dropdownStub.open()).toBe(false);
  });

  it("Escape key should close dropdown and focus trigger when collapsed", async () => {
    const dropdownStub = {
      open: signal(true),
      element: () => document.createElement("div"),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixture.componentInstance.dropdown = dropdownStub as any;
    fixture.componentInstance.ngAfterViewInit();

    sidenavService.isCollapsed.set(true);
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(dropdownStub.open()).toBe(false);
  });


  it("toggleDropdown should do nothing when no dropdown", () => {
    fixture.componentInstance.dropdown = undefined;
    expect(() => fixture.componentInstance.toggleDropdown()).not.toThrow();
  });

  it("toggleDropdown should focus first dropdown item when opening in collapsed mode", () => {
    const openSignal = signal(false);
    const mockDropdownEl = document.createElement("div");
    const mockUl = document.createElement("ul");
    mockUl.className = "tedi-sidenav-dropdown";
    const mockTrigger = document.createElement("a");
    mockTrigger.className = "tedi-sidenav-dropdown-item__trigger";
    Object.defineProperty(mockTrigger, "offsetParent", { value: document.body, configurable: true });
    const focusSpy = jest.spyOn(mockTrigger, "focus");
    mockUl.appendChild(mockTrigger);
    mockDropdownEl.appendChild(mockUl);
    document.body.appendChild(mockDropdownEl);

    const dropdownStub = {
      open: openSignal,
      element: () => mockDropdownEl,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixture.componentInstance.dropdown = dropdownStub as any;

    sidenavService.isCollapsed.set(true);
    fixture.detectChanges();

    fixture.componentInstance.toggleDropdown();
    expect(openSignal()).toBe(true);

    // run afterNextRender
    if (mockCallbackHolder.callback) {
      mockCallbackHolder.callback();
    }

    expect(focusSpy).toHaveBeenCalled();
    document.body.removeChild(mockDropdownEl);
  });

  it("toggleDropdown should focus trigger when closing in collapsed mode", () => {
    const openSignal = signal(true);
    const mockDropdownEl = document.createElement("div");

    const dropdownStub = {
      open: openSignal,
      element: () => mockDropdownEl,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixture.componentInstance.dropdown = dropdownStub as any;

    sidenavService.isCollapsed.set(true);
    fixture.detectChanges();

    const actualTriggerBtn = fixture.nativeElement.querySelector(".tedi-sidenav-item__title") as HTMLElement;
    const focusSpy = jest.spyOn(actualTriggerBtn, "focus");

    fixture.componentInstance.toggleDropdown();
    expect(openSignal()).toBe(false);

    if (mockCallbackHolder.callback) {
      mockCallbackHolder.callback();
    }

    expect(focusSpy).toHaveBeenCalled();
  });

  it("toggleDropdown should trigger focus management when mobile", () => {
    const openSignal = signal(false);
    const mockDropdownEl = document.createElement("div");

    const dropdownStub = {
      open: openSignal,
      element: () => mockDropdownEl,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixture.componentInstance.dropdown = dropdownStub as any;

    sidenavService.isMobile.set(true);
    fixture.detectChanges();

    fixture.componentInstance.toggleDropdown();

    expect(openSignal()).toBe(true);
    expect(mockCallbackHolder.callback).not.toBeNull();
  });

  it("should open the dropdown on content init when defaultOpen is true", () => {
    const openSignal = signal(false);
    const dropdownStub = { open: openSignal, element: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixture.componentInstance.dropdown = dropdownStub as any;
    fixture.componentRef.setInput("defaultOpen", true);

    fixture.componentInstance.ngAfterContentInit();

    expect(openSignal()).toBe(true);
  });

  it("should not open the dropdown on content init when defaultOpen is false", () => {
    const openSignal = signal(false);
    const dropdownStub = { open: openSignal, element: jest.fn() };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixture.componentInstance.dropdown = dropdownStub as any;

    fixture.componentInstance.ngAfterContentInit();

    expect(openSignal()).toBe(false);
  });

  it("Escape key handler should focus trigger after closing", () => {
    jest.useFakeTimers();

    const openSignal = signal(true);
    const mockDropdownEl = document.createElement("div");

    const dropdownStub = {
      open: openSignal,
      element: () => mockDropdownEl,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fixture.componentInstance.dropdown = dropdownStub as any;
    fixture.componentInstance.ngAfterViewInit();

    sidenavService.isCollapsed.set(true);
    fixture.detectChanges();

    const actualTriggerBtn = fixture.nativeElement.querySelector(".tedi-sidenav-item__title") as HTMLElement;
    const focusSpy = jest.spyOn(actualTriggerBtn, "focus");

    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));

    expect(openSignal()).toBe(false);

    jest.runAllTimers();

    expect(focusSpy).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
