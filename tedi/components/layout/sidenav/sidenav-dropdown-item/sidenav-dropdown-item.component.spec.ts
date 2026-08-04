import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SideNavDropdownItemComponent } from "./sidenav-dropdown-item.component";

describe("SideNavDropdownItemComponent", () => {
  let fixture: ComponentFixture<SideNavDropdownItemComponent>;
  let liElement: HTMLLIElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SideNavDropdownItemComponent],
    });

    fixture = TestBed.createComponent(SideNavDropdownItemComponent);
    fixture.detectChanges();
    liElement = fixture.nativeElement;
  });

  it("should create the component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should have the base CSS class on li element", () => {
    expect(liElement.classList.contains("tedi-sidenav-dropdown-item")).toBe(true);
  });

  it("should add selected class when `selected` input is true", () => {
    fixture.componentRef.setInput("selected", true);
    fixture.detectChanges();
    expect(liElement.classList.contains("tedi-sidenav-dropdown-item--selected")).toBe(true);
  });

  it("should set textContent value in ngAfterViewInit when text exists", () => {
    fixture.nativeElement.textContent = "Test Item Text";

    fixture.componentInstance.ngAfterViewInit();

    expect(fixture.componentInstance.textContent()).toBe("Test Item Text");
  });

});
