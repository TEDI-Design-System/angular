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
        Record<string, unknown> | undefined;
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

  it("should use `progressId` on the progress element and the label", () => {
    fixture.componentRef.setInput("label", "Upload");
    fixture.componentRef.setInput("progressId", "my-progress");
    fixture.detectChanges();

    const progress = host.querySelector("progress") as HTMLProgressElement;
    const label = host.querySelector("label") as HTMLLabelElement;
    expect(progress.getAttribute("id")).toBe("my-progress");
    expect(label.getAttribute("for")).toBe("my-progress");
  });

  it("should fall back to a generated id instead of rendering `undefined`", () => {
    fixture.componentRef.setInput("label", "Upload");
    fixture.detectChanges();

    const progress = host.querySelector("progress") as HTMLProgressElement;
    const label = host.querySelector("label") as HTMLLabelElement;
    const id = progress.getAttribute("id");

    expect(id).toMatch(/^tedi-progress-bar-/);
    expect(label.getAttribute("for")).toBe(id);
  });

  it("should fall back to a generated id when `progressId` is empty", () => {
    fixture.componentRef.setInput("label", "Upload");
    fixture.componentRef.setInput("progressId", "");
    fixture.detectChanges();

    const progress = host.querySelector("progress") as HTMLProgressElement;
    const label = host.querySelector("label") as HTMLLabelElement;

    expect(progress.getAttribute("id")).toMatch(/^tedi-progress-bar-/);
    expect(label.getAttribute("for")).toBe(progress.getAttribute("id"));
  });

  it("should keep the label bound to the bar when `labelPosition` is horizontal", () => {
    fixture.componentRef.setInput("label", "Upload");
    fixture.componentRef.setInput("labelPosition", "horizontal");
    fixture.detectChanges();

    const progress = host.querySelector("progress") as HTMLProgressElement;
    const label = host.querySelector("label") as HTMLLabelElement;
    expect(label.getAttribute("for")).toBe(progress.getAttribute("id"));
  });

  describe("value announcements", () => {
    const liveRegion = () => host.querySelector<HTMLElement>("span.sr-only");
    const announced = () => liveRegion()?.textContent?.trim();

    const setInput = (name: string, value: unknown) => {
      fixture.componentRef.setInput(name, value);
      fixture.detectChanges();
    };

    const advance = (ms: number) => {
      jest.advanceTimersByTime(ms);
      fixture.detectChanges();
    };

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should not render a live region while announce is off", () => {
      setInput("value", 50);

      expect(liveRegion()).toBeNull();
    });

    it("should render a polite status region when announce is polite", () => {
      setInput("announce", "polite");

      const region = liveRegion();
      expect(region).toBeTruthy();
      expect(region?.getAttribute("role")).toBe("status");
      expect(region?.getAttribute("aria-live")).toBe("polite");
      expect(region?.getAttribute("aria-atomic")).toBe("true");
    });

    it("should render an alert region when announce is assertive", () => {
      setInput("announce", "assertive");

      expect(liveRegion()?.getAttribute("role")).toBe("alert");
      expect(liveRegion()?.getAttribute("aria-live")).toBe("assertive");
    });

    it("should skip the current value when announcements are enabled", () => {
      setInput("value", 40);
      setInput("announce", "polite");

      expect(announced()).toBe("");

      advance(5000);
      expect(announced()).toBe("");
    });

    it("should skip the initial value when mounted with announcements enabled", () => {
      fixture.destroy();
      fixture = TestBed.createComponent(ProgressBarComponent);
      host = fixture.nativeElement;
      fixture.componentRef.setInput("value", 40);
      fixture.componentRef.setInput("announce", "polite");
      fixture.detectChanges();

      advance(5000);
      expect(announced()).toBe("");
      setInput("value", 50);
      expect(announced()).toBe("50%");
    });

    it("should not publish an unchanged value when the mode changes", () => {
      setInput("value", 40);
      setInput("announce", "polite");
      setInput("announce", "assertive");
      advance(5000);
      expect(announced()).toBe("");
      expect(liveRegion()?.getAttribute("role")).toBe("alert");
      setInput("announce", "polite");
      setInput("value", 50);
      expect(announced()).toBe("50%");
    });

    it("should extend a pending deadline when the interval increases", () => {
      setInput("announce", "polite");
      setInput("value", 10);
      setInput("value", 20);
      advance(500);
      setInput("announceInterval", 10000);
      advance(9499);
      expect(announced()).toBe("10%");
      advance(1);
      expect(announced()).toBe("20%");
    });

    it("should shorten a pending deadline when the interval decreases", () => {
      setInput("announceInterval", 10000);
      setInput("announce", "polite");
      setInput("value", 10);
      setInput("value", 20);
      advance(500);
      setInput("announceInterval", 1000);
      advance(499);
      expect(announced()).toBe("10%");
      advance(1);
      expect(announced()).toBe("20%");
    });

    it("should publish a pending value immediately when the new interval has elapsed", () => {
      setInput("announceInterval", 10000);
      setInput("announce", "polite");
      setInput("value", 10);
      setInput("value", 20);
      advance(2000);
      setInput("announceInterval", 1000);
      expect(announced()).toBe("20%");
    });

    it("should cancel pending updates when announcements are disabled", () => {
      setInput("announce", "polite");
      setInput("value", 10);
      setInput("value", 20);
      setInput("announce", "off");
      setInput("value", 30);
      setInput("announce", "polite");
      advance(5000);
      expect(announced()).toBe("");
      setInput("value", 40);
      expect(announced()).toBe("40%");
    });

    it("should announce the first change right away", () => {
      setInput("announce", "polite");
      setInput("value", 60);

      expect(announced()).toBe("60%");
    });

    it("should announce at most once per interval and settle on the last value", () => {
      setInput("announce", "polite");
      setInput("value", 10);
      expect(announced()).toBe("10%");

      setInput("value", 20);
      setInput("value", 30);
      expect(announced()).toBe("10%");

      advance(1000);
      expect(announced()).toBe("30%");
    });

    it.each([-100, 0])(
      "should disable throttling for an interval of %s",
      (interval) => {
        setInput("announceInterval", interval);
        expect(fixture.componentInstance.announceInterval()).toBe(0);
        setInput("announce", "polite");
        setInput("value", 10);
        expect(announced()).toBe("10%");
        setInput("value", 20);
        expect(announced()).toBe("20%");
      },
    );

    it.each([NaN, Infinity, -Infinity])(
      "should use the default interval for %s",
      (interval) => {
        setInput("announceInterval", interval);
        expect(fixture.componentInstance.announceInterval()).toBe(1000);
        setInput("announce", "polite");
        setInput("value", 10);
        setInput("value", 20);
        advance(999);
        expect(announced()).toBe("10%");
        advance(1);
        expect(announced()).toBe("20%");
      },
    );

    it("should honour a custom announceInterval", () => {
      setInput("announceInterval", 5000);
      setInput("announce", "polite");
      setInput("value", 10);
      expect(announced()).toBe("10%");

      setInput("value", 20);
      advance(1000);
      expect(announced()).toBe("10%");

      advance(4000);
      expect(announced()).toBe("20%");
    });

    it("should announce the custom value label instead of the percentage", () => {
      setInput("announce", "polite");
      setInput("valueLabel", "2 / 5");

      expect(announced()).toBe("2 / 5");
    });

    it("should announce even when the value is visually hidden", () => {
      setInput("showValue", false);
      setInput("announce", "polite");
      setInput("value", 75);

      expect(host.querySelector(".tedi-progress-bar__value")).toBeNull();
      expect(announced()).toBe("75%");
    });

    it("should drop the region and its content when announce returns to off", () => {
      setInput("announce", "polite");
      setInput("value", 80);
      expect(announced()).toBe("80%");

      setInput("announce", "off");
      expect(liveRegion()).toBeNull();

      setInput("announce", "polite");
      expect(announced()).toBe("");
    });

    it("should clear a pending announcement when destroyed", () => {
      setInput("announce", "polite");
      setInput("value", 10);
      setInput("value", 20);

      const pending = jest.getTimerCount();
      fixture.destroy();

      expect(jest.getTimerCount()).toBe(pending - 1);
    });
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
