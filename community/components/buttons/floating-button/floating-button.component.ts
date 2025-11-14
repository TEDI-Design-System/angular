import { Component, computed, input, ViewEncapsulation } from "@angular/core";
import { ButtonComponent } from "tedi/components";

export type FloatingButtonAxis = "horizontal" | "vertical";

@Component({
  selector: "[tedi-floating-button]",
  template: `<ng-content />`,
  styleUrl: "./floating-button.component.scss",
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "floatClasses()",
  },
})
export class FloatingButtonComponent extends ButtonComponent {
  /**
   * Button axis
   * @default horizontal
   */
  axis = input<FloatingButtonAxis>("horizontal");

  floatClasses = computed(() => {
    const classes = ["tedi-floating-button"];
    classes.push(`tedi-floating-button--${this.axis() ?? "horizontal"}`);
    classes.push(`tedi-floating-button--${this.variant() ?? "primary"}`);

    return `${classes.join(" ")} ${this.classes()}`;
  });
}
