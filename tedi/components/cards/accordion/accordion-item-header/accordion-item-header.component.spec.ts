import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { AccordionItemComponent } from "../accordion-item/accordion-item.component";
import { AccordionItemHeaderComponent } from "./accordion-item-header.component";
import { AccordionItemContentComponent } from "../accordion-item-content/accordion-item-content.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";

@Component({
  standalone: true,
  imports: [
    AccordionItemComponent,
    AccordionItemHeaderComponent,
    AccordionItemContentComponent,
  ],
  template: `
    <tedi-accordion-item>
      <tedi-accordion-item-header
        [showExpandLabel]="showExpandLabel"
        [headerClickable]="headerClickable"
        [headerClass]="headerClass"
        [openLabel]="openLabel"
        [closeLabel]="closeLabel"
      >
        <span tedi-accordion-title>{{ title }}</span>
      </tedi-accordion-item-header>
      <tedi-accordion-item-content>Content</tedi-accordion-item-content>
    </tedi-accordion-item>
  `,
})
class TestHostComponent {
  @ViewChild(AccordionItemComponent) item!: AccordionItemComponent;
  @ViewChild(AccordionItemHeaderComponent)
  header!: AccordionItemHeaderComponent;

  title = "Hello";
  showExpandLabel = true;
  headerClickable = true;
  headerClass: string | null = null;
  openLabel = "open";
  closeLabel = "close";
}

describe("AccordionItemHeaderComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "en" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should render the title projected via [tedi-accordion-title]", () => {
    const titleText = fixture.nativeElement.textContent as string;
    expect(titleText).toContain("Hello");
  });

  it("should render a button when headerClickable is true", () => {
    const button = fixture.debugElement.query(
      By.css("button.tedi-accordion__header"),
    );
    expect(button).not.toBeNull();
  });

  it("should render a non-button element when headerClickable is false", () => {
    host.headerClickable = false;
    fixture.detectChanges();

    const button = fixture.debugElement.query(
      By.css("button.tedi-accordion__header"),
    );
    const div = fixture.debugElement.query(
      By.css("div.tedi-accordion__header"),
    );

    expect(button).toBeNull();
    expect(div).not.toBeNull();
  });

  it("should toggle the item when the clickable header is clicked", () => {
    const button = fixture.debugElement.query(
      By.css("button.tedi-accordion__header"),
    );

    expect(host.item.expanded()).toBe(false);
    button.triggerEventHandler("click");
    fixture.detectChanges();
    expect(host.item.expanded()).toBe(true);
  });

  it("should not toggle the item when headerClickable is false and header is clicked", () => {
    host.headerClickable = false;
    fixture.detectChanges();

    const header = fixture.debugElement.query(
      By.css(".tedi-accordion__header"),
    );

    header.triggerEventHandler("click");
    fixture.detectChanges();

    expect(host.item.expanded()).toBe(false);
  });

  it("should set aria-expanded on header button", () => {
    const button = fixture.debugElement.query(
      By.css("button.tedi-accordion__header"),
    )?.nativeElement as HTMLButtonElement;

    expect(button.getAttribute("aria-expanded")).toBe("false");

    host.item.setExpanded(true);
    fixture.detectChanges();

    expect(button.getAttribute("aria-expanded")).toBe("true");
  });

  it("should show open label when collapsed and close label when expanded", () => {
    host.openLabel = "Open";
    host.closeLabel = "Close";
    fixture.detectChanges();

    host.item.setExpanded(false);
    fixture.detectChanges();
    expect(host.header.expandLabel()).toBe("Open");

    host.item.setExpanded(true);
    fixture.detectChanges();
    expect(host.header.expandLabel()).toBe("Close");
  });

  it("should include custom header class when set", () => {
    host.headerClass = "custom-header";
    fixture.detectChanges();

    expect(host.header.headerClasses()).toEqual({
      "custom-header": true,
      "tedi-accordion__header": true,
      "tedi-accordion__header--hoverable": true,
      "tedi-accordion__header--expanded": false,
      "tedi-accordion__header--with-icon-card": false,
    });
  });
});
