import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BreakpointObserver } from "@angular/cdk/layout";
import { of } from "rxjs";
import { CardButtonComponent } from "./card-button.component";
import { CardComponent } from "../../content/card/card.component";
import { CardContentComponent } from "../../content/card/card-content/card-content.component";
import { CardIconComponent } from "../../content/card/card-icon/card-icon.component";
import { CardRowComponent } from "../../content/card/card-row/card-row.component";

@Component({
  standalone: true,
  imports: [
    CardButtonComponent,
    CardComponent,
    CardContentComponent,
    CardIconComponent,
    CardRowComponent,
  ],
  template: `
    <a tedi-card-button href="#">
      <span class="stray">Should not render</span>
      <tedi-card>
        <tedi-card-content>
          <span class="projected">Töövõime</span>
        </tedi-card-content>
      </tedi-card>
    </a>
    <button tedi-card-button type="button" [disabled]="disabled">
      <tedi-card>
        <tedi-card-row>
          <tedi-card-icon><span class="icon">€</span></tedi-card-icon>
          <tedi-card-content>
            <span class="projected-button">Isiku toetused</span>
          </tedi-card-content>
        </tedi-card-row>
      </tedi-card>
    </button>
  `,
})
class TestHostComponent {
  disabled = false;
}

describe("CardButtonComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        {
          provide: BreakpointObserver,
          useValue: {
            observe: () =>
              of({ matches: true, breakpoints: { "(min-width: 0px)": true } }),
          },
        },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const anchor = (): HTMLAnchorElement =>
    fixture.nativeElement.querySelector("a[tedi-card-button]");
  const button = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector("button[tedi-card-button]");

  it("should wrap a card on an anchor host", () => {
    expect(anchor()).toBeTruthy();
    expect(anchor().classList).toContain("tedi-card-button");
    expect(anchor().querySelector("tedi-card .projected")?.textContent).toBe(
      "Töövõime",
    );
  });

  it("should wrap a card with rows and icon cells on a button host", () => {
    expect(button()).toBeTruthy();
    expect(button().classList).toContain("tedi-card-button");
    expect(
      button().querySelector("tedi-card tedi-card-row tedi-card-icon .icon"),
    ).toBeTruthy();
    expect(button().querySelector(".projected-button")).toBeTruthy();
  });

  it("should project only the tedi-card content", () => {
    expect(anchor().querySelector(".stray")).toBeNull();
    expect(anchor().querySelector("tedi-card")).toBeTruthy();
  });

  it("should support the disabled state on a button host", () => {
    host.disabled = true;
    fixture.detectChanges();
    expect(button().disabled).toBe(true);
  });
});
