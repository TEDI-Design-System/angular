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
} from "../../../services/breakpoint/breakpoint.service";
import {
  CardBackground,
  CardBorderRadius,
  CardBorderType,
  CardPadding,
  getCardBorderPlacementColor,
  resolveCardBorderRadius,
} from "./card.utils";

export type CardInputs = {
  background?: CardBackground;
  padding?: CardPadding;
  borderRadius?: CardBorderRadius;
  borderless?: boolean;
  border?: CardBorderType;
};

/**
 * Card is a container for grouping related content. Compose it from
 * `tedi-card-header`, `tedi-card-content` and `tedi-card-notification` blocks.
 * `background` and `padding` set here act as defaults for all child blocks.
 */
@Component({
  selector: "tedi-card",
  standalone: true,
  templateUrl: "./card.component.html",
  styleUrl: "./card.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "classes()",
  },
})
export class CardComponent implements BreakpointInputs<CardInputs> {
  /**
   * Default background color for child content blocks.
   */
  background = input<CardBackground>();
  /**
   * Default padding for child content blocks.
   * Value is either a predefined number in rems or an object of
   * vertical/horizontal or top/right/bottom/left number values in rems.
   */
  padding = input<CardPadding>();
  /**
   * Controls card border radius.
   * Accepts `false` to remove all radius or an object to control
   * sides or individual corners. Corner values take precedence over sides.
   */
  borderRadius = input<CardBorderRadius>();
  /**
   * Removes border from card.
   * @default false
   */
  borderless = input<boolean | undefined>(false);
  /**
   * Type of border. Plain background value colors the whole border,
   * `top-` or `left-` prefixed value draws a thick accent border on that side.
   */
  border = input<CardBorderType>();

  xs = input<CardInputs>();
  sm = input<CardInputs>();
  md = input<CardInputs>();
  lg = input<CardInputs>();
  xl = input<CardInputs>();
  xxl = input<CardInputs>();

  private breakpointService = inject(BreakpointService);

  breakpointInputs = computed(() => {
    return this.breakpointService.getBreakpointInputs<CardInputs>({
      background: this.background(),
      padding: this.padding(),
      borderRadius: this.borderRadius(),
      borderless: this.borderless(),
      border: this.border(),

      xs: this.xs(),
      sm: this.sm(),
      md: this.md(),
      lg: this.lg(),
      xl: this.xl(),
      xxl: this.xxl(),
    });
  });

  classes = computed(() => {
    const { border, borderless, borderRadius } = this.breakpointInputs();
    const classList = ["tedi-card"];

    const [placement, color] = getCardBorderPlacementColor(border);

    if (placement) {
      classList.push(`tedi-card--border-${placement}`);
    }

    if (color) {
      classList.push(`tedi-card--border--${color}`);
    }

    if (borderless) {
      classList.push("tedi-card--borderless");
    }

    const corners = resolveCardBorderRadius(borderRadius);

    if (!corners.topLeft) {
      classList.push("tedi-card--no-radius-tl");
    }

    if (!corners.topRight) {
      classList.push("tedi-card--no-radius-tr");
    }

    if (!corners.bottomRight) {
      classList.push("tedi-card--no-radius-br");
    }

    if (!corners.bottomLeft) {
      classList.push("tedi-card--no-radius-bl");
    }

    return classList.join(" ");
  });
}
