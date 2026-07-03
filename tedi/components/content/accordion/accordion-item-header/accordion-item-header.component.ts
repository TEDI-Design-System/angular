import { CommonModule } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../../base/icon/icon.component";
import { TextComponent } from "../../../base/text/text.component";
import {
  CollapseButtonArrowType,
  CollapseButtonComponent,
  CollapseButtonSize,
} from "../../../buttons/collapse-button/collapse-button.component";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { AccordionItemComponent } from "../accordion-item/accordion-item.component";

@Component({
  selector: "tedi-accordion-item-header",
  standalone: true,
  templateUrl: "./accordion-item-header.component.html",
  styleUrl: "./accordion-item-header.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent, TextComponent, CollapseButtonComponent],
  host: {
    "[class.tedi-accordion-item-header]": "true",
    "[class.tedi-accordion-item-header--hoverable]":
      "headerClickable() && !item.disabled()",
    "[class.tedi-accordion-item-header--expanded]": "expanded()",
    "[class.tedi-accordion-item-header--with-icon-card]": "item.showIconCard()",
    "[class.tedi-accordion-item-header--disabled]": "item.disabled()",
    "[class]": "headerClass() ?? ''",
  },
})
export class AccordionItemHeaderComponent {
  protected readonly item = inject(AccordionItemComponent);
  private readonly translationService = inject(TediTranslationService);
  private readonly defaultOpenLabel = this.translationService.track("open");
  private readonly defaultCloseLabel = this.translationService.track("close");

  /**
   * If false, disables header toggling and enables using interactive elements in the accordion header.
   */
  headerClickable = input(true);
  /**
   * Sets how the accordion title stretches horizontally.
   * `hug` - container sizes to its content.
   * `fill` - container expands to available space, moving any trailing elements to the end.
   */
  titleLayout = input<"hug" | "fill">("hug");
  /**
   * Text shown when accordion is collapsed. Rendered literally — translate
   * at the call site if needed. When omitted, falls back to the translated
   * `"open"` label from `TediTranslationService`.
   */
  openText = input<string>();
  /**
   * Text shown when accordion is expanded. Rendered literally — translate
   * at the call site if needed. When omitted, falls back to the translated
   * `"close"` label from `TediTranslationService`.
   */
  closeText = input<string>();
  /**
   * Controls whether the expand/collapse label is shown.
   */
  showExpandLabel = input(true);
  /**
   * Controls whether the default expand/collapse action is shown.
   */
  showDefaultExpandAction = input(true);
  /**
   * Position of the expand action relative to the header content.
   */
  expandActionPosition = input<"start" | "end">("end");
  /**
   * Custom CSS classes for the accordion header.
   */
  headerClass = input<string | null>(null);
  /**
   * When set, wraps the header trigger in a semantic `<h1>`–`<h6>` element
   * following the WAI-ARIA Accordion Pattern. Improves accessibility for
   * documents with a heading hierarchy (FAQ pages, docs). The wrapper uses
   * `display: contents` so it doesn't affect the visual layout — it only adds
   * semantic information for assistive technologies and TOC tools.
   */
  headingLevel = input<1 | 2 | 3 | 4 | 5 | 6 | undefined>(undefined);

  /**
   * Chevron style of the default expand action.
   * Only effective when `headerClickable` is `false` (otherwise the
   * default expand action isn't a `CollapseButton`) and `showExpandLabel`
   * is `false` (only icon-only mode honours `arrowType` — see the
   * `CollapseButton` docs).
   * @default "default"
   */
  expandActionArrowType = input<CollapseButtonArrowType>("default");
  /**
   * Visual size of the default expand action. Only effective when
   * `headerClickable` is `false`.
   *
   * When omitted, the size is derived from `showExpandLabel`:
   * - `showExpandLabel === true`  → `"default"`
   * - `showExpandLabel === false` → `"small"` (icon-only mode reads
   *   better at the smaller chevron size).
   *
   * Pass an explicit value to override the derived default.
   */
  expandActionSize = input<CollapseButtonSize | undefined>(undefined);
  /**
   * Use the inverted (light-on-dark) palette for the default expand
   * action, for placement on a dark or brand background. Only effective
   * when `headerClickable` is `false`.
   * @default false
   */
  expandActionInverted = input<boolean>(false);
  /**
   * Whether the default expand action's label is underlined. Defaults to
   * `false` so the chevron stays the sole affordance — an underlined
   * label inside the accordion header reads as a stray link. Set to
   * `true` for contexts that want link-style styling. Only effective
   * when `headerClickable` is `false` and the expand action is not in
   * icon-only mode (i.e. `showExpandLabel` is `true`).
   * @default false
   */
  expandActionUnderline = input<boolean>(false);

  readonly headerId = this.item.headerId;
  readonly contentId = this.item.contentId;
  readonly expanded = this.item.expanded;
  readonly disabled = computed(() => this.item.disabled());

  readonly expandLabel = computed(() =>
    this.expanded()
      ? (this.closeText() ?? this.defaultCloseLabel())
      : (this.openText() ?? this.defaultOpenLabel()),
  );

  readonly showStartExpandAction = computed(
    () =>
      this.showDefaultExpandAction() && this.expandActionPosition() === "start",
  );

  readonly showEndExpandAction = computed(
    () =>
      this.showDefaultExpandAction() && this.expandActionPosition() === "end",
  );

  readonly resolvedExpandActionSize = computed<CollapseButtonSize>(
    () =>
      this.expandActionSize() ?? (this.showExpandLabel() ? "default" : "small"),
  );

  toggle() {
    this.item.toggle();
  }
}
