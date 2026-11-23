import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter, Router, RouterLink } from "@angular/router";
import { By } from "@angular/platform-browser";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { VerticalStepperComponent } from "./vertical-stepper.component";
import { VerticalStepperItemComponent } from "./vertical-stepper-item/vertical-stepper-item.component";

@Component({
  imports: [VerticalStepperComponent, VerticalStepperItemComponent],
  template: `
    <tedi-vertical-stepper [compact]="compact()" enumerated>
      <tedi-vertical-stepper-item
        title="Parent"
        [(opened)]="opened"
        [disabled]="parentDisabled()"
      >
        @for (child of children(); track child) {
          <tedi-vertical-stepper-item
            [title]="child"
            [completed]="completed()"
            [error]="error()"
            [selected]="selected()"
            [disabled]="disabled()"
            [informative]="informative()"
            (itemSelect)="selections = selections + 1"
          />
        }
      </tedi-vertical-stepper-item>
      <tedi-vertical-stepper-item title="Last" />
    </tedi-vertical-stepper>
  `,
})
class NestedItemsHost {
  compact = signal(false);
  opened = signal(false);
  parentDisabled = signal(false);
  completed = signal(false);
  error = signal(false);
  selected = signal(false);
  disabled = signal(false);
  informative = signal(false);
  children = signal(["Child"]);
  selections = 0;
}

@Component({
  imports: [VerticalStepperComponent, VerticalStepperItemComponent],
  template: `
    <tedi-vertical-stepper>
      <tedi-vertical-stepper-item title="Fallback" completed>
        <a href="#custom" item-title><strong>Custom title</strong></a>
        <div item-description>
          <em>Custom description</em><button>Action</button>
        </div>
        <span class="asset">Related content</span>
      </tedi-vertical-stepper-item>
      <tedi-vertical-stepper-item title="Parent" [opened]="true">
        <tedi-vertical-stepper-item title="Nested fallback" error>
          <button item-title>Custom nested title</button>
          <span item-description>Nested description</span>
        </tedi-vertical-stepper-item>
      </tedi-vertical-stepper-item>
    </tedi-vertical-stepper>
  `,
})
class ProjectionHost {}

@Component({ template: "" })
class RoutePage {}

@Component({
  imports: [VerticalStepperComponent, VerticalStepperItemComponent],
  template: `
    <tedi-vertical-stepper>
      <tedi-vertical-stepper-item title="Parent" [(opened)]="opened">
        <tedi-vertical-stepper-item
          title="Nested route"
          [route]="route()"
          [disabled]="disabled()"
          [selected]="nestedSelected()"
          (itemSelect)="
            nestedActivations = nestedActivations + 1; nestedSelected.set(true)
          "
        />
        <tedi-vertical-stepper-item
          title="Second nested route"
          route="/second"
          [disabled]="disabled()"
          [selected]="secondSelected()"
          (itemSelect)="
            secondActivations = secondActivations + 1; secondSelected.set(true)
          "
        />
      </tedi-vertical-stepper-item>
      <tedi-vertical-stepper-item
        title="Top-level route"
        route="/third"
        [disabled]="disabled()"
        (itemSelect)="topActivations = topActivations + 1"
      />
    </tedi-vertical-stepper>
  `,
})
class RoutingHost {
  route = signal<RouterLink["routerLink"]>(["/first"]);
  disabled = signal(false);
  opened = signal(false);
  nestedSelected = signal(false);
  secondSelected = signal(false);
  nestedActivations = 0;
  secondActivations = 0;
  topActivations = 0;
}

const providers = [
  {
    provide: TediTranslationService,
    useValue: {
      translate: (key: string) => key,
      track: (key: string) => () => key,
    },
  },
  { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
];

describe("VerticalStepper nested item integration", () => {
  let fixture: ComponentFixture<NestedItemsHost>;
  let host: NestedItemsHost;
  const parent = () =>
    fixture.nativeElement.querySelector(
      "tedi-vertical-stepper-item",
    ) as HTMLElement;
  const child = () =>
    parent().querySelector("tedi-vertical-stepper-item") as HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [NestedItemsHost], providers });
    fixture = TestBed.createComponent(NestedItemsHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("renders nested items as sub-steps and numbers only top-level items", () => {
    expect(child().classList).toContain("tedi-vertical-stepper-item--sub-item");
    expect(child().parentElement?.classList).toContain(
      "tedi-vertical-stepper-item__sub-list",
    );
    expect(
      child().querySelector(".tedi-vertical-stepper-item__dot"),
    ).toBeTruthy();
    expect(
      Array.from(
        fixture.nativeElement.querySelectorAll(
          ".tedi-vertical-stepper-item__number",
        ),
        (el: Element) => el.textContent?.trim(),
      ),
    ).toEqual(["1", "2"]);
  });

  it("supports enumerated compact labels without numbering nested items", () => {
    host.compact.set(true);
    fixture.detectChanges();
    expect(
      Array.from(
        fixture.nativeElement.querySelectorAll(
          ".tedi-vertical-stepper-item__number-prefix",
        ),
        (el: Element) => el.textContent?.trim(),
      ),
    ).toEqual(["1.", "2."]);
  });

  it("supports two-way opened binding through the parent toggle", () => {
    parent()
      .querySelector<HTMLButtonElement>(".tedi-vertical-stepper-item__toggle")!
      .click();
    fixture.detectChanges();
    expect(host.opened()).toBe(true);
    expect(child().parentElement?.hidden).toBe(false);
    host.opened.set(false);
    fixture.detectChanges();
    expect(child().parentElement?.hidden).toBe(true);
  });

  it("reveals a selected nested item and still allows the parent to be collapsed", () => {
    host.selected.set(true);
    fixture.detectChanges();
    expect(host.opened()).toBe(true);
    expect(child().querySelector("button")?.getAttribute("aria-current")).toBe(
      "step",
    );
    parent()
      .querySelector<HTMLButtonElement>(".tedi-vertical-stepper-item__toggle")!
      .click();
    fixture.detectChanges();
    expect(host.opened()).toBe(false);
  });

  it.each(["completed", "error"] as const)(
    "retains %s status while disabled",
    (state) => {
      host[state].set(true);
      host.disabled.set(true);
      fixture.detectChanges();
      expect(child().classList).toContain(
        `tedi-vertical-stepper-item--${state}`,
      );
      expect(child().classList).toContain(
        "tedi-vertical-stepper-item--disabled",
      );
      expect(child().querySelector("a, button")).toBeNull();
      expect(child().textContent).toContain(`vertical-stepper.${state}`);
      expect(child().textContent).toContain("vertical-stepper.disabled");
      expect(
        child()
          .querySelector(".tedi-vertical-stepper-item__label-icon")
          ?.textContent?.trim(),
      ).toBe(state === "completed" ? "check" : "error");
    },
  );

  it("emits itemSelect for non-routed leaf buttons", () => {
    child().querySelector<HTMLButtonElement>("button")!.click();
    expect(host.selections).toBe(1);
  });

  it("renders informative nested items as text", () => {
    host.informative.set(true);
    fixture.detectChanges();
    expect(child().classList).toContain(
      "tedi-vertical-stepper-item--informative",
    );
    expect(child().querySelector("a, button")).toBeNull();
    expect(child().getAttribute("aria-disabled")).toBeNull();
    expect(child().textContent).not.toContain("vertical-stepper.informative");
  });

  it("disables the expansion control without blocking a selected child's visibility", () => {
    host.parentDisabled.set(true);
    host.selected.set(true);
    fixture.detectChanges();
    expect(
      parent().querySelector<HTMLButtonElement>(
        ".tedi-vertical-stepper-item__toggle",
      )?.disabled,
    ).toBe(true);
    expect(host.opened()).toBe(true);
  });

  it("keeps newly added children in the sub-step list", () => {
    host.children.set(["Child", "New child"]);
    fixture.detectChanges();
    expect(
      parent().querySelectorAll(".tedi-vertical-stepper-item--sub-item"),
    ).toHaveLength(2);
  });
});

describe("VerticalStepper projected content", () => {
  it("replaces title and description fallbacks without nesting interactive controls", () => {
    TestBed.configureTestingModule({ imports: [ProjectionHost], providers });
    const fixture = TestBed.createComponent(ProjectionHost);
    fixture.detectChanges();
    const root: HTMLElement = fixture.nativeElement;
    const first = root.querySelector("tedi-vertical-stepper-item")!;
    expect(
      first.querySelector(".tedi-vertical-stepper-item__title a strong")
        ?.textContent,
    ).toBe("Custom title");
    expect(
      first.querySelector(".tedi-vertical-stepper-item__description em")
        ?.textContent,
    ).toBe("Custom description");
    expect(
      first.querySelector(".tedi-vertical-stepper-item__end .asset"),
    ).toBeTruthy();
    expect(first.textContent).not.toContain("Fallback");
    expect(
      root.querySelector("a a, button button, a button, button a"),
    ).toBeNull();
    expect(
      root.querySelectorAll(".tedi-vertical-stepper-item__label-icon"),
    ).toHaveLength(2);
    expect(
      root.querySelector(".tedi-vertical-stepper-item--sub-item [item-title]")
        ?.textContent,
    ).toBe("Custom nested title");
  });
});

describe("VerticalStepper Angular routing", () => {
  let fixture: ComponentFixture<RoutingHost>;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RoutingHost],
      providers: [
        ...providers,
        provideRouter([
          { path: "first", component: RoutePage },
          { path: "second", component: RoutePage },
          { path: "third", component: RoutePage },
          { path: "other", component: RoutePage },
        ]),
      ],
    });
    fixture = TestBed.createComponent(RoutingHost);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  async function navigate(url: string) {
    await router.navigateByUrl(url);
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it("emits itemSelect and reveals nested selection after programmatic navigation", async () => {
    await navigate("/first");
    expect(fixture.componentInstance.nestedActivations).toBe(1);
    expect(fixture.componentInstance.opened()).toBe(true);
    expect(
      fixture.nativeElement
        .querySelector('a[href="/first"]')
        ?.getAttribute("aria-current"),
    ).toBe("step");
    await navigate("/other");
    expect(fixture.componentInstance.nestedActivations).toBe(1);
    await navigate("/first");
    expect(fixture.componentInstance.nestedActivations).toBe(2);
  });

  it("keeps aria-current on an already selected step when its route becomes active", async () => {
    fixture.componentInstance.nestedSelected.set(true);
    fixture.detectChanges();
    await navigate("/first");
    await navigate("/other");
    await navigate("/first");
    expect(
      fixture.nativeElement
        .querySelector('a[href="/first"]')
        ?.getAttribute("aria-current"),
    ).toBe("step");
  });

  it("supports route activation on further nested and top-level steps", async () => {
    await navigate("/second");
    expect(fixture.componentInstance.secondActivations).toBe(1);
    expect(fixture.componentInstance.opened()).toBe(true);
    await navigate("/third");
    expect(fixture.componentInstance.topActivations).toBe(1);
  });

  it("accepts UrlTree destinations and does not emit selection twice on click", async () => {
    fixture.componentInstance.route.set(router.createUrlTree(["/first"]));
    fixture.detectChanges();
    const link = fixture.debugElement.queryAll(By.directive(RouterLink))[0];
    link.nativeElement.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(router.url).toBe("/first");
    expect(fixture.componentInstance.nestedActivations).toBe(1);
  });

  it("removes route links while disabled and does not emit on programmatic navigation", async () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("a")).toBeNull();
    await navigate("/first");
    await navigate("/second");
    await navigate("/third");
    expect(fixture.componentInstance.nestedActivations).toBe(0);
    expect(fixture.componentInstance.secondActivations).toBe(0);
    expect(fixture.componentInstance.topActivations).toBe(0);
  });
});
