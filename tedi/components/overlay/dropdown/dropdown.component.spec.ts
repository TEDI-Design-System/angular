/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, ViewEncapsulation } from "@angular/core";
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DropdownComponent } from "./dropdown.component";
import { DropdownTriggerDirective } from "./dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "./dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "./dropdown-item/dropdown-item.component";
import { NgxFloatUiContentComponent } from "ngx-float-ui";

@Component({
  standalone: true,
  template: `
    <tedi-dropdown [value]="value" [hideOnScroll]="hideOnScroll">
      <button tedi-dropdown-trigger>Trigger</button>

      <tedi-dropdown-content [dropdownRole]="role">
        <li tedi-dropdown-item value="a">Item A</li>
        <li tedi-dropdown-item value="b">Item B</li>
        <li tedi-dropdown-item value="c" [disabled]="true">
          Item C (disabled)
        </li>
      </tedi-dropdown-content>
    </tedi-dropdown>
  `,
  imports: [
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemComponent,
  ],
})
class TestHostComponent {
  value = "b";
  role: "menu" | "listbox" = "listbox";
  hideOnScroll = false;
}

@Component({
  selector: "app-button",
  standalone: true,
  template: `<button><ng-content /></button>`,
  encapsulation: ViewEncapsulation.None,
})
class MockButtonComponent {}

@Component({
  standalone: true,
  template: `
    <tedi-dropdown>
      <app-button tedi-dropdown-trigger>Trigger</app-button>

      <tedi-dropdown-content>
        <li tedi-dropdown-item value="a">Item A</li>
      </tedi-dropdown-content>
    </tedi-dropdown>
  `,
  imports: [
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemComponent,
    MockButtonComponent,
  ],
})
class WrappingButtonHostComponent {}

describe("DropdownComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let hostEl: HTMLElement;
  let dropdown: DropdownComponent;
  let floatUi: NgxFloatUiContentComponent;

  beforeAll(() => {
    (Element.prototype as any).scrollIntoView = jest.fn();
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    hostEl = fixture.nativeElement;

    fixture.detectChanges();

    const dropdownDebug = fixture.debugElement.query(
      By.directive(DropdownComponent),
    );
    dropdown = dropdownDebug.componentInstance as DropdownComponent;

    floatUi = dropdown.floatUiComponent() as NgxFloatUiContentComponent;
  });

  const getTrigger = () =>
    hostEl.querySelector("[tedi-dropdown-trigger]") as HTMLButtonElement;

  const getItems = () =>
    Array.from(
      hostEl.querySelectorAll("li[tedi-dropdown-item]"),
    ) as HTMLLIElement[];

  it("should create host & dropdown", () => {
    expect(host).toBeTruthy();
    expect(dropdown).toBeTruthy();
  });

  it("showDropdown() should open dropdown, set display to block and set active item", () => {
    (floatUi as any).state = false;
    const showSpy = jest.spyOn(floatUi, "show");

    dropdown.showDropdown();
    fixture.detectChanges();

    expect(showSpy).toHaveBeenCalled();
    expect(dropdown.floatUiDisplay()).toBe("block");

    const items = getItems();
    const activeItem = items.find((li) => li.getAttribute("tabindex") === "0");
    expect(activeItem).toBeDefined();
    expect(activeItem?.textContent).toContain("Item B");
  });

  it("hideDropdown() should close dropdown, reset display and tabindices", () => {
    (floatUi as any).state = true;
    const hideSpy = jest.spyOn(floatUi, "hide");

    dropdown.hideDropdown();
    fixture.detectChanges();

    expect(hideSpy).toHaveBeenCalled();
    expect(dropdown.floatUiDisplay()).toBe("inline");

    const items = getItems();
    const role = dropdown.dropdownContent().dropdownRole();
    items.forEach((li, index) => {
      const disabled = index === 2;
      const tabindex = li.getAttribute("tabindex");

      if (role === "listbox" && disabled) {
        expect(tabindex).toBeNull();
      } else {
        expect(tabindex).toBe("-1");
      }
    });
  });

  it("toggleDropdown() should open when closed and close when open", () => {
    (floatUi as any).state = false;
    const showSpy = jest.spyOn(floatUi, "show");
    const hideSpy = jest.spyOn(floatUi, "hide");

    dropdown.toggleDropdown();
    fixture.detectChanges();
    expect(showSpy).toHaveBeenCalled();

    (floatUi as any).state = true;
    dropdown.toggleDropdown();
    fixture.detectChanges();
    expect(hideSpy).toHaveBeenCalled();
  });

  describe("hideOnScroll", () => {
    it("sets up a scroll listener when opened with hideOnScroll true", () => {
      host.hideOnScroll = true;
      fixture.detectChanges();
      (floatUi as any).state = false;

      dropdown.showDropdown();

      expect((dropdown as any).scrollListener).toBeDefined();
    });

    it("does not set up a scroll listener when hideOnScroll is false", () => {
      host.hideOnScroll = false;
      fixture.detectChanges();
      (floatUi as any).state = false;

      dropdown.showDropdown();

      expect((dropdown as any).scrollListener).toBeUndefined();
    });

    it("hides the dropdown on scroll when hideOnScroll is true", () => {
      host.hideOnScroll = true;
      fixture.detectChanges();
      (floatUi as any).state = false;
      dropdown.showDropdown();

      const hideSpy = jest.spyOn(dropdown, "hideDropdown");
      (floatUi as any).state = true;
      document.dispatchEvent(new Event("scroll"));

      expect(hideSpy).toHaveBeenCalled();
      expect((dropdown as any).scrollListener).toBeUndefined();
    });

    it("cleans up the scroll listener on destroy", () => {
      host.hideOnScroll = true;
      fixture.detectChanges();
      (floatUi as any).state = false;
      dropdown.showDropdown();

      fixture.destroy();

      expect((dropdown as any).scrollListener).toBeUndefined();
    });
  });

  it("focusFirstItem() should focus first enabled item", () => {
    dropdown.focusFirstItem();
    fixture.detectChanges();

    const items = getItems();
    const first = items[0];

    expect(document.activeElement).toBe(first);
    expect(first.getAttribute("tabindex")).toBe("0");
  });

  it("focusLastItem() should focus last enabled item (skipping disabled)", () => {
    dropdown.focusLastItem();
    fixture.detectChanges();

    const items = getItems();
    const expected = items[1];

    expect(document.activeElement).toBe(expected);
    expect(expected.getAttribute("tabindex")).toBe("0");
  });

  it("focusNextItem() should move focus to next enabled item", () => {
    const items = getItems();

    dropdown.focusNextItem(items[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[1]);
  });

  it("focusPrevItem() should move focus to previous enabled item", () => {
    const items = getItems();

    dropdown.focusPrevItem(items[1]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[0]);
  });

  it("DropdownTrigger: ArrowDown should open dropdown and focus first item", () => {
    const trigger = getTrigger();

    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    trigger.dispatchEvent(event);
    fixture.detectChanges();

    const items = getItems();
    const first = items[0];
    expect(document.activeElement).toBe(first);
  });

  it("DropdownTrigger: Escape should hide dropdown and keep focus on trigger", () => {
    (floatUi as any).state = true;
    const hideSpy = jest.spyOn(floatUi, "hide");
    const trigger = getTrigger();
    const focusSpy = jest.spyOn(trigger, "focus");

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    trigger.dispatchEvent(event);
    fixture.detectChanges();

    expect(hideSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });

  it("DropdownItem: Enter selects value and hides dropdown in listbox mode", () => {
    host.role = "listbox";
    fixture.detectChanges();

    const items = getItems();
    const second = items[1];

    (floatUi as any).state = true;
    const hideSpy = jest.spyOn(floatUi, "hide");

    const event = new KeyboardEvent("keydown", { key: "Enter" });
    second.dispatchEvent(event);
    fixture.detectChanges();

    expect(dropdown.value()).toBe("b");
    expect(hideSpy).toHaveBeenCalled();
  });

  it("DropdownItem: disabled item should ignore click and keyboard", () => {
    const items = getItems();
    const disabledItem = items[2];

    const hideSpy = jest.spyOn(floatUi, "hide");

    disabledItem.click();
    const event = new KeyboardEvent("keydown", { key: "Enter" });
    disabledItem.dispatchEvent(event);
    fixture.detectChanges();

    expect(dropdown.value()).toBe("b");
    expect(hideSpy).not.toHaveBeenCalled();
  });

  describe("handleOutsideClick()", () => {
    it("should return early when dropdown is closed (state=false)", () => {
      (floatUi as any).state = false;

      const hideSpy = jest.spyOn(dropdown, "hideDropdown");
      const triggerFocusSpy = jest.spyOn(
        dropdown.dropdownTrigger()!.host.nativeElement,
        "focus",
      );

      dropdown.handleOutsideClick(new Event("pointerdown"));

      expect(hideSpy).not.toHaveBeenCalled();
      expect(triggerFocusSpy).not.toHaveBeenCalled();
    });

    it("should do nothing when click is inside the trigger element", () => {
      (floatUi as any).state = true;

      const triggerEl = dropdown.dropdownTrigger()!.host.nativeElement;
      const hideSpy = jest.spyOn(dropdown, "hideDropdown");
      const focusSpy = jest.spyOn(triggerEl, "focus");

      const fakeEvent = {
        target: triggerEl,
      } as unknown as Event;

      dropdown.handleOutsideClick(fakeEvent);

      expect(hideSpy).not.toHaveBeenCalled();
      expect(focusSpy).not.toHaveBeenCalled();
    });

    it("should do nothing when click is inside the content element", () => {
      (floatUi as any).state = true;

      const contentEl = dropdown.floatUiComponent().elRef.nativeElement;
      const hideSpy = jest.spyOn(dropdown, "hideDropdown");
      const focusSpy = jest.spyOn(
        dropdown.dropdownTrigger()!.host.nativeElement,
        "focus",
      );

      const fakeEvent = {
        target: contentEl,
      } as unknown as Event;

      dropdown.handleOutsideClick(fakeEvent);

      expect(hideSpy).not.toHaveBeenCalled();
      expect(focusSpy).not.toHaveBeenCalled();
    });

    it("should hide dropdown and focus trigger when clicking outside", () => {
      (floatUi as any).state = true;

      const hideSpy = jest.spyOn(dropdown, "hideDropdown");

      const triggerEl = dropdown.dropdownTrigger()!.host.nativeElement;
      const focusSpy = jest.spyOn(triggerEl, "focus");

      const outsideTarget = document.createElement("div");

      const fakeEvent = {
        target: outsideTarget,
      } as unknown as Event;

      dropdown.handleOutsideClick(fakeEvent);

      expect(hideSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });
  });

  describe("handleFocusOut()", () => {
    it("should return early when dropdown is closed (state=false)", () => {
      (floatUi as any).state = false;

      const hideSpy = jest.spyOn(dropdown, "hideDropdown");

      dropdown.handleFocusOut({
        target: document.createElement("div"),
      } as unknown as FocusEvent);

      expect(hideSpy).not.toHaveBeenCalled();
    });

    it("should do nothing when focus moves inside the trigger element", () => {
      (floatUi as any).state = true;

      const hideSpy = jest.spyOn(dropdown, "hideDropdown");

      dropdown.handleFocusOut({
        target: dropdown.dropdownTrigger()!.host.nativeElement,
      } as unknown as FocusEvent);

      expect(hideSpy).not.toHaveBeenCalled();
    });

    it("should do nothing when focus moves inside the content element", () => {
      (floatUi as any).state = true;

      const hideSpy = jest.spyOn(dropdown, "hideDropdown");

      dropdown.handleFocusOut({
        target: dropdown.floatUiComponent().elRef.nativeElement,
      } as unknown as FocusEvent);

      expect(hideSpy).not.toHaveBeenCalled();
    });

    it("should hide dropdown without refocusing trigger when focus leaves (e.g. Tab)", () => {
      (floatUi as any).state = true;

      const hideSpy = jest.spyOn(dropdown, "hideDropdown");
      const focusSpy = jest.spyOn(
        dropdown.dropdownTrigger()!.host.nativeElement,
        "focus",
      );

      dropdown.handleFocusOut({
        target: document.createElement("div"),
      } as unknown as FocusEvent);

      expect(hideSpy).toHaveBeenCalled();
      expect(focusSpy).not.toHaveBeenCalled();
    });
  });

  describe("tabOutOfDropdown()", () => {
    let before: HTMLButtonElement;
    let after: HTMLButtonElement;

    beforeEach(() => {
      document.body.appendChild(fixture.nativeElement);
      before = document.createElement("button");
      after = document.createElement("button");
      document.body.insertBefore(before, fixture.nativeElement);
      document.body.appendChild(after);
      (floatUi as any).state = true;
    });

    afterEach(() => {
      before.remove();
      after.remove();
      fixture.nativeElement.remove();
    });

    it("Tab closes the dropdown and focuses the element after the trigger", fakeAsync(() => {
      const hideSpy = jest.spyOn(dropdown, "hideDropdown");

      dropdown.tabOutOfDropdown(false);
      tick();

      expect(hideSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(after);
    }));

    it("Shift+Tab closes the dropdown and focuses the element before the trigger", fakeAsync(() => {
      const hideSpy = jest.spyOn(dropdown, "hideDropdown");

      dropdown.tabOutOfDropdown(true);
      tick();

      expect(hideSpy).toHaveBeenCalled();
      expect(document.activeElement).toBe(before);
    }));

    it("excludes dropdown content from the tab target so focus never re-enters the menu", fakeAsync(() => {
      after.remove();

      dropdown.tabOutOfDropdown(false);
      tick();

      const items = getItems();
      expect(items).not.toContain(document.activeElement);
    }));
  });

  describe("setActiveToSelectedOrFirst()", () => {
    it("should activate the selected item when it exists and is enabled", () => {
      host.value = "b";
      fixture.detectChanges();

      const updateSpy = jest.spyOn(dropdown, "updateTabindexes");

      dropdown.setActiveToSelectedOrFirst();
      fixture.detectChanges();

      expect((dropdown as any).activeIndex()).toBe(1);
      expect(updateSpy).toHaveBeenCalled();
    });

    it("should fall back to first enabled item when selected item is disabled", () => {
      host.value = "c";
      fixture.detectChanges();

      const updateSpy = jest.spyOn(dropdown, "updateTabindexes");

      dropdown.setActiveToSelectedOrFirst();
      fixture.detectChanges();

      expect((dropdown as any).activeIndex()).toBe(0);
      expect(updateSpy).toHaveBeenCalled();
    });

    it("should activate the first enabled item when selected value does not exist", () => {
      host.value = "x";
      fixture.detectChanges();

      dropdown.setActiveToSelectedOrFirst();
      fixture.detectChanges();

      expect((dropdown as any).activeIndex()).toBe(0);
    });
  });

  describe("DropdownItemComponent (unit behaviors)", () => {
    let items: HTMLLIElement[];
    let itemA: HTMLLIElement;
    let itemB: HTMLLIElement;
    let itemC: HTMLLIElement;

    beforeEach(() => {
      items = getItems();
      itemA = items[0];
      itemB = items[1];
      itemC = items[2];
    });

    it("onClick: enabled item should call onItemSelect()", () => {
      (floatUi as any).state = true;

      const hideSpy = jest.spyOn(dropdown, "hideDropdown");
      const focusSpy = jest.spyOn(getTrigger(), "focus");
      const setSpy = jest.spyOn(dropdown.value, "set");

      itemA.click();
      fixture.detectChanges();

      expect(setSpy).toHaveBeenCalledWith("a");
      expect(hideSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });

    it("onClick: disabled item should NOT select or hide dropdown", () => {
      const hideSpy = jest.spyOn(dropdown, "hideDropdown");
      const setSpy = jest.spyOn(dropdown.value, "set");

      itemC.click();
      fixture.detectChanges();

      expect(setSpy).not.toHaveBeenCalled();
      expect(hideSpy).not.toHaveBeenCalled();
    });

    it("keydown: ArrowDown should call dropdown.focusNextItem()", () => {
      const spy = jest.spyOn(dropdown, "focusNextItem");

      itemA.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown" }));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(itemA);
    });

    it("keydown: ArrowUp should call dropdown.focusPrevItem()", () => {
      const spy = jest.spyOn(dropdown, "focusPrevItem");

      itemB.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp" }));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(itemB);
    });

    it("keydown: Home should call dropdown.focusFirstItem()", () => {
      const spy = jest.spyOn(dropdown, "focusFirstItem");

      itemB.dispatchEvent(new KeyboardEvent("keydown", { key: "Home" }));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });

    it("keydown: End should call dropdown.focusLastItem()", () => {
      const spy = jest.spyOn(dropdown, "focusLastItem");

      itemA.dispatchEvent(new KeyboardEvent("keydown", { key: "End" }));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });

    it("keydown: Enter should select the item & hide dropdown", () => {
      (floatUi as any).state = true;

      const setSpy = jest.spyOn(dropdown.value, "set");
      const hideSpy = jest.spyOn(dropdown, "hideDropdown");
      const focusSpy = jest.spyOn(getTrigger(), "focus");

      itemA.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
      fixture.detectChanges();

      expect(setSpy).toHaveBeenCalledWith("a");
      expect(hideSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });

    it("keydown: Space should select the item & hide dropdown", () => {
      (floatUi as any).state = true;

      const setSpy = jest.spyOn(dropdown.value, "set");

      itemB.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      fixture.detectChanges();

      expect(setSpy).toHaveBeenCalledWith("b");
    });

    it("keydown: Escape should hide dropdown & return focus to trigger", () => {
      (floatUi as any).state = true;

      const hideSpy = jest.spyOn(dropdown, "hideDropdown");
      const focusSpy = jest.spyOn(getTrigger(), "focus");

      itemB.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      fixture.detectChanges();

      expect(hideSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });

    it("keydown: Tab calls dropdown.tabOutOfDropdown(false)", () => {
      const spy = jest.spyOn(dropdown, "tabOutOfDropdown");

      itemA.dispatchEvent(new KeyboardEvent("keydown", { key: "Tab" }));
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(false);
    });

    it("keydown: Shift+Tab calls dropdown.tabOutOfDropdown(true)", () => {
      const spy = jest.spyOn(dropdown, "tabOutOfDropdown");

      itemA.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab", shiftKey: true }),
      );
      fixture.detectChanges();

      expect(spy).toHaveBeenCalledWith(true);
    });

    it("keydown: disabled item should preventDefault and NOT process", () => {
      const event = new KeyboardEvent("keydown", { key: "Enter" });
      const preventSpy = jest.spyOn(event, "preventDefault");

      itemC.dispatchEvent(event);
      fixture.detectChanges();

      const setSpy = jest.spyOn(dropdown.value, "set");

      expect(preventSpy).toHaveBeenCalled();
      expect(setSpy).not.toHaveBeenCalled();
    });
  });

  describe("DropdownTriggerDirective", () => {
    let trigger: HTMLButtonElement;

    beforeEach(() => {
      trigger = getTrigger();
    });

    it("click should call dropdown.toggleDropdown()", () => {
      const spy = jest.spyOn(dropdown, "toggleDropdown");

      trigger.click();
      fixture.detectChanges();

      expect(spy).toHaveBeenCalled();
    });

    it("ArrowDown should open dropdown (if closed) and focus first item", () => {
      const showSpy = jest.spyOn(dropdown, "showDropdown");
      const focusSpy = jest.spyOn(dropdown, "focusFirstItem");

      (floatUi as any).state = false;

      const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
      trigger.dispatchEvent(event);
      fixture.detectChanges();

      expect(showSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });

    it("ArrowDown should only focus first item when dropdown already open", () => {
      const showSpy = jest.spyOn(dropdown, "showDropdown");
      const focusSpy = jest.spyOn(dropdown, "focusFirstItem");

      (floatUi as any).state = true;

      const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
      trigger.dispatchEvent(event);
      fixture.detectChanges();

      expect(showSpy).not.toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });

    it("ArrowUp should open dropdown (if closed) and focus last item", () => {
      const showSpy = jest.spyOn(dropdown, "showDropdown");
      const focusSpy = jest.spyOn(dropdown, "focusLastItem");

      (floatUi as any).state = false;

      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      trigger.dispatchEvent(event);
      fixture.detectChanges();

      expect(showSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });

    it("ArrowUp should only focus last item when dropdown already open", () => {
      const showSpy = jest.spyOn(dropdown, "showDropdown");
      const focusSpy = jest.spyOn(dropdown, "focusLastItem");

      (floatUi as any).state = true;

      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      trigger.dispatchEvent(event);
      fixture.detectChanges();

      expect(showSpy).not.toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });

    it("Escape should hide dropdown and return focus to trigger", () => {
      (floatUi as any).state = true;

      const hideSpy = jest.spyOn(dropdown, "hideDropdown");
      const focusSpy = jest.spyOn(trigger, "focus");

      const event = new KeyboardEvent("keydown", { key: "Escape" });
      trigger.dispatchEvent(event);
      fixture.detectChanges();

      expect(hideSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });

    it("should set correct ARIA attributes", () => {
      expect(trigger.getAttribute("aria-haspopup")).toBe("menu");
      expect(trigger.getAttribute("aria-expanded")).toBe("false");
      expect(trigger.getAttribute("role")).toBeNull();
      expect(trigger.getAttribute("tabindex")).toBeNull();
    });
  });

  describe("DropdownTriggerDirective on a wrapping button component", () => {
    let wrappedFixture: ComponentFixture<WrappingButtonHostComponent>;
    let wrappedDropdown: DropdownComponent;
    let wrapperEl: HTMLElement;
    let innerButton: HTMLButtonElement;

    beforeEach(() => {
      wrappedFixture = TestBed.createComponent(WrappingButtonHostComponent);
      wrappedFixture.detectChanges();

      wrappedDropdown = wrappedFixture.debugElement.query(
        By.directive(DropdownComponent),
      ).componentInstance as DropdownComponent;

      wrapperEl = wrappedFixture.nativeElement.querySelector(
        "[tedi-dropdown-trigger]",
      ) as HTMLElement;
      innerButton = wrapperEl.querySelector("button") as HTMLButtonElement;
    });

    it("applies ARIA/role/tabindex to the inner button, not the wrapper", () => {
      expect(wrapperEl.tagName).toBe("APP-BUTTON");

      expect(innerButton.getAttribute("aria-haspopup")).toBe("menu");
      expect(innerButton.getAttribute("aria-expanded")).toBe("false");
      expect(innerButton.getAttribute("aria-controls")).toBe(
        wrappedDropdown.containerId(),
      );
      expect(innerButton.getAttribute("id")).toBe(
        `${wrappedDropdown.containerId()}_trigger`,
      );

      expect(innerButton.getAttribute("role")).toBeNull();
      expect(innerButton.getAttribute("tabindex")).toBeNull();
    });

    it("does not turn the wrapper into a second tab stop", () => {
      expect(wrapperEl.getAttribute("role")).toBeNull();
      expect(wrapperEl.getAttribute("tabindex")).toBeNull();
      expect(wrapperEl.getAttribute("aria-expanded")).toBeNull();
    });

    it("keeps aria-expanded in sync on the inner button", () => {
      const wrappedFloatUi = wrappedDropdown.floatUiComponent() as any;

      wrappedFloatUi.state = false;
      wrappedDropdown.showDropdown();
      wrappedFixture.detectChanges();
      expect(innerButton.getAttribute("aria-expanded")).toBe("true");

      wrappedFloatUi.state = true;
      wrappedDropdown.hideDropdown();
      wrappedFixture.detectChanges();
      expect(innerButton.getAttribute("aria-expanded")).toBe("false");
    });

    it("focus() targets the inner button", () => {
      const focusSpy = jest.spyOn(innerButton, "focus");

      wrappedDropdown.dropdownTrigger().focus();

      expect(focusSpy).toHaveBeenCalled();
    });
  });
});
