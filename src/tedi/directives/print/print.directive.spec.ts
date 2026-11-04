import { Component, input } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { PrintBreak, PrintDirective, PrintVisibility } from "./print.directive";

@Component({
  standalone: true,
  imports: [PrintDirective],
  template: `
    <div
      class="consumer-class"
      [tediPrint]="visibility()"
      [breakBefore]="breakBefore()"
      [breakAfter]="breakAfter()"
      [breakInside]="breakInside()"
    >
      content
    </div>
  `,
})
class HostComponent {
  visibility = input<PrintVisibility | "">("");
  breakBefore = input<PrintBreak>();
  breakAfter = input<PrintBreak>();
  breakInside = input<PrintBreak>();
}

describe("PrintDirective", () => {
  let fixture: ComponentFixture<HostComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    element = fixture.debugElement.query(By.directive(PrintDirective))
      .nativeElement as HTMLElement;
  });

  it("applies no print classes by default", () => {
    expect(element.classList).toContain("consumer-class");
    expect(element.classList).not.toContain("no-print");
    expect(element.classList).not.toContain("show-print");
    expect(element.className).not.toContain("break-");
  });

  it("adds no-print when visibility is hide", () => {
    fixture.componentRef.setInput("visibility", "hide");
    fixture.detectChanges();

    expect(element.classList).toContain("no-print");
    expect(element.classList).not.toContain("show-print");
  });

  it("adds show-print when visibility is show", () => {
    fixture.componentRef.setInput("visibility", "show");
    fixture.detectChanges();

    expect(element.classList).toContain("show-print");
    expect(element.classList).not.toContain("no-print");
  });

  it("adds the break classes for each break input", () => {
    fixture.componentRef.setInput("breakBefore", "avoid");
    fixture.componentRef.setInput("breakAfter", "auto");
    fixture.componentRef.setInput("breakInside", "avoid-page");
    fixture.detectChanges();

    expect(element.classList).toContain("break-before-avoid");
    expect(element.classList).toContain("break-after-auto");
    expect(element.classList).toContain("break-inside-avoid-page");
  });

  it("replaces the previous break class when the value changes", () => {
    fixture.componentRef.setInput("breakInside", "avoid");
    fixture.detectChanges();
    expect(element.classList).toContain("break-inside-avoid");

    fixture.componentRef.setInput("breakInside", "avoid-column");
    fixture.detectChanges();

    expect(element.classList).not.toContain("break-inside-avoid");
    expect(element.classList).toContain("break-inside-avoid-column");
  });

  it("removes the break class when the input is cleared", () => {
    fixture.componentRef.setInput("breakBefore", "avoid-page");
    fixture.detectChanges();
    expect(element.classList).toContain("break-before-avoid-page");

    fixture.componentRef.setInput("breakBefore", undefined);
    fixture.detectChanges();

    expect(element.classList).not.toContain("break-before-avoid-page");
  });

  it("keeps the classes the consumer applied to the same element", () => {
    fixture.componentRef.setInput("visibility", "hide");
    fixture.componentRef.setInput("breakInside", "avoid");
    fixture.detectChanges();

    expect(element.classList).toContain("consumer-class");
  });

  it("never removes a print class the element already had", () => {
    element.classList.add("no-print");

    fixture.componentRef.setInput("visibility", "hide");
    fixture.detectChanges();
    expect(element.classList).toContain("no-print");

    fixture.componentRef.setInput("visibility", "");
    fixture.detectChanges();

    expect(element.classList).toContain("no-print");
  });
});
