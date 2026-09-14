import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { LiveAnnouncer } from "@angular/cdk/a11y";
import { TediTranslationService } from "../../../services/translation/translation.service";

@Component({
  standalone: true,
  selector: "tedi-skeleton",
  templateUrl: "./skeleton.component.html",
  styleUrl: "./skeleton.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-skeleton",
    "aria-busy": "true",
  },
})
export class SkeletonComponent implements OnInit, OnDestroy {
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly translationService = inject(TediTranslationService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /**
   * Announced by the skeleton's `role="status"` live region once the skeleton
   * has been on screen for `labelDelay`. Say what is loading: "Loading search
   * results" carries more than the generic fallback.
   * @default the translated `skeleton.loading` label
   */
  label = input<string>();
  /**
   * Announced when the skeleton is removed. The skeleton's own live region goes
   * with it, so this one goes through a page-level announcer. Only announced if
   * `label` was announced first, so content that arrives faster than
   * `labelDelay` stays silent.
   * @default the translated `skeleton.loading-completed` label
   */
  completedLabel = input<string>();
  /**
   * Delay in ms before `label` is announced, so brief loads do not interrupt
   * the screen reader.
   * @default 200
   */
  labelDelay = input(200);

  /**
   * Text of the `role="status"` live region. Empty until `labelDelay` has
   * passed, so the region is in the DOM before it gains text: screen readers
   * only announce a live region they were already tracking.
   */
  protected readonly announcement = signal("");

  private announceTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    if (!this.isBrowser) {
      return;
    }

    this.announceTimer = setTimeout(() => {
      this.announcement.set(
        this.label() ?? this.translationService.translate("skeleton.loading"),
      );
    }, this.labelDelay());
  }

  ngOnDestroy(): void {
    clearTimeout(this.announceTimer);

    if (!this.announcement()) {
      return;
    }

    this.liveAnnouncer.announce(
      this.completedLabel() ??
        this.translationService.translate("skeleton.loading-completed"),
    );
  }
}
