import { Dialog, DialogRef } from "@angular/cdk/dialog";
import { Overlay } from "@angular/cdk/overlay";
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  signal,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";

import { TextComponent } from "../../../base/text/text.component";
import { CollapseButtonComponent } from "../../../buttons/collapse-button/collapse-button.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { TableOfContentsComponent } from "../table-of-contents.component";
import { TableOfContentsItemComponent } from "../table-of-contents-item/table-of-contents-item.component";

/**
 * Mobile variant of `tedi-table-of-contents`: a bottom bar that opens the list
 * in a bottom-sheet overlay. Takes the same `tedi-table-of-contents-item`
 * children as the desktop card; render it on small viewports.
 *
 * It provides itself as `TableOfContentsComponent` so the projected items
 * resolve their context (`activeId`, `numbered`, `items`) exactly as they do
 * inside the desktop component.
 */
@Component({
  selector: "tedi-table-of-contents-collapsible",
  standalone: true,
  imports: [TextComponent, CollapseButtonComponent],
  templateUrl: "./table-of-contents-collapsible.component.html",
  styleUrl: "../table-of-contents.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-table-of-contents-collapsible",
    "[attr.data-name]": "'table-of-contents-collapsible'",
  },
  providers: [
    {
      provide: TableOfContentsComponent,
      useExisting: forwardRef(() => TableOfContentsCollapsibleComponent),
    },
  ],
})
export class TableOfContentsCollapsibleComponent implements OnDestroy {
  /**
   * Heading shown on the bar and sheet. Defaults to the localised "Table of
   * contents" label.
   */
  readonly heading = input<string | null | undefined>(undefined);
  /** Id of the currently active item. */
  readonly activeId = input<string>();
  /**
   * Whether nested items are expanded by default. When `false`, a branch reveals
   * its sub-items only while it is on the active trail. Mirrors
   * `tedi-table-of-contents` so projected items resolve it via the shared root.
   * @default true
   */
  readonly defaultOpen = input<boolean>(true);
  /** Show auto-generated hierarchical numbers (`1.`, `2.`, `2.1`, …). */
  readonly numbered = input<boolean>(false);
  /**
   * Pin the bar to the bottom of the viewport. Set `false` to render it inline.
   */
  readonly sticky = input<boolean>(true);
  /**
   * Hide the bar while the user scrolls down and reveal it when they scroll up,
   * keeping the reading area clear. Watches window scroll by default; set
   * `scrollContainer` to watch a scrollable element instead.
   * @default false
   */
  readonly hideOnScroll = input<boolean>(false);
  /**
   * Element whose scroll drives `hideOnScroll`. Defaults to the window; set it to
   * the scrollable container when the content scrolls inside a region rather than
   * the whole page.
   */
  readonly scrollContainer = input<HTMLElement>();
  /**
   * Accessible name for the sheet's navigation landmark and dialog. Defaults to
   * the visible title.
   */
  readonly ariaLabel = input<string>();

  /** Top-level items, read by items to compute their hierarchical numbers. */
  readonly items = contentChildren(
    forwardRef(() => TableOfContentsItemComponent),
  );

  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);
  private readonly translations = inject(TediTranslationService);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);

  private readonly sheet = viewChild.required<TemplateRef<unknown>>("sheet");
  private dialogRef?: DialogRef<unknown>;

  readonly open = signal(false);
  /** True while the sticky bar is hidden by a scroll-down gesture. */
  readonly barHidden = signal(false);

  private lastScrollY = 0;
  private ticking = false;
  private scrollTarget?: HTMLElement | Window;
  private readonly onScroll = () => this.handleScroll();

  constructor() {
    // Runs client-side only; drives the scroll-away behaviour for `hideOnScroll`.
    afterNextRender(() => {
      const target = this.scrollContainer() ?? window;
      this.scrollTarget = target;
      this.lastScrollY = this.currentScrollY();
      // Outside Angular so scroll events don't trigger change detection; the
      // `barHidden` signal updates the view on its own when it actually changes.
      this.zone.runOutsideAngular(() => {
        target.addEventListener("scroll", this.onScroll, {
          passive: true,
        });
      });
    });
  }

  private currentScrollY(): number {
    const el = this.scrollContainer();
    return el ? el.scrollTop : window.scrollY;
  }

  private readonly titleLabel = this.translations.track(
    "table-of-contents.title",
  );
  readonly openLabel = this.translations.track("open");
  readonly closeLabel = this.translations.track("close");

  readonly title = computed(() => this.heading() ?? this.titleLabel());
  /** Accessible name for the nav/dialog — the `ariaLabel` override or the title. */
  readonly navLabel = computed(() => this.ariaLabel() || this.title());

  toggle(open: boolean): void {
    if (open) {
      this.openSheet();
    } else {
      this.close();
    }
  }

  close(): void {
    this.dialogRef?.close();
  }

  ngOnDestroy(): void {
    this.close();
    if (isPlatformBrowser(this.platformId)) {
      this.scrollTarget?.removeEventListener("scroll", this.onScroll);
    }
  }

  // Reveal on scroll up, hide on scroll down; always show near the top. Throttled
  // to one update per frame and ignores sub-pixel jitter.
  private handleScroll(): void {
    if (this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      const currentY = this.currentScrollY();
      if (!this.hideOnScroll()) {
        this.barHidden.set(false);
        this.lastScrollY = currentY;
        return;
      }
      const delta = currentY - this.lastScrollY;
      if (Math.abs(delta) < 4) return;
      this.barHidden.set(currentY > 8 && delta > 0);
      this.lastScrollY = currentY;
    });
  }

  onListClick(event: Event): void {
    if ((event.target as HTMLElement).closest("a, button")) {
      this.close();
    }
  }

  private openSheet(): void {
    if (this.dialogRef) return;

    this.open.set(true);
    this.dialogRef = this.dialog.open(this.sheet(), {
      panelClass: "tedi-table-of-contents__sheet-panel",
      backdropClass: "tedi-table-of-contents__backdrop",
      hasBackdrop: true,
      ariaModal: true,
      ariaLabel: this.navLabel(),
      autoFocus: "first-tabbable",
      restoreFocus: true,
      disableClose: true,
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .bottom("0"),
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });

    this.dialogRef.backdropClick?.subscribe(() => this.close());
    this.dialogRef.keydownEvents?.subscribe((event) => {
      if (event.key === "Escape") this.close();
    });
    this.dialogRef.closed.subscribe(() => {
      this.dialogRef = undefined;
      this.open.set(false);
    });
  }
}
