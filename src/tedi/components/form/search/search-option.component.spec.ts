import { ComponentFixture, TestBed } from "@angular/core/testing";
import { SearchOptionComponent } from "./search-option.component";

describe("SearchOptionComponent", () => {
  let fixture: ComponentFixture<SearchOptionComponent>;
  let component: SearchOptionComponent;
  let el: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SearchOptionComponent] });
    fixture = TestBed.createComponent(SearchOptionComponent);
    component = fixture.componentInstance;
    el = fixture.nativeElement as HTMLElement;
    fixture.componentRef.setInput("label", "Mari Maasikas");
    fixture.detectChanges();
  });

  it("renders as an option that is not a tab stop", () => {
    expect(el.getAttribute("role")).toBe("option");
    expect(el.getAttribute("tabindex")).toBe("-1");
  });

  it("renders the label with no highlight when there is no query", () => {
    expect(el.textContent?.trim()).toBe("Mari Maasikas");
    expect(el.querySelector(".text-bold")).toBeNull();
  });

  it("bolds the matched substring", () => {
    fixture.componentRef.setInput("query", "Mar");
    fixture.detectChanges();

    const bold = el.querySelector(".text-bold");
    expect(bold?.textContent).toBe("Mar");
  });

  it("reports inactive state by default", () => {
    expect(component.isActive()).toBe(false);
    expect(el.getAttribute("aria-selected")).toBe("false");
  });

  it("setActiveStyles marks it active and aria-selected", () => {
    component.setActiveStyles();
    fixture.detectChanges();

    expect(component.isActive()).toBe(true);
    expect(el.getAttribute("aria-selected")).toBe("true");
    expect(el.classList).toContain("tedi-search-option--active");
  });

  it("setInactiveStyles clears the active state", () => {
    component.setActiveStyles();
    fixture.detectChanges();
    component.setInactiveStyles();
    fixture.detectChanges();

    expect(component.isActive()).toBe(false);
    expect(el.classList).not.toContain("tedi-search-option--active");
  });

  it("exposes the label to the key manager via getLabel", () => {
    expect(component.getLabel()).toBe("Mari Maasikas");
  });

  it("exposes disabled as a plain boolean for the key manager", () => {
    expect(component.disabled).toBe(false);

    fixture.componentRef.setInput("disabled", true);
    fixture.detectChanges();

    expect(component.disabled).toBe(true);
    expect(el.getAttribute("aria-disabled")).toBe("true");
  });
});
