import { ElementRef, Injectable, inject } from "@angular/core";
import { OverlayContainer } from "@angular/cdk/overlay";
import { INLINE_OVERLAY_CONTAINER_ATTR } from "../floating-overlay/floating-position-strategy";

/**
 * Renders the dropdown panel in the dropdown's own place in the DOM instead of
 * at the end of `<body>`, where the shared container and floating panels live.
 *
 * Mobile screen readers walk the page in DOM order and never send a `Tab` key,
 * so the panel's tab-order stitching does not exist for them: from a body-level
 * panel, swiping past the last item leaves the page for the browser's own UI
 * instead of reaching whatever follows the trigger. Rendering the panel where
 * the trigger sits is the only placement that reads correctly for them.
 *
 * Widget panels (`menu`, `listbox`) stay at the end of `<body>`, where no
 * ancestor's `overflow` or stacking context can clip them. Panels in this inline
 * container are never moved out of it (see `INLINE_OVERLAY_CONTAINER_ATTR`).
 */
@Injectable()
export class DropdownOverlayContainer extends OverlayContainer {
  private readonly rootContainer = inject(OverlayContainer, { skipSelf: true });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private inline = false;

  setInline(inline: boolean) {
    this.inline = inline;
  }

  override getContainerElement(): HTMLElement {
    return this.inline
      ? super.getContainerElement()
      : this.rootContainer.getContainerElement();
  }

  /**
   * Builds the container by hand rather than through `super`, which appends it
   * to `<body>` and, in a test environment, clears every other container it
   * finds there — including the shared one other overlays are still using.
   */
  protected override _createContainer() {
    const container = this._document.createElement("div");
    container.classList.add("cdk-overlay-container");
    container.setAttribute(INLINE_OVERLAY_CONTAINER_ATTR, "");

    this.host.nativeElement.appendChild(container);
    this._containerElement = container;
  }
}
