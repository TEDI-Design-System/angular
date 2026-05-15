import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { IconComponent } from "../../../base/icon/icon.component";
import { TextComponent } from "../../../base/text/text.component";
import { BreakpointService } from "../../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { HeaderMobileButtonComponent } from "../header-mobile-button/header-mobile-button.component";

export type HeaderSearchMobileVariant = "modal" | "inline";

export interface HeaderSearchMobileLabels {
  /** Label shown on the mobile toggle button. Falls back to the `header.search` translation. */
  button?: string;
  /** Title shown in the mobile modal heading. Falls back to the `header.search` translation. */
  modalTitle?: string;
}

@Component({
  selector: "tedi-header-search",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    IconComponent,
    TextComponent,
    HeaderMobileButtonComponent,
  ],
  templateUrl: "./header-search.component.html",
  styleUrl: "./header-search.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: "tedi-header-search",
  },
})
export class HeaderSearchComponent {
  /**
   * Behavior on mobile viewports (below the `md` breakpoint).
   * - `'modal'` shows a toggle button that opens a fullscreen native dialog containing the projected content.
   * - `'inline'` renders the projected content inline at all breakpoints (no toggle, no dialog).
   * @default "modal"
   */
  readonly mobileVariant = input<HeaderSearchMobileVariant>("modal");

  /**
   * Mobile-specific labels for the toggle button and the modal title.
   * When omitted, both fall back to the `header.search` translation key.
   */
  readonly mobileLabels = input<HeaderSearchMobileLabels>({});

  /**
   * Disables the mobile toggle button. Has no effect on desktop or in the `inline` variant.
   * @default false
   */
  readonly disabled = input<boolean>(false);

  protected readonly translationService = inject(TediTranslationService);
  protected readonly isMobile =
    inject(BreakpointService).isBelowBreakpoint("md");

  protected readonly modalOpen = signal(false);
  protected readonly dialogEl =
    viewChild<ElementRef<HTMLDialogElement>>("dialog");

  protected readonly buttonLabel = computed(
    () =>
      this.mobileLabels()?.button ??
      this.translationService.translate("header.search"),
  );

  protected readonly modalTitle = computed(
    () =>
      this.mobileLabels()?.modalTitle ??
      this.translationService.translate("header.search"),
  );

  protected readonly closeLabel = computed(() =>
    this.translationService.translate("close"),
  );

  constructor() {
    effect(() => {
      const dialog = this.dialogEl()?.nativeElement;
      if (!dialog) return;

      if (this.modalOpen() && !dialog.open) {
        dialog.showModal();
      } else if (!this.modalOpen() && dialog.open) {
        dialog.close();
      }
    });

    effect(() => {
      if (!this.isMobile() && this.modalOpen()) {
        this.modalOpen.set(false);
      }
    });
  }

  protected open(): void {
    if (this.disabled()) return;
    this.modalOpen.set(true);
  }

  protected close(): void {
    this.modalOpen.set(false);
  }

  protected onDialogClose(): void {
    this.modalOpen.set(false);
  }
}
