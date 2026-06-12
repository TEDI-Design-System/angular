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
    role: "button",
    "aria-haspopup": "dialog",
    "[id]": "popover.containerId() + '_trigger'",
    "[attr.aria-expanded]": "popover.isOpen()",
    "[attr.aria-controls]": "popover.containerId()",
    "[class.tedi-popover-trigger__text]": "underline()",
  },
})
export class PopoverTriggerDirective {
  /**
   * Should add underline class to trigger element?
   * @default false
   */
  readonly underline = input(false);

  readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  readonly popover = inject(PopoverComponent);
  readonly overlayOrigin = inject(CdkOverlayOrigin, { self: true });

  @HostListener("click")
  onClick() {
    this.popover.togglePopover();
  }
}
