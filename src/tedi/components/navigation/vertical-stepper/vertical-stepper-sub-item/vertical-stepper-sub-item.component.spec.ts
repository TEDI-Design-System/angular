import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";
import {
  VerticalStepperSubItemComponent,
  VerticalStepperSubItemState,
} from "./vertical-stepper-sub-item.component";
import { VerticalStepperLabelElement } from "../vertical-stepper-item/vertical-stepper-item.component";

class TranslationMock {
  translate(key: string) {
    return key;
  }

  track(key: string) {
    return () => key;
  }
}

@Component({
  standalone: true,
  imports: [VerticalStepperSubItemComponent],
  template: `
    <tedi-vertical-stepper-sub-item
      [label]="label()"
      [state]="state()"
      [current]="current()"
      [href]="href()"
      [labelAs]="elementType()"
      (stepSelect)="selected = selected + 1"
    >
      @if (withEndSlot()) {
        <span class="end-slot">Probleem puudub</span>
      }
    </tedi-vertical-stepper-sub-item>
  `,
})
class TestHostComponent {
  label = signal("Sõbrad");
  state = signal<VerticalStepperSubItemState>("default");
  current = signal(false);
  href = signal<string | undefined>(undefined);
  elementType = signal<VerticalStepperLabelElement | undefined>(undefined);
  withEndSlot = signal(false);
  selected = 0;
}

describe("VerticalStepperSubItemComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  function getSubItem(): HTMLElement {
    return fixture.nativeElement.querySelector(
      "tedi-vertical-stepper-sub-item",
    );
  }

  function query(selector: string): HTMLElement | null {
    return getSubItem().querySelector(selector);
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create as a list item with a dot", () => {
    expect(getSubItem().getAttribute("role")).toBe("listitem");
    expect(query(".tedi-vertical-stepper-sub-item__dot")).toBeTruthy();
    expect(
      query(".tedi-vertical-stepper-sub-item__indicator")?.getAttribute(
        "aria-hidden",
      ),
    ).toBe("true");
  });

  it("should keep an anchor without a destination non-interactive", () => {
    host.elementType.set("a");
    host.current.set(true);
    fixture.detectChanges();

    expect(query(".tedi-vertical-stepper-sub-item__link")).toBeNull();
    expect(getSubItem().getAttribute("aria-current")).toBe("step");

    host.href.set("");
    fixture.detectChanges();
    expect(
      query("a.tedi-vertical-stepper-sub-item__link")?.getAttribute("href"),
    ).toBe("");
  });

  it("should render an anchor when href is set", () => {
    host.href.set("#sub");
    fixture.detectChanges();

    expect(
      query("a.tedi-vertical-stepper-sub-item__link")?.getAttribute("href"),
    ).toBe("#sub");
  });

  it("should emit stepSelect when activated", () => {
    host.elementType.set("button");
    fixture.detectChanges();

    query("button.tedi-vertical-stepper-sub-item__link")?.click();

    expect(host.selected).toBe(1);
  });

  it.each(["disabled", "informative"] as const)(
    "should render %s sub-steps as plain text",
    (state) => {
      host.elementType.set("button");
      host.state.set(state);
      fixture.detectChanges();

      expect(query(".tedi-vertical-stepper-sub-item__link")).toBeNull();
      expect(getSubItem().classList).toContain(
        `tedi-vertical-stepper-sub-item--${state}`,
      );
    },
  );

  it("should announce the disabled state", () => {
    host.state.set("disabled");
    fixture.detectChanges();

    expect(query(".sr-only")?.textContent).toContain(
      "vertical-stepper.disabled",
    );
  });

  it("should put aria-current on the link when interactive", () => {
    host.href.set("#sub");
    host.current.set(true);
    fixture.detectChanges();

    expect(
      query(".tedi-vertical-stepper-sub-item__link")?.getAttribute(
        "aria-current",
      ),
    ).toBe("step");
    expect(getSubItem().getAttribute("aria-current")).toBeNull();
  });

  it("should put aria-current on the sub-item itself when not interactive", () => {
    host.current.set(true);
    fixture.detectChanges();

    expect(getSubItem().getAttribute("aria-current")).toBe("step");
  });

  it.each([
    ["completed", "check"],
    ["error", "error"],
  ] as const)("should show the %s icon after the label", (state, icon) => {
    host.state.set(state);
    fixture.detectChanges();

    expect(
      query(".tedi-vertical-stepper-sub-item__label-icon")?.textContent?.trim(),
    ).toBe(icon);
  });

  it("should project extra content into the end slot", () => {
    host.withEndSlot.set(true);
    fixture.detectChanges();

    expect(
      query(".tedi-vertical-stepper-sub-item__end .end-slot")?.textContent,
    ).toBe("Probleem puudub");
  });
});
