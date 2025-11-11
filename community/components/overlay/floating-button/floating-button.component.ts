import { Component, computed, input } from "@angular/core";

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

@Component({
  selector: "[tedi-floating-button]",
  template: "<ng-content />",
  styleUrl: "./floating-button.component.scss",
  host: {
    "[class]": "classes()",
  },
})
export class FloatingButtonComponent {
  /**
   * Button axis
   * @default horizontal
   */
  axis = input<FloatingButtonAxis>("horizontal");
  /**
   * Button visual type
   * @default primary
   */
  visualType = input<FloatingButtonColor>();
  /**
   * Button size
   * @default medium
   */
  size?: FloatingButtonSize;
  /**
   * Button position
   * @default fixed
   */
  position = input<string>("fixed");
  /**
   * Button placement
   */
  placement?: FloatingButtonPlacement;
  /**
   * Button offset
   */
  offset?: FloatingButtonOffset;

  classes = computed(() => {
    const classes = ["tedi-floating-button"];
    if (this.axis()) {
      classes.push(`tedi-floating-button--axis--${this.axis()}`);
    }
    if (this.visualType()) {
      classes.push(`tedi-floating-button--visual-type--${this.visualType()}`);
    }
    if (this.size) {
      classes.push(`tedi-floating-button--size--${this.size}`);
    }
    return classes.join(" ");
  });
}
