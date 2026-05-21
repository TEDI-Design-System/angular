import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { TediTableHeaderButtonComponent } from "./table-header-button.component";

@Component({
  standalone: true,
  imports: [TediTableHeaderButtonComponent],
  template: `
    <button
      tedi-table-header-button
      [icon]="icon()"
      [filled]="filled()"
      [selected]="selected()"
      [aria-label]="ariaLabel()"
    ></button>
  `,
})
class HostComponent {
  readonly icon = signal("unfold_more");
  readonly filled = signal(false);
  readonly selected = signal(false);
  readonly ariaLabel = signal("Sort by name");
}

describe("TediTableHeaderButtonComponent", () => {
  function setup() {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it("renders the icon-only button with the given aria-label", () => {
    const fixture = setup();
    const button = fixture.nativeElement.querySelector(
      "button[tedi-table-header-button]",
    );
    expect(button.getAttribute("aria-label")).toBe("Sort by name");
    expect(button.querySelector("tedi-icon")).not.toBeNull();
  });

  it("applies the selected modifier when selected is true", () => {
    const fixture = setup();
    fixture.componentInstance.selected.set(true);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      "button[tedi-table-header-button]",
    );
    expect(button.className).toContain("tedi-table-header-button--selected");
  });

  it("renders the filled icon variant when filled=true", () => {
    const fixture = setup();
    fixture.componentInstance.filled.set(true);
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector("tedi-icon");
    expect(icon.className).toContain("tedi-icon--filled");
  });
});
