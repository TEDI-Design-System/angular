import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChildren,
  ViewEncapsulation,
} from "@angular/core";
import { MODAL_DATA } from "../../../overlay/modal/modal.types";
import { ModalRef } from "../../../overlay/modal/modal-ref";
import { ModalComponent } from "../../../overlay/modal/modal.component";
import { ModalHeaderComponent } from "../../../overlay/modal/modal-header/modal-header.component";
import { ModalContentComponent } from "../../../overlay/modal/modal-content/modal-content.component";

export interface PaginationOptionPickerOption {
  /** Value emitted when this option is selected. */
  value: number;
  /** Visible label inside the row. */
  label: string;
  /** Full accessible name for the row's button. */
  ariaLabel: string;
}

export interface PaginationOptionPickerModalData {
  /** Available options to choose from. */
  options: PaginationOptionPickerOption[];
  /** Currently selected value — drives the active styling and scroll-into-view target. */
  selectedValue: number;
  /** Optional heading rendered inside the modal header. Hidden when omitted. */
  title?: string;
}

@Component({
  selector: "tedi-pagination-option-picker-modal",
  standalone: true,
  imports: [ModalComponent, ModalHeaderComponent, ModalContentComponent],
  templateUrl: "./pagination-option-picker-modal.component.html",
  styleUrl: "./pagination-option-picker-modal.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-pagination-option-picker-modal",
  },
})
export class PaginationOptionPickerModalComponent implements AfterViewInit {
  private readonly modalRef = inject<ModalRef<number>>(ModalRef);
  protected readonly data = inject<PaginationOptionPickerModalData>(MODAL_DATA);

  protected readonly itemButtons = viewChildren<ElementRef<HTMLButtonElement>>("itemButton");

  ngAfterViewInit(): void {
    const buttons = this.itemButtons();
    const selectedIndex = this.data.options.findIndex(
      (option) => option.value === this.data.selectedValue,
    );
    if (selectedIndex < 0) return;

    const button = buttons[selectedIndex]?.nativeElement;
    // `block: 'center'` keeps the active row visually in the middle of the modal
    // body — without it the user would land at the top of a long list and miss
    // the page they are on (design review #8).
    button?.scrollIntoView({ block: "center", behavior: "auto" });
  }

  protected selectValue(value: number): void {
    this.modalRef.close(value);
  }
}
