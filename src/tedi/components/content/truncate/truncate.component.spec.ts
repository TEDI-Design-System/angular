import { Component, computed, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { TruncateComponent } from "./truncate.component";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import {
  Breakpoint,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

const LONG_TEXT =
  "This is a long text that needs to be truncated for testing purposes.";

const BREAKPOINT_ORDER: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "xxl"];

class BreakpointServiceStub {
  readonly current = signal<Breakpoint>("xs");

  isAboveBreakpoint(breakpoint: Breakpoint) {
    return computed(
      () =>
        BREAKPOINT_ORDER.indexOf(this.current()) >=
        BREAKPOINT_ORDER.indexOf(breakpoint),
    );
  }

  getBreakpointInputs<TInputs>(inputs: Record<string, unknown>): TInputs {
    let resolved: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(inputs)) {
      if (!BREAKPOINT_ORDER.includes(key as Breakpoint)) {
        resolved[key] = value;
      }
    }

    for (const breakpoint of BREAKPOINT_ORDER.slice(
      0,
      BREAKPOINT_ORDER.indexOf(this.current()) + 1,
    )) {
      const overrides = inputs[breakpoint];

      if (overrides) {
        resolved = { ...resolved, ...(overrides as Record<string, unknown>) };
      }
    }

    return resolved as TInputs;
  }
}

describe("TruncateComponent", () => {
  let fixture: ComponentFixture<TruncateComponent>;
  let component: TruncateComponent;

  const toggle = () =>
    fixture.debugElement.query(By.css(".tedi-truncate__toggle"));
  const textContent = () =>
    fixture.debugElement
      .query(By.css(".tedi-truncate__text"))
      .nativeElement.textContent.trim();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TruncateComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    fixture = TestBed.createComponent(TruncateComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("text", LONG_TEXT);
    fixture.componentRef.setInput("maxLength", 20);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("truncates text longer than maxLength and appends the ellipsis", () => {
    expect(textContent()).toBe("This is a long text...");
  });

  it("renders the full text when it is shorter than maxLength", () => {
    fixture.componentRef.setInput("text", "Short text");
    fixture.detectChanges();

    expect(textContent()).toBe("Short text");
    expect(toggle()).toBeNull();
  });

  it.each([
    ["Hello", 5],
    ["", 0],
  ])("does not truncate %p at its exact limit", (text, maxLength) => {
    fixture.componentRef.setInput("text", text);
    fixture.componentRef.setInput("maxLength", maxLength);
    fixture.detectChanges();
    expect(textContent()).toBe(text);
    expect(toggle()).toBeNull();
  });

  it.each(["😀", "e\u0301", "👩🏽‍💻", "👨‍👩‍👧‍👦"])(
    "keeps the character %s intact",
    (character) => {
      fixture.componentRef.setInput("text", `A${character}B`);
      fixture.componentRef.setInput("maxLength", 2);
      fixture.detectChanges();
      expect(textContent()).toBe(`A${character}...`);
      fixture.componentRef.setInput("maxLength", 3);
      fixture.detectChanges();
      expect(textContent()).toBe(`A${character}B`);
      expect(toggle()).toBeNull();
    },
  );

  it.each([
    [-1, "..."],
    [0, "..."],
    [2.9, "He..."],
    [NaN, "Hello"],
    [Infinity, "Hello"],
    [-Infinity, "Hello"],
  ])("normalizes a maxLength of %s", (limit, expected) => {
    fixture.componentRef.setInput("text", "Hello");
    fixture.componentRef.setInput("maxLength", limit);
    fixture.detectChanges();
    expect(textContent()).toBe(expected);
  });

  it("keeps programmatic expansion when the toggle is disabled", () => {
    fixture.componentRef.setInput("expanded", true);
    fixture.componentRef.setInput("expandable", false);
    fixture.detectChanges();
    expect(toggle()).toBeNull();
    expect(textContent()).toBe(LONG_TEXT);
    fixture.componentRef.setInput("expanded", false);
    fixture.detectChanges();
    expect(textContent()).toBe("This is a long text...");
    expect(
      fixture.nativeElement.querySelector(".tedi-truncate__text").textContent,
    ).toBe("This is a long text...");
  });

  it("renders a custom ellipsis", () => {
    fixture.componentRef.setInput("ellipsis", "***");
    fixture.detectChanges();

    expect(textContent()).toBe("This is a long text***");
  });

  it("expands and collapses on toggle click", () => {
    toggle().nativeElement.click();
    fixture.detectChanges();

    expect(textContent()).toBe(LONG_TEXT);
    expect(component.expanded()).toBe(true);

    toggle().nativeElement.click();
    fixture.detectChanges();

    expect(textContent()).toBe("This is a long text...");
    expect(component.expanded()).toBe(false);
  });

  it("labels the toggle with the matching translation key", () => {
    expect(toggle().nativeElement.textContent.trim()).toBe("truncate.see-more");

    toggle().nativeElement.click();
    fixture.detectChanges();

    expect(toggle().nativeElement.textContent.trim()).toBe("truncate.see-less");
  });

  it("keeps aria-expanded in sync and points aria-controls at the text", () => {
    const textId = fixture.debugElement.query(By.css(".tedi-truncate__text"))
      .nativeElement.id;

    expect(toggle().nativeElement.getAttribute("aria-expanded")).toBe("false");
    expect(toggle().nativeElement.getAttribute("aria-controls")).toBe(textId);

    toggle().nativeElement.click();
    fixture.detectChanges();

    expect(toggle().nativeElement.getAttribute("aria-expanded")).toBe("true");
  });

  it("does not render the toggle when expandable is false", () => {
    fixture.componentRef.setInput("expandable", false);
    fixture.detectChanges();

    expect(toggle()).toBeNull();
    expect(textContent()).toBe("This is a long text...");
  });

  it("reflects the expanded state on the host", () => {
    expect(
      fixture.nativeElement.classList.contains("tedi-truncate--expanded"),
    ).toBe(false);

    fixture.componentRef.setInput("expanded", true);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.classList.contains("tedi-truncate--expanded"),
    ).toBe(true);
    expect(textContent()).toBe(LONG_TEXT);
  });

  it("accepts a breakpoint object for maxLength", () => {
    fixture.componentRef.setInput("maxLength", { xs: 10, md: 30 });
    fixture.detectChanges();

    expect(textContent()).toBe("This is a...");
  });
});

describe("TruncateComponent maxLength breakpoint cascade", () => {
  let fixture: ComponentFixture<TruncateComponent>;
  let breakpointService: BreakpointServiceStub;

  const textContent = () =>
    fixture.debugElement
      .query(By.css(".tedi-truncate__text"))
      .nativeElement.textContent.trim();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TruncateComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        { provide: BreakpointService, useClass: BreakpointServiceStub },
      ],
    });

    fixture = TestBed.createComponent(TruncateComponent);
    breakpointService = TestBed.inject(
      BreakpointService,
    ) as unknown as BreakpointServiceStub;

    fixture.componentRef.setInput("text", LONG_TEXT);
    fixture.componentRef.setInput("maxLength", {
      xs: 5,
      sm: 10,
      md: 15,
      lg: 20,
      xl: 25,
      xxl: 30,
    });
    fixture.detectChanges();
  });

  it.each([
    ["xs", "This..."],
    ["sm", "This is a..."],
    ["md", "This is a long..."],
    ["lg", "This is a long text..."],
    ["xl", "This is a long text that..."],
    ["xxl", "This is a long text that needs..."],
  ] as const)(
    "uses the %s value at that breakpoint",
    (breakpoint, expected) => {
      breakpointService.current.set(breakpoint);
      fixture.detectChanges();

      expect(textContent()).toBe(expected);
    },
  );

  it("normalizes breakpoint values before applying the cascade", () => {
    fixture.componentRef.setInput("maxLength", { xs: -1, md: 4.9, xl: NaN });
    fixture.detectChanges();
    expect(textContent()).toBe("...");
    breakpointService.current.set("md");
    fixture.detectChanges();
    expect(textContent()).toBe("This...");
    breakpointService.current.set("xxl");
    fixture.detectChanges();
    expect(textContent()).toBe(LONG_TEXT);
  });

  it("falls back to the nearest smaller breakpoint that is set", () => {
    fixture.componentRef.setInput("maxLength", { xs: 5, lg: 20 });
    breakpointService.current.set("xl");
    fixture.detectChanges();

    expect(textContent()).toBe("This is a long text...");
  });
});

@Component({
  standalone: true,
  imports: [TruncateComponent],
  template: `<tedi-truncate
    [text]="text"
    [maxLength]="20"
    [(expanded)]="expanded"
  />`,
})
class BindingHost {
  text = LONG_TEXT;
  expanded = signal(false);
}

describe("TruncateComponent two-way binding", () => {
  it("updates the parent on clicks and follows parent changes", () => {
    TestBed.configureTestingModule({
      imports: [BindingHost],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });
    const fixture = TestBed.createComponent(BindingHost);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector("button");
    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.expanded()).toBe(true);
    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.expanded()).toBe(false);
    fixture.componentInstance.expanded.set(true);
    fixture.detectChanges();
    expect(button.getAttribute("aria-expanded")).toBe("true");
    expect(
      fixture.nativeElement.querySelector(".tedi-truncate__text").textContent,
    ).toBe(LONG_TEXT);
  });
});
