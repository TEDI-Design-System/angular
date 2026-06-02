import type { Signal, TemplateRef } from "@angular/core";
import type {
  CellContext,
  Column,
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
import type { PaginationComponent } from "../../navigation/pagination/pagination.component";
import type { ComponentInputs } from "../../../types/inputs.type";

export type TableSize = "medium" | "small";

/**
 * Selection mode for `<tedi-table>` row selection. `multiple` (default) shows
 * a checkbox per row plus a select-all checkbox in the header. `single` shows
 * a radio per row sharing one `name`, and no header control.
 */
export type TableSelectionMode = "multiple" | "single";

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

/**
 * Inputs on `tedi-pagination` that the table manages itself or replaces with a
 * differently typed version, so they are stripped from the forwarded shape.
 */
type TableManagedPaginationInputs = "pageCount" | "totalItems" | "pageSizeOptions";

/**
 * All pagination inputs the consumer can pass through `pagination` /
 * `paginationTop`. Mirrors `PaginationComponent`'s public inputs (except the
 * state-driven ones owned by the table) and adds the table-specific
 * `pageSize` / `pageSizeOptions` configuration.
 *
 * Note: `pageSize` lives on `PaginationComponent` as a `model()` and is therefore
 * not part of `ComponentInputs` — we redeclare it here so consumers configure
 * the initial/default page size via this options object.
 */
export type TablePaginationOptions = Partial<
  Omit<ComponentInputs<PaginationComponent>, TableManagedPaginationInputs>
> & {
  /** Rows per page. @default 10 */
  pageSize?: number;
  /**
   * Options rendered in the built-in page-size selector. Pass `false` to hide.
   * @default [10, 25, 50]
   */
  pageSizeOptions?: number[] | false;
};

/**
 * Tuning knobs for the built-in filter popover. Forwarded by `filterable`
 * when the consumer needs more than just "on / off".
 */
export interface TableFilterOptions {
  /**
   * Reset the in-popover draft to the applied filter value every time the
   * popover closes. Useful for filters where stale draft state (a partially
   * typed string, half-selected checkboxes) would confuse the user.
   * @default false
   */
  clearOnClose?: boolean;
}

/**
 * Context exposed by the built-in filter popover to the consumer's
 * `filterTemplate`. The consumer binds inputs to `value` / `setValue` and
 * optionally calls `apply()` / `clear()` (e.g. on Enter / Escape) — the
 * popover's footer already wires Apply / Clear buttons.
 *
 * `$implicit` aliases the context itself, so `<ng-template let-ctx>` binds
 * `ctx` to a full `TediTableFilterContext` (the consumer reads `ctx.value`,
 * `ctx.setValue`, etc. through the same name).
 */
export interface TediTableFilterContext<TValue = unknown, TData = unknown> {
  /**
   * Aliases the context itself, so `let-ctx` binds the full context — keeps
   * `ctx.value` / `ctx.setValue` / `ctx.column` discoverable without forcing
   * the consumer to spell out `let-value="value"`, `let-setValue="setValue"`, etc.
   */
  $implicit: TediTableFilterContext<TValue, TData>;
  /** Current draft (what the input should bind to). */
  value: TValue;
  /** Write to the draft. Does not apply yet — call `apply()` to commit. */
  setValue: (next: TValue) => void;
  /** Commit the draft via `column.setFilterValue` and close the popover. */
  apply: () => void;
  /** Reset the filter (calls `setFilterValue(undefined)`) and close. */
  clear: () => void;
  /** TanStack `Column` for the column whose filter popover is open. */
  column: Column<TData>;
}

/**
 * Angular-only extension to TanStack's `ColumnDef`. Supports body-level row
 * spanning via the `rowSpan` callback and a one-flag opt-in to the built-in
 * sort affordance via `sortable`.
 */
export type TediColumnDef<TData, TValue = unknown> = ColumnDef<TData, TValue> & {
  /**
   * Body-level row spanning. Return `>1` to emit `rowspan="N"` and skip the
   * next `N-1` rows in this column; return `0` to skip rendering the cell
   * entirely (covered by a previous spanning cell). Defaults to `1`.
   */
  rowSpan?: number | ((info: CellContext<TData, TValue>) => number);
  /**
   * Opts the column into the built-in sort affordance. When `true` and the
   * column's `header` is a string, the table renders a clickable sort button
   * around the header title — the entire title becomes the affordance, an
   * icon reflects the current sort direction, `aria-sort` is wired, and
   * clicking toggles `asc → desc → none`.
   *
   * For fully custom sort UIs (e.g. combined sort + filter), provide a
   * `TemplateRef` for `header` and call `column.toggleSorting()` yourself —
   * the shorthand bows out when a non-string header is rendered.
   *
   * Pair with `sortingFn` on the same column to override the comparator
   * (built-in: `'alphanumeric'`, `'text'`, `'datetime'`, `'basic'`, `'auto'`,
   * or any `SortingFn`).
   *
   * @default false
   */
  sortable?: boolean;
  /**
   * Opts the column into the built-in filter popover. The table renders the
   * trigger button (icon-only `filter_alt`), positions the popover, owns the
   * in-popover draft state, and renders translated **Apply** / **Clear**
   * actions in the footer. The consumer supplies the input UI through
   * `filterTemplate`.
   *
   * Pass `true` for defaults, or `TableFilterOptions` to tune behaviour
   * (e.g. `{ clearOnClose: true }` to discard half-typed drafts when the
   * popover closes without applying). Requires `filterTemplate` when truthy.
   *
   * @default false
   */
  filterable?: boolean | TableFilterOptions;
  /**
   * Input UI rendered inside the built-in filter popover. Receives a
   * `TediTableFilterContext` with `value` / `setValue` for the draft and
   * `apply()` / `clear()` for explicit commit + close. The footer Apply /
   * Clear buttons cover the common path — call them from the template only
   * for keyboard shortcuts (Enter, Escape).
   */
  filterTemplate?: TemplateRef<TediTableFilterContext<unknown, TData>>;
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
