import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { LabelComponent } from "../../../form/label/label.component";
import { CardContentComponent } from "../../card/card-content/card-content.component";
import { CardPadding } from "../../card/card.utils";
import { TableCardComponent } from "../table-card.component";
import {
  getTableCardRowsClasses,
  getTableCardRowsStyles,
  TableCardLabelSize,
} from "../table-card.utils";

/**
 * Emphasised closing row of a `tedi-table-card`, set apart from the rows above
 * it on a muted background.
 *
 * ```html
 * <tedi-table-card-summary label="Ülekande summa">0.00 €</tedi-table-card-summary>
 * ```
 */
@Component({
  selector: "tedi-table-card-summary",
  standalone: true,
  templateUrl: "./table-card-summary.component.html",
  styleUrl: "./table-card-summary.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [CardContentComponent, LabelComponent],
  host: {
    class: "tedi-table-card-summary",
  },
})
export class TableCardSummaryComponent {
  /**
   * Label of the summary row. Omit it and project `[tediTableCardRowLabel]`
   * content instead when the label needs markup of its own.
   */
  label = input<string>();
  /**
   * Size of the label. Defaults to the enclosing card's, so the total reads with
   * the rows above it.
   */
  labelSize = input<TableCardLabelSize>();
  /**
   * Padding of the summary row. Takes the same values as `tedi-card-content`.
   * Defaults to the enclosing card's padding, so the two line up.
   */
  padding = input<CardPadding>();

  private readonly card = inject(TableCardComponent, { optional: true });

  readonly resolvedLabelSize = computed<TableCardLabelSize>(
    () => this.labelSize() ?? this.card?.resolvedLabelSize() ?? "default",
  );

  readonly resolvedPadding = computed<CardPadding>(
    () => this.padding() ?? this.card?.resolvedPadding() ?? 1,
  );

  /**
   * Borrows the card's label column so the total lines up with the rows above.
   */
  private readonly rowsInputs = computed(() => ({
    ...this.card?.breakpointInputs(),
    layout: "horizontal" as const,
    columns: 1,
    valueAlign: "right" as const,
  }));

  readonly rowsClasses = computed(() =>
    getTableCardRowsClasses(this.rowsInputs()),
  );
  readonly rowsStyles = computed(() =>
    getTableCardRowsStyles(this.rowsInputs()),
  );
}
