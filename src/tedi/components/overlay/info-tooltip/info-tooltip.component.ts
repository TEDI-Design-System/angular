import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";
import {
  TooltipComponent,
  TooltipOpenWith,
  TooltipPosition,
} from "../tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../tooltip/tooltip-trigger/tooltip-trigger.component";
import {
  TooltipContentComponent,
  TooltipWidth,
} from "../tooltip/tooltip-content/tooltip-content.component";
import { InfoButtonComponent } from "../../buttons/info-button/info-button.component";

@Component({
  selector: "tedi-info-tooltip",
  templateUrl: "./info-tooltip.component.html",
  styleUrl: "./info-tooltip.component.scss",
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TooltipComponent,
    TooltipTriggerComponent,
    TooltipContentComponent,
    InfoButtonComponent,
  ],
  host: {
    class: "tedi-info-tooltip",
  },
})
export class InfoTooltipComponent {
  /**
   * Position of the tooltip relative to the info button.
   * @default top
   */
  position = input<TooltipPosition>("top");
  /**
   * How the tooltip can be opened.
   * @default both
   */
  openWith = input<TooltipOpenWith>("both");
  /**
   * Max width of the tooltip content.
   * @default medium
   */
  maxWidth = input<TooltipWidth>("medium");
  /**
   * Color variant of the info button. Use `inverted` on dark or colored backgrounds.
   * @default primary
   */
  color = input<"primary" | "inverted">("primary");
  /**
   * Accessible name for the info button. Defaults to the translated info-button label.
   */
  ariaLabel = input<string>();
}
