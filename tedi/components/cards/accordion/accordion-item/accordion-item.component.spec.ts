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
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
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
    expect(body).toBeNull();
  });

  it("should be expanded when defaultExpanded is true", () => {
    fixture.componentRef.setInput("defaultExpanded", true);

    fixture.detectChanges();

    expect(component.expanded()).toBe(true);

    const body = fixture.debugElement.query(By.css(".tedi-accordion__body"));
    expect(body).not.toBeNull();
  });

  it("should emit toggled when header button is clicked", () => {
    fixture.detectChanges();

    const spy = jest.fn();
    component.toggled.subscribe(spy);

    const button = fixture.debugElement.query(
      By.css("button.tedi-accordion__header"),
    );

    button.triggerEventHandler("click");
    fixture.detectChanges();

    expect(spy).toHaveBeenCalled();
    expect(component.expanded()).toBe(false);
  });

  it("should not toggle expanded when withAction is true and header is clicked", () => {
    fixture.componentRef.setInput("withAction", true);
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

  it("should emit toggled selected state when action button is clicked", () => {
    const spy = jest.fn();
    component.selectToggle.subscribe(spy);

    fixture.componentRef.setInput("selected", false);

    component.onSelectClick(new MouseEvent("click"));

    expect(spy).toHaveBeenCalledWith(true);
  });

  it("should show open label when collapsed and close label when expanded", () => {
    fixture.componentRef.setInput("openLabel", "Open");
    fixture.componentRef.setInput("closeLabel", "Close");

    component.setExpanded(false);
    expect(component.expandLabel()).toBe("Open");

    component.setExpanded(true);
    expect(component.expandLabel()).toBe("Close");
  });

  it("should show start expand icon only when position=start and no action", () => {
    fixture.componentRef.setInput("expandIconPosition", "start");
    fixture.componentRef.setInput("withAction", false);

    expect(component.showStartExpandIcon()).toBe(true);
    expect(component.showEndExpandIcon()).toBe(false);
  });

  it("should not show expand icons when withAction is true", () => {
    fixture.componentRef.setInput("expandIconPosition", "start");
    fixture.componentRef.setInput("withAction", true);

    expect(component.showStartExpandIcon()).toBe(false);
    expect(component.showEndExpandIcon()).toBe(false);
  });
});
