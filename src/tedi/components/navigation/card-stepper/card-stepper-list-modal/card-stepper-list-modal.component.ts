import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewEncapsulation,
} from "@angular/core";
import { MODAL_DATA } from "../../../overlay/modal/modal.types";
import { ModalRef } from "../../../overlay/modal/modal-ref";
import { ModalComponent } from "../../../overlay/modal/modal.component";
import { ModalContentComponent } from "../../../overlay/modal/modal-content/modal-content.component";
import { ModalHeaderComponent } from "../../../overlay/modal/modal-header/modal-header.component";
import { TextComponent } from "../../../base/text/text.component";
import { VerticalStepperComponent } from "../../vertical-stepper/vertical-stepper.component";
import { VerticalStepperItemComponent } from "../../vertical-stepper/vertical-stepper-item/vertical-stepper-item.component";

export interface CardStepperListSubStep {
  title: string;
  completed: boolean;
  error: boolean;
  informative: boolean;
  selected: boolean;
  disabled: boolean;
}

export interface CardStepperListStep {
  title: string;
  description?: string;
  completed: boolean;
  error: boolean;
  disabled: boolean;
  /** Whether `allowJump` lets this step be picked. */
  navigable: boolean;
  selected: boolean;
  opened: boolean;
  subSteps: CardStepperListSubStep[];
}

export interface CardStepperListModalData {
  /** Heading of the list, also the stepper's accessible name. */
  title: string;
  steps: CardStepperListStep[];
}

/** What the user picked, as indices into the data the modal was given. */
export interface CardStepperListSelection {
  stepIndex: number;
  subStepIndex?: number;
}

/**
 * Step list shown by `tedi-card-stepper`. Opened through `ModalService`, so the
 * dialog is independent of any modal the stepper itself sits in.
 */
@Component({
  selector: "tedi-card-stepper-list-modal",
  imports: [
    ModalComponent,
    ModalContentComponent,
    ModalHeaderComponent,
    TextComponent,
    VerticalStepperComponent,
    VerticalStepperItemComponent,
  ],
  templateUrl: "./card-stepper-list-modal.component.html",
  styleUrl: "./card-stepper-list-modal.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-card-stepper-list-modal",
  },
})
export class CardStepperListModalComponent {
  private readonly modalRef =
    inject<ModalRef<CardStepperListSelection>>(ModalRef);
  protected readonly data = inject<CardStepperListModalData>(MODAL_DATA);

  /**
   * Title control for a step whose selectability differs from the item's own
   * default (a button for a leaf, text for a parent), or `null` when it matches.
   */
  protected ownTitle(step: CardStepperListStep): "button" | "text" | null {
    if (step.disabled) return null;
    const isParent = step.subSteps.length > 0;
    if (step.navigable && isParent) return "button";
    if (!step.navigable && !isParent) return "text";
    return null;
  }

  protected selectStep(stepIndex: number): void {
    this.modalRef.close({ stepIndex });
  }

  protected selectSubStep(stepIndex: number, subStepIndex: number): void {
    this.modalRef.close({ stepIndex, subStepIndex });
  }
}
