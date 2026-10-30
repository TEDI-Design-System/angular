import {
  CdkOverlayOrigin,
  ConnectedOverlayPositionChange,
  ConnectedPosition,
  FlexibleConnectedPositionStrategyOrigin,
  OverlayRef,
  PositionStrategy,
} from "@angular/cdk/overlay";
import { ElementRef, NgZone } from "@angular/core";
import { Subject } from "rxjs";

/** Class on an overlay host that floats in the document instead of CDK's fixed container. */
export const OVERLAY_HOST_CLASS = "tedi-overlay-host";

/** Matches any element that holds overlay panes, floating or not. */
export const OVERLAY_ROOT_SELECTOR = `.cdk-overlay-container, .${OVERLAY_HOST_CLASS}`;

/** Marks an overlay container whose panes must stay inside it (e.g. inline dropdown panels). */
export const INLINE_OVERLAY_CONTAINER_ATTR = "data-tedi-overlay-inline";

export type FloatingOverlayOrigin =
  CdkOverlayOrigin | FlexibleConnectedPositionStrategyOrigin;

export interface FloatingPositionConfig {
  origin: () => FloatingOverlayOrigin;
  positions: () => ConnectedPosition[];
  /** Constrains the pane to the space left in the viewport, like CDK's flexible dimensions. */
  flexibleDimensions: () => boolean;
}

const NO_CLIPPING = {
  isOriginClipped: false,
  isOriginOutsideView: false,
  isOverlayClipped: false,
  isOverlayOutsideView: false,
};

interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}

function toElement(origin: FloatingOverlayOrigin): Element | null {
  if (origin instanceof CdkOverlayOrigin)
    return origin.elementRef.nativeElement;
  if (origin instanceof ElementRef) return origin.nativeElement;
  if (origin instanceof Element) return origin;
  return null;
}

function originBox(origin: FloatingOverlayOrigin): Box {
  const element = toElement(origin);
  if (element) return element.getBoundingClientRect();

  const point = origin as {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };
  return {
    top: point.y,
    left: point.x,
    width: point.width ?? 0,
    height: point.height ?? 0,
  };
}

/** Distance of a connection point from a box's left/top edge; `start`/`end` follow the text direction. */
function along(point: string, size: number, rtl: boolean): number {
  if (point === "center") return size / 2;
  if (point === "top") return 0;
  if (point === "bottom") return size;
  return (point === "end") !== rtl ? size : 0;
}

/** Viewport position of an overlay of `size` connected to `origin` at `position`. */
function connect(
  origin: Box,
  size: { width: number; height: number },
  position: ConnectedPosition,
  rtl: boolean,
): { x: number; y: number } {
  return {
    x:
      origin.left +
      along(position.originX, origin.width, rtl) -
      along(position.overlayX, size.width, rtl) +
      (position.offsetX ?? 0),
    y:
      origin.top +
      along(position.originY, origin.height, false) -
      along(position.overlayY, size.height, false) +
      (position.offsetY ?? 0),
  };
}

function visibleArea(
  { x, y }: { x: number; y: number },
  { width, height }: { width: number; height: number },
  viewport: { width: number; height: number },
): number {
  const visibleWidth = Math.min(x + width, viewport.width) - Math.max(x, 0);
  const visibleHeight = Math.min(y + height, viewport.height) - Math.max(y, 0);
  return Math.max(0, visibleWidth) * Math.max(0, visibleHeight);
}

/** A fixed or sticky origin stays put while the page scrolls, so its panel must too. */
function hasFixedAncestor(element: Element | null): boolean {
  for (let el = element; el; el = el.parentElement) {
    const { position } = getComputedStyle(el);
    if (position === "fixed" || position === "sticky") return true;
  }
  return false;
}

/** The first position that fits the viewport, otherwise the one showing the most of the pane. */
function pickPosition(
  positions: ConnectedPosition[],
  origin: Box,
  size: { width: number; height: number },
  viewport: { width: number; height: number },
  rtl: boolean,
): ConnectedPosition {
  let best = positions[0];
  let bestArea = -1;
  for (const position of positions) {
    const area = visibleArea(
      connect(origin, size, position, rtl),
      size,
      viewport,
    );
    if (area === size.width * size.height) return position;
    if (area > bestArea) {
      best = position;
      bestArea = area;
    }
  }
  return best;
}

/** Height left between the pane's anchored edge and the viewport edge it grows towards. */
function availableHeight(
  position: ConnectedPosition,
  point: { y: number },
  height: number,
  viewportHeight: number,
): number {
  const anchor = point.y + along(position.overlayY, height, false);
  if (position.overlayY === "top") return Math.max(0, viewportHeight - anchor);
  if (position.overlayY === "bottom") return Math.max(0, anchor);
  return viewportHeight;
}

/** Whether a computed value differs from its initial one (unset reads as initial). */
function isSet(value: string, initial: string): boolean {
  return !!value && value !== initial;
}

/**
 * Whether an absolutely positioned child of `parent` would be clipped by an
 * ancestor's `overflow` — e.g. a microfrontend root that scrolls. Only boxes up
 * to the child's containing block clip it; the fixed container escapes them.
 */
function clipsFloatingChild(parent: Element): boolean {
  const root = parent.ownerDocument.documentElement;
  // `<body>` overflow moves to the viewport unless `<html>` sets its own.
  const bodyClips = isSet(getComputedStyle(root).overflow, "visible");

  for (
    let el: Element | null = parent;
    el && el !== root;
    el = el.parentElement
  ) {
    const style = getComputedStyle(el);
    const clips = [style.overflow, style.overflowX, style.overflowY].some(
      (value) => isSet(value, "visible"),
    );
    if (clips && (el !== el.ownerDocument.body || bodyClips)) return true;
    if (isSet(style.position, "static") || isSet(style.transform, "none")) {
      return false;
    }
  }
  return false;
}

/**
 * Positions a CDK overlay pane in the document instead of CDK's fixed
 * container, replacing CDK's flexible connected strategy.
 *
 * CDK keeps panes in a `position: fixed` container and moves them on every
 * scroll event. Scroll events arrive after the browser has already painted the
 * scrolled page, so panes trail their trigger by a frame and bob. Here the
 * pane's host is moved next to that container and positioned absolutely in the
 * document, so the browser scrolls pane and trigger together, as TEDI React
 * does with floating-ui. Positions are tried in order like CDK does: the first
 * that fits the viewport wins, otherwise the one showing the most of the pane.
 *
 * The host stays under the container's parent, so an app's custom
 * `OverlayContainer` still decides where overlays render. Where that parent
 * would clip the pane, or the origin itself is fixed, the host stays in the
 * container as before.
 */
export class FloatingPositionStrategy implements PositionStrategy {
  readonly positionChanges = new Subject<ConnectedOverlayPositionChange>();

  private overlayRef?: OverlayRef;
  private container: HTMLElement | null = null;
  private stopTracking?: () => void;
  private trackedOrigin?: Element | null;
  private lastPosition?: string;

  constructor(
    private readonly config: FloatingPositionConfig,
    private readonly ngZone: NgZone,
  ) {}

  attach(overlayRef: OverlayRef): void {
    this.overlayRef = overlayRef;
    this.container ??= overlayRef.hostElement.parentElement;
    this.placeHost(overlayRef.hostElement);
  }

  apply(): void {
    const pane = this.overlayRef?.overlayElement;
    if (!pane || !this.overlayRef?.hasAttached()) return;

    const origin = toElement(this.config.origin());
    if (!this.stopTracking || origin !== this.trackedOrigin) {
      this.track(origin, pane);
    }
    this.update(pane);
  }

  detach(): void {
    this.stopTracking?.();
    this.stopTracking = undefined;
    this.trackedOrigin = undefined;
    this.lastPosition = undefined;
  }

  dispose(): void {
    this.detach();
    this.positionChanges.complete();
  }

  /** CdkConnectedOverlay pushes its inputs through these; the config is read live instead. */
  setOrigin(): this {
    return this;
  }
  withPositions(): this {
    return this;
  }
  withFlexibleDimensions(): this {
    return this;
  }
  withPush(): this {
    return this;
  }
  withGrowAfterOpen(): this {
    return this;
  }
  withViewportMargin(): this {
    return this;
  }
  withLockedPosition(): this {
    return this;
  }
  withTransformOriginOn(): this {
    return this;
  }

  private placeHost(host: HTMLElement): void {
    const container = this.container;
    if (!container) return;

    const parent = container.parentElement;
    const float =
      !!parent &&
      !container.hasAttribute(INLINE_OVERLAY_CONTAINER_ATTR) &&
      !hasFixedAncestor(toElement(this.config.origin())) &&
      !clipsFloatingChild(parent);
    const target = float ? parent : container;

    host.classList.toggle(OVERLAY_HOST_CLASS, float);
    if (host.parentElement !== target) target.appendChild(host);
  }

  /**
   * Repositions on what the browser can't do by itself: resizes, scrolling
   * inside nested containers, and origin or pane size changes.
   */
  private track(origin: Element | null, pane: HTMLElement): void {
    this.stopTracking?.();
    this.trackedOrigin = origin;

    const document = pane.ownerDocument;
    const window = document.defaultView;
    const update = () => this.update(pane);
    const onScroll = (event: Event) => {
      if (!(event.target instanceof Node && pane.contains(event.target))) {
        update();
      }
    };

    this.ngZone.runOutsideAngular(() => {
      window?.addEventListener("resize", update);
      document.addEventListener("scroll", onScroll, {
        capture: true,
        passive: true,
      });

      const observer =
        typeof ResizeObserver === "undefined"
          ? undefined
          : new ResizeObserver(update);
      observer?.observe(pane);
      if (origin) observer?.observe(origin);

      this.stopTracking = () => {
        window?.removeEventListener("resize", update);
        document.removeEventListener("scroll", onScroll, { capture: true });
        observer?.disconnect();
      };
    });
  }

  private update(pane: HTMLElement): void {
    if (!this.overlayRef?.hasAttached()) return;

    const positions = this.config.positions();
    if (!positions.length) return;

    const flexible = this.config.flexibleDimensions();
    // Measure the natural size, not the one a previous update capped.
    if (flexible) pane.style.maxHeight = "";

    const rtl = this.overlayRef.getDirection() === "rtl";
    const origin = originBox(this.config.origin());
    const { width, height } = pane.getBoundingClientRect();
    const root = pane.ownerDocument.documentElement;
    const viewport = { width: root.clientWidth, height: root.clientHeight };

    const best = pickPosition(
      positions,
      origin,
      { width, height },
      viewport,
      rtl,
    );
    let point = connect(origin, { width, height }, best, rtl);

    if (flexible) {
      const available = availableHeight(best, point, height, viewport.height);
      pane.style.maxHeight = `${available}px`;
      point = connect(
        origin,
        { width, height: Math.min(height, available) },
        best,
        rtl,
      );
    }

    // The host sits at the origin of the pane's containing block (the floating
    // host itself, or CDK's fixed container), unlike `offsetParent`, which
    // ignores transformed ancestors.
    const host = this.overlayRef.hostElement.getBoundingClientRect();
    pane.style.left = `${point.x - host.left}px`;
    pane.style.top = `${point.y - host.top}px`;

    const key = [
      best.originX,
      best.originY,
      best.overlayX,
      best.overlayY,
    ].join();
    if (key !== this.lastPosition) {
      this.lastPosition = key;
      this.positionChanges.next(
        new ConnectedOverlayPositionChange(best, NO_CLIPPING),
      );
    }
  }
}

/**
 * Moves the CDK overlay container after any floating overlay hosts, so a global
 * overlay opened now (a modal) stacks above panels that are already open.
 */
export function raiseOverlayContainer(container: HTMLElement): void {
  const parent = container.parentElement;
  if (!parent) return;

  let next = container.nextElementSibling;
  while (next && !next.classList.contains(OVERLAY_HOST_CLASS)) {
    next = next.nextElementSibling;
  }
  if (!next) return;

  // Re-inserting a node blurs anything focused inside it.
  const focused = container.ownerDocument.activeElement;
  parent.appendChild(container);
  if (focused instanceof HTMLElement && container.contains(focused)) {
    focused.focus({ preventScroll: true });
  }
}
