import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import {
  BreakpointInputs,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import { CardContentComponent } from "../../card/card-content/card-content.component";
import { CardBackground, CardPadding } from "../../card/card.utils";
import { TableCardComponent, TableCardInputs } from "../table-card.component";
import {
  getTableCardRowsClasses,
  getTableCardRowsStyles,
  TableCardAlign,
  TableCardColumnSizing,
  TableCardLabelSize,
  TableCardLayout,
  TableCardRowAlign,
  TEDI_TABLE_CARD_ROWS_CONTEXT,
} from "../table-card.utils";

/**
 * A nested block of `[tedi-table-card-row]`s inside a `tedi-table-card`, divided
 * from what precedes it and collapsing with the rest of the body. Layout inputs
 * fall back to the enclosing card's.
 *
 * ```html
 * <tedi-table-card title="Kadri Kaasik" collapsible>
 *   <div tedi-table-card-row label="Vanus" value="25"></div>
 *   <tedi-table-card-group>
 *     <div tedi-table-card-row label="Tõend" value="COVID-19"></div>
 *   </tedi-table-card-group>
 * </tedi-table-card>
 * ```
 */
@Component({
  selector: "tedi-table-card-group",
  standalone: true,
  templateUrl: "./table-card-group.component.html",
  styleUrl: "./table-card-group.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [CardContentComponent],
  host: {
    class: "tedi-table-card-group",
  },
  providers: [
    {
      provide: TEDI_TABLE_CARD_ROWS_CONTEXT,
      useExisting: TableCardGroupComponent,
    },
  ],
})
export class TableCardGroupComponent implements BreakpointInputs<TableCardInputs> {
  /**
   * Background of the group. `tertiary` sets it apart from the card's own rows;
   * `primary` keeps it on the card surface.
   * @default tertiary
   */
  background = input<CardBackground>("tertiary");

  layout = input<TableCardLayout>();
  columns = input<number>();
  columnSizing = input<TableCardColumnSizing>();
  labelWidth = input<string | number>();
  labelAlign = input<TableCardAlign>();
  valueAlign = input<TableCardAlign>();
  rowAlign = input<TableCardRowAlign>();
  labelSize = input<TableCardLabelSize>();
  padding = input<CardPadding>();
  rowGap = input<string | number>();

  xs = input<TableCardInputs>();
  sm = input<TableCardInputs>();
  md = input<TableCardInputs>();
  lg = input<TableCardInputs>();
  xl = input<TableCardInputs>();
  xxl = input<TableCardInputs>();

  private readonly breakpointService = inject(BreakpointService);
  private readonly card = inject(TableCardComponent, { optional: true });

  readonly breakpointInputs = computed<TableCardInputs>(() => {
    const own = this.breakpointService.getBreakpointInputs<TableCardInputs>({
      layout: this.layout(),
      columns: this.columns(),
      columnSizing: this.columnSizing(),
      labelWidth: this.labelWidth(),
      labelAlign: this.labelAlign(),
      valueAlign: this.valueAlign(),
      rowAlign: this.rowAlign(),
      labelSize: this.labelSize(),
      padding: this.padding(),
      rowGap: this.rowGap(),

      xs: this.xs(),
      sm: this.sm(),
      md: this.md(),
      lg: this.lg(),
      xl: this.xl(),
      xxl: this.xxl(),
    });
    const inherited = this.card?.breakpointInputs() ?? {};

    return {
      ...inherited,
      ...Object.fromEntries(
        Object.entries(own).filter(([, value]) => value !== undefined),
      ),
    };
  });

  readonly resolvedLabelSize = computed<TableCardLabelSize>(
    () => this.breakpointInputs().labelSize ?? "default",
  );
  readonly resolvedColumns = computed(
    () => this.breakpointInputs().columns ?? 1,
  );
  readonly resolvedPadding = computed<CardPadding>(
    () => this.breakpointInputs().padding ?? 1,
  );

  readonly rowsClasses = computed(() =>
    getTableCardRowsClasses(this.breakpointInputs()),
  );
  readonly rowsStyles = computed(() =>
    getTableCardRowsStyles(this.breakpointInputs()),
  );
}
