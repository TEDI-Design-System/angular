import { Component, computed, input, ViewEncapsulation } from "@angular/core";
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
  | "neutral-inverted"
  | "primary-button-group"
  | "secondary-button-group";

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
  host: {
    "[class]": "classes()",
  },
})
export class ButtonComponent {
  /**
   * Specifies the color theme of the button. The color should meet accessibility standards for color contrast.
   *
   * `primary-button-group` and `secondary-button-group` are intended for items inside
   * `tedi-button-group`: they use the small (`button-radius-sm`) corner radius and show
   * their selected state via `aria-pressed`.
   * @default primary
   */
  variant = input<ButtonVariant>("primary");
  /**
   * Defines the size of the button.
   * @default default
   */
  size = input<ButtonSize>("default");

  classes = computed(() => {
    const classList = [
      "tedi-button",
      `tedi-button--${this.variant()}`,
      `tedi-button--${this.size()}`,
    ];
    return classList.join(" ");
  });
}
