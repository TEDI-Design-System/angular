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
      By.css(".tedi-accordion-item-content"),
    );
    expect(content.nativeElement.textContent).toContain("Content");
  });

  it("should link content id with the trigger's aria-controls", () => {
    const content = fixture.debugElement.query(
      By.css(".tedi-accordion-item-content"),
    );
    const trigger = fixture.debugElement.query(
      By.css(".tedi-accordion-item-header__trigger"),
    );

    expect(content.nativeElement.id).toBeTruthy();
    expect(trigger.nativeElement.getAttribute("aria-controls")).toBe(
      content.nativeElement.id,
    );
  });

  it("should toggle aria-hidden and inert with the expanded state", () => {
    const content = fixture.debugElement.query(
      By.css(".tedi-accordion-item-content"),
    );

    expect(content.nativeElement.getAttribute("aria-hidden")).toBe("true");
    expect(content.nativeElement.hasAttribute("inert")).toBe(true);

    fixture.componentInstance.item.setExpanded(true);
    fixture.detectChanges();

    expect(content.nativeElement.getAttribute("aria-hidden")).toBe("false");
    expect(content.nativeElement.hasAttribute("inert")).toBe(false);
  });

  it("should set role and aria-labelledby on the panel", () => {
    const content = fixture.debugElement.query(
      By.css(".tedi-accordion-item-content"),
    );
    const trigger = fixture.debugElement.query(
      By.css(".tedi-accordion-item-header__trigger"),
    );

    // aria-labelledby always points to the trigger's id
    expect(trigger.nativeElement.id).toBeTruthy();
    expect(content.nativeElement.getAttribute("aria-labelledby")).toBe(
      trigger.nativeElement.id,
    );

    // role is null while collapsed
    expect(content.nativeElement.getAttribute("role")).toBeNull();

    // role becomes "region" once expanded; aria-labelledby is unchanged
    fixture.componentInstance.item.setExpanded(true);
    fixture.detectChanges();

    expect(content.nativeElement.getAttribute("role")).toBe("region");
    expect(content.nativeElement.getAttribute("aria-labelledby")).toBe(
      trigger.nativeElement.id,
    );
  });

  it("should apply custom contentClass and the icon-card modifier on the host", () => {
    fixture.componentInstance.contentClass = "custom-content";
    fixture.componentInstance.showIconCard = true;
    fixture.detectChanges();

    const contentEl = fixture.debugElement.query(
      By.directive(AccordionItemContentComponent),
    ).nativeElement as HTMLElement;

    expect(contentEl.classList).toContain("tedi-accordion-item-content");
    expect(contentEl.classList).toContain("custom-content");
    expect(contentEl.classList).toContain(
      "tedi-accordion-item-content--with-icon-card",
    );
  });
});
