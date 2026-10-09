import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import {
  CdkVirtualScrollViewport,
  ScrollingModule,
} from "@angular/cdk/scrolling";
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

const ITEM_SIZE_PX = 48;

@Component({
  selector: "tedi-pagination-option-picker-modal",
  standalone: true,
  imports: [
    ModalComponent,
    ModalHeaderComponent,
    ModalContentComponent,
    ScrollingModule,
  ],
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

  protected readonly itemSize = ITEM_SIZE_PX;
  protected readonly ready = signal(false);
  private readonly viewport = viewChild.required(CdkVirtualScrollViewport);

  ngAfterViewInit(): void {
    const selectedIndex = this.data.options.findIndex(
      (option) => option.value === this.data.selectedValue,
    );
    if (selectedIndex < 0) {
      this.ready.set(true);
      return;
    }

    // CDK virtual scroll sizes its internal spacer element through a
    // microtask-scheduled CD pass — until that runs, the viewport's
    // `scrollHeight` is 0 and `scrollToOffset` clamps to the top. Poll with
    // rAF until the scroll area has reached `dataLength * itemSize`, then
    // perform the actual scroll. The retry cap stops us spinning forever if
    // something prevents the spacer from sizing.
    // Until then the viewport is `visibility: hidden`, so the user never sees
    // the brief flash of page 1 before we land on the selected row.
    const targetHeight = this.data.options.length * ITEM_SIZE_PX;
    let attempts = 0;
    const attempt = () => {
      const viewport = this.viewport();
      const scrollHeight = viewport.elementRef.nativeElement.scrollHeight;
      if (scrollHeight + 1 < targetHeight && attempts < 20) {
        attempts++;
        requestAnimationFrame(attempt);
        return;
      }
      viewport.checkViewportSize();
      const viewportSize = viewport.getViewportSize();
      const offset = Math.max(
        0,
        (selectedIndex + 0.5) * ITEM_SIZE_PX - viewportSize / 2,
      );
      viewport.scrollToOffset(offset, "auto");
      this.ready.set(true);
    };
    requestAnimationFrame(attempt);
  }

  protected trackByValue(
    _: number,
    option: PaginationOptionPickerOption,
  ): number {
    return option.value;
  }

  protected selectValue(value: number): void {
    this.modalRef.close(value);
  }
}
