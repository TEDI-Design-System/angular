import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OverlayContainer } from "@angular/cdk/overlay";
import { InfoTooltipComponent } from "./info-tooltip.component";
import { TediTranslationService } from "../../../services";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

@Component({
  standalone: true,
  imports: [InfoTooltipComponent],
  template: `
    <tedi-info-tooltip [ariaLabel]="ariaLabel"
      >Tooltip content</tedi-info-tooltip
    >
  `,
})
class TestHostComponent {
  ariaLabel?: string;
}

describe("InfoTooltipComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let element: HTMLElement;
  let overlayContainer: OverlayContainer;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    element = fixture.nativeElement;
    overlayContainer = TestBed.inject(OverlayContainer);
    fixture.detectChanges();
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  it("should create and apply the host class", () => {
    const el = element.querySelector("tedi-info-tooltip");
    expect(el).toBeTruthy();
    expect(el?.classList).toContain("tedi-info-tooltip");
  });

  it("should render an info button as the trigger", () => {
    expect(element.querySelector("button.tedi-info-button")).toBeTruthy();
  });

  it("should use the default translated info-button label", () => {
    const button = element.querySelector("button.tedi-info-button");
    expect(button?.getAttribute("aria-label")).toBe("info-button.label");
  });

  it("should apply a custom info-button aria-label", () => {
    fixture.componentInstance.ariaLabel = "More information";
    fixture.detectChanges();

    const button = element.querySelector("button.tedi-info-button");
    expect(button?.getAttribute("aria-label")).toBe("More information");
  });

  it("should project the content through to the tooltip overlay", () => {
    const trigger = element.querySelector("tedi-tooltip-trigger")!;
    trigger.dispatchEvent(new MouseEvent("mouseenter"));
    fixture.detectChanges();

    const overlayText =
      overlayContainer.getContainerElement().textContent ?? "";
    expect(overlayText).toContain("Tooltip content");
  });
});
