import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CollapseButtonComponent } from "./collapse-button.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import { TediTranslationService } from "../../../services/translation/translation.service";

class TranslationMock {
  translate(key: string) {
    return key;
  }
  track(key: string) {
    return () => key;
  }
}

describe("CollapseButtonComponent", () => {
  let component: CollapseButtonComponent;
  let fixture: ComponentFixture<CollapseButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollapseButtonComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CollapseButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with default values", () => {
    expect(component.open()).toBe(false);
    expect(component.hideText()).toBe(false);
    expect(component.arrowType()).toBe("default");
  });

  it("emits openChange with toggled value when clicked", () => {
    const emitted: boolean[] = [];
    component.openChange.subscribe((value) => emitted.push(value));

    const button: HTMLButtonElement = fixture.nativeElement;
    button.click();
    expect(emitted).toEqual([true]);

    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();
    button.click();
    expect(emitted).toEqual([true, false]);
  });

  it("renders openText when collapsed", () => {
    fixture.componentRef.setInput("openText", "Open");
    fixture.detectChanges();
    const text: HTMLElement = fixture.nativeElement.querySelector(
      ".tedi-collapse-button__text",
    );
    expect(text.textContent?.trim()).toBe("Open");
  });

  it("renders closeText when expanded", () => {
    fixture.componentRef.setInput("closeText", "Close");
    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();
    const text: HTMLElement = fixture.nativeElement.querySelector(
      ".tedi-collapse-button__text",
    );
    expect(text.textContent?.trim()).toBe("Close");
  });

  it("hides text when hideText is true", () => {
    fixture.componentRef.setInput("hideText", true);
    fixture.detectChanges();
    const text = fixture.nativeElement.querySelector(
      ".tedi-collapse-button__text",
    );
    expect(text).toBeNull();
  });

  it("applies the secondary arrow wrapper when arrowType is 'secondary' and hideText is true", () => {
    fixture.componentRef.setInput("hideText", true);
    fixture.componentRef.setInput("arrowType", "secondary");
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector(
      ".tedi-collapse-button__icon-wrapper",
    );
    expect(wrapper).toBeTruthy();
  });

  it("does not apply the secondary arrow wrapper when arrowType is 'default'", () => {
    fixture.componentRef.setInput("hideText", true);
    fixture.componentRef.setInput("arrowType", "default");
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector(
      ".tedi-collapse-button__icon-wrapper",
    );
    expect(wrapper).toBeNull();
  });

  it("applies the --small modifier when size is 'small'", () => {
    fixture.componentRef.setInput("size", "small");
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement;
    expect(button.classList.contains("tedi-collapse-button--small")).toBe(
      true,
    );
  });

  it("applies the --neutral modifier on the host when icon-only with arrowType 'default'", () => {
    fixture.componentRef.setInput("hideText", true);
    fixture.componentRef.setInput("arrowType", "default");
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement;
    expect(button.classList.contains("tedi-collapse-button--neutral")).toBe(
      true,
    );
    expect(button.classList.contains("tedi-collapse-button--icon-only")).toBe(
      true,
    );
  });

  it("toggles the --open modifier based on the open input", () => {
    const button: HTMLButtonElement = fixture.nativeElement;
    expect(button.classList.contains("tedi-collapse-button--open")).toBe(false);

    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();
    expect(button.classList.contains("tedi-collapse-button--open")).toBe(true);
  });

  it("forwards id, aria-controls, aria-label and aria-expanded", () => {
    fixture.componentRef.setInput("id", "btn-1");
    fixture.componentRef.setInput("ariaControls", "panel-1");
    fixture.componentRef.setInput("ariaLabel", "Toggle details");
    fixture.componentRef.setInput("hideText", true);
    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement;
    expect(button.id).toBe("btn-1");
    expect(button.getAttribute("aria-controls")).toBe("panel-1");
    expect(button.getAttribute("aria-label")).toBe("Toggle details");
    expect(button.getAttribute("aria-expanded")).toBe("true");
  });

  it("does not emit aria-label when text is visible (avoids WCAG 2.5.3 Label-in-Name conflict with visible text)", () => {
    fixture.componentRef.setInput("ariaLabel", "Toggle details");
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement;
    expect(button.getAttribute("aria-label")).toBeNull();
  });

  it("falls back to the translated open/close text as aria-label in icon-only mode", () => {
    fixture.componentRef.setInput("hideText", true);
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement;
    expect(button.getAttribute("aria-label")).toBe("open");

    fixture.componentRef.setInput("open", true);
    fixture.detectChanges();
    expect(button.getAttribute("aria-label")).toBe("close");
  });

  it("renders the toggle button with type='button' to avoid submitting parent forms", () => {
    const button: HTMLButtonElement = fixture.nativeElement;
    expect(button.getAttribute("type")).toBe("button");
  });
});
