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

  it("should default to the center alignment modifier", () => {
    expect(fixture.nativeElement.classList).toContain(
      "tedi-header-content--center",
    );
  });

  it.each<HeaderContentAlignment>(["flex-start", "center", "space-between"])(
    "should apply the %s alignment modifier when set",
    (alignment) => {
      fixture.componentRef.setInput("alignment", alignment);
      fixture.detectChanges();

      expect(fixture.nativeElement.classList).toContain(
        `tedi-header-content--${alignment}`,
      );
    },
  );

  it("should swap the modifier class when alignment changes", () => {
    fixture.componentRef.setInput("alignment", "space-between");
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain(
      "tedi-header-content--space-between",
    );
    expect(fixture.nativeElement.classList).not.toContain(
      "tedi-header-content--center",
    );

    fixture.componentRef.setInput("alignment", "flex-start");
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain(
      "tedi-header-content--flex-start",
    );
    expect(fixture.nativeElement.classList).not.toContain(
      "tedi-header-content--space-between",
    );
  });
});
