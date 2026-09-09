import { Component, input } from "@angular/core";
import { By } from "@angular/platform-browser";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { BreakpointService } from "../../../services/breakpoint/breakpoint.service";
import { LinkComponent } from "../link/link.component";
import { IconComponent } from "../../base/icon/icon.component";
import {
  BreadcrumbsComponent,
  BreadcrumbsInputs,
  BreadcrumbsVariant,
} from "./breadcrumbs.component";
import { BreadcrumbItemDirective } from "./breadcrumb-item.directive";
import { BreadcrumbSeparatorDirective } from "./breadcrumb-separator.directive";

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

const BP_ORDER = ["xs", "sm", "md", "lg", "xl", "xxl"];

class FakeBreakpointService {
  current: string | undefined = undefined;

  getBreakpointInputs<T>(inputs: Record<string, unknown>): T {
    const resolved: Record<string, unknown> = {};
    for (const key of Object.keys(inputs)) {
      if (!BP_ORDER.includes(key)) resolved[key] = inputs[key];
    }
    if (!this.current) return resolved as T;
    for (let i = 0; i <= BP_ORDER.indexOf(this.current); i++) {
      const bp = inputs[BP_ORDER[i]] as Record<string, unknown> | undefined;
      if (bp) Object.assign(resolved, bp);
    }
    return resolved as T;
  }
}

@Component({
  standalone: true,
  imports: [
    BreadcrumbsComponent,
    BreadcrumbItemDirective,
    BreadcrumbSeparatorDirective,
    LinkComponent,
    IconComponent,
  ],
  template: `
    <tedi-breadcrumbs
      [ariaLabel]="ariaLabel()"
      [variant]="variant()"
      [maxItems]="maxItems()"
      [itemsBeforeCollapse]="itemsBeforeCollapse()"
      [itemsAfterCollapse]="itemsAfterCollapse()"
      [separator]="separator()"
      [md]="md()"
    >
      @for (crumb of crumbs(); track crumb; let last = $last) {
        @if (last) {
          <span *tediBreadcrumbItem aria-current="page">{{ crumb }}</span>
        } @else {
          <a *tediBreadcrumbItem tedi-link href="#">{{ crumb }}</a>
        }
      }
      @if (customSeparator()) {
        <tedi-icon
          *tediBreadcrumbSeparator
          name="arrow_forward"
          [size]="16"
          color="brand"
        />
      }
    </tedi-breadcrumbs>
  `,
})
class HostComponent {
  crumbs = input<string[]>(["Dashboard", "Applications", "App 506"]);
  ariaLabel = input<string | undefined>(undefined);
  variant = input<BreadcrumbsVariant>("long");
  maxItems = input<number | undefined>(undefined);
  itemsBeforeCollapse = input<number>(1);
  itemsAfterCollapse = input<number>(1);
  separator = input<string | undefined>(undefined);
  md = input<BreadcrumbsInputs | undefined>(undefined);
  customSeparator = input<boolean>(false);
}

let fakeBreakpoints: FakeBreakpointService;

const setup = (inputs: Partial<Record<keyof HostComponent, unknown>> = {}) => {
  fakeBreakpoints = new FakeBreakpointService();
  TestBed.configureTestingModule({
    imports: [HostComponent],
    providers: [
      { provide: TediTranslationService, useClass: TranslationMock },
      { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      { provide: BreakpointService, useValue: fakeBreakpoints },
    ],
  });
  const fixture = TestBed.createComponent(HostComponent);
  Object.entries(inputs).forEach(([key, value]) =>
    fixture.componentRef.setInput(key, value),
  );
  fixture.detectChanges();
  return fixture;
};

const items = (fixture: ComponentFixture<HostComponent>) =>
  fixture.debugElement.queryAll(By.css("li.tedi-breadcrumbs__item"));

const separators = (fixture: ComponentFixture<HostComponent>) =>
  fixture.debugElement.queryAll(By.css("li.tedi-breadcrumbs__separator"));

describe("Breadcrumbs", () => {
  it("renders a nav landmark with the default translated label", () => {
    const fixture = setup();
    const nav = fixture.debugElement.query(By.css("nav")).nativeElement;
    expect(nav.getAttribute("aria-label")).toBe("breadcrumbs");
  });

  it("uses a custom aria-label when provided", () => {
    const fixture = setup({ ariaLabel: "Asukoht" });
    const nav = fixture.debugElement.query(By.css("nav")).nativeElement;
    expect(nav.getAttribute("aria-label")).toBe("Asukoht");
  });

  it("renders one item per crumb with separators between them", () => {
    const fixture = setup();
    expect(items(fixture)).toHaveLength(3);
    expect(separators(fixture)).toHaveLength(2);
  });

  it("marks the last crumb as current and renders it as plain text", () => {
    const fixture = setup();
    const current = fixture.debugElement.query(
      By.css(".tedi-breadcrumbs__item--current"),
    ).nativeElement as HTMLElement;
    expect(current.textContent?.trim()).toBe("App 506");
    expect(current.querySelector("a")).toBeNull();
    expect(current.querySelector("[aria-current='page']")).not.toBeNull();
  });

  it("renders navigable crumbs as links", () => {
    const fixture = setup();
    const links = fixture.debugElement.queryAll(By.css("a[tedi-link]"));
    expect(links).toHaveLength(2);
  });

  it("hides separators from assistive technology and defaults to a chevron icon", () => {
    const fixture = setup();
    const separator = separators(fixture)[0].nativeElement as HTMLElement;
    expect(separator.getAttribute("aria-hidden")).toBe("true");
    expect(separator.querySelector("tedi-icon")).not.toBeNull();
  });

  it("renders a string separator when provided", () => {
    const fixture = setup({ separator: "/" });
    const separator = separators(fixture)[0].nativeElement as HTMLElement;
    expect(separator.textContent?.trim()).toBe("/");
    expect(separator.querySelector("tedi-icon")).toBeNull();
  });

  it("renders a custom separator template over the default", () => {
    const fixture = setup({ customSeparator: true });
    const separator = separators(fixture)[0].nativeElement as HTMLElement;
    const icon = separator.querySelector("tedi-icon");
    expect(icon?.getAttribute("name")).toBe("arrow_forward");
  });

  it("renders nothing when there are no crumbs", () => {
    const fixture = setup({ crumbs: [] });
    expect(fixture.debugElement.query(By.css("nav"))).toBeNull();
  });

  describe("short variant", () => {
    it("renders only the parent crumb with a back arrow", () => {
      const fixture = setup({ variant: "short" });
      const shownItems = items(fixture);
      expect(shownItems).toHaveLength(1);
      const item = shownItems[0].nativeElement as HTMLElement;
      expect(item.querySelector("a")?.textContent?.trim()).toBe("Applications");
      expect(item.querySelector("tedi-icon[name='arrow_back']")).not.toBeNull();
      expect(separators(fixture)).toHaveLength(0);
    });

    it("renders nothing when fewer than two crumbs are supplied", () => {
      const fixture = setup({ variant: "short", crumbs: ["Dashboard"] });
      expect(items(fixture)).toHaveLength(0);
      expect(fixture.debugElement.query(By.css("nav"))).toBeNull();
    });
  });

  describe("collapse", () => {
    const longTrail = [
      "Dashboard",
      "Patients",
      "Anna Tamm",
      "Visits",
      "2024-05-12",
      "Restrictions",
    ];

    it("collapses the middle crumbs into an ellipsis dropdown", () => {
      const fixture = setup({
        crumbs: longTrail,
        maxItems: 4,
        itemsBeforeCollapse: 1,
        itemsAfterCollapse: 2,
      });

      const ellipsis = fixture.debugElement.query(
        By.css("button[tedi-dropdown-trigger]"),
      );
      expect(ellipsis).not.toBeNull();
      // tedi-link host class binding must not clobber the sizing class.
      expect(ellipsis.nativeElement.classList).toContain("tedi-link");
      expect(ellipsis.nativeElement.classList).toContain(
        "tedi-breadcrumbs__ellipsis",
      );
      expect(items(fixture)).toHaveLength(4);

      const listText = fixture.debugElement
        .query(By.css(".tedi-breadcrumbs__list"))
        .nativeElement.textContent.trim();
      expect(listText).not.toContain("Anna Tamm");
      expect(listText).toContain("Dashboard");
      expect(listText).toContain("Restrictions");
    });

    const openCollapsed = async (fixture: ComponentFixture<HostComponent>) => {
      const trigger = fixture.debugElement.query(
        By.css("button[tedi-dropdown-trigger]"),
      ).nativeElement as HTMLButtonElement;
      trigger.click();
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve));
      fixture.detectChanges();

      const overlay = document.querySelector(
        ".cdk-overlay-container",
      ) as HTMLElement;
      return Array.from(
        overlay.querySelectorAll("li.tedi-breadcrumbs__dropdown-item"),
      ) as HTMLLIElement[];
    };

    it("exposes the collapsed crumb links themselves as the menu items", async () => {
      const fixture = setup({
        crumbs: longTrail,
        maxItems: 4,
        itemsBeforeCollapse: 1,
        itemsAfterCollapse: 2,
      });

      const dropdownItems = await openCollapsed(fixture);
      expect(dropdownItems).toHaveLength(3);

      const links = dropdownItems.map(
        (item) => item.querySelector("a") as HTMLAnchorElement,
      );

      dropdownItems.forEach((item) => {
        expect(item.getAttribute("role")).toBe("none");
        expect(item.getAttribute("tabindex")).toBeNull();
      });
      links.forEach((link) =>
        expect(link.getAttribute("role")).toBe("menuitem"),
      );
      expect(links.map((link) => link.getAttribute("tabindex"))).toEqual([
        "0",
        "-1",
        "-1",
      ]);
      expect(document.activeElement).toBe(links[0]);
    });

    it("lets Enter follow a collapsed crumb link", async () => {
      const fixture = setup({
        crumbs: longTrail,
        maxItems: 4,
        itemsBeforeCollapse: 1,
        itemsAfterCollapse: 2,
      });

      const link = (await openCollapsed(fixture))[0].querySelector(
        "a",
      ) as HTMLAnchorElement;
      const event = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      });
      link.dispatchEvent(event);

      expect(event.defaultPrevented).toBe(false);
    });

    it("does not collapse when the crumb count is within maxItems", () => {
      const fixture = setup({ crumbs: longTrail, maxItems: 10 });
      expect(
        fixture.debugElement.query(By.css("button[tedi-dropdown-trigger]")),
      ).toBeNull();
      expect(items(fixture)).toHaveLength(6);
    });
  });

  describe("breakpoint overrides", () => {
    it("switches variant at the active breakpoint", () => {
      const fixture = setup({
        variant: "short",
        md: {
          variant: "long",
          maxItems: undefined,
          itemsBeforeCollapse: 1,
          itemsAfterCollapse: 1,
        },
      });

      expect(items(fixture)).toHaveLength(1);

      fakeBreakpoints.current = "md";
      fixture.componentRef.setInput("md", {
        variant: "long",
        maxItems: undefined,
        itemsBeforeCollapse: 1,
        itemsAfterCollapse: 1,
      });
      fixture.detectChanges();

      expect(items(fixture)).toHaveLength(3);
      expect(separators(fixture)).toHaveLength(2);
    });
  });
});
