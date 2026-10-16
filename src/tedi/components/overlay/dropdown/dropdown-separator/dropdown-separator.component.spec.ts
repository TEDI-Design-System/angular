import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OverlayContainer } from "@angular/cdk/overlay";
import { By } from "@angular/platform-browser";
import { DropdownComponent } from "../dropdown.component";
import { DropdownTriggerDirective } from "../dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "../dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../dropdown-item/dropdown-item.component";
import { DropdownRole } from "../dropdown.tokens";
import { DropdownSeparatorComponent } from "./dropdown-separator.component";

@Component({
  standalone: true,
  template: `
    <tedi-dropdown>
      <button tedi-dropdown-trigger>Trigger</button>

      <tedi-dropdown-content [dropdownRole]="role" [divided]="divided">
        <li tedi-dropdown-item value="a">Item A</li>
        <li tedi-dropdown-separator></li>
        <li tedi-dropdown-item value="b">Item B</li>
      </tedi-dropdown-content>
    </tedi-dropdown>
  `,
  imports: [
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemComponent,
    DropdownSeparatorComponent,
  ],
})
class TestHostComponent {
  role: DropdownRole = "menu";
  divided = false;
}

describe("DropdownSeparatorComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let dropdown: DropdownComponent;
  let overlayContainerElement: HTMLElement;

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Element.prototype as any).scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TestHostComponent] });
    fixture = TestBed.createComponent(TestHostComponent);
    overlayContainerElement =
      TestBed.inject(OverlayContainer).getContainerElement();
    fixture.detectChanges();
    dropdown = fixture.debugElement.query(By.directive(DropdownComponent))
      .componentInstance as DropdownComponent;
  });

  afterEach(() => {
    dropdown.hideDropdown();
    overlayContainerElement.innerHTML = "";
  });

  const open = () => {
    dropdown.showDropdown();
    fixture.detectChanges();
  };

  const getSeparator = () =>
    document.querySelector("li[tedi-dropdown-separator]") as HTMLLIElement;

  it("renders between the items in projection order", () => {
    open();

    const children = Array.from(
      overlayContainerElement.querySelector(".tedi-dropdown-content__list")!
        .children,
    );
    expect(children.map((el) => el.textContent?.trim() || "—")).toEqual([
      "Item A",
      "—",
      "Item B",
    ]);
    expect(getSeparator().classList).toContain("tedi-dropdown-separator");
  });

  it("is a separator in a menu", () => {
    open();

    expect(getSeparator().getAttribute("role")).toBe("separator");
    expect(getSeparator().hasAttribute("aria-hidden")).toBe(false);
  });

  it.each<DropdownRole>(["listbox", "list"])(
    "is hidden from assistive technology in a %s",
    (role) => {
      fixture.componentInstance.role = role;
      fixture.detectChanges();
      open();

      expect(getSeparator().getAttribute("role")).toBe("none");
      expect(getSeparator().getAttribute("aria-hidden")).toBe("true");
    },
  );

  it("is skipped by keyboard navigation", () => {
    open();
    const [first, second] = Array.from(
      overlayContainerElement.querySelectorAll("li[tedi-dropdown-item]"),
    ) as HTMLLIElement[];

    dropdown.focusNextItem(first);

    expect(document.activeElement).toBe(second);
  });

  it("adds the divided modifier to the content", () => {
    const content = () =>
      overlayContainerElement.querySelector(
        ".tedi-dropdown-content",
      ) as HTMLElement;

    open();
    expect(content().classList).not.toContain("tedi-dropdown-content--divided");

    dropdown.hideDropdown();
    fixture.componentInstance.divided = true;
    fixture.detectChanges();
    open();
    expect(content().classList).toContain("tedi-dropdown-content--divided");
  });
});
