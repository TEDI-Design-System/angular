import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ShowAtDirective } from "./show-at.directive";
import { BreakpointService } from "../../services/breakpoint/breakpoint.service";

class BreakpointMock {
  above = signal(true);
  isAboveBreakpoint() {
    return this.above.asReadonly();
  }
  isBelowBreakpoint() {
    return signal(false).asReadonly();
  }
}

@Component({
  standalone: true,
  imports: [ShowAtDirective],
  template: `
    <div class="structural">
      <span *showAt="'sm'">structural</span>
    </div>
    <span class="attribute" showAt="sm">attribute</span>
  `,
})
class HostComponent {}

describe("ShowAtDirective", () => {
  let fixture: ComponentFixture<HostComponent>;
  let breakpoint: BreakpointMock;
  let element: HTMLElement;

  beforeEach(() => {
    breakpoint = new BreakpointMock();
    TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [{ provide: BreakpointService, useValue: breakpoint }],
    });

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    element = fixture.nativeElement;
  });

  describe("structural usage (*showAt)", () => {
    it("renders the content when above the breakpoint", () => {
      expect(element.querySelector(".structural")?.textContent).toContain(
        "structural",
      );
    });

    it("removes the content when below the breakpoint", () => {
      breakpoint.above.set(false);
      fixture.detectChanges();

      expect(element.querySelector(".structural")?.textContent).not.toContain(
        "structural",
      );
    });
  });

  describe("attribute usage (showAt)", () => {
    it("keeps the element in the DOM and visible when above the breakpoint", () => {
      const el = element.querySelector<HTMLElement>(".attribute")!;
      expect(el).toBeTruthy();
      expect(el.style.display).toBe("");
    });

    it("hides the element via display:none when below the breakpoint", () => {
      breakpoint.above.set(false);
      fixture.detectChanges();

      const el = element.querySelector<HTMLElement>(".attribute")!;
      expect(el).toBeTruthy();
      expect(el.style.display).toBe("none");
    });
  });
});
