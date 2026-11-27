import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FooterListComponent } from "./footer-list.component";
import { FooterListItemDirective } from "./footer-list-item.directive";

@Component({
  standalone: true,
  imports: [FooterListComponent, FooterListItemDirective],
  template: `
    <tedi-footer-list
      [separator]="separator()"
      [navigationLabel]="navigationLabel()"
      [ariaLabel]="ariaLabel()"
    >
      @for (item of items(); track item) {
        <li tedi-footer-list-item>
          <a href="#">{{ item }}</a>
        </li>
      }
    </tedi-footer-list>
  `,
})
class TestHostComponent {
  readonly separator = signal(false);
  readonly navigationLabel = signal<string | undefined>(undefined);
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly items = signal(["A", "B", "C"]);
}

describe("FooterListComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let el: HTMLElement;

  const list = () => el.querySelector("ul") as HTMLElement;
  const followed = () =>
    Array.from(
      el.querySelectorAll(".tedi-footer-list__item--followed"),
      (item) => item.textContent?.trim(),
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    el = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("renders a list with one item per projected li", () => {
    expect(list().getAttribute("role")).toBe("list");
    expect(list().querySelectorAll(":scope > li")).toHaveLength(3);
    expect(el.querySelector("nav")).toBeNull();
  });

  it("names the list with ariaLabel", () => {
    host.ariaLabel.set("Links");
    fixture.detectChanges();

    expect(list().getAttribute("aria-label")).toBe("Links");
  });

  it("wraps the list in a labelled nav when navigationLabel is set and unwraps it again", () => {
    host.navigationLabel.set("Legal");
    fixture.detectChanges();

    const nav = el.querySelector("nav") as HTMLElement;
    expect(nav.getAttribute("aria-label")).toBe("Legal");
    expect(nav.querySelectorAll("ul > li")).toHaveLength(3);

    host.navigationLabel.set(undefined);
    fixture.detectChanges();

    expect(el.querySelector("nav")).toBeNull();
    expect(list().querySelectorAll(":scope > li")).toHaveLength(3);
  });

  it("marks the separator variant without adding non-item children", () => {
    host.separator.set(true);
    fixture.detectChanges();

    expect(list().classList).toContain("tedi-footer-list--separator");
    expect(list().children).toHaveLength(3);
  });

  describe("separator dots", () => {
    let firstRowEndsAfter: number;
    let rect: jest.SpyInstance;

    beforeEach(() => {
      firstRowEndsAfter = 2;
      rect = jest
        .spyOn(HTMLElement.prototype, "getBoundingClientRect")
        .mockImplementation(function (this: HTMLElement) {
          const index = Array.from(this.parentElement?.children ?? []).indexOf(
            this,
          );
          const top = index < firstRowEndsAfter ? 0 : 24;
          return { top, height: 16 } as DOMRect;
        });
    });

    afterEach(() => rect.mockRestore());

    it("shows a dot only after items followed by another item on the same row", () => {
      host.separator.set(true);
      fixture.detectChanges();

      expect(followed()).toEqual(["A"]);
    });

    it("updates when the items change", () => {
      host.separator.set(true);
      fixture.detectChanges();

      host.items.set(["A", "B", "C", "D"]);
      firstRowEndsAfter = 3;
      fixture.detectChanges();

      expect(followed()).toEqual(["A", "B"]);
    });

    it("shows no dots when separator is off", () => {
      expect(followed()).toEqual([]);
    });
  });
});
