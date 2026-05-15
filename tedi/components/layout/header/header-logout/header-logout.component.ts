import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../../base/icon/icon.component";
import { BreakpointService } from "../../../../services/breakpoint/breakpoint.service";
import { TextComponent } from "../../../base/text/text.component";
import { LinkComponent } from "../../../navigation/link/link.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { HeaderMobileButtonComponent } from "../header-mobile-button/header-mobile-button.component";

export type HeaderLogoutSize = "default" | "small";

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
export class HeaderLogoutComponent {
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

  isSmall = computed(() => {
    const size = this.size() ?? (this.isMobile() ? "small" : "default");
    return size === "small";
  });

  resolvedLabel = computed(() => {
    if (this.label()) {
      return this.label();
    }

    return this.translationService.translate(
      this.isSmall() ? "header.logout-small" : "header.logout",
    );
  });
}
