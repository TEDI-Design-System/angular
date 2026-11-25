import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  VerticalSpacingDirective,
  VerticalSpacingSize,
} from "./vertical-spacing.directive";
import { Component, NO_ERRORS_SCHEMA, signal } from "@angular/core";
import { By } from "@angular/platform-browser";

@Component({
  template: `
    <div
      id="container"
      style="max-width: 360px"
      [tediVerticalSpacing]="spacing()"
    >
      <p>Item 2</p>
      <p>Item 2</p>
      <p>Item 3</p>
      <p>Item 4</p>
    </div>
  `,
  imports: [VerticalSpacingDirective],
  standalone: true,
  schemas: [NO_ERRORS_SCHEMA],
})
class HostComponent {
  spacing = signal<VerticalSpacingSize>(2);
}

describe("VerticalSpacingDirective", () => {
  let fixture: ComponentFixture<HostComponent>;
  let hostEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerticalSpacingDirective, HostComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    hostEl = fixture.debugElement.query(By.css("#container")).nativeElement;
  });

  it("should create host component with directive", () => {
    expect(hostEl).toBeTruthy();
  });

  it("should have class tedi-vertical-spacing", () => {
    expect(hostEl.classList).toContain("tedi-vertical-spacing");
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
