import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../base/icon/icon.component";
import { TediTranslationService } from "../../../services/translation/translation.service";

export type ClosingButtonSize = "default" | "small";
export type ClosingButtonIconSize = 18 | 24;
@Component({
  selector: "button[tedi-closing-button]",
  imports: [IconComponent],
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./closing-button.component.html",
  styleUrl: "./closing-button.component.scss",
  host: {
    "[attr.title]": "showTitle() ? ariaLabel() || _defaultLabel() : null",
    "[attr.aria-label]": "ariaLabel() || _defaultLabel()",
    "[class.tedi-closing-button]": "true",
    "[class.tedi-closing-button--small]": "size() === 'small'",
  },
})
export class ClosingButtonComponent {
  /**
   * Overall button size.
   * - `default` - The default size, typically larger.
   * - `small` - A smaller version of the button, often used in compact layouts.
   * @default default
   */
  size = input<ClosingButtonSize>("default");
  /**
   * The size of the icon inside the button in pixels.
   * - `24` - A standard icon size, commonly used in most interfaces.
   * - `18` - A smaller icon size, suitable for compact designs.
   * @default 24
   */
  iconSize = input<ClosingButtonIconSize>(24);
  /**
   * Material Symbols icon rendered inside the button. Override for other
   * closing-like actions such as delete/remove (e.g. `delete`). When
   * overriding, also provide a matching `ariaLabel` — the default label
   * is "close".
   * @default close
   */
  icon = input("close");

  /**
   * ARIA label to override default label "close"
   */
  readonly ariaLabel = input<string | undefined>();
  /**
   * Render the label as a native `title` attribute (browser tooltip on
   * hover). Set to `false` when the button is wrapped in a `tedi-tooltip`
   * so the native tooltip does not double the custom one. The `aria-label`
   * is kept either way.
   * @default true
   */
  showTitle = input(true, { transform: booleanAttribute });

  private translationService = inject(TediTranslationService);
  private readonly _defaultLabel = this.translationService.track("close");
}
