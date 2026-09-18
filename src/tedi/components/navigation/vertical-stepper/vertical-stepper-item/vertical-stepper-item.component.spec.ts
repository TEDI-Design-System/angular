import { Component, signal } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../../tokens/translation.token";
import {
  VerticalStepperItemComponent,
  VerticalStepperLabelElement,
  VerticalStepperItemState,
} from "./vertical-stepper-item.component";
import { VerticalStepperSubItemComponent } from "../vertical-stepper-sub-item/vertical-stepper-sub-item.component";
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
  imports: [
    VerticalStepperComponent,
    VerticalStepperItemComponent,
    VerticalStepperSubItemComponent,
  ],
  template: `
    <tedi-vertical-stepper [compact]="compact()">
      <tedi-vertical-stepper-item
        [label]="label()"
        [description]="description()"
        [state]="state()"
        [current]="current()"
        [href]="href()"
        [labelAs]="elementType()"
        [(open)]="open"
        (stepSelect)="selected = selected + 1"
      >
        @if (withSubItems()) {
          <tedi-vertical-stepper-sub-item label="Sõbrad" />
        }
        @if (withWrappedSubItem()) {
          <div class="wrapper">
            <tedi-vertical-stepper-sub-item label="Pere" />
          </div>
        }
        @if (withEndSlot()) {
          <span class="end-slot">Täidab ametnik</span>
        }
      </tedi-vertical-stepper-item>
      <tedi-vertical-stepper-item label="Viimane" />
    </tedi-vertical-stepper>
  `,
})
class TestHostComponent {
  label = signal("Tahteavaldus");
  description = signal<string | undefined>(undefined);
  state = signal<VerticalStepperItemState>("default");
  current = signal(false);
  href = signal<string | undefined>(undefined);
  elementType = signal<VerticalStepperLabelElement | undefined>(undefined);
  compact = signal(false);
  withSubItems = signal(false);
  withWrappedSubItem = signal(false);
  withEndSlot = signal(false);
  open = signal(false);
  selected = 0;
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

  it("should render plain text without href or labelAs", () => {
    expect(query(".tedi-vertical-stepper-item__label-text")?.textContent).toBe(
      "Tahteavaldus",
    );
    expect(query(".tedi-vertical-stepper-item__link")).toBeNull();
  });

  it("should keep an anchor without a destination non-interactive", () => {
    host.elementType.set("a");
    host.current.set(true);
    fixture.detectChanges();

    expect(query(".tedi-vertical-stepper-item__link")).toBeNull();
    expect(getItem().getAttribute("aria-current")).toBe("step");

    host.href.set("");
    fixture.detectChanges();
    expect(
      query("a.tedi-vertical-stepper-item__link")?.getAttribute("href"),
    ).toBe("");
  });

  it("should render an anchor when href is set", () => {
    host.href.set("#step");
    fixture.detectChanges();

    const link = query("a.tedi-vertical-stepper-item__link");

    expect(link?.getAttribute("href")).toBe("#step");
  });

  it("should render a button when labelAs is button", () => {
    host.elementType.set("button");
    fixture.detectChanges();

    expect(query("button.tedi-vertical-stepper-item__link")).toBeTruthy();
  });

  it("should emit stepSelect when the label is activated", () => {
    host.elementType.set("button");
    fixture.detectChanges();

    query("button.tedi-vertical-stepper-item__link")?.click();

    expect(host.selected).toBe(1);
  });

  it("should render disabled labels as text regardless of labelAs", () => {
    host.elementType.set("button");
    host.state.set("disabled");
    fixture.detectChanges();

    expect(query(".tedi-vertical-stepper-item__link")).toBeNull();
    expect(getItem().classList).toContain(
      "tedi-vertical-stepper-item--disabled",
    );
    expect(query(".sr-only")?.textContent).toContain(
      "vertical-stepper.disabled",
    );
  });

  it("should put aria-current on the link when interactive", () => {
    host.href.set("#step");
    host.current.set(true);
    fixture.detectChanges();

    expect(
      query(".tedi-vertical-stepper-item__link")?.getAttribute("aria-current"),
    ).toBe("step");
    expect(getItem().getAttribute("aria-current")).toBeNull();
  });

  it("should put aria-current on the item itself when not interactive", () => {
    host.current.set(true);
    fixture.detectChanges();

    expect(getItem().getAttribute("aria-current")).toBe("step");
  });

  it("should render the description", () => {
    host.description.set("Ülevaatamine võtab kuni 30 päeva");
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

  it("should include status text in compact links", () => {
    host.compact.set(true);
    host.state.set("completed");
    host.href.set("#step");
    fixture.detectChanges();

    const link = query(".tedi-vertical-stepper-item__link");

    expect(link?.textContent).toContain("vertical-stepper.completed");
    expect(
      query(".tedi-vertical-stepper-item__indicator tedi-icon")?.getAttribute(
        "aria-hidden",
      ),
    ).toBe("true");
  });

  it("should include status text and hide the decorative icon", () => {
    host.state.set("completed");
    host.href.set("#step");
    fixture.detectChanges();

    const link = query(".tedi-vertical-stepper-item__link");

    expect(link?.textContent).toContain("vertical-stepper.completed");
    expect(
      query(".tedi-vertical-stepper-item__label-icon")?.getAttribute(
        "aria-hidden",
      ),
    ).toBe("true");
    expect(link?.querySelectorAll(".sr-only").length).toBe(1);
  });

  it("should show the state icon after the label at the default density", () => {
    host.state.set("completed");
    fixture.detectChanges();

    expect(query(".tedi-vertical-stepper-item__label-icon")).toBeTruthy();
    expect(
      query(".tedi-vertical-stepper-item__indicator tedi-icon"),
    ).toBeNull();
  });

  it("should move the state icon into the indicator when compact", () => {
    host.compact.set(true);
    host.state.set("completed");
    fixture.detectChanges();

    expect(
      query(".tedi-vertical-stepper-item__indicator tedi-icon"),
    ).toBeTruthy();
    expect(query(".tedi-vertical-stepper-item__label-icon")).toBeNull();
  });

  it("should place the status icon after the current compact label", () => {
    host.compact.set(true);
    host.state.set("completed");
    host.current.set(true);
    fixture.detectChanges();

    expect(
      query(".tedi-vertical-stepper-item__indicator tedi-icon"),
    ).toBeNull();
    expect(query(".tedi-vertical-stepper-item__label-icon")).toBeTruthy();
  });

  describe("sub-steps", () => {
    beforeEach(() => {
      host.withSubItems.set(true);
      fixture.detectChanges();
    });

    it("should render a toggle wired to the sub-list", () => {
      const toggle = query(".tedi-vertical-stepper-item__toggle");
      const list = query(".tedi-vertical-stepper-item__sub-list");

      expect(toggle?.getAttribute("aria-controls")).toBe(list?.id);
      expect(toggle?.getAttribute("aria-expanded")).toBe("false");
      expect(list?.hasAttribute("hidden")).toBe(true);
    });

    it("should reveal the sub-list when the toggle is pressed", () => {
      query(".tedi-vertical-stepper-item__toggle")?.click();
      fixture.detectChanges();

      expect(host.open()).toBe(true);
      expect(
        query(".tedi-vertical-stepper-item__sub-list")?.hasAttribute("hidden"),
      ).toBe(false);
      expect(getItem().classList).toContain(
        "tedi-vertical-stepper-item--expanded",
      );
    });

    it("should not render a toggle without sub-steps", () => {
      host.withSubItems.set(false);
      fixture.detectChanges();

      expect(query(".tedi-vertical-stepper-item__toggle")).toBeNull();
    });

    it("should omit the sub-list without sub-steps", () => {
      host.withSubItems.set(false);
      fixture.detectChanges();

      expect(query(".tedi-vertical-stepper-item__sub-list")).toBeNull();
    });

    it("should ignore sub-steps that are not projected directly", () => {
      host.withSubItems.set(false);
      host.withWrappedSubItem.set(true);
      fixture.detectChanges();

      expect(query(".tedi-vertical-stepper-item__toggle")).toBeNull();
      expect(query(".tedi-vertical-stepper-item__sub-list")).toBeNull();
    });
  });
});
