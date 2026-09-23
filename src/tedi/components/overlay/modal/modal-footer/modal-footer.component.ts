import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from "@angular/core";

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
