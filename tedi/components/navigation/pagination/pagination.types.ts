export type PaginationBackground = "white" | "transparent";

/**
 * Visibility toggle for the results / page-size / pager / arrow slots.
 * - `true` — always hidden
 * - `false` (default) — always visible
 * - `'sm'` / `'md'` / `'lg'` / `'xl'` / `'xxl'` — hidden below that breakpoint
 *
 * Mirrors the `boolean | breakpoint` pattern used by `tedi-modal`'s
 * `fullscreen` input.
 */
export type PaginationVisibility = boolean | "sm" | "md" | "lg" | "xl" | "xxl";

/**
 * Where the divider sits relative to the pagination row.
 * - `'top'` (default) — border on top, matches single-row layouts under content
 * - `'bottom'` — border on bottom, for above-content placements
 * - `'none'` — no divider, useful when the surrounding container already has one
 */
export type PaginationDividerPosition = "top" | "bottom" | "none";

export type PaginationItemType = "page" | "previous" | "next" | "ellipsis";

export interface PaginationItem {
  type: PaginationItemType;
  page: number | null;
  selected: boolean;
  disabled: boolean;
}

export interface PaginationLabels {
  /** Accessible label for the nav wrapper. @default 'Pagination' */
  ariaLabel: string;
  /** Previous button label (icon-only, used as aria-label). @default 'Previous page' */
  previous: string;
  /** Next button label (icon-only, used as aria-label). @default 'Next page' */
  next: string;
  /** aria-label for a numeric page button. @default (page) => 'Go to page {page}' */
  pageAriaLabel: (page: number) => string;
  /** aria-label for the currently active page. @default (page) => 'Current page, page {page}' */
  currentPageAriaLabel: (page: number) => string;
  /** Rendered to the left of the nav when `totalItems` is set. @default (count) => '{count} results' */
  results: (count: number) => string;
  /** Prefix label for the page-size select. @default 'Show per page' */
  pageSize: string;
  /** Announcement for the aria-live region when the page changes. @default (page, total) => 'Page {page} of {total}' */
  pageStatus: (page: number, pageCount: number) => string;
  /** Title shown above the page-jump modal on mobile when `showModalTitle` is true. @default 'Select page' */
  pageTitle: string;
  /** Title shown above the page-size modal on mobile when `showModalTitle` is true. @default 'Show per page' */
  pageSizeTitle: string;
}
