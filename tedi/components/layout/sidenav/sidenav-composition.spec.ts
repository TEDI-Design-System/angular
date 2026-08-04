import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { SideNavComponent } from "./sidenav.component";
import { SideNavListComponent } from "./sidenav-list/sidenav-list.component";
import { SideNavItemComponent } from "./sidenav-item/sidenav-item.component";
import { SideNavDropdownComponent } from "./sidenav-dropdown/sidenav-dropdown.component";
import { SideNavDropdownItemComponent } from "./sidenav-dropdown-item/sidenav-dropdown-item.component";
import { SideNavDropdownGroupComponent } from "./sidenav-dropdown-group/sidenav-dropdown-group.component";
import { SideNavDropdownGroupParentDirective } from "./sidenav-dropdown-group/sidenav-dropdown-group-parent.directive";
import { SideNavDropdownGroupListComponent } from "./sidenav-dropdown-group/sidenav-dropdown-group-list.component";
import { SideNavGroupTitleComponent } from "./sidenav-group-title/sidenav-group-title.component";
import { SideNavService } from "../../../services/sidenav/sidenav.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

@Component({
  standalone: true,
  imports: [
    SideNavComponent,
    SideNavListComponent,
    SideNavItemComponent,
    SideNavDropdownComponent,
    SideNavDropdownItemComponent,
    SideNavDropdownGroupComponent,
    SideNavDropdownGroupParentDirective,
    SideNavDropdownGroupListComponent,
    SideNavGroupTitleComponent,
  ],
  template: `
    <nav tedi-sidenav>
      <div class="brand">Brand</div>
      <ul tedi-sidenav-list>
        <li tedi-sidenav-group-title>Main</li>
        <li tedi-sidenav-item icon="home" href="/">Home</li>
        <li tedi-sidenav-item icon="work">
          Clinical
          <ul tedi-sidenav-dropdown>
            <li tedi-sidenav-dropdown-item href="/vitals">Vitals</li>
            <li tedi-sidenav-dropdown-group>
              <a tedi-sidenav-dropdown-group-parent href="/treatments"
                >Treatments</a
              >
              <ul tedi-sidenav-dropdown-group-list>
                <li tedi-sidenav-dropdown-item href="/active">Active</li>
                <li tedi-sidenav-dropdown-item href="/history">History</li>
              </ul>
            </li>
          </ul>
        </li>
      </ul>
      <div class="footer">Footer</div>
    </nav>
  `,
})
class NativeHost {}

const desktopService = () => ({
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
  setOpenGroup: jest.fn(),
  clearOpenGroup: jest.fn(),
  handleGoToMainMenu: jest.fn(),
  handleBackToParentMenu: jest.fn(),
  handleCollapse: jest.fn(),
});

// Full-composition tests for the native `li`/`ul` API: the whole
// component tree is rendered via a host, complementing the isolated `nav` unit
// tests in `sidenav.component.spec.ts`.
describe("SideNav native API", () => {
  let fixture: ComponentFixture<NativeHost>;
  let nav: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NativeHost],
      providers: [
        { provide: SideNavService, useValue: desktopService() },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });
    fixture = TestBed.createComponent(NativeHost);
    fixture.detectChanges();
    nav = fixture.debugElement.query(By.css("nav.tedi-sidenav")).nativeElement;
  });

  it("renders a single semantic list of real <li> items (no auto-wrapper duplicate)", () => {
    const lists = nav.querySelectorAll("ul.tedi-sidenav__list");
    expect(lists).toHaveLength(1);
    const directChildren = Array.from(lists[0].children);
    expect(directChildren.length).toBeGreaterThan(0);
    expect(directChildren.every((el) => el.tagName === "LI")).toBe(true);
  });

  it("nests the dropdown as a real <ul> under the item <li>", () => {
    const item = Array.from(nav.querySelectorAll("li.tedi-sidenav-item")).find(
      (li) => /Clinical/.test(li.textContent ?? ""),
    )!;
    const dropdown = item.querySelector("ul.tedi-sidenav-dropdown")!;
    expect(dropdown).toBeTruthy();
    expect(
      Array.from(dropdown.children).every((el) => el.tagName === "LI"),
    ).toBe(true);
  });

  it("renders a native dropdown-group as parent link + nested list (no re-render mirror)", () => {
    const group = nav.querySelector("li.tedi-sidenav-dropdown-group")!;
    expect(
      group.querySelector(
        ".tedi-sidenav-dropdown-group__parent a.tedi-sidenav-dropdown-item__trigger",
      ),
    ).toBeTruthy();
    const nestedList = group.querySelector(
      "ul.tedi-sidenav-dropdown-group__list",
    )!;
    expect(
      nestedList.querySelectorAll("li.tedi-sidenav-dropdown-item"),
    ).toHaveLength(2);
    expect(group.querySelector('[style*="display: none"]')).toBeNull();
  });

  it("projects consumer header/footer as siblings of the list", () => {
    expect(nav.querySelector(":scope > .brand")).toBeTruthy();
    expect(nav.querySelector(":scope > .footer")).toBeTruthy();
  });

  it("uses no role=presentation or display:contents mitigation (issue #307)", () => {
    expect(nav.querySelectorAll('[role="presentation"]')).toHaveLength(0);
    expect(nav.querySelectorAll('[style*="display: contents"]')).toHaveLength(
      0,
    );
  });
});
