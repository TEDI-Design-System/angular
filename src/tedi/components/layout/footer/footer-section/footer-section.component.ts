import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { TextComponent } from "../../../base/text/text.component";
import { IconComponent } from "../../../base/icon/icon.component";
import { CollapseComponent } from "../../../content/collapse/collapse.component";
import {
  Breakpoint,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import { injectFooter } from "../footer-context";

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  selector: "tedi-footer-section",
  imports: [IconComponent, TextComponent, CollapseComponent, NgTemplateOutlet],
  templateUrl: "./footer-section.component.html",
  styleUrl: "./footer-section.component.scss",
  host: {
    class: "tedi-footer-section",
    "[class.tedi-footer-section--mobile]": "isMobile()",
    "[class.tedi-footer-section--collapsible]": "applyCollapse()",
  },
})
export class FooterSectionComponent {
  private readonly breakpointService = inject(BreakpointService);

  /**
   * Section heading; on mobile it is also the accordion toggle's label.
   */
  readonly heading = input<string>();
  /**
   * Material Symbols icon shown in a tinted circle beside the heading.
   */
  readonly icon = input<string>();
  /**
   * Turns the section into an accordion below the footer's `mobileBreakpoint`.
   * @default false
   */
  readonly collapsible = input<boolean>(false);
  /**
   * @deprecated Use `collapsible` instead.
   * @default false
   */
  readonly collapse = input<boolean>(false);
  /**
   * Opens the accordion initially.
   * @default false
   */
  readonly defaultOpen = input<boolean>(false);
  /**
   * The icon is hidden below this breakpoint.
   * @default lg
   */
  readonly iconBreakpoint = input<Breakpoint>("lg");

  readonly isMobile = injectFooter().isMobile;

  readonly applyCollapse = computed(
    () => (this.collapsible() || this.collapse()) && this.isMobile(),
  );

  readonly hideIcon = this.breakpointService.isBelowBreakpoint(
    this.iconBreakpoint,
  );
}
