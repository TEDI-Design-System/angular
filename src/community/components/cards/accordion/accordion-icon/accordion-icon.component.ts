import {
  ChangeDetectionStrategy,
  computed,
  input,
  Component,
  ViewEncapsulation,
} from "@angular/core";
import { CardColors } from "../../card/card-colors.directive";

@Component({
  standalone: true,
  selector: "tedi-accordion-icon",
  templateUrl: "./accordion-icon.component.html",
  styleUrl: "./accordion-icon.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-accordion-icon]": "true",
    "[class]": "_backgroundClass()",
  },
})
export class AccordionIconComponent {
  /**
   * Background colour of the icon column.
   */
  background = input<CardColors>();

  _backgroundClass = computed(() => {
    const background = this.background();

    return background ? `tedi-accordion-icon--background--${background}` : "";
  });
}
