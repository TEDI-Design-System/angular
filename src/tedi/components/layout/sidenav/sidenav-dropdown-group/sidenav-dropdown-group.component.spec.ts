import { QueryList } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SideNavDropdownGroupComponent } from "./sidenav-dropdown-group.component";
import { SideNavDropdownItemComponent } from "../sidenav-dropdown-item/sidenav-dropdown-item.component";

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

  it("should have the base CSS class", () => {
    expect(groupEl.classList.contains("tedi-sidenav-dropdown-group")).toBe(
      true,
    );
  });

  it("should set itemsArray from ContentChildren in ngAfterContentInit", () => {
    const mockItems = {
      toArray: () => [{ id: 1 }, { id: 2 }],
      changes: { subscribe: jest.fn() },
    } as unknown as QueryList<SideNavDropdownItemComponent>;

    fixture.componentInstance.items = mockItems;
    fixture.componentInstance.ngAfterContentInit();

    expect(fixture.componentInstance.firstItem()).toEqual({ id: 1 });
    expect(fixture.componentInstance.restItems()).toEqual([{ id: 2 }]);
  });

  it("should update itemsArray when items.changes emits", () => {
    let changeCallback: () => void = () => {};
    const mockItems = {
      toArray: jest.fn().mockReturnValue([{ id: 1 }]),
      changes: {
        subscribe: (cb: () => void) => {
          changeCallback = cb;
        },
      },
    } as unknown as QueryList<SideNavDropdownItemComponent>;

    fixture.componentInstance.items = mockItems;
    fixture.componentInstance.ngAfterContentInit();

    expect(fixture.componentInstance.firstItem()).toEqual({ id: 1 });

    mockItems.toArray = jest
      .fn()
      .mockReturnValue([{ id: 1 }, { id: 2 }, { id: 3 }]);
    changeCallback();

    expect(fixture.componentInstance.firstItem()).toEqual({ id: 1 });
    expect(fixture.componentInstance.restItems()).toEqual([
      { id: 2 },
      { id: 3 },
    ]);
  });
});
