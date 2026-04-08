/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { OverlayContainer } from "@angular/cdk/overlay";
import { DropdownComponent } from "./dropdown.component";
import { DropdownTriggerDirective } from "./dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "./dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "./dropdown-item/dropdown-item.component";

@Component({
  standalone: true,
  template: `
    <tedi-dropdown [value]="value">
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
}

describe("DropdownComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let hostEl: HTMLElement;
  let dropdown: DropdownComponent;
  let overlayContainerElement: HTMLElement;

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

    const overlayContainer = TestBed.inject(OverlayContainer);
    overlayContainerElement = overlayContainer.getContainerElement();

    fixture.detectChanges();

    const dropdownDebug = fixture.debugElement.query(
      By.directive(DropdownComponent),
    );
    dropdown = dropdownDebug.componentInstance as DropdownComponent;
  });

  afterEach(() => {
    dropdown.hideDropdown();
    overlayContainerElement.innerHTML = "";
  });

  const getTrigger = () =>
    hostEl.querySelector("[tedi-dropdown-trigger]") as HTMLButtonElement;

  const getItems = () =>
    Array.from(
      overlayContainerElement.querySelectorAll("li[tedi-dropdown-item]"),
    ) as HTMLLIElement[];

  const openDropdown = () => {
    dropdown.showDropdown();
    fixture.detectChanges();
  };

  it("should create host & dropdown", () => {
    expect(host).toBeTruthy();
    expect(dropdown).toBeTruthy();
  });

  it("showDropdown() should open dropdown and set active item", () => {
    expect(dropdown.isOpen()).toBe(false);

    openDropdown();

    expect(dropdown.isOpen()).toBe(true);

    const items = getItems();
    const activeItem = items.find((li) => li.getAttribute("tabindex") === "0");
    expect(activeItem).toBeDefined();
    expect(activeItem?.textContent).toContain("Item B");
  });

  it("hideDropdown() should close dropdown and reset tabindices", () => {
    openDropdown();
    expect(dropdown.isOpen()).toBe(true);

    dropdown.hideDropdown();
    fixture.detectChanges();

    expect(dropdown.isOpen()).toBe(false);
  });

  it("toggleDropdown() should open when closed and close when open", () => {
    expect(dropdown.isOpen()).toBe(false);

    dropdown.toggleDropdown();
    fixture.detectChanges();
    expect(dropdown.isOpen()).toBe(true);

    dropdown.toggleDropdown();
    fixture.detectChanges();
    expect(dropdown.isOpen()).toBe(false);
  });

  it("focusFirstItem() should focus first enabled item", () => {
    openDropdown();
    dropdown.focusFirstItem();
    fixture.detectChanges();

    const items = getItems();
    const first = items[0];

    expect(document.activeElement).toBe(first);
    expect(first.getAttribute("tabindex")).toBe("0");
  });

  it("focusLastItem() should focus last enabled item (skipping disabled)", () => {
    openDropdown();
    dropdown.focusLastItem();
    fixture.detectChanges();

    const items = getItems();
    const expected = items[1];

    expect(document.activeElement).toBe(expected);
    expect(expected.getAttribute("tabindex")).toBe("0");
  });

  it("focusNextItem() should move focus to next enabled item", () => {
    openDropdown();
    const items = getItems();

    dropdown.focusNextItem(items[0]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[1]);
  });

  it("focusPrevItem() should move focus to previous enabled item", () => {
    openDropdown();
    const items = getItems();

    dropdown.focusPrevItem(items[1]);
    fixture.detectChanges();
    expect(document.activeElement).toBe(items[0]);
  });

  it("DropdownTrigger: ArrowDown should open dropdown and focus first item", () => {
    jest.useFakeTimers();
    const trigger = getTrigger();

    const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
    trigger.dispatchEvent(event);
    fixture.detectChanges();
    jest.runAllTimers();
    jest.useRealTimers();

    expect(dropdown.isOpen()).toBe(true);
    const items = getItems();
    const first = items[0];
    expect(document.activeElement).toBe(first);
  });

  it("DropdownTrigger: Escape should hide dropdown and keep focus on trigger", () => {
    openDropdown();
    const trigger = getTrigger();
    const focusSpy = jest.spyOn(trigger, "focus");

    const event = new KeyboardEvent("keydown", { key: "Escape" });
    trigger.dispatchEvent(event);
    fixture.detectChanges();

    expect(dropdown.isOpen()).toBe(false);
    expect(focusSpy).toHaveBeenCalled();
  });

  it("DropdownItem: Enter selects value and hides dropdown in listbox mode", () => {
    host.role = "listbox";
    fixture.detectChanges();
    openDropdown();

    const items = getItems();
    const second = items[1];

    const event = new KeyboardEvent("keydown", { key: "Enter" });
    second.dispatchEvent(event);
    fixture.detectChanges();

    expect(dropdown.value()).toBe("b");
    expect(dropdown.isOpen()).toBe(false);
  });

  it("DropdownItem: disabled item should ignore click and keyboard", () => {
    openDropdown();
    const items = getItems();
    const disabledItem = items[2];

    disabledItem.click();
    const event = new KeyboardEvent("keydown", { key: "Enter" });
    disabledItem.dispatchEvent(event);
    fixture.detectChanges();

    expect(dropdown.value()).toBe("b");
    expect(dropdown.isOpen()).toBe(true);
  });

  describe("onOutsideClick()", () => {
    it("should hide dropdown without refocusing trigger", () => {
      openDropdown();

      const hideSpy = jest.spyOn(dropdown, "hideDropdown");
      const triggerEl = dropdown.dropdownTrigger()!.host.nativeElement;
      const focusSpy = jest.spyOn(triggerEl, "focus");

      dropdown.onOutsideClick();

      expect(hideSpy).toHaveBeenCalled();
      expect(focusSpy).not.toHaveBeenCalled();
    });
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
      openDropdown();
      items = getItems();
      itemA = items[0];
      itemB = items[1];
      itemC = items[2];
    });

    it("onClick: enabled item should call onItemSelect()", () => {
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
      const setSpy = jest.spyOn(dropdown.value, "set");

      itemB.dispatchEvent(new KeyboardEvent("keydown", { key: " " }));
      fixture.detectChanges();

      expect(setSpy).toHaveBeenCalledWith("b");
    });

    it("keydown: Escape should hide dropdown & return focus to trigger", () => {
      const hideSpy = jest.spyOn(dropdown, "hideDropdown");
      const focusSpy = jest.spyOn(getTrigger(), "focus");

      itemB.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      fixture.detectChanges();

      expect(hideSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
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
      jest.useFakeTimers();
      const showSpy = jest.spyOn(dropdown, "showDropdown");
      const focusSpy = jest.spyOn(dropdown, "focusFirstItem");

      expect(dropdown.isOpen()).toBe(false);

      const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
      trigger.dispatchEvent(event);
      fixture.detectChanges();
      jest.runAllTimers();
      jest.useRealTimers();

      expect(showSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });

    it("ArrowDown should only focus first item when dropdown already open", () => {
      jest.useFakeTimers();
      openDropdown();

      const showSpy = jest.spyOn(dropdown, "showDropdown");
      const focusSpy = jest.spyOn(dropdown, "focusFirstItem");

      const event = new KeyboardEvent("keydown", { key: "ArrowDown" });
      trigger.dispatchEvent(event);
      fixture.detectChanges();
      jest.runAllTimers();
      jest.useRealTimers();

      expect(showSpy).not.toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });

    it("ArrowUp should open dropdown (if closed) and focus last item", () => {
      jest.useFakeTimers();
      const showSpy = jest.spyOn(dropdown, "showDropdown");
      const focusSpy = jest.spyOn(dropdown, "focusLastItem");

      expect(dropdown.isOpen()).toBe(false);

      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      trigger.dispatchEvent(event);
      fixture.detectChanges();
      jest.runAllTimers();
      jest.useRealTimers();

      expect(showSpy).toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });

    it("ArrowUp should only focus last item when dropdown already open", () => {
      jest.useFakeTimers();
      openDropdown();

      const showSpy = jest.spyOn(dropdown, "showDropdown");
      const focusSpy = jest.spyOn(dropdown, "focusLastItem");

      const event = new KeyboardEvent("keydown", { key: "ArrowUp" });
      trigger.dispatchEvent(event);
      fixture.detectChanges();
      jest.runAllTimers();
      jest.useRealTimers();

      expect(showSpy).not.toHaveBeenCalled();
      expect(focusSpy).toHaveBeenCalled();
    });

    it("Escape should hide dropdown and return focus to trigger", () => {
      openDropdown();

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
});
