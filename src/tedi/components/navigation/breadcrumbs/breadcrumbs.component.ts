import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  contentChild,
  contentChildren,
  inject,
  input,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { IconComponent } from "../../base/icon/icon.component";
import { TextComponent } from "../../base/text/text.component";
import { LinkComponent } from "../link/link.component";
import { DropdownComponent } from "../../overlay/dropdown/dropdown.component";
import { DropdownTriggerDirective } from "../../overlay/dropdown/dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "../../overlay/dropdown/dropdown-content/dropdown-content.component";
import { DropdownItemComponent } from "../../overlay/dropdown/dropdown-item/dropdown-item.component";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";
import {
  BreakpointInputs,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
import { BreadcrumbItemDirective } from "./breadcrumb-item.directive";
import { BreadcrumbSeparatorDirective } from "./breadcrumb-separator.directive";

export type BreadcrumbsVariant = "long" | "short";

export type BreadcrumbsInputs = {
  variant?: BreadcrumbsVariant;
  maxItems?: number;
  itemsBeforeCollapse?: number;
  itemsAfterCollapse?: number;
};

type RenderToken =
  | { kind: "item"; item: BreadcrumbItemDirective; current: boolean }
  | { kind: "ellipsis"; hidden: BreadcrumbItemDirective[] };

/**
 * Breadcrumbs show the user's location within the page hierarchy. Each child
 * marked with `*tediBreadcrumbItem` becomes one crumb, in order from the root
 * to the current page; chevron separators are inserted between them.
 *
 * Use a link (e.g. `a tedi-link`) for navigable crumbs and a plain element for
 * the current page — add `aria-current="page"` to it yourself.
 *
 * Crumb links are underlined by default. Set `[underline]="false"` on the
 * `tedi-link` for non-underlined crumbs — recommended for the `short` back-link.
 * Crumbs collapsed into the ellipsis dropdown are always rendered without an
 * underline, regardless of their `[underline]` setting.
 *
 * Collapsed crumbs are exposed as the menu items of the ellipsis menu: the role
 * and the roving tabindex sit on the projected link itself, so it stays a single
 * control that keyboard and screen readers can activate.
 */
@Component({
  selector: "tedi-breadcrumbs",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    IconComponent,
    TextComponent,
    LinkComponent,
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemComponent,
    TediTranslationPipe,
  ],
  templateUrl: "./breadcrumbs.component.html",
  styleUrl: "./breadcrumbs.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-breadcrumbs",
  },
})
export class BreadcrumbsComponent implements BreakpointInputs<BreadcrumbsInputs> {
  private readonly breakpointService = inject(BreakpointService);

  readonly items = contentChildren(BreadcrumbItemDirective);
  readonly separatorTemplate = contentChild(BreadcrumbSeparatorDirective);

  /** Accessible label for the `nav` landmark. Falls back to the `breadcrumbs` translation. */
  readonly ariaLabel = input<string>();
  /** Accessible label for the ellipsis button that opens the collapsed-crumbs dropdown. Falls back to the `breadcrumbs.show-more` translation. */
  readonly showMoreLabel = input<string>();
  /** Separator between crumbs. Defaults to a chevron icon; a `[tediBreadcrumbSeparator]` template overrides this. */
  readonly separator = input<string>();

  /** `long` shows the full trail; `short` shows only the parent crumb as a back-link. Defaults to `long`. */
  readonly variant = input<BreadcrumbsVariant>();
  /** Max crumbs before the middle collapses into an ellipsis dropdown. Long variant only; omit to render all. */
  readonly maxItems = input<number>();
  /** Crumbs kept visible at the start of the trail when collapsed. Defaults to `1`. */
  readonly itemsBeforeCollapse = input<number>();
  /** Crumbs kept visible at the end of the trail when collapsed. Defaults to `1`. */
  readonly itemsAfterCollapse = input<number>();

  readonly xs = input<BreadcrumbsInputs>();
  readonly sm = input<BreadcrumbsInputs>();
  readonly md = input<BreadcrumbsInputs>();
  readonly lg = input<BreadcrumbsInputs>();
  readonly xl = input<BreadcrumbsInputs>();
  readonly xxl = input<BreadcrumbsInputs>();

  private readonly resolved = computed(() =>
    this.breakpointService.getBreakpointInputs<BreadcrumbsInputs>({
      variant: this.variant(),
      maxItems: this.maxItems(),
      itemsBeforeCollapse: this.itemsBeforeCollapse(),
      itemsAfterCollapse: this.itemsAfterCollapse(),
      xs: this.xs(),
      sm: this.sm(),
      md: this.md(),
      lg: this.lg(),
      xl: this.xl(),
      xxl: this.xxl(),
    }),
  );

  readonly currentVariant = computed(() => this.resolved().variant ?? "long");

  readonly parentItem = computed(() => {
    const items = this.items();
    return items.length > 1 ? items[items.length - 2] : null;
  });

  readonly visible = computed(() => {
    if (this.items().length === 0) return false;
    if (this.currentVariant() === "short") return this.parentItem() !== null;
    return true;
  });

  readonly tokens = computed<RenderToken[]>(() => {
    const items = this.items();
    if (items.length === 0) return [];

    const resolved = this.resolved();
    const before = Math.max(0, resolved.itemsBeforeCollapse ?? 1);
    // Keep at least one trailing crumb so the current page is never collapsed.
    const after = Math.max(1, resolved.itemsAfterCollapse ?? 1);
    const lastIndex = items.length - 1;

    const shouldCollapse =
      resolved.maxItems !== undefined &&
      items.length > resolved.maxItems &&
      items.length > before + after;

    if (!shouldCollapse) {
      return items.map((item, index) => ({
        kind: "item",
        item,
        current: index === lastIndex,
      }));
    }

    const tail = items.slice(items.length - after);
    return [
      ...items
        .slice(0, before)
        .map((item) => ({ kind: "item" as const, item, current: false })),
      {
        kind: "ellipsis" as const,
        hidden: items.slice(before, items.length - after),
      },
      ...tail.map((item, index) => ({
        kind: "item" as const,
        item,
        current: index === tail.length - 1,
      })),
    ];
  });
}
