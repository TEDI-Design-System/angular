import { Component, computed, input, ViewEncapsulation } from "@angular/core";
import { ButtonComponent, ButtonVariant } from "tedi/components";

export type FloatingButtonAxis = "horizontal" | "vertical";
export type FloatingButtonSize = "small" | "medium" | "large";

@Component({
  selector: "tedi-floating-button",
  template: `<button tedi-button [id]="id()" [className]="classes()">
    <ng-content />
  </button>`,
  styleUrl: "./floating-button.component.scss",
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
   * Button size
   * @default medium
   */
  size = input<FloatingButtonSize>("medium");

  classes = computed(() => {
    const classes = ["tedi-floating-button"];
    classes.push(`tedi-floating-button--${this.axis() ?? "horizontal"}`);
    classes.push(`tedi-floating-button--${this.size() ?? "medium"}`);
    classes.push(`tedi-floating-button--${this.variant() ?? "primary"}`);
    return classes.join(" ");
  });
}
