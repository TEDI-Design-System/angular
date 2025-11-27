import {
  Component,
  input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  viewChild,
  contentChild,
  signal,
  AfterContentChecked,
} from "@angular/core";
import {
  NgxFloatUiContentComponent,
  NgxFloatUiModule,
  NgxFloatUiPlacements,
} from "ngx-float-ui";
import { TooltipTriggerComponent } from "./tooltip-trigger/tooltip-trigger.component";

export type TooltipPosition = `${NgxFloatUiPlacements}`;
export type TooltipOpenWith = "hover" | "click" | "both";

@Component({
  standalone: true,
  selector: "tedi-tooltip",
  imports: [NgxFloatUiModule],
  templateUrl: "./tooltip.component.html",
  styleUrl: "./tooltip.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipComponent implements AfterContentChecked {
  /**
   * The position of the tooltip relative to the trigger element.
   * @default top
   */
  readonly position = input<TooltipPosition>("top");

  /**
   * Should position to opposite direction when overflowing screen?
   * @default true
   */
  readonly preventOverflow = input(true);

  /**
   * How tooltip can opened?
   * @default both
   */
  readonly openWith = input<TooltipOpenWith>("both");

  /**
   * Append floating element to given selector.
   * Use 'body' to append at the end of DOM or empty string to append next to trigger element.
   * @default body
   */
  readonly appendTo = input("body");

  /** Delay time (in ms) for closing tooltip when not hovering trigger or content.
   * @default 100
   */
  readonly timeoutDelay = input(100);

  /** Dropdown trigger button */
  readonly tooltipTrigger = contentChild.required(TooltipTriggerComponent);

  readonly containerId = signal("");

  isContentHovered = signal(false);
  floatUiDisplay = signal<"inline" | "block">("inline");
  floatUiComponent = viewChild.required(NgxFloatUiContentComponent);
  hideTimeout?: ReturnType<typeof setTimeout>;

  showTooltip() {
    if (!this.floatUiComponent().state) {
      clearTimeout(this.hideTimeout);
      this.floatUiComponent().show();
      this.floatUiDisplay.set("block");
    }
  }

  hideTooltip() {
    if (this.floatUiComponent().state) {
      this.floatUiComponent().hide();
      this.floatUiDisplay.set("inline");
    }
  }

  toggleTooltip() {
    if (this.floatUiComponent().state) {
      this.hideTooltip();
    } else {
      this.showTooltip();
    }
  }

  ngAfterContentChecked(): void {
    const floatUiEl = this.floatUiComponent().elRef
      .nativeElement as HTMLElement;
    const container = floatUiEl.querySelector<HTMLElement>(
      ".float-ui-container",
    );

    if (container) {
      container.setAttribute("aria-labelledby", container.id + "_trigger");
      this.containerId.set(container.id);
    }
  }
}
