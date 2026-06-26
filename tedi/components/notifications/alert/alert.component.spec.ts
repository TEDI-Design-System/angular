import { Component } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import {
  AlertComponent,
  AlertRole,
  AlertType,
  AlertTitleType,
  AlertVariant,
} from "./alert.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

describe("AlertComponent", () => {
  let component: AlertComponent;
  let fixture: ComponentFixture<AlertComponent>;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AlertComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should apply the correct type class based on the type input", () => {
    const types: AlertType[] = ["danger", "info", "success", "warning"];

    for (const type of types) {
      fixture.componentRef.setInput("type", type);
      fixture.detectChanges();

      expect(element.classList).toContain(`tedi-alert--${type}`);
    }
  });

  it("should display the close button when showClose is true", () => {
    fixture.componentRef.setInput("showClose", true);
    fixture.detectChanges();

    const closeButton = fixture.debugElement.query(
      By.css(".tedi-alert__close"),
    );

    expect(closeButton).toBeTruthy();
  });

  it("should not display the close button when showClose is false", () => {
    fixture.componentRef.setInput("showClose", false);
    fixture.detectChanges();

    const closeButton = fixture.debugElement.query(
      By.css(".tedi-alert__close"),
    );

    expect(closeButton).toBeNull();
  });

  it("should set the correct ARIA role based on the role input", () => {
    const roles: AlertRole[] = ["alert", "none", "status"];

    for (const role of roles) {
      fixture.componentRef.setInput("role", role);
      fixture.detectChanges();

      if (role === "none") {
        expect(element.getAttribute("role")).toBe(null);
      } else {
        expect(element.getAttribute("role")).toBe(role);
      }
    }
  });

  it("should set the correct aria-live attribute based on the role input", () => {
    const roles: AlertRole[] = ["alert", "none", "status"];

    for (const role of roles) {
      fixture.componentRef.setInput("role", role);
      fixture.detectChanges();

      const ariaLive =
        role === "alert" ? "assertive" : role === "status" ? "polite" : "off";
      expect(element.getAttribute("aria-live")).toBe(ariaLive);
    }
  });

  it("should apply the global variant class when variant is set to global", () => {
    fixture.componentRef.setInput("variant", "global");
    fixture.detectChanges();
    expect(element.classList).toContain("tedi-alert--global");
  });

  it("should apply the no-side-borders variant class when variant is set to noSideBorders", () => {
    fixture.componentRef.setInput("variant", "noSideBorders");
    fixture.detectChanges();
    expect(element.classList).toContain("tedi-alert--no-side-borders");
  });

  it("should close alert if close button is clicked", () => {
    fixture.componentRef.setInput("showClose", true);
    fixture.detectChanges();

    const closeButton = fixture.debugElement.query(By.css(".tedi-alert__close"))
      .nativeElement as HTMLButtonElement;

    closeButton.click();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).style.display).toBe("none");
  });

  describe("title", () => {
    it("should display title when provided", () => {
      fixture.componentRef.setInput("title", "Test Alert Title");
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(
        By.css(".tedi-alert__title")
      );
      expect(titleElement).toBeTruthy();
      expect(titleElement.nativeElement.textContent).toContain(
        "Test Alert Title"
      );
    });

    it("should not display title element when title is not provided", () => {
      fixture.componentRef.setInput("title", undefined);
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(
        By.css(".tedi-alert__title")
      );
      expect(titleElement).toBeNull();
    });
  });

  describe("titleElement", () => {
    it("should use h2 as default title element", () => {
      fixture.componentRef.setInput("title", "Test Title");
      fixture.detectChanges();

      const h2Element = fixture.debugElement.query(
        By.css("h2.tedi-alert__title")
      );
      expect(h2Element).toBeTruthy();
    });

    it("should use specified title element tag", () => {
      const titleElements: AlertTitleType[] = [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "div",
      ];

      for (const tag of titleElements) {
        fixture.componentRef.setInput("title", "Test Title");
        fixture.componentRef.setInput("titleElement", tag);
        fixture.detectChanges();

        const titleTag = fixture.debugElement.query(
          By.css(`${tag}.tedi-alert__title`)
        );
        expect(titleTag).toBeTruthy();
      }
    });
  });

  describe("icon", () => {
    it("should display icon in head when title and icon are provided", () => {
      fixture.componentRef.setInput("title", "Test Title");
      fixture.componentRef.setInput("icon", "info");
      fixture.detectChanges();

      const iconElement = fixture.debugElement.query(
        By.css(".tedi-alert__head > tedi-icon")
      );
      expect(iconElement).toBeTruthy();
      expect(iconElement.nativeElement.textContent).toBe("info");
    });

    it("should display icon in content when no title but icon is provided", () => {
      fixture.componentRef.setInput("icon", "warning");
      fixture.detectChanges();

      const iconElement = fixture.debugElement.query(
        By.css(".tedi-alert__content-icon")
      );
      expect(iconElement).toBeTruthy();
      expect(iconElement.nativeElement.textContent).toBe("warning");
    });

    it("should not display icon when not provided", () => {
      fixture.componentRef.setInput("icon", "");
      fixture.detectChanges();

      const iconElement = fixture.debugElement.query(By.css("tedi-icon"));
      expect(iconElement).toBeNull();
    });
  });

  describe("open", () => {
    it("should be visible when open is true", () => {
      fixture.componentRef.setInput("open", true);
      fixture.detectChanges();

      expect(element.style.display).toBe("flex");
    });

    it("should be hidden when open is false", () => {
      fixture.componentRef.setInput("open", false);
      fixture.detectChanges();

      expect(element.style.display).toBe("none");
    });
  });

  describe("closeDelay", () => {
    it("should close immediately when closeDelay is 0", () => {
      fixture.componentRef.setInput("showClose", true);
      fixture.componentRef.setInput("closeDelay", 0);
      fixture.detectChanges();

      const closeButton = fixture.debugElement.query(
        By.css(".tedi-alert__close")
      ).nativeElement as HTMLButtonElement;

      closeButton.click();
      fixture.detectChanges();

      expect(element.style.display).toBe("none");
    });

    it("should delay close when closeDelay is set", fakeAsync(() => {
      fixture.componentRef.setInput("showClose", true);
      fixture.componentRef.setInput("closeDelay", 300);
      fixture.detectChanges();

      const closeButton = fixture.debugElement.query(
        By.css(".tedi-alert__close")
      ).nativeElement as HTMLButtonElement;

      closeButton.click();
      fixture.detectChanges();

      expect(element.style.display).toBe("flex");
      tick(300);
      fixture.detectChanges();
      expect(element.style.display).toBe("none");
    }));
  });

  describe("closeClick", () => {
    it("should emit closeClick event when close button is clicked", () => {
      fixture.componentRef.setInput("showClose", true);
      fixture.detectChanges();

      const closeClickSpy = jest.fn();
      component.closeClick.subscribe(closeClickSpy);

      const closeButton = fixture.debugElement.query(
        By.css(".tedi-alert__close")
      ).nativeElement as HTMLButtonElement;

      closeButton.click();
      fixture.detectChanges();

      expect(closeClickSpy).toHaveBeenCalled();
    });
  });

  describe("aria-label", () => {
    it("should set aria-label with type only when no title", () => {
      fixture.componentRef.setInput("type", "warning");
      fixture.componentRef.setInput("title", undefined);
      fixture.detectChanges();

      expect(element.getAttribute("aria-label")).toBe("warning alert");
    });

    it("should set aria-label with type and title when title is provided", () => {
      fixture.componentRef.setInput("type", "danger");
      fixture.componentRef.setInput("title", "Error occurred");
      fixture.detectChanges();

      expect(element.getAttribute("aria-label")).toBe(
        "danger alert: Error occurred"
      );
    });
  });

  describe("action slot", () => {
    @Component({
      standalone: true,
      imports: [AlertComponent],
      template: `
        <tedi-alert [showClose]="showClose">
          Content
          @if (showAction) {
            <button tedi-alert-action type="button">Open profile</button>
          }
        </tedi-alert>
      `,
    })
    class HostComponent {
      showAction = true;
      showClose = false;
    }

    function createHost() {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [HostComponent],
        providers: [
          { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        ],
      });
      const hostFixture = TestBed.createComponent(HostComponent);
      hostFixture.detectChanges();
      return hostFixture;
    }

    it("renders the action slot content", () => {
      const hostFixture = createHost();
      const actionButton = hostFixture.debugElement.query(
        By.css("button[tedi-alert-action]"),
      );
      expect(actionButton).toBeTruthy();
      expect(actionButton.nativeElement.textContent.trim()).toBe(
        "Open profile",
      );
    });

    it("projects the action into the action slot wrapper", () => {
      const hostFixture = createHost();
      const actionSlot = hostFixture.debugElement.query(
        By.css(".tedi-alert__action"),
      ).nativeElement as HTMLElement;

      expect(actionSlot.querySelector("button[tedi-alert-action]")).toBeTruthy();
    });

    it("renders the action slot even without showClose", () => {
      const hostFixture = createHost();
      const actionButton = hostFixture.debugElement.query(
        By.css("button[tedi-alert-action]"),
      );
      const closeButton = hostFixture.debugElement.query(
        By.css(".tedi-alert__close"),
      );

      expect(actionButton).toBeTruthy();
      expect(closeButton).toBeNull();
    });
  });

  describe("variant", () => {
    it("should apply default variant without extra classes", () => {
      fixture.componentRef.setInput("variant", "default");
      fixture.detectChanges();

      expect(element.classList.contains("tedi-alert")).toBe(true);
      expect(element.classList.contains("tedi-alert--global")).toBe(false);
      expect(element.classList.contains("tedi-alert--no-side-borders")).toBe(
        false
      );
    });

    it("should apply all variant classes correctly", () => {
      const variants: AlertVariant[] = ["default", "global", "noSideBorders"];

      for (const variant of variants) {
        fixture.componentRef.setInput("variant", variant);
        fixture.detectChanges();

        if (variant === "global") {
          expect(element.classList.contains("tedi-alert--global")).toBe(true);
        } else if (variant === "noSideBorders") {
          expect(
            element.classList.contains("tedi-alert--no-side-borders")
          ).toBe(true);
        }
      }
    });
  });
});
