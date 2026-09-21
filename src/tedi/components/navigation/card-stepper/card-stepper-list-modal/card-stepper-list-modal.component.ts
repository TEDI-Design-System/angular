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
import { VerticalStepperSubItemComponent } from "../../vertical-stepper/vertical-stepper-sub-item/vertical-stepper-sub-item.component";
import type { VerticalStepperLabelElement } from "../../vertical-stepper/vertical-stepper-item/vertical-stepper-item.component";
import type { CardStepperStepState } from "../card-stepper-step/card-stepper-step.component";
import type { CardStepperSubStepState } from "../card-stepper-sub-step/card-stepper-sub-step.component";

export interface CardStepperListSubStep {
  label: string;
  state: CardStepperSubStepState;
  current: boolean;
  disabled: boolean;
  href?: string;
  labelAs?: VerticalStepperLabelElement;
}

export interface CardStepperListStep {
  label: string;
  description?: string;
  state: CardStepperStepState;
  disabled: boolean;
  /** Whether `allowJump` lets this step be picked. */
  navigable: boolean;
  current: boolean;
  expanded: boolean;
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
    VerticalStepperSubItemComponent,
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

  protected selectStep(stepIndex: number): void {
    this.modalRef.close({ stepIndex });
  }

  protected selectSubStep(stepIndex: number, subStepIndex: number): void {
    this.modalRef.close({ stepIndex, subStepIndex });
  }
}
