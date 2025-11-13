import { computed, Directive, input } from "@angular/core";

export type FloatingButtonAxis = "horizontal" | "vertical";
export type FloatingButtonColor = "primary" | "secondary";
export type FloatingButtonSize = "medium" | "large";
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

@Directive({
  selector: "[tedi-floating-button]",
  host: {
    "[class]": "classes()",
    "[style]": "positioning()",
  },
})
export class FloatingButtonDirective {
  /**
   * Button axis
   * @default horizontal
   */
  axis = input<FloatingButtonAxis>("horizontal");
  /**
   * Button visual type
   * @default primary
   */
  visualType = input<FloatingButtonColor>("primary");
  /**
   * Button size
   * @default medium
   */
  size = input<FloatingButtonSize>("medium");
  /**
   * Button positionwu
   * @default fixed
   */
  position = input<string>("fixed");
  /**
   * Button placement
   * @default { vertical: 'bottom', horizontal: 'right' }
   */
  placement = input<FloatingButtonPlacement>({
    vertical: "bottom",
    horizontal: "right",
  });
  /**
   * Button offset
   * @default { bottom: '1.5rem', right: '1.5rem' }
   */
  offset = input<FloatingButtonOffset>({
    bottom: "1.5rem",
    right: "1.5rem",
  });

  classes = computed(() => {
    const classes = ["tedi-floating-button"];
    if (this.axis()) {
      classes.push(`tedi-floating-button--${this.axis()}`);
    }
    if (this.visualType()) {
      classes.push(`tedi-floating-button--${this.visualType()}`);
    }
    if (this.size) {
      classes.push(`tedi-floating-button--${this.size()}`);
    }
    return classes.join(" ");
  });

  positioning = computed(() => {
    const styles: { [key: string]: string } = {};
    const placement = this.placement();
    const offset = this.offset();
    if (!placement || !offset) {
      return "";
    }
    if (placement.vertical === "top") {
      styles["top"] = offset.top ? offset.top.toString() : "1.5rem";
    }
    if (placement.vertical === "bottom") {
      styles["bottom"] = offset.bottom ? offset.bottom.toString() : "1.5rem";
    }
    if (placement.vertical === "center") {
      styles["top"] = "50%";
      styles["transform"] = "translateY(-50%)";
    }
    if (placement.horizontal === "left") {
      styles["left"] = offset.left ? offset.left.toString() : "0";
    }
    if (placement.horizontal === "right") {
      styles["right"] = offset.right ? offset.right.toString() : "0";
    }
    if (placement.horizontal === "center") {
      styles["left"] = "50%";
      styles["transform"] = styles["transform"]
        ? styles["transform"] + " translateX(-50%)"
        : "translateX(-50%)";
    }
    console.log(styles, JSON.stringify(styles));

    return JSON.stringify(styles);
  });
}
