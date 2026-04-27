import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { AccordionItemComponent } from "../accordion-item/accordion-item.component";
import { AccordionItemHeaderComponent } from "../accordion-item-header/accordion-item-header.component";
import { AccordionItemContentComponent } from "./accordion-item-content.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";

@Component({
  standalone: true,
  imports: [
    AccordionItemComponent,
    AccordionItemHeaderComponent,
    AccordionItemContentComponent,
  ],
  template: `
    <tedi-accordion-item
      [defaultExpanded]="defaultExpanded"
      [showIconCard]="showIconCard"
    >
      <tedi-accordion-item-header />
      <tedi-accordion-item-content [contentClass]="contentClass">
        Content
      </tedi-accordion-item-content>
    </tedi-accordion-item>
  `,
})
class TestHostComponent {
  @ViewChild(AccordionItemComponent) item!: AccordionItemComponent;
  @ViewChild(AccordionItemContentComponent)
  content!: AccordionItemContentComponent;

  defaultExpanded = false;
  showIconCard = false;
  contentClass: string | null = null;
}

describe("AccordionItemContentComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "en" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  it("should project its children into the content", () => {
    const content = fixture.debugElement.query(
      By.css(".tedi-accordion__content"),
    );
    expect(content.nativeElement.textContent).toContain("Content");
  });

  it("should link content id with header aria-controls", () => {
    const content = fixture.debugElement.query(
      By.css(".tedi-accordion__content"),
    );
    const header = fixture.debugElement.query(
      By.css(".tedi-accordion__header"),
    );

    expect(content.nativeElement.id).toBeTruthy();
    expect(header.nativeElement.getAttribute("aria-controls")).toBe(
      content.nativeElement.id,
    );
  });

  it("should toggle aria-hidden and inert with the expanded state", () => {
    const content = fixture.debugElement.query(
      By.css(".tedi-accordion__content"),
    );

    expect(content.nativeElement.getAttribute("aria-hidden")).toBe("true");
    expect(content.nativeElement.hasAttribute("inert")).toBe(true);

    fixture.componentInstance.item.setExpanded(true);
    fixture.detectChanges();

    expect(content.nativeElement.getAttribute("aria-hidden")).toBe("false");
    expect(content.nativeElement.hasAttribute("inert")).toBe(false);
  });

  it("should include custom contentClass and icon-card modifier in contentClasses", () => {
    fixture.componentInstance.contentClass = "custom-content";
    fixture.componentInstance.showIconCard = true;
    fixture.detectChanges();

    expect(fixture.componentInstance.content.contentClasses()).toEqual({
      "custom-content": true,
      "tedi-accordion__content": true,
      "tedi-accordion__content--with-icon-card": true,
    });
  });
});
