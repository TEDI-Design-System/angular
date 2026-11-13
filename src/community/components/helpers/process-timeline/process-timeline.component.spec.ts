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
  let callback: () => void;
  let fixture: ComponentFixture<HostComponent>;
  let list: HTMLOListElement;
  const originalResizeObserver = globalThis.ResizeObserver;

  const setSize = (clientWidth: number, scrollWidth: number) => {
    Object.defineProperty(list, "clientWidth", { value: clientWidth, configurable: true });
    Object.defineProperty(list, "scrollWidth", { value: scrollWidth, configurable: true });
    callback();
    fixture.detectChanges();
  };

  beforeEach(() => {
    aboveMd.set(true);
    globalThis.ResizeObserver = class {
      constructor(cb: () => void) {
        callback = cb;
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
    fixture.detectChanges();
    list = fixture.nativeElement.querySelector("ol");
  });

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver;
  });

  it("falls back to vertical and returns to horizontal once there is room", () => {
    setSize(800, 800);
    expect(list.classList).toContain("tedi-process-timeline--horizontal");

    setSize(800, 860);
    expect(list.classList).toContain("tedi-process-timeline--vertical");

    setSize(840, 840);
    expect(list.classList).toContain("tedi-process-timeline--vertical");

    setSize(860, 860);
    expect(list.classList).toContain("tedi-process-timeline--horizontal");
  });

  it("doesn't measure when the orientation is vertical", () => {
    fixture.componentInstance.orientation.set("vertical");
    fixture.detectChanges();
    setSize(300, 900);
    fixture.componentInstance.orientation.set("horizontal");
    fixture.detectChanges();
    expect(list.classList).toContain("tedi-process-timeline--horizontal");
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
