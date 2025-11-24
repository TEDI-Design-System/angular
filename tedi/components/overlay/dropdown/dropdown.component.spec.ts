/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DropdownComponent } from "./dropdown.component";
import { DropdownTriggerDirective } from "./dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "./dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "./dropdown-item/dropdown-item.component";
import { NgxFloatUiContentComponent } from "ngx-float-ui";

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
});
