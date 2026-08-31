import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import {
  BreakpointInputs,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";

export type CardRowDirection = "row" | "column";

export type CardRowInputs = {
  direction?: CardRowDirection;
};

/**
 * Lays out card content cells inside a card.
 * Place a `tedi-separator` between cells (vertical, `size="auto"`) or
 * between rows (horizontal) to draw dividers.
 */
@Component({
  selector: "tedi-card-row",
  standalone: true,
  templateUrl: "./card-row.component.html",
  styleUrl: "./card-row.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "classes()",
  },
})
export class CardRowComponent implements BreakpointInputs<CardRowInputs> {
  /**
   * Direction the cells are laid out in. Use this instead of flex utility
   * classes — the row rounds the corners it shares with the card based on it.
   * @default row
   */
  direction = input<CardRowDirection | undefined>("row");

  xs = input<CardRowInputs>();
  sm = input<CardRowInputs>();
  md = input<CardRowInputs>();
  lg = input<CardRowInputs>();
  xl = input<CardRowInputs>();
  xxl = input<CardRowInputs>();

  private breakpointService = inject(BreakpointService);

  breakpointInputs = computed(() => {
    return this.breakpointService.getBreakpointInputs<CardRowInputs>({
      direction: this.direction(),

      xs: this.xs(),
      sm: this.sm(),
      md: this.md(),
      lg: this.lg(),
      xl: this.xl(),
      xxl: this.xxl(),
    });
  });

  classes = computed(() => {
    const classList = ["tedi-card-row"];

    if (this.breakpointInputs().direction === "column") {
      classList.push("tedi-card-row--column");
    }

    return classList.join(" ");
  });
}
