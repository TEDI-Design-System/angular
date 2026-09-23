import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
  ViewEncapsulation,
  HostBinding,
  HostAttributeToken,
} from "@angular/core";
import { BreakpointService } from "../../../../services/breakpoint/breakpoint.service";

export type FooterSidePlacement = "start" | "end";
export type FooterSidePosition = "start" | "center" | "end";

@Component({
  standalone: true,
  selector: "tedi-footer-side",
  template: `<ng-content />`,
  styleUrl: "./footer-side.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class FooterSideComponent {
  isStart = inject(new HostAttributeToken("tedi-footer-start"), {
    optional: true,
  });
  isEnd = inject(new HostAttributeToken("tedi-footer-end"), { optional: true });

  /**
   * Specifies the position of the footer internal content.
   * @default center
   */
  position = input<FooterSidePosition>("center");
  placement = signal<FooterSidePlacement | null>(null);
  breakpointService = inject(BreakpointService);

  mobileLayout = this.breakpointService.isBelowBreakpoint("sm");

  constructor() {
    const side =
      this.isStart !== null ? "start" : this.isEnd !== null ? "end" : null;
    if (side) this.placement.set(side as FooterSidePlacement);
    else
      console.warn(
        '[TediFooterSide] No placement detected. Use "tedi-footer-start" or "tedi-footer-end" attribute to define where this component should be rendered.',
      );
  }

  @HostBinding("class")
  get hostClasses(): string {
    const classes = ["tedi-footer-side"];

    if (this.mobileLayout()) classes.push("tedi-footer-side--mobile");

    classes.push(`tedi-footer-side--${this.placement()}`);
    classes.push(`tedi-footer-side--vertical-${this.position()}`);

    return classes.join(" ");
  }
}
