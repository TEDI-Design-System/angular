import { ChangeDetectionStrategy, Component, inject, input, ViewEncapsulation } from "@angular/core";
import { IconComponent } from "../../base/icon/icon.component";
import { TediTranslationService } from "../../../services";

@Component({
  standalone: true,
  selector: "button[tedi-info-button]",
  imports: [IconComponent],
  template: `<tedi-icon name="info" [size]="18" />`,
  styleUrl: "./info-button.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "type": "button",
    "class": "tedi-info-button",
    "[class.tedi-info-button--inverted]": "color() === 'inverted'",
    "[attr.aria-label]": "ariaLabel() || _defaultLabel()"
  }
})
export class InfoButtonComponent {
  readonly translationService = inject(TediTranslationService);

  /**
   * InfoButton ARIA label
   */
  readonly ariaLabel = input<string>(undefined, { alias: 'aria-label' });

  /**
   * Color variant. Use `inverted` on dark or colored backgrounds.
   * @default primary
   */
  readonly color = input<'primary' | 'inverted'>('primary');

  private readonly _defaultLabel = this.translationService.track('info-button.label');
}
