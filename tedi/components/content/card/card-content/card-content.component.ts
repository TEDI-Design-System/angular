import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import {
  BreakpointInputs,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import { CardComponent } from "../card.component";
import {
  CardBackground,
  CardPadding,
  getPaddingCssVariables,
} from "../card.utils";

export type CardContentInputs = {
  background?: CardBackground;
  padding?: CardPadding;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  autoWidth?: boolean;
};

/**
 * Content block of a card. Inherits unset `background` and `padding`
 * from the parent `tedi-card`.
 */
@Component({
  selector: "tedi-card-content",
  standalone: true,
  templateUrl: "./card-content.component.html",
  styleUrl: "./card-content.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "classes()",
    "[style]": "styles()",
  },
})
export class CardContentComponent
  implements BreakpointInputs<CardContentInputs>
{
  /**
   * Background color.
   * @default primary
   */
  background = input<CardBackground>();
  /**
   * Content padding.
   * Value is either a predefined number in rems or an object of
   * vertical/horizontal or top/right/bottom/left number values in rems.
   * @default 1
   */
  padding = input<CardPadding>();
  /**
   * Background image url.
   */
  backgroundImage = input<string>();
  /**
   * Background position for the image.
   */
  backgroundPosition = input<string>();
  /**
   * Background size for the image.
   */
  backgroundSize = input<string>();
  /**
   * Background repeat for the image.
   */
  backgroundRepeat = input<string>();
  /**
   * Takes only as much width as its content needs instead of growing.
   * Useful for icon or date cells inside `tedi-card-row`.
   * @default false
   */
  autoWidth = input<boolean | undefined>(false);

  xs = input<CardContentInputs>();
  sm = input<CardContentInputs>();
  md = input<CardContentInputs>();
  lg = input<CardContentInputs>();
  xl = input<CardContentInputs>();
  xxl = input<CardContentInputs>();

  protected blockClass = "tedi-card-content";
  protected defaultBackground: CardBackground = "primary";

  private breakpointService = inject(BreakpointService);
  private card = inject(CardComponent, { optional: true });

  breakpointInputs = computed(() => {
    return this.breakpointService.getBreakpointInputs<CardContentInputs>({
      background: this.background(),
      padding: this.padding(),
      backgroundImage: this.backgroundImage(),
      backgroundPosition: this.backgroundPosition(),
      backgroundSize: this.backgroundSize(),
      backgroundRepeat: this.backgroundRepeat(),
      autoWidth: this.autoWidth(),

      xs: this.xs(),
      sm: this.sm(),
      md: this.md(),
      lg: this.lg(),
      xl: this.xl(),
      xxl: this.xxl(),
    });
  });

  classes = computed(() => {
    const { background, autoWidth } = this.breakpointInputs();
    const resolvedBackground =
      background ?? this.inheritedBackground() ?? this.defaultBackground;
    const classList = [
      this.blockClass,
      `${this.blockClass}--background--${resolvedBackground}`,
    ];

    if (autoWidth) {
      classList.push(`${this.blockClass}--auto-width`);
    }

    return classList.join(" ");
  });

  styles = computed(() => {
    const { padding, backgroundImage, backgroundPosition, backgroundSize, backgroundRepeat } =
      this.breakpointInputs();
    const resolvedPadding =
      padding ?? this.card?.breakpointInputs().padding ?? this.defaultPadding();
    const styles: Record<string, string> = getPaddingCssVariables(resolvedPadding);

    if (backgroundImage) {
      styles["background-image"] = `url(${backgroundImage})`;
    }

    if (backgroundPosition) {
      styles["background-position"] = backgroundPosition;
    }

    if (backgroundSize) {
      styles["background-size"] = backgroundSize;
    }

    if (backgroundRepeat) {
      styles["background-repeat"] = backgroundRepeat;
    }

    return styles;
  });

  protected inheritedBackground(): CardBackground | undefined {
    return this.card?.breakpointInputs().background;
  }

  protected defaultPadding(): CardPadding {
    return 1;
  }
}
