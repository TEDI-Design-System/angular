import type { CellContext, Row } from "@tanstack/angular-table";

/**
 * Build a `rowSpan` callback that auto-collapses consecutive equal keys.
 * Returns `N > 1` for the first row in a run and `0` for the covered rows.
 * Pass the **same** array of rows the table is rendering — typically
 * `table.getRowModel().rows` — so spans operate on the post-filter / sort /
 * pagination row set.
 */
export function groupRowSpan<TData>(
  rows: Row<TData>[],
  keyFn: (row: Row<TData>) => unknown,
): (info: CellContext<TData, unknown>) => number {
  const indexById = new Map<string, number>();
  const spans: number[] = new Array<number>(rows.length).fill(1);

  let i = 0;
  while (i < rows.length) {
    const groupKey = keyFn(rows[i]);
    let j = i + 1;
    while (j < rows.length && keyFn(rows[j]) === groupKey) j++;
    const groupSize = j - i;
    spans[i] = groupSize;
    for (let k = i + 1; k < j; k++) spans[k] = 0;
    i = j;
  }

  rows.forEach((row, index) => indexById.set(row.id, index));

  return (info) => {
    const idx = indexById.get(info.row.id);
    return idx === undefined ? 1 : spans[idx];
  };
}
