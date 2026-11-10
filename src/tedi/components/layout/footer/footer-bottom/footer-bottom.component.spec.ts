import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FooterBottomComponent } from "./footer-bottom.component";
import {
  Breakpoint,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";

class BreakpointServiceMock {
  readonly _currentBreakpoint = signal<Breakpoint | undefined>("xl");
  readonly isBelowBreakpoint = BreakpointService.prototype.isBelowBreakpoint;
}

@Component({
  standalone: true,
  imports: [FooterBottomComponent],
  template: `
    <tedi-footer-bottom [separator]="separator()">
      @for (item of items(); track item) {
        <a href="#">{{ item }}</a>
      }
    </tedi-footer-bottom>
  `,
})
class TestHostComponent {
  readonly separator = signal(false);
  readonly items = signal(["Facebook", "Instagram", "LinkedIn"]);
}

describe("FooterBottomComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let breakpoint: BreakpointServiceMock;
  let inner: HTMLElement;

  const dots = () => inner.querySelectorAll(".tedi-footer-bottom__dot");
  const flushMutations = () => new Promise((resolve) => setTimeout(resolve));

  beforeEach(async () => {
    breakpoint = new BreakpointServiceMock();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: BreakpointService, useValue: breakpoint }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    inner = fixture.nativeElement.querySelector(".tedi-footer-bottom__inner");
  });

  it("has no dots by default, also on mobile", () => {
    breakpoint._currentBreakpoint.set("xs");
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector("tedi-footer-bottom").classList,
    ).toContain("tedi-footer-bottom--mobile");
    expect(dots()).toHaveLength(0);
  });

  it("puts a decorative dot between items with separator", () => {
    host.separator.set(true);
    fixture.detectChanges();

    const children = Array.from(inner.children);
    expect(children.map((child) => child.tagName)).toEqual([
      "A",
      "SPAN",
      "A",
      "SPAN",
      "A",
    ]);
    dots().forEach((dot) =>
      expect(dot.getAttribute("aria-hidden")).toBe("true"),
    );
  });

  it("removes the dots when separator is turned off", () => {
    host.separator.set(true);
    fixture.detectChanges();
    host.separator.set(false);
    fixture.detectChanges();

    expect(dots()).toHaveLength(0);
  });

  it("keeps the dots in sync when items change", async () => {
    host.separator.set(true);
    fixture.detectChanges();

    host.items.set(["Facebook", "Instagram", "LinkedIn", "YouTube"]);
    fixture.detectChanges();
    await flushMutations();
    expect(dots()).toHaveLength(3);

    host.items.set(["Facebook"]);
    fixture.detectChanges();
    await flushMutations();
    expect(dots()).toHaveLength(0);
  });
});
