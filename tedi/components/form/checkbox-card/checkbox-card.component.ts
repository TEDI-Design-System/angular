import {
  ChangeDetectionStrategy,
  Component,
  input,
  ViewEncapsulation,
} from "@angular/core";

export type CheckboxCardVariant = "primary" | "secondary";

@Component({
  standalone: true,
  selector: "label[tedi-checkbox-card]",
  templateUrl: "./checkbox-card.component.html",
  styleUrl: "./checkbox-card.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-checkbox-card",
    "[class.tedi-checkbox-card--primary]": "variant() === 'primary'",
    "[class.tedi-checkbox-card--secondary]": "variant() === 'secondary'",
  },
})
export class CheckboxCardComponent {
  /**
   * Visual variant of the card.
   * @default primary
   */
  readonly variant = input<CheckboxCardVariant>("primary");
}
