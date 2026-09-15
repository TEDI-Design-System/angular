import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { IconComponent } from "../../base/icon/icon.component";
import { HeadingWithIconComponent } from "./heading-with-icon.component";

@Component({
  standalone: true,
  imports: [HeadingWithIconComponent],
  template: `<tedi-heading-with-icon [name]="name">{{
    text
  }}</tedi-heading-with-icon>`,
})
class TestHostComponent {
  name = "assignment_ind";
  text = "My family physician";
}

const LINE_HEIGHT_VAR = "--_tedi-heading-with-icon-line-height";

describe("HeadingWithIcon Component", () => {
  let fixture: ComponentFixture<HeadingWithIconComponent>;
  let hostElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HeadingWithIconComponent, TestHostComponent],
    });

    fixture = TestBed.createComponent(HeadingWithIconComponent);
    fixture.componentRef.setInput("name", "assignment_ind");
    hostElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
    expect(hostElement.classList).toContain("tedi-heading-with-icon");
  });

  it("should render an h4 heading by default", () => {
    expect(hostElement.querySelector("h4")).toBeTruthy();
  });

  it("should render the heading element given", () => {
    fixture.componentRef.setInput("element", "h2");
    fixture.detectChanges();

    expect(hostElement.querySelector("h4")).toBeNull();
    expect(hostElement.querySelector("h2")).toBeTruthy();
  });

  it("should center the icon against the heading line height", () => {
    expect(hostElement.style.getPropertyValue(LINE_HEIGHT_VAR)).toBe(
      "var(--heading-h4-line-height)",
    );

    fixture.componentRef.setInput("element", "h1");
    fixture.detectChanges();

    expect(hostElement.style.getPropertyValue(LINE_HEIGHT_VAR)).toBe(
      "var(--heading-h1-line-height)",
    );
  });

  it("should style the heading by modifier while keeping the element semantics", () => {
    fixture.componentRef.setInput("element", "h2");
    fixture.componentRef.setInput("modifiers", "h4");
    fixture.detectChanges();

    const heading = hostElement.querySelector("h2");

    expect(heading).toBeTruthy();
    expect(heading?.classList).toContain("tedi-text--h4");
  });

  it("should center the icon against the heading modifier when one overrides the element", () => {
    fixture.componentRef.setInput("element", "h2");
    fixture.componentRef.setInput("modifiers", ["break-word", "h4"]);
    fixture.detectChanges();

    expect(hostElement.style.getPropertyValue(LINE_HEIGHT_VAR)).toBe(
      "var(--heading-h4-line-height)",
    );
  });

  it("should render the icon by name and hide it from assistive technology", () => {
    const icon = hostElement.querySelector("tedi-icon");

    expect(icon?.textContent?.trim()).toBe("assignment_ind");
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  it("should apply primary heading and icon colors by default", () => {
    expect(hostElement.querySelector("h4")?.classList).toContain(
      "tedi-text--primary",
    );
    expect(hostElement.querySelector("tedi-icon")?.classList).toContain(
      "tedi-icon--color-primary",
    );
  });

  it("should apply the heading and icon colors given", () => {
    fixture.componentRef.setInput("headingColor", "white");
    fixture.componentRef.setInput("iconColor", "brand");
    fixture.detectChanges();

    expect(hostElement.querySelector("h4")?.classList).toContain(
      "tedi-text--white",
    );
    expect(hostElement.querySelector("tedi-icon")?.classList).toContain(
      "tedi-icon--color-brand",
    );
  });

  it("should forward the icon size and variant given", () => {
    fixture.componentRef.setInput("size", 36);
    fixture.componentRef.setInput("variant", "filled");
    fixture.detectChanges();

    const icon = fixture.debugElement.query(By.directive(IconComponent))
      .componentInstance as IconComponent;

    expect(icon.size()).toBe(36);
    expect(icon.variant()).toBe("filled");
  });

  it("should project content into the heading", () => {
    const hostFixture = TestBed.createComponent(TestHostComponent);
    hostFixture.detectChanges();

    expect(
      hostFixture.nativeElement.querySelector("h4")?.textContent?.trim(),
    ).toBe("My family physician");
  });
});
