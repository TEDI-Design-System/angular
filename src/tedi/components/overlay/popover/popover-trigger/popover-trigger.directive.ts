import {
  Directive,
  ElementRef,
  HostListener,
  inject,
  input,
} from "@angular/core";
import { CdkOverlayOrigin } from "@angular/cdk/overlay";
import { PopoverComponent } from "../popover.component";

@Directive({
  standalone: true,
  selector: "[tedi-popover-trigger]",
  hostDirectives: [CdkOverlayOrigin],
  host: {
    tabindex: "0",
    "[attr.role]": "interactive() ? 'button' : null",
    "[attr.aria-haspopup]": "interactive() ? 'dialog' : null",
    "[id]": "popover.containerId() + '_trigger'",
    "[attr.aria-expanded]": "interactive() ? popover.isOpen() : null",
    "[attr.aria-controls]":
      "interactive() && popover.isOpen() ? (popover.containerId() || null) : null",
    "[class.tedi-popover-trigger__text]": "underline()",
  },
})
export class PopoverTriggerDirective {
  /**
   * Should add underline class to trigger element?
   * @default false
   */
  readonly underline = input(false);
  /**
   * When `false`, the trigger drops its `button` role and dialog ARIA
   * (`aria-haspopup`, `aria-expanded`, `aria-controls`). Use this when the element
   * is only a positioning anchor and an inner control is the real, labelled trigger
   * — e.g. a field wrapper whose icon button opens the popover.
   * @default true
   */
  readonly interactive = input(true);

  readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly popover = inject(PopoverComponent);
  readonly overlayOrigin = inject(CdkOverlayOrigin, { self: true });

  @HostListener("click")
  onClick() {
    this.popover.togglePopover();
  }
}
