import { Component, signal } from "@angular/core";
import { ComponentFixture, fakeAsync, TestBed, tick } from "@angular/core/testing";
import { BreakpointObserver } from "@angular/cdk/layout";
import { Subject } from "rxjs";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { BREAKPOINTS } from "../../../services/breakpoint/breakpoint.service";
import { ButtonVariant, ButtonSize } from "../button/button.component";
import { ButtonGroupComponent } from "./button-group.component";
import { ButtonGroupButtonDirective } from "./button-group-button/button-group-button.directive";

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
      breakpoints[`(min-width: ${value}rem)`] =
        breakpoint !== undefined && value <= BREAKPOINTS[breakpoint];
    }
    this.state$.next({ breakpoints });
  }
}

@Component({
  standalone: true,
  imports: [ButtonGroupComponent, ButtonGroupButtonDirective],
  template: `
    <tedi-button-group
      [variant]="variant()"
      [size]="size()"
      [multiple]="multiple()"
      [value]="value()"
      (valueChange)="value.set($event)"
      [ariaLabel]="ariaLabel()"
      [stretch]="stretch()"
      [enableMobileDropdown]="enableMobileDropdown()"
      [dropdownLabelMode]="dropdownLabelMode()"
      [dropdownLabel]="dropdownLabel()"
      (selectionChange)="onSelect($event)"
    >
      <button tedi-button-group-button value="1" label="Details">Details</button>
      <button
        tedi-button-group-button
        value="2"
        label="Updates"
        [iconLeft]="iconLeft()"
        [iconRight]="iconRight()"
        [icon]="iconOnly()"
      >
        Updates
      </button>
      <button
        tedi-button-group-button
        value="3"
        label="Settings"
        [disabled]="disable3()"
      >
        Settings
      </button>
    </tedi-button-group>
  `,
})
class TestHostComponent {
  variant = signal<ButtonVariant>("primary-button-group");
  size = signal<ButtonSize>("default");
  multiple = signal(false);
  value = signal<string | string[] | undefined>("2");
  ariaLabel = signal<string | undefined>("Tabs");
  stretch = signal(false);
  enableMobileDropdown = signal(false);
  dropdownLabelMode = signal<"selected" | "static">("static");
  dropdownLabel = signal<string | undefined>(undefined);
  disable3 = signal(false);
  iconLeft = signal<string | undefined>("refresh");
  iconRight = signal<string | undefined>(undefined);
  iconOnly = signal<string | undefined>(undefined);
  lastToggled = signal<string | null>(null);

  onSelect(value: string) {
    this.lastToggled.set(value);
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
      ":scope tedi-button-group > [tedi-button-group-button]",
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

  it("should create with role=group and aria-label", () => {
    expect(getRoot()).toBeTruthy();
    expect(getRoot().getAttribute("role")).toBe("group");
    expect(getRoot().getAttribute("aria-label")).toBe("Tabs");
  });

  it("should render one button per item", () => {
    const items = getItems();
    expect(items.length).toBe(3);
    items.forEach((b) => expect(b.tagName).toBe("BUTTON"));
  });

  it("should apply tedi-button + inherited variant/size classes to items", () => {
    const items = getItems();
    items.forEach((b) => {
      expect(b.classList).toContain("tedi-button");
      expect(b.classList).toContain("tedi-button--primary-button-group");
      expect(b.classList).toContain("tedi-button--default");
    });

    host.variant.set("secondary-button-group");
    host.size.set("small");
    fixture.detectChanges();

    items.forEach((b) => {
      expect(b.classList).toContain("tedi-button--secondary-button-group");
      expect(b.classList).toContain("tedi-button--small");
    });
  });

  it("should derive aria-pressed from the group value (single)", () => {
    const items = getItems();
    expect(items[0].getAttribute("aria-pressed")).toBe("false");
    expect(items[1].getAttribute("aria-pressed")).toBe("true");
    expect(items[2].getAttribute("aria-pressed")).toBe("false");
  });

  it("should not set aria-current on items", () => {
    getItems().forEach((b) =>
      expect(b.hasAttribute("aria-current")).toBe(false),
    );
  });

  it("should select on click and emit selectionChange (single)", () => {
    getItems()[0].click();
    fixture.detectChanges();

    expect(host.value()).toBe("1");
    expect(host.lastToggled()).toBe("1");
    expect(getItems()[0].getAttribute("aria-pressed")).toBe("true");
    expect(getItems()[1].getAttribute("aria-pressed")).toBe("false");
  });

  it("should deselect when re-clicking the active item (single)", () => {
    getItems()[1].click();
    fixture.detectChanges();

    expect(host.value()).toBeUndefined();
    expect(getItems()[1].getAttribute("aria-pressed")).toBe("false");
  });

  it("should toggle array membership when multiple", () => {
    host.multiple.set(true);
    host.value.set([]);
    fixture.detectChanges();

    getItems()[0].click();
    fixture.detectChanges();
    expect(host.value()).toEqual(["1"]);

    getItems()[2].click();
    fixture.detectChanges();
    expect(host.value()).toEqual(["1", "3"]);

    getItems()[0].click();
    fixture.detectChanges();
    expect(host.value()).toEqual(["3"]);

    expect(getItems()[0].getAttribute("aria-pressed")).toBe("false");
    expect(getItems()[2].getAttribute("aria-pressed")).toBe("true");
  });

  it("should disable items via the native disabled attribute", () => {
    host.disable3.set(true);
    fixture.detectChanges();

    expect(getItems()[2].disabled).toBe(true);
  });

  it("should ignore clicks on disabled items", () => {
    host.disable3.set(true);
    fixture.detectChanges();

    getItems()[2].click();
    fixture.detectChanges();

    expect(host.lastToggled()).toBeNull();
    expect(host.value()).toBe("2");
  });

  it("should toggle the stretch modifier on the host", () => {
    expect(getRoot().classList).not.toContain("tedi-button-group--stretch");

    host.stretch.set(true);
    fixture.detectChanges();

    expect(getRoot().classList).toContain("tedi-button-group--stretch");
  });

  it("should wrap the label text in a padded span", () => {
    const label = getItems()[0].querySelector(
      ".tedi-button-group-button__label",
    );
    expect(label).toBeTruthy();
    expect(label?.textContent?.trim()).toBe("Details");
  });

  it("should keep the icon flush before the wrapped label", () => {
    const item = getItems()[1];
    expect(item.firstElementChild?.tagName.toLowerCase()).toBe("tedi-icon");
    expect(item.lastElementChild?.classList).toContain(
      "tedi-button-group-button__label",
    );
  });

  describe("auto-rendered icons", () => {
    it("should prepend an icon when iconLeft is set", () => {
      const item = getItems()[1];
      expect(item.querySelector("tedi-icon")).toBeTruthy();
      expect(item.firstElementChild?.tagName.toLowerCase()).toBe("tedi-icon");
    });

    it("should append an icon when iconRight is set", () => {
      host.iconRight.set("arrow_right");
      fixture.detectChanges();

      expect(getItems()[1].lastElementChild?.tagName.toLowerCase()).toBe(
        "tedi-icon",
      );
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

      expect(
        getItems()[1].querySelector("tedi-icon")?.textContent?.trim(),
      ).toBe("table");
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
    beforeEach(fakeAsync(() => {
      host.enableMobileDropdown.set(true);
      bpObserver.emit("sm");
      fixture.detectChanges();
      tick();
    }));

    function getTrigger(): HTMLElement {
      return fixture.nativeElement.querySelector(
        ".tedi-button-group__dropdown-trigger",
      );
    }

    it("should collapse into a dropdown trigger below md", () => {
      expect(getTrigger()).toBeTruthy();
      expect(getRoot().classList).toContain("tedi-button-group--dropdown-mode");
    });

    it("should drop role=group while in dropdown mode", () => {
      expect(getRoot().hasAttribute("role")).toBe(false);
    });

    it("should use the buttonGroup.menu fallback label by default", () => {
      expect(getTrigger().textContent).toContain("buttonGroup.menu");
    });

    it("should use the selected item's label when dropdownLabelMode is selected", fakeAsync(() => {
      host.dropdownLabelMode.set("selected");
      fixture.detectChanges();
      tick();

      expect(getTrigger().textContent).toContain("Updates");
    }));

    it("should fall back to static label in multiple mode", fakeAsync(() => {
      host.multiple.set(true);
      host.value.set(["1", "2"]);
      host.dropdownLabelMode.set("selected");
      fixture.detectChanges();
      tick();

      expect(getTrigger().textContent).toContain("buttonGroup.menu");
    }));

    it("should keep a static trigger icon in static mode", () => {
      expect(getTrigger().querySelector("tedi-icon")?.textContent?.trim()).toBe(
        "menu",
      );
    });

    it("should reflect the selected item's icon when dropdownLabelMode is selected", fakeAsync(() => {
      host.dropdownLabelMode.set("selected");
      fixture.detectChanges();
      tick();

      expect(getTrigger().querySelector("tedi-icon")?.textContent?.trim()).toBe(
        "refresh",
      );
    }));

  function openDropdown() {
    const trigger = document.querySelector(".tedi-button-group__dropdown-trigger") as HTMLElement;
    trigger.click();
  }

    it("should mark selected dropdown items", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      openDropdown();
      fixture.detectChanges();
      tick();

      const selected = document.querySelector(
        ".tedi-dropdown-item--selected",
      );
      expect(selected?.textContent).toContain("Updates");
    }));

    it("should toggle selection from a dropdown item click", fakeAsync(() => {
      fixture.detectChanges();
      tick();
      openDropdown();
      fixture.detectChanges();
      tick();

      const items = document.querySelectorAll<HTMLElement>(
        "li[tedi-dropdown-item]",
      );
      items[0].click();
      fixture.detectChanges();
      tick();

      expect(host.value()).toBe("1");
    }));

    it("should ignore clicks on disabled dropdown items", fakeAsync(() => {
      host.disable3.set(true);
      fixture.detectChanges();
      tick();
      openDropdown();
      fixture.detectChanges();
      tick();

      const items = document.querySelectorAll<HTMLElement>(
        "li[tedi-dropdown-item]",
      );
      items[2].click();
      fixture.detectChanges();
      tick();

      expect(host.lastToggled()).toBeNull();
    }));

    it("should switch back to the strip when the viewport grows", fakeAsync(() => {
      bpObserver.emit("lg");
      fixture.detectChanges();
      tick();

      expect(getTrigger()).toBeFalsy();
      expect(getItems().length).toBe(3);
      expect(getRoot().getAttribute("role")).toBe("group");
    }));
  });
});
