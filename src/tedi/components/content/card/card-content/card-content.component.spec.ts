import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BreakpointObserver } from "@angular/cdk/layout";
import { of } from "rxjs";
import { CardComponent } from "../card.component";
import { CardContentComponent } from "./card-content.component";
import { CardBackground, CardPadding } from "../card.utils";

@Component({
  standalone: true,
  imports: [CardContentComponent],
  template: `
    <tedi-card-content
      [background]="background"
      [padding]="padding"
      [backgroundImage]="backgroundImage"
      [backgroundPosition]="backgroundPosition"
      [backgroundSize]="backgroundSize"
      [backgroundRepeat]="backgroundRepeat"
    >
      <span class="projected">Content</span>
    </tedi-card-content>
  `,
})
class TestHostComponent {
  background?: CardBackground;
  padding?: CardPadding;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
}

@Component({
  standalone: true,
  imports: [CardComponent, CardContentComponent],
  template: `
    <tedi-card [background]="cardBackground" [padding]="cardPadding">
      <tedi-card-content [background]="background" [padding]="padding">
        Content
      </tedi-card-content>
    </tedi-card>
  `,
})
class TestCardHostComponent {
  cardBackground?: CardBackground;
  cardPadding?: CardPadding;
  background?: CardBackground;
  padding?: CardPadding;
}

const breakpointObserverMock = {
  provide: BreakpointObserver,
  useValue: {
    observe: () =>
      of({ matches: true, breakpoints: { "(min-width: 0px)": true } }),
  },
};

describe("CardContentComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [breakpointObserverMock],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const contentElement = (): HTMLElement =>
    fixture.nativeElement.querySelector("tedi-card-content");

  it("should create with default classes and padding", () => {
    expect(contentElement().classList).toContain("tedi-card-content");
    expect(contentElement().classList).toContain(
      "tedi-card-content--background--primary",
    );
    expect(
      contentElement().style.getPropertyValue("--card-content-padding-top"),
    ).toBe("1rem");
    expect(fixture.nativeElement.querySelector(".projected")).toBeTruthy();
  });

  it("should apply number padding to all sides", () => {
    host.padding = 1.5;
    fixture.detectChanges();
    const style = contentElement().style;
    expect(style.getPropertyValue("--card-content-padding-top")).toBe("1.5rem");
    expect(style.getPropertyValue("--card-content-padding-right")).toBe(
      "1.5rem",
    );
    expect(style.getPropertyValue("--card-content-padding-bottom")).toBe(
      "1.5rem",
    );
    expect(style.getPropertyValue("--card-content-padding-left")).toBe(
      "1.5rem",
    );
  });

  it("should apply vertical and horizontal padding", () => {
    host.padding = { vertical: 0.5, horizontal: 2 };
    fixture.detectChanges();
    const style = contentElement().style;
    expect(style.getPropertyValue("--card-content-padding-top")).toBe("0.5rem");
    expect(style.getPropertyValue("--card-content-padding-bottom")).toBe(
      "0.5rem",
    );
    expect(style.getPropertyValue("--card-content-padding-left")).toBe("2rem");
    expect(style.getPropertyValue("--card-content-padding-right")).toBe("2rem");
  });

  it("should apply per-side padding and default missing sides to 0", () => {
    host.padding = { top: 1, left: 0.75 };
    fixture.detectChanges();
    const style = contentElement().style;
    expect(style.getPropertyValue("--card-content-padding-top")).toBe("1rem");
    expect(style.getPropertyValue("--card-content-padding-left")).toBe(
      "0.75rem",
    );
    expect(style.getPropertyValue("--card-content-padding-right")).toBe("0rem");
    expect(style.getPropertyValue("--card-content-padding-bottom")).toBe(
      "0rem",
    );
  });

  it("should apply background modifier class", () => {
    host.background = "danger-secondary";
    fixture.detectChanges();
    expect(contentElement().classList).toContain(
      "tedi-card-content--background--danger-secondary",
    );
  });

  it("should apply background image styles", () => {
    host.backgroundImage = "image.png";
    host.backgroundPosition = "center";
    host.backgroundSize = "cover";
    host.backgroundRepeat = "no-repeat";
    fixture.detectChanges();
    const style = contentElement().style;
    expect(style.backgroundImage).toBe("url(image.png)");
    expect(style.backgroundPosition).toBe("center");
    expect(style.backgroundSize).toBe("cover");
    expect(style.backgroundRepeat).toBe("no-repeat");
  });
});

describe("CardContentComponent inside CardComponent", () => {
  let fixture: ComponentFixture<TestCardHostComponent>;
  let host: TestCardHostComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestCardHostComponent],
      providers: [breakpointObserverMock],
    });

    fixture = TestBed.createComponent(TestCardHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  const contentElement = (): HTMLElement =>
    fixture.nativeElement.querySelector("tedi-card-content");

  it("should inherit background and padding from card", () => {
    host.cardBackground = "accent";
    host.cardPadding = 0.5;
    fixture.detectChanges();
    expect(contentElement().classList).toContain(
      "tedi-card-content--background--accent",
    );
    expect(
      contentElement().style.getPropertyValue("--card-content-padding-top"),
    ).toBe("0.5rem");
  });

  it("should prioritize own inputs over card defaults", () => {
    host.cardBackground = "accent";
    host.cardPadding = 0.5;
    host.background = "secondary";
    host.padding = 2;
    fixture.detectChanges();
    expect(contentElement().classList).toContain(
      "tedi-card-content--background--secondary",
    );
    expect(
      contentElement().style.getPropertyValue("--card-content-padding-top"),
    ).toBe("2rem");
  });
});
