import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from "@angular/core";

/**
 * Right-aligns its content. Add `tedi-modal-footer-start` to each element that
 * should sit on the left instead. Mark the elements themselves, not a wrapper,
 * so they keep the footer's gap.
 */
@Component({
  standalone: true,
  selector: "tedi-modal-footer",
  template: "<ng-content />",
  styleUrl: "../modal.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-modal-footer",
  },
})
export class ModalFooterComponent {}
