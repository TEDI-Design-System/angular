import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../../base/icon/icon.component";
import { TediTranslationPipe } from "../../../../services/translation/translation.pipe";

@Component({
  selector: "tedi-horizontal-stepper-item",
  imports: [IconComponent, TediTranslationPipe],
  templateUrl: "./horizontal-stepper-item.component.html",
  styleUrl: "./horizontal-stepper-item.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-horizontal-stepper-item]": "true",
    "[class.tedi-horizontal-stepper-item--selected]": "selected()",
    "[class.tedi-horizontal-stepper-item--completed]":
      "completed() && !error()",
    "[class.tedi-horizontal-stepper-item--error]": "error()",
  },
})
export class HorizontalStepperItemComponent {
  label = input.required<string>();
  description = input<string>();
  completed = input(false, { transform: booleanAttribute });
  error = input(false, { transform: booleanAttribute });
  selected = input(false, { transform: booleanAttribute });

  stepSelect = output();

  /** @internal Set by parent HorizontalStepperComponent */
  _stepNumber = signal(0);
}
