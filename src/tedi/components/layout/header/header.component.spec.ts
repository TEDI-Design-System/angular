import { TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { By } from "@angular/platform-browser";
import { HeaderComponent } from "./header.component";

@Component({
  standalone: true,
  imports: [HeaderComponent],
  template: `<header tedi-header></header>`,
})
class HostComponent {}

describe("HeaderComponent", () => {
  it("should apply the base class", () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.directive(HeaderComponent))
      .nativeElement as HTMLElement;

    expect(header.classList).toContain("tedi-header");
  });

  it("should hide the header when printing", () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.directive(HeaderComponent))
      .nativeElement as HTMLElement;

    expect(header.classList).toContain("no-print");
  });
});
