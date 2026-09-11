import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component } from "@angular/core";
import { ScrollFadeComponent } from "./scroll-fade.component";
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
  imports: [ScrollFadeComponent],
  template: `
    <tedi-scroll-fade
      [fadeSize]="fadeSize"
      [fadePosition]="fadePosition"
      [scrollBar]="scrollBar"
      [ariaLabel]="ariaLabel"
      (scrolledToTop)="onScrolledToTop()"
      (scrolledToBottom)="onScrolledToBottom()"
    >
      <div [style.height.px]="contentHeight">Content</div>
    </tedi-scroll-fade>
  `,
})
class TestHostComponent {
  fadeSize: 0 | 10 | 20 = 20;
  fadePosition: "top" | "bottom" | "both" = "both";
  scrollBar: "default" | "custom" = "custom";
  ariaLabel: string | undefined = undefined;
  contentHeight = 100;
  onScrolledToTop = jest.fn();
  onScrolledToBottom = jest.fn();
}

describe("ScrollFadeComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let scrollFadeEl: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    scrollFadeEl = fixture.nativeElement.querySelector("tedi-scroll-fade");
  });

  it("should render with default classes", () => {
    expect(scrollFadeEl.classList.contains("tedi-scroll-fade")).toBe(true);
  });

  it("should render children content", () => {
    expect(scrollFadeEl.textContent).toContain("Content");
  });

  it("should have inner wrapper element", () => {
    const inner = scrollFadeEl.querySelector(".tedi-scroll-fade__inner");
    expect(inner).toBeTruthy();
  });

  it("should make the scrollable region keyboard focusable", () => {
    const inner = scrollFadeEl.querySelector<HTMLElement>(
      ".tedi-scroll-fade__inner",
    );
    expect(inner?.getAttribute("tabindex")).toBe("0");
  });

  it("should expose the scrollable region with a role and default label", () => {
    const inner = scrollFadeEl.querySelector<HTMLElement>(
      ".tedi-scroll-fade__inner",
    );
    expect(inner?.getAttribute("role")).toBe("group");
    expect(inner?.getAttribute("aria-label")).toBe("scroll-fade.label");
  });

  it("should use a custom aria-label when provided", () => {
    host.ariaLabel = "Kuupäevad";
    fixture.detectChanges();
    const inner = scrollFadeEl.querySelector<HTMLElement>(
      ".tedi-scroll-fade__inner",
    );
    expect(inner?.getAttribute("aria-label")).toBe("Kuupäevad");
  });

  it("should apply custom scrollbar class by default", () => {
    const inner = scrollFadeEl.querySelector(".tedi-scroll-fade__inner");
    expect(
      inner?.classList.contains("tedi-scroll-fade__inner--custom-scroll"),
    ).toBe(true);
  });

  it("should not apply custom scrollbar class when scrollBar is default", () => {
    host.scrollBar = "default";
    fixture.detectChanges();
    const inner = scrollFadeEl.querySelector(".tedi-scroll-fade__inner");
    expect(
      inner?.classList.contains("tedi-scroll-fade__inner--custom-scroll"),
    ).toBe(false);
  });

  it("should not show fade when content does not overflow", () => {
    expect(scrollFadeEl.classList.contains("tedi-scroll-fade--top-20")).toBe(
      false,
    );
    expect(scrollFadeEl.classList.contains("tedi-scroll-fade--bottom-20")).toBe(
      false,
    );
  });

  it("should respect fadePosition top — never adds bottom fade class", () => {
    host.fadePosition = "top";
    fixture.detectChanges();
    expect(scrollFadeEl.classList.contains("tedi-scroll-fade--bottom-20")).toBe(
      false,
    );
  });

  it("should respect fadePosition bottom — never adds top fade class", () => {
    host.fadePosition = "bottom";
    fixture.detectChanges();
    expect(scrollFadeEl.classList.contains("tedi-scroll-fade--top-20")).toBe(
      false,
    );
  });

  it("should use fadeSize 10 in class names", () => {
    host.fadeSize = 10;
    fixture.detectChanges();
    expect(scrollFadeEl.classList.contains("tedi-scroll-fade--top-10")).toBe(
      false,
    );
    expect(scrollFadeEl.classList.contains("tedi-scroll-fade--bottom-10")).toBe(
      false,
    );
  });

  it("should use fadeSize 0 in class names", () => {
    host.fadeSize = 0;
    fixture.detectChanges();
    expect(scrollFadeEl.classList.contains("tedi-scroll-fade--top-0")).toBe(
      false,
    );
    expect(scrollFadeEl.classList.contains("tedi-scroll-fade--bottom-0")).toBe(
      false,
    );
  });

  describe("with overflowing content", () => {
    let innerEl: HTMLElement;

    beforeEach(() => {
      innerEl = scrollFadeEl.querySelector(".tedi-scroll-fade__inner")!;

      Object.defineProperty(innerEl, "scrollHeight", {
        value: 500,
        configurable: true,
      });
      Object.defineProperty(innerEl, "clientHeight", {
        value: 200,
        configurable: true,
      });
      Object.defineProperty(innerEl, "scrollTop", {
        value: 0,
        writable: true,
        configurable: true,
      });
    });

    it("should show bottom fade when content overflows and scrolled to top", () => {
      innerEl.dispatchEvent(new Event("scroll"));
      fixture.detectChanges();

      expect(scrollFadeEl.classList.contains("tedi-scroll-fade--top-20")).toBe(
        false,
      );
      expect(
        scrollFadeEl.classList.contains("tedi-scroll-fade--bottom-20"),
      ).toBe(true);
    });

    it("should show both fades when scrolled to middle", () => {
      Object.defineProperty(innerEl, "scrollTop", {
        value: 100,
        configurable: true,
      });
      innerEl.dispatchEvent(new Event("scroll"));
      fixture.detectChanges();

      expect(scrollFadeEl.classList.contains("tedi-scroll-fade--top-20")).toBe(
        true,
      );
      expect(
        scrollFadeEl.classList.contains("tedi-scroll-fade--bottom-20"),
      ).toBe(true);
    });

    it("should show only top fade when scrolled to bottom", () => {
      Object.defineProperty(innerEl, "scrollTop", {
        value: 300,
        configurable: true,
      });
      innerEl.dispatchEvent(new Event("scroll"));
      fixture.detectChanges();

      expect(scrollFadeEl.classList.contains("tedi-scroll-fade--top-20")).toBe(
        true,
      );
      expect(
        scrollFadeEl.classList.contains("tedi-scroll-fade--bottom-20"),
      ).toBe(false);
    });

    it("should emit scrolledToTop when at top", () => {
      innerEl.dispatchEvent(new Event("scroll"));
      expect(host.onScrolledToTop).toHaveBeenCalled();
    });

    it("should emit scrolledToBottom when at bottom", () => {
      Object.defineProperty(innerEl, "scrollTop", {
        value: 300,
        configurable: true,
      });
      innerEl.dispatchEvent(new Event("scroll"));
      expect(host.onScrolledToBottom).toHaveBeenCalled();
    });

    it("should not emit scrolledToTop when in middle", () => {
      host.onScrolledToTop.mockClear();
      Object.defineProperty(innerEl, "scrollTop", {
        value: 100,
        configurable: true,
      });
      innerEl.dispatchEvent(new Event("scroll"));
      expect(host.onScrolledToTop).not.toHaveBeenCalled();
    });

    it("should not emit scrolledToBottom when in middle", () => {
      host.onScrolledToBottom.mockClear();
      Object.defineProperty(innerEl, "scrollTop", {
        value: 100,
        configurable: true,
      });
      innerEl.dispatchEvent(new Event("scroll"));
      expect(host.onScrolledToBottom).not.toHaveBeenCalled();
    });

    it("should only show top fade when fadePosition is top and scrolled to middle", () => {
      host.fadePosition = "top";
      fixture.detectChanges();
      Object.defineProperty(innerEl, "scrollTop", {
        value: 100,
        configurable: true,
      });
      innerEl.dispatchEvent(new Event("scroll"));
      fixture.detectChanges();

      expect(scrollFadeEl.classList.contains("tedi-scroll-fade--top-20")).toBe(
        true,
      );
      expect(
        scrollFadeEl.classList.contains("tedi-scroll-fade--bottom-20"),
      ).toBe(false);
    });

    it("should only show bottom fade when fadePosition is bottom and scrolled to middle", () => {
      host.fadePosition = "bottom";
      fixture.detectChanges();
      Object.defineProperty(innerEl, "scrollTop", {
        value: 100,
        configurable: true,
      });
      innerEl.dispatchEvent(new Event("scroll"));
      fixture.detectChanges();

      expect(scrollFadeEl.classList.contains("tedi-scroll-fade--top-20")).toBe(
        false,
      );
      expect(
        scrollFadeEl.classList.contains("tedi-scroll-fade--bottom-20"),
      ).toBe(true);
    });
  });
});
