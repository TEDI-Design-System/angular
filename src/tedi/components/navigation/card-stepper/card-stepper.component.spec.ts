import { Component, signal } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../../tokens/translation.token";
import {
  CardStepperAllowJump,
  CardStepperComponent,
  CardStepperCounterPosition,
  CardStepperDescriptionPosition,
} from "./card-stepper.component";
import { CardStepperStepComponent } from "./card-stepper-step/card-stepper-step.component";
import { CardStepperStepContentDirective } from "./card-stepper-step/card-stepper-step-content.directive";
import { CardStepperSubStepComponent } from "./card-stepper-sub-step/card-stepper-sub-step.component";
import { ModalService } from "../../overlay/modal/modal.service";

class TranslationMock {
  translate(key: string, ...args: unknown[]) {
    return args.length ? `${key}:${args.join(",")}` : key;
  }

  track(key: string) {
    return () => key;
  }
}

@Component({
  standalone: true,
  imports: [
    CardStepperComponent,
    CardStepperStepComponent,
    CardStepperStepContentDirective,
    CardStepperSubStepComponent,
  ],
  template: `
    <tedi-card-stepper
      ariaLabel="Taotluse sammud"
      [(activeStep)]="activeStep"
      [showStepNumber]="showStepNumber()"
      [showStatusIcon]="showStatusIcon()"
      [showNavigation]="showNavigation()"
      [showProgress]="showProgress()"
      [showStepList]="showStepList()"
      [descriptionPosition]="descriptionPosition()"
      [counterPosition]="counterPosition()"
      [allowJump]="allowJump()"
    >
      <tedi-card-stepper-step label="Isikuandmed" state="completed" />
      <tedi-card-stepper-step
        label="Dokumendid"
        description="Täidab ametnik"
        [state]="secondState()"
      >
        @if (withBottomSlot()) {
          <ng-template tediCardStepperStepContent>
            <span class="bottom-slot">Loe lähemalt</span>
          </ng-template>
        }
        @if (withSubSteps()) {
          <tedi-card-stepper-sub-step label="Pass" state="completed" />
          <tedi-card-stepper-sub-step label="Foto" current />
        }
      </tedi-card-stepper-step>
      <tedi-card-stepper-step label="Puudub" [disabled]="true" />
      @if (withLastStep()) {
        <tedi-card-stepper-step label="Ülevaade" />
      }
    </tedi-card-stepper>
  `,
})
class TestHostComponent {
  activeStep = signal(1);
  showStepNumber = signal(true);
  showStatusIcon = signal(false);
  showNavigation = signal(false);
  showProgress = signal(true);
  showStepList = signal(true);
  withBottomSlot = signal(false);
  withSubSteps = signal(false);
  withLastStep = signal(true);
  secondState = signal<"default" | "completed" | "error">("default");
  descriptionPosition = signal<CardStepperDescriptionPosition>("bottom");
  counterPosition = signal<CardStepperCounterPosition>("inline");
  allowJump = signal<CardStepperAllowJump>(true);
}

describe("CardStepperComponent", () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;
  let documentRef: Document;

  function query(selector: string): HTMLElement | null {
    return fixture.nativeElement.querySelector(selector);
  }

  function queryAll(selector: string): HTMLElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll(selector));
  }

  function queryModal(selector: string): HTMLElement | null {
    return documentRef.body.querySelector(selector);
  }

  function queryAllModal(selector: string): HTMLElement[] {
    return Array.from(documentRef.body.querySelectorAll(selector));
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
    documentRef = TestBed.inject(DOCUMENT);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it("should expose the card as a labelled group", () => {
    const card = query("tedi-card-stepper")!;

    expect(card.getAttribute("role")).toBe("group");
    expect(card.getAttribute("aria-label")).toBe("Taotluse sammud");
  });

  it("should render only the active step on the card", () => {
    expect(query(".tedi-card-stepper__title")?.textContent?.trim()).toContain(
      "Dokumendid",
    );
    expect(query(".tedi-card-stepper__indicator")?.textContent?.trim()).toBe(
      "2",
    );
  });

  it("should render the counter visibly and spell it out for screen readers", () => {
    const counter = query(".tedi-card-stepper__counter")!;

    expect(counter.querySelector("[aria-hidden]")?.textContent?.trim()).toBe(
      "2 / 4",
    );
    expect(counter.querySelector(".sr-only")?.textContent).toContain(
      "card-stepper.status:2,4",
    );
  });

  it("should render one progress segment per step, filled up to the active one", () => {
    const segments = queryAll(".tedi-card-stepper__segment");
    const done = queryAll(".tedi-card-stepper__segment--done");

    expect(segments.length).toBe(4);
    expect(done.length).toBe(2);
  });

  it("should hide the progress bar when asked", () => {
    host.showProgress.set(false);
    fixture.detectChanges();

    expect(query(".tedi-card-stepper__progress")).toBeNull();
  });

  it("should drop the step number when asked", () => {
    host.showStepNumber.set(false);
    fixture.detectChanges();

    expect(query(".tedi-card-stepper__indicator")).toBeNull();
    expect(query(".tedi-card-stepper__main")?.classList).toContain(
      "tedi-card-stepper__main--no-lead",
    );
  });

  it("should move the counter above the label", () => {
    host.counterPosition.set("top");
    fixture.detectChanges();

    expect(
      query(".tedi-card-stepper__top .tedi-card-stepper__counter"),
    ).toBeTruthy();
    expect(
      query(".tedi-card-stepper__trail .tedi-card-stepper__counter"),
    ).toBeNull();
  });

  it("should move the counter below the label and out of the controls", () => {
    host.counterPosition.set("bottom");
    fixture.detectChanges();

    expect(
      query(".tedi-card-stepper__body .tedi-card-stepper__counter"),
    ).toBeTruthy();
    expect(
      query(".tedi-card-stepper__trail .tedi-card-stepper__counter"),
    ).toBeNull();
  });

  it("should move the description above the label", () => {
    host.descriptionPosition.set("top");
    fixture.detectChanges();

    expect(
      query(".tedi-card-stepper__top .tedi-card-stepper__description"),
    ).toBeTruthy();
  });

  it("should announce the status icon", () => {
    host.showStatusIcon.set(true);
    host.secondState.set("completed");
    fixture.detectChanges();

    expect(query(".tedi-card-stepper__status-icon")).toBeTruthy();
    expect(query(".tedi-card-stepper__title .sr-only")?.textContent).toContain(
      "vertical-stepper.completed",
    );
  });

  it("should project the step's bottom content only for the active step", () => {
    host.withBottomSlot.set(true);
    fixture.detectChanges();

    expect(query(".tedi-card-stepper__bottom-slot .bottom-slot")).toBeTruthy();

    host.activeStep.set(0);
    fixture.detectChanges();

    expect(query(".tedi-card-stepper__bottom-slot")).toBeNull();
  });

  it("should announce the active step in a live region", () => {
    const status = query('[role="status"]');

    expect(status?.getAttribute("aria-live")).toBe("polite");
    expect(status?.getAttribute("aria-atomic")).toBe("true");
    expect(status?.textContent?.trim()).toBe("card-stepper.status:2,4");

    host.activeStep.set(3);
    fixture.detectChanges();

    expect(query('[role="status"]')?.textContent?.trim()).toBe(
      "card-stepper.status:4,4",
    );
  });

  describe("activeStep clamping", () => {
    it("should clamp an index past the last step back into the model", () => {
      host.activeStep.set(99);
      fixture.detectChanges();

      expect(host.activeStep()).toBe(3);
      expect(query(".tedi-card-stepper__title")?.textContent?.trim()).toBe(
        "Ülevaade",
      );
    });

    it("should clamp the model down when the step count shrinks", () => {
      host.activeStep.set(3);
      fixture.detectChanges();
      expect(host.activeStep()).toBe(3);

      host.withLastStep.set(false);
      fixture.detectChanges();

      expect(host.activeStep()).toBe(2);
    });

    it("should fold a fractional index onto a real step", () => {
      host.activeStep.set(1.5);
      fixture.detectChanges();

      expect(host.activeStep()).toBe(1);
      expect(query(".tedi-card-stepper__title")?.textContent?.trim()).toBe(
        "Dokumendid",
      );
    });

    it("should fall back to the first step for a non-finite index", () => {
      host.activeStep.set(Number.NaN);
      fixture.detectChanges();

      expect(host.activeStep()).toBe(0);
      expect(query(".tedi-card-stepper__title")?.textContent?.trim()).toBe(
        "Isikuandmed",
      );
    });

    it("should clamp a negative index back into the model", () => {
      host.activeStep.set(-5);
      fixture.detectChanges();

      expect(host.activeStep()).toBe(0);
      expect(query(".tedi-card-stepper__title")?.textContent?.trim()).toBe(
        "Isikuandmed",
      );
    });
  });

  describe("navigation arrows", () => {
    beforeEach(() => {
      host.showNavigation.set(true);
      fixture.detectChanges();
    });

    it("should replace the step number with the back arrow", () => {
      expect(query(".tedi-card-stepper__indicator")).toBeNull();
      expect(query(".tedi-card-stepper__nav-previous")).toBeTruthy();
    });

    it("should step backwards", () => {
      query(".tedi-card-stepper__nav-previous")?.click();
      fixture.detectChanges();

      expect(host.activeStep()).toBe(0);
    });

    it("should skip disabled steps when stepping forwards", () => {
      query(".tedi-card-stepper__nav-next")?.click();
      fixture.detectChanges();

      expect(host.activeStep()).toBe(3);
    });

    it("should keep a disabled step unreachable from both the arrows and the list", async () => {
      host.activeStep.set(1);
      fixture.detectChanges();

      // "Puudub" sits at index 2 with [disabled]="true".
      query(".tedi-card-stepper__nav-next")?.click();
      fixture.detectChanges();

      expect(host.activeStep()).toBe(3);

      query('[aria-haspopup="dialog"]')!.click();
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(
        queryAllModal("tedi-vertical-stepper-item")[2].querySelector(
          "button,a",
        ),
      ).toBeNull();
    });

    it("should disable the arrows at the ends", () => {
      host.activeStep.set(0);
      fixture.detectChanges();

      expect(
        (query(".tedi-card-stepper__nav-previous") as HTMLButtonElement)
          .disabled,
      ).toBe(true);

      host.activeStep.set(3);
      fixture.detectChanges();

      expect(
        (query(".tedi-card-stepper__nav-next") as HTMLButtonElement).disabled,
      ).toBe(true);
    });
  });

  describe("step list", () => {
    // The list is a service-opened dialog now, so it only exists once asked for.
    async function openList(): Promise<void> {
      query('[aria-haspopup="dialog"]')!.click();
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();
    }

    function listItems(): HTMLElement[] {
      return queryAllModal("tedi-vertical-stepper-item");
    }

    it("should not render the list before it is asked for", () => {
      expect(queryModal("tedi-card-stepper-list-modal")).toBeNull();
    });

    it("should list every step once opened", async () => {
      await openList();

      expect(listItems().length).toBe(4);
    });

    it("should mark the active step as current and disabled steps as disabled", async () => {
      await openList();

      expect(listItems()[1].classList).toContain(
        "tedi-vertical-stepper-item--current",
      );
      expect(listItems()[2].classList).toContain(
        "tedi-vertical-stepper-item--disabled",
      );
    });

    it("should jump to a step and close the list", async () => {
      const openButton = query('[aria-haspopup="dialog"]')!;
      await openList();

      expect(openButton.getAttribute("aria-expanded")).toBe("true");

      listItems()[3].querySelector("button")?.click();
      await new Promise((resolve) => setTimeout(resolve, 0));
      fixture.detectChanges();

      expect(host.activeStep()).toBe(3);
      expect(openButton.getAttribute("aria-expanded")).toBe("false");
      expect(queryModal("tedi-card-stepper-list-modal")).toBeNull();
    });

    it("should make no step navigable when jumping is off", async () => {
      host.allowJump.set(false);
      fixture.detectChanges();
      await openList();

      expect(
        queryAllModal(
          "tedi-vertical-stepper-item .tedi-vertical-stepper-item__link",
        ).length,
      ).toBe(0);
    });

    it("should only offer completed steps when jumping is restricted", async () => {
      host.allowJump.set("completed");
      fixture.detectChanges();
      await openList();

      const links = queryAllModal(
        "tedi-vertical-stepper-item .tedi-vertical-stepper-item__link",
      );

      expect(links.length).toBe(1);
      expect(links[0].textContent).toContain("Isikuandmed");
    });

    it("should leave sub-steps without a target as plain text", async () => {
      host.withSubSteps.set(true);
      fixture.detectChanges();
      await openList();

      const subItems = queryAllModal("tedi-vertical-stepper-sub-item");

      expect(subItems.length).toBe(2);
      expect(
        subItems.every((item) => item.querySelector("button, a") === null),
      ).toBe(true);
    });

    it("should defer current to a sub-step that claims it", async () => {
      host.withSubSteps.set(true);
      fixture.detectChanges();
      await openList();

      expect(listItems()[1].classList).not.toContain(
        "tedi-vertical-stepper-item--current",
      );
    });

    it("should drop the list button when disabled", () => {
      host.showStepList.set(false);
      fixture.detectChanges();

      expect(query('[aria-haspopup="dialog"]')).toBeNull();
    });
  });
});

@Component({
  standalone: true,
  imports: [CardStepperComponent, CardStepperStepComponent],
  template: `
    <tedi-card-stepper ariaLabel="Sammud">
      <tedi-card-stepper-step label="Isikuandmed" />
      <tedi-card-stepper-step label="Ülevaade" />
    </tedi-card-stepper>
  `,
})
class InsideServiceModalComponent {}

describe("CardStepperComponent inside a service-opened modal", () => {
  let documentRef: Document;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    });
    documentRef = TestBed.inject(DOCUMENT);
    TestBed.inject(ModalService).open(InsideServiceModalComponent, {});
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  it("should open the step list as its own dialog, not the surrounding one", async () => {
    expect(
      documentRef.body.querySelector("tedi-card-stepper-list-modal"),
    ).toBeNull();

    (
      documentRef.body.querySelector('[aria-haspopup="dialog"]') as HTMLElement
    ).click();
    await new Promise((resolve) => setTimeout(resolve, 50));

    const list = documentRef.body.querySelector(
      "tedi-card-stepper-list-modal",
    )!;

    expect(list).toBeTruthy();
    expect(list.querySelectorAll("tedi-vertical-stepper-item").length).toBe(2);
  });
});

@Component({
  standalone: true,
  imports: [CardStepperComponent],
  template: `<tedi-card-stepper ariaLabel="Tühi" />`,
})
class EmptyHostComponent {}

describe("CardStepperComponent without steps", () => {
  let fixture: ComponentFixture<EmptyHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(EmptyHostComponent);
  });

  it("should render nothing rather than throw", () => {
    expect(() => fixture.detectChanges()).not.toThrow();
    expect(
      fixture.nativeElement.querySelector(".tedi-card-stepper__main"),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelector(".tedi-card-stepper__title"),
    ).toBeNull();
  });

  it("should leave the bound index alone when there is nothing to clamp to", () => {
    fixture.detectChanges();
    const stepper = fixture.debugElement.children[0]
      .componentInstance as CardStepperComponent;

    expect(stepper.activeStep()).toBe(0);
  });
});

@Component({
  standalone: true,
  imports: [CardStepperComponent, CardStepperStepComponent],
  template: `
    @if (show()) {
      <tedi-card-stepper ariaLabel="Sammud">
        <tedi-card-stepper-step label="Isikuandmed" />
        <tedi-card-stepper-step label="Dokumendid" />
      </tedi-card-stepper>
    }
  `,
})
class DestroyableHostComponent {
  show = signal(true);
}

describe("CardStepperComponent destroyed with the step list open", () => {
  let fixture: ComponentFixture<DestroyableHostComponent>;
  let documentRef: Document;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestroyableHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();
    documentRef = TestBed.inject(DOCUMENT);
    fixture = TestBed.createComponent(DestroyableHostComponent);
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector(
        '[aria-haspopup="dialog"]',
      ) as HTMLElement
    ).click();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  async function destroyStepper() {
    fixture.componentInstance.show.set(false);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  it("should close the dialog instead of stranding it", async () => {
    expect(
      documentRef.body.querySelector("tedi-card-stepper-list-modal"),
    ).toBeTruthy();

    await destroyStepper();

    expect(
      documentRef.body.querySelector("tedi-card-stepper-list-modal"),
    ).toBeNull();
  });

  it("should remove the page-blocking backdrop", async () => {
    expect(documentRef.body.querySelector(".tedi-modal-backdrop")).toBeTruthy();

    await destroyStepper();

    expect(documentRef.body.querySelector(".tedi-modal-backdrop")).toBeNull();
  });
});

@Component({
  standalone: true,
  imports: [
    CardStepperComponent,
    CardStepperStepComponent,
    CardStepperSubStepComponent,
  ],
  template: `
    <tedi-card-stepper
      [(activeStep)]="activeStep"
      [allowJump]="allowJump()"
      ariaLabel="Sammud"
    >
      @if (withFirst()) {
        <tedi-card-stepper-step label="Esimene" />
      }
      <tedi-card-stepper-step label="Teine" />
      <tedi-card-stepper-step label="Kolmas" expanded>
        <tedi-card-stepper-sub-step
          label="Alam üks"
          labelAs="button"
          (subStepSelect)="picked.set('Alam üks')"
        />
        <tedi-card-stepper-sub-step
          label="Alam kaks"
          labelAs="button"
          [disabled]="subStepsDisabled()"
          (subStepSelect)="picked.set('Alam kaks')"
        />
      </tedi-card-stepper-step>
    </tedi-card-stepper>
  `,
})
class StaleSelectionHostComponent {
  activeStep = signal(0);
  withFirst = signal(true);
  picked = signal<string | null>(null);
  subStepsDisabled = signal(false);
  allowJump = signal<CardStepperAllowJump>(true);
}

describe("CardStepperComponent when the steps change while the list is open", () => {
  let fixture: ComponentFixture<StaleSelectionHostComponent>;
  let host: StaleSelectionHostComponent;
  let documentRef: Document;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaleSelectionHostComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
      ],
    }).compileComponents();
    documentRef = TestBed.inject(DOCUMENT);
    fixture = TestBed.createComponent(StaleSelectionHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();

    (
      fixture.nativeElement.querySelector(
        '[aria-haspopup="dialog"]',
      ) as HTMLElement
    ).click();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 50));

    // The dialog now lists Esimene / Teine / Kolmas; drop the first one.
    host.withFirst.set(false);
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 20));
  });

  async function clickInList(label: string) {
    const control = Array.from(
      documentRef.body.querySelectorAll("tedi-card-stepper-list-modal button"),
    ).find((button) => button.textContent?.includes(label)) as HTMLElement;
    expect(control).toBeTruthy();
    control.click();
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  function title() {
    return fixture.nativeElement
      .querySelector(".tedi-card-stepper__title")
      ?.textContent?.trim();
  }

  it("should select the step the user clicked, not the one now at that index", async () => {
    await clickInList("Teine");

    expect(title()).toBe("Teine");
  });

  it("should ignore a step that disappeared while the list was open", async () => {
    // Move off index 0 first, so resolving the stale index would be visible.
    host.activeStep.set(1);
    fixture.detectChanges();
    expect(title()).toBe("Kolmas");

    await clickInList("Esimene");

    expect(title()).toBe("Kolmas");
  });

  it("should emit for the sub-step the user clicked", async () => {
    await clickInList("Alam kaks");

    expect(host.picked()).toBe("Alam kaks");
  });

  it("should not emit for a sub-step disabled while the list was open", async () => {
    host.subStepsDisabled.set(true);
    fixture.detectChanges();

    await clickInList("Alam kaks");

    expect(host.picked()).toBeNull();
  });

  it("should not navigate to a step allowJump no longer permits", async () => {
    // "Kolmas" is not completed, so `completed` excludes it.
    host.allowJump.set("completed");
    fixture.detectChanges();

    await clickInList("Kolmas");

    expect(title()).toBe("Teine");
  });
});
