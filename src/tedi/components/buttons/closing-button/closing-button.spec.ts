import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ClosingButtonComponent } from "./closing-button.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

describe("ClosingButtonComponent", () => {
  let fixture: ComponentFixture<ClosingButtonComponent>;
  let component: ClosingButtonComponent;
  let buttonElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ClosingButtonComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    });

    fixture = TestBed.createComponent(ClosingButtonComponent);
    component = fixture.componentInstance;
    buttonElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create the component", () => {
    expect(component).toBeTruthy();
    expect(component.size()).toBe("default");
    expect(component.iconSize()).toBe(24);
    expect(buttonElement.classList).toContain("tedi-closing-button");
    expect(buttonElement.classList).not.toContain("tedi-closing-button--small");
  });

  it("should render small icon with 18px ", () => {
    fixture.componentRef.setInput("iconSize", 18);
    fixture.detectChanges();

    const icon = fixture.nativeElement.querySelector(".tedi-icon");

    expect(icon.style.getPropertyValue("--_tedi-icon-size")).toBe(
      "var(--icon-03)",
    );
  });

  it("should render the close icon by default and allow overriding it", () => {
    const icon = fixture.nativeElement.querySelector(".tedi-icon");
    expect(icon.textContent).toContain("close");

    fixture.componentRef.setInput("icon", "delete");
    fixture.detectChanges();

    expect(icon.textContent).toContain("delete");
  });

  it("should update size when input changes", () => {
    fixture.componentRef.setInput("size", "small");
    fixture.detectChanges();

    expect(buttonElement.classList).toContain("tedi-closing-button--small");
  });

  it("should name the button once through title by default", () => {
    expect(buttonElement.getAttribute("title")).toBe("Sulge");
    expect(buttonElement.hasAttribute("aria-label")).toBe(false);
    expect(
      buttonElement.querySelector(".tedi-icon")?.getAttribute("aria-hidden"),
    ).toBe("true");
  });

  it("should use ariaLabel as the title when provided", () => {
    fixture.componentRef.setInput("ariaLabel", "Eemalda");
    fixture.detectChanges();

    expect(buttonElement.getAttribute("title")).toBe("Eemalda");
    expect(buttonElement.hasAttribute("aria-label")).toBe(false);
  });

  it("should set only aria-label when showTitle=false", () => {
    fixture.componentRef.setInput("ariaLabel", "Eemalda");
    fixture.componentRef.setInput("showTitle", false);
    fixture.detectChanges();

    expect(buttonElement.hasAttribute("title")).toBe(false);
    expect(buttonElement.getAttribute("aria-label")).toBe("Eemalda");
  });

  it("should hide the closing button when printing", () => {
    expect(buttonElement.classList).toContain("no-print");
  });
});
