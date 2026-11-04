import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostAttributeToken,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import {
  BreakpointInputs,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import { injectFooter } from "../footer-context";

export type FooterSidePlacement = "start" | "end";
export type FooterSidePosition = "start" | "center" | "end";

export type FooterSideInputs = {
  placement?: FooterSidePlacement;
  position?: FooterSidePosition;
};

@Component({
  standalone: true,
  selector: "tedi-footer-side",
  template: `<ng-content />`,
  styleUrl: "./footer-side.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "classes()",
  },
})
export class FooterSideComponent implements BreakpointInputs<FooterSideInputs> {
  private readonly breakpointService = inject(BreakpointService);
  private readonly legacyPlacement: FooterSidePlacement | undefined =
    inject(new HostAttributeToken("tedi-footer-end"), { optional: true }) !==
    null
      ? "end"
      : undefined;

  /**
   * Side of the body the slot sits on; `end` also puts it below the sections once the footer stacks.
   * The `tedi-footer-start` and `tedi-footer-end` attributes are deprecated in favour of this input.
   * @default start
   */
  readonly placement = input<FooterSidePlacement>();
  /**
   * Vertical alignment of the slot's content.
   * @default center
   */
  readonly position = input<FooterSidePosition | undefined>("center");

  readonly xs = input<FooterSideInputs>();
  readonly sm = input<FooterSideInputs>();
  readonly md = input<FooterSideInputs>();
  readonly lg = input<FooterSideInputs>();
  readonly xl = input<FooterSideInputs>();
  readonly xxl = input<FooterSideInputs>();

  readonly isMobile = injectFooter().isMobile;

  readonly breakpointInputs = computed(() =>
    this.breakpointService.getBreakpointInputs<FooterSideInputs>({
      placement: this.placement() ?? this.legacyPlacement ?? "start",
      position: this.position(),
      xs: this.xs(),
      sm: this.sm(),
      md: this.md(),
      lg: this.lg(),
      xl: this.xl(),
      xxl: this.xxl(),
    }),
  );

  readonly classes = computed(() => {
    const { placement, position } = this.breakpointInputs();
    const classes = [
      "tedi-footer-side",
      `tedi-footer-side--${placement}`,
      `tedi-footer-side--vertical-${position}`,
    ];
    if (this.isMobile()) classes.push("tedi-footer-side--mobile");
    return classes.join(" ");
  });
}
