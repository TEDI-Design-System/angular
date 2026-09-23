import { Component, ViewChild } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { AccordionItemComponent } from "./accordion-item.component";
import { AccordionItemHeaderComponent } from "../accordion-item-header/accordion-item-header.component";
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
    <tedi-accordion-item
      [defaultExpanded]="defaultExpanded"
      [selected]="selected"
      [itemId]="itemId"
      [openOnHashMatch]="openOnHashMatch"
      [disabled]="disabled"
    >
      <tedi-accordion-item-header />
      <tedi-accordion-item-content>Content</tedi-accordion-item-content>
    </tedi-accordion-item>
  `,
})
class TestHostComponent {
  @ViewChild(AccordionItemComponent) item!: AccordionItemComponent;

  defaultExpanded = false;
  selected = false;
  itemId: string | undefined = undefined;
  openOnHashMatch = false;
  disabled = false;
}

describe("AccordionItemComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let item: AccordionItemComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "en" }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  const initHost = (mutate?: (h: TestHostComponent) => void) => {
    if (mutate) mutate(host);
    fixture.detectChanges();
    item = host.item;
  };

  it("should create component", () => {
    initHost();
    expect(item).toBeTruthy();
  });

  it("should be collapsed by default", () => {
    initHost();

    expect(item.expanded()).toBe(false);

    const content = fixture.debugElement.query(
      By.css(".tedi-accordion-item-content"),
    );
    expect(content.nativeElement.getAttribute("aria-hidden")).toBe("true");
    expect(content.nativeElement.hasAttribute("inert")).toBe(true);
  });

  it("should be expanded when defaultExpanded is true", () => {
    initHost((h) => (h.defaultExpanded = true));

    expect(item.expanded()).toBe(true);

    const content = fixture.debugElement.query(
      By.css(".tedi-accordion-item-content"),
    );
    expect(content.nativeElement.getAttribute("aria-hidden")).toBe("false");
    expect(content.nativeElement.hasAttribute("inert")).toBe(false);
  });

  it("should update expanded state when setExpanded is called", () => {
    initHost();
    item.setExpanded(true);
    expect(item.expanded()).toBe(true);

    item.setExpanded(false);
    expect(item.expanded()).toBe(false);
  });

  it("should toggle expanded state when toggle() is called", () => {
    initHost();
    expect(item.expanded()).toBe(false);

    item.toggle();
    expect(item.expanded()).toBe(true);

    item.toggle();
    expect(item.expanded()).toBe(false);
  });

  it("should apply selected class when selected=true", () => {
    initHost((h) => (h.selected = true));

    const itemEl = fixture.debugElement.query(By.css(".tedi-accordion__item"));

    expect(itemEl.nativeElement.classList).toContain(
      "tedi-accordion__item--selected",
    );
  });

  it("should render the header and content as direct children of the item", () => {
    initHost();

    const header = fixture.debugElement.query(
      By.directive(AccordionItemHeaderComponent),
    );
    const content = fixture.debugElement.query(
      By.directive(AccordionItemContentComponent),
    );

    expect(header).not.toBeNull();
    expect(content).not.toBeNull();
  });

  describe("openOnHashMatch", () => {
    let originalHash: string;

    beforeEach(() => {
      originalHash = window.location.hash;
    });

    afterEach(() => {
      window.location.hash = originalHash;
    });

    it("auto-expands when the URL hash matches the itemId at init", () => {
      window.location.hash = "#deep-link-target";

      initHost((h) => {
        h.itemId = "deep-link-target";
        h.openOnHashMatch = true;
      });

      expect(item.expanded()).toBe(true);
    });

    it("auto-expands when the URL hash changes to match the itemId after mount", () => {
      window.location.hash = "#other";

      initHost((h) => {
        h.itemId = "deep-link-target";
        h.openOnHashMatch = true;
      });

      expect(item.expanded()).toBe(false);

      window.location.hash = "#deep-link-target";
      window.dispatchEvent(new HashChangeEvent("hashchange"));
      fixture.detectChanges();

      expect(item.expanded()).toBe(true);
    });

    it("removes the hashchange listener on destroy", () => {
      window.location.hash = "#other";

      initHost((h) => {
        h.itemId = "deep-link-target";
        h.openOnHashMatch = true;
      });

      const removeSpy = jest.spyOn(window, "removeEventListener");
      fixture.destroy();

      expect(removeSpy).toHaveBeenCalledWith(
        "hashchange",
        expect.any(Function),
      );
      removeSpy.mockRestore();
    });
  });
});
