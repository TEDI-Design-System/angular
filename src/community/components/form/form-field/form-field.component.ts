import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
} from "@angular/core";
import { warnDeprecated } from "@tedi-design-system/angular/tedi";

/**
 * @deprecated Use FormField from TEDI-ready instead. This component will be removed from future versions.
 */

@Component({
  selector: "tedi-form-field",
  standalone: true,
  template: "<ng-content />",
  styleUrl: "./form-field.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-form-field]": "true",
  },
})
export class FormFieldComponent {
  constructor() {
    warnDeprecated(
      "Community tedi-form-field",
      "Use FormField from TEDI-ready instead.",
    );
  }
}
