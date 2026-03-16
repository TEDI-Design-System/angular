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

    expect(icon.classList).toContain("tedi-icon--size-18");
  });

  it("should update size when input changes", () => {
    fixture.componentRef.setInput("size", "small");
    fixture.detectChanges();

    expect(buttonElement.classList).toContain("tedi-closing-button--small");
  });

  it("should have default title and aria-label as 'Sulge'", () => {
    expect(buttonElement.getAttribute("title")).toBe("Sulge");
    expect(buttonElement.getAttribute("aria-label")).toBe("Sulge");
  });

  it("should override default aria-label when provided", () => {
    fixture.componentRef.setInput("ariaLabel", "Eemalda");
    fixture.detectChanges();

    expect(buttonElement.getAttribute("title")).toBe("Eemalda");
    expect(buttonElement.getAttribute("aria-label")).toBe("Eemalda");
  });
});
