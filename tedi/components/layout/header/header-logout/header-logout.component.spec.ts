import { ComponentFixture, TestBed } from "@angular/core/testing";
import { signal } from "@angular/core";
import { HeaderLogoutComponent } from "./header-logout.component";
import { BreakpointService } from "../../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
  setLanguage() {}
  getLanguage = signal("et");
}

describe("HeaderLogoutComponent", () => {
  let fixture: ComponentFixture<HeaderLogoutComponent>;
  let isMobileSignal: ReturnType<typeof signal<boolean>>;
  let mockBreakpointService: Partial<BreakpointService>;

  beforeEach(async () => {
    isMobileSignal = signal(false);
    mockBreakpointService = {
      isBelowBreakpoint: () => isMobileSignal,
      getBreakpointInputs: (inputs: object) => inputs,
    } as unknown as Partial<BreakpointService>;

    await TestBed.configureTestingModule({
      imports: [HeaderLogoutComponent],
      providers: [
        { provide: BreakpointService, useValue: mockBreakpointService },
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderLogoutComponent);
  });

  it("applies the host class", () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.classList).toContain("tedi-header-logout");
  });

  it("renders the custom label as-is when `label` is set, skipping translation", () => {
    fixture.componentRef.setInput("label", "Sign out");
    fixture.detectChanges();
    const labelSpan = fixture.nativeElement.querySelector(
      "button.tedi-header-logout__button [tedi-text]",
    );
    expect(labelSpan?.textContent?.trim()).toBe("Sign out");
  });

  describe("desktop (above md)", () => {
    beforeEach(() => {
      isMobileSignal.set(false);
      fixture.detectChanges();
    });

    it("renders a <button> with neutral (non-link) styling by default", () => {
      const btn = fixture.nativeElement.querySelector(
        "button.tedi-header-logout__button",
      ) as HTMLButtonElement | null;
      expect(btn).toBeTruthy();
      expect(btn?.classList).not.toContain("tedi-link");
      expect(
        fixture.nativeElement.querySelector("a.tedi-header-logout__button"),
      ).toBeFalsy();
    });

    it("renders an <a tedi-link> with link styling when `href` is provided", () => {
      fixture.componentRef.setInput("href", "/logout");
      fixture.detectChanges();

      const anchor = fixture.nativeElement.querySelector(
        "a.tedi-header-logout__button",
      ) as HTMLAnchorElement | null;
      expect(anchor).toBeTruthy();
      expect(anchor?.getAttribute("href")).toBe("/logout");
      expect(anchor?.classList).toContain("tedi-link");
      expect(anchor?.classList).toContain("tedi-link--no-underline");
      expect(
        fixture.nativeElement.querySelector("button.tedi-header-logout__button"),
      ).toBeFalsy();
    });

    it("does not render the mobile HeaderMobileButton wrapper", () => {
      expect(
        fixture.nativeElement.querySelector("tedi-header-mobile-button"),
      ).toBeFalsy();
    });
  });

  describe("mobile (below md)", () => {
    beforeEach(() => {
      isMobileSignal.set(true);
      fixture.detectChanges();
    });

    it("renders HeaderMobileButton instead of the inline button", () => {
      expect(
        fixture.nativeElement.querySelector("tedi-header-mobile-button"),
      ).toBeTruthy();
      expect(
        fixture.nativeElement.querySelector(".tedi-header-logout__button"),
      ).toBeFalsy();
    });

    it("forwards the resolved label to HeaderMobileButton", () => {
      const label = fixture.nativeElement.querySelector(
        "tedi-header-mobile-button .tedi-header-mobile-button__text",
      );
      expect(label?.textContent?.trim()).toBe("header.logout-small");
    });

    it("forwards `href` so HeaderMobileButton renders as an anchor", () => {
      fixture.componentRef.setInput("href", "/logout");
      fixture.detectChanges();

      const anchor = fixture.nativeElement.querySelector(
        "tedi-header-mobile-button a.tedi-header-mobile-button",
      ) as HTMLAnchorElement | null;
      expect(anchor).toBeTruthy();
      expect(anchor?.getAttribute("href")).toBe("/logout");
    });
  });
});
