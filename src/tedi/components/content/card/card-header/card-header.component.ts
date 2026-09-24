import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";
import { CardContentComponent } from "../card-content/card-content.component";
import { CardBackground } from "../card.utils";

/**
 * Header block of a card. Same API as `tedi-card-content`, but defaults to
 * the brand-primary background and does not inherit background from the card.
 */
@Component({
  selector: "tedi-card-header",
  standalone: true,
  templateUrl: "./card-header.component.html",
  styleUrl: "./card-header.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "classes()",
    "[style]": "styles()",
  },
})
export class CardHeaderComponent extends CardContentComponent {
  protected override blockClass = "tedi-card-header";
  protected override defaultBackground: CardBackground = "brand-primary";

  protected override inheritedBackground(): CardBackground | undefined {
    return undefined;
  }
}
