import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HideAtDirective } from "./hide-at.directive";
import { BreakpointService } from "../../services/breakpoint/breakpoint.service";

class BreakpointMock {
  below = signal(true);
  isBelowBreakpoint() {
    return this.below.asReadonly();
  }
  isAboveBreakpoint() {
    return signal(false).asReadonly();
  }
}

@Component({
  standalone: true,
  imports: [HideAtDirective],
  template: `
    <div class="structural">
      <span *hideAt="'sm'">structural</span>
    </div>
    <span class="attribute" hideAt="sm">attribute</span>
  `,
})
class HostComponent {}

describe("HideAtDirective", () => {
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

  describe("structural usage (*hideAt)", () => {
    it("renders the content when below the breakpoint", () => {
      expect(element.querySelector(".structural")?.textContent).toContain(
        "structural",
      );
    });

    it("removes the content when above the breakpoint", () => {
      breakpoint.below.set(false);
      fixture.detectChanges();

      expect(element.querySelector(".structural")?.textContent).not.toContain(
        "structural",
      );
    });
  });

  describe("attribute usage (hideAt)", () => {
    it("keeps the element in the DOM and visible when below the breakpoint", () => {
      const el = element.querySelector<HTMLElement>(".attribute")!;
      expect(el).toBeTruthy();
      expect(el.style.display).toBe("");
    });

    it("hides the element via display:none when above the breakpoint", () => {
      breakpoint.below.set(false);
      fixture.detectChanges();

      const el = element.querySelector<HTMLElement>(".attribute")!;
      expect(el).toBeTruthy();
      expect(el.style.display).toBe("none");
    });
  });
});
