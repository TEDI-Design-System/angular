import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HeaderMobileButtonComponent } from "./header-mobile-button.component";

describe("HeaderMobileButtonComponent", () => {
  let fixture: ComponentFixture<HeaderMobileButtonComponent>;
  let component: HeaderMobileButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderMobileButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderMobileButtonComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("icon", "menu");
    fixture.detectChanges();
  });

  function getButton(): HTMLButtonElement | null {
    return fixture.nativeElement.querySelector("button.tedi-header-mobile-button");
  }

  function getAnchor(): HTMLAnchorElement | null {
    return fixture.nativeElement.querySelector("a.tedi-header-mobile-button");
  }

  function getIcon(): Element | null {
    return fixture.nativeElement.querySelector("tedi-icon");
  }

  function getLabel(): Element | null {
    return fixture.nativeElement.querySelector(".tedi-header-mobile-button__text");
  }

  it("should create the component", () => {
    expect(component).toBeTruthy();
  });

  it("renders an icon", () => {
    expect(getIcon()).toBeTruthy();
    expect(getIcon()?.getAttribute("ng-reflect-name")).toBe("menu");
  });

  describe("when no href is provided", () => {
    it("renders as a button", () => {
      expect(getButton()).toBeTruthy();
      expect(getAnchor()).toBeFalsy();
    });

    it("renders the label when provided", () => {
      fixture.componentRef.setInput("label", "Menu");
      fixture.detectChanges();
      expect(getLabel()?.textContent?.trim()).toBe("Menu");
    });

    it("renders without a label", () => {
      expect(getLabel()).toBeFalsy();
    });
  });

  describe("when href is provided", () => {
    beforeEach(() => {
      fixture.componentRef.setInput("href", "/page");
      fixture.detectChanges();
    });

    it("renders as an anchor", () => {
      expect(getAnchor()).toBeTruthy();
      expect(getButton()).toBeFalsy();
      expect(getAnchor()?.getAttribute("href")).toBe("/page");
    });

    it("falls back to a button when disabled", () => {
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();
      expect(getButton()).toBeTruthy();
      expect(getAnchor()).toBeFalsy();
      expect(getButton()?.disabled).toBe(true);
    });
  });

  describe("aria attribute passthrough", () => {
    it("forwards `ariaLabel` to the inner button", () => {
      fixture.componentRef.setInput("ariaLabel", "Open search");
      fixture.detectChanges();
      expect(getButton()?.getAttribute("aria-label")).toBe("Open search");
    });

    it("forwards `ariaHasPopup` to the inner button", () => {
      fixture.componentRef.setInput("ariaHasPopup", "dialog");
      fixture.detectChanges();
      expect(getButton()?.getAttribute("aria-haspopup")).toBe("dialog");
    });

    it("forwards `ariaExpanded` to the inner button", () => {
      fixture.componentRef.setInput("ariaExpanded", true);
      fixture.detectChanges();
      expect(getButton()?.getAttribute("aria-expanded")).toBe("true");

      fixture.componentRef.setInput("ariaExpanded", false);
      fixture.detectChanges();
      expect(getButton()?.getAttribute("aria-expanded")).toBe("false");
    });

    it("forwards `ariaLabel` to the inner anchor when rendered as link", () => {
      fixture.componentRef.setInput("href", "/page");
      fixture.componentRef.setInput("ariaLabel", "Open");
      fixture.detectChanges();
      expect(getAnchor()?.getAttribute("aria-label")).toBe("Open");
    });

    it("does not forward popup-trigger aria attrs to the link branch", () => {
      fixture.componentRef.setInput("href", "/page");
      fixture.componentRef.setInput("ariaHasPopup", "dialog");
      fixture.componentRef.setInput("ariaExpanded", false);
      fixture.detectChanges();
      const anchor = getAnchor();
      expect(anchor?.hasAttribute("aria-haspopup")).toBe(false);
      expect(anchor?.hasAttribute("aria-expanded")).toBe(false);
    });

    it("omits aria attrs when inputs are not set", () => {
      const button = getButton();
      expect(button?.hasAttribute("aria-label")).toBe(false);
      expect(button?.hasAttribute("aria-haspopup")).toBe(false);
      expect(button?.hasAttribute("aria-expanded")).toBe(false);
    });
  });

  describe("modifier classes", () => {
    it("applies `--selected` when `selected` is true", () => {
      fixture.componentRef.setInput("selected", true);
      fixture.detectChanges();
      expect(getButton()?.classList).toContain(
        "tedi-header-mobile-button--selected",
      );
    });

    it("applies `--disabled` when `disabled` is true", () => {
      fixture.componentRef.setInput("disabled", true);
      fixture.detectChanges();
      expect(getButton()?.classList).toContain(
        "tedi-header-mobile-button--disabled",
      );
      expect(getButton()?.disabled).toBe(true);
    });

    it("applies no modifier classes by default", () => {
      const button = getButton();
      expect(button?.classList).toContain("tedi-header-mobile-button");
      expect(button?.classList).not.toContain(
        "tedi-header-mobile-button--selected",
      );
      expect(button?.classList).not.toContain(
        "tedi-header-mobile-button--disabled",
      );
    });
  });
});
