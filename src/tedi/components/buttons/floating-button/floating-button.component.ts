import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { BaseButtonDirective } from "../button/base-button.directive";

export type FloatingButtonVariant = "primary" | "secondary";
export type FloatingButtonSize = "default" | "large";
export type FloatingButtonAxis = "horizontal" | "vertical";
export type FloatingButtonPosition =
  "fixed" | "absolute" | "sticky" | "relative" | "static";

export type FloatingButtonPlacement = {
  vertical: "top" | "bottom" | "center";
  horizontal: "left" | "right" | "center";
};

export type FloatingButtonOffset = {
  top?: number | string;
  bottom?: number | string;
  left?: number | string;
  right?: number | string;
};

const edgeStyle = (
  isPinned: boolean,
  offset: number | string = 0,
): string | null => {
  if (!isPinned) {
    return null;
  }

  return typeof offset === "number" ? `${offset}px` : offset;
};

@Component({
  selector: "[tedi-floating-button]",
  standalone: true,
  template: "<ng-content />",
  styleUrl: "./floating-button.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [BaseButtonDirective],
  host: {
    "[class]": "classes()",
    "[style.position]": "position()",
    "[style.z-index]": "zIndex()",
    "[style.top]": "placementStyles().top",
    "[style.bottom]": "placementStyles().bottom",
    "[style.left]": "placementStyles().left",
    "[style.right]": "placementStyles().right",
    "[style.translate]": "placementStyles().translate",
  },
})
export class FloatingButtonComponent implements OnInit {
  private readonly baseButton = inject(BaseButtonDirective);

  /**
   * The button's color variant.
   * @default primary
   */
  readonly variant = input<FloatingButtonVariant>("primary");
  /**
   * For a single-line horizontal button, `default` is 40px tall on desktop and
   * 44px on mobile; `large` is 48px.
   * @default default
   */
  readonly size = input<FloatingButtonSize>("default");
  /**
   * `vertical` rotates the button 90° counter-clockwise, with rounded left
   * corners and square right corners.
   *
   * Rotation does not change the layout box. To align the visible button with
   * an edge, center it in a container that reserves its rotated width and height,
   * then position the container at that edge. See the Placement story.
   * @default horizontal
   */
  readonly axis = input<FloatingButtonAxis>("horizontal");
  /**
   * CSS positioning mode. Defaults to `fixed`; use `static` to keep the button
   * in normal document flow.
   * @default fixed
   */
  readonly position = input<FloatingButtonPosition>("fixed");
  /**
   * Where to pin the button within its containing block. Applied as `top` / `bottom` /
   * `left` / `right`; `center` pins the midpoint on that axis. Has no effect when
   * `position` is `static`.
   */
  readonly placement = input<FloatingButtonPlacement>();
  /**
   * Distance from the pinned edges, defaulting to `0`. Numbers are treated as pixels,
   * strings accept CSS lengths such as `1rem`. Only the edges named by `placement` apply.
   */
  readonly offset = input<FloatingButtonOffset>();
  /**
   * Overrides the button's CSS `z-index`. Defaults to `--z-index-feedback` when omitted.
   */
  readonly zIndex = input<number>();

  // Keep CSS classes distinct while the Community FloatingButton is still available.
  readonly classes = computed(() =>
    [
      "tedi-ready-floating-button",
      `tedi-ready-floating-button--${this.variant()}`,
      `tedi-ready-floating-button--${this.size()}`,
      `tedi-ready-floating-button--${this.axis()}`,
    ].join(" "),
  );

  /**
   * Uses the separate `translate` property for centering, while the vertical
   * orientation is handled by `rotate`.
   */
  protected readonly placementStyles = computed(() => {
    const placement =
      this.position() === "static" ? undefined : this.placement();
    const { vertical, horizontal } = placement ?? {};
    const offset = this.offset();
    const centered = horizontal === "center" || vertical === "center";

    return {
      top:
        vertical === "center"
          ? "50%"
          : edgeStyle(vertical === "top", offset?.top),
      bottom: edgeStyle(vertical === "bottom", offset?.bottom),
      left:
        horizontal === "center"
          ? "50%"
          : edgeStyle(horizontal === "left", offset?.left),
      right: edgeStyle(horizontal === "right", offset?.right),
      translate: centered
        ? `${horizontal === "center" ? "-50%" : "0"} ${vertical === "center" ? "-50%" : "0"}`
        : null,
    };
  });

  ngOnInit(): void {
    this.baseButton.classNamePrefix.set("tedi-ready-floating-button");
  }
}
