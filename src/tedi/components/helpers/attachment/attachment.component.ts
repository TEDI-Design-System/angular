import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../base/icon/icon.component";
import { FeedbackTextComponent } from "../../form/feedback-text/feedback-text.component";
import { ProgressBarComponent } from "../../loader/progress-bar/progress-bar.component";
import {
  Breakpoint,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";

export type AttachmentDirection = "horizontal" | "vertical";

@Component({
  standalone: true,
  selector: "tedi-attachment",
  imports: [IconComponent, FeedbackTextComponent],
  templateUrl: "./attachment.component.html",
  styleUrl: "./attachment.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class.tedi-attachment]": "true",
    "[class.tedi-attachment--error]": "hasErrorVisual()",
    "[class.tedi-attachment--vertical]": "isVertical()",
    "[class.tedi-attachment--has-progress]": "!!projectedProgress()",
  },
})
export class AttachmentComponent {
  protected projectedProgress = contentChild(ProgressBarComponent);
  private breakpointService = inject(BreakpointService);

  /**
   * File name to display.
   */
  name = input.required<string>();
  /**
   * Pre-formatted file size string (e.g. `"0.9 MB"`). Consumer formats the
   * value; the component renders it as-is to the right of the name.
   */
  fileSize = input<string>();
  /**
   * Leading file-type icon shown before the file name. Pass a Material Symbol
   * name (e.g. `"description"`, `"picture_as_pdf"`, `"imagesmode"`).
   */
  icon = input<string>();
  /**
   * Error feedback message. When set, the attachment switches to its error
   * visual: red card background, error icon next to the name, and the
   * message rendered as feedback text below the card. Implies `invalid`.
   */
  error = input<string>();
  /**
   * Mark the attachment as invalid. Switches to the error visual (red card
   * background, error icon next to the name) but does **not** render any
   * feedback text below the card. Use when the validation message is
   * shown elsewhere (e.g. as an aggregate error on the parent control).
   * Implied automatically when `error` is set.
   * @default false
   */
  invalid = input(false, { transform: booleanAttribute });
  /**
   * Content layout direction.
   * - `horizontal` – name/size and progress sit on a single row beside the
   *   actions (the default desktop layout).
   * - `vertical` – name, size and progress stack in a column with the actions
   *   pinned top-right. Useful in narrow containers (mobile, sidebars).
   *
   * When `undefined`, the direction is auto-derived from the viewport: it
   * switches to `vertical` below the `verticalBelow` breakpoint.
   */
  direction = input<AttachmentDirection | undefined>(undefined);
  /**
   * Viewport breakpoint below which the layout auto-switches to `vertical`
   * when `direction` is not set explicitly.
   * @default "sm"
   */
  verticalBelow = input<Breakpoint>("sm");

  private _autoVertical = computed(() => {
    return this.breakpointService.isBelowBreakpoint(this.verticalBelow())();
  });

  protected isVertical = computed(
    () =>
      (this.direction() ??
        (this._autoVertical() ? "vertical" : "horizontal")) === "vertical",
  );

  protected hasErrorVisual = computed(() => !!this.error() || this.invalid());
}
