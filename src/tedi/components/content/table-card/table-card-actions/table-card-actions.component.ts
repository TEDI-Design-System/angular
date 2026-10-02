import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ViewEncapsulation,
} from "@angular/core";
import { CardContentComponent } from "../../card/card-content/card-content.component";
import { CardBackground, CardPadding } from "../../card/card.utils";
import { TableCardGroupComponent } from "../table-card-group/table-card-group.component";
import { TableCardComponent } from "../table-card.component";
import { getTableCardPaddingSides } from "../table-card.utils";

/**
 * Footer of a `tedi-table-card` or one of its `tedi-table-card-group`s. Inside a
 * group it adopts that group's background.
 *
 * ```html
 * <tedi-table-card-actions>
 *   <button tedi-button variant="neutral"><tedi-icon name="edit" [size]="18" />Muuda</button>
 * </tedi-table-card-actions>
 * ```
 */
@Component({
  selector: "tedi-table-card-actions",
  standalone: true,
  templateUrl: "./table-card-actions.component.html",
  styleUrl: "./table-card-actions.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [CardContentComponent],
  host: {
    class: "tedi-table-card-actions",
    "[class.tedi-table-card-actions--in-group]": "inGroup",
  },
})
export class TableCardActionsComponent {
  private readonly group = inject(TableCardGroupComponent, { optional: true });
  private readonly card = inject(TableCardComponent, { optional: true });

  /**
   * Match the enclosing horizontal padding, with a tighter vertical of its own.
   */
  readonly resolvedPadding = computed<CardPadding>(() => {
    const enclosing =
      this.group?.resolvedPadding() ?? this.card?.resolvedPadding() ?? 1;
    const { right, left } = getTableCardPaddingSides(enclosing);

    return { top: 0.5, right, bottom: 0.5, left };
  });

  protected readonly inGroup = !!this.group;

  readonly background = computed<CardBackground>(
    () => this.group?.background() ?? "primary",
  );
}
