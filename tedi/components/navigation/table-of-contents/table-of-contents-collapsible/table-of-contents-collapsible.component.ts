import { Dialog, DialogRef } from "@angular/cdk/dialog";
import { Overlay } from "@angular/cdk/overlay";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  OnDestroy,
  signal,
  TemplateRef,
  viewChild,
  ViewEncapsulation,
} from "@angular/core";

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
 * resolve their context (`activeId`, `showIcons`, `numbered`, `items`) exactly
 * as they do inside the desktop component.
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
  /** Show a validation glyph before each item (multistep-form usage). */
  readonly showIcons = input<boolean>(false);
  /** Show auto-generated hierarchical numbers (`1.`, `2.`, `2.1`, …). */
  readonly numbered = input<boolean>(false);
  /**
   * Pin the bar to the bottom of the viewport. Set `false` to render it inline.
   */
  readonly sticky = input<boolean>(true);
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

  private readonly sheet = viewChild.required<TemplateRef<unknown>>("sheet");
  private dialogRef?: DialogRef<unknown>;

  readonly open = signal(false);

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
