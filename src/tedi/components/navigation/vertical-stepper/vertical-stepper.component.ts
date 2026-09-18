import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { VerticalStepperItemComponent } from "./vertical-stepper-item/vertical-stepper-item.component";

@Component({
  selector: "tedi-vertical-stepper",
  templateUrl: "./vertical-stepper.component.html",
  styleUrl: "./vertical-stepper.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-vertical-stepper",
    "[class.tedi-vertical-stepper--compact]": "compact()",
    role: "navigation",
    "[attr.aria-label]": "ariaLabel()",
  },
})
export class VerticalStepperComponent {
  /**
   * Accessible name for the navigation landmark.
   */
  ariaLabel = input<string>();
  /**
   * Smaller indicators and tighter rows.
   * @default false
   */
  compact = input(false, { transform: booleanAttribute });
  /**
   * Number compact labels. Regular indicators are always numbered.
   * @default false
   */
  showNumbers = input(false, { transform: booleanAttribute });

  private readonly items = contentChildren(VerticalStepperItemComponent, {
    descendants: false,
  });

  private readonly syncItems = effect(() => {
    const compact = this.compact();
    const showNumber = this.showNumbers();

    this.items().forEach((item, index) => {
      item._stepNumber.set(index + 1);
      item._compact.set(compact);
      item._showNumber.set(showNumber);
    });
  });
}
