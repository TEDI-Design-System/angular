import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProgressBarComponent } from "./progress-bar.component";
import { FeedbackTextComponent } from "../../form/feedback-text/feedback-text.component";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

describe("ProgressBarComponent", () => {
  let fixture: ComponentFixture<ProgressBarComponent>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBarComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it("should render the progressbar with default classes", () => {
    expect(host.classList).toContain("tedi-progress-bar");
    expect(host.classList).toContain("tedi-progress-bar--horizontal");
    expect(host.classList).not.toContain("tedi-progress-bar--small");
  });

  it("should render the value on the progress element", () => {
    fixture.componentRef.setInput("value", 42);
    fixture.detectChanges();

    const progress = host.querySelector("progress") as HTMLProgressElement;
    expect(progress.value).toBe(42);
    expect(progress.max).toBe(100);
  });

  it("should clamp out-of-range values", () => {
    fixture.componentRef.setInput("value", -10);
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(0);

    fixture.componentRef.setInput("value", 250);
    fixture.detectChanges();
    expect(fixture.componentInstance.value()).toBe(100);
  });

  it("should apply small modifier", () => {
    fixture.componentRef.setInput("small", true);
    fixture.detectChanges();

    expect(host.classList).toContain("tedi-progress-bar--small");
  });

  it("should render the percentage by default", () => {
    fixture.componentRef.setInput("value", 75);
    fixture.detectChanges();

    expect(host.textContent).toContain("75%");
  });

  it("should render a custom value label when provided", () => {
    fixture.componentRef.setInput("value", 20);
    fixture.componentRef.setInput("valueLabel", "1/5");
    fixture.detectChanges();

    const value = host.querySelector(".tedi-progress-bar__value");
    expect(value?.textContent).toContain("1/5");
    expect(value?.textContent).not.toContain("20%");
  });

  it("should hide the percentage when showValue=false", () => {
    fixture.componentRef.setInput("value", 75);
    fixture.componentRef.setInput("showValue", false);
    fixture.detectChanges();

    expect(host.textContent).not.toContain("75%");
  });

  it("should render value on the bottom row when valuePosition='bottom'", () => {
    fixture.componentRef.setInput("value", 30);
    fixture.componentRef.setInput("valuePosition", "bottom");
    fixture.detectChanges();

    expect(host.classList).toContain("tedi-progress-bar--value-bottom");
    expect(
      host.querySelector(".tedi-progress-bar__value--bottom")?.textContent,
    ).toContain("30%");
  });

  it("should render the label above the bar by default", () => {
    fixture.componentRef.setInput("label", "Upload");
    fixture.detectChanges();

    const label = host.querySelector(".tedi-progress-bar__label");
    expect(label).toBeTruthy();
    expect(label?.textContent).toContain("Upload");
    expect(host.classList).not.toContain("tedi-progress-bar--label-horizontal");
  });

  it("should render the label horizontally with modifier", () => {
    fixture.componentRef.setInput("label", "Upload");
    fixture.componentRef.setInput("labelPosition", "horizontal");
    fixture.detectChanges();

    expect(host.classList).toContain("tedi-progress-bar--label-horizontal");
  });

  it("should render the required asterisk via tedi-label", () => {
    fixture.componentRef.setInput("label", "Upload");
    fixture.componentRef.setInput("required", true);
    fixture.detectChanges();

    expect(host.querySelector(".tedi-label--required")).toBeTruthy();
  });

  it("should not render the hint-row when no feedback is projected and no bottom value", () => {
    expect(host.querySelector(".tedi-progress-bar__hint-row")).toBeNull();
  });

  it("should render the hint-row when bottom value is enabled", () => {
    fixture.componentRef.setInput("valuePosition", "bottom");
    fixture.detectChanges();

    expect(host.querySelector(".tedi-progress-bar__hint-row")).toBeTruthy();
  });

  it("should set aria-label from `ariaLabel` then fall back to `label`", () => {
    fixture.componentRef.setInput("label", "Fallback");
    fixture.detectChanges();
    let progress = host.querySelector("progress") as HTMLProgressElement;
    expect(progress.getAttribute("aria-label")).toBe("Fallback");

    fixture.componentRef.setInput("ariaLabel", "Override");
    fixture.detectChanges();
    progress = host.querySelector("progress") as HTMLProgressElement;
    expect(progress.getAttribute("aria-label")).toBe("Override");
  });
});

describe("ProgressBarComponent — content projection", () => {
  @Component({
    standalone: true,
    imports: [ProgressBarComponent, FeedbackTextComponent],
    template: `
      <tedi-progress-bar [value]="50">
        <tedi-feedback-text text="Uploading" type="hint" />
      </tedi-progress-bar>
    `,
  })
  class HostComponent {}

  it("should project a feedback-text into the hint-row and show it", async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const hintRow = host.querySelector(".tedi-progress-bar__hint-row");
    expect(hintRow).toBeTruthy();
    expect(hintRow?.classList).not.toContain(
      "tedi-progress-bar__hint-row--empty",
    );

    const feedback = hintRow?.querySelector("tedi-feedback-text");
    expect(feedback).toBeTruthy();
    expect(feedback?.textContent).toContain("Uploading");
  });
});
