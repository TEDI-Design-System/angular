import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from "@angular/core";
import {
  BreakpointInputs,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import {
  HeaderAlignment,
  headerAlignmentUtility,
} from "../header-alignment";

export type HeaderTopAlignment = HeaderAlignment;

export type HeaderTopInputs = {
  alignment: HeaderTopAlignment;
};

/**
 * Secondary bar rendered above the main header bar.
 *
 * @example
 * <header tedi-header>
 *   <tedi-header-top alignment="center" [lg]="{ alignment: 'space-between' }">
 *     <!-- top bar content -->
 *   </tedi-header-top>
 *   <!-- main content -->
 * </header>
 */
@Component({
  selector: "tedi-header-top",
  standalone: true,
  template: "<ng-content />",
  styleUrl: "./header-top.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "classes()",
  },
})
export class HeaderTopComponent implements BreakpointInputs<HeaderTopInputs> {
  private breakpointService = inject(BreakpointService);

  /**
   * Horizontal alignment (`justify-content`) of the top bar content. Supports
   * per-breakpoint overrides via the `[xs]`–`[xxl]` inputs, e.g.
   * `alignment="center"` with `[lg]="{ alignment: 'space-between' }"`.
   * @default "space-between"
   */
  alignment = input<HeaderTopAlignment>("space-between");

  xs = input<HeaderTopInputs>();
  sm = input<HeaderTopInputs>();
  md = input<HeaderTopInputs>();
  lg = input<HeaderTopInputs>();
  xl = input<HeaderTopInputs>();
  xxl = input<HeaderTopInputs>();

  protected readonly breakpointInputs = computed<HeaderTopInputs>(() =>
    this.breakpointService.getBreakpointInputs<HeaderTopInputs>({
      alignment: this.alignment(),
      xs: this.xs(),
      sm: this.sm(),
      md: this.md(),
      lg: this.lg(),
      xl: this.xl(),
      xxl: this.xxl(),
    }),
  );

  protected readonly classes = computed(
    () =>
      `tedi-header-top ${headerAlignmentUtility[this.breakpointInputs().alignment]}`,
  );
}
