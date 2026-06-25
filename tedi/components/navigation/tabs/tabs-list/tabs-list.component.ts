import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  PLATFORM_ID,
  ViewEncapsulation,
  afterNextRender,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { IconComponent } from "../../../base/icon/icon.component";
import { DropdownComponent } from "../../../overlay/dropdown/dropdown.component";
import { DropdownTriggerDirective } from "../../../overlay/dropdown/dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "../../../overlay/dropdown/dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../../../overlay/dropdown/dropdown-item/dropdown-item.component";
import { TediTranslationPipe } from "../../../../services/translation/translation.pipe";
import { TabsComponent } from "../tabs.component";
import { TabsTriggerComponent } from "../tabs-trigger/tabs-trigger.component";

export type TabsOverflowMode = "dropdown" | "scroll";

interface OverflowItem {
  id: string;
  label: string;
  disabled: boolean;
  icon?: string;
}

/**
 * Container for the tab triggers. Renders the `role="tablist"` element and
 * handles tab overflow either through a "More" dropdown or horizontal scroll.
 */
@Component({
  selector: "tedi-tabs-list",
  standalone: true,
  imports: [
    IconComponent,
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemComponent,
    TediTranslationPipe,
  ],
  templateUrl: "./tabs-list.component.html",
  styleUrl: "./tabs-list.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-tabs-list",
    "[class.tedi-tabs-list--fade-start]":
      "overflowMode() === 'scroll' && canScrollStart()",
    "[class.tedi-tabs-list--fade-end]":
      "overflowMode() === 'scroll' && canScrollEnd()",
  },
})
export class TabsListComponent implements AfterViewInit, OnDestroy {
  private readonly tabs = inject(TabsComponent);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  /** Accessible label for the tablist. */
  readonly ariaLabel = input<string>(undefined, { alias: "aria-label" });
  /** Id of the element labelling the tablist. */
  readonly ariaLabelledby = input<string>(undefined, {
    alias: "aria-labelledby",
  });
  /**
   * How to handle tab overflow when tabs do not fit in the available space.
   * - `dropdown`: overflowing tabs move into a "More" dropdown (default)
   * - `scroll`: enables horizontal scrolling with a fade indicator
   */
  readonly overflowMode = input<TabsOverflowMode>("dropdown");
  /** Label for the overflow dropdown trigger. Defaults to the `more` translation. */
  readonly dropdownLabel = input<string>();

  private readonly listRef =
    viewChild.required<ElementRef<HTMLDivElement>>("list");
  private readonly triggers = contentChildren(TabsTriggerComponent);

  private readonly isOverflowing = signal(false);
  private resizeObserver?: ResizeObserver;

  readonly canScrollStart = signal(false);
  readonly canScrollEnd = signal(false);

  readonly showMore = computed(
    () =>
      this.overflowMode() === "dropdown" &&
      this.isOverflowing() &&
      this.triggers().length > 1,
  );

  readonly dropdownItems = computed<OverflowItem[]>(() => {
    const active = this.tabs.activeTab();
    return this.triggers()
      .filter((trigger) => trigger.id() !== active)
      .map((trigger) => ({
        id: trigger.id(),
        label: trigger.label,
        disabled: trigger.disabled(),
        icon: trigger.icon(),
      }));
  });

  constructor() {
    // The ResizeObserver only fires on container resize, so re-check overflow
    // when the set of triggers changes too. Measure after the next render so the
    // DOM reflects the added/removed triggers.
    effect(() => {
      this.triggers();
      if (!isPlatformBrowser(this.platformId)) return;
      if (this.overflowMode() !== "dropdown") return;
      afterNextRender(() => this.checkOverflow(), { injector: this.injector });
    });
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.overflowMode() === "dropdown") {
      this.checkOverflow();
    }
    this.updateScrollFade();

    this.resizeObserver = new ResizeObserver(() => {
      if (this.overflowMode() === "scroll") {
        this.updateScrollFade();
      } else {
        this.checkOverflow();
      }
    });
    this.resizeObserver.observe(this.host.nativeElement);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  selectTab(id: string): void {
    this.tabs.select(id);
  }

  // Horizontal fade is implemented inline because the shared ScrollFadeComponent
  // only supports a vertical (top/bottom) axis.
  updateScrollFade(): void {
    if (this.overflowMode() !== "scroll") return;
    const list = this.listRef().nativeElement;
    this.canScrollStart.set(list.scrollLeft > 0);
    this.canScrollEnd.set(
      Math.ceil(list.scrollLeft + list.clientWidth) < list.scrollWidth,
    );
  }

  private checkOverflow(): void {
    const wrapper = this.host.nativeElement;
    const list = this.listRef().nativeElement;
    if (list.clientWidth === 0) return;

    // Overflow hides non-selected triggers (display:none), collapsing scrollWidth.
    // Measure with the class off (sync reflow, no paint) to get the true width.
    const overflowClass = "tedi-tabs-list__items--overflow";
    const wasCollapsed = list.classList.contains(overflowClass);
    if (wasCollapsed) list.classList.remove(overflowClass);
    const naturalWidth = list.scrollWidth;
    if (wasCollapsed) list.classList.add(overflowClass);

    this.isOverflowing.set(naturalWidth > wrapper.clientWidth);
  }
}
