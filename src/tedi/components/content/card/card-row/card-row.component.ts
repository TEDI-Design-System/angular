import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";

/**
 * Lays out card content cells horizontally inside a card.
 * Place a `tedi-separator` between cells (vertical, `size="auto"`) or
 * between rows (horizontal) to draw dividers.
 */
@Component({
  selector: "tedi-card-row",
  standalone: true,
  templateUrl: "./card-row.component.html",
  styleUrl: "./card-row.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class.tedi-card-row]": "true",
  },
})
export class CardRowComponent {}
