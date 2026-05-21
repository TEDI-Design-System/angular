import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent, IconSize } from "../../../base/icon/icon.component";

@Component({
  standalone: true,
  selector: "button[tedi-table-header-button]",
  imports: [IconComponent],
  template:
    '<tedi-icon [name]="icon()" [variant]="iconVariant()" color="inherit" [size]="iconSize()" />',
  styleUrl: "./table-header-button.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    type: "button",
    "[class]": "hostClasses()",
    "[disabled]": "disabled() || null",
    "[attr.aria-label]": "ariaLabel()",
  },
})
export class TediTableHeaderButtonComponent {
  /** Material icon name rendered inside the button. */
  readonly icon = input.required<string>();

  /**
   * Render the icon's "filled" variant.
   * @default false
   */
  readonly filled = input(false, { transform: booleanAttribute });

  /**
   * Paint the icon in the brand colour to indicate an active sort/filter.
   * @default false
   */
  readonly selected = input(false, { transform: booleanAttribute });

  /**
   * Disabled state.
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * Size of the icon, in pixels.
   * @default 18
   */
  readonly iconSize = input<IconSize>(18);

  /** Required accessible name for the icon-only button. */
  readonly ariaLabel = input.required<string>({ alias: "aria-label" });

  protected readonly iconVariant = computed(() =>
    this.filled() ? "filled" : "outlined",
  );

  protected readonly hostClasses = computed(() => {
    const classes = ["tedi-table-header-button"];
    if (this.selected()) classes.push("tedi-table-header-button--selected");
    return classes.join(" ");
  });
}
