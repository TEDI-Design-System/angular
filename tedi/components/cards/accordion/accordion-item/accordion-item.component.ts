import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  input,
  OnInit,
  model,
  inject,
} from "@angular/core";
import { _IdGenerator } from "@angular/cdk/a11y";
import { AccordionComponent } from "../accordion/accordion.component";

/**
 * A single item inside a `tedi-accordion`. Owns the item's state (expanded)
 * and the inputs shared by header and content (selected, showIconCard,
 * defaultExpanded).
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
export class AccordionItemComponent implements OnInit {
  readonly idGenerator = inject(_IdGenerator);
  readonly contentId = this.idGenerator.getId("tedi-accordion-content");
  readonly headerId = this.idGenerator.getId("tedi-accordion-header");

  /**
   * Whether the accordion item is expanded initially.
   * Does not control the expanded state after initialization.
   */
  defaultExpanded = input(false);
  /**
   * Enables the icon-card layout variant. Affects both header and content
   * styling, so it lives on the item.
   */
  showIconCard = input(false);
  /**
   * Marks the accordion item as selected.
   */
  selected = input(false);

  expanded = model(false);

  private readonly accordion = inject(AccordionComponent, { optional: true });

  ngOnInit() {
    this.setExpanded(this.defaultExpanded());
  }

  toggle() {
    this.setExpanded(!this.expanded());
  }

  setExpanded(value: boolean) {
    this.expanded.set(value);
    this.accordion?.onItemToggled(this);
  }
}
