import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, signal } from "@angular/core";
import { HeaderSearchComponent } from "./header-search.component";
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

function stubDialogElement() {
  if (typeof HTMLDialogElement !== "undefined") {
    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = function showModal(
        this: HTMLDialogElement,
      ) {
        this.setAttribute("open", "");
      };
    }
    if (!HTMLDialogElement.prototype.close) {
      HTMLDialogElement.prototype.close = function close(
        this: HTMLDialogElement,
      ) {
        this.removeAttribute("open");
        this.dispatchEvent(new Event("close"));
      };
    }
  }
}

describe("HeaderSearchComponent", () => {
  let fixture: ComponentFixture<HeaderSearchComponent>;
  let component: HeaderSearchComponent;
  let isMobileSignal: ReturnType<typeof signal<boolean>>;
  let mockBreakpointService: Partial<BreakpointService>;

  beforeEach(async () => {
    stubDialogElement();
    isMobileSignal = signal(false);
    mockBreakpointService = {
      isBelowBreakpoint: () => isMobileSignal,
    } as Partial<BreakpointService>;

    await TestBed.configureTestingModule({
      imports: [HeaderSearchComponent],
      providers: [
        { provide: BreakpointService, useValue: mockBreakpointService },
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function getToggle(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector(
      "tedi-header-mobile-button button.tedi-header-mobile-button",
    );
  }

  function getToggleHost(): HTMLElement | null {
    return fixture.nativeElement.querySelector("tedi-header-mobile-button");
  }

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("should have the host class applied", () => {
    expect(fixture.nativeElement.classList).toContain("tedi-header-search");
  });

  describe("desktop", () => {
    beforeEach(() => {
      isMobileSignal.set(false);
      fixture.detectChanges();
    });

    it("does not render the toggle button", () => {
      expect(getToggleHost()).toBeFalsy();
    });

    it("does not render the modal dialog", () => {
      expect(
        fixture.nativeElement.querySelector(".tedi-header-search__modal"),
      ).toBeFalsy();
    });
  });

  describe("mobile + modal variant", () => {
    beforeEach(() => {
      isMobileSignal.set(true);
      fixture.detectChanges();
    });

    it("renders the toggle button with the search label", () => {
      const btn = getToggle();
      expect(btn).toBeTruthy();
      expect(
        btn
          ?.querySelector(".tedi-header-mobile-button__text")
          ?.textContent?.trim(),
      ).toBe("header.search");
    });

    it("forwards dialog-trigger aria attributes to the inner button", () => {
      const btn = getToggle();
      expect(btn?.getAttribute("aria-label")).toBe("header.search");
      expect(btn?.getAttribute("aria-haspopup")).toBe("dialog");
      expect(btn?.getAttribute("aria-expanded")).toBe("false");
    });

    it("renders the modal dialog", () => {
      const dialog = fixture.nativeElement.querySelector(
        ".tedi-header-search__modal",
      ) as HTMLDialogElement | null;
      expect(dialog).toBeTruthy();
      expect(dialog?.tagName).toBe("DIALOG");
      expect(dialog?.getAttribute("aria-label")).toBe("header.search");
    });

    it("opens the modal when the toggle button is clicked", () => {
      const dialog = fixture.nativeElement.querySelector(
        ".tedi-header-search__modal",
      ) as HTMLDialogElement;
      const showSpy = jest.spyOn(dialog, "showModal");

      getToggle()!.click();
      fixture.detectChanges();

      expect(showSpy).toHaveBeenCalled();
      expect(getToggle()?.classList).toContain(
        "tedi-header-mobile-button--selected",
      );
      expect(getToggle()?.getAttribute("aria-expanded")).toBe("true");
    });

    it("closes the modal when the close button is clicked", () => {
      const dialog = fixture.nativeElement.querySelector(
        ".tedi-header-search__modal",
      ) as HTMLDialogElement;
      const closeSpy = jest.spyOn(dialog, "close");

      getToggle()!.click();
      fixture.detectChanges();

      const closeBtn = fixture.nativeElement.querySelector(
        ".tedi-header-search__button-close",
      ) as HTMLButtonElement;
      closeBtn.click();
      fixture.detectChanges();

      expect(closeSpy).toHaveBeenCalled();
    });

    it("syncs state when the dialog emits a `close` event (Escape, etc.)", () => {
      const dialog = fixture.nativeElement.querySelector(
        ".tedi-header-search__modal",
      ) as HTMLDialogElement;

      getToggle()!.click();
      fixture.detectChanges();

      dialog.dispatchEvent(new Event("close"));
      fixture.detectChanges();

      expect(getToggle()?.classList).not.toContain(
        "tedi-header-mobile-button--selected",
      );
      expect(getToggle()?.getAttribute("aria-expanded")).toBe("false");
    });

    it("does not open the modal when disabled", () => {
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();

      const dialog = fixture.nativeElement.querySelector(
        ".tedi-header-search__modal",
      ) as HTMLDialogElement;
      const showSpy = jest.spyOn(dialog, "showModal");

      const btn = getToggle();
      expect(btn?.disabled).toBe(true);
      btn?.click();
      fixture.detectChanges();

      expect(showSpy).not.toHaveBeenCalled();
    });

    it("uses custom labels when provided", () => {
      fixture.componentRef.setInput("mobileLabels", {
        button: "Otsi",
        modalTitle: "Otsing",
      });
      fixture.detectChanges();

      const btn = getToggle();
      expect(
        btn
          ?.querySelector(".tedi-header-mobile-button__text")
          ?.textContent?.trim(),
      ).toBe("Otsi");

      const dialog = fixture.nativeElement.querySelector(
        ".tedi-header-search__modal",
      ) as HTMLDialogElement;
      expect(dialog.getAttribute("aria-label")).toBe("Otsing");
      expect(
        fixture.nativeElement
          .querySelector(".tedi-header-search__modal-heading [tedi-text]")
          ?.textContent?.trim(),
      ).toBe("Otsing");
    });

    it("renders projected children inside the modal body", () => {
      @Component({
        standalone: true,
        imports: [HeaderSearchComponent],
        template: `
          <tedi-header-search>
            <input data-testid="search-input" type="search" />
          </tedi-header-search>
        `,
      })
      class HostComponent {}

      const hostFixture = TestBed.createComponent(HostComponent);
      hostFixture.detectChanges();

      const input = hostFixture.nativeElement.querySelector(
        "[data-testid='search-input']",
      );
      expect(input).toBeTruthy();
      expect(
        hostFixture.nativeElement
          .querySelector(".tedi-header-search__modal-body")
          ?.contains(input),
      ).toBe(true);
    });

    it("resets modalOpen when leaving the mobile breakpoint", () => {
      const dialog = fixture.nativeElement.querySelector(
        ".tedi-header-search__modal",
      ) as HTMLDialogElement;
      const closeSpy = jest.spyOn(dialog, "close");

      getToggle()!.click();
      fixture.detectChanges();

      isMobileSignal.set(false);
      fixture.detectChanges();

      expect(
        fixture.nativeElement.querySelector(".tedi-header-search__modal"),
      ).toBeFalsy();
      expect(getToggleHost()).toBeFalsy();
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe("mobile + inline variant", () => {
    beforeEach(() => {
      isMobileSignal.set(true);
      fixture.componentRef.setInput("mobileVariant", "inline");
      fixture.detectChanges();
    });

    it("does not render the toggle button", () => {
      expect(getToggleHost()).toBeFalsy();
    });

    it("does not render the modal dialog", () => {
      expect(
        fixture.nativeElement.querySelector(".tedi-header-search__modal"),
      ).toBeFalsy();
    });

    it("renders projected children inline", () => {
      @Component({
        standalone: true,
        imports: [HeaderSearchComponent],
        template: `
          <tedi-header-search mobileVariant="inline">
            <input data-testid="inline-input" type="search" />
          </tedi-header-search>
        `,
      })
      class HostComponent {}

      isMobileSignal.set(true);
      const hostFixture = TestBed.createComponent(HostComponent);
      hostFixture.detectChanges();

      const input = hostFixture.nativeElement.querySelector(
        "[data-testid='inline-input']",
      );
      expect(input).toBeTruthy();
      expect(
        hostFixture.nativeElement.querySelector(
          ".tedi-header-search__modal-body",
        ),
      ).toBeFalsy();
    });
  });
});
