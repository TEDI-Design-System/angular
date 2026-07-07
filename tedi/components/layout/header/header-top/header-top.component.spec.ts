import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HeaderTopAlignment, HeaderTopComponent } from "./header-top.component";

describe("HeaderTopComponent", () => {
  let fixture: ComponentFixture<HeaderTopComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderTopComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderTopComponent);
    fixture.detectChanges();
  });

  it("should create the component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should apply the base host class", () => {
    expect(fixture.nativeElement.classList).toContain("tedi-header-top");
  });

  it("should default to the space-between justify-content utility", () => {
    expect(fixture.nativeElement.classList).toContain("justify-content-between");
  });

  it.each<[HeaderTopAlignment, string]>([
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
    fixture.componentRef.setInput("alignment", "center");
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain("justify-content-center");
    expect(fixture.nativeElement.classList).not.toContain(
      "justify-content-between",
    );

    fixture.componentRef.setInput("alignment", "flex-end");
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain("justify-content-end");
    expect(fixture.nativeElement.classList).not.toContain(
      "justify-content-center",
    );
  });
});
