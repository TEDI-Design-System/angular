import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SideNavDropdownGroupComponent } from "./sidenav-dropdown-group.component";

describe("SideNavDropdownGroupComponent", () => {
  let fixture: ComponentFixture<SideNavDropdownGroupComponent>;
  let groupEl: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SideNavDropdownGroupComponent],
    });

    fixture = TestBed.createComponent(SideNavDropdownGroupComponent);
    groupEl = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create the component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should have the base and parent-wrapper CSS classes", () => {
    expect(groupEl.classList.contains("tedi-sidenav-dropdown-group")).toBe(true);
    expect(
      groupEl.classList.contains("tedi-sidenav-dropdown-group__parent-wrapper"),
    ).toBe(true);
  });

  it("toggles the drilled-open state and reflects it on the host", () => {
    expect(groupEl.classList.contains("tedi-sidenav-dropdown-group--open")).toBe(
      false,
    );

    fixture.componentInstance.toggle();
    fixture.detectChanges();
    expect(groupEl.classList.contains("tedi-sidenav-dropdown-group--open")).toBe(
      true,
    );

    fixture.componentInstance.toggle();
    fixture.detectChanges();
    expect(groupEl.classList.contains("tedi-sidenav-dropdown-group--open")).toBe(
      false,
    );
  });
});
