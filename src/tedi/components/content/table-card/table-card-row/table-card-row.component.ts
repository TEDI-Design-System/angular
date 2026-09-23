import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { LabelComponent } from "../../../form/label/label.component";
import { TEDI_TABLE_CARD_ROWS_CONTEXT } from "../table-card.utils";

/**
 * A single label / value pair inside a `tedi-table-card` or
 * `tedi-table-card-group`. Renders the `<dt>` / `<dd>` of that parent's `<dl>`,
 * so it is only valid as a direct child of one.
 *
 * It goes on a `<div>` because a `<dl>` may only group its terms in plain
 * `<div>`s — a custom element there breaks description-list semantics for
 * assistive technology.
 *
 * ```html
 * <div tedi-table-card-row label="Periood" value="01.02 - 14.01.2024"></div>
 * <div tedi-table-card-row label="Tõendi olek">
 *   <tedi-status-badge color="success" text="Kehtiv" />
 * </div>
 * ```
 */
@Component({
  selector: "div[tedi-table-card-row]",
  standalone: true,
  templateUrl: "./table-card-row.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [LabelComponent],
  host: {
    "[class]": "classes()",
    "[style.grid-column]": "gridColumn()",
  },
})
export class TableCardRowComponent {
  /**
   * Label of the row. Project `[tediTableCardRowLabel]` content instead when it
   * needs markup of its own. `labelFor` and `labelId` apply only to this text;
   * projected labels manage their own attributes.
   */
  label = input<string>();
  /**
   * ID of the native form control labelled by this row. Renders the label text
   * as a `<label for>`.
   */
  labelFor = input<string>();
  /**
   * ID assigned to the generated label. Reference it through `ariaLabelledby`
   * for controls such as `tedi-select`.
   */
  labelId = input<string>();
  /**
   * Plain-text value of the row. Richer content is projected instead; both
   * render when both are given.
   */
  value = input<string>();
  /**
   * Emphasise the value.
   * @default false
   */
  bold = input(false, { transform: booleanAttribute });
  /**
   * Span this row across `colSpan` columns. Clamped to the columns in force, so
   * it has no effect in a single-column body.
   */
  colSpan = input<number>();

  private readonly rowsContext = inject(TEDI_TABLE_CARD_ROWS_CONTEXT, {
    optional: true,
  });

  readonly labelSize = computed(
    () => this.rowsContext?.resolvedLabelSize() ?? "default",
  );

  readonly classes = computed(() => {
    const classList = ["tedi-table-card-row"];

    if (this.bold()) {
      classList.push("tedi-table-card-row--bold");
    }

    return classList.join(" ");
  });

  readonly gridColumn = computed(() => {
    const columns = this.rowsContext?.resolvedColumns() ?? 1;
    const colSpan = Math.min(this.colSpan() ?? 1, columns);

    return colSpan > 1 ? `span ${colSpan}` : null;
  });
}
