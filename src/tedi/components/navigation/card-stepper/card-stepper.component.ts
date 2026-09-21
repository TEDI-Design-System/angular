import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  contentChildren,
  effect,
  inject,
  input,
  model,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { IconComponent } from "../../base/icon/icon.component";
import { TextComponent } from "../../base/text/text.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { ModalService } from "../../overlay/modal/modal.service";
import type { ModalRef } from "../../overlay/modal/modal-ref";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";
import { TediTranslationService } from "../../../services/translation/translation.service";
import {
  CardStepperListModalComponent,
  CardStepperListModalData,
  CardStepperListSelection,
} from "./card-stepper-list-modal/card-stepper-list-modal.component";
import { CardStepperStepComponent } from "./card-stepper-step/card-stepper-step.component";

export type CardStepperDescriptionPosition = "top" | "bottom";
export type CardStepperCounterPosition = "inline" | "top" | "bottom";
export type CardStepperAllowJump = boolean | "completed" | "completed-or-next";
export type CardStepperHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

@Component({
  selector: "tedi-card-stepper",
  imports: [
    NgTemplateOutlet,
    IconComponent,
    TextComponent,
    ButtonComponent,
    TediTranslationPipe,
  ],
  templateUrl: "./card-stepper.component.html",
  styleUrl: "./card-stepper.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-card-stepper",
    "[class.tedi-card-stepper--reserve-description]": "reserveDescription()",
    role: "group",
    "[attr.aria-label]": "ariaLabel()",
  },
})
export class CardStepperComponent {
  /**
   * Accessible name for the card group.
   */
  ariaLabel = input<string>();
  /**
   * Show the active step number. Replaced by the back arrow with `showNavigation`.
   * @default true
   */
  showStepNumber = input(true, { transform: booleanAttribute });
  /**
   * Show the active step's completed or error icon in the title row.
   * @default false
   */
  showStatusIcon = input(false, { transform: booleanAttribute });
  /**
   * Whether the active step's description sits above or below its label.
   * @default "bottom"
   */
  descriptionPosition = input<CardStepperDescriptionPosition>("bottom");
  /**
   * Position of the `N / M` counter: beside the controls, above the label,
   * or below the label and description.
   * @default "inline"
   */
  counterPosition = input<CardStepperCounterPosition>("inline");
  /**
   * Show the segmented progress bar under the row.
   * @default true
   */
  showProgress = input(true, { transform: booleanAttribute });
  /**
   * Show previous and next arrows, skipping disabled steps.
   * @default false
   */
  showNavigation = input(false, { transform: booleanAttribute });
  /**
   * Show the list button and the step-list modal.
   * @default true
   */
  showStepList = input(true, { transform: booleanAttribute });
  /**
   * Allow selection of any, no, completed, or completed plus the next step
   * in the modal. Disabled steps remain unavailable. Does not restrict arrows.
   * @default true
   */
  allowJump = input<CardStepperAllowJump>(true);
  /**
   * Heading level for the active label. Does not change its visual size.
   * @default 4
   */
  headingLevel = input<CardStepperHeadingLevel>(4);

  /**
   * Active step index (0-based). Supports `[(activeStep)]`. Clamped into range,
   * but not away from `disabled` steps — those stay settable on purpose.
   * @default 0
   */
  activeStep = model(0);

  private readonly modalService = inject(ModalService);
  private readonly translations = inject(TediTranslationService);

  /** The step-list dialog while it is open. */
  private listRef: ModalRef<CardStepperListSelection> | null = null;

  constructor() {
    // Keep `[(activeStep)]` pointing at the step actually shown, in case the
    // list shrank under it. An empty stepper has no valid index, so the model
    // is left alone.
    effect(() => {
      const total = this.total();
      if (total === 0) return;

      const current = this.activeStep();
      const normalized = this.normalizeIndex(current, total);

      if (normalized !== current) {
        this.activeStep.set(normalized);
      }
    });

    // The dialog renders in an overlay, so it outlives this component unless closed.
    inject(DestroyRef).onDestroy(() => this.listRef?.close());
  }

  protected readonly steps = contentChildren(CardStepperStepComponent, {
    descendants: false,
  });

  protected readonly listOpen = signal(false);

  protected readonly total = computed(() => this.steps().length);

  protected readonly active = computed(() =>
    this.normalizeIndex(this.activeStep(), this.total()),
  );

  /** Undefined only while the stepper has no steps at all. */
  protected readonly current = computed<CardStepperStepComponent | undefined>(
    () => this.steps()[this.active()],
  );

  protected readonly showIndicator = computed(
    () => this.showStepNumber() && !this.showNavigation(),
  );

  protected readonly hasLead = computed(
    () => this.showNavigation() || this.showIndicator(),
  );

  protected readonly previousIndex = computed(() =>
    this.adjacentEnabled(this.active() - 1, -1),
  );

  protected readonly nextIndex = computed(() =>
    this.adjacentEnabled(this.active() + 1, 1),
  );

  /**
   * Reserve one description line when any step has a bottom description.
   */
  protected readonly reserveDescription = computed(
    () =>
      this.descriptionPosition() === "bottom" &&
      this.steps().some((step) => step.description()),
  );

  protected readonly showTopDescription = computed(
    () =>
      this.descriptionPosition() === "top" && !!this.current()?.description(),
  );

  protected readonly showTopRow = computed(
    () => this.counterPosition() === "top" || this.showTopDescription(),
  );

  protected goTo(index: number): void {
    const step = this.steps()[index];
    if (index < 0 || index >= this.total() || index === this.active()) return;
    if (!step || step.disabled()) return;
    this.activeStep.set(index);
  }

  protected openStepList(): void {
    if (this.listRef) return;

    const title = this.translations.translate("card-stepper.steps");
    this.listOpen.set(true);

    // The dialog answers with indices into this list, but steps may be added or
    // removed while it is open. Keeping the components lets a selection resolve
    // to the step the user actually saw.
    const shown = this.steps().map((step) => ({
      step,
      subSteps: step.subSteps(),
    }));

    const ref = this.modalService.open<
      CardStepperListSelection,
      CardStepperListModalData
    >(CardStepperListModalComponent, {
      data: { title, steps: this.listSteps() },
      width: "100vw",
      maxWidth: "100vw",
      position: "bottom",
      ariaLabel: title,
    });

    this.listRef = ref;

    ref.closed.subscribe((selection) => {
      this.listRef = null;
      this.listOpen.set(false);
      if (!selection) return;

      const picked = shown[selection.stepIndex];
      if (!picked) return;

      // Gone from the stepper while the dialog was open: nothing to select.
      const stepIndex = this.steps().indexOf(picked.step);
      if (stepIndex === -1) return;

      if (selection.subStepIndex === undefined) {
        if (this.isNavigable(stepIndex)) this.goTo(stepIndex);
        return;
      }

      const subStep = picked.subSteps[selection.subStepIndex];

      if (!subStep || !picked.step.subSteps().includes(subStep)) return;
      if (subStep.disabled() || subStep.state() === "informative") return;

      subStep.subStepSelect.emit();
    });
  }

  /** Snapshot of the steps for the list, which renders in its own dialog. */
  private listSteps(): CardStepperListModalData["steps"] {
    return this.steps().map((step, index) => ({
      label: step.label(),
      description: step.description(),
      state: step.state(),
      disabled: step.disabled(),
      navigable: this.isNavigable(index),
      current: index === this.active() && !step.hasCurrentSubStep(),
      expanded: this.isExpanded(step, index),
      subSteps: step.subSteps().map((subStep) => ({
        label: subStep.label(),
        state: subStep.state(),
        current: subStep.current(),
        disabled: subStep.disabled(),
        href: subStep.href(),
        labelAs: subStep.labelAs(),
      })),
    }));
  }

  private isNavigable(index: number): boolean {
    const step = this.steps()[index];
    if (!step || step.disabled()) return false;

    const allowJump = this.allowJump();

    if (allowJump === true) return true;
    if (allowJump === false) return false;
    if (allowJump === "completed") return step.state() === "completed";

    return step.state() === "completed" || index === this.active() + 1;
  }

  private isExpanded(step: CardStepperStepComponent, index: number): boolean {
    return step.expanded() ?? index === this.active();
  }

  /**
   * `activeStep` accepts any number, so turn fractions, out-of-range and
   * non-finite values into a real step index.
   */
  private normalizeIndex(value: number, total: number): number {
    if (!Number.isFinite(value)) return 0;

    return Math.min(Math.max(Math.trunc(value), 0), Math.max(total - 1, 0));
  }

  private adjacentEnabled(from: number, direction: -1 | 1): number {
    const steps = this.steps();

    for (let i = from; i >= 0 && i < steps.length; i += direction) {
      if (!steps[i].disabled()) return i;
    }

    return -1;
  }
}
