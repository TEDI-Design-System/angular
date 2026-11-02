import {
  afterNextRender,
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  signal,
  TemplateRef,
  untracked,
  viewChild,
  ViewContainerRef,
  ViewEncapsulation,
} from "@angular/core";
import { DOCUMENT, isPlatformBrowser, NgTemplateOutlet } from "@angular/common";
import { _IdGenerator, FocusTrap, FocusTrapFactory } from "@angular/cdk/a11y";
import { hasModifierKey } from "@angular/cdk/keycodes";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { SheetContentDirective } from "./sheet-content.directive";
import { SheetTriggerDirective } from "./sheet-trigger.directive";

export type SheetRole = "dialog" | "alertdialog";

type SheetStatus = "closed" | "initial" | "open" | "close";

const CLOSE_DURATION = 300;
const DRAG_DISMISS_THRESHOLD = 120;
const DRAG_EXPAND_THRESHOLD = 40;
// A press only becomes a drag after moving this far, so a tap on the header stays a tap.
const DRAG_START_THRESHOLD_TOUCH = 10;
const DRAG_START_THRESHOLD_MOUSE = 2;
const DRAG_ZONE_SELECTOR = ".tedi-sheet__handle-zone, .tedi-sheet-header";
const NO_DRAG_SELECTOR = [
  "a[href]",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  '[contenteditable]:not([contenteditable="false"])',
  '[role="button"]',
  '[role="link"]',
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

const closestInside = (target: Element, selector: string, panel: Element) => {
  const match = target.closest(selector);
  return match !== null && match !== panel && panel.contains(match);
};

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  panel: HTMLElement;
}

/**
 * Bottom sheet dialog. Holds an optional `tediSheetTrigger` and the panel
 * content in `<ng-template tediSheetContent>`.
 */
@Component({
  standalone: true,
  selector: "tedi-sheet",
  imports: [NgTemplateOutlet],
  templateUrl: "./sheet.component.html",
  styleUrl: "./sheet.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-sheet",
    "(window:blur)": "resetDrag()",
  },
})
export class SheetComponent implements OnDestroy {
  /**
   * Whether the sheet is open. Use `[(open)]` to keep it in sync with closing
   * by the close button, backdrop, Escape or dragging.
   * @default false
   */
  readonly open = model(false);

  /**
   * Whether the sheet is collapsed to its header. The body and footer are
   * hidden rather than removed, so their state survives.
   * @default false
   */
  readonly collapsed = model(false);

  /**
   * Close the sheet on a click outside it.
   * @default true
   */
  readonly closeOnBackdropClick = input(true, { transform: booleanAttribute });

  /**
   * Close the sheet on Escape.
   * @default true
   */
  readonly closeOnEscape = input(true, { transform: booleanAttribute });

  /**
   * Use `alertdialog` for interruptive confirmations.
   * @default dialog
   */
  readonly role = input<SheetRole>("dialog");

  private readonly overlay = inject(Overlay);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly focusTrapFactory = inject(FocusTrapFactory);
  private readonly injector = inject(Injector);
  private readonly ngZone = inject(NgZone);
  private readonly document = inject(DOCUMENT);
  private readonly idGenerator = inject(_IdGenerator);
  private readonly translationService = inject(TediTranslationService);

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  protected readonly content = contentChild(SheetContentDirective);
  private readonly trigger = contentChild(SheetTriggerDirective, {
    read: ElementRef,
  });
  private readonly panelTemplate =
    viewChild.required<TemplateRef<unknown>>("panelTemplate");
  private readonly panel = viewChild<ElementRef<HTMLElement>>("panel");

  /** @internal */
  readonly panelId = this.idGenerator.getId("tedi-sheet-");
  /** @internal */
  readonly titleId = this.idGenerator.getId("tedi-sheet-title-");
  /** @internal Set by `<tedi-sheet-header>` while it renders a title. */
  readonly hasTitle = signal(false);

  protected readonly status = signal<SheetStatus>("closed");
  protected readonly closeLabel = this.translationService.track("close");

  private overlayRef: OverlayRef | null = null;
  private focusTrap: FocusTrap | null = null;
  private previouslyFocused: HTMLElement | null = null;
  private closeTimer: ReturnType<typeof setTimeout> | undefined;
  private initialized = false;

  private dragState: DragState | null = null;
  private readonly dragOffset = signal(0);
  private readonly dragging = signal(false);
  // From the press, not the drag threshold: the panel holds the pointer from then on, so its cursor shows.
  protected readonly grabbing = signal(false);
  private readonly snapIndex = signal<number | null>(null);

  private readonly snaps = computed(() =>
    [...(this.content()?.snapPoints() ?? [])].sort((a, b) => a - b),
  );

  // Snap points are suspended while collapsed, so the panel shrinks to its header and an upward drag expands it.
  private readonly hasSnaps = computed(
    () => this.snaps().length > 0 && !this.collapsed(),
  );

  private readonly currentSnap = computed(() => {
    const snaps = this.snaps();
    const index =
      this.snapIndex() ??
      this.content()?.defaultSnapPoint() ??
      snaps.length - 1;
    return snaps[Math.max(0, Math.min(index, snaps.length - 1))] ?? 1;
  });

  protected readonly labelledBy = computed(
    () =>
      this.content()?.ariaLabelledBy() ??
      (this.hasTitle() ? this.titleId : null),
  );

  protected readonly ariaLabel = computed(() =>
    this.labelledBy() ? null : (this.content()?.ariaLabel() ?? null),
  );

  protected readonly panelStyle = computed(() => {
    const content = this.content();
    const style: Record<string, string> = {};
    const minHeight = content?.minHeight();

    if (minHeight && !this.collapsed()) {
      style["min-height"] = minHeight;
    }

    if (this.hasSnaps()) {
      const snaps = this.snaps();
      const maxSnap = snaps[snaps.length - 1];
      style["max-height"] = `${maxSnap * 100}dvh`;

      if (this.dragging()) {
        const height = Math.min(
          this.snapHeight(maxSnap),
          Math.max(0, this.snapHeight(this.currentSnap()) - this.dragOffset()),
        );
        style["height"] = `${height}px`;
        style["transition"] = "none";
      } else {
        style["height"] = `${this.currentSnap() * 100}dvh`;
      }
    } else {
      const maxHeight = content?.maxHeight();
      if (maxHeight) {
        style["max-height"] = maxHeight;
      }

      if (this.dragOffset() > 0) {
        style["transform"] = `translateY(${this.dragOffset()}px)`;
        style["transition"] = "none";
      }
    }

    return style;
  });

  constructor() {
    effect(() => {
      const open = this.open();
      untracked(() => (open ? this.show() : this.hide()));
      this.initialized = true;
    });

    effect(() => {
      this.open();
      this.collapsed();
      this.content()?.showHandle();
      untracked(() => this.resetDrag());
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.closeTimer);
    this.resetDrag();
    this.focusTrap?.destroy();
    this.overlayRef?.dispose();
  }

  /** Close the sheet. */
  close(): void {
    this.open.set(false);
  }

  /** Open the sheet if it's closed, and close it if it's open. */
  toggle(): void {
    this.open.update((open) => !open);
  }

  protected onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget && this.closeOnBackdropClick()) {
      this.close();
    }
  }

  private show(): void {
    if (!this.isBrowser) return;

    const content = this.content();
    if (!content) return;

    clearTimeout(this.closeTimer);

    const autoFocus = this.initialized;
    const active = this.document.activeElement;
    this.previouslyFocused =
      active instanceof HTMLElement && active !== this.document.body
        ? active
        : null;

    const overlayRef = this.getOverlayRef();
    if (!overlayRef.hasAttached()) {
      overlayRef.attach(
        new TemplatePortal(this.panelTemplate(), this.viewContainerRef),
      );
    }

    overlayRef.updateScrollStrategy(
      content.lockScroll()
        ? this.overlay.scrollStrategies.block()
        : this.overlay.scrollStrategies.noop(),
    );

    this.status.set("initial");

    afterNextRender(
      () => {
        if (!this.open()) return;

        const panel = this.panel()?.nativeElement;
        if (!panel) return;

        this.focusTrap ??= this.focusTrapFactory.create(panel);
        this.focusTrap.enabled = content.trapFocus();

        // `cdkFocusInitial`, else the first tabbable element, else the panel itself.
        if (
          autoFocus &&
          !this.focusTrap.focusInitialElement({ preventScroll: true })
        ) {
          panel.focus({ preventScroll: true });
        }

        // Lay the panel out at its closed position first, so the slide-in transition runs.
        panel.getBoundingClientRect();
        this.status.set("open");
      },
      { injector: this.injector },
    );
  }

  private hide(): void {
    if (!this.isBrowser || this.status() === "closed") return;

    this.status.set("close");
    this.overlayRef?.updateScrollStrategy(this.overlay.scrollStrategies.noop());

    if (this.focusTrap) {
      this.focusTrap.enabled = false;
    }

    if (this.content()?.returnFocus() !== false) {
      this.restoreFocus();
    }

    this.closeTimer = setTimeout(() => {
      this.status.set("closed");

      if (!this.content()?.keepMounted()) {
        this.focusTrap?.destroy();
        this.focusTrap = null;
        this.overlayRef?.detach();
      }
    }, CLOSE_DURATION);
  }

  /** Only while focus is still in the sheet (or lost), so closing a docked sheet doesn't pull focus back from the page. */
  private restoreFocus(): void {
    const panel = this.panel()?.nativeElement;
    const active = this.document.activeElement;

    if (active && active !== this.document.body && !panel?.contains(active)) {
      return;
    }

    (this.previouslyFocused ?? this.trigger()?.nativeElement)?.focus({
      preventScroll: true,
    });
  }

  private getOverlayRef(): OverlayRef {
    if (this.overlayRef) return this.overlayRef;

    const overlayRef = this.overlay.create({
      positionStrategy: this.overlay.position().global().top("0").left("0"),
      scrollStrategy: this.overlay.scrollStrategies.noop(),
      width: "100%",
      height: "100%",
      panelClass: "tedi-sheet-pane",
    });

    overlayRef.keydownEvents().subscribe((event) => {
      if (
        event.key === "Escape" &&
        !hasModifierKey(event) &&
        this.open() &&
        this.closeOnEscape()
      ) {
        event.preventDefault();
        this.close();
      }
    });

    // Without a backdrop the page receives the clicks, so they arrive here as outside the pane.
    overlayRef.outsidePointerEvents().subscribe((event) => {
      const target = event.target;
      if (
        !this.open() ||
        !this.closeOnBackdropClick() ||
        (target instanceof Node &&
          this.trigger()?.nativeElement.contains(target))
      ) {
        return;
      }
      this.close();
    });

    this.overlayRef = overlayRef;
    return overlayRef;
  }

  private snapHeight(snap: number): number {
    return snap * (this.document.defaultView?.innerHeight ?? 0);
  }

  private canStartDrag(event: PointerEvent): boolean {
    const { target, currentTarget } = event;

    return (
      this.open() &&
      !!this.content()?.showHandle() &&
      event.button === 0 &&
      !event.ctrlKey &&
      this.dragState === null &&
      target instanceof Element &&
      currentTarget instanceof Element &&
      closestInside(target, DRAG_ZONE_SELECTOR, currentTarget) &&
      !closestInside(target, NO_DRAG_SELECTOR, currentTarget)
    );
  }

  protected onDragStart(event: PointerEvent): void {
    const panel = event.currentTarget;
    if (!(panel instanceof HTMLElement) || !this.canStartDrag(event)) return;

    this.dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panel,
    };
    this.grabbing.set(true);

    // Captured from the press, so a quick flick off the small collapsed header still reaches the panel.
    panel.setPointerCapture(event.pointerId);

    // Outside Angular, so moves that don't become a drag don't run change detection.
    this.ngZone.runOutsideAngular(() => {
      panel.addEventListener("pointermove", this.onDragMove);
      panel.addEventListener("pointerup", this.onDragEnd);
      panel.addEventListener("pointercancel", this.onDragCancel);
      panel.addEventListener("lostpointercapture", this.onDragCancel);
    });
  }

  private onDragMove = (event: PointerEvent): void => {
    const drag = this.dragState;
    if (drag?.pointerId !== event.pointerId) return;

    if (event.pointerType === "mouse" && (event.buttons & 1) === 0) {
      this.resetDrag();
      return;
    }

    const delta = event.clientY - drag.startY;

    if (!this.dragging()) {
      const deltaX = event.clientX - drag.startX;
      const threshold =
        event.pointerType === "touch"
          ? DRAG_START_THRESHOLD_TOUCH
          : DRAG_START_THRESHOLD_MOUSE;

      if (Math.max(Math.abs(delta), Math.abs(deltaX)) < threshold) return;

      if (Math.abs(deltaX) > Math.abs(delta)) {
        this.resetDrag();
        return;
      }

      this.dragging.set(true);
    }

    this.dragOffset.set(this.hasSnaps() ? delta : Math.max(0, delta));
  };

  private onDragEnd = (event: PointerEvent): void => {
    const drag = this.dragState;
    if (drag?.pointerId !== event.pointerId) return;

    const dragged = this.dragging();
    const delta = event.clientY - drag.startY;
    this.resetDrag();
    if (!dragged) return;

    this.ngZone.run(() => {
      if (this.hasSnaps()) {
        this.settleOnSnap(this.snapHeight(this.currentSnap()) - delta);
      } else if (this.collapsed() && delta < -DRAG_EXPAND_THRESHOLD) {
        this.collapsed.set(false);
      } else if (delta > DRAG_DISMISS_THRESHOLD) {
        this.close();
      }
    });
  };

  private onDragCancel = (event: PointerEvent): void => {
    if (this.dragState?.pointerId === event.pointerId) this.resetDrag();
  };

  protected resetDrag(): void {
    const drag = this.dragState;
    if (!drag) return;

    this.dragState = null;
    this.grabbing.set(false);
    this.dragging.set(false);
    this.dragOffset.set(0);

    const { panel, pointerId } = drag;
    panel.removeEventListener("pointermove", this.onDragMove);
    panel.removeEventListener("pointerup", this.onDragEnd);
    panel.removeEventListener("pointercancel", this.onDragCancel);
    panel.removeEventListener("lostpointercapture", this.onDragCancel);

    if (panel.hasPointerCapture(pointerId)) {
      panel.releasePointerCapture(pointerId);
    }
  }

  private settleOnSnap(height: number): void {
    const snaps = this.snaps();

    if (height < this.snapHeight(snaps[0]) - DRAG_DISMISS_THRESHOLD) {
      this.close();
      return;
    }

    let nearest = 0;
    let best = Infinity;
    snaps.forEach((snap, index) => {
      const distance = Math.abs(this.snapHeight(snap) - height);
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    });

    this.snapIndex.set(nearest);
    this.content()?.snapPointChange.emit(snaps[nearest]);
  }
}
