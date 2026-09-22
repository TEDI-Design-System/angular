import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";

/**
 * @deprecated Use the TEDI-Ready `tedi-vertical-stepper` from
 * `@tedi-design-system/angular/tedi` instead. This community component
 * will be removed in a future release.
 */
@Component({
  selector: "tedi-vertical-stepper",
  imports: [],
  templateUrl: "./vertical-stepper.component.html",
  styleUrl: "./vertical-stepper.component.scss",
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
