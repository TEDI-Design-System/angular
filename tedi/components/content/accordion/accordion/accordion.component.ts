import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  contentChildren,
  inject,
  input,
} from "@angular/core";
import {
  BreakpointInputs,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import { AccordionItemComponent } from "../accordion-item/accordion-item.component";

/**
 * Breakpoint-aware inputs of the Accordion. Consumers can override each of
 * these per breakpoint via the `xs` / `sm` / `md` / `lg` / `xl` / `xxl` inputs:
 *
 * ```html
 * <tedi-accordion
 *   [allowMultiple]="false"
 *   [lg]="{ allowMultiple: true }"
 * >...</tedi-accordion>
 * ```
 */
export type AccordionInputs = {
  /**
   * Whether the accordion allows multiple items to be expanded at the same
   * time. If false, opening one item collapses the others automatically.
   * @default false
   */
  allowMultiple: boolean;
  /**
   * Group-level default for items' initial expanded state. Sets the initial
   * `defaultExpanded` for every child `tedi-accordion-item` that doesn't
   * specify its own. Per-item `defaultExpanded` (including an explicit
   * `false`) takes precedence.
   *
   * Typically combined with `allowMultiple` to start with all items open.
   */
  defaultExpanded?: boolean;
  /**
   * Vertical gap between sibling `tedi-accordion-item` components, in **rem**
   * (so the value scales with the user's font-size preferences and matches
   * the rest of TEDI's layout spacing convention). Accepts any number, not
   * limited to a fixed scale.
   *
   * Forwarded as the `--tedi-accordion-item-gap` CSS variable, so consumers
   * can also override it from any ancestor class — or set a px value there
   * directly when an exact-pixel override is needed.
   *
   * When omitted, falls back to the design-token default
   * (`var(--layout-grid-gutters-08)` = 0.5rem).
   */
  itemGap?: number;
};

@Component({
  selector: "tedi-accordion",
  standalone: true,
  template: "<ng-content />",
  styleUrl: "./accordion.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[style.--tedi-accordion-item-gap]": "itemGapStyle()",
  },
})
export class AccordionComponent implements BreakpointInputs<AccordionInputs> {
  allowMultiple = input(false);
  defaultExpanded = input<boolean | undefined>(undefined);
  itemGap = input<number | undefined>(undefined);

  xs = input<AccordionInputs>();
  sm = input<AccordionInputs>();
  md = input<AccordionInputs>();
  lg = input<AccordionInputs>();
  xl = input<AccordionInputs>();
  xxl = input<AccordionInputs>();

  private readonly breakpointService = inject(BreakpointService);

  breakpointInputs = computed(() =>
    this.breakpointService.getBreakpointInputs<AccordionInputs>({
      allowMultiple: this.allowMultiple(),
      defaultExpanded: this.defaultExpanded(),
      itemGap: this.itemGap(),
      xs: this.xs(),
      sm: this.sm(),
      md: this.md(),
      lg: this.lg(),
      xl: this.xl(),
      xxl: this.xxl(),
    }),
  );

  protected readonly itemGapStyle = computed(() => {
    const gap = this.breakpointInputs().itemGap;
    return gap !== undefined ? `${gap}rem` : null;
  });

  items = contentChildren(AccordionItemComponent);

  onItemToggled(activeItem: AccordionItemComponent) {
    if (this.breakpointInputs().allowMultiple) return;

    if (activeItem.expanded()) {
      this.items().forEach((item) => {
        if (item !== activeItem) {
          item.setExpanded(false);
        }
      });
    }
  }
}
