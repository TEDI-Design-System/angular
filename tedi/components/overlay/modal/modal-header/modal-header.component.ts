import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  input,
  inject,
} from "@angular/core";
import { ClosingButtonComponent } from "../../../buttons/closing-button/closing-button.component";
import { ModalComponent } from "../modal.component";

@Component({
  standalone: true,
  selector: "tedi-modal-header",
  imports: [ClosingButtonComponent],
  templateUrl: "./modal-header.component.html",
  styleUrl: "../modal.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalHeaderComponent {
  /** Should show closing button? */
  readonly showClose = input(true);

  private readonly modal = inject(ModalComponent);

  closeModal() {
    this.modal.open.set(false);
  }
}
