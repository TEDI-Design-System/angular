import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";

import { AccordionComponent } from "./accordion.component";
import { AccordionItemComponent } from "../accordion-item/accordion-item.component";
import { By } from "@angular/platform-browser";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";

@Component({
  standalone: true,
  imports: [AccordionComponent, AccordionItemComponent],
  template: `
    <tedi-accordion [multiple]="multiple">
      <tedi-accordion-item title="Item 1"></tedi-accordion-item>
      <tedi-accordion-item title="Item 2"></tedi-accordion-item>
      <tedi-accordion-item title="Item 3"></tedi-accordion-item>
    </tedi-accordion>
  `,
})
class TestHostComponent {
  multiple = false;
}

describe("AccordionComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let accordion: AccordionComponent;
  let items: AccordionItemComponent[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
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
    expect(accordion.items.length).toBe(3);
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

  it("should collapse other items when multiple=false", () => {
    items[0].toggle();
    fixture.detectChanges();

    items[1].toggle();
    fixture.detectChanges();

    expect(items[0].expanded()).toBe(false);
    expect(items[1].expanded()).toBe(true);
  });

  it("should allow multiple items expanded when multiple=true", () => {
    host.multiple = true;
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
