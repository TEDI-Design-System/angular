import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { HorizontalStepperItemComponent } from "./horizontal-stepper-item/horizontal-stepper-item.component";

export type HorizontalStepperBackground = "default" | "transparent";

@Component({
  selector: "tedi-horizontal-stepper",
  templateUrl: "./horizontal-stepper.component.html",
  styleUrl: "./horizontal-stepper.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-horizontal-stepper]": "true",
    "[class.tedi-horizontal-stepper--transparent]":
      "background() === 'transparent'",
    role: "navigation",
    "[attr.aria-label]": "ariaLabel()",
  },
})
export class HorizontalStepperComponent {
  ariaLabel = input<string>();
  background = input<HorizontalStepperBackground>("default");

  items = contentChildren(HorizontalStepperItemComponent);

  private assignStepNumbers = effect(() => {
    this.items().forEach((item, index) => {
      item._stepNumber.set(index + 1);
    });
  });
}
