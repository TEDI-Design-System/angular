import { Component, input } from "@angular/core";
import { By } from "@angular/platform-browser";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { TabsComponent } from "./tabs.component";
import { TabsListComponent, TabsOverflowMode } from "./tabs-list/tabs-list.component";
import { TabsTriggerComponent } from "./tabs-trigger/tabs-trigger.component";
import { TabsContentComponent } from "./tabs-content/tabs-content.component";

const mockAfterNextRender: { callback: (() => void) | null } = {
  callback: null,
};

jest.mock("@angular/core", () => {
  const actual = jest.requireActual("@angular/core");
  return {
    ...actual,
    afterNextRender: jest.fn((callback: () => void) => {
      mockAfterNextRender.callback = callback;
      return { destroy: jest.fn() };
    }),
  };
});

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

let resizeCallback: (() => void) | null = null;

const originalResizeObserver = global.ResizeObserver;
const originalScrollIntoView = Element.prototype.scrollIntoView;

beforeAll(() => {
  global.ResizeObserver = jest.fn().mockImplementation((cb: ResizeObserverCallback) => ({
    observe: jest.fn(() => {
      resizeCallback = () => cb([], {} as ResizeObserver);
    }),
    unobserve: jest.fn(),
    disconnect: jest.fn(() => {
      resizeCallback = null;
    }),
  }));
  Element.prototype.scrollIntoView = jest.fn();
});

afterAll(() => {
  global.ResizeObserver = originalResizeObserver;
  Element.prototype.scrollIntoView = originalScrollIntoView;
});

@Component({
  standalone: true,
  imports: [TabsComponent, TabsListComponent, TabsTriggerComponent, TabsContentComponent],
  template: `
    <tedi-tabs [value]="value()" [defaultValue]="defaultValue()" (valueChange)="onChange($event)">
      <tedi-tabs-list aria-label="Test tabs" [overflowMode]="overflowMode()">
        <button tedi-tabs-trigger id="tab-1">Tab 1</button>
        <button tedi-tabs-trigger id="tab-2">Tab 2</button>
        <button tedi-tabs-trigger id="tab-3" [disabled]="true">Tab 3</button>
      </tedi-tabs-list>
      <tedi-tabs-content id="tab-1">Content 1</tedi-tabs-content>
      <tedi-tabs-content id="tab-2">Content 2</tedi-tabs-content>
      <tedi-tabs-content id="tab-3">Content 3</tedi-tabs-content>
    </tedi-tabs>
  `,
})
class HostComponent {
  value = input<string>();
  defaultValue = input("tab-1");
  overflowMode = input<TabsOverflowMode>("dropdown");
  onChange = jest.fn();
}

const setup = () => {
  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [
      { provide: TediTranslationService, useClass: TranslationMock },
      { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
    ],
  });
  const fixture = TestBed.createComponent(HostComponent);
  fixture.detectChanges();
  return fixture;
};

const tabs = (fixture: ComponentFixture<HostComponent>) =>
  fixture.debugElement.queryAll(By.css('[role="tab"]')).map((d) => d.nativeElement as HTMLButtonElement);

const visiblePanelText = (fixture: ComponentFixture<HostComponent>) =>
  fixture.debugElement
    .queryAll(By.css("tedi-tabs-content:not([hidden])"))
    .map((d) => (d.nativeElement as HTMLElement).textContent?.trim());

const simulateOverflow = (fixture: ComponentFixture<HostComponent>) => {
  const list = fixture.debugElement.query(By.css('[role="tablist"]')).nativeElement as HTMLElement;
  Object.defineProperty(list, "scrollWidth", { value: 500, configurable: true });
  Object.defineProperty(list, "clientWidth", { value: 300, configurable: true });
  const wrapper = fixture.debugElement.query(By.css(".tedi-tabs-list")).nativeElement as HTMLElement;
  Object.defineProperty(wrapper, "clientWidth", { value: 300, configurable: true });
  resizeCallback?.();
  fixture.detectChanges();
};

describe("Tabs", () => {
  it("renders the tablist with correct role and label", () => {
    const fixture = setup();
    const list = fixture.debugElement.query(By.css('[role="tablist"]')).nativeElement as HTMLElement;
    expect(list).toBeTruthy();
    expect(list.getAttribute("aria-label")).toBe("Test tabs");
  });

  it("renders tab triggers with correct roles", () => {
    const fixture = setup();
    expect(tabs(fixture)).toHaveLength(3);
  });

  it("renders the default active tab content only", () => {
    const fixture = setup();
    expect(visiblePanelText(fixture)).toEqual(["Content 1"]);
  });

  it("switches tab on click", () => {
    const fixture = setup();
    tabs(fixture)[1].click();
    fixture.detectChanges();
    expect(visiblePanelText(fixture)).toEqual(["Content 2"]);
  });

  it("sets aria-selected correctly", () => {
    const fixture = setup();
    expect(tabs(fixture)[0].getAttribute("aria-selected")).toBe("true");
    expect(tabs(fixture)[1].getAttribute("aria-selected")).toBe("false");

    tabs(fixture)[1].click();
    fixture.detectChanges();
    expect(tabs(fixture)[0].getAttribute("aria-selected")).toBe("false");
    expect(tabs(fixture)[1].getAttribute("aria-selected")).toBe("true");
  });

  it("links triggers and panels via aria-controls/aria-labelledby", () => {
    const fixture = setup();
    expect(tabs(fixture)[0].getAttribute("aria-controls")).toBe("tab-1-panel");
    const panel = fixture.debugElement.query(By.css('[role="tabpanel"]:not([hidden])')).nativeElement as HTMLElement;
    expect(panel.getAttribute("aria-labelledby")).toBe("tab-1");
    expect(panel.getAttribute("id")).toBe("tab-1-panel");
  });

  it("manages tabIndex so only the selected tab is in tab order", () => {
    const fixture = setup();
    expect(tabs(fixture)[0].getAttribute("tabindex")).toBe("0");
    expect(tabs(fixture)[1].getAttribute("tabindex")).toBe("-1");
  });

  it("does not set tabindex on the tabpanel", () => {
    const fixture = setup();
    const panel = fixture.debugElement.query(By.css('[role="tabpanel"]:not([hidden])')).nativeElement as HTMLElement;
    expect(panel.hasAttribute("tabindex")).toBe(false);
  });

  it("navigates with ArrowRight", () => {
    const fixture = setup();
    tabs(fixture)[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs(fixture)[1]);
    expect(visiblePanelText(fixture)).toEqual(["Content 2"]);
  });

  it("navigates with ArrowLeft and wraps around", () => {
    const fixture = setup();
    tabs(fixture)[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    fixture.detectChanges();
    // tab-3 is disabled, so wrapping lands on tab-2
    expect(document.activeElement).toBe(tabs(fixture)[1]);
  });

  it("navigates with Home and End", () => {
    const fixture = setup();
    tabs(fixture)[1].click();
    fixture.detectChanges();
    tabs(fixture)[1].dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs(fixture)[0]);

    tabs(fixture)[0].dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs(fixture)[1]);
  });

  it("does not activate disabled tabs", () => {
    const fixture = setup();
    const disabled = tabs(fixture)[2];
    expect(disabled.disabled).toBe(true);
    const triggerInstances = fixture.debugElement.queryAll(By.directive(TabsTriggerComponent));
    (triggerInstances[2].componentInstance as TabsTriggerComponent).handleClick();
    fixture.detectChanges();
    expect(visiblePanelText(fixture)).toEqual(["Content 1"]);
  });

  it("ignores re-selecting the already active tab", () => {
    const fixture = setup();
    tabs(fixture)[0].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.onChange).not.toHaveBeenCalled();
    expect(visiblePanelText(fixture)).toEqual(["Content 1"]);
  });

  it("ArrowRight wraps from the last enabled tab to the first", () => {
    const fixture = setup();
    tabs(fixture)[1].click();
    fixture.detectChanges();
    tabs(fixture)[1].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs(fixture)[0]);
  });

  it("ArrowLeft moves to the previous tab without wrapping", () => {
    const fixture = setup();
    tabs(fixture)[1].click();
    fixture.detectChanges();
    tabs(fixture)[1].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(tabs(fixture)[0]);
  });

  it("ignores non-navigation keys", () => {
    const fixture = setup();
    const active = document.activeElement;
    tabs(fixture)[0].dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(active);
    expect(visiblePanelText(fixture)).toEqual(["Content 1"]);
  });

  it("applies data-name attributes", () => {
    const fixture = setup();
    const list = fixture.debugElement.query(By.css('[role="tablist"]')).nativeElement as HTMLElement;
    const panel = fixture.debugElement.query(By.css('[role="tabpanel"]:not([hidden])')).nativeElement as HTMLElement;
    expect(list.getAttribute("data-name")).toBe("tabs-list");
    expect(panel.getAttribute("data-name")).toBe("tabs-content");
  });

  describe("controlled mode", () => {
    it("does not switch internally and emits valueChange", () => {
      const fixture = setup();
      fixture.componentRef.setInput("value", "tab-1");
      fixture.detectChanges();

      tabs(fixture)[1].click();
      fixture.detectChanges();

      expect(fixture.componentInstance.onChange).toHaveBeenCalledWith("tab-2");
      expect(visiblePanelText(fixture)).toEqual(["Content 1"]);

      fixture.componentRef.setInput("value", "tab-2");
      fixture.detectChanges();
      expect(visiblePanelText(fixture)).toEqual(["Content 2"]);
    });
  });

  describe("content without id", () => {
    it("always renders regardless of active tab", () => {
      @Component({
        standalone: true,
        imports: [TabsComponent, TabsListComponent, TabsTriggerComponent, TabsContentComponent],
        template: `
          <tedi-tabs defaultValue="tab-1">
            <tedi-tabs-list aria-label="Router tabs">
              <button tedi-tabs-trigger id="tab-1">Tab 1</button>
              <button tedi-tabs-trigger id="tab-2">Tab 2</button>
            </tedi-tabs-list>
            <tedi-tabs-content>Always visible</tedi-tabs-content>
          </tedi-tabs>
        `,
      })
      class RouterHost {}

      TestBed.configureTestingModule({
        imports: [RouterHost],
        providers: [
          { provide: TediTranslationService, useClass: TranslationMock },
          { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        ],
      });
      const fixture = TestBed.createComponent(RouterHost);
      fixture.detectChanges();

      const panel = fixture.debugElement.query(By.css('[role="tabpanel"]')).nativeElement as HTMLElement;
      expect(panel.textContent?.trim()).toBe("Always visible");
      expect(panel.hasAttribute("id")).toBe(false);
      expect(panel.hasAttribute("aria-labelledby")).toBe(false);
      expect(panel.hasAttribute("hidden")).toBe(false);
    });
  });

  describe("anchor triggers", () => {
    @Component({
      standalone: true,
      imports: [
        TabsComponent,
        TabsListComponent,
        TabsTriggerComponent,
        TabsContentComponent,
      ],
      template: `
        <tedi-tabs defaultValue="/a" (valueChange)="onChange($event)">
          <tedi-tabs-list aria-label="Router tabs">
            <a tedi-tabs-trigger id="/a" href="#a">A</a>
            <a tedi-tabs-trigger id="/b" href="#b">B</a>
            <a tedi-tabs-trigger id="/c" href="#c" [disabled]="true">C</a>
          </tedi-tabs-list>
        </tedi-tabs>
      `,
    })
    class AnchorHost {
      onChange = jest.fn();
    }

    const setupAnchors = () => {
      TestBed.configureTestingModule({
        imports: [AnchorHost],
        providers: [
          { provide: TediTranslationService, useClass: TranslationMock },
          { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        ],
      });
      const fixture = TestBed.createComponent(AnchorHost);
      fixture.detectChanges();
      const anchors = fixture.debugElement
        .queryAll(By.css('[role="tab"]'))
        .map((d) => d.nativeElement as HTMLAnchorElement);
      return { fixture, anchors };
    };

    it("renders anchors as role=tab links without button-only attributes", () => {
      const { anchors } = setupAnchors();
      expect(anchors).toHaveLength(3);
      expect(anchors[0].tagName).toBe("A");
      expect(anchors[0].getAttribute("href")).toBe("#a");
      expect(anchors[0].getAttribute("role")).toBe("tab");
      expect(anchors[0].hasAttribute("type")).toBe(false);
      expect(anchors[0].getAttribute("aria-controls")).toBe("/a-panel");
    });

    it("marks a disabled anchor with aria-disabled and removes it from tab order", () => {
      const { anchors } = setupAnchors();
      const disabled = anchors[2];
      expect(disabled.getAttribute("aria-disabled")).toBe("true");
      expect(disabled.hasAttribute("disabled")).toBe(false);
      expect(disabled.getAttribute("tabindex")).toBe("-1");
    });

    it("activates an anchor on click", () => {
      const { fixture, anchors } = setupAnchors();
      anchors[1].click();
      fixture.detectChanges();
      expect(anchors[0].getAttribute("aria-selected")).toBe("false");
      expect(anchors[1].getAttribute("aria-selected")).toBe("true");
      expect(fixture.componentInstance.onChange).toHaveBeenCalledWith("/b");
    });

    it("does not activate a disabled anchor and blocks its navigation", () => {
      const { fixture, anchors } = setupAnchors();
      const event = new MouseEvent("click", { cancelable: true, bubbles: true });
      anchors[2].dispatchEvent(event);
      fixture.detectChanges();
      expect(event.defaultPrevented).toBe(true);
      expect(fixture.componentInstance.onChange).not.toHaveBeenCalled();
      expect(anchors[0].getAttribute("aria-selected")).toBe("true");
    });

    it("activates a focused anchor on Space", () => {
      const { fixture, anchors } = setupAnchors();
      anchors[1].dispatchEvent(
        new KeyboardEvent("keydown", { key: " ", bubbles: true, cancelable: true }),
      );
      fixture.detectChanges();
      expect(fixture.componentInstance.onChange).toHaveBeenCalledWith("/b");
    });

    it("arrow navigation skips an aria-disabled anchor", () => {
      const { fixture, anchors } = setupAnchors();
      anchors[1].click();
      fixture.detectChanges();
      anchors[1].dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      fixture.detectChanges();
      expect(document.activeElement).toBe(anchors[0]);
    });

    it("arrow navigation moves focus without activating an anchor (manual activation)", () => {
      const { fixture, anchors } = setupAnchors();
      anchors[0].focus();
      anchors[0].dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
      fixture.detectChanges();
      expect(document.activeElement).toBe(anchors[1]);
      expect(anchors[0].getAttribute("aria-selected")).toBe("true");
      expect(anchors[1].getAttribute("aria-selected")).toBe("false");
      expect(fixture.componentInstance.onChange).not.toHaveBeenCalled();
    });
  });

  describe("overflow", () => {
    it("does not show the More button without overflow", () => {
      const fixture = setup();
      expect(fixture.debugElement.query(By.css(".tedi-tabs-list__more"))).toBeNull();
    });

    it("shows the More button when tabs overflow", () => {
      const fixture = setup();
      simulateOverflow(fixture);
      expect(fixture.debugElement.query(By.css(".tedi-tabs-list__more-btn"))).toBeTruthy();
    });

    it("excludes the active tab from the dropdown items", () => {
      const fixture = setup();
      simulateOverflow(fixture);
      const list = fixture.debugElement.query(By.directive(TabsListComponent)).componentInstance as TabsListComponent;
      expect(list.dropdownItems().map((i) => i.id)).toEqual(["tab-2", "tab-3"]);
    });

    it("removes the More button when the container grows", () => {
      const fixture = setup();
      simulateOverflow(fixture);
      expect(fixture.debugElement.query(By.css(".tedi-tabs-list__more-btn"))).toBeTruthy();

      const wrapper = fixture.debugElement.query(By.css(".tedi-tabs-list")).nativeElement as HTMLElement;
      Object.defineProperty(wrapper, "clientWidth", { value: 600, configurable: true });
      resizeCallback?.();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css(".tedi-tabs-list__more"))).toBeNull();
    });

    it("keeps the More button when content grows while already overflowing", () => {
      const fixture = setup();
      const list = fixture.debugElement.query(By.css('[role="tablist"]')).nativeElement as HTMLElement;
      const wrapper = fixture.debugElement.query(By.css(".tedi-tabs-list")).nativeElement as HTMLElement;

      Object.defineProperty(list, "scrollWidth", { value: 500, configurable: true });
      Object.defineProperty(list, "clientWidth", { value: 300, configurable: true });
      Object.defineProperty(wrapper, "clientWidth", { value: 300, configurable: true });
      resizeCallback?.();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css(".tedi-tabs-list__more-btn"))).toBeTruthy();

      // Content grows to 800 while overflowing; wrapper grows to 600 — still doesn't fit.
      Object.defineProperty(list, "scrollWidth", { value: 800, configurable: true });
      Object.defineProperty(wrapper, "clientWidth", { value: 600, configurable: true });
      resizeCallback?.();
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css(".tedi-tabs-list__more-btn"))).toBeTruthy();
    });

    it("re-checks overflow when the set of triggers changes without a resize", () => {
      @Component({
        standalone: true,
        imports: [TabsComponent, TabsListComponent, TabsTriggerComponent, TabsContentComponent],
        template: `
          <tedi-tabs defaultValue="tab-1">
            <tedi-tabs-list aria-label="Dynamic tabs">
              @for (id of tabIds(); track id) {
                <button tedi-tabs-trigger [id]="id">{{ id }}</button>
              }
            </tedi-tabs-list>
            <tedi-tabs-content id="tab-1">Content</tedi-tabs-content>
          </tedi-tabs>
        `,
      })
      class DynamicHost {
        tabIds = input(["tab-1", "tab-2"]);
      }

      TestBed.configureTestingModule({
        imports: [DynamicHost],
        providers: [
          { provide: TediTranslationService, useClass: TranslationMock },
          { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        ],
      });
      const fixture = TestBed.createComponent(DynamicHost);
      fixture.detectChanges();

      const list = fixture.debugElement.query(By.css('[role="tablist"]')).nativeElement as HTMLElement;
      const wrapper = fixture.debugElement.query(By.css(".tedi-tabs-list")).nativeElement as HTMLElement;
      Object.defineProperty(list, "clientWidth", { value: 300, configurable: true });
      Object.defineProperty(wrapper, "clientWidth", { value: 300, configurable: true });

      // Two tabs fit — no More button.
      Object.defineProperty(list, "scrollWidth", { value: 300, configurable: true });
      mockAfterNextRender.callback?.();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css(".tedi-tabs-list__more-btn"))).toBeNull();

      // Adding tabs overflows the row; the effect re-checks without any resize.
      Object.defineProperty(list, "scrollWidth", { value: 800, configurable: true });
      fixture.componentRef.setInput("tabIds", ["tab-1", "tab-2", "tab-3", "tab-4"]);
      fixture.detectChanges();
      mockAfterNextRender.callback?.();
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css(".tedi-tabs-list__more-btn"))).toBeTruthy();
    });

    it("does not show More in scroll mode", () => {
      const fixture = setup();
      fixture.componentRef.setInput("overflowMode", "scroll");
      fixture.detectChanges();
      simulateOverflow(fixture);
      expect(fixture.debugElement.query(By.css(".tedi-tabs-list__more"))).toBeNull();
    });

    it("toggles scroll-fade indicators in scroll mode", () => {
      const fixture = setup();
      fixture.componentRef.setInput("overflowMode", "scroll");
      fixture.detectChanges();

      const listEl = fixture.debugElement.query(By.css('[role="tablist"]')).nativeElement as HTMLElement;
      Object.defineProperty(listEl, "scrollWidth", { value: 500, configurable: true });
      Object.defineProperty(listEl, "clientWidth", { value: 300, configurable: true });
      Object.defineProperty(listEl, "scrollLeft", { value: 100, configurable: true });
      listEl.dispatchEvent(new Event("scroll"));
      fixture.detectChanges();

      const wrapper = fixture.debugElement.query(By.css(".tedi-tabs-list")).nativeElement as HTMLElement;
      expect(wrapper.classList.contains("tedi-tabs-list--fade-start")).toBe(true);
      expect(wrapper.classList.contains("tedi-tabs-list--fade-end")).toBe(true);
    });
  });
});
