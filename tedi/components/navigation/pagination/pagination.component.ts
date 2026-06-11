import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonComponent, ButtonVariant } from "../../buttons/button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { SelectComponent } from "../../form/select/select.component";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { BreakpointService } from "../../../services/breakpoint/breakpoint.service";
import { ModalService } from "../../overlay/modal/modal.service";
import { generateUUID } from "../../../helpers/generate-uuid";
import { usePagination } from "./pagination.utils";
import {
  PaginationBackground,
  PaginationDividerPosition,
  PaginationItem,
  PaginationLabels,
  PaginationPageSizeOption,
  PaginationVisibility,
} from "./pagination.types";
import { TediPaginationResultsDirective } from "./pagination-results.directive";
import {
  PaginationOptionPickerModalComponent,
  PaginationOptionPickerModalData,
  PaginationOptionPickerOption,
} from "./pagination-option-picker-modal/pagination-option-picker-modal.component";

@Component({
  selector: "tedi-pagination",
  standalone: true,
  imports: [FormsModule, ButtonComponent, IconComponent, SelectComponent],
  templateUrl: "./pagination.component.html",
  styleUrl: "./pagination.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "hostClasses()",
    "data-name": "tedi-pagination",
  },
})
export class PaginationComponent {
  /** Total number of pages. */
  readonly pageCount = input.required<number>();

  /**
   * Current page (1-based). Two-way bindable with `[(page)]` or used
   * one-way with `[page]` + `(pageChange)`.
   * @default 1
   */
  readonly page = model<number>(1);

  /**
   * Total number of items across all pages. When set, the "{count} results"
   * label is rendered to the left of the nav. Can be replaced entirely by
   * projecting `[tediPaginationResults]` content.
   */
  readonly totalItems = input<number | undefined>(undefined);

  /**
   * Current page size. Two-way bindable with `[(pageSize)]` or used
   * one-way with `[pageSize]` + `(pageSizeChange)`.
   */
  readonly pageSize = model<number | undefined>(undefined);

  /**
   * Options for the page-size select. Empty/undefined hides the select.
   * Accepts plain numbers, or `{ value, label }` objects when the visible
   * text should differ from the value — e.g. a "Show all" entry
   * `{ value: totalItems, label: 'Show all' }`. Selecting an option emits its
   * `value` via `pageSizeChange`; the pager collapses naturally once the
   * consumer recomputes `pageCount` down to 1.
   */
  readonly pageSizeOptions = input<(number | PaginationPageSizeOption)[]>([]);

  /** Pages always shown at the start and end. @default 1 */
  readonly boundaryCount = input<number>(1);

  /** Pages shown on either side of the current page. @default 1 */
  readonly siblingCount = input<number>(1);

  /** Override any of the default text labels / aria labels. */
  readonly labels = input<Partial<PaginationLabels> | undefined>(undefined);

  /**
   * Background variant. `transparent` removes the surface fill and divider —
   * use it when pagination sits on a non-white container.
   * @default 'white'
   */
  readonly background = input<PaginationBackground>("white");

  /**
   * Where the divider line sits relative to the pagination row.
   * `'none'` removes the divider entirely. The `transparent` background
   * variant overrides this and never renders a divider.
   * @default 'top'
   */
  readonly dividerPosition = input<PaginationDividerPosition>("top");

  /**
   * Hide the "X results" label even when `totalItems` is set or content is
   * projected via `[tediPaginationResults]`. Pass a breakpoint name to hide
   * only below that breakpoint.
   * @default false
   */
  readonly hideResults = input<PaginationVisibility>(false);

  /**
   * Hide the page-size dropdown even when `pageSizeOptions` is non-empty.
   * Pass a breakpoint name to hide only below that breakpoint.
   * @default false
   */
  readonly hidePageSize = input<PaginationVisibility>(false);

  /**
   * Hide the pager (prev/next + page list). Pass a breakpoint name to hide
   * only below that breakpoint.
   * @default false
   */
  readonly hidePager = input<PaginationVisibility>(false);

  /**
   * Hide the prev/next arrow buttons inside the pager. Pass a breakpoint
   * name to hide only below that breakpoint. The page list / mobile picker
   * stays visible.
   * @default false
   */
  readonly hideArrows = input<PaginationVisibility>(false);

  /**
   * Keep prev/next arrows rendered (but disabled) at the first/last page
   * instead of removing them from the DOM. Useful when the pager should
   * have a stable footprint regardless of position.
   * @default false
   */
  readonly disableArrowsAtBoundary = input<boolean>(false);

  /**
   * Variant for the prev/next arrow buttons — accepts any `tedi-button`
   * variant. Defaults to `neutral` for icon-only arrows; pair with
   * `showArrowLabels` to render a regular button (e.g. `primary` with text).
   * @default 'neutral'
   */
  readonly arrowVariant = input<ButtonVariant>("neutral");

  /**
   * Render the `previous` / `next` labels as visible button text next to
   * the arrow icon. When false (default) the buttons are icon-only and the
   * labels are exposed only via `aria-label`.
   * @default false
   */
  readonly showArrowLabels = input<boolean>(false);

  /**
   * Material Symbols icon name for the previous-page arrow.
   * @default 'arrow_back'
   */
  readonly previousIcon = input<string>("arrow_back");

  /**
   * Material Symbols icon name for the next-page arrow.
   * @default 'arrow_forward'
   */
  readonly nextIcon = input<string>("arrow_forward");

  /**
   * Show a heading inside the mobile page-jump / page-size picker modals.
   * Uses the `pageTitle` / `pageSizeTitle` labels.
   * @default true
   */
  readonly showModalTitle = input<boolean>(true);

  /** Emits whenever the user navigates to a different page. */
  readonly pageChange = output<number>();

  /** Emits when the user picks a different page size. */
  readonly pageSizeChange = output<number>();

  /** Detects the `[tediPaginationResults]` content-projection slot, if any. */
  protected readonly customResults = contentChild(TediPaginationResultsDirective);

  private readonly translationService = inject(TediTranslationService);
  private readonly breakpointService = inject(BreakpointService);
  private readonly modalService = inject(ModalService);

  /** True below `md` — pager swaps to the compact `current / total` picker. */
  protected readonly useCompactPicker = this.breakpointService.isBelowBreakpoint("md");
  protected readonly pageSizeInputId = `tedi-pagination-page-size-${generateUUID()}`;

  protected readonly hostClasses = computed(() => {
    const classes = [
      "tedi-pagination",
      `tedi-pagination--bg-${this.background()}`,
      `tedi-pagination--divider-${this.dividerPosition()}`,
    ];
    if (!this.showPager()) classes.push("tedi-pagination--no-pager");
    if (!this.showResults()) classes.push("tedi-pagination--no-results");
    if (!this.showPageSizeSelect()) classes.push("tedi-pagination--no-page-size");
    if (!this.showArrows()) classes.push("tedi-pagination--no-arrows");
    return classes.join(" ");
  });

  protected readonly currentPage = computed(() => {
    const total = this.pageCount();
    if (total <= 0) return 1;
    return Math.max(1, Math.min(total, this.page()));
  });

  protected readonly items = computed<PaginationItem[]>(() =>
    usePagination({
      page: this.currentPage(),
      pageCount: this.pageCount(),
      boundaryCount: this.boundaryCount(),
      siblingCount: this.siblingCount(),
    }),
  );

  private static readonly EMPTY_NAV_ITEM: PaginationItem = {
    type: "page",
    page: null,
    selected: false,
    disabled: true,
  };

  protected readonly previousItem = computed(
    () => this.items()[0] ?? PaginationComponent.EMPTY_NAV_ITEM,
  );
  protected readonly nextItem = computed(
    () => this.items()[this.items().length - 1] ?? PaginationComponent.EMPTY_NAV_ITEM,
  );
  protected readonly pageItems = computed(() => this.items().slice(1, -1));

  protected readonly mergedLabels = computed<PaginationLabels>(() => {
    const t = this.translationService;
    const overrides = this.labels() ?? {};
    return {
      ariaLabel: overrides.ariaLabel ?? t.translate("pagination.title"),
      previous: overrides.previous ?? t.translate("pagination.prev-page"),
      next: overrides.next ?? t.translate("pagination.next-page"),
      pageAriaLabel:
        overrides.pageAriaLabel ?? ((p) => t.translate("pagination.page", p, false)),
      currentPageAriaLabel:
        overrides.currentPageAriaLabel ?? ((p) => t.translate("pagination.page", p, true)),
      results: overrides.results ?? ((count) => t.translate("pagination.results", count)),
      pageSize: overrides.pageSize ?? t.translate("pagination.page-size"),
      pageStatus:
        overrides.pageStatus ??
        ((p, total) => t.translate("pagination.page-status", p, total)),
      pageTitle: overrides.pageTitle ?? t.translate("pagination.page-title"),
      pageSizeTitle:
        overrides.pageSizeTitle ?? t.translate("pagination.page-size-title"),
    };
  });

  private readonly currentBreakpoint = this.breakpointService.currentBreakpoint();
  private static readonly BREAKPOINT_ORDER = [
    "xs",
    "sm",
    "md",
    "lg",
    "xl",
    "xxl",
  ] as const;

  protected readonly isResultsHidden = computed(() =>
    this.resolveVisibility(this.hideResults()),
  );
  protected readonly isPageSizeHidden = computed(() =>
    this.resolveVisibility(this.hidePageSize()),
  );
  protected readonly isPagerHidden = computed(() =>
    this.resolveVisibility(this.hidePager()),
  );
  protected readonly areArrowsHidden = computed(() =>
    this.resolveVisibility(this.hideArrows()),
  );

  protected readonly showResults = computed(
    () =>
      !this.isResultsHidden() &&
      (this.customResults() != null || this.totalItems() !== undefined),
  );
  protected readonly showPageSizeSelect = computed(
    () => !this.isPageSizeHidden() && this.pageSizeOptions().length > 0,
  );
  protected readonly showPager = computed(
    () => !this.isPagerHidden() && this.pageCount() > 1,
  );

  /**
   * Whether the prev/next arrows should render at all. When false they're
   * removed from the DOM. At the first/last page, individual arrows are
   * additionally gated by `disableArrowsAtBoundary` — see `showPrevious`
   * / `showNext`.
   */
  protected readonly showArrows = computed(() => !this.areArrowsHidden());

  /**
   * Whether the previous-arrow button is rendered. Removed at the first
   * page unless `disableArrowsAtBoundary` keeps it as a disabled button.
   */
  protected readonly showPrevious = computed(
    () =>
      this.showArrows() &&
      (this.disableArrowsAtBoundary() || !this.previousItem().disabled),
  );

  /**
   * Whether the next-arrow button is rendered. Removed at the last page
   * unless `disableArrowsAtBoundary` keeps it as a disabled button.
   */
  protected readonly showNext = computed(
    () =>
      this.showArrows() &&
      (this.disableArrowsAtBoundary() || !this.nextItem().disabled),
  );

  private resolveVisibility(value: PaginationVisibility): boolean {
    if (typeof value === "boolean") return value;
    const current = this.currentBreakpoint();
    if (!current) return false;
    const order = PaginationComponent.BREAKPOINT_ORDER;
    return order.indexOf(current) < order.indexOf(value);
  }

  protected readonly pageSizeSelectOptions = computed<PaginationPageSizeOption[]>(() =>
    this.pageSizeOptions().map((option) =>
      typeof option === "number" ? { value: option, label: String(option) } : option,
    ),
  );

  /**
   * Visible text for the currently selected page size. Resolves the matching
   * option's label so labelled options (e.g. "Show all") render their text
   * instead of the raw numeric value on the mobile trigger.
   */
  protected readonly selectedPageSizeLabel = computed(() => {
    const current = this.pageSize();
    const match = this.pageSizeSelectOptions().find((o) => o.value === current);
    return match?.label ?? (current != null ? String(current) : "");
  });

  protected readonly mobileTriggerLabel = computed(
    () => `${this.currentPage()} / ${this.pageCount()}`,
  );

  /**
   * Accessible name for the mobile trigger button. Starts with the visible
   * text (`{current} / {total}`) so WCAG 2.5.3 (Label in Name) is satisfied
   * for voice-control users.
   */
  protected readonly mobileTriggerAriaLabel = computed(
    () => `${this.mobileTriggerLabel()}, ${this.mergedLabels().ariaLabel}`,
  );

  protected readonly mobilePageSizeAriaLabel = computed(
    () => `${this.selectedPageSizeLabel()}, ${this.mergedLabels().pageSize}`,
  );

  /** Whether the mobile page-jump picker modal is currently open. */
  protected readonly isMobileModalOpen = signal(false);
  /** Whether the mobile page-size picker modal is currently open. */
  protected readonly isPageSizeModalOpen = signal(false);

  protected readonly statusText = computed(() =>
    this.pageCount() > 1
      ? this.mergedLabels().pageStatus(this.currentPage(), this.pageCount())
      : "",
  );

  constructor() {
    effect(() => {
      const total = this.pageCount();
      const current = this.page();
      if (total > 0 && current > total) {
        this.page.set(total);
      } else if (current < 1) {
        this.page.set(1);
      }
    });
  }

  protected handlePageChange(nextPage: number | null): void {
    if (nextPage == null) return;
    const total = this.pageCount();
    if (nextPage < 1 || nextPage > total || nextPage === this.currentPage()) return;
    this.page.set(nextPage);
    this.pageChange.emit(nextPage);
  }

  protected handlePageSizeChange(value: number | null): void {
    if (value == null || value === this.pageSize()) return;
    this.pageSize.set(value);
    this.pageSizeChange.emit(value);
  }

  protected openMobilePicker(): void {
    const labels = this.mergedLabels();
    const options: PaginationOptionPickerOption[] = Array.from(
      { length: this.pageCount() },
      (_, i) => {
        const page = i + 1;
        const isSelected = page === this.currentPage();
        return {
          value: page,
          label: String(page),
          ariaLabel: isSelected
            ? labels.currentPageAriaLabel(page)
            : labels.pageAriaLabel(page),
        };
      },
    );

    this.isMobileModalOpen.set(true);
    const ref = this.openPickerModal({
      data: {
        options,
        selectedValue: this.currentPage(),
        title: this.showModalTitle() ? labels.pageTitle : undefined,
      },
      ariaLabel: labels.ariaLabel,
    });

    ref.closed.subscribe((selected) => {
      this.isMobileModalOpen.set(false);
      if (typeof selected === "number") {
        this.handlePageChange(selected);
      }
    });
  }

  protected openPageSizePicker(): void {
    const labels = this.mergedLabels();
    const current = this.pageSize();
    const options: PaginationOptionPickerOption[] = this.pageSizeSelectOptions().map(
      ({ value, label }) => ({
        value,
        label,
        ariaLabel: `${labels.pageSize}, ${label}`,
      }),
    );

    this.isPageSizeModalOpen.set(true);
    const ref = this.openPickerModal({
      data: {
        options,
        selectedValue: current ?? options[0]?.value ?? 0,
        title: this.showModalTitle() ? labels.pageSizeTitle : undefined,
      },
      ariaLabel: labels.pageSize,
    });

    ref.closed.subscribe((selected) => {
      this.isPageSizeModalOpen.set(false);
      if (typeof selected === "number") {
        this.handlePageSizeChange(selected);
      }
    });
  }

  private openPickerModal(args: {
    data: PaginationOptionPickerModalData;
    ariaLabel: string;
  }) {
    return this.modalService.open<number, PaginationOptionPickerModalData>(
      PaginationOptionPickerModalComponent,
      {
        data: args.data,
        width: "360px",
        position: "bottom",
        ariaLabel: args.ariaLabel,
      },
    );
  }
}
