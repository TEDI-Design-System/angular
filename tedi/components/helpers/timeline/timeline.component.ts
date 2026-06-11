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
    "[class.tedi-timeline--card]": "variant() === 'card'",
    "[style.--_timeline-card-padding]":
      "variant() === 'card' && cardPadding() ? cardPadding() + 'rem' : null",
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
   * Item padding in rems for the card variant.
   * @default 1
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
