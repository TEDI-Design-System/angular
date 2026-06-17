import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  OnInit,
  OnDestroy,
  model,
  inject,
} from "@angular/core";
import { _IdGenerator } from "@angular/cdk/a11y";
import { AccordionComponent } from "../accordion/accordion.component";

/**
 * A single item inside a `tedi-accordion`. Owns the item's state (expanded)
 * and the inputs shared by header and content (selected, showIconCard,
 * defaultExpanded, disabled).
 *
 * Header-related configuration lives on `tedi-accordion-item-header`; body
 * styling lives on `tedi-accordion-item-content`.
 *
 * Use together with the header and content children:
 *
 * ```html
 * <tedi-accordion-item>
 *   <tedi-accordion-item-header>
 *     <span tedi-accordion-title>Title</span>
 *   </tedi-accordion-item-header>
 *   <tedi-accordion-item-content>Content</tedi-accordion-item-content>
 * </tedi-accordion-item>
 * ```
 *
 * The optional `[tedi-accordion-icon-card]` slot is projected as a direct
 * child of the item (not inside the header), because it occupies its own
 * column in the item's grid layout.
 */
@Component({
  selector: "tedi-accordion-item",
  standalone: true,
  templateUrl: "./accordion-item.component.html",
  styleUrl: "./accordion-item.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
})
export class AccordionItemComponent implements OnInit, OnDestroy {
  readonly idGenerator = inject(_IdGenerator);
  readonly contentId = this.idGenerator.getId("tedi-accordion-content");
  readonly headerId = this.idGenerator.getId("tedi-accordion-header");

  /**
   * Whether the accordion item is expanded initially.
   * Does not control the expanded state after initialization.
   *
   * When omitted, falls back to the parent `tedi-accordion`'s `defaultExpanded`
   * (or `false`). Pass an explicit boolean to override the group default —
   * including `false` to keep an individual item collapsed when the group
   * default is `true`.
   */
  defaultExpanded = input<boolean | undefined>(undefined);
  /**
   * Enables the icon-card layout variant. Affects both header and content
   * styling, so it lives on the item.
   */
  showIconCard = input(false);
  /**
   * Marks the accordion item as selected.
   */
  selected = input(false);
  /**
   * Disables the item — the header trigger becomes non-interactive and the
   * expanded state can no longer be toggled by user interaction. The current
   * state is preserved (e.g. a disabled item that's `defaultExpanded` stays open).
   */
  disabled = input(false);
  /**
   * Stable id used for hash-based deep-linking. Pair with `openOnHashMatch`.
   * Not the same as the auto-generated `headerId` / `contentId` used for ARIA.
   */
  itemId = input<string | undefined>(undefined);
  /**
   * When `true`, auto-expands the item if `window.location.hash` matches
   * `itemId` (e.g. `https://example.com/page#my-item`). Re-runs on
   * `hashchange` so navigating between in-page links updates which item is
   * open. No-op when `itemId` is omitted or the item is disabled.
   */
  openOnHashMatch = input(false);

  expanded = model(false);

  private readonly accordion = inject(AccordionComponent, { optional: true });
  private hashChangeHandler?: () => void;

  ngOnInit() {
    const own = this.defaultExpanded();
    const group = this.accordion?.breakpointInputs().defaultExpanded;
    this.setExpanded(own ?? group ?? false);

    if (
      this.openOnHashMatch() &&
      this.itemId() &&
      !this.disabled() &&
      typeof window !== "undefined"
    ) {
      const id = this.itemId() as string;
      this.hashChangeHandler = () => {
        if (window.location.hash === `#${id}`) {
          this.setExpanded(true);
        }
      };
      this.hashChangeHandler();
      window.addEventListener("hashchange", this.hashChangeHandler);
    }
  }

  ngOnDestroy() {
    if (this.hashChangeHandler && typeof window !== "undefined") {
      window.removeEventListener("hashchange", this.hashChangeHandler);
    }
  }

  toggle() {
    if (this.disabled()) return;
    this.setExpanded(!this.expanded());
  }

  setExpanded(value: boolean) {
    this.expanded.set(value);
    this.accordion?.onItemToggled(this);
  }
}
