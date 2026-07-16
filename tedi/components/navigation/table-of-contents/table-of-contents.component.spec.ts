import { Component, input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";

import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import {
  TableOfContentsComponent,
  TableOfContentsHeadingLevel,
  TableOfContentsVariant,
} from "./table-of-contents.component";
import { TableOfContentsItemComponent } from "./table-of-contents-item/table-of-contents-item.component";

@Component({
  standalone: true,
  imports: [TableOfContentsComponent, TableOfContentsItemComponent],
  template: `
    <tedi-table-of-contents
      [heading]="heading()"
      [headingLevel]="headingLevel()"
      [activeId]="activeId()"
      [variant]="variant()"
      [numbered]="numbered()"
      [showIcons]="showIcons()"
      [sticky]="sticky()"
      [ariaLabel]="ariaLabel()"
    >
      <tedi-table-of-contents-item itemId="a">
        <a href="#a">Alpha</a>
        <tedi-table-of-contents-item itemId="a1">
          <a href="#a1">Alpha 1</a>
        </tedi-table-of-contents-item>
      </tedi-table-of-contents-item>
      <tedi-table-of-contents-item itemId="b">
        <a href="#b">Bravo</a>
        <tedi-table-of-contents-item itemId="b1">
          <a href="#b1">Bravo 1</a>
        </tedi-table-of-contents-item>
      </tedi-table-of-contents-item>
      <tedi-table-of-contents-item itemId="c">
        <a href="#c">Charlie</a>
      </tedi-table-of-contents-item>
    </tedi-table-of-contents>
  `,
})
class TreeHostComponent {
  readonly heading = input<string | null | undefined>(undefined);
  readonly headingLevel = input<TableOfContentsHeadingLevel>("h3");
  readonly activeId = input<string>();
  readonly variant = input<TableOfContentsVariant>("default");
  readonly numbered = input(false);
  readonly showIcons = input(false);
  readonly sticky = input(true);
  readonly ariaLabel = input<string>();
}

@Component({
  standalone: true,
  imports: [TableOfContentsComponent, TableOfContentsItemComponent],
  template: `
    <tedi-table-of-contents [showIcons]="true">
      <tedi-table-of-contents-item itemId="x" [isValid]="true">
        <a href="#x">Valid</a>
      </tedi-table-of-contents-item>
      <tedi-table-of-contents-item itemId="y" [isValid]="false">
        <a href="#y">Invalid</a>
      </tedi-table-of-contents-item>
      <tedi-table-of-contents-item itemId="z">
        <a href="#z">Untouched</a>
      </tedi-table-of-contents-item>
    </tedi-table-of-contents>
  `,
})
class IconHostComponent {}

const setup = async (component: unknown) => {
  await TestBed.configureTestingModule({
    imports: [component as never],
    providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "en" }],
  }).compileComponents();
};

const text = (el: HTMLElement | null | undefined) => el?.textContent?.trim();

describe("TableOfContentsComponent", () => {
  let fixture: ComponentFixture<TreeHostComponent>;

  const createTree = async () => {
    await setup(TreeHostComponent);
    fixture = TestBed.createComponent(TreeHostComponent);
    fixture.detectChanges();
    return fixture;
  };

  const linkByText = (label: string): HTMLElement | undefined =>
    fixture.debugElement
      .queryAll(By.css("a"))
      .map((de) => de.nativeElement as HTMLElement)
      .find((el) => text(el) === label);

  const itemByLabel = (label: string): HTMLElement | null =>
    linkByText(label)?.closest('[data-name="table-of-contents-item"]') ?? null;

  it("renders the default localized heading and the top-level items", async () => {
    await createTree();
    const heading = fixture.debugElement.query(By.css("h3"));
    expect(text(heading.nativeElement)).toBe("Table of contents");
    expect(linkByText("Alpha")).toBeTruthy();
    expect(linkByText("Charlie")).toBeTruthy();
  });

  it("renders the heading as an h3 element by default", async () => {
    await createTree();
    fixture.componentRef.setInput("heading", "Sisukord");
    fixture.detectChanges();
    const h3 = fixture.debugElement.query(By.css("h3.tedi-table-of-contents__heading"));
    expect(text(h3?.nativeElement)).toBe("Sisukord");
  });

  it("renders the heading at the configured level while keeping the label", async () => {
    await createTree();
    fixture.componentRef.setInput("heading", "Sisukord");
    fixture.componentRef.setInput("headingLevel", "h2");
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css("h3.tedi-table-of-contents__heading"))).toBeNull();
    const h2 = fixture.debugElement.query(By.css("h2.tedi-table-of-contents__heading")).nativeElement as HTMLElement;
    expect(text(h2)).toBe("Sisukord");
    const nav = fixture.debugElement.query(By.css("nav")).nativeElement as HTMLElement;
    expect(nav.getAttribute("aria-labelledby")).toBe(h2.id);
  });

  it("marks the active item with aria-current and leaves others unmarked", async () => {
    await createTree();
    fixture.componentRef.setInput("activeId", "a");
    fixture.detectChanges();
    expect(itemByLabel("Alpha")?.getAttribute("aria-current")).toBe("true");
    expect(itemByLabel("Bravo")?.getAttribute("aria-current")).toBeNull();
  });

  it("expands only the active branch and keeps other branches collapsed", async () => {
    await createTree();
    fixture.componentRef.setInput("activeId", "a1");
    fixture.detectChanges();
    expect(linkByText("Alpha 1")).toBeTruthy();
    expect(linkByText("Bravo 1")).toBeFalsy();
  });

  it("exposes a navigation landmark labelled by a custom heading", async () => {
    await createTree();
    fixture.componentRef.setInput("heading", "Sisukord");
    fixture.detectChanges();
    const nav = fixture.debugElement.query(By.css("nav")).nativeElement as HTMLElement;
    const heading = fixture.debugElement.query(By.css("h3")).nativeElement as HTMLElement;
    expect(text(heading)).toBe("Sisukord");
    expect(nav.getAttribute("aria-labelledby")).toBe(heading.id);
    expect(nav.getAttribute("aria-label")).toBeNull();
  });

  it("lets an explicit ariaLabel override the heading-derived nav name", async () => {
    await createTree();
    fixture.componentRef.setInput("heading", "Sisukord");
    fixture.componentRef.setInput("ariaLabel", "Lehe sisukord");
    fixture.detectChanges();
    const nav = fixture.debugElement.query(By.css("nav")).nativeElement as HTMLElement;
    expect(nav.getAttribute("aria-label")).toBe("Lehe sisukord");
    expect(nav.getAttribute("aria-labelledby")).toBeNull();
  });

  it("uses list semantics and never tree/treeitem roles", async () => {
    await createTree();
    expect(fixture.debugElement.query(By.css('[role="tree"]'))).toBeNull();
    expect(fixture.debugElement.query(By.css('[role="treeitem"]'))).toBeNull();
    expect(fixture.debugElement.queryAll(By.css('[role="list"]')).length).toBeGreaterThan(0);
    expect(itemByLabel("Alpha")?.getAttribute("role")).toBe("listitem");
  });

  it("labels the navigation with the localized title when rendered headless", async () => {
    await createTree();
    fixture.componentRef.setInput("heading", null);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css("h3"))).toBeNull();
    const nav = fixture.debugElement.query(By.css("nav")).nativeElement as HTMLElement;
    expect(nav.getAttribute("aria-label")).toBe("Table of contents");
  });

  it("renders hierarchical numbers when numbered", async () => {
    await createTree();
    fixture.componentRef.setInput("numbered", true);
    fixture.componentRef.setInput("activeId", "a1");
    fixture.detectChanges();
    const numbers = fixture.debugElement
      .queryAll(By.css(".tedi-table-of-contents__number"))
      .map((de) => text(de.nativeElement));
    expect(numbers).toContain("1.");
    expect(numbers).toContain("2.");
    expect(numbers).toContain("1.1");
  });

  it("omits the card chrome and adds the transparent modifier in the transparent variant", async () => {
    await createTree();
    expect(fixture.debugElement.query(By.css("tedi-card"))).toBeTruthy();

    fixture.componentRef.setInput("variant", "transparent");
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css("tedi-card"))).toBeNull();
    expect(fixture.debugElement.query(By.css(".tedi-table-of-contents--transparent"))).toBeTruthy();
    expect(linkByText("Alpha")).toBeTruthy();
  });

  it("applies the sticky modifier only when sticky", async () => {
    await createTree();
    expect(fixture.debugElement.query(By.css(".tedi-table-of-contents--sticky"))).toBeTruthy();

    fixture.componentRef.setInput("sticky", false);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css(".tedi-table-of-contents--sticky"))).toBeNull();
  });

  it("renders a distinct icon shape and text alternative per validation state", async () => {
    await setup(IconHostComponent);
    const iconFixture = TestBed.createComponent(IconHostComponent);
    iconFixture.detectChanges();

    const icons = iconFixture.debugElement
      .queryAll(By.css("tedi-icon"))
      .map((de) => de.nativeElement as HTMLElement);
    const names = icons.map((el) => el.textContent?.trim());
    const labels = icons.map((el) => el.getAttribute("aria-label"));

    expect(names).toEqual(["check", "warning", "circle"]);
    expect(labels).toEqual(["Valid", "Invalid", "Not completed"]);
  });
});
