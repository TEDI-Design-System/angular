import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  BreakpointService,
  TEDI_TRANSLATION_DEFAULT_TOKEN,
  TediTranslationService,
} from "@tedi-design-system/angular/tedi";
import { ProcessTimelineComponent } from "./process-timeline.component";
import {
  ProcessTimelineItemComponent,
  ProcessTimelineItemState,
} from "./process-timeline-item/process-timeline-item.component";
import { ProcessTimelineTitleComponent } from "./process-timeline-title/process-timeline-title.component";
import { ProcessTimelineDescriptionComponent } from "./process-timeline-description/process-timeline-description.component";
import {
  ProcessTimelineConnectorThickness,
  ProcessTimelineOrientation,
} from "./process-timeline.token";
import { BreakpointInput } from "@tedi-design-system/angular/tedi";

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

const aboveMd = signal(true);

class BreakpointServiceMock {
  isAboveBreakpoint(bp: string) {
    return () => (bp === "md" || bp === "sm" ? aboveMd() : false);
  }
}

@Component({
  standalone: true,
  imports: [
    ProcessTimelineComponent,
    ProcessTimelineItemComponent,
    ProcessTimelineTitleComponent,
    ProcessTimelineDescriptionComponent,
  ],
  template: `
    <ol
      tedi-process-timeline
      [orientation]="orientation()"
      [connectorThickness]="thickness()"
    >
      @for (stage of stages(); track stage.title) {
        <li tedi-process-timeline-item [state]="stage.state">
          <tedi-process-timeline-title>{{ stage.title }}</tedi-process-timeline-title>
          @if (stage.description) {
            <tedi-process-timeline-description>{{ stage.description }}</tedi-process-timeline-description>
          }
          @if (stage.action) {
            <button type="button">Lisa dokumendid</button>
          }
        </li>
      }
    </ol>
  `,
})
class HostComponent {
  orientation = signal<BreakpointInput<ProcessTimelineOrientation>>({
    xs: "vertical",
    md: "horizontal",
  });
  thickness = signal<ProcessTimelineConnectorThickness>(1);
  stages = signal<
    {
      state: ProcessTimelineItemState;
      title: string;
      description?: string;
      action?: boolean;
    }[]
  >([
    { state: "completed", title: "Pakkumine esitatud" },
    {
      state: "active",
      title: "Kvalifitseerimine",
      description: "Hankija kontrollib dokumente.",
      action: true,
    },
    { state: "upcoming", title: "Tulemused" },
  ]);
}

describe("ProcessTimelineComponent", () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let el: HTMLElement;

  const list = () => el.querySelector("ol") as HTMLOListElement;
  const items = () =>
    Array.from(el.querySelectorAll<HTMLLIElement>("li.tedi-process-timeline-item"));
  const indicators = () =>
    items().map((li) =>
      li.querySelector(".tedi-process-timeline-item__indicator")!,
    );
  const connectors = () =>
    Array.from(el.querySelectorAll(".tedi-process-timeline-item__connector"));

  beforeEach(() => {
    aboveMd.set(true);
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        { provide: BreakpointService, useClass: BreakpointServiceMock },
      ],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("renders a native ordered list of list items with an explicit list role", () => {
    expect(list().classList).toContain("tedi-process-timeline");
    expect(list().getAttribute("role")).toBe("list");
    expect(items().length).toBe(3);
    items().forEach((li) => expect(li.getAttribute("role")).toBe("listitem"));
  });

  it("numbers the stages by their order and hides the indicators from screen readers", () => {
    expect(indicators().map((i) => i.textContent?.trim())).toEqual([
      "1",
      "2",
      "3",
    ]);
    indicators().forEach((i) =>
      expect(i.getAttribute("aria-hidden")).toBe("true"),
    );
  });

  it("applies state modifiers", () => {
    expect(items()[0].classList).toContain(
      "tedi-process-timeline-item--completed",
    );
    expect(items()[1].classList).toContain("tedi-process-timeline-item--active");
    expect(items()[2].classList).toContain(
      "tedi-process-timeline-item--upcoming",
    );
  });

  it("marks only the active stage with aria-current=step", () => {
    expect(items().map((li) => li.getAttribute("aria-current"))).toEqual([
      null,
      "step",
      null,
    ]);
  });

  it("adds a visually hidden state text to completed and upcoming stages, not to the active one", () => {
    const srTexts = items().map((li) =>
      li.querySelector(".sr-only")?.textContent?.trim() ?? null,
    );
    expect(srTexts).toEqual([
      "process-timeline.completed",
      null,
      "process-timeline.upcoming",
    ]);
  });

  it("places the state text after the title", () => {
    const body = items()[0].querySelector(
      ".tedi-process-timeline-item__body",
    )!;
    const title = body.querySelector(".tedi-process-timeline-title")!;
    expect(title.nextElementSibling?.classList).toContain("sr-only");
  });

  it("renders a decorative connector after every stage except the last", () => {
    expect(connectors().length).toBe(2);
    connectors().forEach((c) =>
      expect(c.getAttribute("aria-hidden")).toBe("true"),
    );
    expect(
      items()[2].querySelector(".tedi-process-timeline-item__connector"),
    ).toBeNull();
    expect(items()[2].classList).toContain("tedi-process-timeline-item--last");
  });

  it("keeps stages out of the tab order and leaves projected controls focusable", () => {
    items().forEach((li) => {
      expect(li.hasAttribute("tabindex")).toBe(false);
      expect(li.querySelectorAll("[tabindex]").length).toBe(0);
    });
    const focusable = el.querySelectorAll("button, a[href]");
    expect(focusable.length).toBe(1);
    expect(focusable[0].textContent).toContain("Lisa dokumendid");
  });

  it("projects the description and content", () => {
    const active = items()[1];
    expect(
      active.querySelector(".tedi-process-timeline-description")?.textContent,
    ).toContain("Hankija kontrollib dokumente.");
    expect(
      active.querySelector(".tedi-process-timeline-item__content button"),
    ).not.toBeNull();
  });

  it("is horizontal from md and vertical below it by default", () => {
    expect(list().classList).toContain("tedi-process-timeline--horizontal");
    expect(
      connectors()[0].querySelector(".tedi-separator--vertical"),
    ).toBeNull();

    aboveMd.set(false);
    fixture.detectChanges();

    expect(list().classList).toContain("tedi-process-timeline--vertical");
    expect(items()[0].classList).toContain(
      "tedi-process-timeline-item--vertical",
    );
    expect(
      connectors()[0].querySelector(".tedi-separator--vertical"),
    ).not.toBeNull();
  });

  it("accepts a plain orientation value", () => {
    host.orientation.set("vertical");
    fixture.detectChanges();
    expect(list().classList).toContain("tedi-process-timeline--vertical");
  });

  it("resolves larger breakpoints first", () => {
    host.orientation.set({ xs: "horizontal", sm: "vertical", xl: "horizontal" });
    fixture.detectChanges();
    expect(list().classList).toContain("tedi-process-timeline--vertical");
  });

  it("passes the connector thickness to every connector", () => {
    host.thickness.set(2);
    fixture.detectChanges();
    connectors().forEach((c) =>
      expect(
        c.querySelector(".tedi-separator--thickness-2"),
      ).not.toBeNull(),
    );
  });

  it("renumbers and moves the last connector when stages change", () => {
    host.stages.update((s) => [
      ...s,
      { state: "upcoming" as const, title: "Leping" },
    ]);
    fixture.detectChanges();
    expect(indicators().map((i) => i.textContent?.trim())).toEqual([
      "1",
      "2",
      "3",
      "4",
    ]);
    expect(connectors().length).toBe(3);
    expect(items()[2].classList).not.toContain(
      "tedi-process-timeline-item--last",
    );
  });
});

describe("ProcessTimelineComponent when the stages don't fit", () => {
  let resize: () => void;
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;
  let list: HTMLOListElement;
  let containerWidth: number;
  let widthReads: number;
  const originalResizeObserver = globalThis.ResizeObserver;

  // jsdom has no layout. Side by side, each stage needs 10px per character of its title and
  // description; a vertical timeline never overflows. The checks must measure the horizontal
  // layout to see the real need.
  const horizontalNeed = () =>
    Array.from(
      list.querySelectorAll(
        ".tedi-process-timeline-title, .tedi-process-timeline-description",
      ),
    ).reduce((sum, node) => sum + (node.textContent ?? "").trim().length * 10, 0);

  const isVertical = () =>
    list.classList.contains("tedi-process-timeline--vertical");

  const settle = async () => {
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
  };

  const fiveStages = [
    { state: "completed" as const, title: "Esitatud" },
    { state: "completed" as const, title: "Kvalifitseerimine" },
    { state: "active" as const, title: "Hindamine" },
    { state: "upcoming" as const, title: "Läbirääkimised" },
    { state: "upcoming" as const, title: "Tulemused" },
  ];
  const twoStages = fiveStages.slice(0, 2);

  beforeEach(() => {
    aboveMd.set(true);
    globalThis.ResizeObserver = class {
      constructor(cb: () => void) {
        resize = cb;
      }
      observe() {}
      disconnect() {}
      unobserve() {}
    } as unknown as typeof ResizeObserver;

    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        { provide: BreakpointService, useClass: BreakpointServiceMock },
      ],
    });
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    list = fixture.nativeElement.querySelector("ol");

    containerWidth = 400;
    widthReads = 0;
    Object.defineProperty(list, "clientWidth", {
      configurable: true,
      get: () => containerWidth,
    });
    Object.defineProperty(list, "scrollWidth", {
      configurable: true,
      get: () => {
        widthReads++;
        return isVertical()
          ? containerWidth
          : Math.max(containerWidth, horizontalNeed());
      },
    });
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
  });

  it("switches from five stages to two and back", async () => {
    host.stages.set(fiveStages);
    await settle();
    expect(isVertical()).toBe(true);

    host.stages.set(twoStages);
    await settle();
    expect(isVertical()).toBe(false);

    host.stages.set(fiveStages);
    await settle();
    expect(isVertical()).toBe(true);
  });

  it("remeasures when the content of a stage changes", async () => {
    host.stages.set([
      { state: "completed", title: "Esitatud" },
      { state: "active", title: "Hindamine", description: "Lühike." },
    ]);
    await settle();
    expect(isVertical()).toBe(false);

    host.stages.update(([first, second]) => [
      first,
      { ...second, description: "Hankija kontrollib kõiki esitatud dokumente." },
    ]);
    await settle();
    expect(isVertical()).toBe(true);

    host.stages.update(([first, second]) => [
      first,
      { ...second, description: "Lühike." },
    ]);
    await settle();
    expect(isVertical()).toBe(false);
  });

  it("follows the container width in both directions", async () => {
    host.stages.set(fiveStages);
    await settle();
    expect(isVertical()).toBe(true);

    containerWidth = horizontalNeed();
    resize();
    await settle();
    expect(isVertical()).toBe(false);

    containerWidth -= 1;
    resize();
    await settle();
    expect(isVertical()).toBe(true);
  });

  it("restores the vertical classes after measuring and doesn't trigger itself again", async () => {
    host.stages.set(fiveStages);
    await settle();
    expect(isVertical()).toBe(true);

    const items = Array.from(list.querySelectorAll("li"));
    resize();
    expect(isVertical()).toBe(true);
    items.forEach((li) =>
      expect(li.classList).toContain("tedi-process-timeline-item--vertical"),
    );

    const reads = widthReads;
    await settle();
    await settle();
    expect(widthReads).toBe(reads);
    expect(isVertical()).toBe(true);
  });

  it("doesn't fall back while the orientation is vertical and re-checks when it turns horizontal", async () => {
    host.orientation.set("vertical");
    host.stages.set(fiveStages);
    await settle();
    const reads = widthReads;
    resize();
    expect(widthReads).toBe(reads);

    host.orientation.set("horizontal");
    await settle();
    expect(isVertical()).toBe(true);
  });
});

@Component({
  standalone: true,
  imports: [ProcessTimelineItemComponent],
  template: `<ul><li tedi-process-timeline-item state="completed"></li></ul>`,
})
class StandaloneItemHostComponent {}

describe("ProcessTimelineItemComponent without a timeline", () => {
  it("renders as a single stage without a connector", () => {
    TestBed.configureTestingModule({
      imports: [StandaloneItemHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });
    const fixture = TestBed.createComponent(StandaloneItemHostComponent);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    expect(
      el.querySelector(".tedi-process-timeline-item__indicator")?.textContent?.trim(),
    ).toBe("1");
    expect(el.querySelector(".tedi-process-timeline-item__connector")).toBeNull();
  });
});
