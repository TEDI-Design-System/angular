import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import {
  Breakpoint,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  selector: "tedi-footer",
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.scss",
  host: {
    class: "tedi-footer no-print",
  },
})
export class FooterComponent {
  private readonly breakpointService = inject(BreakpointService);

  /**
   * Below this breakpoint the footer stacks: sides and sections form one column and collapsible sections become accordions.
   * @default sm
   */
  readonly mobileBreakpoint = input<Breakpoint>("sm");
  /**
   * Caps the width of the content row and the bottom strip's content, centred inside the full-width background.
   * Numbers, including number-only strings, are pixels; other strings are used as CSS lengths.
   */
  readonly maxWidth = input<number | string>();

  readonly isMobile = this.breakpointService.isBelowBreakpoint(
    this.mobileBreakpoint,
  );

  readonly maxWidthValue = computed(() => {
    const maxWidth = this.maxWidth();
    if (maxWidth === undefined || maxWidth === "") return null;
    return typeof maxWidth === "number" || /^\d+(\.\d+)?$/.test(maxWidth)
      ? `${maxWidth}px`
      : maxWidth;
  });
}
