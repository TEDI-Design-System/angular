import {
  AfterContentChecked,
  Component,
  input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  viewChild,
  contentChild,
  signal,
  ElementRef,
} from "@angular/core";
import {
  NgxFloatUiContentComponent,
  NgxFloatUiModule,
  NgxFloatUiPlacements,
} from "ngx-float-ui";
import { TooltipTriggerComponent } from "./tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "./tooltip-content/tooltip-content.component";

export type TooltipPosition = `${NgxFloatUiPlacements}`;
export type TooltipOpenWith = "hover" | "click" | "both";

let tooltipIdCounter = 0;

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

  /** Tooltip content component */
  readonly tooltipContent = contentChild.required(TooltipContentComponent, {
    read: ElementRef,
  });

  readonly descriptionId = `tedi-tooltip-${++tooltipIdCounter}`;
  readonly contentText = signal("");
  readonly isOpen = signal(false);

  isContentHovered = signal(false);
  floatUiDisplay = signal<"inline" | "block">("inline");
  floatUiComponent = viewChild.required(NgxFloatUiContentComponent);
  hideTimeout?: ReturnType<typeof setTimeout>;

  showTooltip() {
    if (!this.floatUiComponent().state) {
      clearTimeout(this.hideTimeout);
      this.floatUiComponent().show();
      this.floatUiDisplay.set("block");
      this.isOpen.set(true);
    }
  }

  hideTooltip() {
    if (this.floatUiComponent().state) {
      this.floatUiComponent().hide();
      this.floatUiDisplay.set("inline");
      this.isOpen.set(false);
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
    const contentEl = this.tooltipContent()?.nativeElement as HTMLElement;
    if (contentEl) {
      const text = contentEl.textContent?.trim() ?? "";
      if (text !== this.contentText()) {
        this.contentText.set(text);
      }
    }
  }
}
