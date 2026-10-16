import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { DropdownItemValueComponent } from "./dropdown-item-value.component";

describe("DropdownItemValueComponent", () => {
  let fixture: ComponentFixture<DropdownItemValueComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DropdownItemValueComponent],
    });

    fixture = TestBed.createComponent(DropdownItemValueComponent);
    fixture.detectChanges();
  });

  it("should create component", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("should render a presentational, aria-hidden, non-focusable checkbox", () => {
    fixture.componentRef.setInput("type", "checkbox");
    fixture.detectChanges();

    const input = fixture.debugElement.query(
      By.css(".tedi-dropdown-item-value__checkbox"),
    ).nativeElement as HTMLInputElement;

    expect(input.getAttribute("aria-hidden")).toBe("true");
    expect(input.hasAttribute("inert")).toBe(true);
  });

  it("should render a presentational, aria-hidden, non-focusable radio", () => {
    fixture.componentRef.setInput("type", "radio");
    fixture.detectChanges();

    const input = fixture.debugElement.query(
      By.css(".tedi-dropdown-item-value__radio"),
    ).nativeElement as HTMLInputElement;

    expect(input.getAttribute("aria-hidden")).toBe("true");
    expect(input.hasAttribute("inert")).toBe(true);
  });

  describe("icon", () => {
    const getIcon = () =>
      fixture.debugElement.query(By.css(".tedi-icon"))?.nativeElement as
        HTMLElement | undefined;

    it("renders no icon by default", () => {
      expect(getIcon()).toBeUndefined();
    });

    it("renders a named icon at 16px in the secondary colour", () => {
      fixture.componentRef.setInput("icon", "download");
      fixture.detectChanges();

      const icon = getIcon()!;
      expect(icon.textContent?.trim()).toBe("download");
      expect(icon.classList).toContain("tedi-icon--color-secondary");
      expect(icon.style.getPropertyValue("--_tedi-icon-size")).toBe(
        "var(--icon-02)",
      );
      expect(fixture.componentInstance.resolvedIcon()).toEqual({
        name: "download",
        size: 16,
        color: "secondary",
      });
    });

    it("lets an icon object override the defaults", () => {
      fixture.componentRef.setInput("icon", {
        name: "delete",
        size: 18,
        color: "danger",
      });
      fixture.detectChanges();

      expect(getIcon()!.classList).toContain("tedi-icon--color-danger");
      expect(fixture.componentInstance.resolvedIcon()).toEqual({
        name: "delete",
        size: 18,
        color: "danger",
      });
    });
  });
});
