import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  IconComponent,
  IconType,
  IconColor,
  IconBackgroundColor,
} from "./icon.component";

describe("IconComponent", () => {
  let fixture: ComponentFixture<IconComponent>;
  let iconElement: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IconComponent],
    });

    fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput("name", "search");
    iconElement = fixture.nativeElement;
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render the icon with default props", () => {
    expect(iconElement.classList).toContain("material-symbols");
    expect(iconElement.classList).toContain("material-symbols--outlined");
    expect(iconElement.classList).toContain("notranslate");
    expect(iconElement.classList).toContain("tedi-icon");
    expect(iconElement.className).not.toMatch(/tedi-icon--size-/);
    expect(iconElement.classList).toContain("tedi-icon--color-primary");
    expect(iconElement.textContent?.trim()).toBe("search");
    expect(iconElement.getAttribute("role")).toBe("img");
    expect(iconElement.getAttribute("aria-hidden")).toBe("true");
  });

  it("should drive font-size from the size variable, without a size class", () => {
    const sizeTokens: Record<number, string> = {
      8: "--icon-00",
      12: "--icon-01",
      16: "--icon-02",
      18: "--icon-03",
      22: "--icon-04",
      24: "--icon-05",
      36: "--icon-06",
      48: "--icon-07",
    };

    for (const [size, token] of Object.entries(sizeTokens)) {
      fixture.componentRef.setInput("size", Number(size));
      fixture.detectChanges();

      expect(iconElement.style.getPropertyValue("--_tedi-icon-size")).toBe(
        `var(${token})`,
      );
      expect(iconElement.className).not.toMatch(/tedi-icon--size-/);
    }
  });

  it("should set the size CSS variable only when size is explicit", () => {
    expect(iconElement.style.getPropertyValue("--_tedi-icon-size")).toBe("");

    fixture.componentRef.setInput("size", 18);
    fixture.detectChanges();
    expect(iconElement.style.getPropertyValue("--_tedi-icon-size")).toBe(
      "var(--icon-03)",
    );

    fixture.componentRef.setInput("size", "inherit");
    fixture.detectChanges();
    expect(iconElement.style.getPropertyValue("--_tedi-icon-size")).toBe("");
  });

  it("should apply different icon colors", () => {
    const colors: IconColor[] = [
      "primary",
      "secondary",
      "tertiary",
      "brand",
      "brand-dark",
      "success",
      "warning",
      "warning-dark",
      "danger",
      "white",
      "inherit",
    ];

    for (const color of colors) {
      fixture.componentRef.setInput("color", color);
      fixture.detectChanges();

      expect(iconElement.classList).toContain(`tedi-icon--color-${color}`);
    }
  });

  it("should apply background styles", () => {
    const backgrounds: IconBackgroundColor[] = [
      "primary",
      "secondary",
      "brand-primary",
      "brand-secondary",
    ];

    for (const bg of backgrounds) {
      fixture.componentRef.setInput("background", bg);
      fixture.detectChanges();

      expect(iconElement.classList).toContain("tedi-icon--bg");
      expect(iconElement.classList).toContain(`tedi-icon--bg-${bg}`);
    }
  });

  it("should clamp size and set padding for background icons", () => {
    fixture.componentRef.setInput("background", "primary");

    fixture.componentRef.setInput("size", 8);
    fixture.detectChanges();
    expect(iconElement.style.getPropertyValue("--_tedi-icon-size")).toBe(
      "var(--icon-05)",
    );
    expect(iconElement.style.getPropertyValue("--_tedi-icon-bg-padding")).toBe(
      "var(--icon-background-padding-lg)",
    );
    expect(iconElement.className).not.toMatch(/tedi-icon--size-/);

    fixture.componentRef.setInput("size", "inherit");
    fixture.detectChanges();
    expect(iconElement.style.getPropertyValue("--_tedi-icon-size")).toBe(
      "var(--icon-05)",
    );

    fixture.componentRef.setInput("size", 16);
    fixture.detectChanges();
    expect(iconElement.style.getPropertyValue("--_tedi-icon-size")).toBe(
      "var(--icon-02)",
    );
    expect(iconElement.style.getPropertyValue("--_tedi-icon-bg-padding")).toBe(
      "var(--icon-background-padding-sm)",
    );
  });

  it("should apply filled variant", () => {
    fixture.componentRef.setInput("variant", "filled");
    fixture.detectChanges();

    expect(iconElement.classList).toContain("tedi-icon--filled");
  });

  it("should apply different icon types", () => {
    const types: IconType[] = ["outlined", "sharp", "rounded"];

    for (const type of types) {
      fixture.componentRef.setInput("type", type);
      fixture.detectChanges();

      expect(iconElement.classList).toContain(`material-symbols--${type}`);
    }
  });

  it("should set aria-label when label is provided", () => {
    fixture.componentRef.setInput("label", "Home icon");
    fixture.detectChanges();

    expect(iconElement.getAttribute("aria-label")).toBe("Home icon");
  });

  it("should hide from screen readers when no label is provided", () => {
    fixture.componentRef.setInput("label", undefined);
    fixture.detectChanges();

    expect(iconElement.getAttribute("aria-label")).toBeNull();
  });

  it("should handle changing icon name", () => {
    fixture.componentRef.setInput("name", "arrow_back");
    fixture.detectChanges();

    expect(iconElement.textContent?.trim()).toBe("arrow_back");
  });

  it("should handle undefined values", () => {
    expect(iconElement.classList.toString()).not.toContain("undefined");
  });
});
