import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { ButtonComponent } from "../../buttons/button/button.component";
import { IconComponent } from "../../base/icon/icon.component";
import { SelectComponent } from "../../form/select/select.component";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { BreakpointService } from "../../../services/breakpoint/breakpoint.service";
import { ModalService } from "../../overlay/modal/modal.service";
import { generateUUID } from "../../../helpers/generate-uuid";
import { usePagination } from "./pagination.utils";
import {
  PaginationBackground,
  PaginationItem,
  PaginationLabels,
  PaginationVisibility,
} from "./pagination.types";
import {
  PaginationMobileModalComponent,
  PaginationMobileModalData,
} from "./pagination-mobile-modal/pagination-mobile-modal.component";

@Component({
  selector: "tedi-pagination",
  standalone: true,
  imports: [
    FormsModule,
    ButtonComponent,
    IconComponent,
    SelectComponent,
    TediTranslationPipe,
  ],
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
   * label is rendered to the left of the nav.
   */
  readonly totalItems = input<number | undefined>(undefined);

  /**
   * Current page size. Two-way bindable with `[(pageSize)]` or used
   * one-way with `[pageSize]` + `(pageSizeChange)`.
   */
  readonly pageSize = model<number | undefined>(undefined);

  /** Options for the page-size select. Empty/undefined hides the select. */
  readonly pageSizeOptions = input<number[]>([]);

  /** Pages always shown at the start and end. @default 1 */
  readonly boundaryCount = input<number>(1);

  /** Pages shown on either side of the current page. @default 1 */
  readonly siblingCount = input<number>(1);

  /** Override any of the default text labels / aria labels. */
  readonly labels = input<Partial<PaginationLabels> | undefined>(undefined);

  /**
   * Background variant. `transparent` removes the surface fill and top border —
   * use it when pagination sits on a non-white container.
   * @default 'white'
   */
  readonly background = input<PaginationBackground>("white");

  /**
   * Hide the "X results" label even when `totalItems` is set. Pass a
   * breakpoint name (e.g. `"md"`) to hide only below that breakpoint —
   * mirrors the `boolean | breakpoint` pattern used by `tedi-modal`'s
   * `fullscreen` input.
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

  /** Emits whenever the user navigates to a different page. */
  readonly pageChange = output<number>();

  /** Emits when the user picks a different page size. */
  readonly pageSizeChange = output<number>();

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
    ];
    if (!this.showPager()) classes.push("tedi-pagination--no-pager");
    if (!this.showResults()) classes.push("tedi-pagination--no-results");
    if (!this.showPageSizeSelect()) classes.push("tedi-pagination--no-page-size");
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

  protected readonly showResults = computed(
    () => !this.isResultsHidden() && this.totalItems() !== undefined,
  );
  protected readonly showPageSizeSelect = computed(
    () => !this.isPageSizeHidden() && this.pageSizeOptions().length > 0,
  );
  protected readonly showPager = computed(
    () => !this.isPagerHidden() && this.pageCount() > 1,
  );

  private resolveVisibility(value: PaginationVisibility): boolean {
    if (typeof value === "boolean") return value;
    const current = this.currentBreakpoint();
    if (!current) return false;
    const order = PaginationComponent.BREAKPOINT_ORDER;
    return order.indexOf(current) < order.indexOf(value);
  }

  protected readonly pageSizeSelectOptions = computed(() =>
    this.pageSizeOptions().map((option) => ({
      value: option,
      label: String(option),
    })),
  );

  protected readonly mobileTriggerLabel = computed(
    () => `${this.currentPage()} / ${this.pageCount()}`,
  );

  /**
   * Accessible name for the mobile trigger button. Starts with the visible
   * text (`{current} / {total}`) so WCAG 2.5.3 (Label in Name) is satisfied
   * for voice-control users.
   */
  protected readonly mobileTriggerAriaLabel = computed(
    () =>
      `${this.mobileTriggerLabel()}, ${this.mergedLabels().ariaLabel}`,
  );

  /** Whether the mobile picker modal is currently open. */
  protected readonly isMobileModalOpen = signal(false);

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
    const data: PaginationMobileModalData = {
      pageCount: this.pageCount(),
      currentPage: this.currentPage(),
      labels: this.mergedLabels(),
    };

    this.isMobileModalOpen.set(true);
    const ref = this.modalService.open<number, PaginationMobileModalData>(
      PaginationMobileModalComponent,
      {
        data,
        width: "360px",
        ariaLabel: this.mergedLabels().ariaLabel,
      },
    );

    ref.closed.subscribe((selected) => {
      this.isMobileModalOpen.set(false);
      if (typeof selected === "number") {
        this.handlePageChange(selected);
      }
    });
  }
}
