import {
  AfterContentChecked,
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  NgZone,
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
export type TooltipOpenWith = "hover" | "click" | "both" | "none";

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
   * How the tooltip can be opened. Use `none` for full external control via `open`
   * (e.g. a slider or custom draggable element driving the open state itself).
   * @default both
   */
  readonly openWith = input<TooltipOpenWith>("both");

  /**
   * Controlled open state. When set (not `undefined`), it overrides the built-in
   * trigger behavior; typically paired with `openWith="none"`. Leave unset for the
   * default trigger-driven behavior.
   */
  readonly open = model<boolean | undefined>(undefined);

  /**
   * While open, continuously reposition the tooltip so it follows an origin that moves
   * (e.g. a dragging slider thumb). Uses `requestAnimationFrame`; enable only while the
   * origin can actually move to avoid needless work.
   * @default false
   */
  readonly trackPosition = input(false);

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
  private readonly internalOpen = signal(false);
  readonly isOpen = computed(() =>
    this.open() !== undefined ? Boolean(this.open()) : this.internalOpen(),
  );
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

  private readonly ngZone = inject(NgZone);
  private trackRafId: number | null = null;

  private readonly horizontalPush = new HorizontalPushHandler(
    () => this.connectedOverlay()?.overlayRef?.overlayElement,
    () => this.updateArrowPosition(),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.hideTimeout);
      this.horizontalPush.detach();
      this.stopTracking();
    });

    effect(() => {
      if (this.isOpen() && this.trackPosition()) {
        this.startTracking();
      } else {
        this.stopTracking();
      }
    });
  }

  showTooltip() {
    clearTimeout(this.hideTimeout);
    if (!this.isOpen()) {
      this.internalOpen.set(true);
    }
  }

  hideTooltip() {
    if (this.isOpen()) {
      clearTimeout(this.hideTimeout);
      this.internalOpen.set(false);
      this.horizontalPush.detach();
    }
  }

  /**
   * Recomputes the overlay position against its origin. Call this when the origin has
   * moved without a scroll/resize event (e.g. a dragged element). `trackPosition`
   * calls it automatically each frame while open.
   */
  updatePosition() {
    this.connectedOverlay()?.overlayRef?.updatePosition();
    this.updateArrowPosition();
  }

  private startTracking() {
    if (this.trackRafId !== null) return;

    this.ngZone.runOutsideAngular(() => {
      const loop = () => {
        this.updatePosition();
        this.trackRafId = requestAnimationFrame(loop);
      };
      this.trackRafId = requestAnimationFrame(loop);
    });
  }

  private stopTracking() {
    if (this.trackRafId !== null) {
      cancelAnimationFrame(this.trackRafId);
      this.trackRafId = null;
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
