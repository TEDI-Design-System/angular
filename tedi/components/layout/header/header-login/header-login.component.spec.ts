import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HeaderLoginComponent } from "./header-login.component";
import { BreakpointService } from "../../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../../services/translation/translation.service";

@Component({
  standalone: true,
  imports: [HeaderLoginComponent],
  template: `<tedi-header-login
    [href]="href"
    [label]="label"
  ></tedi-header-login>`,
})
class TestHostComponent {
  href?: string;
  label = "";
}

describe("HeaderLoginComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let isMobileSignal: ReturnType<typeof signal<boolean>>;
  let mockBreakpointService: Partial<BreakpointService>;
  let mockTranslationService: {
    translate: jest.Mock;
    track: jest.Mock;
  };

  beforeEach(async () => {
    isMobileSignal = signal(false);
    mockBreakpointService = {
      isBelowBreakpoint: () => isMobileSignal,
      getBreakpointInputs: <T>(inputs: T) => inputs,
    } as Partial<BreakpointService>;
    mockTranslationService = {
      translate: jest.fn((key: string) => key),
      track: jest.fn((key: string) => () => key),
    };

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: BreakpointService, useValue: mockBreakpointService },
        { provide: TediTranslationService, useValue: mockTranslationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
  });

  it("should create component", () => {
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("looks up the desktop translation key by default", () => {
    fixture.detectChanges();
    expect(mockTranslationService.translate).toHaveBeenCalledWith(
      "header.login",
    );
  });

  it("looks up the small/mobile translation key when below md", () => {
    isMobileSignal.set(true);
    fixture.detectChanges();
    expect(mockTranslationService.translate).toHaveBeenCalledWith(
      "header.login-small",
    );
  });

  it("renders the custom label as-is when `label` is set, without translating", () => {
    fixture.componentInstance.label = "Sign in";
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector(
      "button.tedi-header-login__button",
    ) as HTMLButtonElement | null;
    expect(button?.textContent?.trim()).toBe("Sign in");
    expect(mockTranslationService.translate).not.toHaveBeenCalled();
  });

  describe("desktop (above md)", () => {
    beforeEach(() => {
      isMobileSignal.set(false);
    });

    it("renders a primary button with the desktop label by default", () => {
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector(
        "button.tedi-header-login__button",
      ) as HTMLButtonElement | null;
      expect(button).toBeTruthy();
      expect(button?.textContent?.trim()).toBe("header.login");
      expect(
        fixture.nativeElement.querySelector("a.tedi-header-login__button"),
      ).toBeFalsy();
    });

    it("renders as an anchor when `href` is provided", () => {
      fixture.componentInstance.href = "/login";
      fixture.detectChanges();

      const anchor = fixture.nativeElement.querySelector(
        "a.tedi-header-login__button",
      ) as HTMLAnchorElement | null;
      expect(anchor).toBeTruthy();
      expect(anchor?.getAttribute("href")).toBe("/login");
      expect(anchor?.textContent?.trim()).toBe("header.login");
      expect(
        fixture.nativeElement.querySelector("button.tedi-header-login__button"),
      ).toBeFalsy();
    });
  });

  describe("mobile (below md)", () => {
    beforeEach(() => {
      isMobileSignal.set(true);
    });

    it("renders HeaderMobileButton with the small label", () => {
      fixture.detectChanges();
      const text = fixture.nativeElement.querySelector(
        "tedi-header-mobile-button .tedi-header-mobile-button__text",
      );
      expect(text?.textContent?.trim()).toBe("header.login-small");
    });

    it("forwards `href` to HeaderMobileButton so it renders as an anchor", () => {
      fixture.componentInstance.href = "/login";
      fixture.detectChanges();

      const anchor = fixture.nativeElement.querySelector(
        "tedi-header-mobile-button a.tedi-header-mobile-button",
      ) as HTMLAnchorElement | null;
      expect(anchor).toBeTruthy();
      expect(anchor?.getAttribute("href")).toBe("/login");
    });
  });
});
