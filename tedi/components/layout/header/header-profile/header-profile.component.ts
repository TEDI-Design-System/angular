import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  Renderer2,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { DOCUMENT, NgTemplateOutlet } from "@angular/common";
import { IconComponent } from "../../../base/icon/icon.component";
import { ShowAtDirective } from "../../../../directives/show-at/show-at.directive";
import { HideAtDirective } from "../../../../directives/hide-at/hide-at.directive";
import {
  ButtonComponent,
  ButtonVariant,
} from "../../../buttons/button/button.component";
import { PopoverComponent } from "../../../overlay/popover/popover.component";
import { PopoverContentComponent } from "../../../overlay/popover/popover-content/popover-content.component";
import {
  Breakpoint,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import { PopoverTriggerDirective } from "../../../overlay/popover/popover-trigger/popover-trigger.directive";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { HeaderMobileButtonComponent } from "../header-mobile-button/header-mobile-button.component";

export type HeaderProfileSize = "default" | "small";

@Component({
  selector: "tedi-header-profile",
  standalone: true,
  imports: [
    PopoverComponent,
    PopoverTriggerDirective,
    PopoverContentComponent,
    IconComponent,
    ButtonComponent,
    ShowAtDirective,
    HideAtDirective,
    NgTemplateOutlet,
    HeaderMobileButtonComponent,
  ],
  templateUrl: "./header-profile.component.html",
  styleUrl: "./header-profile.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderProfileComponent implements AfterContentInit {
  /**
   * Custom label text for the profile button. When provided, used as-is — not
   * translated. When omitted or empty, the desktop trigger renders as an
   * icon-only button (no visible label) and the mobile trigger falls back to
   * the `header.profile` translation key.
   */
  label = input("");
  /**
   * Defines the breakpoint from which the profile menu is displayed as a popover.
   * Below this breakpoint, it is rendered as a modal.
   *
   * @default 'lg'
   */
  showPopover = input<Breakpoint>("lg");

  /**
   * Removes default item styles from the mobile modal content. When `true`,
   * projected children render without the padding, border, or background that
   * `<tedi-header-profile>` normally applies to each direct child of the
   * modal. Use when the content requires custom item styling.
   *
   * Only affects the mobile/modal branch. The desktop popover uses
   * `<tedi-popover-content>`'s own styling and is unaffected.
   *
   * @default false
   */
  noStyle = input<boolean>(false);

  /**
   * Visual size of the profile button.
   * - `'small'` renders a compact icon-and-caption button (the
   *   `<tedi-header-mobile-button>` variant).
   * - `'default'` renders a button with the user's name + icon.
   *
   * When left unset, the size is chosen automatically based on the viewport:
   * `'small'` below the `md` breakpoint, `'default'` from `md` up. Pass an
   * explicit value to force a variant regardless of viewport.
   */
  size = input<HeaderProfileSize>();

  readonly breakpointService = inject(BreakpointService);
  readonly translationService = inject(TediTranslationService);
  private readonly document = inject(DOCUMENT);
  private readonly host = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly eventListeners: (() => void)[] = [];

  readonly isMobile = computed(() =>
    this.breakpointService.isBelowBreakpoint("md")(),
  );

  readonly isSmall = computed(() => {
    const size = this.size() ?? (this.isMobile() ? "small" : "default");
    return size === "small";
  });

  readonly resolvedLabel = computed(() => {
    if (this.label()) {
      return this.label();
    }

    return this.translationService.translate("header.profile");
  });

  constructor() {
    effect(() => {
      if (this.modalOpen()) {
        this.renderer.setStyle(this.document.body, "overflow", "hidden");
      } else {
        this.renderer.removeStyle(this.document.body, "overflow");
      }
    });
  }

  modalOpen = signal(false);

  readonly buttonVariant = computed<ButtonVariant>(() => {
    if (this.isSmall() || !this.label()) {
      return "neutral";
    }

    return "secondary";
  });

  ngAfterContentInit(): void {
    const element = this.host.nativeElement as HTMLElement;

    this.eventListeners.push(
      this.renderer.listen("document", "click", (event: MouseEvent) => {
        const target = event.target as HTMLElement;
        const clickedInside = element.contains(target);

        if (this.modalOpen() && !clickedInside) {
          this.modalOpen.set(false);
        }
      }),
    );
  }

  handleModalOpen() {
    if (!this.breakpointService.isAboveBreakpoint(this.showPopover())()) {
      this.modalOpen.update((prev) => !prev);
    }
  }
}
