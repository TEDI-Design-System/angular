import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { RadioCardGroupComponent } from "../radio-card-group/radio-card-group.component";

export type RadioCardVariant = "primary" | "secondary";

@Component({
  standalone: true,
  selector: "label[tedi-radio-card]",
  templateUrl: "./radio-card.component.html",
  styleUrl: "./radio-card.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-radio-card",
    "[class.tedi-radio-card--primary]": "variant() === 'primary'",
    "[class.tedi-radio-card--secondary]": "variant() === 'secondary'",
    "[class.tedi-radio-card--grouped]": "isGrouped()",
    "[class.tedi-radio-card--hide-indicator]": "!showIndicator()",
  },
})
export class RadioCardComponent {
  /**
   * Visual variant of the card.
   * @default primary
   */
  readonly variant = input<RadioCardVariant>("primary");
  /**
   * Whether the card is part of a button-group style layout. Prefer setting
   * `grouped` on the enclosing `tedi-radio-card-group` instead; this input
   * is retained for standalone cards outside a group.
   * @default false
   */
  readonly grouped = input(false);

  /**
   * Whether to show the radio indicator.
   * When false, the radio is visually hidden but remains functional.
   * @default true
   */
  readonly showIndicator = input<boolean>(true);

  private readonly cardGroup = inject(RadioCardGroupComponent, {
    optional: true,
  });

  readonly isGrouped = computed(
    () => this.grouped() || (this.cardGroup?.grouped() ?? false),
  );
}
