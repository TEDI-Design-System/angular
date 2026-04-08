import {
  ConnectedPosition,
  ConnectedOverlayPositionChange,
} from "@angular/cdk/overlay";

export type OverlayPosition =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end"
  | "auto"
  | "auto-start"
  | "auto-end";

const POSITION_MAP: Record<string, ConnectedPosition> = {
  top: {
    originX: "center",
    originY: "top",
    overlayX: "center",
    overlayY: "bottom",
    offsetY: -8,
  },
  "top-start": {
    originX: "start",
    originY: "top",
    overlayX: "start",
    overlayY: "bottom",
    offsetY: -8,
  },
  "top-end": {
    originX: "end",
    originY: "top",
    overlayX: "end",
    overlayY: "bottom",
    offsetY: -8,
  },
  bottom: {
    originX: "center",
    originY: "bottom",
    overlayX: "center",
    overlayY: "top",
    offsetY: 8,
  },
  "bottom-start": {
    originX: "start",
    originY: "bottom",
    overlayX: "start",
    overlayY: "top",
    offsetY: 8,
  },
  "bottom-end": {
    originX: "end",
    originY: "bottom",
    overlayX: "end",
    overlayY: "top",
    offsetY: 8,
  },
  left: {
    originX: "start",
    originY: "center",
    overlayX: "end",
    overlayY: "center",
    offsetX: -8,
  },
  "left-start": {
    originX: "start",
    originY: "top",
    overlayX: "end",
    overlayY: "top",
    offsetX: -8,
  },
  "left-end": {
    originX: "start",
    originY: "bottom",
    overlayX: "end",
    overlayY: "bottom",
    offsetX: -8,
  },
  right: {
    originX: "end",
    originY: "center",
    overlayX: "start",
    overlayY: "center",
    offsetX: 8,
  },
  "right-start": {
    originX: "end",
    originY: "top",
    overlayX: "start",
    overlayY: "top",
    offsetX: 8,
  },
  "right-end": {
    originX: "end",
    originY: "bottom",
    overlayX: "start",
    overlayY: "bottom",
    offsetX: 8,
  },
};

const OPPOSITE_DIRECTION: Record<string, string> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

export function toConnectedPositions(
  placement: OverlayPosition,
  preventOverflow: boolean,
  extraOffset = 0,
): ConnectedPosition[] {
  const applyExtra = (pos: ConnectedPosition): ConnectedPosition => {
    if (extraOffset === 0) return pos;
    return {
      ...pos,
      offsetX: pos.offsetX
        ? pos.offsetX + Math.sign(pos.offsetX) * extraOffset
        : pos.offsetX,
      offsetY: pos.offsetY
        ? pos.offsetY + Math.sign(pos.offsetY) * extraOffset
        : pos.offsetY,
    };
  };

  if (placement.startsWith("auto")) {
    const suffix = placement === "auto" ? "" : placement.substring(5);
    const directions = ["top", "bottom", "right", "left"];

    return directions.map((dir) => {
      const key = suffix ? `${dir}-${suffix}` : dir;
      return applyExtra(POSITION_MAP[key] ?? POSITION_MAP[dir]);
    });
  }

  const primary = POSITION_MAP[placement];
  if (!primary) return [applyExtra(POSITION_MAP["bottom"])];

  const positions: ConnectedPosition[] = [applyExtra(primary)];

  const direction = placement.split("-")[0];
  const suffix = placement.includes("-")
    ? placement.substring(placement.indexOf("-") + 1)
    : "";

  // Add cross-axis fallbacks (start/end variants) so CDK can shift
  // horizontally/vertically without push covering the trigger
  const crossAxisSuffixes = ["start", "end"].filter((s) => s !== suffix);
  for (const s of crossAxisSuffixes) {
    const key = `${direction}-${s}`;
    const fallback = POSITION_MAP[key];
    if (fallback) positions.push(applyExtra(fallback));
  }

  if (preventOverflow) {
    const opposite = OPPOSITE_DIRECTION[direction];

    if (opposite) {
      const key = suffix ? `${opposite}-${suffix}` : opposite;
      const fallback = POSITION_MAP[key];
      if (fallback) positions.push(applyExtra(fallback));

      // Also add cross-axis fallbacks for the opposite direction
      for (const s of crossAxisSuffixes) {
        const oppKey = `${opposite}-${s}`;
        const oppFallback = POSITION_MAP[oppKey];
        if (oppFallback) positions.push(applyExtra(oppFallback));
      }
    }
  }

  return positions;
}

export function getPlacementFromPositionChange(
  change: ConnectedOverlayPositionChange,
): string {
  const { originY, overlayY, originX, overlayX } = change.connectionPair;

  if (overlayX === "end" && originX === "start") return "left";
  if (overlayX === "start" && originX === "end") return "right";
  if (overlayY === "bottom") return "top";
  if (overlayY === "top" && originY === "bottom") return "bottom";

  return "bottom";
}

export interface ArrowOffset {
  left: number | null;
  top: number | null;
}

/**
 * Horizontal-only push: shifts the overlay pane left/right so it stays
 * within the viewport, replicating floating-ui's shift() middleware.
 * Unlike CDK's built-in push, this does NOT affect the vertical axis,
 * so overlays scroll naturally with their triggers.
 */
function applyHorizontalPush(overlayEl: HTMLElement): void {
  const content = overlayEl.firstElementChild as HTMLElement | null;
  if (!content) return;

  // Reset previous shift before measuring
  content.style.translate = "";

  const rect = content.getBoundingClientRect();
  const viewportWidth = document.documentElement.clientWidth;

  let shift = 0;
  if (rect.right > viewportWidth) {
    shift = -(rect.right - viewportWidth);
  }
  // After shifting for right overflow, ensure left edge stays at 0 or above
  if (rect.left + shift < 0) {
    shift = -rect.left;
  }
  if (shift !== 0) {
    content.style.translate = `${shift}px`;
  }
}

/**
 * Manages horizontal-only push and resize recalculation for CDK overlays.
 */
export class HorizontalPushHandler {
  private resizeCleanup?: () => void;
  private rafId?: number;

  constructor(
    private readonly getOverlayEl: () => HTMLElement | undefined,
    private readonly onAfterPush?: () => void,
  ) {}

  apply(): void {
    const el = this.getOverlayEl();
    if (el) applyHorizontalPush(el);
  }

  attach(): void {
    this.apply();
    if (!this.resizeCleanup) {
      const handler = () => {
        if (this.rafId != null) cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame(() => {
          this.rafId = undefined;
          this.apply();
          this.onAfterPush?.();
        });
      };
      window.addEventListener("resize", handler);
      this.resizeCleanup = () => window.removeEventListener("resize", handler);
    }
  }

  detach(): void {
    if (this.rafId != null) cancelAnimationFrame(this.rafId);
    this.rafId = undefined;
    this.resizeCleanup?.();
    this.resizeCleanup = undefined;
  }
}

export function calculateArrowOffset(
  placement: string,
  triggerEl: HTMLElement,
  overlayEl: HTMLElement,
  arrowSize: number,
  padding = 4,
): ArrowOffset {
  const triggerRect = triggerEl.getBoundingClientRect();
  // Use the content container's rect (first child) which reflects horizontal push
  const container = overlayEl.firstElementChild as HTMLElement | null;
  const overlayRect = container
    ? container.getBoundingClientRect()
    : overlayEl.getBoundingClientRect();
  // The rotated arrow's visual extent is larger than half the element size
  const edgeMargin = padding + arrowSize * 0.7;

  const isVertical = placement === "top" || placement === "bottom";

  if (isVertical) {
    const triggerCenter = triggerRect.left + triggerRect.width / 2;
    const left = triggerCenter - overlayRect.left;
    return {
      left: Math.round(
        Math.max(edgeMargin, Math.min(overlayRect.width - edgeMargin, left)),
      ),
      top: null,
    };
  }

  const triggerCenter = triggerRect.top + triggerRect.height / 2;
  const top = triggerCenter - overlayRect.top;
  return {
    left: null,
    top: Math.round(
      Math.max(edgeMargin, Math.min(overlayRect.height - edgeMargin, top)),
    ),
  };
}
