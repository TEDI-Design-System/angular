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
import { DropdownHeaderDirective } from "./dropdown-header.directive";

@Component({
  standalone: true,
  template: `
    <tedi-dropdown>
      <button tedi-dropdown-trigger>Trigger</button>

      <tedi-dropdown-content>
        <div tedi-dropdown-header>
          <input aria-label="Search" />
        </div>
        <li tedi-dropdown-item value="a">Item A</li>
        <li tedi-dropdown-item value="b">Item B</li>
      </tedi-dropdown-content>
    </tedi-dropdown>
  `,
  imports: [
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemComponent,
    DropdownHeaderDirective,
  ],
})
class TestHostComponent {}

describe("DropdownHeaderDirective", () => {
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

  const getInput = () =>
    overlayContainerElement.querySelector("input") as HTMLInputElement;
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

  it("renders above the list, outside the widget", fakeAsync(() => {
    open();

    const header = overlayContainerElement.querySelector(
      "[tedi-dropdown-header]",
    ) as HTMLElement;
    expect(header.classList).toContain("tedi-dropdown-header");
    expect(header.nextElementSibling?.tagName).toBe("UL");
    expect(header.closest("[role='menu']")).toBeNull();
  }));

  it("focuses the header control on open", fakeAsync(() => {
    open();

    expect(document.activeElement).toBe(getInput());
  }));

  it("moves to the first item on ArrowDown", fakeAsync(() => {
    open();

    const event = keydown(getInput(), { key: "ArrowDown" });

    expect(event.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(getItems()[0]);
  }));

  it("returns to the header on ArrowUp from the first item", fakeAsync(() => {
    open();
    keydown(getInput(), { key: "ArrowDown" });

    keydown(getItems()[0], { key: "ArrowUp" });

    expect(document.activeElement).toBe(getInput());
  }));

  it.each([{ key: "Escape" }, { key: "Tab", shiftKey: true }])(
    "closes and focuses the trigger on %p",
    fakeAsync((init: KeyboardEventInit) => {
      open();

      const event = keydown(getInput(), init);

      expect(event.defaultPrevented).toBe(true);
      expect(dropdown.isOpen()).toBe(false);
      expect(document.activeElement).toBe(getTrigger());
    }),
  );

  it("leaves other keys to the control", fakeAsync(() => {
    open();

    expect(keydown(getInput(), { key: "a" }).defaultPrevented).toBe(false);
    expect(keydown(getInput(), { key: "Tab" }).defaultPrevented).toBe(false);
    expect(dropdown.isOpen()).toBe(true);
  }));
});
