import { Component, computed, input, ViewEncapsulation } from "@angular/core";
import { ButtonComponent, ButtonVariant } from "tedi/components";

export type FloatingButtonAxis = "horizontal" | "vertical";
export type FloatingButtonColor = "primary" | "secondary";
export type FloatingButtonSize = "small" | "medium" | "large";
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
  selector: "tedi-floating-button",
  template: `<button tedi-button [id]="id()" [className]="classes()">
    <ng-content />
  </button>`,
  imports: [ButtonComponent],
  encapsulation: ViewEncapsulation.None,
})
export class FloatingButtonComponent {
  id = input<string>();
  /**
   * Specifies the color theme of the button. The color should meet accessibility standards for color contrast.
   * @default primary
   */
  variant = input<ButtonVariant>("primary");
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

  classes = computed(() => {
    const classes = ["tedi-floating-button"];
    if (this.axis()) {
      classes.push(`tedi-floating-button--${this.axis()}`);
    }
    if (this.visualType()) {
      classes.push(`tedi-floating-button--${this.visualType()}`);
    }
    classes.push(`tedi-floating-button--${this.size() ?? "medium"}`);
    return classes.join(" ");
  });
}
