import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  input,
  inject,
} from "@angular/core";
import { ClosingButtonComponent } from "../../../buttons/closing-button/closing-button.component";
import { ModalComponent } from "../modal.component";
import { ModalRef } from "../modal-ref";

@Component({
  standalone: true,
  selector: "tedi-modal-header",
  imports: [ClosingButtonComponent],
  templateUrl: "./modal-header.component.html",
  styleUrl: "../modal.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-modal-header",
  },
})
export class ModalHeaderComponent {
  /** Should show closing button? */
  readonly showClose = input(true);

  /** @deprecated Injected when used inside the old template-based tedi-modal. */
  private readonly modal = inject(ModalComponent, { optional: true });

  /** Injected when opened via ModalService. */
  private readonly modalRef = inject(ModalRef, { optional: true });

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    } else if (this.modal) {
      this.modal.open.set(false);
    }
  }
}
