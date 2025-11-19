import { Component, input, ViewEncapsulation } from "@angular/core";
import { BaseButtonDirective } from "./base-button.directive";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "neutral"
  | "success"
  | "danger"
  | "danger-neutral"
  | "primary-inverted"
  | "secondary-inverted"
  | "neutral-inverted";

export type ButtonSize = "default" | "small";

@Component({
  selector: "[tedi-button]",
  standalone: true,
  template: "<ng-content />",
  styleUrl: "./button.component.scss",
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [
    {
      directive: BaseButtonDirective,
    },
  ],
})
export class ButtonComponent {
  /**
   * Specifies the color theme of the button. The color should meet accessibility standards for color contrast.
   * @default primary
   */
  variant = input<ButtonVariant>("primary");
  /**
   * Defines the size of the button.
   * @default default
   */
  size = input<ButtonSize>("default");
}
