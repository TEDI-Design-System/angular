import { ComponentFixture, TestBed } from "@angular/core/testing";
import { VerticalSpacingItemDirective } from "./vertical-spacing-item.directive";
import { Component, NO_ERRORS_SCHEMA, signal } from "@angular/core";
import { By } from "@angular/platform-browser";
import type { VerticalSpacingSize } from "./vertical-spacing.directive";

@Component({
  template: `<div
    style="max-width: 360px"
    [tediVerticalSpacingItem]="spacing()"
  ></div>`,
  imports: [VerticalSpacingItemDirective],
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
})
class HostComponent {
  spacing = signal<VerticalSpacingSize>(2);
}

describe("VerticalSpacingItemDirective", () => {
  let fixture: ComponentFixture<HostComponent>;
  let hostEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerticalSpacingItemDirective, HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    hostEl = fixture.debugElement.query(By.css("div")).nativeElement;
  });

  it("should create host component with directive", () => {
    expect(hostEl).toBeTruthy();
  });

  it("should have class tedi-vertical-spacing__item", () => {
    expect(hostEl.classList).toContain("tedi-vertical-spacing__item");
  });

  it("should set the spacing custom property in em", () => {
    expect(hostEl.style.getPropertyValue("--vertical-spacing-internal")).toBe(
      "2em",
    );
  });

  it("should keep inline styles already on the host", () => {
    expect(hostEl.style.maxWidth).toBe("360px");
  });

  it("should update the custom property when the input changes", () => {
    fixture.componentInstance.spacing.set(0.5);
    fixture.detectChanges();

    expect(hostEl.style.getPropertyValue("--vertical-spacing-internal")).toBe(
      "0.5em",
    );
    expect(hostEl.style.maxWidth).toBe("360px");
  });
});
