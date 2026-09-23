import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  computed,
  input,
  inject,
} from "@angular/core";
import {
  ClosingButtonComponent,
  ClosingButtonSize,
} from "../../../buttons/closing-button/closing-button.component";
import { ModalComponent } from "../modal.component";
import { ModalRef } from "../modal-ref";
import { MODAL_SIZE } from "../modal.types";

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

  /**
   * Size of the close button. When unset, the close button size tracks the
   * modal's own `size` variant (default → standard close button, small →
   * compact close button). Set explicitly to override that default.
   */
  readonly closeButtonSize = input<ClosingButtonSize | undefined>(undefined);

  /** @deprecated Injected when used inside the old template-based tedi-modal. */
  private readonly modal = inject(ModalComponent, { optional: true });

  /** Injected when opened via ModalService. */
  private readonly modalRef = inject(ModalRef, { optional: true });

  /** Read from the surrounding modal so the close button can auto-shrink in small modals. */
  private readonly modalSize = inject(MODAL_SIZE, { optional: true });

  /**
   * Effective close-button size: explicit input wins, otherwise derive from
   * the surrounding modal's `size` variant (small modal → small button).
   */
  protected readonly effectiveCloseButtonSize = computed<ClosingButtonSize>(
    () => {
      const explicit = this.closeButtonSize();
      if (explicit) return explicit;
      return this.modalSize?.() === "small" ? "small" : "default";
    },
  );

  closeModal() {
    if (this.modalRef) {
      this.modalRef.close();
    } else if (this.modal) {
      this.modal.open.set(false);
    }
  }
}
