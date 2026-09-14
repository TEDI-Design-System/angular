import { ComponentFixture, TestBed } from "@angular/core/testing";
import { StatusIndicatorComponent } from "./status-indicator.component";

describe("StatusIndicatorComponent", () => {
  let fixture: ComponentFixture<StatusIndicatorComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusIndicatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusIndicatorComponent);
    element = fixture.nativeElement;
  });

  it("should create the component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should have default classes", () => {
    fixture.detectChanges();
    expect(element.classList.contains("tedi-status-indicator")).toBe(true);
    expect(element.classList.contains("tedi-status-indicator--success")).toBe(
      true,
    );
    expect(element.classList.contains("tedi-status-indicator--sm")).toBe(true);
  });

  it("should apply type class", () => {
    fixture.componentRef.setInput("type", "danger");
    fixture.detectChanges();
    expect(element.classList.contains("tedi-status-indicator--danger")).toBe(
      true,
    );
    expect(element.classList.contains("tedi-status-indicator--success")).toBe(
      false,
    );
  });

  it("should apply size class", () => {
    fixture.componentRef.setInput("size", "lg");
    fixture.detectChanges();
    expect(element.classList.contains("tedi-status-indicator--lg")).toBe(true);
    expect(element.classList.contains("tedi-status-indicator--sm")).toBe(false);
  });

  it("should apply bordered class", () => {
    fixture.componentRef.setInput("hasBorder", true);
    fixture.detectChanges();
    expect(element.classList.contains("tedi-status-indicator--bordered")).toBe(
      true,
    );
  });

  it("should apply top-right position class", () => {
    fixture.componentRef.setInput("position", "top-right");
    fixture.detectChanges();
    expect(element.classList.contains("tedi-status-indicator--top-right")).toBe(
      true,
    );
  });

  it("should be aria-hidden by default (decorative)", () => {
    fixture.detectChanges();
    expect(element.getAttribute("aria-hidden")).toBe("true");
    expect(element.getAttribute("role")).toBeNull();
    expect(element.getAttribute("aria-label")).toBeNull();
  });

  it("should expose accessible name when label is provided", () => {
    fixture.componentRef.setInput("label", "Active");
    fixture.detectChanges();
    expect(element.getAttribute("role")).toBe("img");
    expect(element.getAttribute("aria-label")).toBe("Active");
    expect(element.getAttribute("aria-hidden")).toBe("false");
  });
});
