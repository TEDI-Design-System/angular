import { signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { InfoButtonComponent } from "./info-button.component";
import { TediTranslationService } from "@tedi-design-system/angular/tedi";

describe("InfoButtonComponent", () => {
  const DEFAULT_LABEL = "More information";
  let fixture: ComponentFixture<InfoButtonComponent>;

  const translationTrackSpy = jest.fn().mockReturnValue(signal(DEFAULT_LABEL));
  const translationService = {
    track: translationTrackSpy,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [InfoButtonComponent],
      providers: [
        { provide: TediTranslationService, useValue: translationService },
      ],
    });

    fixture = TestBed.createComponent(InfoButtonComponent);
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render base class and set default aria-label", () => {
    expect(fixture.nativeElement.classList).toContain("tedi-info-button");
    expect(translationTrackSpy).toHaveBeenCalledWith("info-button.label");
    expect(fixture.nativeElement.getAttribute("aria-label")).toBe(
      DEFAULT_LABEL,
    );
  });

  it("should set custom aria-label when provided", () => {
    fixture.componentRef.setInput("aria-label", "Override");
    fixture.detectChanges();
    expect(fixture.nativeElement.getAttribute("aria-label")).toBe("Override");
  });
});
