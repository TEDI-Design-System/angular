import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  ViewEncapsulation,
} from "@angular/core";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { IconComponent, type IconSize } from "../../base/icon/icon.component";

export type CollapseButtonArrowType = "default" | "secondary";
export type CollapseButtonSize = "default" | "small";

@Component({
  standalone: true,
  selector: "button[tedi-collapse-button]",
  imports: [IconComponent],
  templateUrl: "./collapse-button.component.html",
  styleUrls: ["./collapse-button.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    type: "button",
    "[class]": "hostClasses()",
    "[attr.id]": "id() || null",
    "[attr.aria-expanded]": "open()",
    "[attr.aria-controls]": "ariaControls() || null",
    "[attr.aria-label]": "resolvedAriaLabel()",
    "(click)": "toggle()",
  },
})
export class CollapseButtonComponent {
  private translationService = inject(TediTranslationService);
  private readonly defaultOpenLabel = this.translationService.track("open");
  private readonly defaultCloseLabel = this.translationService.track("close");
  /**
   * Current open state. Bind alongside `openChange` to keep in sync.
   * @default false
   */
  open = input<boolean>(false);
  /**
   * Label shown when collapsed.
   */
  openText = input<string>();
  /**
   * Label shown when expanded.
   */
  closeText = input<string>();
  /**
   * Hide the label and render the chevron only.
   * @default false
   */
  hideText = input<boolean>(false);
  /**
   * Chevron style. Only takes effect with `hideText`.
   * @default "default"
   */
  arrowType = input<CollapseButtonArrowType>("default");
  /**
   * Visual size.
   * @default "default"
   */
  size = input<CollapseButtonSize>("default");
  /**
   * Use light text and icon for placement on a dark / brand background.
   * Ignored when `arrowType` is `secondary` (no inverted form in the design).
   * @default false
   */
  inverted = input<boolean>(false);
  /**
   * ID of the disclosed region. Forwarded to `aria-controls`.
   */
  ariaControls = input<string>();
  /**
   * Accessible label. Required when `hideText` is true.
   */
  ariaLabel = input<string>();
  /**
   * Forwarded to the rendered `<button>`.
   */
  id = input<string>();

  openChange = output<boolean>();

  protected readonly iconSize = computed<IconSize>(() =>
    this.hideText() ? 24 : 16,
  );

  protected readonly iconVariant = computed(() =>
    this.hideText() ? "filled" : "outlined",
  );

  /**
   * The state-aware visible label / fallback accessible name. When `open`,
   * resolves to `closeText` (or the translated `close`); otherwise resolves to
   * `openText` (or the translated `open`).
   */
  protected readonly label = computed(() =>
    this.open()
      ? (this.closeText() ?? this.defaultCloseLabel())
      : (this.openText() ?? this.defaultOpenLabel()),
  );

  /**
   * Effective `aria-label`. Returns `null` when visible text is present so the
   * button's text content is the accessible name (avoids the WCAG 2.5.3
   * "Label in Name" conflict). In icon-only mode, falls back to the resolved
   * open/close label when no `ariaLabel` is provided.
   */
  protected readonly resolvedAriaLabel = computed(() => {
    if (!this.hideText()) return null;
    return this.ariaLabel() ?? this.label();
  });

  protected readonly hostClasses = computed(() => {
    const classes = ["tedi-collapse-button"];
    if (this.open()) classes.push("tedi-collapse-button--open");
    if (this.size() === "small") classes.push("tedi-collapse-button--small");
    if (this.inverted() && this.arrowType() !== "secondary") {
      classes.push("tedi-collapse-button--inverted");
    }
    if (this.hideText()) {
      classes.push("tedi-collapse-button--icon-only");
      classes.push(
        this.arrowType() === "secondary"
          ? "tedi-collapse-button--secondary"
          : "tedi-collapse-button--neutral",
      );
    }
    return classes.join(" ");
  });

  protected toggle(): void {
    this.openChange.emit(!this.open());
  }
}
