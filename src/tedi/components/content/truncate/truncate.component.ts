import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  inject,
  input,
  model,
} from "@angular/core";
import { TextComponent } from "../../base/text/text.component";
import { LinkComponent } from "../../navigation/link/link.component";
import { TediTranslationPipe } from "../../../services/translation/translation.pipe";
import {
  BreakpointInput,
  BreakpointObject,
  BreakpointService,
  breakpointInput,
} from "../../../services/breakpoint/breakpoint.service";
import { generateUUID } from "../../../helpers/generate-uuid";

const DEFAULT_MAX_LENGTH = 200;
const characterSegmenter = new Intl.Segmenter(undefined, {
  granularity: "grapheme",
});

function normalizeMaxLength(
  value: BreakpointInput<number>,
): BreakpointObject<number> {
  const lengths = breakpointInput(value);
  const normalized = { ...lengths };

  for (const key of Object.keys(lengths) as (keyof typeof lengths)[]) {
    const length = lengths[key];

    if (length !== undefined) {
      normalized[key] = Number.isFinite(length)
        ? Math.max(0, Math.floor(length))
        : DEFAULT_MAX_LENGTH;
    }
  }

  return normalized;
}

@Component({
  selector: "tedi-truncate",
  standalone: true,
  templateUrl: "./truncate.component.html",
  styleUrl: "./truncate.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [TextComponent, LinkComponent, TediTranslationPipe],
  host: {
    class: "tedi-truncate",
    "[class.tedi-truncate--expanded]": "expanded()",
  },
})
export class TruncateComponent {
  /**
   * Text to display and truncate when it exceeds `maxLength`.
   */
  readonly text = input.required<string>();
  /**
   * Maximum number of text characters shown while collapsed, excluding the ellipsis.
   * Combined accents and emoji sequences count as single characters.
   * Negative values become zero, fractions round down, and non-finite values use 200.
   * Accepts a plain value or a breakpoint object, e.g. `{ xs: 100, md: 200 }`.
   * Each value applies from that breakpoint upward until overridden.
   * @default 200
   */
  readonly maxLength = input(
    { xs: DEFAULT_MAX_LENGTH },
    { transform: normalizeMaxLength },
  );
  /**
   * Text appended when content is truncated.
   * @default "..."
   */
  readonly ellipsis = input("...");
  /**
   * Shows an expand/collapse button when the text exceeds `maxLength`.
   * When false, `expanded` can still be controlled programmatically.
   * @default true
   */
  readonly expandable = input(true);
  /**
   * Whether to show the full text. Supports two-way binding with `[(expanded)]`.
   * @default false
   */
  readonly expanded = model(false);

  private readonly breakpointService = inject(BreakpointService);

  protected readonly textId = `tedi-truncate-text-${generateUUID()}`;

  protected readonly resolvedMaxLength = computed(() => {
    const value = this.maxLength();

    if (
      value.xxl !== undefined &&
      this.breakpointService.isAboveBreakpoint("xxl")()
    ) {
      return value.xxl;
    }
    if (
      value.xl !== undefined &&
      this.breakpointService.isAboveBreakpoint("xl")()
    ) {
      return value.xl;
    }
    if (
      value.lg !== undefined &&
      this.breakpointService.isAboveBreakpoint("lg")()
    ) {
      return value.lg;
    }
    if (
      value.md !== undefined &&
      this.breakpointService.isAboveBreakpoint("md")()
    ) {
      return value.md;
    }
    if (
      value.sm !== undefined &&
      this.breakpointService.isAboveBreakpoint("sm")()
    ) {
      return value.sm;
    }

    return value.xs;
  });

  private readonly characters = computed(() =>
    Array.from(
      characterSegmenter.segment(this.text()),
      ({ segment }) => segment,
    ),
  );

  protected readonly exceedsMaxLength = computed(
    () => this.characters().length > this.resolvedMaxLength(),
  );

  protected readonly isTruncated = computed(
    () => this.exceedsMaxLength() && !this.expanded(),
  );

  protected readonly showToggle = computed(
    () => this.exceedsMaxLength() && this.expandable(),
  );

  protected readonly displayText = computed(() => {
    const text = this.text();

    if (!this.isTruncated()) {
      return text;
    }

    return `${this.characters().slice(0, this.resolvedMaxLength()).join("").trimEnd()}${this.ellipsis()}`;
  });

  protected toggle(): void {
    this.expanded.update((expanded) => !expanded);
  }
}
