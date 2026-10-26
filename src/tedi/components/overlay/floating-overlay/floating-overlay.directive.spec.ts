import {
  CdkConnectedOverlay,
  ConnectedOverlayPositionChange,
  ConnectedPosition,
  OverlayContainer,
  OverlayModule,
} from "@angular/cdk/overlay";
import { Component, Injectable, signal, viewChild } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FloatingOverlayDirective } from "./floating-overlay.directive";
import {
  FloatingPositionStrategy,
  OVERLAY_HOST_CLASS,
} from "./floating-position-strategy";

const POSITIONS: ConnectedPosition[] = [
  { originX: "start", originY: "bottom", overlayX: "start", overlayY: "top" },
];

@Component({
  standalone: true,
  imports: [OverlayModule, FloatingOverlayDirective],
  template: `
    <button cdkOverlayOrigin #origin="cdkOverlayOrigin">Trigger</button>
    <ng-template
      cdkConnectedOverlay
      tediFloatingOverlay
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayOpen]="open()"
      [cdkConnectedOverlayPositions]="positions"
      [cdkConnectedOverlayOffsetY]="6"
      (positionChange)="changes.push($event)"
    >
      <div class="panel">Panel</div>
    </ng-template>
  `,
})
class HostComponent {
  readonly overlay = viewChild.required(CdkConnectedOverlay);
  readonly open = signal(false);
  readonly positions = POSITIONS;
  readonly changes: ConnectedOverlayPositionChange[] = [];
}

describe("FloatingOverlayDirective", () => {
  const flush = () => new Promise((resolve) => setTimeout(resolve));

  it("positions the CDK overlay with the floating strategy", async () => {
    const fixture = TestBed.createComponent(HostComponent);
    const host = fixture.componentInstance;
    fixture.detectChanges();

    expect(host.overlay().positionStrategy).toBeInstanceOf(
      FloatingPositionStrategy,
    );

    host.open.set(true);
    fixture.detectChanges();
    await flush();

    const pane = document.querySelector(".panel")!.parentElement!;
    expect(pane.parentElement!.classList).toContain(OVERLAY_HOST_CLASS);
    expect(pane.style.top).toBe("6px");
    expect(host.changes[0].connectionPair).toEqual({
      ...POSITIONS[0],
      offsetX: undefined,
      offsetY: 6,
    });

    fixture.destroy();
  });

  it("renders inside an app's own overlay root, as microfrontends need (#380)", async () => {
    const mfeRoot = document.createElement("mfe-root");
    document.body.appendChild(mfeRoot);

    @Injectable()
    class MfeOverlayContainer extends OverlayContainer {
      protected override _createContainer(): void {
        super._createContainer();
        mfeRoot.appendChild(this._containerElement);
      }
    }

    TestBed.configureTestingModule({
      providers: [{ provide: OverlayContainer, useClass: MfeOverlayContainer }],
    });
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    fixture.componentInstance.open.set(true);
    fixture.detectChanges();
    await flush();

    const host =
      document.querySelector(".panel")!.parentElement!.parentElement!;
    expect(host.classList).toContain(OVERLAY_HOST_CLASS);
    expect(host.parentElement).toBe(mfeRoot);

    fixture.destroy();
    mfeRoot.remove();
  });
});
