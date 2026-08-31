import {
  ChangeDetectionStrategy,
  Component,
  inject,
  ViewEncapsulation,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { ModalComponent } from "../../../overlay/modal/modal.component";
import { ModalHeaderComponent } from "../../../overlay/modal/modal-header/modal-header.component";
import { ModalContentComponent } from "../../../overlay/modal/modal-content/modal-content.component";
import { ModalFooterComponent } from "../../../overlay/modal/modal-footer/modal-footer.component";
import { ModalRef } from "../../../overlay/modal/modal-ref";
import { MODAL_DATA } from "../../../overlay/modal/modal.types";
import { ButtonComponent } from "../../../buttons/button/button.component";
import type { TableFilterModalData } from "../table.types";

/**
 * Renders a column filter inside a modal — the below-`filterModalBreakpoint`
 * alternative to the desktop filter popover. Opened by the table via
 * `ModalService.open()`; reads its payload from `MODAL_DATA` and reuses the
 * same filter context (draft, apply, clear) so behavior matches the popover.
 */
@Component({
  selector: "tedi-table-filter-modal",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    ModalComponent,
    ModalHeaderComponent,
    ModalContentComponent,
    ModalFooterComponent,
    ButtonComponent,
  ],
  templateUrl: "./table-filter-modal.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableFilterModalComponent {
  protected readonly data = inject<TableFilterModalData>(MODAL_DATA);
  private readonly modalRef = inject(ModalRef);

  protected get context() {
    return this.data.buildContext(() => this.modalRef.close());
  }
}
