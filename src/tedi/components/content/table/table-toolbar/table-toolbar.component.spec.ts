import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { TediTableToolbarComponent } from "./table-toolbar.component";

@Component({
  standalone: true,
  imports: [TediTableToolbarComponent],
  template: `<tedi-table-toolbar
    ><span class="content">Hi</span></tedi-table-toolbar
  >`,
})
class HostComponent {}

describe("TediTableToolbarComponent", () => {
  it("renders projected content", () => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector(".tedi-table-toolbar .content"),
    ).not.toBeNull();
  });
});
