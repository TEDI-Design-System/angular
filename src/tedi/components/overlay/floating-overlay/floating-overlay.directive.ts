import {
  CdkConnectedOverlay,
  FlexibleConnectedPositionStrategy,
} from "@angular/cdk/overlay";
import { Directive, inject, NgZone } from "@angular/core";
import { FloatingPositionStrategy } from "./floating-position-strategy";

/**
 * Swaps a `cdkConnectedOverlay`'s position strategy for
 * `FloatingPositionStrategy`, so the panel scrolls with its trigger instead of
 * trailing it. CDK still handles
 * attaching, outside clicks, Escape and the overlay container.
 *
 * @example
 * <ng-template cdkConnectedOverlay tediFloatingOverlay [cdkConnectedOverlayOrigin]="origin">
 */
@Directive({
  selector: "[cdkConnectedOverlay][tediFloatingOverlay]",
  standalone: true,
})
export class FloatingOverlayDirective {
  constructor() {
    const overlay = inject(CdkConnectedOverlay);
    const strategy = new FloatingPositionStrategy(
      {
        origin: () => overlay.origin,
        positions: () =>
          overlay.positions.map((position) => ({
            ...position,
            offsetX: position.offsetX || overlay.offsetX,
            offsetY: position.offsetY || overlay.offsetY,
          })),
        flexibleDimensions: () => overlay.flexibleDimensions,
      },
      inject(NgZone),
    );

    // Set before the first `open` change, which is when CDK builds the overlay.
    // CDK only types this input as its own strategy, but uses it through the
    // `PositionStrategy` interface and the fluent setters the strategy stubs.
    overlay.positionStrategy =
      strategy as unknown as FlexibleConnectedPositionStrategy;
  }
}
