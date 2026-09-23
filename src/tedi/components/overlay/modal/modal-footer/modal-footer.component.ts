import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from "@angular/core";

/**
 * Right-aligns its content. Add `tedi-modal-footer-start` to an element to
 * place it on the left instead.
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
