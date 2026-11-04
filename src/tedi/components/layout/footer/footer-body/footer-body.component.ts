import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChildren,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import {
  BreakpointInputs,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import { FooterSectionComponent } from "../footer-section/footer-section.component";
import { injectFooter } from "../footer-context";

export type FooterBodyInputs = {
  columns?: number;
};

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  selector: "tedi-footer-body",
  template: "<ng-content />",
  styleUrl: "./footer-body.component.scss",
  host: {
    class: "tedi-footer-body",
    "[class.tedi-footer-body--mobile]": "isMobile()",
    "[class.tedi-footer-body--compact]": "compact()",
    "[class.tedi-footer-body--grid]": "gridColumns() !== null",
    "[style.grid-template-columns]": "gridColumns()",
  },
})
export class FooterBodyComponent implements BreakpointInputs<FooterBodyInputs> {
  private readonly breakpointService = inject(BreakpointService);

  /**
   * Lays sections out as a grid of this many equal columns instead of a filling row; ignored below the footer's `mobileBreakpoint`.
   */
  readonly columns = input<number>();

  readonly xs = input<FooterBodyInputs>();
  readonly sm = input<FooterBodyInputs>();
  readonly md = input<FooterBodyInputs>();
  readonly lg = input<FooterBodyInputs>();
  readonly xl = input<FooterBodyInputs>();
  readonly xxl = input<FooterBodyInputs>();

  readonly isMobile = injectFooter().isMobile;

  private readonly sections = contentChildren(FooterSectionComponent, {
    descendants: true,
  });

  readonly breakpointInputs = computed(() =>
    this.breakpointService.getBreakpointInputs<FooterBodyInputs>({
      columns: this.columns(),
      xs: this.xs(),
      sm: this.sm(),
      md: this.md(),
      lg: this.lg(),
      xl: this.xl(),
      xxl: this.xxl(),
    }),
  );

  readonly gridColumns = computed(() => {
    const { columns } = this.breakpointInputs();
    if (this.isMobile() || !columns || columns < 1) return null;
    return `repeat(${columns}, minmax(0, 1fr))`;
  });

  readonly compact = computed(() =>
    this.sections().some((section) => section.applyCollapse()),
  );
}
