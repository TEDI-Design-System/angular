import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HeaderContentAlignment, HeaderContentComponent } from "./header-content.component";

describe("HeaderContentComponent", () => {
  let fixture: ComponentFixture<HeaderContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderContentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderContentComponent);
    fixture.detectChanges();
  });

  it("should create the component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should apply the base host class", () => {
    expect(fixture.nativeElement.classList).toContain("tedi-header-content");
  });

  it("should default to the center justify-content utility", () => {
    expect(fixture.nativeElement.classList).toContain("justify-content-center");
  });

  it.each<[HeaderContentAlignment, string]>([
    ["flex-start", "justify-content-start"],
    ["center", "justify-content-center"],
    ["flex-end", "justify-content-end"],
    ["space-between", "justify-content-between"],
    ["space-around", "justify-content-around"],
    ["space-evenly", "justify-content-evenly"],
  ])("applies the %s alignment as the %s utility", (alignment, utility) => {
    fixture.componentRef.setInput("alignment", alignment);
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain(utility);
  });

  it("should swap the utility class when alignment changes", () => {
    fixture.componentRef.setInput("alignment", "space-between");
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain("justify-content-between");
    expect(fixture.nativeElement.classList).not.toContain(
      "justify-content-center",
    );

    fixture.componentRef.setInput("alignment", "flex-start");
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain("justify-content-start");
    expect(fixture.nativeElement.classList).not.toContain(
      "justify-content-between",
    );
  });
});
