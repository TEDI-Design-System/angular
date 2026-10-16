import { _IdGenerator } from "@angular/cdk/a11y";
import { NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
  model,
  ViewEncapsulation,
} from "@angular/core";
import {
  BreakpointInputs,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { IconComponent } from "../../base/icon/icon.component";
import {
  TextColor,
  TextComponent,
  TextModifiers,
} from "../../base/text/text.component";
import { CheckboxComponent } from "../../form/checkbox/checkbox.component";
import { CardComponent } from "../card/card.component";
import { CardContentComponent } from "../card/card-content/card-content.component";
import { CardPadding } from "../card/card.utils";
import { TableCardEndSlotDirective } from "./table-card-end-slot.directive";
import { TableCardRowComponent } from "./table-card-row/table-card-row.component";
import {
  getTableCardPaddingSides,
  getTableCardRowsClasses,
  getTableCardRowsStyles,
  TableCardAlign,
  TableCardColumnSizing,
  TableCardLabelSize,
  TableCardLayout,
  TableCardRowAlign,
  TEDI_TABLE_CARD_ROWS_CONTEXT,
} from "./table-card.utils";

export type TableCardTitleElement = "h2" | "h3" | "h4" | "h5" | "h6";

export type TableCardInputs = {
  /**
   * Row layout — `horizontal` puts the label beside its value, `vertical` above it.
   * @default horizontal
   */
  layout?: TableCardLayout;
  /**
   * Number of columns used to arrange the rows.
   * @default 1
   */
  columns?: number;
  /**
   * Column sizing in multi-column layouts. equal uses equal widths;
   * auto sizes columns according to their content and distributes remaining space.
   * @default equal
   */
  columnSizing?: TableCardColumnSizing;
  /**
   * Width of the label column in horizontal layout. A `number` is pixels.
   * @default var(--text-group-label-width-sm) horizontal, auto vertical
   */
  labelWidth?: string | number;
  /**
   * Alignment of the label text. Defaults to `right` in horizontal layout so
   * labels sit against the gutter, `left` otherwise.
   */
  labelAlign?: TableCardAlign;
  /**
   * Value alignment in horizontal layout. Defaults to `right`.
   */
  valueAlign?: TableCardAlign;
  /**
   * Vertical alignment of labels and values in horizontal layout.
   * @default start
   */
  rowAlign?: TableCardRowAlign;
  /**
   * Size of the row labels.
   * @default default
   */
  labelSize?: TableCardLabelSize;
  /**
   * Padding of the card. Takes the same values as `tedi-card-content`: a number
   * in rems, or an object of vertical/horizontal or top/right/bottom/left
   * numbers. Every block shares its horizontal padding, so the header, rows,
   * groups, summary and footer all line up.
   * @default 1
   */
  padding?: CardPadding;
  /**
   * Gap between rows. A `number` is rems, matching `padding`; pass a string for
   * any other CSS length. Defaults to the layout gutter in vertical layout and
   * to no gap in horizontal layout, where the rows read as table lines.
   */
  rowGap?: string | number;
};

/**
 * `tedi-table-card` presents one table row as a stacked card of label / value
 * pairs — the readable counterpart of `tedi-table` on narrow viewports.
 *
 * The body is composed of `[tedi-table-card-row]` children, which together form a
 * single `<dl>`. `tedi-table-card-group` adds nested groups of rows on a muted
 * background, `tedi-table-card-summary` an emphasised total,
 * `tedi-table-card-actions` a footer of buttons, and `[tediTableCardEndSlot]`
 * marks non-interactive content for the end of the header.
 *
 * ```html
 * <tedi-table-card title="Kadri Kaasik" collapsible>
 *   <div tedi-table-card-row label="Vanus" value="25"></div>
 *   <div tedi-table-card-row label="Külastuste arv" value="6"></div>
 *   <tedi-table-card-actions>
 *     <button tedi-button variant="neutral">Muuda</button>
 *   </tedi-table-card-actions>
 * </tedi-table-card>
 * ```
 */
@Component({
  selector: "tedi-table-card",
  standalone: true,
  templateUrl: "./table-card.component.html",
  styleUrl: "./table-card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    NgTemplateOutlet,
    CardComponent,
    CardContentComponent,
    CheckboxComponent,
    IconComponent,
    TextComponent,
  ],
  host: {
    class: "tedi-table-card",
  },
  providers: [
    {
      provide: TEDI_TABLE_CARD_ROWS_CONTEXT,
      useExisting: TableCardComponent,
    },
  ],
})
export class TableCardComponent implements BreakpointInputs<TableCardInputs> {
  /**
   * Title shown in the header. It also names the toggle of a `collapsible` card,
   * which without it falls back to `ariaLabel` and then to the shared
   * open / close wording.
   */
  title = input<string>();
  /**
   * Secondary line under the title.
   */
  subtitle = input<string>();
  /**
   * Heading tag the title is rendered as, for the document outline. The title
   * keeps its body-sized look unless `titleModifiers` says otherwise.
   * @default h3
   */
  titleElement = input<TableCardTitleElement>("h3");
  /**
   * Visual size and weight of the title, independent of `titleElement`.
   */
  titleModifiers = input<TextModifiers[] | TextModifiers>();
  /**
   * Turn the header into a toggle that shows and hides the body.
   * @default false
   */
  collapsible = input(false, { transform: booleanAttribute });
  /**
   * Whether the body is expanded when collapsible` is enabled.
   * @default true
   */
  open = model(true);
  /**
   * Show a leading checkbox that selects the row.
   * @default false
   */
  selectable = input(false, { transform: booleanAttribute });
  /**
   * Whether the row is selected.
   * @default false
   */
  selected = model(false);
  /**
   * Accessible name of the checkbox when the card is collapsible or has no title.
   * Defaults to the translated `table-card.select-row` label.
   */
  selectionLabel = input<string>();
  /**
   * Accessible name of the card. Also names the collapse toggle
   * when no title is provided.
   */
  ariaLabel = input<string>();

  layout = input<TableCardLayout | undefined>("horizontal");
  columns = input<number | undefined>(1);
  columnSizing = input<TableCardColumnSizing | undefined>("equal");
  labelWidth = input<string | number>();
  labelAlign = input<TableCardAlign>();
  valueAlign = input<TableCardAlign>();
  rowAlign = input<TableCardRowAlign | undefined>("start");
  labelSize = input<TableCardLabelSize | undefined>("default");
  padding = input<CardPadding | undefined>(1);
  rowGap = input<string | number>();

  xs = input<TableCardInputs>();
  sm = input<TableCardInputs>();
  md = input<TableCardInputs>();
  lg = input<TableCardInputs>();
  xl = input<TableCardInputs>();
  xxl = input<TableCardInputs>();

  private readonly breakpointService = inject(BreakpointService);
  private readonly translationService = inject(TediTranslationService);
  private readonly idGenerator = inject(_IdGenerator);

  readonly bodyId = this.idGenerator.getId("tedi-table-card-body");
  readonly titleId = this.idGenerator.getId("tedi-table-card-title");
  readonly selectId = this.idGenerator.getId("tedi-table-card-select");

  readonly breakpointInputs = computed(() =>
    this.breakpointService.getBreakpointInputs<TableCardInputs>({
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
    }),
  );

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

  /**
   * Detect end-slot content so it can render a header without a title.
   */
  private readonly endSlot = contentChild(TableCardEndSlotDirective, {
    descendants: false,
  });

  /**
   * Avoid an empty padded rows section when the card contains only groups.
   */
  private readonly rows = contentChildren(TableCardRowComponent, {
    descendants: false,
  });

  readonly hasRows = computed(() => this.rows().length > 0);

  readonly hasTitleGroup = computed(() => !!this.title() || !!this.subtitle());

  readonly hasHeader = computed(
    () =>
      this.selectable() ||
      this.collapsible() ||
      this.hasTitleGroup() ||
      !!this.endSlot(),
  );

  readonly toggleLabel = computed(
    () =>
      this.ariaLabel() ??
      this.translationService.translate(this.open() ? "close" : "open"),
  );

  /**
   * Only collapsible headers are separated from the body.
   */
  readonly bodyHasSeparator = computed(() => this.collapsible());

  readonly resolvedPaddingSides = computed(() =>
    getTableCardPaddingSides(this.resolvedPadding()),
  );

  /**
   * For headers without a separator, the body's top padding provides the gap.
   */
  readonly headerPadding = computed<CardPadding>(() => {
    const { top, right, bottom, left } = this.resolvedPaddingSides();

    return this.bodyHasSeparator()
      ? { top, right, bottom, left }
      : { top, right, bottom: 0, left };
  });

  readonly resolvedSelectionLabel = computed(
    () =>
      this.selectionLabel() ??
      this.translationService.translate("table-card.select-row"),
  );

  /**
   * Use the title as a clickable checkbox label only
   * when it is not the collapse toggle.
   */
  readonly titleLabelsSelection = computed(
    () => this.selectable() && !this.collapsible() && !!this.title(),
  );

  readonly titleColor = computed<TextColor>(() =>
    this.collapsible() && !this.subtitle() ? "secondary" : "primary",
  );

  readonly titleClasses = computed(() => {
    const classList = ["tedi-table-card__title"];

    if (!this.titleModifiers()) {
      classList.push("tedi-table-card__title--body");
    }

    return classList.join(" ");
  });

  handleToggle(): void {
    this.open.set(!this.open());
  }

  handleSelectedChange(event: Event): void {
    this.selected.set((event.target as HTMLInputElement).checked);
  }
}
