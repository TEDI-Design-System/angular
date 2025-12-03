import {
  Component,
  computed,
  input,
  ViewEncapsulation,
  OnInit,
  inject,
} from "@angular/core";
import { BaseButtonDirective } from "@tedi-design-system/angular/tedi";

export type FloatingButtonVariant = "primary" | "secondary";

export type FloatingButtonSize = "default" | "large";
export type FloatingButtonAxis = "horizontal" | "vertical";

@Component({
  selector: "[tedi-floating-button]",
  template: `<ng-content />`,
  styleUrl: "./floating-button.component.scss",
  encapsulation: ViewEncapsulation.None,
  hostDirectives: [
    {
      directive: BaseButtonDirective,
    },
  ],
  host: {
    "[class]": "floatClasses()",
  },
})
export class FloatingButtonComponent implements OnInit {
  /**
   * Specifies the color theme of the button. The color should meet accessibility standards for color contrast.
   * @default primary
   */
  variant = input<FloatingButtonVariant>("primary");
  /**
   * Defines the size of the button.
   * @default default
   */
  size = input<FloatingButtonSize>("default");
  /**
   * Button axis
   * @default horizontal
   */
  axis = input<FloatingButtonAxis>("horizontal");

  buttonDirective = inject(BaseButtonDirective);

  ngOnInit() {
    this.buttonDirective.classNamePrefix.set("tedi-floating-button");
  }

  floatClasses = computed(() => {
    const classes = [
      "tedi-floating-button",
      `tedi-floating-button--${this.variant() ?? "primary"}`,
      `tedi-floating-button--${this.size() ?? "default"}`,
      `tedi-floating-button--${this.axis() ?? "horizontal"}`,
    ];
    return classes.join(" ");
  });
}
