import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { ButtonComponent } from "../../../buttons/button/button.component";
import {
  BreakpointInputs,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { HeaderMobileButtonComponent } from "../header-mobile-button/header-mobile-button.component";

export type HeaderLoginSize = "default" | "small";

/**
 * Subset of `HeaderLoginComponent` inputs that can be overridden per breakpoint
 * via the `[xs]` / `[sm]` / `[md]` / `[lg]` / `[xl]` / `[xxl]` inputs. Mirrors
 * React's `HeaderLoginBreakpointProps`.
 */
export type HeaderLoginInputs = {
  size: HeaderLoginSize | undefined;
  label: string;
};

@Component({
  selector: "tedi-header-login",
  standalone: true,
  imports: [ButtonComponent, HeaderMobileButtonComponent],
  templateUrl: "./header-login.component.html",
  styleUrl: "./header-login.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderLoginComponent implements BreakpointInputs<HeaderLoginInputs> {
  breakpointService = inject(BreakpointService);
  translationService = inject(TediTranslationService);

  private isMobile = this.breakpointService.isBelowBreakpoint("md");

  /**
   * Visual size of the login button.
   * - `'small'` renders a compact icon-and-caption button (the
   *   `<tedi-header-mobile-button>` variant).
   * - `'default'` renders a primary button or anchor with text only.
   *
   * When left unset, the size is chosen automatically based on the viewport:
   * `'small'` below the `md` breakpoint, `'default'` from `md` up. Pass an
   * explicit value to force a variant regardless of viewport.
   */
  size = input<HeaderLoginSize>();

  /**
   * Custom label text for the login button. When provided, used as-is — not
   * translated. When omitted or empty, falls back to the `header.login.mobile`
   * translation key for the compact variant and `header.login` for the full
   * variant.
   */
  label = input<string>("");

  /**
   * If provided, the login button renders as an `<a>` navigating to this URL.
   * Otherwise renders as a `<button>`.
   */
  href = input<string>();

  xs = input<HeaderLoginInputs>();
  sm = input<HeaderLoginInputs>();
  md = input<HeaderLoginInputs>();
  lg = input<HeaderLoginInputs>();
  xl = input<HeaderLoginInputs>();
  xxl = input<HeaderLoginInputs>();

  protected readonly breakpointInputs = computed<HeaderLoginInputs>(() =>
    this.breakpointService.getBreakpointInputs<HeaderLoginInputs>({
      size: this.size(),
      label: this.label(),
      xs: this.xs(),
      sm: this.sm(),
      md: this.md(),
      lg: this.lg(),
      xl: this.xl(),
      xxl: this.xxl(),
    }),
  );

  isSmall = computed(() => {
    const size =
      this.breakpointInputs().size ?? (this.isMobile() ? "small" : "default");
    return size === "small";
  });

  resolvedLabel = computed(() => {
    const { label } = this.breakpointInputs();
    if (label) {
      return label;
    }

    return this.translationService.translate(
      this.isSmall() ? "header.login.mobile" : "header.login",
    );
  });
}
