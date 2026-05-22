import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  inject,
  input,
  output,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../base/icon/icon.component";
import { FeedbackTextComponent } from "../../form/feedback-text/feedback-text.component";
import { ProgressBarComponent } from "../progress-bar/progress-bar.component";
import {
  Breakpoint,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../services/translation/translation.service";

@Component({
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
    "[class.tedi-attachment--has-progress]": "!!projectedProgress()",
  },
})
export class AttachmentComponent {
  protected projectedProgress = contentChild(ProgressBarComponent);
  private breakpointService = inject(BreakpointService);
  private translationService = inject(TediTranslationService);

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
   * Whether to show the delete button.
   * @default true
   */
  removable = input(true, { transform: booleanAttribute });
  /**
   * Disables the delete button. The button stays visible (so the user knows
   * the file is non-removable in context), but is not interactive.
   * @default false
   */
  disabled = input(false, { transform: booleanAttribute });
  /**
   * Override the delete-button aria-label. Defaults to a translated "remove"
   * followed by the file name.
   */
  removeLabel = input<string>();
  /**
   * Manually force the mobile variant on or off. When `undefined`, the
   * variant is auto-derived from the viewport breakpoint (see
   * `mobileBreakpoint`). The mobile variant uses a 32px close button, an
   * 8px gap, and renders the progress bar below the title row.
   */
  mobile = input<boolean | undefined>(undefined);
  /**
   * Viewport breakpoint below which the mobile variant kicks in when
   * `mobile` is not set explicitly.
   * @default "sm"
   */
  mobileBreakpoint = input<Breakpoint>("sm");

  /**
   * Emits when the user clicks the delete button.
   */
  remove = output<void>();

  private _autoMobile = computed(() => {
    return this.breakpointService.isBelowBreakpoint(this.mobileBreakpoint())();
  });

  protected isMobile = computed(() => this.mobile() ?? this._autoMobile());

  protected hasErrorVisual = computed(() => !!this.error() || this.invalid());

  protected resolvedRemoveLabel = computed(() => {
    if (this.removeLabel()) return this.removeLabel()!;
    return `${this.translationService.translate("remove")} ${this.name()}`;
  });

  protected onRemove(): void {
    this.remove.emit();
  }
}
