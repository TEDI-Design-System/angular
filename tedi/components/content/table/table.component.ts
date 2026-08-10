import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  type ElementRef,
  inject,
  Injector,
  input,
  PLATFORM_ID,
  signal,
  Signal,
  TemplateRef,
  untracked,
  ViewEncapsulation,
  viewChild,
  output,
  type WritableSignal,
} from "@angular/core";
import { CommonModule, isPlatformBrowser } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  CdkDrag,
  type CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from "@angular/cdk/drag-drop";
import { CdkScrollable } from "@angular/cdk/scrolling";
import {
  type CellContext,
  type Column,
  type ColumnDef,
  type ColumnFiltersState,
  type ColumnOrderState,
  createAngularTable,
  type ExpandedState,
  type FilterFn,
  FlexRenderDirective,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type PaginationState,
  type Row,
  type RowSelectionState,
  type SortingState,
  type Table as TanstackTable,
  type Updater,
  type VisibilityState,
} from "@tanstack/angular-table";
import { generateUUID } from "../../../helpers/generate-uuid";
import { PaginationComponent } from "../../navigation/pagination/pagination.component";
import { TediPaginationResultsDirective } from "../../navigation/pagination/pagination-results.directive";
import type { PaginationPageSizeOption } from "../../navigation/pagination/pagination.types";
import { TediTableHeaderButtonComponent } from "./table-header-button/table-header-button.component";
import { CheckboxComponent } from "../../form/checkbox/checkbox.component";
import { RadioComponent } from "../../form/radio/radio.component";
import { TextFieldComponent } from "../../form/text-field/text-field.component";
import { FormFieldComponent } from "../../form/form-field/form-field.component";
import { IconComponent } from "../../base/icon/icon.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import {
  CollapseButtonComponent,
  type CollapseButtonArrowType,
} from "../../buttons/collapse-button/collapse-button.component";
import { PopoverComponent } from "../../overlay/popover/popover.component";
import { PopoverContentComponent } from "../../overlay/popover/popover-content/popover-content.component";
import { PopoverTriggerDirective } from "../../overlay/popover/popover-trigger/popover-trigger.directive";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TABLE_CONTEXT } from "./table.context";
import { computeGroupSpans } from "./row-span.utils";
import {
  createTablePersistence,
  type TablePersistenceController,
} from "./table.persistence";
import type {
  TableColumnMeta,
  TableControlColumn,
  TableExpandTrigger,
  TableFilterOptions,
  TablePaginationOptions,
  TablePersistOptions,
  TableSelectionMode,
  TableSize,
  TableState,
  TediColumnDef,
  TediTableContextValue,
  TediTableFilterContext,
  ColumnReorderPhase,
} from "./table.types";

const SELECT_COLUMN_ID = "__select__";
const EXPAND_COLUMN_ID = "__expand__";
const DRAG_COLUMN_ID = "__drag__";

/**
 * Fixed width (px) for the icon-only control columns (drag / select / expand).
 * Accounts for the cell's horizontal padding so the control still gets room.
 */
const CONTROL_COLUMN_WIDTH = 60;

/** Interactive controls inside a cell that should not trigger row activation. */
const INTERACTIVE_CELL_SELECTOR =
  "a, button, input, select, textarea, [role='button'], [role='checkbox'], [role='link'], [contenteditable='true']";

const passthroughFilter: FilterFn<unknown> = () => true;
const DEFAULT_FILTER_FNS = {
  text: passthroughFilter,
  select: passthroughFilter,
  "multi-select": passthroughFilter,
  "date-range": passthroughFilter,
  "date-range-period": passthroughFilter,
} as const;

// Singleton empty defaults — TanStack's row-model memos compare state slices by
// reference. Returning a fresh `[]`/`{}` from the options factory every render
// makes the memos think the slice changed, which fires `_autoResetPageIndex`
// → queues a pagination patch → re-renders → infinite loop. Reusing the same
// empty reference avoids that.
const EMPTY_ARRAY: never[] = Object.freeze([]) as never[];
const EMPTY_OBJECT: Record<string, never> = Object.freeze({}) as Record<
  string,
  never
>;

interface ResolvedPaginationOptions {
  pageSize: number;
  pageSizeOptions: (number | PaginationPageSizeOption)[] | false;
}

/**
 * Per-slot visual config forwarded to a `tedi-pagination` instance rendered by
 * the table. Mirrors the pagination component's inputs (defaults applied so the
 * template binds plain values, not `T | undefined`).
 */
interface ResolvedPaginationSlot {
  boundaryCount: number;
  siblingCount: number;
  labels: TablePaginationOptions["labels"];
  background: NonNullable<TablePaginationOptions["background"]>;
  dividerPosition: NonNullable<TablePaginationOptions["dividerPosition"]>;
  hideResults: NonNullable<TablePaginationOptions["hideResults"]>;
  hidePageSize: NonNullable<TablePaginationOptions["hidePageSize"]>;
  hidePager: NonNullable<TablePaginationOptions["hidePager"]>;
  hideArrows: NonNullable<TablePaginationOptions["hideArrows"]>;
  disableArrowsAtBoundary: boolean;
  arrowVariant: NonNullable<TablePaginationOptions["arrowVariant"]>;
  showArrowLabels: boolean;
  previousIcon: NonNullable<TablePaginationOptions["previousIcon"]>;
  nextIcon: NonNullable<TablePaginationOptions["nextIcon"]>;
  showModalTitle: boolean;
}

const SLOT_DEFAULTS_BOTTOM: ResolvedPaginationSlot = {
  boundaryCount: 1,
  siblingCount: 1,
  labels: undefined,
  background: "white",
  dividerPosition: "top",
  hideResults: false,
  hidePageSize: false,
  hidePager: false,
  hideArrows: false,
  disableArrowsAtBoundary: false,
  arrowVariant: "neutral",
  showArrowLabels: false,
  previousIcon: "arrow_back",
  nextIcon: "arrow_forward",
  showModalTitle: true,
};

const SLOT_DEFAULTS_TOP: ResolvedPaginationSlot = {
  ...SLOT_DEFAULTS_BOTTOM,
  dividerPosition: "bottom",
};

function resolveSlotOptions(
  value: boolean | TablePaginationOptions | undefined,
  defaults: ResolvedPaginationSlot,
): ResolvedPaginationSlot | null {
  if (!value) return null;
  if (value === true) return defaults;
  const merged = { ...defaults } as unknown as Record<string, unknown>;
  for (const key of Object.keys(defaults) as (keyof ResolvedPaginationSlot)[]) {
    const override = (value as Record<string, unknown>)[key];
    if (override !== undefined) merged[key] = override;
  }
  return merged as unknown as ResolvedPaginationSlot;
}

@Component({
  standalone: true,
  selector: "tedi-table",
  imports: [
    CommonModule,
    FormsModule,
    FlexRenderDirective,
    PaginationComponent,
    TediPaginationResultsDirective,
    TediTableHeaderButtonComponent,
    CheckboxComponent,
    RadioComponent,
    TextFieldComponent,
    FormFieldComponent,
    IconComponent,
    ButtonComponent,
    CollapseButtonComponent,
    PopoverComponent,
    PopoverContentComponent,
    PopoverTriggerDirective,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkScrollable,
  ],
  templateUrl: "./table.component.html",
  styleUrl: "./table.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "hostClasses()",
    "data-name": "tedi-table",
  },
  providers: [
    {
      provide: TEDI_TABLE_CONTEXT,
      useFactory: (component: TediTableComponent<unknown>) =>
        component.contextValue,
      deps: [TediTableComponent],
    },
  ],
})
export class TediTableComponent<TData> {
  /** Stable identifier used for synthetic ids. */
  readonly id = input<string | undefined>(undefined);
  /** Row data. */
  readonly data = input.required<TData[]>();
  /** Column definitions. */
  readonly columns = input.required<TediColumnDef<TData>[]>();
  /** Visual size. @default 'medium' */
  readonly size = input<TableSize>("medium");
  /** Caption rendered above the table. */
  readonly caption = input<TemplateRef<unknown> | string | undefined>(
    undefined,
  );
  /**
   * Alternating row backgrounds (zebra striping).
   * @default false
   */
  readonly striped = input(false, { transform: booleanAttribute });
  /**
   * Vertical separators between columns.
   * @default false
   */
  readonly verticalBorders = input(false, { transform: booleanAttribute });
  /**
   * Removes the table's outer border and corner radius.
   * @default false
   */
  readonly borderless = input(false, { transform: booleanAttribute });
  /**
   * Freezes the first column in place during horizontal scroll.
   * @default false
   */
  readonly stickyFirstColumn = input(false, { transform: booleanAttribute });
  /**
   * Pins `<thead>` to the top during vertical scroll. Requires `maxHeight` to
   * be set so the table has a scroll container.
   * @default false
   */
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  /**
   * Switches the table to `table-layout: fixed`, making column `size` /
   * `minSize` / `maxSize` authoritative — cell content wraps inside the
   * allotted width instead of stretching the column. With the default auto
   * layout, browsers size columns to content and the widths are only hints.
   * @default false
   */
  readonly fixedLayout = input(false, { transform: booleanAttribute });
  /**
   * Constrains the table's height and wraps it in a vertically scrollable
   * container. A number is treated as pixels; a string is used verbatim as a
   * CSS length. Pair with `stickyHeader` to keep the header visible while
   * scrolling.
   * @default undefined
   */
  readonly maxHeight = input<number | string | undefined>(undefined);
  /**
   * Id of the row to render in the active/highlighted state. Use to mark the
   * row whose detail is currently open elsewhere (e.g. a side panel).
   * @default undefined
   */
  readonly activeRowId = input<string | undefined>(undefined);
  /**
   * Whether selected rows get a background highlight. Default `true`.
   * Set to `false` when you want selection state for logic but not visual.
   * @default true
   */
  readonly selectedRowHighlight = input(true, { transform: booleanAttribute });
  /**
   * Forces the row hover background on (`true`) or off (`false`). When omitted,
   * hover styling tracks whether rows are interactive — on when `interactive`
   * is set or `expandTrigger` is `'row'`, off otherwise.
   * @default undefined
   */
  readonly rowHover = input<boolean | undefined>(undefined);
  /**
   * Enables row selection and renders the selection column. Pass `true` to
   * allow selecting any row, or a predicate `(row) => boolean` to gate which
   * rows are selectable. Pair with `selectionMode` for checkbox vs radio.
   * @default undefined
   */
  readonly enableRowSelection = input<
    boolean | ((row: Row<TData>) => boolean) | undefined
  >(undefined);
  /**
   * Whether row selection is multi- or single-row. `'multiple'` (default)
   * renders a checkbox per row + a select-all checkbox in the header.
   * `'single'` renders a radio per row (sharing one `name` so native HTML
   * group behaviour auto-deselects siblings) and omits the header control —
   * select-all is meaningless in single-select mode. Mirrors the React
   * Table's `selectionMode` prop.
   * @default 'multiple'
   */
  readonly selectionMode = input<TableSelectionMode>("multiple");
  /**
   * Forces TanStack's column-filter machinery on. Automatically enabled when
   * any column opts into the built-in `filterable` shorthand, so set this
   * explicitly only when wiring filters through `state` / `(stateChange)`
   * without using `filterable` columns.
   * @default false
   */
  readonly enableColumnFilters = input(false, { transform: booleanAttribute });
  /**
   * Template rendered as an expandable detail row beneath each expandable row.
   * Receives the TanStack `Row` as `$implicit` (`let-row`). Providing it
   * auto-adds the expand column; pair with `getRowCanExpand` to gate which
   * rows expand.
   * @default undefined
   */
  readonly renderSubComponent = input<
    TemplateRef<{ $implicit: Row<TData> }> | undefined
  >(undefined);
  /**
   * Predicate deciding whether a given row can expand. When omitted, every row
   * with a `renderSubComponent` / sub-rows is expandable.
   * @default undefined
   */
  readonly getRowCanExpand = input<((row: Row<TData>) => boolean) | undefined>(
    undefined,
  );
  /**
   * How an expandable row is toggled. `button` (default) — only the chevron
   * button toggles. `row` — clicking anywhere on the row toggles. The chevron
   * renders in the bordered `secondary` style regardless; use
   * `expandButtonVariant` to change it.
   * @default 'button'
   */
  readonly expandTrigger = input<TableExpandTrigger>("button");
  /**
   * Overrides the expand toggle button's arrow style. Defaults to the bordered
   * `secondary` style; set `default` for the neutral (borderless) chevron.
   * Only affects the icon-only button (i.e. when `expandButtonLabel` is unset).
   * @default undefined
   */
  readonly expandButtonVariant = input<CollapseButtonArrowType | undefined>(
    undefined,
  );
  /**
   * Renders a visible label next to the expand chevron instead of an icon-only
   * button. Pass a single string to use the same label in both states, or an
   * `{ open, close }` pair for distinct collapsed / expanded labels (`open` is
   * shown while collapsed, `close` while expanded). When unset, the button is
   * icon-only and its accessible name comes from the translated
   * expand/collapse-row labels.
   * @default undefined
   */
  readonly expandButtonLabel = input<
    string | { open: string; close: string } | undefined
  >(undefined);
  /**
   * Accessor returning a row's child rows, enabling hierarchical / tree data.
   * Children render as nested sub-rows under their parent and expand via the
   * same chevron.
   * @default undefined
   */
  readonly getSubRows = input<
    ((row: TData) => TData[] | undefined) | undefined
  >(undefined);
  /**
   * Accessor returning a stable, unique id for a row, passed straight through
   * to TanStack's `getRowId`. By default rows are keyed by their index, so
   * selection / expansion state breaks as soon as the data changes (filtering,
   * adding, removing, reordering rows). Key by an entity id instead — e.g.
   * `getRowId: (row) => row.id` — to keep `rowSelection` / `expanded` stable
   * across data updates and controllable from the outside by that id.
   * @default undefined
   */
  readonly getRowId = input<
    ((originalRow: TData, index: number, parent?: Row<TData>) => string) | undefined
  >(undefined);
  /**
   * Table-level row grouping key. When set, consecutive rendered rows with an
   * equal key form a group, and:
   * - the control columns (select / expand / drag) span each group — one
   *   checkbox and one chevron per group instead of per row,
   * - row selection operates per group (see `enableRowSelection`),
   * - group boundaries drive `rowGroupDividers`.
   *
   * Data columns opt into spanning the same groups with `groupBy: true`; a
   * column can also group independently with its own `groupBy: (row) => key`.
   * @default undefined
   */
  readonly groupRowsBy = input<((row: Row<TData>) => unknown) | undefined>(
    undefined,
  );
  /**
   * How row dividers are drawn when the table is grouped via `groupRowsBy`:
   * - `"all"` (default) — a divider under every row, as usual.
   * - `"between"` — dividers only at group boundaries; rows within a group
   *   read as one block.
   * - `"none"` — no row dividers.
   *
   * No effect when `groupRowsBy` is not set.
   * @default "all"
   */
  readonly rowGroupDividers = input<"all" | "between" | "none">("all");
  /**
   * Order of the auto-injected control columns (drag handle, selection
   * checkbox, expand chevron). Only the controls that are actually enabled
   * render; any enabled control omitted from this list is appended at the end.
   * Use it to e.g. place the checkbox before the expand chevron.
   * @default ["drag", "select", "expand"]
   */
  readonly controlColumnOrder = input<TableControlColumn[]>([
    "drag",
    "select",
    "expand",
  ]);
  /**
   * Enables pagination and configures the bottom paginator slot. This is also
   * the source of truth for `pageSize` / `pageSizeOptions` — the top slot
   * (if any) shares the same state. Pass `true` to enable with defaults,
   * `false` / omit to disable entirely.
   */
  readonly pagination = input<boolean | TablePaginationOptions | undefined>(
    undefined,
  );
  /**
   * Opt-in top paginator slot. Independent visual config from the bottom slot
   * (different `hide*` toggles, divider position, labels, etc.) but shares
   * page / page-size state with the bottom slot. Requires `pagination` to be
   * truthy — if pagination as a feature is off, the top slot does not render.
   * @default undefined
   */
  readonly paginationTop = input<boolean | TablePaginationOptions | undefined>(
    undefined,
  );
  /**
   * Switch pagination to server-side mode: the table renders `data` as the
   * current page as-is and does not slice it. Supply `pageCount` or `rowCount`.
   * @default false
   */
  readonly manualPagination = input(false, { transform: booleanAttribute });
  /**
   * Switch sorting to server-side mode: the table emits sort state via
   * `(stateChange)` but does not reorder `data` itself.
   * @default false
   */
  readonly manualSorting = input(false, { transform: booleanAttribute });
  /**
   * Switch filtering to server-side mode: the table emits filter state via
   * `(stateChange)` but does not filter `data` itself.
   * @default false
   */
  readonly manualFiltering = input(false, { transform: booleanAttribute });
  /** Total page count for server-side pagination (`manualPagination`). */
  readonly pageCount = input<number | undefined>(undefined);
  /** Total row count for server-side pagination (`manualPagination`). */
  readonly rowCount = input<number | undefined>(undefined);
  /**
   * Controlled state. When provided, the table is fully controlled — render the
   * given slices and emit every change via `(stateChange)` for the consumer to
   * apply back.
   * @default undefined
   */
  readonly state = input<Partial<TableState> | undefined>(undefined);
  /**
   * Initial state for uncontrolled mode (seeds sorting / filters / pagination /
   * selection etc. on first render). Ignored once `state` is provided.
   * @default undefined
   */
  readonly defaultState = input<Partial<TableState> | undefined>(undefined);
  /**
   * Persist selected state slices to storage. `{ key, storage?, include? }` —
   * defaults to persisting user-preference slices (`columnVisibility`,
   * `columnOrder`, `rowOrder`, `columnSizing`).
   * @default undefined
   */
  readonly persist = input<TablePersistOptions | undefined>(undefined);
  /**
   * Empty-state content shown when there are no rows — a string or a
   * `TemplateRef`. Defaults to the translated `table.no-data` label.
   * @default undefined
   */
  readonly placeholder = input<TemplateRef<unknown> | string | undefined>(
    undefined,
  );
  /**
   * ARIA live-region role wrapping the empty-state placeholder — `'status'`
   * (polite) or `'alert'` (assertive). Omit for no live region.
   * @default undefined
   */
  readonly placeholderRole = input<"alert" | "status" | undefined>(undefined);
  /**
   * Adds clickable styling, role="button", and keyboard activation to rows.
   * Subscribe to `rowClick` to react when a row is activated. Defaults to
   * `false` — turn on when rows should behave like buttons.
   * @default false
   */
  readonly interactive = input(false, { transform: booleanAttribute });
  /**
   * Supplies an explicit accessible name for each interactive row. Without it,
   * a `role="button"` row's name is assembled from all its cell text — verbose
   * and confusing under a screen reader. Receives the TanStack `Row`; return a
   * concise label (e.g. the row's primary identifier). Only applied while
   * `interactive` is `true`.
   * @default undefined
   */
  readonly rowAriaLabel = input<((row: Row<TData>) => string) | undefined>(
    undefined,
  );
  /**
   * Makes data rows reorderable by **mouse drag and keyboard**. Mouse: drag a
   * row by its handle. Keyboard: `Tab` to a row's reorder handle, `Space`/`Enter`
   * to pick it up, Up/Down arrows to move it one position (clamped to the
   * current page), `Space`/`Enter` to drop, `Escape` to cancel. Every move is
   * emitted via `(rowDrop)` with **source `data` indices** — apply it with
   * `moveItemInArray(data, previousIndex, currentIndex)` and pass the new array
   * back via `[data]`. The `tedi-table--draggable` host modifier is added
   * automatically; pair with `table-layout: fixed` so the drag preview
   * preserves cell widths.
   * @default false
   */
  readonly reorderableRows = input(false, { transform: booleanAttribute });
  /**
   * Makes columns reorderable by **mouse drag and keyboard** on the header row.
   * Mouse: drag a header cell by its handle. Keyboard: `Tab` to a header,
   * `Space`/`Enter` to pick up the column, Left/Right arrows to move it,
   * `Space`/`Enter` to drop, `Escape` to cancel. Reorders the table's internal
   * `columnOrder` state directly — no consumer wiring needed beyond persisting
   * the state slice if desired.
   * @default false
   */
  readonly reorderableColumns = input(false, { transform: booleanAttribute });

  /**
   * Emits the full merged table state whenever any slice changes (sorting,
   * filters, pagination, selection, expansion, column visibility / order).
   * Use with `state` for controlled mode or to persist externally.
   */
  readonly stateChange = output<TableState>();
  /**
   * Emits the activated row. Only fires when `interactive` is `true` (click or
   * Enter/Space on a focused row).
   */
  readonly rowClick = output<Row<TData>>();
  /**
   * Fires when a row is dropped to a new position. `previousIndex` and
   * `currentIndex` are normalised to **source `data` array** positions — even
   * when the table is sorted, filtered, or paginated — so consumers can call
   * `moveItemInArray(data, previousIndex, currentIndex)` directly and pass the
   * reordered array back via `[data]`.
   */
  readonly rowDrop = output<CdkDragDrop<TData[]>>();

  protected readonly injector = inject(Injector);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly translation = inject(TediTranslationService);

  private readonly _hoveredRowId = signal<string | null>(null);
  /**
   * Id of the data row currently under the pointer, or `null`. Exposed so
   * cell templates can react to hover (e.g. emphasise a badge while its row is
   * hovered). Read it via a template reference: `#table` →
   * `table.hoveredRowId()`. Also available through `TEDI_TABLE_CONTEXT`.
   */
  readonly hoveredRowId = this._hoveredRowId.asReadonly();

  private readonly internalId = generateUUID();
  protected readonly resolvedId = computed(
    () => this.id() ?? `tedi-table-${this.internalId}`,
  );

  protected readonly placeholderLabel = this.translation.track("table.no-data");
  protected readonly rowDetailsLabel = this.translation.track(
    "table.row-details",
  );
  protected readonly dragColumnLabel = this.translation.track(
    "table.drag-column",
  );
  protected readonly dragRowLabel = this.translation.track("table.drag-row");
  protected readonly selectColumnLabel = this.translation.track(
    "table.select-column",
  );
  protected readonly expandColumnLabel = this.translation.track(
    "table.expand-column",
  );
  protected readonly reorderColumnLabel = this.translation.track(
    "table.reorder-column",
  );
  protected readonly scrollRegionLabel = this.translation.track(
    "table.scroll-region",
  );

  // ── Keyboard column-reorder state machine ──────────────────────────────────
  /** Currently picked-up column id (during keyboard reordering), or `null`. */
  private readonly _pickedUpColumnId = signal<string | null>(null);
  /** Column order snapshot captured when picking up — restored on cancel. */
  private _originalOrder: ColumnOrderState = [];
  /** Computed phase derived from whether a column is currently picked up. */
  protected readonly reorderPhase: Signal<ColumnReorderPhase> = computed(() =>
    this._pickedUpColumnId() !== null ? "picked-up" : "idle",
  );
  /** Id of the column under keyboard focus for reordering. */
  readonly pickedUpColumnId = this._pickedUpColumnId.asReadonly();

  // ── Keyboard row-reorder state machine ─────────────────────────────────────
  // Tracked by the row's `original` data reference (not `row.id`, which is
  // index-based by default and would change as rows reorder).
  private readonly _pickedUpRow = signal<TData | null>(null);
  /** Source `data` index of the picked-up row at pickup — used to restore on
   *  cancel. */
  private _originalRowSourceIndex = -1;
  /** The data item of the row currently picked up for keyboard reordering. */
  readonly pickedUpRow = this._pickedUpRow.asReadonly();

  // Live-region id for announcing reorder events to screen readers.
  protected liveRegionId = `tedi-table-live-${generateUUID()}`;

  private readonly persistence: TablePersistenceController;
  protected readonly tableState: Signal<TableState>;

  protected readonly SELECT_COLUMN_ID = SELECT_COLUMN_ID;
  protected readonly EXPAND_COLUMN_ID = EXPAND_COLUMN_ID;
  protected readonly DRAG_COLUMN_ID = DRAG_COLUMN_ID;

  private readonly paginationOptions = computed<ResolvedPaginationOptions | null>(
    () => {
      const value = this.pagination();
      if (!value) return null;
      if (value === true)
        return { pageSize: 10, pageSizeOptions: [10, 25, 50] };
      return {
        pageSize: value.pageSize ?? 10,
        pageSizeOptions:
          value.pageSizeOptions === undefined
            ? [10, 25, 50]
            : value.pageSizeOptions,
      };
    },
  );

  protected readonly paginationEnabled = computed(
    () => this.paginationOptions() !== null,
  );

  protected readonly paginationPageSizeOptions = computed<
    (number | PaginationPageSizeOption)[]
  >(() => {
    const opts = this.paginationOptions()?.pageSizeOptions;
    return Array.isArray(opts) && opts.length > 0 ? opts : [];
  });

  protected readonly resolvedBottomSlot = computed<ResolvedPaginationSlot | null>(
    () => {
      if (!this.paginationEnabled()) return null;
      return resolveSlotOptions(this.pagination(), SLOT_DEFAULTS_BOTTOM);
    },
  );

  protected readonly resolvedTopSlot = computed<ResolvedPaginationSlot | null>(
    () => {
      if (!this.paginationEnabled()) return null;
      return resolveSlotOptions(this.paginationTop(), SLOT_DEFAULTS_TOP);
    },
  );

  /**
   * Which slot the `[tediPaginationResults]` projection should be rendered in.
   * Picks whichever paginator actually shows results; defaults to the bottom
   * when both do, falls back to the top when bottom hides results.
   */
  protected readonly resultsRenderTarget = computed<"top" | "bottom" | null>(
    () => {
      const top = this.resolvedTopSlot();
      const bottom = this.resolvedBottomSlot();
      const topShows = top !== null && top.hideResults !== true;
      const bottomShows = bottom !== null && bottom.hideResults !== true;
      if (bottomShows) return "bottom";
      if (topShows) return "top";
      return null;
    },
  );

  /**
   * Captures a `<ng-template tediPaginationResults>` declared inside the
   * `<tedi-table>` host. Read as a `TemplateRef` (the directive is a bare
   * marker) and forwarded — projected as `<span tediPaginationResults>` — into
   * whichever paginator slot is set to display results.
   */
  private readonly customResultsTemplateRef = contentChild(
    TediPaginationResultsDirective,
    { read: TemplateRef },
  );
  protected readonly customResultsTemplate = computed(
    () => this.customResultsTemplateRef() ?? null,
  );
  protected readonly topResultsTemplate = computed(() =>
    this.resultsRenderTarget() === "top" ? this.customResultsTemplate() : null,
  );
  protected readonly bottomResultsTemplate = computed(() =>
    this.resultsRenderTarget() === "bottom"
      ? this.customResultsTemplate()
      : null,
  );

  private readonly paginationHostClasses = computed(() => {
    const classes: string[] = [];
    if (this.paginationEnabled()) classes.push("tedi-table--has-pagination");
    if (this.resolvedTopSlot()) classes.push("tedi-table--has-pagination-top");
    if (this.resolvedBottomSlot())
      classes.push("tedi-table--has-pagination-bottom");
    return classes;
  });

  private readonly hasExpansion = computed(() =>
    Boolean(this.renderSubComponent() || this.getSubRows()),
  );
  private readonly hasSelection = computed(() =>
    Boolean(this.enableRowSelection()),
  );
  /**
   * True when any column has `filterable` truthy. The table forces TanStack's
   * column-filter machinery on in this case so per-column `getCanFilter()`
   * returns true and the trigger button renders — without forcing the
   * legacy inline filter row.
   */
  private readonly hasFilterableColumns = computed(() =>
    this.columns().some((col) => Boolean(col.filterable)),
  );

  private readonly augmentedColumns = computed<TediColumnDef<TData>[]>(() => {
    const cols = this.columns();
    // When the table is grouped, the control columns span each group too —
    // one checkbox / chevron / drag handle per group instead of per row.
    const controlGroupBy = this.groupRowsBy() !== undefined ? true : undefined;

    const controls: Partial<Record<TableControlColumn, TediColumnDef<TData>>> =
      {};

    if (this.reorderableRows()) {
      controls.drag = {
        id: DRAG_COLUMN_ID,
        enableSorting: false,
        enableHiding: false,
        enableColumnFilter: false,
        size: CONTROL_COLUMN_WIDTH,
        minSize: CONTROL_COLUMN_WIDTH,
        maxSize: CONTROL_COLUMN_WIDTH,
        header: "",
        cell: () => "",
        meta: { align: "center", vAlign: "top" },
        groupBy: controlGroupBy,
      } as TediColumnDef<TData>;
    }

    if (this.hasSelection()) {
      controls.select = {
        id: SELECT_COLUMN_ID,
        enableSorting: false,
        enableHiding: false,
        enableColumnFilter: false,
        size: CONTROL_COLUMN_WIDTH,
        minSize: CONTROL_COLUMN_WIDTH,
        maxSize: CONTROL_COLUMN_WIDTH,
        header: "",
        cell: () => "",
        meta: { align: "center", vAlign: "top" },
        groupBy: controlGroupBy,
      } as TediColumnDef<TData>;
    }

    if (this.hasExpansion()) {
      // Icon-only toggles are pinned to the control-column width; a visible
      // label needs room, so fall back to TanStack's default sizing then.
      const iconOnly = !this.expandButtonHasLabel();
      controls.expand = {
        id: EXPAND_COLUMN_ID,
        enableSorting: false,
        enableHiding: false,
        enableColumnFilter: false,
        size: iconOnly ? CONTROL_COLUMN_WIDTH : undefined,
        minSize: iconOnly ? CONTROL_COLUMN_WIDTH : undefined,
        maxSize: iconOnly ? CONTROL_COLUMN_WIDTH : undefined,
        header: "",
        cell: () => "",
        meta: iconOnly
          ? { align: "center", vAlign: "top" }
          : { vAlign: "top" },
        groupBy: controlGroupBy,
      } as TediColumnDef<TData>;
    }

    const order = [...new Set(this.controlColumnOrder())];
    const ordered = order
      .map((key) => controls[key])
      .filter((col): col is TediColumnDef<TData> => col !== undefined);
    // Append any enabled control the consumer left out of the order list.
    const leading = [
      ...ordered,
      ...(Object.keys(controls) as TableControlColumn[])
        .filter((key) => !order.includes(key))
        .map((key) => controls[key]!),
    ];

    return [...leading, ...cols];
  });

  /**
   * Per-column group spans (`columnId → (rowId → span)`), computed from the
   * live row model for every column that opts into grouping via `groupBy`.
   * A `groupBy: true` column reuses the table-level `groupRowsBy` key.
   */
  protected readonly groupSpansByColumn = computed<
    Map<string, Map<string, number>>
  >(() => {
    const rows = this.rows();
    const tableKey = this.groupRowsBy();
    const result = new Map<string, Map<string, number>>();

    for (const col of this.leafColumns()) {
      const groupBy = (col.columnDef as TediColumnDef<TData>).groupBy;
      if (!groupBy) continue;
      const keyFn = groupBy === true ? tableKey : groupBy;
      if (!keyFn) continue;
      result.set(col.id, computeGroupSpans(rows, keyFn));
    }

    return result;
  });

  /**
   * Table-level row groups keyed by `groupRowsBy`: maps every row id to the
   * full set of rows in its (consecutive) group. Empty when the table is not
   * grouped. Drives group selection and group dividers.
   */
  protected readonly rowGroups = computed<Map<string, Row<TData>[]>>(() => {
    const keyFn = this.groupRowsBy();
    const rows = this.rows();
    const map = new Map<string, Row<TData>[]>();
    if (!keyFn) return map;

    let i = 0;
    while (i < rows.length) {
      const key = keyFn(rows[i]);
      let j = i + 1;
      while (j < rows.length && keyFn(rows[j]) === key) j++;
      const members = rows.slice(i, j);
      for (const member of members) map.set(member.id, members);
      i = j;
    }
    return map;
  });

  /** Row ids that start a group — used to draw dividers at group boundaries. */
  protected readonly groupStartRowIds = computed<Set<string>>(() => {
    const ids = new Set<string>();
    for (const members of this.rowGroups().values()) {
      if (members.length > 0) ids.add(members[0].id);
    }
    return ids;
  });

  private buildStateChangeHandlers() {
    const paginationEnabled = this.paginationEnabled();
    const paginationOpts = this.paginationOptions();
    return {
      onColumnVisibilityChange: (updater: Updater<VisibilityState>) =>
        this.applyPatch<VisibilityState>(
          updater,
          (prev) => prev.columnVisibility ?? {},
          (next) => ({ columnVisibility: next }),
        ),
      onColumnOrderChange: (updater: Updater<ColumnOrderState>) =>
        this.applyPatch<ColumnOrderState>(
          updater,
          (prev) => prev.columnOrder ?? [],
          (next) => ({ columnOrder: next }),
        ),
      onRowSelectionChange: (updater: Updater<RowSelectionState>) =>
        this.applyPatch<RowSelectionState>(
          updater,
          (prev) => prev.rowSelection ?? {},
          (next) => ({ rowSelection: next }),
        ),
      onExpandedChange: (updater: Updater<ExpandedState>) =>
        this.applyPatch<ExpandedState>(
          updater,
          (prev) => prev.expanded ?? {},
          (next) => ({ expanded: next }),
        ),
      onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) =>
        this.applyPatch<ColumnFiltersState>(
          updater,
          (prev) => prev.columnFilters ?? [],
          (next) => ({ columnFilters: next }),
        ),
      onSortingChange: (updater: Updater<SortingState>) =>
        this.applyPatch<SortingState>(
          updater,
          (prev) => prev.sorting ?? [],
          (next) => ({ sorting: next }),
        ),
      onPaginationChange: paginationEnabled
        ? (updater: Updater<PaginationState>) =>
          this.applyPatch<PaginationState>(
            updater,
            (prev) =>
              prev.pagination ?? {
                pageIndex: 0,
                pageSize: paginationOpts?.pageSize ?? 10,
              },
            (next) => ({ pagination: next }),
          )
        : undefined,
    };
  }

  // Cache the default pagination object so it stays reference-stable across
  // factory runs. Recomputes only when the configured pageSize changes.
  private readonly defaultPagination = computed(() => ({
    pageIndex: 0,
    pageSize: this.paginationOptions()?.pageSize ?? 10,
  }));

  private buildResolvedState() {
    const stateValue = this.tableState();
    return {
      columnVisibility: stateValue.columnVisibility,
      columnOrder: stateValue.columnOrder ?? (EMPTY_ARRAY as ColumnOrderState),
      rowSelection:
        stateValue.rowSelection ?? (EMPTY_OBJECT as RowSelectionState),
      expanded: stateValue.expanded ?? (EMPTY_OBJECT as ExpandedState),
      columnFilters:
        stateValue.columnFilters ?? (EMPTY_ARRAY as ColumnFiltersState),
      sorting: stateValue.sorting ?? (EMPTY_ARRAY as SortingState),
      pagination: this.paginationEnabled()
        ? (stateValue.pagination ?? this.defaultPagination())
        : undefined,
    };
  }

  // Use `as` cast to drop the Signal<Table<T>> intersection from the public
  // declaration — ng-packagr trips on Angular's private `SIGNAL` symbol.
  protected readonly table: TanstackTable<TData> = createAngularTable<TData>(
    () => {
      const renderSub = this.renderSubComponent();
      const manualPagination = this.manualPagination();
      const manualFiltering = this.manualFiltering();
      const manualSorting = this.manualSorting();
      const paginationEnabled = this.paginationEnabled();
      const pageCount = this.pageCount();
      const rowCount = this.rowCount();

      return {
        data: this.data(),
        columns: this.augmentedColumns() as ColumnDef<TData>[],
        state: this.buildResolvedState(),
        enableRowSelection: this.enableRowSelection(),
        enableMultiRowSelection: this.selectionMode() === "multiple",
        // Force column-filter machinery on when any column opts into the
        // built-in `filterable` shorthand — without this, `getCanFilter()`
        // returns false and the trigger button never renders.
        enableColumnFilters:
          this.enableColumnFilters() || this.hasFilterableColumns(),
        manualPagination,
        manualSorting,
        manualFiltering,
        pageCount:
          manualPagination && pageCount !== undefined ? pageCount : undefined,
        rowCount:
          manualPagination && rowCount !== undefined ? rowCount : undefined,
        getRowId: this.getRowId(),
        getRowCanExpand: renderSub
          ? (this.getRowCanExpand() ?? (() => true))
          : this.getRowCanExpand(),
        getSubRows: this.getSubRows(),
        // For tree data, keep a parent (and show only the matching descendants)
        // when a leaf matches — otherwise a filter that doesn't match the parent
        // row drops its whole subtree. No-op for flat data (every row is a leaf).
        filterFromLeafRows: true,
        ...this.buildStateChangeHandlers(),
        filterFns: DEFAULT_FILTER_FNS as Record<string, FilterFn<TData>>,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: manualFiltering
          ? undefined
          : getFilteredRowModel(),
        getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
        getExpandedRowModel: this.hasExpansion()
          ? getExpandedRowModel()
          : undefined,
        getPaginationRowModel:
          paginationEnabled && !manualPagination
            ? getPaginationRowModel()
            : undefined,
        // Keep expanded sub-rows on their parent's page instead of counting
        // them against pageSize — otherwise expanding a row pushes root rows
        // off the page (they appear hidden). TanStack defaults this to true.
        // Only set false when the client-side pagination row model runs:
        // with `false`, sub-row flattening happens exclusively inside
        // getPaginationRowModel, so without it expansion would never render.
        paginateExpandedRows: !(paginationEnabled && !manualPagination),
      };
    },
  ) as unknown as TanstackTable<TData>;

  readonly contextValue: TediTableContextValue<TData>;

  // The TanStack proxy uses `equal: () => false` on its inner table signal —
  // reading proxy methods inside a computed makes Angular think the signal
  // changes on every read and schedules endless CD cycles. So we depend on
  // *our* inputs explicitly (single source of truth) and read the proxy
  // methods through `untracked()` to break the false-equality cascade.
  private trackTableInputs(): void {
    this.data();
    this.augmentedColumns();
    this.tableState();
    this.manualPagination();
    this.manualSorting();
    this.manualFiltering();
    this.rowCount();
    this.pageCount();
    this.enableColumnFilters();
    this.hasFilterableColumns();
    this.enableRowSelection();
    this.paginationOptions();
    this.getRowId();
  }

  protected readonly hostClasses = computed(() => {
    const rowExpand = this.expandTrigger() === "row";
    const hoverEnabled = this.rowHover() ?? (this.interactive() || rowExpand);
    const flags: [boolean, string][] = [
      [this.striped(), "tedi-table--striped"],
      [this.verticalBorders(), "tedi-table--vertical-borders"],
      [this.borderless(), "tedi-table--borderless"],
      [this.stickyFirstColumn(), "tedi-table--sticky-first-column"],
      [this.stickyHeader(), "tedi-table--sticky-header"],
      [this.fixedLayout(), "tedi-table--fixed-layout"],
      [this.interactive() || rowExpand, "tedi-table--clickable-rows"],
      [hoverEnabled, "tedi-table--row-hover"],
      [this.reorderableRows() || this.reorderableColumns(), "tedi-table--draggable"],
    ];
    const classes = ["tedi-table", `tedi-table--${this.size()}`];
    for (const [on, name] of flags) if (on) classes.push(name);
    if (this.groupRowsBy() && this.rowGroupDividers() !== "all") {
      classes.push(`tedi-table--group-dividers-${this.rowGroupDividers()}`);
    }
    classes.push(...this.paginationHostClasses());
    this.trackTableInputs();
    if (untracked(() => this.table.getHeaderGroups().length) > 1)
      classes.push("tedi-table--grouped-headers");
    return classes.join(" ");
  });

  protected readonly headerGroups = computed(() => {
    this.trackTableInputs();
    return untracked(() => this.table.getHeaderGroups());
  });

  protected readonly rows = computed(() => {
    this.trackTableInputs();
    return untracked(() => this.table.getRowModel().rows);
  });

  protected readonly leafColumns = computed(() => {
    this.trackTableInputs();
    return untracked(() => this.table.getVisibleLeafColumns());
  });

  protected readonly leafColumnCount = computed(
    () => this.leafColumns().length,
  );

  protected readonly footerGroups = computed(() => {
    this.trackTableInputs();
    return untracked(() => this.table.getFooterGroups());
  });

  protected readonly hasFooter = computed(() =>
    this.footerGroups().some((group) =>
      group.headers.some(
        (header) => header.column.columnDef.footer !== undefined,
      ),
    ),
  );

  protected readonly headerRowCount = computed(
    () => this.headerGroups().length + (this.enableColumnFilters() ? 1 : 0),
  );

  protected readonly totalDataRowCount = computed(() => {
    if (!this.paginationEnabled()) return this.rows().length;
    const rowCount = this.rowCount();
    if (rowCount !== undefined) return rowCount;
    this.trackTableInputs();
    return untracked(() => this.table.getFilteredRowModel().rows.length);
  });

  /**
   * `aria-rowcount` / `aria-rowindex` only apply to genuine grid rows (role
   * `row`). When `interactive` is on, each `<tr>` takes `role="button"`, which
   * does not allow `aria-rowindex` — so the whole row-indexing scheme is
   * disabled to avoid an invalid-ARIA violation.
   */
  protected readonly ariaRowIndexingEnabled = computed(
    () => this.paginationEnabled() && !this.interactive(),
  );

  protected readonly ariaRowCount = computed(() =>
    this.ariaRowIndexingEnabled()
      ? this.headerRowCount() + this.totalDataRowCount()
      : null,
  );

  // aria-rowindex per rendered row, keyed by row id. Pagination counts only
  // top-level rows (paginateExpandedRows is false), so aria-rowcount reflects
  // root rows alone. We index roots sequentially across pages and leave
  // expanded sub-rows without an index — otherwise their flattened position
  // would inflate later roots' indices and overflow aria-rowcount.
  protected readonly rowAriaIndexById = computed(() => {
    const map = new Map<string, number | null>();
    if (!this.ariaRowIndexingEnabled()) return map;
    const header = this.headerRowCount();
    const pagination = untracked(() => this.table.getState().pagination);
    const pageStart = pagination.pageIndex * pagination.pageSize;
    let rootOrdinal = 0;
    for (const row of this.rows()) {
      if (row.depth === 0) {
        map.set(row.id, header + pageStart + rootOrdinal + 1);
        rootOrdinal += 1;
      } else {
        map.set(row.id, null);
      }
    }
    return map;
  });

  protected readonly paginationPage = computed(() => {
    this.trackTableInputs();
    return untracked(() => this.table.getState().pagination.pageIndex + 1);
  });

  protected readonly paginationPageSize = computed(() => {
    this.trackTableInputs();
    return untracked(() => this.table.getState().pagination.pageSize);
  });

  protected readonly paginationTotalItems = computed(() => {
    this.trackTableInputs();
    const rowCount = this.rowCount();
    if (rowCount !== undefined) return rowCount;
    return untracked(() => this.table.getFilteredRowModel().rows.length);
  });

  protected readonly paginationPageCount = computed(() => {
    this.trackTableInputs();
    return untracked(() => Math.max(1, this.table.getPageCount()));
  });

  protected readonly maxHeightStyle = computed(() => {
    const value = this.maxHeight();
    if (value === undefined) return null;
    const resolved = typeof value === "number" ? `${value}px` : value;
    return `max-height: ${resolved}; overflow-y: auto`;
  });

  protected readonly isAllPageRowsSelected = computed(() => {
    this.trackTableInputs();
    return untracked(() => this.table.getIsAllPageRowsSelected());
  });

  protected readonly isSomePageRowsSelected = computed(() => {
    this.trackTableInputs();
    return untracked(() => this.table.getIsSomePageRowsSelected());
  });

  constructor() {
    this.persistence = createTablePersistence({
      persist: this.persist(),
      controlled: this.state(),
      defaultState: () => this.defaultState(),
      onStateChange: (next) => this.stateChange.emit(next),
    });
    this.tableState = this.persistence.state;

    this.contextValue = {
      table: computed(() => {
        this.tableState();
        return untracked(() => this.table);
      }),
      size: this.size,
      id: this.resolvedId,
      state: this.tableState,
      hoveredRowId: this.hoveredRowId,
    };

    effect(() => this.persistence.setControlled(this.state()));
    effect(() => this.persistence.setPersist(this.persist()));
    // Keep the filter-popover drafts aligned with the applied filter state so a
    // reset (clearFilters(), controlled state, a removed chip) doesn't leave a
    // reopened popover showing stale inputs / checkboxes.
    effect(() => {
      const filters = this.tableState().columnFilters ?? [];
      untracked(() => this.reconcileFilterDrafts(filters));
    });
  }

  private applyPatch<T>(
    updater: Updater<T>,
    getPrev: (state: TableState) => T,
    toPatch: (next: T) => Partial<TableState>,
  ): void {
    this.persistence.patch((state) => {
      const previous = getPrev(state);
      const next =
        typeof updater === "function"
          ? (updater as (prev: T) => T)(previous)
          : updater;
      return toPatch(next);
    });
  }

  /**
   * Clears every active column filter in one call, resetting all `filterable`
   * columns at once. Routes through the same state machinery as the per-column
   * **Clear** buttons, so it updates internal state, respects a controlled
   * `state` input, and emits `(stateChange)`. Grab a component reference (e.g.
   * a template ref `#table` or `viewChild`) to call it from consumer code.
   */
  clearFilters(): void {
    // `true` forces the empty state rather than TanStack's `initialState`
    // filters, so a controlled table always resets to no filters.
    this.table.resetColumnFilters(true);
  }

  protected handleRowClick(event: Event, row: Row<TData>): void {
    // Clicks that land on an interactive control inside a cell (checkbox,
    // link, button, form field, …) must not also activate the row or toggle
    // its expansion — so consumers don't need to add `stopPropagation` by hand.
    if (this.isInteractiveTarget(event)) return;
    // A click that ends a text drag-select shouldn't activate the row —
    // otherwise copying cell text inadvertently fires the row action.
    if (this.hasTextSelection()) return;
    if (this.expandTrigger() === "row" && row.getCanExpand()) {
      row.toggleExpanded();
    }
    if (this.interactive()) {
      this.rowClick.emit(row);
    }
  }

  /**
   * True when the click originated on an interactive control between the event
   * target and the row element (exclusive), so row-level handlers can bow out.
   */
  private isInteractiveTarget(event: Event): boolean {
    const row = event.currentTarget as Element | null;
    let el = event.target as Element | null;
    while (el && el !== row) {
      if (el instanceof HTMLLabelElement) {
        if (el.control) return true;
      } else if (el.matches(INTERACTIVE_CELL_SELECTOR)) {
        return true;
      }
      el = el.parentElement;
    }
    return false;
  }

  private hasTextSelection(): boolean {
    if (typeof window === "undefined") return false;
    const selection = window.getSelection();
    return Boolean(
      selection &&
      !selection.isCollapsed &&
      selection.toString().trim().length > 0,
    );
  }

  /** Accessible name for an interactive row, from `rowAriaLabel`. `null` when
   *  the row is not interactive or no resolver is provided. */
  protected rowAriaLabelFor(row: Row<TData>): string | null {
    if (!this.interactive()) return null;
    return this.rowAriaLabel()?.(row) ?? null;
  }

  protected rowExpandsOnClick(row: Row<TData>): boolean {
    return this.expandTrigger() === "row" && row.getCanExpand();
  }

  protected rowHasNestedInteractive(row: Row<TData>): boolean {
    return (
      this.hasSelection() ||
      this.reorderableRows() ||
      (this.hasExpansion() && row.getCanExpand())
    );
  }

  protected handleRowMouseEnter(row: Row<TData>): void {
    this._hoveredRowId.set(row.id);
  }

  protected handleRowMouseLeave(): void {
    this._hoveredRowId.set(null);
  }

  /**
   * Consumer-authored sizing per column id, read from the *original* column
   * defs (`augmentedColumns`) — TanStack merges its defaults
   * (`size: 150`, `minSize: 20`, `maxSize: Number.MAX_SAFE_INTEGER`) into the
   * resolved `column.columnDef`, so that copy can't tell "set" from "default".
   */
  private readonly authoredColumnSizing = computed(() => {
    const map = new Map<
      string,
      { hasSize: boolean; minSize?: number; maxSize?: number }
    >();
    for (const def of this.augmentedColumns()) {
      const col = def as TediColumnDef<TData> & { accessorKey?: string };
      const id =
        col.id ?? (typeof col.accessorKey === "string" ? col.accessorKey : undefined);
      if (id === undefined) continue;
      map.set(id, {
        hasSize:
          col.size !== undefined ||
          col.minSize !== undefined ||
          col.maxSize !== undefined,
        minSize: col.minSize,
        maxSize: col.maxSize,
      });
    }
    return map;
  });

  /**
   * Rendered `width` (px) for a column's cells. Under `fixedLayout`, only
   * explicitly-sized columns get a width so the unsized ones absorb the
   * leftover space (otherwise fixed layout scales every column up to fill the
   * table). In auto layout the (clamped) size is emitted as a hint for all.
   */
  protected headerCellWidth(column: {
    id: string;
    getSize: () => number;
  }): number | null {
    if (this.fixedLayout() && !this.authoredColumnSizing().get(column.id)?.hasSize)
      return null;
    return column.getSize() || null;
  }

  /** Consumer-set `min-width` (px); `null` when not set (TanStack's default
   *  `20` is not emitted as CSS). */
  protected columnMinWidth(column: { id: string }): number | null {
    return this.authoredColumnSizing().get(column.id)?.minSize ?? null;
  }

  /** Consumer-set `max-width` (px); `null` when not set (TanStack's default
   *  `Number.MAX_SAFE_INTEGER` is not emitted as CSS). */
  protected columnMaxWidth(column: { id: string }): number | null {
    return this.authoredColumnSizing().get(column.id)?.maxSize ?? null;
  }

  /**
   * Columns frozen by `stickyFirstColumn`, keyed by id: the leading control
   * columns (select / expand / drag) plus the first content column, pinned
   * together as one block. `left` is the cumulative offset; `start` / `edge`
   * mark the block's left and right edges (the right edge draws the divider).
   * Empty when `stickyFirstColumn` is off.
   */
  protected readonly stickyLeftColumns = computed<
    Map<string, { left: number; start: boolean; edge: boolean }>
  >(() => {
    const map = new Map<string, { left: number; start: boolean; edge: boolean }>();
    if (!this.stickyFirstColumn()) return map;

    const leaf = this.leafColumns();
    const controlIds = new Set<string>([
      DRAG_COLUMN_ID,
      SELECT_COLUMN_ID,
      EXPAND_COLUMN_ID,
    ]);
    const frozen: typeof leaf = [];
    let i = 0;
    while (i < leaf.length && controlIds.has(leaf[i].id)) frozen.push(leaf[i++]);
    if (i < leaf.length) frozen.push(leaf[i]); // first content column

    let left = 0;
    frozen.forEach((col, idx) => {
      map.set(col.id, {
        left,
        start: idx === 0,
        edge: idx === frozen.length - 1,
      });
      left += col.getSize();
    });
    return map;
  });

  /** Sticky `left` (px) for a frozen column; `null` when the column isn't frozen. */
  protected stickyLeft(id: string): number | null {
    return this.stickyLeftColumns().get(id)?.left ?? null;
  }

  /** Sticky-column class fragment for a cell (`""` when not frozen). */
  protected stickyLeftClass(id: string): string {
    const info = this.stickyLeftColumns().get(id);
    if (!info) return "";
    return (
      " tedi-table__cell--sticky-left" +
      (info.start ? " tedi-table__cell--sticky-left-start" : "") +
      (info.edge ? " tedi-table__cell--sticky-left-edge" : "")
    );
  }

  protected handleRowKeydown(event: KeyboardEvent, row: Row<TData>): void {
    if (!this.interactive()) return;
    if (event.target !== event.currentTarget) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.rowClick.emit(row);
    }
  }

  protected handleRowDrop(event: CdkDragDrop<TData[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    // The CDK event reports indices against the rendered row collection. When
    // pagination / sorting / filtering is on, those don't match the source
    // `data` array — consumers calling `moveItemInArray(data, ...)` with the
    // raw indices would corrupt order. Map view indices → source indices by
    // looking up `row.original` in the data array.
    const renderedRows = this.rows();
    const data = this.data();
    const previousRow = renderedRows[event.previousIndex];
    const currentRow = renderedRows[event.currentIndex];
    if (!previousRow || !currentRow) {
      this.rowDrop.emit(event);
      return;
    }
    const previousSourceIndex = data.indexOf(previousRow.original);
    const currentSourceIndex = data.indexOf(currentRow.original);
    if (previousSourceIndex === -1 || currentSourceIndex === -1) {
      this.rowDrop.emit(event);
      return;
    }
    this.rowDrop.emit({
      ...event,
      previousIndex: previousSourceIndex,
      currentIndex: currentSourceIndex,
    });
  }

  // ── Keyboard row-reorder handlers ──────────────────────────────────────────
  /** Stable id for a row's reorder handle button — used to restore keyboard
   *  focus after a live move relocates it. */
  protected rowReorderHandleId(rowId: string): string {
    return `${this.resolvedId()}-row-reorder-${rowId}`;
  }

  /** Emit a synthetic `(rowDrop)` carrying source `data` indices, matching the
   *  shape consumers already handle with `moveItemInArray`. */
  private emitRowMove(previousSourceIndex: number, currentSourceIndex: number): void {
    if (previousSourceIndex === currentSourceIndex) return;
    this.rowDrop.emit({
      previousIndex: previousSourceIndex,
      currentIndex: currentSourceIndex,
      item: null,
      container: null,
      previousContainer: null,
      isPointerOverContainer: false,
      distance: { x: 0, y: 0 },
      dropPoint: { x: 0, y: 0 },
      event: null,
    } as unknown as CdkDragDrop<TData[]>);
  }

  protected handleRowReorderKeydown(event: KeyboardEvent, row: Row<TData>): void {
    if (!this.reorderableRows()) return;
    const picked = this._pickedUpRow();

    switch (event.key) {
      case " ":
      case "Enter":
        event.preventDefault();
        if (picked === null) {
          this.handleRowPickup(row);
        } else {
          this.handleRowReorderDrop();
        }
        break;
      case "Escape":
        if (picked !== null) {
          event.preventDefault();
          this.handleRowReorderCancel();
        }
        break;
      case "ArrowUp":
        if (picked !== null) {
          event.preventDefault();
          this.movePickedRow(-1);
        }
        break;
      case "ArrowDown":
        if (picked !== null) {
          event.preventDefault();
          this.movePickedRow(1);
        }
        break;
    }
  }

  /** Pick up `row` for keyboard reordering. */
  protected handleRowPickup(row: Row<TData>): void {
    this._pickedUpRow.set(row.original);
    this._originalRowSourceIndex = this.data().indexOf(row.original);
    const position =
      this.rows().findIndex((r) => r.original === row.original) + 1;
    this.announceReorder("table.row-reorder.pickup", position);
  }

  /**
   * Move the picked-up row one position in `direction`, clamped to the current
   * page's rendered rows. Emits the move through `(rowDrop)` (source indices)
   * for the consumer to apply, so the reorder is visible while moving.
   */
  protected movePickedRow(direction: -1 | 1): void {
    const picked = this._pickedUpRow();
    if (picked === null) return;
    const rendered = this.rows();
    const currentIndex = rendered.findIndex((r) => r.original === picked);
    if (currentIndex < 0) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= rendered.length) return;
    const data = this.data();
    const previousSourceIndex = data.indexOf(rendered[currentIndex].original);
    const currentSourceIndex = data.indexOf(rendered[targetIndex].original);
    if (previousSourceIndex < 0 || currentSourceIndex < 0) return;
    this.emitRowMove(previousSourceIndex, currentSourceIndex);
    this.announceReorder("table.row-reorder.move", targetIndex + 1);
    this.focusRowReorderHandle(picked);
  }

  /** Drop the picked-up row, keeping its already-applied live position. */
  protected handleRowReorderDrop(): void {
    const picked = this._pickedUpRow();
    if (picked === null) return;
    const position = this.rows().findIndex((r) => r.original === picked) + 1;
    this._pickedUpRow.set(null);
    this._originalRowSourceIndex = -1;
    this.announceReorder("table.row-reorder.drop", position);
  }

  /** Cancel the reorder, emitting a move that returns the row to its original
   *  position captured at pickup. */
  protected handleRowReorderCancel(): void {
    const picked = this._pickedUpRow();
    if (picked !== null && this._originalRowSourceIndex >= 0) {
      const currentSourceIndex = this.data().indexOf(picked);
      if (currentSourceIndex >= 0) {
        this.emitRowMove(currentSourceIndex, this._originalRowSourceIndex);
      }
    }
    this._pickedUpRow.set(null);
    this._originalRowSourceIndex = -1;
    this.announceReorder("table.row-reorder.cancel");
  }

  private focusRowReorderHandle(picked: TData): void {
    afterNextRender(
      () => {
        const row = this.rows().find((r) => r.original === picked);
        if (row) {
          document.getElementById(this.rowReorderHandleId(row.id))?.focus();
        }
      },
      { injector: this.injector },
    );
  }

  protected handleColumnDrop(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex === event.currentIndex) return;
    const visibleLeafIds = untracked(() =>
      this.table.getVisibleLeafColumns().map((column) => column.id),
    );
    // Bail if the visible-column set shifted between drag start and drop
    // (e.g. a column was toggled off via the columns menu mid-drag). CDK's
    // indices are now stale and would point at the wrong column — let the
    // drop snap back so the user can re-drag against fresh state.
    if (
      event.previousIndex < 0 ||
      event.previousIndex >= visibleLeafIds.length ||
      event.currentIndex < 0 ||
      event.currentIndex >= visibleLeafIds.length
    ) {
      return;
    }
    const reorderedVisible = [...visibleLeafIds];
    const [moved] = reorderedVisible.splice(event.previousIndex, 1);
    reorderedVisible.splice(event.currentIndex, 0, moved);
    // Compute the new full leaf order: take the previous full order, then
    // overwrite each visible-id slot in document order with the reordered
    // visible ids. Hidden ids stay anchored at their previous positions.
    this.applyPatch<ColumnOrderState>(
      (prev) => {
        const fullOrder =
          prev.length > 0
            ? [...prev]
            : untracked(() =>
              this.table.getAllLeafColumns().map((c) => c.id),
            );
        const visibleSet = new Set(visibleLeafIds);
        let visibleCursor = 0;
        for (let i = 0; i < fullOrder.length; i++) {
          if (visibleSet.has(fullOrder[i])) {
            fullOrder[i] = reorderedVisible[visibleCursor++];
          }
        }
        // Append any visible ids not already in fullOrder (e.g. fresh columns
        // that haven't been written to the order slice yet).
        for (const id of reorderedVisible) {
          if (!fullOrder.includes(id)) fullOrder.push(id);
        }
        return fullOrder;
      },
      (prev) => prev.columnOrder ?? [],
      (value) => ({ columnOrder: value }),
    );
  }

  // ── Keyboard column-reorder handlers ───────────────────────────────────────
  /** Announce a message to the live region for screen-reader accessibility. */
  protected announceReorder(messageKey: string, ...args: unknown[]): void {
    const msg = this.translation.translate(messageKey, ...args);
    const region = document.getElementById(this.liveRegionId);
    if (region) region.textContent = msg;
  }

  /**
   * Reorder the column at `targetIndex` to `sourceIndex` and persist the
   * resulting order via TanStack's column-order patch. Returns the visible
   * label of the moved column for use in ARIA announcements.
   */
  protected executeColumnReorder(
    sourceIndex: number,
    targetIndex: number,
  ): string {
    const visibleLeafIds = untracked(() =>
      this.table.getVisibleLeafColumns().map((column) => column.id),
    );
    if (
      sourceIndex < 0 ||
      sourceIndex >= visibleLeafIds.length ||
      targetIndex < 0 ||
      targetIndex >= visibleLeafIds.length
    ) {
      return "";
    }

    // Build the new full leaf order using the same algorithm as handleColumnDrop,
    // but with the picked-up column moved from sourceIndex to targetIndex.
    const reorderedVisible = [...visibleLeafIds];
    const [moved] = reorderedVisible.splice(sourceIndex, 1);
    reorderedVisible.splice(targetIndex, 0, moved);

    this.applyPatch<ColumnOrderState>(
      (prev) => {
        // Seed from the full leaf list (not just visible ids) so hidden columns
        // stay anchored in the persisted order — same source as handleColumnDrop.
        const fullOrder =
          prev.length > 0
            ? [...prev]
            : untracked(() =>
              this.table.getAllLeafColumns().map((c) => c.id),
            );
        const visibleSet = new Set(visibleLeafIds);
        let visibleCursor = 0;
        for (let i = 0; i < fullOrder.length; i++) {
          if (visibleSet.has(fullOrder[i])) {
            fullOrder[i] = reorderedVisible[visibleCursor++];
          }
        }
        for (const id of reorderedVisible) {
          if (!fullOrder.includes(id)) fullOrder.push(id);
        }
        return fullOrder;
      },
      (prev) => prev.columnOrder ?? [],
      (value) => ({ columnOrder: value }),
    );

    // Resolve the visible label of the moved column for ARIA announcements.
    const col = this.table.getVisibleLeafColumns().find(
      (c) => c.id === moved,
    );
    return col ? this.resolveColumnLabel(col) : moved;
  }

  /** Pick up the column at `header` for keyboard reordering. */
  protected handlePickup(header: {
    column: ReturnType<TanstackTable<TData>["getAllLeafColumns"]>[number];
  }): void {
    this._originalOrder = [...(this.tableState().columnOrder ?? [])];
    this._pickedUpColumnId.set(header.column.id);
    const label = this.resolveColumnLabel(header.column);
    this.announceReorder("table.reorder.pickup", label);
  }

  /**
   * Move the picked-up column one position in `direction` and apply it
   * immediately, so the reorder is visible while moving rather than only on
   * commit. Clamps at the visible-column boundaries.
   */
  protected movePickedColumn(
    direction: -1 | 1,
    header: {
      column: ReturnType<TanstackTable<TData>["getAllLeafColumns"]>[number];
    },
  ): void {
    const pickedId = this.pickedUpColumnId();
    if (pickedId === null) return;
    const visibleLeafIds = untracked(() =>
      this.table.getVisibleLeafColumns().map((c) => c.id),
    );
    const currentIndex = visibleLeafIds.indexOf(pickedId);
    if (currentIndex < 0) return;
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= visibleLeafIds.length) return;
    const label =
      this.executeColumnReorder(currentIndex, targetIndex) ||
      this.resolveColumnLabel(header.column);
    this.announceReorder("table.reorder.move", label, targetIndex + 1);
    // Reordering relocates the focused handle in the DOM; restore focus to it
    // after the view updates so consecutive arrow presses keep moving the same
    // column instead of stalling after one step.
    afterNextRender(
      () => document.getElementById(this.reorderHandleId(pickedId))?.focus(),
      { injector: this.injector },
    );
  }

  /** Stable id for a column's reorder handle button — used to restore keyboard
   *  focus after a live move relocates it. */
  protected reorderHandleId(columnId: string): string {
    return `${this.resolvedId()}-reorder-${columnId}`;
  }

  /** Drop the picked-up column, keeping its already-applied live position. */
  protected handleDrop(header: {
    column: ReturnType<TanstackTable<TData>["getAllLeafColumns"]>[number];
  }): void {
    const pickedId = this.pickedUpColumnId();
    if (pickedId === null) return;
    const position =
      untracked(() =>
        this.table.getVisibleLeafColumns().findIndex((c) => c.id === pickedId),
      ) + 1;
    this._pickedUpColumnId.set(null);
    this._originalOrder = [];
    this.announceReorder(
      "table.reorder.drop",
      this.resolveColumnLabel(header.column),
      position,
    );
  }

  /** Cancel the current reorder, restoring the order captured at pickup. */
  protected handleCancel(): void {
    const original = [...this._originalOrder];
    this.applyPatch<ColumnOrderState>(
      () => original,
      (prev) => prev.columnOrder ?? [],
      (value) => ({ columnOrder: value }),
    );
    this._pickedUpColumnId.set(null);
    this._originalOrder = [];
    this.announceReorder("table.reorder.cancel");
  }

  protected handleHeaderKeydown(
    event: KeyboardEvent,
    header: {
      column: ReturnType<TanstackTable<TData>["getAllLeafColumns"]>[number];
    },
  ): void {
    if (!this.reorderableColumns()) return;
    // The keydown listener lives on the <th>, so Space/Enter from nested sort or
    // filter controls bubbles here. Only act when the event originates from the
    // drag handle (or the <th> itself) — otherwise bail so we don't
    // preventDefault and hijack the nested button's activation.
    const target = event.target as HTMLElement | null;
    const fromHandle = !!target?.closest(".tedi-table__drag-handle");
    const fromHeaderCell = target === event.currentTarget;
    if (!fromHandle && !fromHeaderCell) return;
    const picked = this.pickedUpColumnId();

    switch (event.key) {
      case " ":
      case "Enter":
        event.preventDefault();
        if (picked === null) {
          this.handlePickup(header);
        } else {
          this.handleDrop(header);
        }
        break;
      case "Escape":
        if (picked !== null) {
          event.preventDefault();
          this.handleCancel();
        }
        break;
      case "ArrowLeft":
        if (picked !== null) {
          event.preventDefault();
          this.movePickedColumn(-1, header);
        }
        break;
      case "ArrowRight":
        if (picked !== null) {
          event.preventDefault();
          this.movePickedColumn(1, header);
        }
        break;
    }
  }

  private readonly scrollContainer =
    viewChild<ElementRef<HTMLElement>>("scrollContainer");

  /**
   * Resets the table's own vertical scroll to the top. Only affects the
   * internal scroll container (used when `maxHeight` is set); the horizontal
   * scroll position is preserved since columns are identical across pages, and
   * the window scroll is intentionally left untouched.
   */
  private resetScrollTop(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const element = this.scrollContainer()?.nativeElement;
    if (element) element.scrollTop = 0;
  }

  protected handlePaginationPageChange(nextPage: number): void {
    this.table.setPageIndex(nextPage - 1);
    this.resetScrollTop();
  }

  protected handlePaginationPageSizeChange(nextSize: number | undefined): void {
    if (nextSize === undefined) return;
    this.table.setPageSize(nextSize);
    this.resetScrollTop();
  }

  protected getColumnMeta(column: {
    columnDef: { meta?: unknown };
  }): TableColumnMeta | undefined {
    return column.columnDef.meta as TableColumnMeta | undefined;
  }

  protected getHeaderAriaSort(
    column: ReturnType<TanstackTable<TData>["getAllLeafColumns"]>[number],
  ): "ascending" | "descending" | "none" | null {
    void this.tableState();
    if (!column.getCanSort()) return null;
    const dir = column.getIsSorted();
    return dir === "asc" ? "ascending" : dir === "desc" ? "descending" : "none";
  }

  protected getSrOnlyHeaderLabel(
    column: ReturnType<TanstackTable<TData>["getAllLeafColumns"]>[number],
  ): string | null {
    switch (column.id) {
      case SELECT_COLUMN_ID:
        return this.selectColumnLabel();
      case EXPAND_COLUMN_ID:
        return this.expandColumnLabel();
      case DRAG_COLUMN_ID:
        return this.reorderColumnLabel();
    }
    // Only provide a screen-reader-only name when the header renders no visible
    // text (an empty `<th>` fails WCAG "empty-table-header"). Columns with a
    // visible header are already named by their own text — adding an sr-only
    // copy would double-announce them.
    const header = column.columnDef.header;
    const isEmptyHeader =
      header == null || (typeof header === "string" && header.trim() === "");
    if (!isEmptyHeader) {
      return null;
    }
    return this.getColumnMeta(column)?.label ?? null;
  }

  protected resolveColumnLabel(
    column: ReturnType<TanstackTable<TData>["getAllLeafColumns"]>[number],
  ): string {
    const meta = this.getColumnMeta(column);
    return (
      meta?.label ??
      (typeof column.columnDef.header === "string"
        ? column.columnDef.header
        : column.id)
    );
  }

  protected filterLabel(
    column: ReturnType<TanstackTable<TData>["getAllLeafColumns"]>[number],
  ): string {
    return this.translation.translate(
      "table.filter-input",
      this.resolveColumnLabel(column),
    );
  }

  protected filterPlaceholder(): string {
    return this.translation.translate("table.filter-placeholder");
  }

  protected selectAllLabel(): string {
    return this.translation.translate(
      "table.select-all",
      untracked(() => this.table.getIsAllPageRowsSelected()),
    );
  }

  protected selectRowLabel(row: Row<TData>): string {
    return this.translation.translate("table.select-row", row.getIsSelected());
  }

  protected expandRowLabel(isOpen: boolean): string {
    return isOpen
      ? this.translation.translate("table.collapse-row")
      : this.translation.translate("table.expand-row");
  }

  /** Whether the consumer opted the expand button into visible-label mode. */
  protected readonly expandButtonHasLabel = computed(
    () => this.expandButtonLabel() !== undefined,
  );

  /**
   * Arrow style for the expand toggle button. Defaults to the bordered
   * `secondary` style regardless of `expandTrigger`; honours
   * `expandButtonVariant` when the consumer sets it.
   */
  protected readonly resolvedExpandVariant = computed<CollapseButtonArrowType>(
    () => this.expandButtonVariant() ?? "secondary",
  );

  /** Visible label shown while a row is collapsed (`open` action). */
  protected readonly expandButtonOpenText = computed<string | undefined>(() => {
    const label = this.expandButtonLabel();
    if (label === undefined) return undefined;
    return typeof label === "string" ? label : label.open;
  });

  /** Visible label shown while a row is expanded (`close` action). */
  protected readonly expandButtonCloseText = computed<string | undefined>(
    () => {
      const label = this.expandButtonLabel();
      if (label === undefined) return undefined;
      return typeof label === "string" ? label : label.close;
    },
  );

  protected handleSelectAll(checked: boolean): void {
    this.table.toggleAllPageRowsSelected(checked);
  }

  /**
   * Selectable rows that a single checkbox controls. For a real group (>1
   * member) that's the whole group; otherwise it's the row itself — which
   * keeps TanStack's parent→sub-row cascade (`row.toggleSelected`) intact for
   * `getSubRows` parents that happen to be singleton groups.
   */
  private selectionGroup(row: Row<TData>): Row<TData>[] | null {
    const members = this.rowGroups().get(row.id);
    return members && members.length > 1 ? members : null;
  }

  protected handleSelectRow(row: Row<TData>, checked: boolean): void {
    const group = this.selectionGroup(row);
    if (!group) {
      row.toggleSelected(checked);
      return;
    }
    const ids = group.filter((r) => r.getCanSelect()).map((r) => r.id);
    this.table.setRowSelection((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        if (checked) {
          next[id] = true;
        } else {
          delete next[id];
        }
      }
      return next;
    });
  }

  /** Whether the (group) checkbox for `row` should render as checked. */
  protected isRowSelected(row: Row<TData>): boolean {
    const group = this.selectionGroup(row);
    if (!group) return row.getIsSelected();
    const selectable = group.filter((r) => r.getCanSelect());
    return selectable.length > 0 && selectable.every((r) => r.getIsSelected());
  }

  /** Whether the (group) checkbox for `row` should render as indeterminate. */
  protected isRowIndeterminate(row: Row<TData>): boolean {
    const group = this.selectionGroup(row);
    if (!group) return row.getIsSomeSelected();
    const selectable = group.filter((r) => r.getCanSelect());
    return (
      selectable.some((r) => r.getIsSelected()) &&
      !selectable.every((r) => r.getIsSelected())
    );
  }

  protected handleExpandToggle(row: Row<TData>): void {
    row.toggleExpanded();
  }

  protected handleExpandKeydown(event: KeyboardEvent): void {
    if (event.key === "Enter" || event.key === " ") {
      event.stopPropagation();
    }
  }

  protected handleColumnFilter(
    column: ReturnType<TanstackTable<TData>["getAllLeafColumns"]>[number],
    value: string,
  ): void {
    column.setFilterValue(value || undefined);
  }

  protected shouldRenderHeader(
    header: {
      isPlaceholder: boolean;
      column: {
        columnDef: ColumnDef<TData> & { columns?: unknown[] };
        parent?: unknown;
      };
    },
    rowIndex: number,
  ): boolean {
    const hasParent = Boolean(header.column.parent);
    const hasChildren = Array.isArray(header.column.columnDef.columns);
    const isStandaloneLeaf = !hasChildren && !hasParent;
    if (header.isPlaceholder && !isStandaloneLeaf) return false;
    if (!header.isPlaceholder && isStandaloneLeaf && rowIndex > 0) return false;
    return true;
  }

  protected getHeaderRowSpan(
    header: {
      isPlaceholder: boolean;
      column: {
        columnDef: ColumnDef<TData> & { columns?: unknown[] };
        parent?: unknown;
      };
    },
    rowIndex: number,
  ): number | null {
    const hasParent = Boolean(header.column.parent);
    const hasChildren = Array.isArray(header.column.columnDef.columns);
    const isStandaloneLeaf = !hasChildren && !hasParent;
    if (!isStandaloneLeaf) return null;
    const span = this.headerGroups().length - rowIndex;
    return span > 1 ? span : null;
  }

  protected isHeaderGroup(header: { subHeaders: unknown[] }): boolean {
    return header.subHeaders.length > 0;
  }

  protected getFilterValue(
    column: ReturnType<TanstackTable<TData>["getAllLeafColumns"]>[number],
  ): string {
    const value = column.getFilterValue();
    return typeof value === "string" ? value : "";
  }

  protected isString(value: unknown): value is string {
    return typeof value === "string";
  }

  protected isNumber(value: unknown): value is number {
    return typeof value === "number";
  }

  /**
   * Returns true when the column opted into the built-in sort affordance
   * (`sortable: true` on its `TediColumnDef`), TanStack reports it can sort
   * (`enableSorting !== false`), and the rendered header content is a plain
   * string / number. Custom header `TemplateRef`s and functions bow out of
   * the shorthand and render via `flexRender` as-is.
   */
  protected shouldRenderSortableHeader(
    column: Column<TData, unknown>,
    content: unknown,
  ): boolean {
    const def = column.columnDef as TediColumnDef<TData>;
    if (def.sortable !== true) return false;
    if (!column.getCanSort()) return false;
    return typeof content === "string" || typeof content === "number";
  }

  /**
   * Material icon name reflecting the column's current sort state.
   * `asc → arrow_upward`, `desc → arrow_downward`, otherwise `unfold_more`.
   */
  protected sortIcon(column: Column<TData, unknown>): string {
    const dir = column.getIsSorted();
    if (dir === "asc") return "arrow_upward";
    if (dir === "desc") return "arrow_downward";
    return "unfold_more";
  }

  protected handleSortToggle(column: Column<TData, unknown>): void {
    column.toggleSorting();
  }

  /**
   * Per-column in-popover filter draft. Keyed by `column.id`. The signal
   * carries the unapplied value while the popover is open; `Apply` calls
   * `column.setFilterValue(draft())`, `Clear` resets both the draft and the
   * applied value. Lazy-initialised so columns without `filterable` pay
   * nothing.
   */
  private readonly filterDrafts = new Map<string, WritableSignal<unknown>>();
  // The applied filter value each draft was last synced from. Lets
  // `reconcileFilterDrafts` tell an external filter reset (clearFilters(),
  // controlled `state`, a removed filter chip) — where the applied value
  // changed out from under the draft — apart from a half-typed draft the user
  // is mid-editing (applied value unchanged), which must be preserved.
  private readonly filterDraftBaselines = new Map<string, unknown>();

  /**
   * Normalises `filterable: true | TableFilterOptions | undefined | false`
   * into `TableFilterOptions | null`. `null` means the column did not opt in.
   */
  private resolveFilterOptions(
    col: Column<TData, unknown>,
  ): TableFilterOptions | null {
    const def = col.columnDef as TediColumnDef<TData>;
    const flag = def.filterable;
    if (!flag) return null;
    if (flag === true) return {};
    return flag;
  }

  /**
   * Typed accessor for the consumer-provided filter template — pulls
   * `TediColumnDef.filterTemplate` off a TanStack `Column.columnDef` (whose
   * static type is the base `ColumnDef`, so the property would otherwise
   * read as `unknown` in strict templates).
   */
  protected filterTemplateFor(
    col: Column<TData, unknown>,
  ): TemplateRef<TediTableFilterContext<unknown, TData>> | undefined {
    const def = col.columnDef as TediColumnDef<TData>;
    return def.filterTemplate as
      | TemplateRef<TediTableFilterContext<unknown, TData>>
      | undefined;
  }

  /**
   * True when the column opted into the built-in filter affordance
   * (`filterable: true | TableFilterOptions`) AND TanStack reports it can
   * filter (`enableColumnFilter !== false`, etc.).
   */
  protected shouldRenderFilterButton(col: Column<TData, unknown>): boolean {
    if (!this.resolveFilterOptions(col)) return false;
    return col.getCanFilter();
  }

  /** Whether the column currently has a filter applied. Drives the trigger's
   *  selected / filled state. */
  protected filterIsActive(col: Column<TData, unknown>): boolean {
    return col.getFilterValue() !== undefined;
  }

  /** Translated aria-label for the filter trigger button — uses the column
   *  label (header text or `meta.label`). */
  protected filterAriaLabel(
    col: ReturnType<TanstackTable<TData>["getAllLeafColumns"]>[number],
  ): string {
    const label = this.resolveColumnLabel(col);
    return this.translation.translate("table.filter-button-aria", label);
  }

  protected filterApplyLabel(): string {
    return this.translation.translate("table.filter-apply");
  }

  protected filterClearLabel(): string {
    return this.translation.translate("table.filter-clear");
  }

  private getFilterDraft(
    columnId: string,
    initial: unknown,
  ): WritableSignal<unknown> {
    let s = this.filterDrafts.get(columnId);
    if (!s) {
      s = signal<unknown>(initial);
      this.filterDrafts.set(columnId, s);
      this.filterDraftBaselines.set(columnId, initial);
    }
    return s;
  }

  /**
   * Structural equality for filter values (strings, numbers, bigints, arrays,
   * plain objects). Filter values are consumer-supplied `unknown`, so the
   * comparison must never throw: reference-equal values (including equal
   * primitives and bigints) short-circuit, and anything JSON can't serialise
   * (bigint mismatches, cyclic structures) falls back to "changed".
   */
  private filterValuesEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === undefined || b === undefined) return false;
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }

  /**
   * Realigns each open/created filter draft with the applied filter state
   * whenever the latter changes externally (`clearFilters()`, controlled
   * `state`, a removed filter chip). A draft is only overwritten when its
   * column's applied value actually moved since the draft last synced — so an
   * in-progress, unapplied draft (applied value unchanged) is left intact.
   */
  private reconcileFilterDrafts(filters: ColumnFiltersState): void {
    const appliedById = new Map(filters.map((f) => [f.id, f.value]));
    for (const [id, draft] of this.filterDrafts) {
      const applied = appliedById.get(id);
      if (!this.filterValuesEqual(applied, this.filterDraftBaselines.get(id))) {
        draft.set(applied);
        this.filterDraftBaselines.set(id, applied);
      }
    }
  }

  /**
   * Called when the filter trigger button is clicked. If `clearOnClose` is
   * set, the draft is reset to the currently-applied value every time the
   * popover opens — otherwise the draft persists across opens until the user
   * Applies or Clears.
   */
  protected handleFilterTriggerClick(col: Column<TData, unknown>): void {
    const opts = this.resolveFilterOptions(col);
    const applied = col.getFilterValue();
    if (opts?.clearOnClose) {
      this.getFilterDraft(col.id, applied).set(applied);
    } else {
      // Ensure draft exists with current applied value as starting point.
      this.getFilterDraft(col.id, applied);
    }
  }

  /**
   * Builds the per-column context object handed to the consumer's
   * `filterTemplate`. Calling `setValue` writes to the draft; `apply` /
   * `clear` commit the draft and close the popover.
   */
  /**
   * Builds the per-column context object handed to the consumer's
   * `filterTemplate`. `$implicit` is wired to the context itself so
   * `<ng-template let-ctx>` resolves `ctx.value`, `ctx.setValue`,
   * `ctx.apply()`, `ctx.clear()` and `ctx.column` without extra `let-*`
   * destructuring.
   */
  protected filterContextFor(
    col: Column<TData, unknown>,
    popover: PopoverComponent,
  ): TediTableFilterContext<unknown, TData> {
    const draft = this.getFilterDraft(col.id, col.getFilterValue());
    const ctx = {
      value: draft(),
      setValue: (next: unknown) => draft.set(next),
      apply: () => {
        col.setFilterValue(draft());
        popover.hidePopover(true);
      },
      clear: () => {
        draft.set(undefined);
        col.setFilterValue(undefined);
        popover.hidePopover(true);
      },
      column: col,
    } as Omit<TediTableFilterContext<unknown, TData>, "$implicit">;
    (ctx as TediTableFilterContext<unknown, TData>).$implicit =
      ctx as TediTableFilterContext<unknown, TData>;
    return ctx as TediTableFilterContext<unknown, TData>;
  }

  protected handleFilterApply(
    col: Column<TData, unknown>,
    popover: PopoverComponent,
  ): void {
    const draft = this.getFilterDraft(col.id, col.getFilterValue());
    col.setFilterValue(draft());
    popover.hidePopover(true);
  }

  protected handleFilterClear(
    col: Column<TData, unknown>,
    popover: PopoverComponent,
  ): void {
    this.getFilterDraft(col.id, col.getFilterValue()).set(undefined);
    col.setFilterValue(undefined);
    popover.hidePopover(true);
  }

  /**
   * Resolve `rowSpan` for a body cell.
   *  - `null` → render normal `<td>`
   *  - `0`    → skip rendering (covered by a previous spanning cell)
   *  - `N>1`  → emit `rowspan="N"`
   */
  protected resolveRowSpan(
    cell: { column: { id: string; columnDef: TediColumnDef<TData> } },
    cellContext: CellContext<TData, unknown>,
  ): number | null {
    const groupSpans = this.groupSpansByColumn().get(cell.column.id);
    if (groupSpans) {
      const span = groupSpans.get(cellContext.row.id) ?? 1;
      return span === 1 ? null : span;
    }

    const columnDef = cell.column.columnDef;
    if (!columnDef.rowSpan) return null;
    const value =
      typeof columnDef.rowSpan === "function"
        ? columnDef.rowSpan(cellContext)
        : columnDef.rowSpan;
    if (value === undefined || value === 1) return null;
    return value;
  }
}
