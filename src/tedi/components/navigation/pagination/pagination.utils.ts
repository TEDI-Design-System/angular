import { PaginationItem, PaginationItemType } from "./pagination.types";

export interface UsePaginationArgs {
  /** 1-based current page. */
  page: number;
  /** Total page count. */
  pageCount: number;
  /** Pages always shown at the very start and very end. */
  boundaryCount?: number;
  /** Pages shown on either side of the current page. */
  siblingCount?: number;
}

const range = (start: number, end: number): number[] => {
  if (end < start) return [];
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

/**
 * Computes the ordered list of pagination items (previous, page-buttons,
 * ellipsis, next).
 *
 * The algorithm targets a stable slot count: for any `pageCount` larger than
 * the window size, the returned list always has the same number of page
 * entries (`boundaryCount * 2 + siblingCount * 2 + 3`). As the current page
 * moves toward a boundary, the corresponding ellipsis is swapped for an extra
 * adjacent page number rather than collapsing the list — the visual row does
 * not expand or contract as the user navigates.
 */
export function usePagination({
  page,
  pageCount,
  boundaryCount = 1,
  siblingCount = 1,
}: UsePaginationArgs): PaginationItem[] {
  if (pageCount <= 0) return [];

  const safeBoundary = Math.max(0, boundaryCount);
  const safeSibling = Math.max(0, siblingCount);
  const currentPage = Math.max(1, Math.min(pageCount, page));

  const windowSize = safeBoundary * 2 + safeSibling * 2 + 3;

  let pageList: (number | "ellipsis")[];

  if (pageCount <= windowSize) {
    pageList = range(1, pageCount);
  } else {
    const edgeRun = safeBoundary + safeSibling * 2 + 2;
    const startThreshold = safeBoundary + safeSibling + 2;
    const endThreshold = pageCount - safeBoundary - safeSibling - 1;

    if (currentPage <= startThreshold) {
      pageList = [
        ...range(1, edgeRun),
        "ellipsis",
        ...range(pageCount - safeBoundary + 1, pageCount),
      ];
    } else if (currentPage >= endThreshold) {
      pageList = [
        ...range(1, safeBoundary),
        "ellipsis",
        ...range(pageCount - edgeRun + 1, pageCount),
      ];
    } else {
      pageList = [
        ...range(1, safeBoundary),
        "ellipsis",
        ...range(currentPage - safeSibling, currentPage + safeSibling),
        "ellipsis",
        ...range(pageCount - safeBoundary + 1, pageCount),
      ];
    }
  }

  const items: PaginationItem[] = [
    {
      type: "previous" as PaginationItemType,
      page: currentPage > 1 ? currentPage - 1 : null,
      selected: false,
      disabled: currentPage <= 1,
    },
    ...pageList.map<PaginationItem>((entry) =>
      entry === "ellipsis"
        ? { type: "ellipsis", page: null, selected: false, disabled: true }
        : {
            type: "page",
            page: entry,
            selected: entry === currentPage,
            disabled: false,
          },
    ),
    {
      type: "next",
      page: currentPage < pageCount ? currentPage + 1 : null,
      selected: false,
      disabled: currentPage >= pageCount,
    },
  ];

  return items;
}
