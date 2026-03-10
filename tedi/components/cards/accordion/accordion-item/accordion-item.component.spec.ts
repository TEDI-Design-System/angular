import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AccordionItemComponent } from "./accordion-item.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";
import { By } from "@angular/platform-browser";

describe("AccordionItemComponent", () => {
  let fixture: ComponentFixture<AccordionItemComponent>;
  let component: AccordionItemComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccordionItemComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "en" }],
    }).compileComponents();

    fixture = TestBed.createComponent(AccordionItemComponent);
    component = fixture.componentInstance;
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should be collapsed by default", () => {
    fixture.detectChanges();

    const body = fixture.debugElement.query(By.css(".tedi-accordion__body"));
    expect(body.nativeElement.offsetHeight).toBe(0);
  });

  it("should be expanded when defaultExpanded is true", () => {
    fixture.componentRef.setInput("defaultExpanded", true);

    fixture.detectChanges();

    expect(component.expanded()).toBe(true);

    const body = fixture.debugElement.query(By.css(".tedi-accordion__body"));
    expect(body).not.toBeNull();
  });

  it("should expand when header button is clicked", () => {
    fixture.detectChanges();

    const button = fixture.debugElement.query(
      By.css("button.tedi-accordion__header"),
    );

    expect(component.expanded()).toBe(false);

    button.triggerEventHandler("click");
    fixture.detectChanges();

    expect(component.expanded()).toBe(true);
  });

  it("should not toggle expanded when headerClickable is false and header is clicked", () => {
    fixture.componentRef.setInput("headerClickable", false);
    fixture.detectChanges();

    const header = fixture.debugElement.query(
      By.css(".tedi-accordion__header"),
    );

    header.triggerEventHandler("click");
    fixture.detectChanges();

    expect(component.expanded()).toBe(false);
  });

  it("should update expanded state when setExpanded is called", () => {
    component.setExpanded(true);
    expect(component.expanded()).toBe(true);

    component.setExpanded(false);
    expect(component.expanded()).toBe(false);
  });

  it("should set aria-expanded on header button", () => {
    fixture.detectChanges();

    const button = fixture.debugElement.query(
      By.css("button.tedi-accordion__header"),
    )?.nativeElement as HTMLButtonElement;

    expect(button.getAttribute("aria-expanded")).toBe("false");

    component.setExpanded(true);
    fixture.detectChanges();

    expect(button.getAttribute("aria-expanded")).toBe("true");
  });

  it("should apply selected class when selected=true", () => {
    fixture.componentRef.setInput("selected", true);
    fixture.detectChanges();

    const item = fixture.debugElement.query(By.css(".tedi-accordion__item"));

    expect(item.nativeElement.classList).toContain(
      "tedi-accordion__item--selected",
    );
  });

  it("should show open label when collapsed and close label when expanded", () => {
    fixture.componentRef.setInput("openLabel", "Open");
    fixture.componentRef.setInput("closeLabel", "Close");

    component.setExpanded(false);
    expect(component.expandLabel()).toBe("Open");

    component.setExpanded(true);
    expect(component.expandLabel()).toBe("Close");
  });

  it("should include custom header and body classes when set", () => {
    fixture.componentRef.setInput("headerClass", "custom-header");
    fixture.componentRef.setInput("bodyClass", "custom-body");
    fixture.detectChanges();

    expect(component.headerClasses()).toEqual({
      "custom-header": true,
      "tedi-accordion__header": true,
      "tedi-accordion__header--hoverable": true,
      "tedi-accordion__header--expanded": false,
      "tedi-accordion__header--with-icon-card": false,
    });

    expect(component.bodyClasses()).toEqual({
      "custom-body": true,
      "tedi-accordion__body": true,
      "tedi-accordion__body--with-icon-card": false,
    });
  });
});
