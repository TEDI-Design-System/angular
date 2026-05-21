import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  Signal,
  TemplateRef,
  untracked,
  ViewEncapsulation,
  output,
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
import { CheckboxComponent } from "../../form/checkbox/checkbox.component";
import { TextFieldComponent } from "../../form/text-field/text-field.component";
import { FormFieldComponent } from "../../form/form-field/form-field.component";
import { IconComponent } from "../../base/icon/icon.component";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { TEDI_TABLE_CONTEXT } from "./table.context";
import {
  createTablePersistence,
  type TablePersistenceController,
} from "./table.persistence";
import type {
  TableColumnMeta,
  TablePaginationOptions,
  TablePersistOptions,
  TableSize,
  TableState,
  TediColumnDef,
  TediTableContextValue,
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

@Component({
  standalone: true,
  selector: "tedi-table",
  imports: [
    CommonModule,
    FormsModule,
    FlexRenderDirective,
    PaginationComponent,
    CheckboxComponent,
    TextFieldComponent,
    FormFieldComponent,
    IconComponent,
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
  readonly enableColumnFilters = input(false, { transform: booleanAttribute });
  readonly renderSubComponent = input<
    TemplateRef<{ $implicit: Row<TData> }> | undefined
  >(undefined);
  readonly getRowCanExpand = input<((row: Row<TData>) => boolean) | undefined>(
    undefined,
  );
  readonly getSubRows = input<
    ((row: TData) => TData[] | undefined) | undefined
  >(undefined);
  readonly pagination = input<boolean | TablePaginationOptions | undefined>(
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
   * Fires when a row is dropped to a new position. The event carries the
   * CDK `previousIndex` and `currentIndex`; reorder the source `data` array
   * (e.g. `moveItemInArray(data, previousIndex, currentIndex)`) and pass it
   * back via `[data]` to apply.
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

  private readonly hasExpansion = computed(() =>
    Boolean(this.renderSubComponent() || this.getSubRows()),
  );
  private readonly hasSelection = computed(() =>
    Boolean(this.enableRowSelection()),
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
        enableColumnFilters: this.enableColumnFilters(),
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
    if (this.interactive()) classes.push("tedi-table--clickable-rows");
    const hoverEnabled = this.rowHover() ?? this.interactive();
    if (hoverEnabled) classes.push("tedi-table--row-hover");
    if (this.paginationEnabled()) classes.push("tedi-table--has-pagination");
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
    if (!this.interactive()) return;
    this.rowClick.emit(row);
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
    this.rowDrop.emit(event);
  }

  protected handleColumnDrop(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex === event.currentIndex) return;
    const visibleLeafIds = untracked(() =>
      this.table.getVisibleLeafColumns().map((column) => column.id),
    );
    const next = [...visibleLeafIds];
    const [moved] = next.splice(event.previousIndex, 1);
    next.splice(event.currentIndex, 0, moved);
    this.applyPatch<ColumnOrderState>(
      next,
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

  protected handleExpandToggle(event: Event, row: Row<TData>): void {
    event.stopPropagation();
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

  protected getRowIndex(visibleIndex: number): number | null {
    if (!this.paginationEnabled()) return null;
    const pagination = untracked(() => this.table.getState().pagination);
    const offset = pagination.pageIndex * pagination.pageSize;
    return this.headerRowCount() + offset + visibleIndex + 1;
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
