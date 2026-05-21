import type { Signal } from "@angular/core";
import type {
  CellContext,
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnSizingState,
  ExpandedState,
  PaginationState,
  RowSelectionState,
  SortingState,
  Table as TanstackTable,
  VisibilityState,
} from "@tanstack/angular-table";

export type TableSize = "medium" | "small";

/**
 * Optional shape that columns can put in `columnDef.meta` to:
 *
 * - drive the column-filter aria-label when the header is non-textual (`label`),
 * - align the column's `<th>` / `<td>` content horizontally (`align`) or vertically
 *   (`vAlign`) without wrapping every cell render in a styled span.
 */
export interface TableColumnMeta {
  /** Accessible label used when the column header isn't a plain string. */
  label?: string;
  /** Horizontal alignment applied to every header / body / footer cell. */
  align?: "left" | "center" | "right";
  /** Vertical alignment applied to every header / body / footer cell. */
  vAlign?: "top" | "middle" | "bottom";
}

/**
 * Persistable state slices owned by Table. Each slice can be controlled via
 * `state`/`stateChange`, defaulted via `defaultState`, or persisted via `persist`.
 */
export interface TableState {
  columnVisibility?: VisibilityState;
  columnOrder?: ColumnOrderState;
  rowOrder?: string[];
  columnSizing?: ColumnSizingState;
  rowSelection?: RowSelectionState;
  expanded?: ExpandedState;
  columnFilters?: ColumnFiltersState;
  sorting?: SortingState;
  pagination?: PaginationState;
}

export type TableStatePatch =
  | Partial<TableState>
  | ((prev: TableState) => Partial<TableState>);

export interface TablePersistOptions {
  /** Storage key used to read/write persisted state. Must be stable per table. */
  key: string;
  /** Storage backend. Defaults to `window.localStorage` when available. */
  storage?: Storage;
  /**
   * Subset of state slices to persist. Defaults to user-preference slices only:
   * `columnVisibility`, `columnOrder`, `rowOrder`, `columnSizing`.
   */
  include?: (keyof TableState)[];
}

export interface TablePaginationOptions {
  /** Rows per page. @default 10 */
  pageSize?: number;
  /**
   * Options rendered in the built-in page-size selector. Pass `false` to hide.
   * @default [10, 25, 50]
   */
  pageSizeOptions?: number[] | false;
}

/**
 * Angular-only extension to TanStack's `ColumnDef`. Supports body-level row
 * spanning via the `rowSpan` callback.
 */
export type TediColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  /**
   * Body-level row spanning. Return `>1` to emit `rowspan="N"` and skip the
   * next `N-1` rows in this column; return `0` to skip rendering the cell
   * entirely (covered by a previous spanning cell). Defaults to `1`.
   */
  rowSpan?: number | ((info: CellContext<TData, TValue>) => number);
};

/**
 * Value exposed through `TEDI_TABLE_CONTEXT`. Sub-components like ColumnsMenu
 * use it to read and mutate the table state without prop-drilling.
 */
export interface TediTableContextValue<TData = unknown> {
  /** Signal exposing the current Tanstack table instance. Read inside computed/effect for reactivity. */
  table: Signal<TanstackTable<TData>>;
  /** Visual size of the table. */
  size: Signal<TableSize>;
  /** Stable id used as a prefix for synthetic ids. */
  id: Signal<string>;
  /** Merged table state signal. */
  state: Signal<TableState>;
}
