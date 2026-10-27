import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";
import { VerticalStepperItemComponent } from "./vertical-stepper-item.component";
import { VerticalStepperComponent } from "../vertical-stepper.component";

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
  imports: [VerticalStepperComponent, VerticalStepperItemComponent],
  template: `
    <tedi-vertical-stepper [compact]="compact()">
      <tedi-vertical-stepper-item
        title="Tahteavaldus"
        [completed]="completed()"
        [error]="error()"
        [selected]="selected()"
        [disabled]="disabled()"
        [informative]="informative()"
        [(opened)]="opened"
        (itemSelect)="selections = selections + 1"
      >
        @if (withDescription()) {
          <span item-description>Ülevaatamine võtab kuni 30 päeva</span>
        }
        @if (withNestedItems()) {
          <tedi-vertical-stepper-item title="Sõbrad" />
        }
        @if (withWrappedNestedItem()) {
          <div class="wrapper">
            <tedi-vertical-stepper-item title="Pere" />
          </div>
        }
        @if (withEndSlot()) {
          <span class="end-slot">Täidab ametnik</span>
        }
      </tedi-vertical-stepper-item>
      <tedi-vertical-stepper-item title="Viimane" />
    </tedi-vertical-stepper>
  `,
})
class TestHostComponent {
  completed = signal(false);
  error = signal(false);
  selected = signal(false);
  disabled = signal(false);
  informative = signal(false);
  compact = signal(false);
  withDescription = signal(false);
  withNestedItems = signal(false);
  withWrappedNestedItem = signal(false);
  withEndSlot = signal(false);
  opened = signal(false);
  selections = 0;
}

describe("VerticalStepperItemComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  function getItem(): HTMLElement {
    return fixture.nativeElement.querySelector("tedi-vertical-stepper-item");
  }

  function query(selector: string): HTMLElement | null {
    return getItem().querySelector(selector);
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

  it("should render the title as a selection button without a route", () => {
    expect(query(".tedi-vertical-stepper-item__label-text")?.textContent).toBe(
      "Tahteavaldus",
    );
    expect(query("button.tedi-vertical-stepper-item__link")).toBeTruthy();
  });

  it("should not leave the title as a native tooltip on the host", () => {
    expect(getItem().hasAttribute("title")).toBe(false);
  });

  it("should emit itemSelect when the label button is activated", () => {
    query("button.tedi-vertical-stepper-item__link")?.click();

    expect(host.selections).toBe(1);
  });

  it("should render disabled labels as text", () => {
    host.disabled.set(true);
    fixture.detectChanges();

    expect(query(".tedi-vertical-stepper-item__link")).toBeNull();
    expect(getItem().classList).toContain(
      "tedi-vertical-stepper-item--disabled",
    );
    expect(getItem().getAttribute("aria-disabled")).toBe("true");
    expect(query(".sr-only")?.textContent).toContain(
      "vertical-stepper.disabled",
    );
  });

  it("should put aria-current on the button when interactive", () => {
    host.selected.set(true);
    fixture.detectChanges();

    expect(
      query(".tedi-vertical-stepper-item__link")?.getAttribute("aria-current"),
    ).toBe("step");
    expect(getItem().classList).toContain(
      "tedi-vertical-stepper-item--selected",
    );
    expect(getItem().getAttribute("aria-current")).toBeNull();
  });

  it("should put aria-current on the item itself when not interactive", () => {
    host.informative.set(true);
    host.selected.set(true);
    fixture.detectChanges();

    expect(query(".tedi-vertical-stepper-item__link")).toBeNull();
    expect(getItem().getAttribute("aria-current")).toBe("step");
  });

  it("should project the description", () => {
    host.withDescription.set(true);
    fixture.detectChanges();

    expect(
      query(".tedi-vertical-stepper-item__description")?.textContent?.trim(),
    ).toBe("Ülevaatamine võtab kuni 30 päeva");
  });

  it("should project extra content into the end slot", () => {
    host.withEndSlot.set(true);
    fixture.detectChanges();

    expect(
      query(".tedi-vertical-stepper-item__end .end-slot")?.textContent,
    ).toBe("Täidab ametnik");
  });

  it("should prefer completed over error", () => {
    host.completed.set(true);
    host.error.set(true);
    fixture.detectChanges();

    expect(getItem().classList).toContain(
      "tedi-vertical-stepper-item--completed",
    );
    expect(getItem().classList).not.toContain(
      "tedi-vertical-stepper-item--error",
    );
  });

  it("should include status text in compact labels", () => {
    host.compact.set(true);
    host.completed.set(true);
    fixture.detectChanges();

    const link = query(".tedi-vertical-stepper-item__link");

    const status = query(".sr-only");
    expect(link?.getAttribute("aria-describedby")).toBe(status?.id);
    expect(status?.textContent).toContain("vertical-stepper.completed");
    expect(
      query(".tedi-vertical-stepper-item__indicator tedi-icon")?.getAttribute(
        "aria-hidden",
      ),
    ).toBe("true");
  });

  it("should include status text and hide the decorative icon", () => {
    host.completed.set(true);
    fixture.detectChanges();

    const link = query(".tedi-vertical-stepper-item__link");

    const status = query(".sr-only");
    expect(link?.getAttribute("aria-describedby")).toBe(status?.id);
    expect(status?.textContent).toContain("vertical-stepper.completed");
    expect(
      query(".tedi-vertical-stepper-item__label-icon")?.getAttribute(
        "aria-hidden",
      ),
    ).toBe("true");
    expect(getItem().querySelectorAll(".sr-only").length).toBe(1);
  });

  it("should show the state icon after the label at the default density", () => {
    host.completed.set(true);
    fixture.detectChanges();

    expect(query(".tedi-vertical-stepper-item__label-icon")).toBeTruthy();
    expect(
      query(".tedi-vertical-stepper-item__indicator tedi-icon"),
    ).toBeNull();
  });

  it("should move the state icon into the indicator when compact", () => {
    host.compact.set(true);
    host.completed.set(true);
    fixture.detectChanges();

    expect(
      query(".tedi-vertical-stepper-item__indicator tedi-icon"),
    ).toBeTruthy();
    expect(query(".tedi-vertical-stepper-item__label-icon")).toBeNull();
  });

  it("should place the status icon after the selected compact label", () => {
    host.compact.set(true);
    host.completed.set(true);
    host.selected.set(true);
    fixture.detectChanges();

    expect(
      query(".tedi-vertical-stepper-item__indicator tedi-icon"),
    ).toBeNull();
    expect(query(".tedi-vertical-stepper-item__label-icon")).toBeTruthy();
  });

  describe("nested items", () => {
    beforeEach(() => {
      host.withNestedItems.set(true);
      fixture.detectChanges();
    });

    it("should render a single toggle wired to the sub-list", () => {
      const toggle = query(".tedi-vertical-stepper-item__toggle");
      const list = query(".tedi-vertical-stepper-item__sub-list");

      expect(toggle?.getAttribute("aria-controls")).toBe(list?.id);
      expect(toggle?.getAttribute("aria-expanded")).toBe("false");
      expect(toggle?.getAttribute("aria-label")).toBe("Tahteavaldus");
      expect(list?.hasAttribute("hidden")).toBe(true);
      expect(
        query(
          ":scope > .tedi-vertical-stepper-item__row .tedi-vertical-stepper-item__link",
        ),
      ).toBeNull();
    });

    it("should reveal the sub-list when the toggle is pressed", () => {
      query(".tedi-vertical-stepper-item__toggle")?.click();
      fixture.detectChanges();

      expect(host.opened()).toBe(true);
      expect(
        query(".tedi-vertical-stepper-item__sub-list")?.hasAttribute("hidden"),
      ).toBe(false);
      expect(getItem().classList).toContain(
        "tedi-vertical-stepper-item--expanded",
      );
    });

    it("should not render a toggle without nested items", () => {
      host.withNestedItems.set(false);
      fixture.detectChanges();

      expect(query(".tedi-vertical-stepper-item__toggle")).toBeNull();
    });

    it("should omit the sub-list without nested items", () => {
      host.withNestedItems.set(false);
      fixture.detectChanges();

      expect(query(".tedi-vertical-stepper-item__sub-list")).toBeNull();
    });

    it("should ignore nested items that are not projected directly", () => {
      host.withNestedItems.set(false);
      host.withWrappedNestedItem.set(true);
      fixture.detectChanges();

      expect(query(".tedi-vertical-stepper-item__toggle")).toBeNull();
      expect(query(".tedi-vertical-stepper-item__sub-list")).toBeNull();
    });
  });
});
