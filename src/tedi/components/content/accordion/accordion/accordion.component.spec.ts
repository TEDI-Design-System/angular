import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";

import { AccordionComponent } from "./accordion.component";
import { AccordionItemComponent } from "../accordion-item/accordion-item.component";
import { AccordionItemHeaderComponent } from "../accordion-item-header/accordion-item-header.component";
import { AccordionItemContentComponent } from "../accordion-item-content/accordion-item-content.component";
import { By } from "@angular/platform-browser";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";

@Component({
  standalone: true,
  imports: [
    AccordionComponent,
    AccordionItemComponent,
    AccordionItemHeaderComponent,
    AccordionItemContentComponent,
  ],
  template: `
    <tedi-accordion [allowMultiple]="allowMultiple">
      <tedi-accordion-item>
        <tedi-accordion-item-header>
          <span tedi-accordion-title>Item 1</span>
        </tedi-accordion-item-header>
        <tedi-accordion-item-content>Content 1</tedi-accordion-item-content>
      </tedi-accordion-item>
      <tedi-accordion-item>
        <tedi-accordion-item-header>
          <span tedi-accordion-title>Item 2</span>
        </tedi-accordion-item-header>
        <tedi-accordion-item-content>Content 2</tedi-accordion-item-content>
      </tedi-accordion-item>
      <tedi-accordion-item>
        <tedi-accordion-item-header>
          <span tedi-accordion-title>Item 3</span>
        </tedi-accordion-item-header>
        <tedi-accordion-item-content>Content 3</tedi-accordion-item-content>
      </tedi-accordion-item>
    </tedi-accordion>
  `,
})
class TestHostComponent {
  allowMultiple = false;
}

describe("AccordionComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let accordion: AccordionComponent;
  let items: AccordionItemComponent[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "en" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    accordion = fixture.debugElement.query(
      By.directive(AccordionComponent),
    ).componentInstance;

    items = fixture.debugElement
      .queryAll(By.directive(AccordionItemComponent))
      .map((de) => de.componentInstance);
  });

  it("should create accordion component", () => {
    expect(accordion).toBeTruthy();
  });

  it("should register all accordion items via ContentChildren", () => {
    expect(accordion.items().length).toBe(3);
  });

  it("should expand clicked item", () => {
    items[0].toggle();
    fixture.detectChanges();

    expect(items[0].expanded()).toBe(true);
  });

  it("should collapse an expanded item when toggled again", () => {
    items[0].toggle();
    fixture.detectChanges();
    expect(items[0].expanded()).toBe(true);

    items[0].toggle();
    fixture.detectChanges();
    expect(items[0].expanded()).toBe(false);
  });

  it("should collapse other items when allowMultiple=false", () => {
    items[0].toggle();
    fixture.detectChanges();

    items[1].toggle();
    fixture.detectChanges();

    expect(items[0].expanded()).toBe(false);
    expect(items[1].expanded()).toBe(true);
  });

  it("should allow multiple items expanded when allowMultiple=true", () => {
    host.allowMultiple = true;
    fixture.detectChanges();

    items[0].toggle();
    fixture.detectChanges();

    items[1].toggle();
    fixture.detectChanges();

    expect(items[0].expanded()).toBe(true);
    expect(items[1].expanded()).toBe(true);
    expect(items[2].expanded()).toBe(false);
  });
});
