import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  model,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { IconComponent, IconSize } from "../../base/icon/icon.component";
import {
  breakpointInput,
  BreakpointInput,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../services/translation/translation.service";
import { generateUUID } from "../../../helpers/generate-uuid";

export type RatingType = "star" | "number" | "icon";
export type RatingOrientation = "horizontal" | "vertical";
export type RatingReadOnlyVariant = "summary" | "scale";

/** Star glyph size (matches `--feedback-star-size`). */
const STAR_ICON_SIZE: IconSize = 24;
/** Glyph size inside the circular number/icon items. */
const CIRCLE_ICON_SIZE: IconSize = 18;

const DEFAULT_ICONS = [
  "sentiment_very_dissatisfied",
  "sentiment_dissatisfied",
  "sentiment_neutral",
  "sentiment_satisfied",
  "sentiment_very_satisfied",
];

interface RatingItem {
  position: number;
  selected: boolean;
  previewed: boolean;
  icon: string;
  accessibleName: string;
  caption?: string;
}

@Component({
  selector: "tedi-rating",
  standalone: true,
  imports: [IconComponent],
  templateUrl: "./rating.component.html",
  styleUrl: "./rating.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RatingComponent),
      multi: true,
    },
  ],
  host: {
    "[class]": "classes()",
    "[attr.role]": "readOnly() ? 'img' : 'radiogroup'",
    "[attr.aria-label]": "readOnly() ? label() + ': ' + summary() : label()",
  },
})
export class RatingComponent implements ControlValueAccessor {
  /** Accessible name for the group; also prefixes the `readOnly` summary. */
  readonly label = input.required<string>();
  /**
   * Visual style. `star` / `number` fill cumulatively; `icon` highlights a single item.
   * @default star
   */
  readonly type = input<RatingType>("star");
  /**
   * Number of items (the max rating).
   * @default 5 (`star` / `icon`), 10 (`number`)
   */
  readonly count = input<number>();
  /**
   * Selected value (1-based; `0` = none). Supports two-way binding and form controls.
   * In `readOnly`, the (possibly fractional) average.
   * @default 0
   */
  readonly value = model<number>(0);
  /** Per-item labels (length = `count`); used as each item's accessible name and as captions. */
  readonly itemLabels = input<string[]>();
  /**
   * Custom Material Symbol glyph(s): an array (one per item) for `type="icon"`, or a single string to
   * swap the `type="star"` glyph.
   * @default sentiment faces (`icon`) / `kid_star` (`star`)
   */
  readonly icons = input<string | string[]>();
  /**
   * Disable interaction and mute the colours.
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });
  /**
   * Show a compact read-only summary (visual + `{value}/{count}` text; text only for `type="number"`) instead
   * of the interactive scale.
   * @default false
   */
  readonly readOnly = input(false, { transform: booleanAttribute });
  /** Number of ratings shown in the `readOnly` summary (e.g. `271 hindajat`); omitted when unset. */
  readonly ratingsCount = input<number>();
  /**
   * Show the descriptive raters label next to `ratingsCount` (e.g. `271 hindajat`). Set `false` to
   * show the number only (`271`).
   * @default true
   */
  readonly showRatingsCountLabel = input(true, { transform: booleanAttribute });
  /**
   * `readOnly` layout: `summary` (single visual) or `scale` (full star scale with fractional fill).
   * @default summary
   */
  readonly readOnlyVariant = input<RatingReadOnlyVariant>("summary");
  /**
   * Lay the scale out horizontally or stack it vertically (icon + caption per row). Use `vertical` on
   * narrow layouts for `type="icon"` with long `itemLabels`. Accepts a `BreakpointInput`, e.g.
   * `{ xs: 'vertical', md: 'horizontal' }`.
   * @default horizontal
   */
  readonly orientation = input(
    { xs: "horizontal" as RatingOrientation },
    {
      transform: (v: BreakpointInput<RatingOrientation>) => breakpointInput(v),
    },
  );
  /** `name` for the radio inputs. Defaults to a generated id. */
  readonly name = input<string>();

  protected readonly starIconSize = STAR_ICON_SIZE;
  protected readonly circleIconSize = CIRCLE_ICON_SIZE;

  private readonly breakpointService = inject(BreakpointService);
  private readonly translationService = inject(TediTranslationService);
  private readonly generatedName = `tedi-rating-${generateUUID()}`;
  private readonly formDisabled = signal(false);
  private readonly hoverValue = signal<number | null>(null);
  private onChange: (value: number) => void = () => {};
  private onTouched: () => void = () => {};

  readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  private readonly interactive = computed(
    () => !this.isDisabled() && !this.readOnly(),
  );
  private readonly isHovering = computed(
    () => this.interactive() && this.hoverValue() !== null,
  );

  readonly groupName = computed(() => this.name() ?? this.generatedName);

  readonly total = computed(() => {
    const count = this.count();
    const fallback = this.type() === "number" ? 10 : 5;
    return count !== undefined && Number.isInteger(count) && count > 0
      ? count
      : fallback;
  });

  readonly resolvedOrientation = computed(() => {
    const value = this.orientation();
    if (
      value.xxl !== undefined &&
      this.breakpointService.isAboveBreakpoint("xxl")()
    )
      return value.xxl;
    if (
      value.xl !== undefined &&
      this.breakpointService.isAboveBreakpoint("xl")()
    )
      return value.xl;
    if (
      value.lg !== undefined &&
      this.breakpointService.isAboveBreakpoint("lg")()
    )
      return value.lg;
    if (
      value.md !== undefined &&
      this.breakpointService.isAboveBreakpoint("md")()
    )
      return value.md;
    if (
      value.sm !== undefined &&
      this.breakpointService.isAboveBreakpoint("sm")()
    )
      return value.sm;
    return value.xs;
  });

  private readonly iconList = computed(() => {
    const icons = this.icons();
    return Array.isArray(icons)
      ? icons
      : icons !== undefined
        ? [icons]
        : undefined;
  });

  readonly starGlyph = computed(() => this.iconList()?.[0] ?? "kid_star");

  private readonly resolvedIcons = computed(
    () =>
      this.iconList() ??
      (this.total() === DEFAULT_ICONS.length ? DEFAULT_ICONS : undefined),
  );

  readonly items = computed<RatingItem[]>(() => {
    const type = this.type();
    const total = this.total();
    const current = this.value();
    const hovering = this.isHovering();
    const hover = this.hoverValue() ?? 0;
    const labels = this.itemLabels();
    const icons = this.resolvedIcons();

    return Array.from({ length: total }, (_, index) => {
      const position = index + 1;
      const label = labels?.[index];
      const isEndpoint = position === 1 || position === total;
      // While hovering, the hovered range previews the pick: items in it take the hover look (selected or
      // unselected per the committed value). On cumulative scales items past it read as unselected; the
      // single-choice icon scale keeps its current pick visible.
      const previewed = hovering && this.isInRange(position, hover);
      const selected =
        this.isInRange(position, current) &&
        (!hovering || previewed || type === "icon");

      return {
        position,
        selected,
        previewed,
        icon: icons?.[index] ?? "circle",
        // Language-neutral fallback (matches the read-only `value/total` summary format).
        accessibleName: label || `${position}/${total}`,
        caption:
          label && (type === "icon" || (type === "number" && isEndpoint))
            ? label
            : undefined,
      };
    });
  });

  readonly hasCaptions = computed(
    () => this.type() !== "star" && !!this.itemLabels()?.some(Boolean),
  );

  readonly starCaption = computed(() => {
    const labels = this.itemLabels();
    if (this.type() !== "star" || !labels?.some(Boolean)) return undefined;
    const display = this.isHovering() ? this.hoverValue()! : this.value();
    return display > 0 ? (labels[display - 1] ?? "") : "";
  });

  readonly summary = computed(() => {
    const locale = this.translationService.getLanguage();
    const formattedValue = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 1,
    }).format(this.value());
    const ratingsCount = this.ratingsCount();
    const countText =
      ratingsCount !== undefined
        ? ` - ${
            this.showRatingsCountLabel()
              ? this.translationService.translate("rating.raters", ratingsCount)
              : new Intl.NumberFormat(locale).format(ratingsCount)
          }`
        : "";
    return `${formattedValue}/${this.total()}${countText}`;
  });

  readonly readOnlyIcon = computed(() => {
    const position = Math.min(
      this.total(),
      Math.max(1, Math.round(this.value())),
    );
    return this.resolvedIcons()?.[position - 1] ?? "circle";
  });

  readonly partialFills = computed(() =>
    Array.from(
      { length: this.total() },
      (_, index) => Math.max(0, Math.min(1, this.value() - index)) * 100,
    ),
  );

  readonly classes = computed(() => {
    const classList = ["tedi-rating", `tedi-rating--${this.type()}`];
    if (this.readOnly()) {
      classList.push("tedi-rating--readonly");
    } else {
      if (this.resolvedOrientation() === "vertical")
        classList.push("tedi-rating--vertical");
      if (this.isDisabled()) classList.push("tedi-rating--disabled");
    }
    return classList.join(" ");
  });

  writeValue(value: number | null): void {
    this.value.set(value ?? 0);
  }

  registerOnChange(fn: (value: number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.formDisabled.set(disabled);
  }

  select(position: number): void {
    if (!this.interactive()) return;
    this.value.set(position);
    this.onChange(position);
  }

  setHover(position: number | null): void {
    this.hoverValue.set(this.interactive() ? position : null);
  }

  handleBlur(): void {
    this.onTouched();
  }

  private isInRange(position: number, target: number): boolean {
    return this.type() === "icon" ? position === target : position <= target;
  }
}
