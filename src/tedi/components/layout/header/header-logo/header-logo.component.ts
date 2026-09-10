import { NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { ThemeService } from "../../../../services/theme/theme.service";
import { HeaderLogoDarkDirective } from "./header-logo-dark.directive";

@Component({
  selector: "tedi-header-logo",
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: "./header-logo.component.html",
  styleUrl: "./header-logo.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "classes()",
  },
})
export class HeaderLogoComponent {
  /**
   * Optional link URL. When set, the logo is wrapped in an anchor element.
   */
  readonly href = input<string>();

  /**
   * Controls visibility of the logo. Useful for conditionally hiding the logo
   * based on application state, feature flags, or custom media queries that
   * fall between standard breakpoints (e.g. 360px). For responsive hiding at
   * standard breakpoints, prefer wrapping `<tedi-header-logo>` with `*hideAt`
   * or `*showAt`.
   * @default true
   */
  readonly showLogo = input(true);

  private readonly darkSlot = contentChild(HeaderLogoDarkDirective);
  private readonly themeService = inject(ThemeService);

  protected readonly useDark = computed(
    () => this.themeService.theme() === "dark" && !!this.darkSlot(),
  );

  protected readonly classes = computed(() => {
    const list = ["tedi-header-logo"];
    if (this.useDark()) list.push("tedi-header-logo--dark");
    if (!this.showLogo()) list.push("tedi-header-logo--hidden");
    return list.join(" ");
  });
}
