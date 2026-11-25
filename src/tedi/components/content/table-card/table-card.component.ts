import { _IdGenerator } from "@angular/cdk/a11y";
import { NgTemplateOutlet } from "@angular/common";
import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  isDevMode,
  model,
  ViewEncapsulation,
} from "@angular/core";
import {
  BreakpointInputs,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { CollapseButtonComponent } from "../../buttons/collapse-button/collapse-button.component";
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
  TableCardArrowType,
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
   * Width of the label column in horizontal layout. A `number` is pixels.
   * @default var(--text-group-label-width-sm) horizontal, auto vertical
   */
  labelWidth?: string | number;
  /**
   * Alignment of label text in horizontal layout. Defaults to `right` so
   * labels sit against the gutter. Vertical rows always align left.
   */
  labelAlign?: TableCardAlign;
  /**
   * Alignment of value content in horizontal layout, independent of `labelAlign`.
   * Defaults to `right`. Vertical rows always align left.
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
   * Card padding; same values as `tedi-card-content`.
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
 * marks content for the end of the header.
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
    CollapseButtonComponent,
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
   * Title shown in the header, including when collapsed. Provide one for a
   * visible collapse heading. It also names the toggle of a `collapsible` card,
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
   * Style of the collapse indicator when `collapsible`: a plain chevron, or a
   * circular outlined arrow (`secondary`).
   * @default default
   */
  arrowType = input<TableCardArrowType>("default");
  /**
   * Whether the body is expanded when `collapsible` is set.
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
   * when there is no title or subtitle.
   */
  ariaLabel = input<string>();

  layout = input<TableCardLayout | undefined>("horizontal");
  columns = input<number | undefined>(1);
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
  readonly titleGroupId = this.idGenerator.getId("tedi-table-card-title-group");
  readonly selectId = this.idGenerator.getId("tedi-table-card-select");

  readonly breakpointInputs = computed(() =>
    this.breakpointService.getBreakpointInputs<TableCardInputs>({
      layout: this.layout(),
      columns: this.columns(),
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

  private readonly endSlot = contentChild(TableCardEndSlotDirective, {
    descendants: false,
  });

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

  readonly resolvedPaddingSides = computed(() =>
    getTableCardPaddingSides(this.resolvedPadding()),
  );

  /**
   * For headers without a separator, the body's top padding provides the gap.
   */
  readonly headerPadding = computed<CardPadding>(() => {
    if (this.collapsible()) return this.resolvedPadding();

    const { top, right, left } = this.resolvedPaddingSides();

    return { top, right, bottom: 0, left };
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

  constructor() {
    effect(() => {
      if (
        isDevMode() &&
        this.collapsible() &&
        !this.hasTitleGroup() &&
        !this.ariaLabel()
      ) {
        console.warn(
          'tedi-table-card: a `collapsible` card needs a `title`, `subtitle` or `ariaLabel` so its toggle is named after the card, not just "open" / "close".',
        );
      }
    });
  }

  handleHeaderClick(event: MouseEvent): void {
    const target = event.target as Element | null;

    if (
      target?.closest(
        'a, button, input, select, textarea, label, [role="button"], [role="combobox"], [role="link"]',
      )
    ) {
      return;
    }

    this.open.set(!this.open());
  }

  handleSelectedChange(event: Event): void {
    this.selected.set((event.target as HTMLInputElement).checked);
  }
}
