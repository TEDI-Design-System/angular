import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { FloatingButtonComponent } from "./floating-button.component";
import { IconComponent } from "../../base/icon/icon.component";

@Component({
  standalone: true,
  imports: [FloatingButtonComponent, IconComponent],
  template: `
    <button tedi-floating-button>Jäta oma tagasiside</button>
    <button tedi-floating-button>
      Mine üles
      <tedi-icon name="arrow_upward" />
    </button>
    <button tedi-floating-button>
      <tedi-icon name="chat" />
      Vestle meiega
    </button>
    <button tedi-floating-button><tedi-icon name="arrow_upward" /></button>
  `,
})
class ContentHostComponent {}

describe("FloatingButtonComponent", () => {
  let fixture: ComponentFixture<FloatingButtonComponent>;
  let host: HTMLElement;

  const setInputs = (inputs: Record<string, unknown>) => {
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FloatingButtonComponent],
    });

    fixture = TestBed.createComponent(FloatingButtonComponent);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("renders the default variant, size and axis classes", () => {
    expect(host.classList).toContain("tedi-ready-floating-button");
    expect(host.classList).toContain("tedi-ready-floating-button--primary");
    expect(host.classList).toContain("tedi-ready-floating-button--default");
    expect(host.classList).toContain("tedi-ready-floating-button--horizontal");
  });

  it.each([
    ["variant", "secondary", "tedi-ready-floating-button--secondary"],
    ["size", "large", "tedi-ready-floating-button--large"],
    ["axis", "vertical", "tedi-ready-floating-button--vertical"],
  ])("applies %s=%s as a modifier class", (input, value, expected) => {
    setInputs({ [input]: value });

    expect(host.classList).toContain(expected);
  });

  it("uses fixed positioning by default", () => {
    expect(host.style.position).toBe("fixed");
  });

  it("supports static positioning", () => {
    setInputs({ position: "static" });

    expect(host.style.position).toBe("static");
  });

  it("sets no placement offsets until a placement is given", () => {
    expect(host.style.top).toBe("");
    expect(host.style.bottom).toBe("");
    expect(host.style.left).toBe("");
    expect(host.style.right).toBe("");
  });

  it.each([
    { vertical: "center", horizontal: "center" },
    { vertical: "bottom", horizontal: "right" },
  ])(
    "clears placement styles in static mode and restores them in fixed mode: %o",
    (placement) => {
      setInputs({ placement, offset: { bottom: 24, right: "1.5rem" } });
      const properties = [
        "top",
        "bottom",
        "left",
        "right",
        "translate",
      ] as const;
      const positionedStyles = properties.map(
        (property) => host.style[property],
      );

      setInputs({ position: "static" });

      for (const property of properties) {
        expect(host.style[property]).toBe("");
      }

      setInputs({ position: "fixed" });

      expect(properties.map((property) => host.style[property])).toEqual(
        positionedStyles,
      );
    },
  );

  it.each([
    ["top", "left"],
    ["top", "right"],
    ["bottom", "left"],
    ["bottom", "right"],
  ] as const)("pins the button %s %s", (vertical, horizontal) => {
    setInputs({ placement: { vertical, horizontal } });

    expect(host.style[vertical]).toBe("0px");
    expect(host.style[horizontal]).toBe("0px");
  });

  it("applies numeric offsets as pixels and string offsets verbatim", () => {
    setInputs({
      placement: { vertical: "bottom", horizontal: "right" },
      offset: { bottom: 24, right: "1.5rem" },
    });

    expect(host.style.bottom).toBe("24px");
    expect(host.style.right).toBe("1.5rem");
  });

  it("ignores offsets for edges the placement does not pin", () => {
    setInputs({
      placement: { vertical: "bottom", horizontal: "right" },
      offset: { top: 24, left: 24 },
    });

    expect(host.style.top).toBe("");
    expect(host.style.left).toBe("");
    expect(host.style.bottom).toBe("0px");
  });

  it("leaves translate unset when nothing is centered", () => {
    setInputs({ placement: { vertical: "bottom", horizontal: "right" } });

    expect(host.style.translate).toBe("");
  });

  it("sets vertical centering styles with the vertical axis selected", () => {
    setInputs({
      axis: "vertical",
      placement: { vertical: "center", horizontal: "right" },
    });

    expect(host.style.top).toBe("50%");
    expect(host.style.translate).toBe("0 -50%");
    expect(host.classList).toContain("tedi-ready-floating-button--vertical");
  });

  it("centers horizontally through the same property", () => {
    setInputs({ placement: { vertical: "bottom", horizontal: "center" } });

    expect(host.style.left).toBe("50%");
    expect(host.style.translate).toBe("-50% 0");
  });

  it("centers on both axes at once", () => {
    setInputs({ placement: { vertical: "center", horizontal: "center" } });

    expect(host.style.translate).toBe("-50% -50%");
  });

  it("applies a z-index when given", () => {
    setInputs({ zIndex: 10 });

    expect(host.style.zIndex).toBe("10");
  });

  describe("content-driven classes", () => {
    let contentFixture: ComponentFixture<ContentHostComponent>;
    let buttons: HTMLElement[];

    beforeEach(() => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({ imports: [ContentHostComponent] });

      contentFixture = TestBed.createComponent(ContentHostComponent);
      contentFixture.detectChanges();
      buttons = contentFixture.debugElement
        .queryAll(By.css("[tedi-floating-button]"))
        .map((element) => element.nativeElement as HTMLElement);
    });

    it("pads both sides of a text-only button", () => {
      expect(buttons[0].classList).toContain("tedi-ready-floating-button--pl");
      expect(buttons[0].classList).toContain("tedi-ready-floating-button--pr");
      expect(buttons[0].classList).not.toContain(
        "tedi-ready-floating-button--icon-only",
      );
    });

    it("drops the trailing pad when an icon comes last", () => {
      expect(buttons[1].classList).toContain("tedi-ready-floating-button--pl");
      expect(buttons[1].classList).not.toContain(
        "tedi-ready-floating-button--pr",
      );
    });

    it("drops the leading pad when an icon comes first", () => {
      expect(buttons[2].classList).not.toContain(
        "tedi-ready-floating-button--pl",
      );
      expect(buttons[2].classList).toContain("tedi-ready-floating-button--pr");
    });

    it("marks a lone icon as icon-only", () => {
      expect(buttons[3].classList).toContain(
        "tedi-ready-floating-button--icon-only",
      );
    });
  });
});
