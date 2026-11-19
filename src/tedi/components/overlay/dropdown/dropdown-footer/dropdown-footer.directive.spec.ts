import { Component } from "@angular/core";
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
import { DropdownContentComponent } from "../dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../dropdown-item/dropdown-item.component";
import { DropdownRole } from "../dropdown.tokens";
import { DropdownFooterDirective } from "./dropdown-footer.directive";

@Component({
  standalone: true,
  template: `
    <button>Before</button>
    <tedi-dropdown>
      <button tedi-dropdown-trigger>Trigger</button>

      <tedi-dropdown-content>
        <li tedi-dropdown-item value="a">Item A</li>
        <li tedi-dropdown-item value="b">Item B</li>
        <div tedi-dropdown-footer>
          <button>Help</button>
          <button>Log out</button>
        </div>
      </tedi-dropdown-content>
    </tedi-dropdown>
    <button>After</button>
  `,
  imports: [
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemComponent,
    DropdownFooterDirective,
  ],
})
class TestHostComponent {}

describe("DropdownFooterDirective", () => {
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
    flush();
  };

  const getFooter = () =>
    overlayContainerElement.querySelector(
      "[tedi-dropdown-footer]",
    ) as HTMLElement;
  const getFooterButtons = () =>
    Array.from(getFooter().querySelectorAll("button")) as HTMLButtonElement[];
  const getItems = () =>
    Array.from(
      overlayContainerElement.querySelectorAll("li[tedi-dropdown-item]"),
    ) as HTMLLIElement[];
  const getTrigger = () =>
    fixture.nativeElement.querySelector(
      "[tedi-dropdown-trigger]",
    ) as HTMLButtonElement;
  const keydown = (el: HTMLElement, init: KeyboardEventInit) => {
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ...init,
    });
    el.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  it("renders below the list, outside the widget", fakeAsync(() => {
    open();

    const footer = getFooter();
    expect(footer.classList).toContain("tedi-dropdown-footer");
    expect(footer.previousElementSibling?.tagName).toBe("UL");
    expect(footer.closest("[role='menu']")).toBeNull();
    expect(
      overlayContainerElement.querySelector(".tedi-dropdown-content")
        ?.classList,
    ).toContain("tedi-dropdown-content--with-footer");
  }));

  it("moves to the first footer control on ArrowDown from the last item", fakeAsync(() => {
    open();
    dropdown.focusLastItem();

    keydown(getItems()[1], { key: "ArrowDown" });

    expect(document.activeElement).toBe(getFooterButtons()[0]);
  }));

  it("moves to the first footer control on Tab from an item", fakeAsync(() => {
    open();
    dropdown.focusFirstItem();

    const event = keydown(getItems()[0], { key: "Tab" });

    expect(event.defaultPrevented).toBe(true);
    expect(dropdown.isOpen()).toBe(true);
    expect(document.activeElement).toBe(getFooterButtons()[0]);
  }));

  it.each([{ key: "ArrowUp" }, { key: "Tab", shiftKey: true }])(
    "returns to the active item on %p",
    fakeAsync((init: KeyboardEventInit) => {
      open();
      dropdown.focusLastItem();
      keydown(getItems()[1], { key: "ArrowDown" });

      const event = keydown(getFooterButtons()[0], init);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(getItems()[1]);
    }),
  );

  it("closes and focuses the trigger on Escape", fakeAsync(() => {
    open();
    getFooterButtons()[0].focus();

    const event = keydown(getFooterButtons()[0], { key: "Escape" });

    expect(event.defaultPrevented).toBe(true);
    expect(dropdown.isOpen()).toBe(false);
    expect(document.activeElement).toBe(getTrigger());
  }));

  it("leaves the dropdown on Tab from the last footer control", fakeAsync(() => {
    open();
    const [, logOut] = getFooterButtons();
    logOut.focus();

    const event = keydown(logOut, { key: "Tab" });

    expect(event.defaultPrevented).toBe(true);
    expect(dropdown.isOpen()).toBe(false);
    expect(document.activeElement?.textContent).toBe("After");
  }));

  it("leaves the dropdown backwards on Shift+Tab from an item", fakeAsync(() => {
    open();
    dropdown.focusFirstItem();

    keydown(getItems()[0], { key: "Tab", shiftKey: true });

    expect(dropdown.isOpen()).toBe(false);
    expect(document.activeElement?.textContent).toBe("Before");
  }));

  it("leaves Tab between footer controls to the browser", fakeAsync(() => {
    open();
    const [help, logOut] = getFooterButtons();

    expect(keydown(help, { key: "Tab" }).defaultPrevented).toBe(false);
    expect(
      keydown(logOut, { key: "Tab", shiftKey: true }).defaultPrevented,
    ).toBe(false);
    expect(keydown(help, { key: "a" }).defaultPrevented).toBe(false);
    expect(dropdown.isOpen()).toBe(true);
  }));
});

@Component({
  standalone: true,
  template: `
    <button>Before</button>
    <tedi-dropdown>
      <button tedi-dropdown-trigger>Trigger</button>

      <tedi-dropdown-content [dropdownRole]="role">
        <li tedi-dropdown-item value="a"><a href="/a">Item A</a></li>
        <div tedi-dropdown-footer>
          @if (withControl) {
            <button>Log out</button>
          } @else {
            Signed in as Mari
          }
        </div>
      </tedi-dropdown-content>
    </tedi-dropdown>
    <button>After</button>
  `,
  imports: [
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemComponent,
    DropdownFooterDirective,
  ],
})
class FooterVariantsHostComponent {
  role: DropdownRole = "menu";
  withControl = true;
}

describe("DropdownFooterDirective variants", () => {
  let fixture: ComponentFixture<FooterVariantsHostComponent>;
  let dropdown: DropdownComponent;

  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Element.prototype as any).scrollIntoView = jest.fn();
  });

  const setup = (role: DropdownRole, withControl: boolean) => {
    TestBed.configureTestingModule({ imports: [FooterVariantsHostComponent] });
    fixture = TestBed.createComponent(FooterVariantsHostComponent);
    fixture.componentInstance.role = role;
    fixture.componentInstance.withControl = withControl;
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    dropdown = fixture.debugElement.query(By.directive(DropdownComponent))
      .componentInstance as DropdownComponent;
    dropdown.showDropdown();
    fixture.detectChanges();
    flush();
  };

  afterEach(() => {
    dropdown.hideDropdown();
    fixture.nativeElement.remove();
    TestBed.inject(OverlayContainer).getContainerElement().innerHTML = "";
  });

  const press = (el: HTMLElement, init: KeyboardEventInit) => {
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      ...init,
    });
    el.dispatchEvent(event);
    fixture.detectChanges();
    return event;
  };

  it.each([{ key: "ArrowUp" }, { key: "Tab", shiftKey: true }])(
    "leaves %p on the footer to the browser in a plain list",
    fakeAsync((init: KeyboardEventInit) => {
      setup("list", true);
      const logOut = document.querySelector(
        "[tedi-dropdown-footer] button",
      ) as HTMLButtonElement;
      logOut.focus();

      expect(press(logOut, init).defaultPrevented).toBe(false);
      expect(dropdown.isOpen()).toBe(true);
    }),
  );

  it("leaves the dropdown on Tab from an item when the footer has no control", fakeAsync(() => {
    setup("menu", false);
    dropdown.focusFirstItem();
    const item = document.querySelector(
      "li[tedi-dropdown-item]",
    ) as HTMLElement;

    press(item, { key: "Tab" });

    expect(dropdown.isOpen()).toBe(false);
    expect(document.activeElement?.textContent).toBe("After");
  }));
});
