import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BreakpointObserver } from "@angular/cdk/layout";
import { of } from "rxjs";
import { CardIconComponent, CardIconSize, CardIconType } from "./card-icon.component";
import { CardBackground } from "../card.utils";

@Component({
  standalone: true,
  imports: [CardIconComponent],
  template: `
    <tedi-card-icon [type]="type" [size]="size" [background]="background">
      <span class="projected">Icon</span>
    </tedi-card-icon>
  `,
})
class TestHostComponent {
  type: CardIconType = "default";
  size: CardIconSize = "default";
  background?: CardBackground;
}

describe("CardIconComponent", () => {
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

  const iconElement = (): HTMLElement =>
    fixture.nativeElement.querySelector("tedi-card-icon");

  it("should create with secondary background and default padding", () => {
    expect(iconElement().classList).toContain("tedi-card-icon");
    expect(iconElement().classList).toContain(
      "tedi-card-icon--background--secondary",
    );
    expect(
      iconElement().style.getPropertyValue("--card-content-padding-top"),
    ).toBe("1rem");
    expect(fixture.nativeElement.querySelector(".projected")).toBeTruthy();
  });

  it("should use brand background for brand type", () => {
    host.type = "brand";
    fixture.detectChanges();
    expect(iconElement().classList).toContain(
      "tedi-card-icon--background--brand-primary",
    );
  });

  it("should use smaller padding for small size", () => {
    host.size = "small";
    fixture.detectChanges();
    expect(
      iconElement().style.getPropertyValue("--card-content-padding-top"),
    ).toBe("0.75rem");
  });

  it("should prioritize explicit background over type", () => {
    host.type = "brand";
    host.background = "accent";
    fixture.detectChanges();
    expect(iconElement().classList).toContain(
      "tedi-card-icon--background--accent",
    );
  });

});
