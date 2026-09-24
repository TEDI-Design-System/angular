import { ComponentFixture, TestBed } from "@angular/core/testing";
import { StatusBadgeComponent } from "./status-badge.component";

describe("StatusBadgeComponent", () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;
  let component: StatusBadgeComponent;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("renders a div if title is not provided", () => {
    fixture.componentRef.setInput("text", "Text");
    fixture.detectChanges();

    const div = element.querySelector("div.tedi-status-badge");
    expect(div).not.toBeNull();
    expect(element.querySelector("abbr")).toBeNull();
  });

  it("renders the text when provided", () => {
    fixture.componentRef.setInput("text", "Text");
    fixture.detectChanges();

    const span = element.querySelector(".tedi-status-badge__text");
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe("Text");
  });

  it("renders an abbr if title is provided", () => {
    fixture.componentRef.setInput("title", "Title");
    fixture.componentRef.setInput("text", "Text");
    fixture.detectChanges();

    const abbr = element.querySelector("abbr.tedi-status-badge");
    expect(abbr).not.toBeNull();
    expect(abbr?.getAttribute("title")).toBe("Title");
  });

  it("applies classes for color, variant, size, and status", () => {
    fixture.componentRef.setInput("color", "brand");
    fixture.componentRef.setInput("variant", "filled-bordered");
    fixture.componentRef.setInput("size", "large");
    fixture.componentRef.setInput("status", "success");
    fixture.detectChanges();

    const badge = element.querySelector(".tedi-status-badge");
    expect(badge).not.toBeNull();

    expect(badge?.classList.contains("tedi-status-badge--color-brand")).toBe(
      true,
    );
    expect(
      badge?.classList.contains("tedi-status-badge--variant-filled-bordered"),
    ).toBe(true);
    expect(badge?.classList.contains("tedi-status-badge--large")).toBe(true);

    const indicator = element.querySelector("tedi-status-indicator");
    expect(indicator).not.toBeNull();
    expect(
      indicator?.classList.contains("tedi-status-indicator--success"),
    ).toBe(true);
  });

  it("computes aria-live based on role", () => {
    fixture.componentRef.setInput("role", "alert");
    fixture.detectChanges();
    expect(component.ariaLive()).toBe("assertive");

    fixture.componentRef.setInput("role", "status");
    fixture.detectChanges();
    expect(component.ariaLive()).toBe("polite");

    fixture.componentRef.setInput("role", "");
    fixture.detectChanges();
    expect(component.ariaLive()).toBeNull();
  });

  it("renders icon when icon is provided", () => {
    fixture.componentRef.setInput("icon", "edit");
    fixture.detectChanges();

    const icon = element.querySelector("tedi-icon");
    expect(icon).not.toBeNull();
  });

  it("adds icon-only class when only icon is present", () => {
    fixture.componentRef.setInput("icon", "edit");
    fixture.componentRef.setInput("text", "");
    fixture.detectChanges();

    const badge = element.querySelector(".tedi-status-badge");
    expect(badge).not.toBeNull();
    expect(badge?.classList.contains("tedi-status-badge__icon-only")).toBe(
      true,
    );
  });

  it("should include custom class in computed classes", () => {
    fixture.componentRef.setInput("class", "custom-class");
    fixture.detectChanges();

    const classes = component.classes();
    expect(classes).toContain("custom-class");
  });
});
