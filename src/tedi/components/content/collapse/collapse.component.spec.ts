import { ComponentFixture, TestBed } from "@angular/core/testing";
import { CollapseComponent } from "./collapse.component";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";

jest.mock("../../../helpers/generate-uuid", () => ({
  generateUUID: () => "mocked-random-uuid",
}));

describe("CollapseComponent", () => {
  let component: CollapseComponent;
  let fixture: ComponentFixture<CollapseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollapseComponent],
      providers: [{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" }],
    }).compileComponents();

    fixture = TestBed.createComponent(CollapseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(component).toBeTruthy();
  });

  it("should initialize with default values", () => {
    expect(component.defaultOpen()).toBe(false);
    expect(component.hideCollapseText()).toBe(false);
    expect(component.arrowType()).toBe("default");
    expect(component.isOpen()).toBe(false);
  });

  it("should toggle collapse state", () => {
    expect(component.isOpen()).toBe(false);
    component.toggleCollapse();
    expect(component.isOpen()).toBe(true);
    component.toggleCollapse();
    expect(component.isOpen()).toBe(false);
  });

  it("should set isOpen to true if defaultOpen is true", () => {
    fixture.componentRef.setInput("defaultOpen", true);
    fixture.detectChanges();

    component.ngAfterViewInit();
    expect(component.isOpen()).toBe(true);
  });

  it("forwards underline to the toggle button", () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      "button[tedi-collapse-button]",
    );
    expect(button.classList).not.toContain(
      "tedi-collapse-button--no-underline",
    );

    fixture.componentRef.setInput("underline", false);
    fixture.detectChanges();
    expect(button.classList).toContain("tedi-collapse-button--no-underline");
  });

  it("should generate a unique collapseContentId", () => {
    expect(component.collapseContentId).toBe(
      "collapse-content-mocked-random-uuid",
    );
  });

  it("should render openText when collapsed", () => {
    fixture.componentRef.setInput("openText", "Open");
    fixture.detectChanges();
    component.isOpen.set(false);

    const buttonText = fixture.nativeElement
      .querySelector(".tedi-collapse-button__text")
      .textContent.trim();

    fixture.whenStable().then(() => {
      expect(buttonText).toBe("Open");
    });
  });

  it("should render closeText when expanded", () => {
    fixture.componentRef.setInput("closeText", "Close");
    fixture.detectChanges();
    component.isOpen.set(true);

    const buttonText = fixture.nativeElement
      .querySelector(".tedi-collapse-button__text")
      .textContent.trim();

    fixture.whenStable().then(() => {
      expect(buttonText).toBe("Close");
    });
  });

  it("should hide openText and closeText when hideCollapseText is true", () => {
    fixture.componentRef.setInput("hideCollapseText", true);
    fixture.detectChanges();
    const buttonText = fixture.nativeElement.querySelector(
      ".tedi-collapse-button__text",
    );
    expect(buttonText).toBeNull();
  });

  it("should apply secondary arrow style when arrowType is 'secondary' and the collapse text is hidden", () => {
    fixture.componentRef.setInput("hideCollapseText", true);
    fixture.componentRef.setInput("arrowType", "secondary");
    fixture.detectChanges();
    const iconWrapper = fixture.nativeElement.querySelector(
      ".tedi-collapse-button__icon-wrapper",
    );
    expect(iconWrapper).toBeTruthy();
  });

  it("should not apply secondary arrow style when arrowType is 'default'", () => {
    fixture.componentRef.setInput("hideCollapseText", true);
    fixture.componentRef.setInput("arrowType", "default");
    fixture.detectChanges();
    const iconWrapper = fixture.nativeElement.querySelector(
      ".tedi-collapse-button__icon-wrapper",
    );
    expect(iconWrapper).toBeNull();
  });

  it("should render the toggle button with type='button' to avoid submitting parent forms", () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      ".tedi-collapse-button",
    );
    expect(button).toBeTruthy();
    expect(button.getAttribute("type")).toBe("button");
    expect(button.type).toBe("button");
  });

  describe("headingLevel", () => {
    const heading = () =>
      fixture.nativeElement.querySelector("h1, h2, h3, h4, h5, h6");
    const button = () =>
      fixture.nativeElement.querySelector("button[tedi-collapse-button]");

    it("renders the button on its own when headingLevel is not set", () => {
      expect(heading()).toBeNull();
      expect(button().parentElement.classList).toContain("tedi-collapse");
    });

    it.each(["h1", "h2", "h3", "h4", "h5", "h6"] as const)(
      "wraps the toggle button in an %s",
      (level) => {
        fixture.componentRef.setInput("headingLevel", level);
        fixture.componentRef.setInput("openText", "Section");
        fixture.detectChanges();

        expect(heading().tagName.toLowerCase()).toBe(level);
        expect(heading().contains(button())).toBe(true);
        expect(button().textContent).toContain("Section");
      },
    );

    it("keeps the toggle working and controlling the content", () => {
      fixture.componentRef.setInput("headingLevel", "h3");
      fixture.detectChanges();

      button().click();
      fixture.detectChanges();

      expect(component.isOpen()).toBe(true);
      expect(button().getAttribute("aria-expanded")).toBe("true");
      expect(button().getAttribute("aria-controls")).toBe(
        component.collapseContentId,
      );
    });

    it("switches the heading level and removes the heading again", () => {
      fixture.componentRef.setInput("headingLevel", "h2");
      fixture.detectChanges();
      expect(heading().tagName).toBe("H2");

      fixture.componentRef.setInput("headingLevel", "h4");
      fixture.detectChanges();
      expect(heading().tagName).toBe("H4");

      fixture.componentRef.setInput("headingLevel", undefined);
      fixture.detectChanges();
      expect(heading()).toBeNull();
      expect(button()).not.toBeNull();
    });
  });
});
