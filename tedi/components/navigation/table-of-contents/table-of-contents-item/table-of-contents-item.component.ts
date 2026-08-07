import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  inject,
  input,
  Signal,
  ViewEncapsulation,
} from "@angular/core";

import { SeparatorComponent } from "../../../helpers/separator/separator.component";
import { TableOfContentsComponent } from "../table-of-contents.component";

/**
 * A single entry in a `tedi-table-of-contents`. Its non-item content (a
 * `tedi-link`, anchor or button) is the clickable label; nested
 * `tedi-table-of-contents-item` children become this item's sub-items and are
 * only revealed when the item is on the active branch.
 */
@Component({
  selector: "tedi-table-of-contents-item",
  standalone: true,
  imports: [SeparatorComponent],
  templateUrl: "./table-of-contents-item.component.html",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-table-of-contents__item",
    role: "listitem",
    "[class.tedi-table-of-contents__item--selected]": "isSelected()",
    "[attr.aria-current]": "isSelected() ? 'true' : null",
    "[attr.data-name]": "'table-of-contents-item'",
  },
})
export class TableOfContentsItemComponent {
  /**
   * Unique id. Required to mark the item active (via the parent's `activeId`)
   * and to be the parent of nested items. Named `itemId` to avoid
   * shadowing the native `id` attribute.
   */
  readonly itemId = input<string>();
  /** Render a separator below the item. */
  readonly separator = input<boolean>(false);

  private readonly root = inject(TableOfContentsComponent);
  private readonly parent = inject(TableOfContentsItemComponent, {
    optional: true,
    skipSelf: true,
  });

  /** Direct nested items (a single level down). */
  readonly childItems = contentChildren(TableOfContentsItemComponent);

  readonly numbered = computed(() => this.root.numbered());

  readonly depth: Signal<number> = computed(() =>
    this.parent ? this.parent.depth() + 1 : 1,
  );
  /** CSS indent level — capped at 2, matching the design's two-level hierarchy. */
  readonly level = computed(() => Math.min(this.depth(), 2));
  readonly hasChildren = computed(() => this.childItems().length > 0);

  readonly isSelected = computed(
    () => !!this.itemId() && this.itemId() === this.root.activeId(),
  );
  /** Whether the active item is this item or somewhere in its subtree. */
  readonly containsActive: Signal<boolean> = computed(
    () =>
      this.isSelected() ||
      this.childItems().some((child) => child.containsActive()),
  );
  /** Expand nested items only along the branch leading to the active item. */
  readonly isOpen = computed(() => this.hasChildren() && this.containsActive());

  private readonly siblings = computed(() =>
    this.parent ? this.parent.childItems() : this.root.items(),
  );
  private readonly index = computed(() => this.siblings().indexOf(this));
  private readonly numberPrefix: Signal<string | undefined> = computed(() =>
    this.parent ? this.parent.numberBase() : undefined,
  );
  /** Hierarchical number base without trailing dot, e.g. `2` or `2.1`. */
  readonly numberBase: Signal<string> = computed(() => {
    const position = this.index() + 1;
    const prefix = this.numberPrefix();
    return prefix ? `${prefix}.${position}` : `${position}`;
  });
  /** Rendered number — `1.` at the top level, `1.1` when nested. */
  readonly numberLabel = computed(() =>
    this.numberPrefix() ? this.numberBase() : `${this.numberBase()}.`,
  );
}
