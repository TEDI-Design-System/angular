import {
  AfterContentChecked,
  Component,
  computed,
  contentChild,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from "@angular/core";
import {
  OverlayModule,
  CdkConnectedOverlay,
  ConnectedOverlayPositionChange,
} from "@angular/cdk/overlay";
import {
  OverlayPosition,
  OverlaySide,
  toConnectedPositions,
  getPlacementFromPositionChange,
  calculateArrowOffset,
  HorizontalPushHandler,
} from "../overlay-position.util";
import { TooltipTriggerComponent } from "./tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "./tooltip-content/tooltip-content.component";

export type TooltipPosition = OverlayPosition;
export type TooltipOpenWith = "hover" | "click" | "both";

let tooltipIdCounter = 0;

@Component({
  standalone: true,
  selector: "tedi-tooltip",
  imports: [OverlayModule],
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

  private readonly connectedOverlay = viewChild(CdkConnectedOverlay);

  readonly descriptionId = `tedi-tooltip-${++tooltipIdCounter}`;
  readonly contentText = signal("");
  readonly isOpen = signal(false);
  readonly currentPlacement = signal<OverlaySide>("top");
  readonly arrowLeft = signal<number | null>(null);
  readonly arrowTop = signal<number | null>(null);

  readonly overlayPositions = computed(() =>
    toConnectedPositions(this.position(), this.preventOverflow(), 4),
  );

  readonly overlayOrigin = computed(
    () => this.tooltipTrigger().overlayOrigin,
  );

  readonly isContentHovered = signal(false);
  hideTimeout?: ReturnType<typeof setTimeout>;

  private readonly horizontalPush = new HorizontalPushHandler(
    () => this.connectedOverlay()?.overlayRef?.overlayElement,
    () => this.updateArrowPosition(),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.hideTimeout);
      this.horizontalPush.detach();
    });
  }

  showTooltip() {
    clearTimeout(this.hideTimeout);
    if (!this.isOpen()) {
      this.isOpen.set(true);
    }
  }

  hideTooltip() {
    if (this.isOpen()) {
      clearTimeout(this.hideTimeout);
      this.isOpen.set(false);
      this.horizontalPush.detach();
    }
  }

  toggleTooltip() {
    if (this.isOpen()) {
      this.hideTooltip();
    } else {
      this.showTooltip();
    }
  }

  onPositionChange(change: ConnectedOverlayPositionChange) {
    this.currentPlacement.set(getPlacementFromPositionChange(change));
    this.horizontalPush.apply();
    this.updateArrowPosition();
  }

  onOverlayAttach() {
    this.syncContentText();
    this.horizontalPush.attach();
    this.updateArrowPosition();
  }

  private updateArrowPosition() {
    const overlayEl = this.connectedOverlay()?.overlayRef?.overlayElement;
    const triggerEl = this.tooltipTrigger().host?.nativeElement;
    if (!overlayEl || !triggerEl) return;

    const offset = calculateArrowOffset(
      this.currentPlacement(),
      triggerEl,
      overlayEl,
      8,
    );
    this.arrowLeft.set(offset.left);
    this.arrowTop.set(offset.top);
  }

  ngAfterContentChecked(): void {
    this.syncContentText();
  }

  private syncContentText(): void {
    const contentEl = this.tooltipContent()?.nativeElement as HTMLElement;
    if (contentEl) {
      const text = contentEl.textContent?.trim() ?? "";
      if (text !== this.contentText()) {
        this.contentText.set(text);
      }
    }
  }
}
