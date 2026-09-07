import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BreakpointObserver } from "@angular/cdk/layout";
import { of } from "rxjs";
import { CardComponent } from "../card.component";
import { CardHeaderComponent } from "./card-header.component";
import { CardBackground, CardPadding } from "../card.utils";

@Component({
  standalone: true,
  imports: [CardComponent, CardHeaderComponent],
  template: `
    <tedi-card [background]="cardBackground" [padding]="cardPadding">
      <tedi-card-header [background]="background" [padding]="padding">
        <span class="projected">Header</span>
      </tedi-card-header>
    </tedi-card>
  `,
})
class TestHostComponent {
  cardBackground?: CardBackground;
  cardPadding?: CardPadding;
  background?: CardBackground;
  padding?: CardPadding;
}

describe("CardHeaderComponent", () => {
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

  const headerElement = (): HTMLElement =>
    fixture.nativeElement.querySelector("tedi-card-header");

  it("should create with brand-primary background by default", () => {
    expect(headerElement().classList).toContain("tedi-card-header");
    expect(headerElement().classList).toContain(
      "tedi-card-header--background--brand-primary",
    );
    expect(fixture.nativeElement.querySelector(".projected")).toBeTruthy();
  });

  it("should override default background with own input", () => {
    host.background = "secondary";
    fixture.detectChanges();
    expect(headerElement().classList).toContain(
      "tedi-card-header--background--secondary",
    );
    expect(headerElement().classList).not.toContain(
      "tedi-card-header--background--brand-primary",
    );
  });

  it("should not inherit background from card", () => {
    host.cardBackground = "accent";
    fixture.detectChanges();
    expect(headerElement().classList).toContain(
      "tedi-card-header--background--brand-primary",
    );
  });

  it("should inherit padding from card", () => {
    host.cardPadding = 0.75;
    fixture.detectChanges();
    expect(
      headerElement().style.getPropertyValue("--card-content-padding-top"),
    ).toBe("0.75rem");
  });

  it("should have default padding of 1rem", () => {
    expect(
      headerElement().style.getPropertyValue("--card-content-padding-top"),
    ).toBe("1rem");
  });
});
