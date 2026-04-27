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

  it("should render a button trigger when headerClickable is true", () => {
    const button = fixture.debugElement.query(
      By.css("button.tedi-accordion-item-header__trigger"),
    );
    expect(button).not.toBeNull();
  });

  it("should render a non-button trigger when headerClickable is false", () => {
    host.headerClickable = false;
    fixture.detectChanges();

    const button = fixture.debugElement.query(
      By.css("button.tedi-accordion-item-header__trigger"),
    );
    const div = fixture.debugElement.query(
      By.css("div.tedi-accordion-item-header__trigger"),
    );

    expect(button).toBeNull();
    expect(div).not.toBeNull();
  });

  it("should toggle the item when the clickable header is clicked", () => {
    const button = fixture.debugElement.query(
      By.css("button.tedi-accordion-item-header__trigger"),
    );

    expect(host.item.expanded()).toBe(false);
    button.triggerEventHandler("click");
    fixture.detectChanges();
    expect(host.item.expanded()).toBe(true);
  });

  it("should not toggle the item when headerClickable is false and the trigger is clicked", () => {
    host.headerClickable = false;
    fixture.detectChanges();

    const trigger = fixture.debugElement.query(
      By.css(".tedi-accordion-item-header__trigger"),
    );

    trigger.triggerEventHandler("click");
    fixture.detectChanges();

    expect(host.item.expanded()).toBe(false);
  });

  it("should set aria-expanded on the trigger button", () => {
    const button = fixture.debugElement.query(
      By.css("button.tedi-accordion-item-header__trigger"),
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

  it("should apply block class and modifiers on the host element", () => {
    const headerEl = fixture.debugElement.query(
      By.directive(AccordionItemHeaderComponent),
    ).nativeElement as HTMLElement;

    expect(headerEl.classList).toContain("tedi-accordion-item-header");
    expect(headerEl.classList).toContain(
      "tedi-accordion-item-header--hoverable",
    );
    expect(headerEl.classList).not.toContain(
      "tedi-accordion-item-header--expanded",
    );

    host.item.setExpanded(true);
    fixture.detectChanges();
    expect(headerEl.classList).toContain(
      "tedi-accordion-item-header--expanded",
    );

    host.headerClickable = false;
    fixture.detectChanges();
    expect(headerEl.classList).not.toContain(
      "tedi-accordion-item-header--hoverable",
    );
  });

  it("should apply custom headerClass on the host element", () => {
    host.headerClass = "custom-header";
    fixture.detectChanges();

    const headerEl = fixture.debugElement.query(
      By.directive(AccordionItemHeaderComponent),
    ).nativeElement as HTMLElement;

    expect(headerEl.classList).toContain("custom-header");
    // The block class should still be present
    expect(headerEl.classList).toContain("tedi-accordion-item-header");
  });
});
