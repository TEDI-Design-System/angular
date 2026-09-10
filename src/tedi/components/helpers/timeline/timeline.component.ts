import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { TimelineItemComponent } from "./timeline-item/timeline-item.component";
import { CardPaddingNumber } from "../../content/card/card.utils";

export type TimelineVariant = "default" | "card";

export type TimelineCardPadding = CardPaddingNumber;

@Component({
  standalone: true,
  selector: "tedi-timeline",
  template: "<ng-content />",
  styleUrl: "./timeline.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-timeline",
    "[class.tedi-timeline--card]": "variant() === 'card'",
    "[style.--_timeline-card-padding]":
      "variant() === 'card' && cardPadding() != null ? cardPadding() + 'rem' : null",
  },
})
export class TimelineComponent {
  /** Index of active item */
  activeIndex = input<number>();
  /**
   * Visual variant. "card" wraps the timeline in the borders and paddings
   * of a card.
   * @default default
   */
  variant = input<TimelineVariant>("default");
  /**
   * Vertical padding of each item in the "card" variant, in rems (same scale
   * as Card). Both the gaps between items and the card's top/bottom edges
   * resolve to twice this value. Horizontal item padding is fixed at the card
   * default.
   * @default 0.5
   */
  cardPadding = input<TimelineCardPadding>();

  items = signal<TimelineItemComponent[]>([]);

  registerItem(item: TimelineItemComponent) {
    this.items.update((list) => [...list, item]);
  }

  unregisterItem(item: TimelineItemComponent) {
    this.items.update((list) => list.filter((i) => i !== item));
  }
}
