import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  selector: "tedi-label-row",
  templateUrl: "./label-row.component.html",
  styleUrl: "./label-row.component.scss",
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-label-row",
  },
})
export class LabelRowComponent {}
