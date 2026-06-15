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

export type AttachmentSize = "default" | "small";

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
    "[class.tedi-attachment--mobile]": "isMobile()",
    "[class.tedi-attachment--small]": "size() === 'small'",
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
   * Visual size. `small` tightens the content's vertical padding (4px instead
   * of 8px), pairing with small action buttons projected into the slot. The
   * action buttons themselves are consumer-controlled — set their own `size`.
   * @default "default"
   */
  size = input<AttachmentSize>("default");
  /**
   * Manually force the mobile variant on or off. When `undefined`, the
   * variant is auto-derived from the viewport breakpoint (see
   * `mobileBreakpoint`). The mobile variant uses an 8px gap and renders the
   * progress bar below the title row.
   */
  mobile = input<boolean | undefined>(undefined);
  /**
   * Viewport breakpoint below which the mobile variant kicks in when
   * `mobile` is not set explicitly.
   * @default "sm"
   */
  mobileBreakpoint = input<Breakpoint>("sm");

  private _autoMobile = computed(() => {
    return this.breakpointService.isBelowBreakpoint(this.mobileBreakpoint())();
  });

  protected isMobile = computed(() => this.mobile() ?? this._autoMobile());

  protected hasErrorVisual = computed(() => !!this.error() || this.invalid());
}
