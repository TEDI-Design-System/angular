import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../../base/icon/icon.component";
import {
  BreakpointInputs,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import { TextComponent } from "../../../base/text/text.component";
import { LinkComponent } from "../../../navigation/link/link.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { HeaderMobileButtonComponent } from "../header-mobile-button/header-mobile-button.component";

export type HeaderLogoutSize = "default" | "small";

/**
 * Subset of `HeaderLogoutComponent` inputs that can be overridden per
 * breakpoint via the `[xs]` / `[sm]` / `[md]` / `[lg]` / `[xl]` / `[xxl]`
 * inputs. Mirrors React's `HeaderLogoutBreakpointProps`.
 */
export type HeaderLogoutInputs = {
  size: HeaderLogoutSize | undefined;
  label: string;
};

@Component({
  selector: "tedi-header-logout",
  standalone: true,
  imports: [
    IconComponent,
    TextComponent,
    LinkComponent,
    HeaderMobileButtonComponent,
  ],
  templateUrl: "./header-logout.component.html",
  styleUrl: "./header-logout.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-header-logout",
  },
})
export class HeaderLogoutComponent
  implements BreakpointInputs<HeaderLogoutInputs>
{
  private translationService = inject(TediTranslationService);
  breakpointService = inject(BreakpointService);
  private isMobile = this.breakpointService.isBelowBreakpoint("md");

  /**
   * Visual size of the logout button.
   * - `'small'` renders a compact icon-and-caption button (the
   *   `<tedi-header-mobile-button>` variant).
   * - `'default'` renders a full-width link with inline icon and text.
   *
   * When left unset (the default), the size is chosen automatically based on
   * the viewport: `'small'` below the `md` breakpoint, `'default'` from `md`
   * up. Pass an explicit value to force a variant regardless of viewport —
   * useful inside tight containers (sidebar panel, dropdown) where the
   * desktop layout has no room.
   */
  size = input<HeaderLogoutSize>();

  /**
   * Custom label text for the logout button. When provided, used as-is — not
   * translated. When omitted or empty, falls back to the `header.logout-small`
   * translation key for the compact variant and `header.logout` for the full
   * variant.
   */
  label = input<string>("");

  /**
   * If provided, the logout button renders as an `<a>` navigating to this URL.
   * Otherwise renders as a `<button>`.
   */
  href = input<string>();

  xs = input<HeaderLogoutInputs>();
  sm = input<HeaderLogoutInputs>();
  md = input<HeaderLogoutInputs>();
  lg = input<HeaderLogoutInputs>();
  xl = input<HeaderLogoutInputs>();
  xxl = input<HeaderLogoutInputs>();

  protected readonly breakpointInputs = computed<HeaderLogoutInputs>(() =>
    this.breakpointService.getBreakpointInputs<HeaderLogoutInputs>({
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
      this.breakpointInputs().size ??
      (this.isMobile() ? "small" : "default");
    return size === "small";
  });

  resolvedLabel = computed(() => {
    const { label } = this.breakpointInputs();
    if (label) {
      return label;
    }

    return this.translationService.translate(
      this.isSmall() ? "header.logout-small" : "header.logout",
    );
  });
}
