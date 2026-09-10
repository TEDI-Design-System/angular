import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OverlayContainer } from "@angular/cdk/overlay";
import { LabelRowComponent } from "./label-row.component";
import { LabelComponent } from "../label/label.component";
import { InfoTooltipComponent } from "../../overlay/info-tooltip/info-tooltip.component";
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
  imports: [LabelRowComponent, LabelComponent, InfoTooltipComponent],
  template: `
    <tedi-label-row>
      <label tedi-label for="city">City</label>
      <tedi-info-tooltip>More information</tedi-info-tooltip>
    </tedi-label-row>
  `,
})
class TestHostComponent {}

describe("LabelRowComponent", () => {
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

  it("should apply the row class", () => {
    const row = element.querySelector("tedi-label-row");
    expect(row?.classList).toContain("tedi-label-row");
  });

  it("should project the label as the first child", () => {
    const row = element.querySelector("tedi-label-row");
    const label = row?.firstElementChild as HTMLElement;

    expect(label?.tagName).toBe("LABEL");
    expect(label.getAttribute("for")).toBe("city");
    expect(label.textContent?.trim()).toBe("City");
  });

  it("should keep the info tooltip a sibling of the label, not a child", () => {
    const row = element.querySelector("tedi-label-row");
    const label = row?.querySelector("label");
    const infoTooltip = row?.querySelector("tedi-info-tooltip");

    expect(infoTooltip).toBeTruthy();
    expect(label?.contains(infoTooltip!)).toBe(false);
  });
});
