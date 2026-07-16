import { Component, input } from "@angular/core";
import { ComponentFixture, fakeAsync, flush, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";
import { TableOfContentsCollapsibleComponent } from "./table-of-contents-collapsible.component";
import { TableOfContentsItemComponent } from "../table-of-contents-item/table-of-contents-item.component";

@Component({
  standalone: true,
  imports: [TableOfContentsCollapsibleComponent, TableOfContentsItemComponent],
  template: `
    <tedi-table-of-contents-collapsible [heading]="heading()" activeId="methods">
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
    fixture.debugElement.query(By.directive(TableOfContentsCollapsibleComponent))
      .componentInstance;

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
    expect(fixture.debugElement.query(By.css(".tedi-table-of-contents__bar"))).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain("Sisukord");
    expect(barButton().getAttribute("aria-haspopup")).toBe("dialog");
    expect(sheet()).toBeNull();
  });

  it("opens the sheet, listing the items and auto-expanding the active branch", fakeAsync(() => {
    openSheet();

    const panel = sheet();
    expect(panel).toBeTruthy();
    const links = Array.from(panel!.querySelectorAll("a")).map((a) => a.textContent?.trim());
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
    expect(document.querySelectorAll(".tedi-table-of-contents__sheet")).toHaveLength(1);

    collapsible().toggle(true);
    fixture.detectChanges();
    flush();

    expect(document.querySelectorAll(".tedi-table-of-contents__sheet")).toHaveLength(1);
    expect(sheet()).toBeTruthy();
  }));
});
