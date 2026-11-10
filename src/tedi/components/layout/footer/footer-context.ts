import { inject, Signal } from "@angular/core";
import { BreakpointService } from "../../../services/breakpoint/breakpoint.service";
import { FooterComponent } from "./footer.component";

export function injectFooter(): {
  footer: FooterComponent | null;
  isMobile: Signal<boolean>;
} {
  const footer = inject(FooterComponent, { optional: true });

  return {
    footer,
    isMobile:
      footer?.isMobile ?? inject(BreakpointService).isBelowBreakpoint("sm"),
  };
}
