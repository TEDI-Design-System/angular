import {
  ChangeDetectionStrategy,
  Component,
  input,
  model,
  ViewEncapsulation,
} from "@angular/core";
import { ButtonGroupComponent } from "../../../buttons/button-group/button-group.component";
import { ButtonGroupButtonDirective } from "../../../buttons/button-group/button-group-button/button-group-button.directive";
import { TediTranslationPipe } from "../../../../services/translation/translation.pipe";
import { RangeEnd } from "../date-time-field.util";

/**
 * Internal to `tedi-date-time-field`: the range-mode summary of both ends plus
 * the start/end tabs for the time picker panel below it. The parent renders
 * that panel as `role="tabpanel"` with `id` set to `panelId`.
 */
@Component({
  selector: "tedi-date-time-field-range-switch",
  standalone: true,
  templateUrl: "./date-time-field-range-switch.component.html",
  styleUrl: "./date-time-field-range-switch.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    ButtonGroupComponent,
    ButtonGroupButtonDirective,
    TediTranslationPipe,
  ],
  host: { class: "tedi-date-time-field-range-switch" },
})
export class DateTimeFieldRangeSwitchComponent {
  /** Formatted start date, empty when unset. */
  readonly fromDate = input<string>("");
  readonly fromTime = input<string>("");
  /** Formatted end date, empty when unset. */
  readonly toDate = input<string>("");
  readonly toTime = input<string>("");
  readonly panelId = input.required<string>();
  readonly active = model<RangeEnd>("from");

  readonly ends: RangeEnd[] = ["from", "to"];

  tabId(end: RangeEnd): string {
    return `${this.panelId()}-${end}-tab`;
  }

  handleValueChange(value: string | string[] | undefined): void {
    if (value === "from" || value === "to") this.active.set(value);
  }
}
