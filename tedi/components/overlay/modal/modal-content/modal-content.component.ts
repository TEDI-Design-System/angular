import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from "@angular/core";

@Component({
  standalone: true,
  selector: "tedi-modal-content",
  imports: [],
  templateUrl: "./modal-content.component.html",
  styleUrl: "../modal.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-modal-content",
  },
})
export class ModalContentComponent {}
