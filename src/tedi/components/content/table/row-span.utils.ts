import type { CellContext, Row } from "@tanstack/angular-table";

/**
 * Collapse consecutive rows with an equal key into row spans, keyed by row id.
 * The first row of each run maps to the run length (`N`); the rows it covers
 * map to `0`. Pass the **rendered** row set (typically
 * `table.getRowModel().rows`) so spans operate post-filter / sort / pagination.
 */
export function computeGroupSpans<TData>(
  rows: Row<TData>[],
  keyFn: (row: Row<TData>) => unknown,
): Map<string, number> {
  const spans = new Map<string, number>();

  let i = 0;
  while (i < rows.length) {
    const groupKey = keyFn(rows[i]);
    let j = i + 1;
    while (j < rows.length && keyFn(rows[j]) === groupKey) j++;
    spans.set(rows[i].id, j - i);
    for (let k = i + 1; k < j; k++) spans.set(rows[k].id, 0);
    i = j;
  }

  return spans;
}

/**
 * Build a `rowSpan` callback that auto-collapses consecutive equal keys.
 * Returns `N > 1` for the first row in a run and `0` for the covered rows.
 * Pass the **same** array of rows the table is rendering — typically
 * `table.getRowModel().rows` — so spans operate on the post-filter / sort /
 * pagination row set.
 *
 * Prefer the column-level `groupBy` option, which computes this internally
 * against the live row model; reach for this helper only when you need a
 * standalone `rowSpan` callback.
 */
export function groupRowSpan<TData>(
  rows: Row<TData>[],
  keyFn: (row: Row<TData>) => unknown,
): (info: CellContext<TData, unknown>) => number {
  const spans = computeGroupSpans(rows, keyFn);
  return (info) => spans.get(info.row.id) ?? 1;
}
