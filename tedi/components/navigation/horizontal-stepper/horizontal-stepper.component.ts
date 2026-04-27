import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { HorizontalStepperItemComponent } from "./horizontal-stepper-item/horizontal-stepper-item.component";

export type HorizontalStepperBackground = "default" | "transparent";
export type HorizontalStepperBreakpoint = "sm" | "md" | "lg" | "xl";
export type HorizontalStepperCompact = boolean | HorizontalStepperBreakpoint;

@Component({
  selector: "tedi-horizontal-stepper",
  templateUrl: "./horizontal-stepper.component.html",
  styleUrl: "./horizontal-stepper.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-horizontal-stepper]": "true",
    "[class.tedi-horizontal-stepper--transparent]":
      "background() === 'transparent'",
    "[class.tedi-horizontal-stepper--compact]": "compact() === true",
    "[class.tedi-horizontal-stepper--compact-sm]": "compact() === 'sm'",
    "[class.tedi-horizontal-stepper--compact-md]": "compact() === 'md'",
    "[class.tedi-horizontal-stepper--compact-lg]": "compact() === 'lg'",
    "[class.tedi-horizontal-stepper--compact-xl]": "compact() === 'xl'",
    role: "navigation",
    "[attr.aria-label]": "ariaLabel()",
  },
})
export class HorizontalStepperComponent {
  ariaLabel = input<string>();
  background = input<HorizontalStepperBackground>("default");
  /**
   * Collapse labels so only indicators plus the selected step's label are visible.
   * `true` — always collapsed. A breakpoint (`'sm'`, `'md'`, `'lg'`, `'xl'`) — collapsed below that breakpoint. @default 'sm'
   */
  compact = input<HorizontalStepperCompact>("sm");

  items = contentChildren(HorizontalStepperItemComponent);

  private assignStepNumbers = effect(() => {
    this.items().forEach((item, index) => {
      item._stepNumber.set(index + 1);
    });
  });
}
