import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewEncapsulation,
} from "@angular/core";
import { MODAL_DATA } from "../../../overlay/modal/modal.types";
import { ModalRef } from "../../../overlay/modal/modal-ref";
import { ModalComponent } from "../../../overlay/modal/modal.component";
import { ModalHeaderComponent } from "../../../overlay/modal/modal-header/modal-header.component";
import { ModalContentComponent } from "../../../overlay/modal/modal-content/modal-content.component";
import { PaginationLabels } from "../pagination.types";

export interface PaginationMobileModalData {
  pageCount: number;
  currentPage: number;
  labels: PaginationLabels;
}

@Component({
  selector: "tedi-pagination-mobile-modal",
  standalone: true,
  imports: [ModalComponent, ModalHeaderComponent, ModalContentComponent],
  templateUrl: "./pagination-mobile-modal.component.html",
  styleUrl: "./pagination-mobile-modal.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-pagination-mobile-modal",
  },
})
export class PaginationMobileModalComponent {
  private readonly modalRef = inject<ModalRef<number>>(ModalRef);
  protected readonly data = inject<PaginationMobileModalData>(MODAL_DATA);

  protected readonly pages: number[] = Array.from(
    { length: this.data.pageCount },
    (_, i) => i + 1,
  );

  protected selectPage(page: number): void {
    this.modalRef.close(page);
  }
}
