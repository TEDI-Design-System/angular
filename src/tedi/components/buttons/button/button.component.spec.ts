import { ComponentFixture, TestBed } from "@angular/core/testing";
import { IconComponent } from "../../base/icon/icon.component";
import { ButtonComponent, ButtonSize, ButtonVariant } from "./button.component";
import { Component, input, signal } from "@angular/core";
import { By } from "@angular/platform-browser";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { PrintDirective, PrintVisibility } from "../../../directives/print";

@Component({
  standalone: true,
  imports: [ButtonComponent, PrintDirective],
  template: `
    <button tedi-button tediPrint="show">Printed</button>
    <button tedi-button tediPrint breakInside="avoid">Break only</button>
    <button tedi-button [tediPrint]="visibility()">Toggled</button>
  `,
})
class PrintOverrideHost {
  visibility = input<PrintVisibility | "">("hide");
}

describe("ButtonComponent", () => {
  let fixture: ComponentFixture<ButtonComponent>;
  let buttonElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ButtonComponent, IconComponent],
    });

    fixture = TestBed.createComponent(ButtonComponent);
    buttonElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should apply default classes", () => {
    expect(buttonElement.classList).toContain("tedi-button");
    expect(buttonElement.classList).toContain("tedi-button--primary");
    expect(buttonElement.classList).toContain("tedi-button--default");
  });

  it("should apply correct variants", () => {
    const variants: ButtonVariant[] = [
      "primary",
      "secondary",
      "neutral",
      "success",
      "danger",
      "danger-neutral",
      "primary-inverted",
      "secondary-inverted",
      "neutral-inverted",
      "primary-button-group",
      "secondary-button-group",
    ];

    for (const variant of variants) {
      fixture.componentRef.setInput("variant", variant);
      fixture.detectChanges();

      expect(buttonElement.classList).toContain(`tedi-button--${variant}`);
    }
  });

  it("should apply correct sizes", () => {
    const sizes: ButtonSize[] = ["default", "small"];

    for (const size of sizes) {
      fixture.componentRef.setInput("size", size);
      fixture.detectChanges();

      expect(buttonElement.classList).toContain(`tedi-button--${size}`);
    }
  });

  it("should not contain 'undefined' in class list", () => {
    expect(buttonElement.classList).not.toContain("undefined");
  });

  it("should hide the button when printing", () => {
    expect(buttonElement.classList).toContain("no-print");
  });

  it("should keep show-print when the consumer opts back into printing", () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PrintOverrideHost],
    });

    const hostFixture = TestBed.createComponent(PrintOverrideHost);
    hostFixture.detectChanges();

    const button = hostFixture.debugElement.queryAll(
      By.directive(ButtonComponent),
    )[0].nativeElement as HTMLElement;

    expect(button.classList).toContain("tedi-button");
    expect(button.classList).toContain("no-print");
    expect(button.classList).toContain("show-print");
  });

  it("should keep the button hidden when only break inputs are set", () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PrintOverrideHost],
    });

    const hostFixture = TestBed.createComponent(PrintOverrideHost);
    hostFixture.detectChanges();

    const button = hostFixture.debugElement.queryAll(
      By.directive(ButtonComponent),
    )[1].nativeElement as HTMLElement;

    expect(button.classList).toContain("no-print");
    expect(button.classList).toContain("break-inside-avoid");
    expect(button.classList).not.toContain("show-print");
  });

  it("should keep the button's own no-print when tediPrint is cleared", () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PrintOverrideHost],
    });

    const hostFixture = TestBed.createComponent(PrintOverrideHost);
    hostFixture.detectChanges();

    const button = hostFixture.debugElement.queryAll(
      By.directive(ButtonComponent),
    )[2].nativeElement as HTMLElement;

    expect(button.classList).toContain("no-print");

    hostFixture.componentRef.setInput("visibility", "");
    hostFixture.detectChanges();

    expect(button.classList).toContain("no-print");
  });
});

@Component({
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  template: `
    <form (submit)="onSubmit($event)">
      <button
        tedi-button
        type="submit"
        aria-disabled="true"
        [loading]="loading()"
        (click)="onClick()"
      >
        <tedi-icon name="edit" />
        Save
      </button>
    </form>
    <button
      tedi-button
      id="icon-only"
      aria-label="Edit"
      loadingLabel="Saving"
      [loading]="loading()"
    >
      <tedi-icon name="edit" />
    </button>
  `,
})
class LoadingHost {
  loading = signal(false);
  onClick = jest.fn();
  onSubmit = jest.fn((event: Event) => event.preventDefault());
}

describe("ButtonComponent loading", () => {
  let fixture: ComponentFixture<LoadingHost>;
  let host: LoadingHost;
  let button: HTMLButtonElement;
  let announce: jest.Mock;

  const setLoading = (loading: boolean) => {
    host.loading.set(loading);
    fixture.detectChanges();
  };

  beforeEach(() => {
    announce = jest.fn();

    TestBed.configureTestingModule({
      imports: [LoadingHost],
      providers: [
        { provide: LiveAnnouncer, useValue: { announce } },
        {
          provide: TediTranslationService,
          useValue: { translate: (key: string) => key },
        },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    fixture = TestBed.createComponent(LoadingHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector("button");
  });

  it("marks the button disabled while loading, keeping it focusable", () => {
    setLoading(true);

    expect(button.classList).toContain("tedi-button--loading");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.hasAttribute("aria-busy")).toBe(false);
    expect(button.disabled).toBe(false);
    expect(button.querySelector(".tedi-button__spinner")).not.toBeNull();

    setLoading(false);

    expect(button.classList).not.toContain("tedi-button--loading");
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.querySelector(".tedi-button__spinner")).toBeNull();
  });

  it("describes the loading state while loading, keeping the name unchanged", () => {
    const iconOnly = fixture.nativeElement.querySelector(
      "#icon-only",
    ) as HTMLButtonElement;
    button.setAttribute("aria-describedby", "hint");

    setLoading(true);

    const description = button.querySelector(
      ".tedi-button__loading-description",
    ) as HTMLElement;
    expect(description.getAttribute("aria-hidden")).toBe("true");
    expect(description.textContent?.trim()).toBe("loading");
    expect(button.getAttribute("aria-describedby")).toBe(
      `hint ${description.id}`,
    );
    expect(iconOnly.getAttribute("aria-label")).toBe("Edit");
    expect(iconOnly.classList).toContain("tedi-button--icon-only");

    setLoading(false);

    expect(button.getAttribute("aria-describedby")).toBe("hint");
    expect(
      button.querySelector(".tedi-button__loading-description"),
    ).toBeNull();
  });

  it("keeps the consumer's aria-disabled until loading starts", () => {
    expect(button.getAttribute("aria-disabled")).toBe("true");
  });

  it("removes aria-disabled after loading when the consumer didn't set it", () => {
    const iconOnly = fixture.nativeElement.querySelector("#icon-only");

    setLoading(true);
    expect(iconOnly.getAttribute("aria-disabled")).toBe("true");

    setLoading(false);
    expect(iconOnly.hasAttribute("aria-disabled")).toBe(false);
  });

  it("blocks middle-clicks while loading", () => {
    setLoading(true);
    const loadingClick = new MouseEvent("auxclick", { cancelable: true });
    button.dispatchEvent(loadingClick);
    expect(loadingClick.defaultPrevented).toBe(true);

    setLoading(false);
    const idleClick = new MouseEvent("auxclick", { cancelable: true });
    button.dispatchEvent(idleClick);
    expect(idleClick.defaultPrevented).toBe(false);
  });

  it("keeps the icon position classes while the spinner is shown", () => {
    setLoading(true);

    expect(button.classList).not.toContain("tedi-button--pl");
    expect(button.classList).toContain("tedi-button--pr");
  });

  it("blocks click handlers and form submission while loading", () => {
    setLoading(true);
    button.click();

    expect(host.onClick).not.toHaveBeenCalled();
    expect(host.onSubmit).not.toHaveBeenCalled();

    setLoading(false);
    button.click();

    expect(host.onClick).toHaveBeenCalledTimes(1);
    expect(host.onSubmit).toHaveBeenCalledTimes(1);
  });

  it("uses loadingLabel for the description and the announcement", () => {
    const iconOnly = fixture.nativeElement.querySelector(
      "#icon-only",
    ) as HTMLButtonElement;
    iconOnly.focus();

    setLoading(true);

    expect(
      iconOnly
        .querySelector(".tedi-button__loading-description")
        ?.textContent?.trim(),
    ).toBe("Saving");
    expect(announce).toHaveBeenCalledWith("Saving", "assertive");
  });

  it("announces a switch into loading only on the focused button", () => {
    setLoading(true);
    expect(announce).not.toHaveBeenCalled();

    setLoading(false);
    button.focus();
    setLoading(true);
    expect(announce).toHaveBeenCalledWith("loading", "assertive");

    announce.mockClear();
    setLoading(false);
    expect(announce).not.toHaveBeenCalled();
  });
  it("does not announce a button that renders already loading", () => {
    const loadingFixture = TestBed.createComponent(LoadingHost);
    loadingFixture.componentInstance.loading.set(true);
    announce.mockClear();
    loadingFixture.detectChanges();

    expect(announce).not.toHaveBeenCalled();
  });
});
