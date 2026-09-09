import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { CardContentComponent } from "../card-content/card-content.component";
import { CardBackground, CardPadding } from "../card.utils";

export type CardIconType = "default" | "brand";
export type CardIconSize = "default" | "small";

/**
 * Icon cell for a card row. The projected icon is aligned to the top of the
 * cell and inherits the cell color. Pair the small size with a 16px icon.
 */
@Component({
  selector: "tedi-card-icon",
  standalone: true,
  templateUrl: "./card-icon.component.html",
  styleUrl: "./card-icon.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "classes()",
    "[style]": "styles()",
  },
})
export class CardIconComponent extends CardContentComponent {
  /**
   * Visual type of the icon cell.
   * @default default
   */
  type = input<CardIconType>("default");
  /**
   * Size of the icon cell.
   * @default default
   */
  size = input<CardIconSize>("default");

  protected override blockClass = "tedi-card-icon";

  protected override inheritedBackground(): CardBackground | undefined {
    return this.type() === "brand" ? "brand-primary" : "secondary";
  }

  protected override defaultPadding(): CardPadding {
    return this.size() === "small" ? 0.75 : 1;
  }
}
