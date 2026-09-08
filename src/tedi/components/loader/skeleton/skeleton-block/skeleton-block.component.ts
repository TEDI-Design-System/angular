import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { BreakpointService } from "../../../../services/breakpoint/breakpoint.service";

export type SkeletonBlockWidth = number | "auto" | `${number}px`;
export type SkeletonBlockTextHeight =
  "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type SkeletonBlockHeight = SkeletonBlockTextHeight | number;

/**
 * Angular hands an attribute binding through as a string, so `width="50"` and
 * `height="100"` arrive as `"50"` / `"100"`. Both are read as the numeric form.
 */
const NUMERIC = /^\d+(\.\d+)?$/;

/**
 * The subset of inputs that can be overridden per breakpoint via the
 * `xs`–`xxl` inputs. Every field is optional; only the ones you set override
 * the base value at that breakpoint.
 */
export type SkeletonBlockInputs = {
  /** Overrides {@link SkeletonBlockComponent.width}. */
  width?: SkeletonBlockWidth;
  /** Overrides {@link SkeletonBlockComponent.height}. */
  height?: SkeletonBlockHeight;
};

@Component({
  standalone: true,
  selector: "tedi-skeleton-block",
  template: "",
  styleUrl: "./skeleton-block.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "classes()",
    "[style.width]": "resolvedWidth()",
    "[style.height]": "resolvedHeight()",
    "aria-hidden": "true",
  },
})
export class SkeletonBlockComponent {
  /**
   * Width of the block. A number is a percentage of the container, a `px`
   * string is an absolute width, and `auto` fills the container.
   * @default auto
   */
  width = input<SkeletonBlockWidth>("auto");
  /**
   * Height of the block. A text style (`p`, `h1`–`h6`) takes the line height of
   * the text the block stands in for and follows it across breakpoints, so the
   * real content drops in without shifting the layout. Pass a number instead
   * for a height in px, for blocks that stand in for something other than text.
   * @default p
   */
  height = input<SkeletonBlockHeight>("p");

  /*
   * Per-breakpoint overrides. The base inputs describe the smallest viewport;
   * each breakpoint input layers a partial `SkeletonBlockInputs` on top from
   * that breakpoint and up, so larger breakpoints inherit from smaller ones
   * until overridden.
   */

  /** Overrides applied from the `xs` breakpoint (≥ 0px) and up. */
  xs = input<SkeletonBlockInputs>();
  /** Overrides applied from the `sm` breakpoint (≥ 576px) and up. */
  sm = input<SkeletonBlockInputs>();
  /** Overrides applied from the `md` breakpoint (≥ 768px) and up. */
  md = input<SkeletonBlockInputs>();
  /** Overrides applied from the `lg` breakpoint (≥ 992px) and up. */
  lg = input<SkeletonBlockInputs>();
  /** Overrides applied from the `xl` breakpoint (≥ 1200px) and up. */
  xl = input<SkeletonBlockInputs>();
  /** Overrides applied from the `xxl` breakpoint (≥ 1400px) and up. */
  xxl = input<SkeletonBlockInputs>();

  private readonly breakpointService = inject(BreakpointService);

  protected currentProps = computed(() =>
    this.breakpointService.getBreakpointInputs<SkeletonBlockInputs>({
      width: this.width(),
      height: this.height(),
      xs: this.xs(),
      sm: this.sm(),
      md: this.md(),
      lg: this.lg(),
      xl: this.xl(),
      xxl: this.xxl(),
    }),
  );

  protected classes = computed(() => {
    const height = this.currentProps().height;
    const classList = ["tedi-skeleton-block"];

    if (typeof height === "string" && !NUMERIC.test(height)) {
      classList.push(`tedi-skeleton-block--${height}`);
    }

    return classList.join(" ");
  });

  protected resolvedWidth = computed(() => {
    const width = this.currentProps().width;

    if (width === undefined || width === "auto") {
      return null;
    }

    return typeof width === "number" || NUMERIC.test(width)
      ? `${width}%`
      : width;
  });

  protected resolvedHeight = computed(() => {
    const height = this.currentProps().height;

    if (typeof height === "number") {
      return `${height}px`;
    }

    return height && NUMERIC.test(height) ? `${height}px` : null;
  });
}
