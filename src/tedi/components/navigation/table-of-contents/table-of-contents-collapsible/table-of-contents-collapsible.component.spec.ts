import { ApplicationRef, Component, input } from "@angular/core";
import {
  ComponentFixture,
  fakeAsync,
  flush,
  TestBed,
} from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";
import { TableOfContentsCollapsibleComponent } from "./table-of-contents-collapsible.component";
import { TableOfContentsItemComponent } from "../table-of-contents-item/table-of-contents-item.component";

@Component({
  standalone: true,
  imports: [TableOfContentsCollapsibleComponent, TableOfContentsItemComponent],
  template: `
    <tedi-table-of-contents-collapsible
      [heading]="heading()"
      activeId="methods"
    >
      <tedi-table-of-contents-item itemId="intro">
        <a href="#intro">Sissejuhatus</a>
      </tedi-table-of-contents-item>
      <tedi-table-of-contents-item itemId="methods">
        <a href="#methods">Meetodid</a>
        <tedi-table-of-contents-item itemId="methods-1">
          <a href="#methods-1">Andmete kogumine</a>
        </tedi-table-of-contents-item>
      </tedi-table-of-contents-item>
      <tedi-table-of-contents-item itemId="results">
        <a href="#results">Tulemused</a>
      </tedi-table-of-contents-item>
    </tedi-table-of-contents-collapsible>
  `,
})
class HostComponent {
  readonly heading = input<string | null | undefined>("Sisukord");
}

describe("TableOfContentsCollapsibleComponent", () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "en" }],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  const barButton = (): HTMLButtonElement =>
    fixture.debugElement.query(
      By.css(".tedi-table-of-contents__bar button[tedi-collapse-button]"),
    ).nativeElement;

  const sheet = (): HTMLElement | null =>
    document.querySelector(".tedi-table-of-contents__sheet");

  const collapsible = (): TableOfContentsCollapsibleComponent =>
    fixture.debugElement.query(
      By.directive(TableOfContentsCollapsibleComponent),
    ).componentInstance;

  const openSheet = () => {
    barButton().click();
    fixture.detectChanges();
    flush();
    fixture.detectChanges();
  };

  afterEach(fakeAsync(() => {
    const closeButton = document.querySelector<HTMLButtonElement>(
      ".tedi-table-of-contents__sheet-header button[tedi-collapse-button]",
    );
    closeButton?.click();
    fixture.detectChanges();
    flush();
  }));

  it("renders the bottom bar with the heading and a closed trigger", () => {
    expect(
      fixture.debugElement.query(By.css(".tedi-table-of-contents__bar")),
    ).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain("Sisukord");
    expect(barButton().getAttribute("aria-haspopup")).toBe("dialog");
    expect(sheet()).toBeNull();
  });

  it("opens the sheet, listing the items including nested ones", fakeAsync(() => {
    openSheet();

    const panel = sheet();
    expect(panel).toBeTruthy();
    const links = Array.from(panel!.querySelectorAll("a")).map((a) =>
      a.textContent?.trim(),
    );
    expect(links).toContain("Sissejuhatus");
    expect(links).toContain("Andmete kogumine");
  }));

  it("closes the sheet from the sheet header", fakeAsync(() => {
    openSheet();
    expect(sheet()).toBeTruthy();

    const closeButton = document.querySelector<HTMLButtonElement>(
      ".tedi-table-of-contents__sheet-header button[tedi-collapse-button]",
    )!;
    closeButton.click();
    fixture.detectChanges();
    flush();

    expect(sheet()).toBeNull();
  }));

  it("closes the sheet when a list link is activated", fakeAsync(() => {
    openSheet();
    const link = sheet()!.querySelector<HTMLAnchorElement>("a")!;
    link.click();
    fixture.detectChanges();
    flush();

    expect(sheet()).toBeNull();
  }));

  it("closes the sheet when the trigger is toggled off", fakeAsync(() => {
    openSheet();
    expect(sheet()).toBeTruthy();

    collapsible().toggle(false);
    fixture.detectChanges();
    flush();

    expect(sheet()).toBeNull();
  }));

  it("closes the sheet when Escape is pressed", fakeAsync(() => {
    openSheet();
    expect(sheet()).toBeTruthy();

    document.body.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
    );
    fixture.detectChanges();
    flush();

    expect(sheet()).toBeNull();
  }));

  it("falls back to the localized title when no heading is provided", () => {
    fixture.componentRef.setInput("heading", null);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Table of contents");
  });

  it("uses the localized title when heading is left undefined", () => {
    fixture.componentRef.setInput("heading", undefined);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("Table of contents");
  });

  it("ignores a second open request while the sheet is already open", fakeAsync(() => {
    openSheet();
    expect(
      document.querySelectorAll(".tedi-table-of-contents__sheet"),
    ).toHaveLength(1);

    collapsible().toggle(true);
    fixture.detectChanges();
    flush();

    expect(
      document.querySelectorAll(".tedi-table-of-contents__sheet"),
    ).toHaveLength(1);
    expect(sheet()).toBeTruthy();
  }));
});

@Component({
  standalone: true,
  imports: [TableOfContentsCollapsibleComponent, TableOfContentsItemComponent],
  template: `
    <tedi-table-of-contents-collapsible
      heading="Sisukord"
      [hideOnScroll]="hideOnScroll()"
    >
      <tedi-table-of-contents-item itemId="intro">
        <a href="#intro">Sissejuhatus</a>
      </tedi-table-of-contents-item>
    </tedi-table-of-contents-collapsible>
  `,
})
class ScrollHostComponent {
  readonly hideOnScroll = input(true);
}

describe("TableOfContentsCollapsibleComponent hideOnScroll", () => {
  let fixture: ComponentFixture<ScrollHostComponent>;
  let collapsible: TableOfContentsCollapsibleComponent;
  let realRaf: typeof window.requestAnimationFrame;
  let scrollY = 0;

  // Run each requestAnimationFrame callback synchronously so a scroll event
  // resolves to a bar state within the same tick.
  const runFramesSynchronously = () => {
    window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    }) as typeof window.requestAnimationFrame;
  };

  beforeEach(() => {
    scrollY = 0;
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      get: () => scrollY,
    });
    realRaf = window.requestAnimationFrame;
    runFramesSynchronously();

    TestBed.configureTestingModule({
      imports: [ScrollHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "en" }],
    });

    fixture = TestBed.createComponent(ScrollHostComponent);
    fixture.detectChanges();
    // Flush afterNextRender so the component attaches its scroll listener.
    TestBed.inject(ApplicationRef).tick();
    collapsible = fixture.debugElement.query(
      By.directive(TableOfContentsCollapsibleComponent),
    ).componentInstance;
  });

  afterEach(() => {
    window.requestAnimationFrame = realRaf;
    Object.defineProperty(window, "scrollY", { configurable: true, value: 0 });
  });

  const scrollTo = (y: number) => {
    scrollY = y;
    window.dispatchEvent(new Event("scroll"));
  };

  it("hides the bar when scrolling down", () => {
    scrollTo(50);
    expect(collapsible.barHidden()).toBe(true);
  });

  it("reveals the bar when scrolling back up", () => {
    scrollTo(50);
    expect(collapsible.barHidden()).toBe(true);

    scrollTo(20);
    expect(collapsible.barHidden()).toBe(false);
  });

  it("keeps the bar visible for downward scrolls near the top", () => {
    // Moved down, but still within the top zone (<= 8px), so the bar stays.
    scrollTo(7);
    expect(collapsible.barHidden()).toBe(false);
  });

  it("ignores sub-pixel scroll jitter", () => {
    scrollTo(100);
    scrollTo(50);
    expect(collapsible.barHidden()).toBe(false);

    // A 2px delta is below the 4px threshold, so the bar state is untouched.
    scrollTo(52);
    expect(collapsible.barHidden()).toBe(false);
  });

  it("keeps the bar visible while hideOnScroll is off", () => {
    scrollTo(50);
    expect(collapsible.barHidden()).toBe(true);

    fixture.componentRef.setInput("hideOnScroll", false);
    fixture.detectChanges();

    scrollTo(120);
    expect(collapsible.barHidden()).toBe(false);
  });

  it("coalesces bursts of scroll events into a single frame", () => {
    const frames: FrameRequestCallback[] = [];
    window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      frames.push(callback);
      return frames.length;
    }) as typeof window.requestAnimationFrame;

    scrollTo(50);
    scrollTo(90);
    expect(frames).toHaveLength(1);

    frames[0](0);
    expect(collapsible.barHidden()).toBe(true);
  });
});

@Component({
  standalone: true,
  imports: [TableOfContentsCollapsibleComponent, TableOfContentsItemComponent],
  template: `
    <div #scroll class="scroll-region"></div>
    <tedi-table-of-contents-collapsible
      heading="Sisukord"
      [hideOnScroll]="true"
      [scrollContainer]="scroll"
    >
      <tedi-table-of-contents-item itemId="intro">
        <a href="#intro">Sissejuhatus</a>
      </tedi-table-of-contents-item>
    </tedi-table-of-contents-collapsible>
  `,
})
class ScrollContainerHostComponent {}

describe("TableOfContentsCollapsibleComponent hideOnScroll with a scrollContainer", () => {
  let fixture: ComponentFixture<ScrollContainerHostComponent>;
  let collapsible: TableOfContentsCollapsibleComponent;
  let region: HTMLElement;
  let realRaf: typeof window.requestAnimationFrame;
  let scrollTop = 0;

  beforeEach(() => {
    scrollTop = 0;
    realRaf = window.requestAnimationFrame;
    window.requestAnimationFrame = ((callback: FrameRequestCallback) => {
      callback(0);
      return 0;
    }) as typeof window.requestAnimationFrame;

    TestBed.configureTestingModule({
      imports: [ScrollContainerHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "en" }],
    });

    fixture = TestBed.createComponent(ScrollContainerHostComponent);
    fixture.detectChanges();
    region = fixture.nativeElement.querySelector(".scroll-region");
    // jsdom has no layout, so script the container's scrollTop. Define it before
    // ApplicationRef.tick() runs the setup, which reads it to seed the position.
    Object.defineProperty(region, "scrollTop", {
      configurable: true,
      get: () => scrollTop,
    });
    TestBed.inject(ApplicationRef).tick();
    collapsible = fixture.debugElement.query(
      By.directive(TableOfContentsCollapsibleComponent),
    ).componentInstance;
  });

  afterEach(() => {
    window.requestAnimationFrame = realRaf;
  });

  const scrollTo = (y: number) => {
    scrollTop = y;
    region.dispatchEvent(new Event("scroll"));
  };

  it("hides on the container's scroll-down and reveals on scroll-up", () => {
    scrollTo(50);
    expect(collapsible.barHidden()).toBe(true);

    scrollTo(10);
    expect(collapsible.barHidden()).toBe(false);
  });
});
