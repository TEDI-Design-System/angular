import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from "@angular/core";
import {
  IconColor,
  IconComponent,
  IconSize,
} from "../../base/icon/icon.component";
import { TextComponent } from "../../base/text/text.component";

export type EmptyStateType = "separate" | "attached" | "inside";
export type EmptyStateSize = "default" | "small";

/**
 * Communicates that there is nothing to display — empty search results, an
 * unpopulated list, a freshly-created workspace — and optionally guides the
 * user toward the next step via action buttons or a link.
 *
 * Description is projected via `<ng-content>`. Actions are projected via
 * `<ng-content select="[tedi-empty-state-actions]">`.
 */
@Component({
  standalone: true,
  selector: "tedi-empty-state",
  imports: [IconComponent, TextComponent],
  templateUrl: "./empty-state.component.html",
  styleUrl: "./empty-state.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class]": "hostClasses()",
    "data-name": "tedi-empty-state",
  },
})
export class EmptyStateComponent {
  /**
   * Container variant — matches the Figma "Types" section.
   * - `'separate'` (default) — full border + radius, stands on its own.
   * - `'attached'` — top border omitted so the block sits flush beneath a
   *   preceding card or table (same width + same bottom-radius).
   * - `'inside'` — no border, no radius; intended to be placed inside another
   *   container such as a `<tedi-card>` or `<tedi-table>`.
   * @default separate
   */
  readonly type = input<EmptyStateType>("separate");

  /**
   * Padding scale. `default` = 24px, `small` = 16px.
   * @default default
   */
  readonly size = input<EmptyStateSize>("default");

  /**
   * Material icon name rendered above the text block. Pass `null` to hide.
   * @default spa
   */
  readonly icon = input<string | null>("spa");

  /**
   * Color of the icon. Defaults to brand so the empty state reads as a
   * "fresh canvas" cue rather than a destructive state.
   * @default brand
   */
  readonly iconColor = input<IconColor>("brand");

  /**
   * Size of the icon, in pixels.
   * @default 36
   */
  readonly iconSize = input<IconSize>(36);

  /**
   * Optional heading rendered above the description — appears as an `<h3>` in
   * brand-primary text color.
   */
  readonly heading = input<string | undefined>(undefined);

  protected readonly hostClasses = computed(() =>
    [
      "tedi-empty-state",
      `tedi-empty-state--${this.type()}`,
      `tedi-empty-state--${this.size()}`,
    ].join(" "),
  );
}
