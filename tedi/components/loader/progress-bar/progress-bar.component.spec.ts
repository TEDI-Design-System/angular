import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProgressBarComponent } from "./progress-bar.component";
import { FeedbackTextComponent } from "../../form/feedback-text/feedback-text.component";
import {
  Breakpoint,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
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

const BREAKPOINT_ORDER: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "xxl"];

class BreakpointMock {
  current = signal<Breakpoint | undefined>(undefined);
  isBelowBreakpoint(_: Breakpoint) {
    return signal(false).asReadonly();
  }
  isAboveBreakpoint(_: Breakpoint) {
    return signal(false).asReadonly();
  }
  currentBreakpoint() {
    return this.current.asReadonly();
  }
  getBreakpointInputs<T>(inputs: Record<string, unknown>): T {
    let resolved: Record<string, unknown> = {};
    Object.keys(inputs).forEach((key) => {
      if (!BREAKPOINT_ORDER.includes(key as Breakpoint)) {
        resolved[key] = inputs[key];
      }
    });

    const current = this.current();
    if (!current) {
      return resolved as T;
    }

    for (let i = 0; i <= BREAKPOINT_ORDER.indexOf(current); i++) {
      const override = inputs[BREAKPOINT_ORDER[i]] as
        | Record<string, unknown>
        | undefined;
      if (override) {
        resolved = { ...resolved, ...override };
      }
    }

    return resolved as T;
  }
}

describe("ProgressBarComponent", () => {
  let fixture: ComponentFixture<ProgressBarComponent>;
  let host: HTMLElement;
  let breakpoint: BreakpointMock;

  beforeEach(async () => {
    breakpoint = new BreakpointMock();

    await TestBed.configureTestingModule({
      imports: [ProgressBarComponent],
      providers: [
        { provide: BreakpointService, useValue: breakpoint },
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

  it("should apply small modifier when size='small'", () => {
    fixture.componentRef.setInput("size", "small");
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

  it("should expose the custom value label via aria-valuetext", () => {
    const progress = host.querySelector("progress") as HTMLProgressElement;
    expect(progress.getAttribute("aria-valuetext")).toBeNull();

    fixture.componentRef.setInput("valueLabel", "1/5");
    fixture.detectChanges();

    expect(progress.getAttribute("aria-valuetext")).toBe("1/5");
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

  it("should leave the hint-row empty when no feedback is projected and no bottom value", () => {
    const hintRow = host.querySelector(".tedi-progress-bar__hint-row");
    expect(hintRow).toBeTruthy();
    expect(hintRow?.childElementCount).toBe(0);
  });

  it("should render the value on the hint-row when bottom value is enabled", () => {
    fixture.componentRef.setInput("valuePosition", "bottom");
    fixture.detectChanges();

    const hintRow = host.querySelector(".tedi-progress-bar__hint-row");
    expect(hintRow?.childElementCount).toBe(1);
    expect(
      hintRow?.querySelector(".tedi-progress-bar__value--bottom"),
    ).toBeTruthy();
  });

  it("should apply breakpoint overrides at the active breakpoint and up", () => {
    fixture.componentRef.setInput("label", "Upload");
    fixture.componentRef.setInput("labelPosition", "top");
    fixture.componentRef.setInput("valuePosition", "bottom");
    fixture.componentRef.setInput("md", {
      labelPosition: "horizontal",
      valuePosition: "horizontal",
    });

    breakpoint.current.set("sm");
    fixture.detectChanges();
    expect(host.classList).not.toContain("tedi-progress-bar--label-horizontal");
    expect(host.classList).toContain("tedi-progress-bar--value-bottom");

    breakpoint.current.set("md");
    fixture.detectChanges();
    expect(host.classList).toContain("tedi-progress-bar--label-horizontal");
    expect(host.classList).not.toContain("tedi-progress-bar--value-bottom");

    breakpoint.current.set("lg");
    fixture.detectChanges();
    expect(host.classList).toContain("tedi-progress-bar--label-horizontal");
    expect(host.classList).not.toContain("tedi-progress-bar--value-bottom");
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
        { provide: BreakpointService, useClass: BreakpointMock },
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;
    const hintRow = host.querySelector(".tedi-progress-bar__hint-row");
    expect(hintRow).toBeTruthy();
    expect(hintRow?.childElementCount).toBe(1);

    const feedback = hintRow?.querySelector(".tedi-feedback-text");
    expect(feedback).toBeTruthy();
    expect(feedback?.textContent).toContain("Uploading");
  });
});
