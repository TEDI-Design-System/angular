import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BreakpointObserver } from "@angular/cdk/layout";
import { Subject } from "rxjs";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { BREAKPOINTS } from "../../../services/breakpoint/breakpoint.service";
import {
  ButtonGroupComponent,
  ButtonGroupVariant,
} from "./button-group.component";
import { ButtonGroupItemDirective } from "./button-group-item/button-group-item.directive";

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

class BreakpointObserverMock {
  state$ = new Subject<{ breakpoints: Record<string, boolean> }>();

  observe() {
    return this.state$.asObservable();
  }

  emit(breakpoint: keyof typeof BREAKPOINTS | undefined) {
    const breakpoints: Record<string, boolean> = {};
    for (const value of Object.values(BREAKPOINTS)) {
      breakpoints[`(min-width: ${value}px)`] =
        breakpoint !== undefined && value <= BREAKPOINTS[breakpoint];
    }
    this.state$.next({ breakpoints });
  }
}

@Component({
  standalone: true,
  imports: [ButtonGroupComponent, ButtonGroupItemDirective],
  template: `
    <tedi-button-group
      [variant]="variant()"
      [ariaLabel]="ariaLabel()"
      [stretch]="stretch()"
      [enableMobileDropdown]="enableMobileDropdown()"
      [dropdownLabelMode]="dropdownLabelMode()"
      [dropdownLabel]="dropdownLabel()"
      (selectionChange)="onSelect($event)"
    >
      <button tedi-button-group-item id="1" label="Details" [selected]="active() === '1'">
        Details
      </button>
      <button
        tedi-button-group-item
        id="2"
        label="Updates"
        [iconLeft]="iconLeft()"
        [iconRight]="iconRight()"
        [icon]="iconOnly()"
        [selected]="active() === '2'"
      >
        Updates
      </button>
      <button
        tedi-button-group-item
        id="3"
        label="Settings"
        [selected]="active() === '3'"
        [disabled]="disable3()"
      >
        Settings
      </button>
    </tedi-button-group>
  `,
})
class TestHostComponent {
  variant = signal<ButtonGroupVariant>("primary");
  ariaLabel = signal<string | undefined>("Tabs");
  stretch = signal(false);
  enableMobileDropdown = signal(false);
  dropdownLabelMode = signal<"selected" | "static">("static");
  dropdownLabel = signal<string | undefined>(undefined);
  disable3 = signal(false);
  active = signal("2");
  selected = signal<string | null>(null);
  iconLeft = signal<string | undefined>("refresh");
  iconRight = signal<string | undefined>(undefined);
  iconOnly = signal<string | undefined>(undefined);

  onSelect(id: string) {
    this.selected.set(id);
    this.active.set(id);
  }
}

describe("ButtonGroupComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let bpObserver: BreakpointObserverMock;

  function getRoot(): HTMLElement {
    return fixture.nativeElement.querySelector("tedi-button-group");
  }

  function getItems(): NodeListOf<HTMLButtonElement> {
    return fixture.nativeElement.querySelectorAll(
      ":scope tedi-button-group > [tedi-button-group-item]",
    );
  }

  beforeEach(() => {
    bpObserver = new BreakpointObserverMock();

    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        { provide: BreakpointObserver, useValue: bpObserver },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    bpObserver.emit("lg");
    fixture.detectChanges();
  });

  it("should create with role=group and aria-label per TEDI spec", () => {
    expect(getRoot()).toBeTruthy();
    expect(getRoot().getAttribute("role")).toBe("group");
    expect(getRoot().getAttribute("aria-label")).toBe("Tabs");
  });

  it("should project one item per consumer-provided button", () => {
    const items = getItems();
    expect(items.length).toBe(3);
    items.forEach((b) => expect(b.tagName).toBe("BUTTON"));
  });

  it("should apply variant modifier class on host", () => {
    expect(getRoot().classList).toContain("tedi-button-group--primary");

    host.variant.set("secondary");
    fixture.detectChanges();

    expect(getRoot().classList).toContain("tedi-button-group--secondary");
    expect(getRoot().classList).not.toContain("tedi-button-group--primary");
  });

  it("should toggle stretch modifier on host", () => {
    expect(getRoot().classList).not.toContain("tedi-button-group--stretch");

    host.stretch.set(true);
    fixture.detectChanges();

    expect(getRoot().classList).toContain("tedi-button-group--stretch");
  });

  it("should mark the selected item with --selected class", () => {
    const items = getItems();
    expect(items[0].classList).not.toContain("tedi-button-group__item--selected");
    expect(items[1].classList).toContain("tedi-button-group__item--selected");
    expect(items[2].classList).not.toContain("tedi-button-group__item--selected");
  });

  it("should set aria-pressed on button hosts", () => {
    const items = getItems();
    expect(items[0].getAttribute("aria-pressed")).toBe("false");
    expect(items[1].getAttribute("aria-pressed")).toBe("true");
    expect(items[2].getAttribute("aria-pressed")).toBe("false");
  });

  it("should not set aria-current on button hosts", () => {
    const items = getItems();
    items.forEach((b) =>
      expect(b.hasAttribute("aria-current")).toBe(false),
    );
  });

  it("should update aria-pressed when selection changes", () => {
    host.active.set("3");
    fixture.detectChanges();

    const items = getItems();
    expect(items[0].getAttribute("aria-pressed")).toBe("false");
    expect(items[1].getAttribute("aria-pressed")).toBe("false");
    expect(items[2].getAttribute("aria-pressed")).toBe("true");
  });

  it("should disable native buttons via the disabled attribute", () => {
    host.disable3.set(true);
    fixture.detectChanges();

    const items = getItems();
    expect(items[2].disabled).toBe(true);
    expect(items[2].classList).toContain("tedi-button-group__item--disabled");
  });

  it("should emit selectionChange with item id on click", () => {
    getItems()[0].click();
    expect(host.selected()).toBe("1");

    getItems()[2].click();
    expect(host.selected()).toBe("3");
  });

  it("should ignore clicks on disabled items", () => {
    host.disable3.set(true);
    fixture.detectChanges();

    getItems()[2].click();
    expect(host.selected()).toBeNull();
  });

  describe("auto-rendered icons", () => {
    it("should prepend an icon when iconLeft is set", () => {
      const icon = getItems()[1].querySelector("tedi-icon");
      expect(icon).toBeTruthy();
      expect(getItems()[1].firstElementChild?.tagName.toLowerCase()).toBe(
        "tedi-icon",
      );
    });

    it("should append an icon when iconRight is set", () => {
      host.iconRight.set("arrow_right");
      fixture.detectChanges();

      const item = getItems()[1];
      expect(item.lastElementChild?.tagName.toLowerCase()).toBe("tedi-icon");
    });

    it("should remove the icon when the input is cleared", () => {
      expect(getItems()[1].querySelector("tedi-icon")).toBeTruthy();

      host.iconLeft.set(undefined);
      fixture.detectChanges();

      expect(getItems()[1].querySelector("tedi-icon")).toBeFalsy();
    });

    it("should update the icon name when it changes", () => {
      host.iconLeft.set("table");
      fixture.detectChanges();

      const icon = getItems()[1].querySelector("tedi-icon");
      expect(icon?.textContent?.trim()).toBe("table");
    });

    it("should set aria-label from label in icon-only mode", () => {
      host.iconLeft.set(undefined);
      host.iconOnly.set("settings");
      fixture.detectChanges();

      expect(getItems()[1].getAttribute("aria-label")).toBe("Updates");
    });

    it("should not set aria-label when icon-only mode is off", () => {
      expect(getItems()[1].hasAttribute("aria-label")).toBe(false);
    });
  });

  describe("mobile dropdown", () => {
    beforeEach(() => {
      host.enableMobileDropdown.set(true);
      bpObserver.emit("sm");
      fixture.detectChanges();
    });

    function getDropdownTrigger(): HTMLElement {
      return fixture.nativeElement.querySelector(
        ".tedi-button-group__dropdown-trigger",
      );
    }

    it("should collapse into a dropdown trigger below md", () => {
      expect(getDropdownTrigger()).toBeTruthy();
      expect(getRoot().classList).toContain(
        "tedi-button-group--dropdown-mode",
      );
    });

    it("should hide projected items via the dropdown-mode class (CSS)", () => {
      // items are still in the DOM (consumer projected them) but hidden via CSS
      expect(getItems().length).toBe(3);
      expect(getRoot().classList).toContain("tedi-button-group--dropdown-mode");
    });

    it("should drop role=group on the host while in dropdown mode", () => {
      expect(getRoot().hasAttribute("role")).toBe(false);
    });

    it("should use the buttonGroup.menu fallback label by default", () => {
      expect(getDropdownTrigger().textContent).toContain("buttonGroup.menu");
    });

    it("should use the selected item's label when dropdownLabelMode is selected", () => {
      host.dropdownLabelMode.set("selected");
      fixture.detectChanges();

      expect(getDropdownTrigger().textContent).toContain("Updates");
    });

    it("should ignore clicks on disabled dropdown items", () => {
      host.disable3.set(true);
      fixture.detectChanges();

      const dropdownItems = fixture.nativeElement.querySelectorAll(
        ".tedi-button-group__dropdown-item",
      );
      dropdownItems[2].click();
      expect(host.selected()).toBeNull();
    });

    it("should use the custom dropdownLabel when provided", () => {
      host.dropdownLabel.set("Choose");
      fixture.detectChanges();

      expect(getDropdownTrigger().textContent).toContain("Choose");
    });

    it("should switch back to the strip when viewport grows", () => {
      bpObserver.emit("lg");
      fixture.detectChanges();

      expect(getDropdownTrigger()).toBeFalsy();
      expect(getItems().length).toBe(3);
      expect(getRoot().getAttribute("role")).toBe("group");
    });
  });
});
