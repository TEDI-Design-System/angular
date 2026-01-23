import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";

@Component({
  selector: "tedi-vertical-stepper",
  imports: [],
  templateUrl: "./vertical-stepper.html",
  styleUrl: "./vertical-stepper.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class.tedi-vertical-stepper]": "true",
    "[class.tedi-vertical-stepper--compact]": "compact()",
  },
})
export class VerticalStepperComponent {
  ariaLabel = input<string>();
  compact = input(false, { transform: booleanAttribute });
  enumerated = input(false, { transform: booleanAttribute });
}
