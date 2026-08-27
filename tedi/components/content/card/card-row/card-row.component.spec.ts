import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BreakpointObserver } from "@angular/cdk/layout";
import { of } from "rxjs";
import { CardComponent } from "../card.component";
import { CardContentComponent } from "../card-content/card-content.component";
import { CardRowComponent, CardRowDirection } from "./card-row.component";

@Component({
  standalone: true,
  imports: [CardComponent, CardContentComponent, CardRowComponent],
  template: `
    <tedi-card>
      <tedi-card-row [direction]="direction">
        <tedi-card-content [autoWidth]="true">Left</tedi-card-content>
        <tedi-card-content>Right</tedi-card-content>
      </tedi-card-row>
      <tedi-card-row>
        <tedi-card-content>Cell</tedi-card-content>
      </tedi-card-row>
    </tedi-card>
  `,
})
class TestHostComponent {
  direction: CardRowDirection = "row";
}

describe("CardRowComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;

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
    fixture.detectChanges();
  });

  const rowElement = (): HTMLElement =>
    fixture.nativeElement.querySelector("tedi-card-row");

  it("should create with row class and project content blocks", () => {
    expect(rowElement().classList).toContain("tedi-card-row");
    expect(rowElement().querySelectorAll("tedi-card-content")).toHaveLength(2);
  });

  it("should apply auto-width class on content blocks", () => {
    const content = rowElement().querySelector("tedi-card-content");
    expect(content?.classList).toContain("tedi-card-content--auto-width");
  });

  it("should apply column modifier when direction is column", () => {
    expect(rowElement().classList).not.toContain("tedi-card-row--column");

    fixture.componentInstance.direction = "column";
    fixture.detectChanges();

    expect(rowElement().classList).toContain("tedi-card-row--column");
  });
});
