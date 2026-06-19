import { DOCUMENT } from "@angular/common";
import {
  Component,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  input,
  inject,
  DestroyRef,
  Renderer2,
  computed,
  viewChild,
  signal,
  contentChild,
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
import { PopoverTriggerDirective } from "./popover-trigger/popover-trigger.directive";
import { getFocusableElements } from "../../../utils/elements.util";
import { PopoverContentComponent } from "./popover-content/popover-content.component";

export type PopoverPosition = OverlayPosition;

let popoverIdCounter = 0;

@Component({
  standalone: true,
  selector: "tedi-popover",
  imports: [OverlayModule],
  templateUrl: "./popover.component.html",
  styleUrl: "./popover.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverComponent {
  /**
   * The position of the popover relative to the trigger element.
   * @default top
   */
  readonly position = input<PopoverPosition>("top");
  /**
   * Should position flip to opposite direction when overflowing screen?
   * @default false
   */
  readonly preventOverflow = input(false);
  /**
   * Is dismissible by clicking outside of content?
   * @default true
   */
  readonly dismissible = input(true);
  /**
   * Does popover content hide on scroll?
   * @default false
   */
  readonly hideOnScroll = input(false);
  /**
   * Does popover have illustrative border on the arrow side?
   * @default false
   */
  readonly withBorder = input(false);
  /**
   * Should show arrow?
   */
  readonly withArrow = input(true);
  /**
   * Lock scrolling on rest of the page?
   * @default false
   */
  readonly lockScroll = input(false);
  /** Delay time (in ms) for closing popover when not hovering trigger or content.
   * @default 100
   */
  readonly timeoutDelay = input(100);

  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);

  private readonly connectedOverlay = viewChild(CdkConnectedOverlay);
  readonly popoverTrigger = contentChild.required(PopoverTriggerDirective);
  private readonly popoverContent = contentChild.required(
    PopoverContentComponent,
  );

  readonly isOpen = signal(false);
  readonly currentPlacement = signal<OverlaySide>("top");
  readonly containerId = signal(`tedi-popover-${popoverIdCounter++}`);
  readonly isContentHovered = signal(false);
  readonly arrowLeft = signal<number | null>(null);
  readonly arrowTop = signal<number | null>(null);

  readonly overlayOrigin = computed(() => this.popoverTrigger().overlayOrigin);
  private readonly arrowOffset = computed(() =>
    this.withArrow() ? (this.withBorder() ? 9 : 12) : 0,
  );

  readonly overlayPositions = computed(() =>
    toConnectedPositions(
      this.position(),
      this.preventOverflow(),
      this.arrowOffset(),
    ),
  );

  readonly panelClasses = computed(() => {
    const classList = ["tedi-popover__container"];
    if (this.withBorder()) classList.push("tedi-popover__container--border");
    if (this.withArrow()) classList.push("tedi-popover__container--arrow");
    return classList.join(" ");
  });

  readonly ariaLabelledBy = computed(() => {
    return this.popoverContent().title()
      ? this.popoverContent().titleId
      : this.containerId() + "_trigger";
  });

  hideTimeout?: ReturnType<typeof setTimeout>;
  /** Whether this popover locked body scroll when it opened — read on close
   * so a mid-open change to the lockScroll input can't leave the lock stuck. */
  private lockedScrollAtOpen = false;
  private keydownListener?: () => void;
  private scrollListener?: () => void;
  private focusinListener?: () => void;
  private mousedownListener?: () => void;

  private readonly horizontalPush = new HorizontalPushHandler(
    () => this.connectedOverlay()?.overlayRef?.overlayElement,
    () => this.updateArrowPosition(),
  );

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.hideTimeout);
      this.horizontalPush.detach();
      this.cleanupKeyboardNavigation();
      this.cleanupScrollListener();
      this.cleanupDismissListeners();
    });
  }

  showPopover() {
    if (this.isOpen()) return;

    clearTimeout(this.hideTimeout);
    this.isOpen.set(true);

    this.lockedScrollAtOpen = this.lockScroll();
    if (this.lockedScrollAtOpen) {
      this.renderer.setStyle(this.document.body, "overflow", "hidden");
    }
  }

  onOverlayAttach() {
    const overlayEl = this.connectedOverlay()?.overlayRef?.overlayElement;
    if (!overlayEl) return;

    const container = overlayEl.querySelector(
      ".tedi-popover__container",
    ) as HTMLElement;
    if (container) {
      setTimeout(() => container.focus({ preventScroll: true }));
      this.setupKeyboardNavigation(container);
    }

    this.horizontalPush.attach();
    this.updateArrowPosition();

    if (this.hideOnScroll()) {
      this.setupScrollListener();
    }

    if (this.dismissible()) {
      this.setupDismissListeners();
    }
  }

  onPositionChange(change: ConnectedOverlayPositionChange) {
    this.currentPlacement.set(getPlacementFromPositionChange(change));
    this.horizontalPush.apply();
    this.updateArrowPosition();
  }

  hidePopover(focusTrigger?: boolean) {
    if (!this.isOpen()) return;

    this.cleanupKeyboardNavigation();
    this.cleanupScrollListener();
    this.horizontalPush.detach();
    this.cleanupDismissListeners();
    this.isOpen.set(false);

    if (this.lockedScrollAtOpen) {
      this.renderer.removeStyle(this.document.body, "overflow");
      this.lockedScrollAtOpen = false;
    }

    if (focusTrigger) {
      this.popoverTrigger().host.nativeElement.focus({ preventScroll: true });
    }
  }

  togglePopover() {
    if (this.isOpen()) {
      this.hidePopover(true);
    } else {
      this.showPopover();
    }
  }

  private updateArrowPosition() {
    if (!this.withArrow()) return;
    const overlayEl = this.connectedOverlay()?.overlayRef?.overlayElement;
    const triggerEl = this.popoverTrigger().host.nativeElement;
    if (!overlayEl || !triggerEl) return;

    const arrowSize = this.withBorder() ? 18 : 24;
    const offset = calculateArrowOffset(
      this.currentPlacement(),
      triggerEl,
      overlayEl,
      arrowSize,
    );
    this.arrowLeft.set(offset.left);
    this.arrowTop.set(offset.top);
  }

  private setupKeyboardNavigation(container: HTMLElement) {
    this.cleanupKeyboardNavigation();

    this.keydownListener = this.renderer.listen(
      container,
      "keydown",
      (e: KeyboardEvent) => {
        if (e.key === "Escape" && this.isOpen()) {
          e.preventDefault();
          this.hidePopover(true);
        }

        if (e.key === "Tab") {
          const focusableElements = getFocusableElements(container);
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          const activeElement = this.document.activeElement as HTMLElement;

          if (
            !e.shiftKey &&
            (activeElement === lastElement ||
              (activeElement === container && !focusableElements.length))
          ) {
            e.preventDefault();
            this.focusElementAfterTrigger();
          } else if (
            e.shiftKey &&
            (activeElement === firstElement || activeElement === container)
          ) {
            e.preventDefault();
            this.focusElementBeforeTrigger();
          }
        }
      },
    );
  }

  private cleanupKeyboardNavigation() {
    if (this.keydownListener) {
      this.keydownListener();
      this.keydownListener = undefined;
    }
  }

  private setupScrollListener() {
    this.cleanupScrollListener();

    this.scrollListener = this.renderer.listen(
      this.document,
      "scroll",
      () => {
        if (this.isOpen()) {
          this.hidePopover(false);
        }
      },
      { capture: true, passive: true },
    );
  }

  private cleanupScrollListener() {
    if (this.scrollListener) {
      this.scrollListener();
      this.scrollListener = undefined;
    }
  }

  private setupDismissListeners() {
    this.cleanupDismissListeners();

    this.focusinListener = this.renderer.listen(
      this.document,
      "focusin",
      (e: FocusEvent) => this.handleClosePopoverEvent(e),
    );

    this.mousedownListener = this.renderer.listen(
      this.document,
      "mousedown",
      (e: MouseEvent) => this.handleClosePopoverEvent(e),
    );
  }

  private cleanupDismissListeners() {
    if (this.focusinListener) {
      this.focusinListener();
      this.focusinListener = undefined;
    }

    if (this.mousedownListener) {
      this.mousedownListener();
      this.mousedownListener = undefined;
    }
  }

  /** Focusable elements on the page, excluding the popover's own overlay —
   * those are detached on close, so focusing them would drop focus to body. */
  private getPageFocusableElements(): HTMLElement[] {
    const overlayEl = this.connectedOverlay()?.overlayRef?.overlayElement;
    return getFocusableElements(this.document.body).filter(
      (el) => !overlayEl?.contains(el),
    );
  }

  private focusElementAfterTrigger() {
    const focusableElements = this.getPageFocusableElements();
    const triggerIndex = focusableElements.indexOf(
      this.popoverTrigger().host.nativeElement,
    );

    if (triggerIndex !== -1 && triggerIndex < focusableElements.length - 1) {
      const nextElement = focusableElements[triggerIndex + 1];
      this.hidePopover();
      setTimeout(() => nextElement.focus());
    }
  }

  private focusElementBeforeTrigger() {
    const focusableElements = this.getPageFocusableElements();
    const triggerIndex = focusableElements.indexOf(
      this.popoverTrigger().host.nativeElement,
    );

    if (triggerIndex > 0) {
      const previousElement = focusableElements[triggerIndex - 1];
      this.hidePopover();
      setTimeout(() => previousElement.focus());
    }
  }

  private handleClosePopoverEvent(e: Event) {
    const triggerEl = this.popoverTrigger().host.nativeElement;
    const containerEl = this.connectedOverlay()?.overlayRef
      ?.overlayElement as HTMLElement;
    const target = e.target as HTMLElement | null;

    if (
      !target ||
      triggerEl.contains(target) ||
      containerEl?.contains(target)
    ) {
      return;
    }

    this.hidePopover(true);
  }
}
