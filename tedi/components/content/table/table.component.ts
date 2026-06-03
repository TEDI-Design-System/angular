import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  inject,
  Injector,
  input,
  signal,
  Signal,
  TemplateRef,
  untracked,
  ViewEncapsulation,
  output,
  type WritableSignal,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import {
  CdkDrag,
  type CdkDragDrop,
  CdkDragHandle,
  CdkDropList,
} from "@angular/cdk/drag-drop";
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
import { TediTableHeaderButtonComponent } from "./table-header-button/table-header-button.component";
import { CheckboxComponent } from "../../form/checkbox/checkbox.component";
import { RadioComponent } from "../../form/radio/radio.component";
import { TextFieldComponent } from "../../form/text-field/text-field.component";
import { FormFieldComponent } from "../../form/form-field/form-field.component";
import { IconComponent } from "../../base/icon/icon.component";
import { ButtonComponent } from "../../buttons/button/button.component";
import { CollapseButtonComponent } from "../../buttons/collapse-button/collapse-button.component";
import { PopoverComponent } from "../../overlay/popover/popover.component";
import { PopoverContentComponent } from "../../overlay/popover/popover-content/popover-content.component";
import { PopoverTriggerDirective } from "../../overlay/popover/popover-trigger/popover-trigger.directive";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TABLE_CONTEXT } from "./table.context";
import {
  createTablePersistence,
  type TablePersistenceController,
} from "./table.persistence";
import type {
  TableColumnMeta,
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
} from "./table.types";

const SELECT_COLUMN_ID = "__select__";
const EXPAND_COLUMN_ID = "__expand__";
const DRAG_COLUMN_ID = "__drag__";

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
  pageSizeOptions: number[] | false;
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
  showArrowLabels: boolean;
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
  showArrowLabels: false,
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
  readonly striped = input(false, { transform: booleanAttribute });
  readonly verticalBorders = input(false, { transform: booleanAttribute });
  readonly borderless = input(false, { transform: booleanAttribute });
  readonly stickyFirstColumn = input(false, { transform: booleanAttribute });
  readonly stickyHeader = input(false, { transform: booleanAttribute });
  readonly maxHeight = input<number | string | undefined>(undefined);
  readonly activeRowId = input<string | undefined>(undefined);
  readonly rowHover = input<boolean | undefined>(undefined);
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
  readonly enableColumnFilters = input(false, { transform: booleanAttribute });
  readonly renderSubComponent = input<
    TemplateRef<{ $implicit: Row<TData> }> | undefined
  >(undefined);
  readonly getRowCanExpand = input<((row: Row<TData>) => boolean) | undefined>(
    undefined,
  );
  /**
   * How an expandable row is toggled. `button` (default) — only the chevron
   * button toggles; rendered in the bordered secondary style. `row` — clicking
   * anywhere on the row toggles; chevron rendered in the neutral default style.
   * @default 'button'
   */
  readonly expandTrigger = input<TableExpandTrigger>("button");
  readonly getSubRows = input<
    ((row: TData) => TData[] | undefined) | undefined
  >(undefined);
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
  readonly manualPagination = input(false, { transform: booleanAttribute });
  readonly manualSorting = input(false, { transform: booleanAttribute });
  readonly manualFiltering = input(false, { transform: booleanAttribute });
  readonly pageCount = input<number | undefined>(undefined);
  readonly rowCount = input<number | undefined>(undefined);
  readonly state = input<Partial<TableState> | undefined>(undefined);
  readonly defaultState = input<Partial<TableState> | undefined>(undefined);
  readonly persist = input<TablePersistOptions | undefined>(undefined);
  readonly placeholder = input<TemplateRef<unknown> | string | undefined>(
    undefined,
  );
  readonly placeholderRole = input<"alert" | "status" | undefined>(undefined);
  /**
   * Adds clickable styling, role="button", and keyboard activation to rows.
   * Subscribe to `rowClick` to react when a row is activated. Defaults to
   * `false` — turn on when rows should behave like buttons.
   * @default false
   */
  readonly interactive = input(false, { transform: booleanAttribute });
  /**
   * Makes data rows reorderable via drag-and-drop. The consumer reorders the
   * `data` array in `(rowDrop)` (typically with `moveItemInArray`) and passes
   * the new array back via `[data]`. Pair with `table-layout: fixed` (via the
   * `tedi-table--draggable-rows` host modifier added automatically) so the
   * drag preview preserves cell widths.
   * @default false
   */
  readonly draggableRows = input(false, { transform: booleanAttribute });
  /**
   * Makes columns reorderable via drag-and-drop on the header row. Reorders
   * the table's internal `columnOrder` state directly — no consumer wiring
   * needed beyond persisting the state slice if desired.
   * @default false
   */
  readonly draggableColumns = input(false, { transform: booleanAttribute });

  readonly stateChange = output<TableState>();
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
  private readonly translation = inject(TediTranslationService);

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

  protected readonly paginationPageSizeOptions = computed<number[]>(() => {
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
   * `<tedi-table>` host. The captured template is forwarded to whichever
   * paginator slot is set to display results.
   */
  private readonly customResultsDirective = contentChild(
    TediPaginationResultsDirective,
  );
  protected readonly customResultsTemplate = computed(
    () => this.customResultsDirective()?.template ?? null,
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
    const leading: TediColumnDef<TData>[] = [];

    if (this.draggableRows()) {
      leading.push({
        id: DRAG_COLUMN_ID,
        enableSorting: false,
        enableHiding: false,
        enableColumnFilter: false,
        size: 40,
        header: "",
        cell: () => "",
      } as TediColumnDef<TData>);
    }

    if (this.hasSelection()) {
      leading.push({
        id: SELECT_COLUMN_ID,
        enableSorting: false,
        enableHiding: false,
        enableColumnFilter: false,
        size: 40,
        header: "",
        cell: () => "",
      } as TediColumnDef<TData>);
    }

    if (this.hasExpansion()) {
      leading.push({
        id: EXPAND_COLUMN_ID,
        enableSorting: false,
        enableHiding: false,
        enableColumnFilter: false,
        size: 40,
        header: "",
        cell: () => "",
      } as TediColumnDef<TData>);
    }

    return [...leading, ...cols];
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
        getRowCanExpand: renderSub
          ? (this.getRowCanExpand() ?? (() => true))
          : this.getRowCanExpand(),
        getSubRows: this.getSubRows(),
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
        paginateExpandedRows: false,
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
  }

  protected readonly hostClasses = computed(() => {
    const classes = ["tedi-table", `tedi-table--${this.size()}`];
    if (this.striped()) classes.push("tedi-table--striped");
    if (this.verticalBorders()) classes.push("tedi-table--vertical-borders");
    if (this.borderless()) classes.push("tedi-table--borderless");
    if (this.stickyFirstColumn())
      classes.push("tedi-table--sticky-first-column");
    if (this.stickyHeader()) classes.push("tedi-table--sticky-header");
    const rowExpand = this.expandTrigger() === "row";
    if (this.interactive() || rowExpand)
      classes.push("tedi-table--clickable-rows");
    const hoverEnabled = this.rowHover() ?? (this.interactive() || rowExpand);
    if (hoverEnabled) classes.push("tedi-table--row-hover");
    classes.push(...this.paginationHostClasses());
    if (this.draggableRows() || this.draggableColumns())
      classes.push("tedi-table--draggable");
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

  protected readonly ariaRowCount = computed(() =>
    this.paginationEnabled()
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
    if (!this.paginationEnabled()) return map;
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
      defaultState: this.defaultState(),
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
    };

    effect(() => this.persistence.setControlled(this.state()));
    effect(() => this.persistence.setPersist(this.persist()));
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

  protected handleRowClick(row: Row<TData>): void {
    if (this.expandTrigger() === "row" && row.getCanExpand()) {
      row.toggleExpanded();
    }
    if (this.interactive()) {
      this.rowClick.emit(row);
    }
  }

  protected rowExpandsOnClick(row: Row<TData>): boolean {
    return this.expandTrigger() === "row" && row.getCanExpand();
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

  protected handleColumnDrop(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex === event.currentIndex) return;
    const visibleLeafIds = untracked(() =>
      this.table.getVisibleLeafColumns().map((column) => column.id),
    );
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

  protected handlePaginationPageChange(nextPage: number): void {
    this.table.setPageIndex(nextPage - 1);
  }

  protected handlePaginationPageSizeChange(nextSize: number | undefined): void {
    if (nextSize === undefined) return;
    this.table.setPageSize(nextSize);
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

  protected getHeaderLabel(
    column: ReturnType<TanstackTable<TData>["getAllLeafColumns"]>[number],
  ): string | null {
    const meta = this.getColumnMeta(column);
    const header = column.columnDef.header;
    return meta?.label ?? (typeof header === "string" ? header : null);
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

  protected handleSelectAll(checked: boolean): void {
    this.table.toggleAllPageRowsSelected(checked);
  }

  protected handleSelectRow(row: Row<TData>, checked: boolean): void {
    row.toggleSelected(checked);
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
    }
    return s;
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
    cell: { column: { columnDef: TediColumnDef<TData> } },
    cellContext: CellContext<TData, unknown>,
  ): number | null {
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
