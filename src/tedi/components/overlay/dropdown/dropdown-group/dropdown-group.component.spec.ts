import { Component, input } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  flush,
} from "@angular/core/testing";
import { OverlayContainer } from "@angular/cdk/overlay";
import { By } from "@angular/platform-browser";
import { DropdownComponent } from "../dropdown.component";
import { DropdownTriggerDirective } from "../dropdown-trigger/dropdown-trigger.directive";
import {
  DropdownContentComponent,
  DropdownRole,
} from "../dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../dropdown-item/dropdown-item.component";
import { DropdownGroupComponent } from "./dropdown-group.component";

@Component({
  standalone: true,
  template: `
    <tedi-dropdown>
      <button tedi-dropdown-trigger>Trigger</button>

      <tedi-dropdown-content [dropdownRole]="role()">
        <li tedi-dropdown-item value="a">Maarika Mets</li>
        <tedi-dropdown-group label="Esindatavad">
          <li tedi-dropdown-item value="b">Kadri Mets</li>
          <li tedi-dropdown-item value="c">Mart Mets</li>
        </tedi-dropdown-group>
      </tedi-dropdown-content>
    </tedi-dropdown>
  `,
  imports: [
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemComponent,
    DropdownGroupComponent,
  ],
})
class TestHostComponent {
  readonly role = input<DropdownRole>("menu");
}

describe("DropdownGroupComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let dropdown: DropdownComponent;
  let overlayContainerElement: HTMLElement;

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Element.prototype as any).scrollIntoView = jest.fn();
  });

  const setup = (role: DropdownRole = "menu") => {
    TestBed.configureTestingModule({ imports: [TestHostComponent] });
    fixture = TestBed.createComponent(TestHostComponent);
    fixture.componentRef.setInput("role", role);
    overlayContainerElement =
      TestBed.inject(OverlayContainer).getContainerElement();
    fixture.detectChanges();
    dropdown = fixture.debugElement.query(By.directive(DropdownComponent))
      .componentInstance as DropdownComponent;
    dropdown.showDropdown();
    fixture.detectChanges();
    flush();
  };

  afterEach(() => {
    dropdown.hideDropdown();
    overlayContainerElement.innerHTML = "";
  });

  // A `list` dropdown renders in place rather than in the overlay.
  const getGroup = () =>
    document.querySelector(".tedi-dropdown-group__item") as HTMLElement;
  const getItems = () =>
    Array.from(
      overlayContainerElement.querySelectorAll("li[tedi-dropdown-item]"),
    ) as HTMLLIElement[];

  it("renders a group named by its title in a menu", fakeAsync(() => {
    setup();

    const group = getGroup();
    const list = group.querySelector("ul") as HTMLElement;
    const title = group.querySelector(
      ".tedi-dropdown-group__title",
    ) as HTMLElement;

    expect(group.getAttribute("role")).toBe("none");
    expect(list.getAttribute("role")).toBe("group");
    expect(list.getAttribute("aria-labelledby")).toBe(title.id);
    expect(title.textContent?.trim()).toBe("Esindatavad");
    expect(title.getAttribute("role")).toBe("none");
    expect(list.querySelectorAll("li[tedi-dropdown-item]").length).toBe(2);
  }));

  it("is a labelled list item in a plain list", fakeAsync(() => {
    setup("list");

    const item = getGroup();
    const host = item.closest("tedi-dropdown-group") as HTMLElement;
    const list = item.querySelector("ul") as HTMLElement;
    const title = item.querySelector(
      ".tedi-dropdown-group__title",
    ) as HTMLElement;

    expect(host.getAttribute("role")).toBe("listitem");
    expect(item.getAttribute("role")).toBe("none");
    expect(list.getAttribute("role")).toBe("list");
    expect(list.getAttribute("aria-labelledby")).toBe(title.id);
  }));

  it("includes the group's items in arrow-key navigation", fakeAsync(() => {
    setup();
    dropdown.focusFirstItem();

    getItems()[0].dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "ArrowDown",
        bubbles: true,
        cancelable: true,
      }),
    );
    fixture.detectChanges();

    expect(document.activeElement).toBe(getItems()[1]);
    expect(getItems()[1].textContent?.trim()).toBe("Kadri Mets");
  }));
});

@Component({
  standalone: true,
  template: `
    <tedi-dropdown>
      <button tedi-dropdown-trigger>Trigger</button>

      <tedi-dropdown-content>
        <tedi-dropdown-group label="Esindatavad">
          <li tedi-dropdown-item value="a">Kadri Mets</li>
          <li tedi-dropdown-item value="b">Mart Mets</li>
        </tedi-dropdown-group>
        <li tedi-dropdown-item value="c">Veiko Mets</li>
      </tedi-dropdown-content>
    </tedi-dropdown>
  `,
  imports: [
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemComponent,
    DropdownGroupComponent,
  ],
})
class GroupFirstHostComponent {}

describe("DropdownGroupComponent before top-level items", () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Element.prototype as any).scrollIntoView = jest.fn();
  });

  it("keeps arrow-key order in document order", fakeAsync(() => {
    TestBed.configureTestingModule({ imports: [GroupFirstHostComponent] });
    const fixture = TestBed.createComponent(GroupFirstHostComponent);
    fixture.detectChanges();
    const dropdown = fixture.debugElement.query(By.directive(DropdownComponent))
      .componentInstance as DropdownComponent;
    const overlay = TestBed.inject(OverlayContainer).getContainerElement();

    dropdown.showDropdown();
    fixture.detectChanges();
    flush();
    const items = Array.from(
      overlay.querySelectorAll("li[tedi-dropdown-item]"),
    ) as HTMLLIElement[];
    dropdown.focusFirstItem();

    for (const expected of ["Mart Mets", "Veiko Mets"]) {
      (document.activeElement as HTMLElement).dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "ArrowDown",
          bubbles: true,
          cancelable: true,
        }),
      );
      fixture.detectChanges();
      expect(document.activeElement?.textContent?.trim()).toBe(expected);
    }
    expect(items).toHaveLength(3);

    dropdown.hideDropdown();
    overlay.innerHTML = "";
  }));
});
