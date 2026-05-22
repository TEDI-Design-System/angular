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
  BreakpointInputs,
  BreakpointService,
} from "../../../../services/breakpoint/breakpoint.service";
import { PopoverTriggerDirective } from "../../../overlay/popover/popover-trigger/popover-trigger.directive";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { HeaderMobileButtonComponent } from "../header-mobile-button/header-mobile-button.component";

export type HeaderProfileSize = "default" | "small";

/**
 * Subset of `HeaderProfileComponent` inputs that can be overridden per
 * breakpoint via the `[xs]` / `[sm]` / `[md]` / `[lg]` / `[xl]` / `[xxl]` inputs.
 */
export type HeaderProfileInputs = {
  label: string;
  showPopover: Breakpoint;
};

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
export class HeaderProfileComponent
  implements BreakpointInputs<HeaderProfileInputs>, AfterContentInit
{
  /**
   * Custom label text for the profile button. Falls back to the `header.profile`
   * translation key on desktop, or `header.profile.mobile` on mobile.
   */
  label = input("");

  /**
   * Whether to display a text label next to the profile icon on non-mobile
   * viewports. When `false` the desktop trigger renders as an icon-only button
   * and the label (custom or translated) is used as the `aria-label` only.
   * When `true` the label is visible and a chevron is shown next to it.
   *
   * Has no effect on the mobile/small variant — the mobile button always
   * shows its label.
   * @default false
   */
  showLabel = input<boolean>(false);
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

  xs = input<HeaderProfileInputs>();
  sm = input<HeaderProfileInputs>();
  md = input<HeaderProfileInputs>();
  lg = input<HeaderProfileInputs>();
  xl = input<HeaderProfileInputs>();
  xxl = input<HeaderProfileInputs>();

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

  protected readonly breakpointInputs = computed<HeaderProfileInputs>(() => {
    return this.breakpointService.getBreakpointInputs<HeaderProfileInputs>({
      label: this.label(),
      showPopover: this.showPopover(),
      xs: this.xs(),
      sm: this.sm(),
      md: this.md(),
      lg: this.lg(),
      xl: this.xl(),
      xxl: this.xxl(),
    });
  });

  readonly resolvedLabel = computed(() => {
    const { label } = this.breakpointInputs();
    if (label) {
      return label;
    }

    return this.translationService.translate(
      this.isMobile() ? "header.profile.mobile" : "header.profile",
    );
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

  /**
   * Tracks which `HeaderRoleComponent` instance currently has its
   * accordion open. When a role opens, it writes its own reference here;
   * other roles watch this signal and close themselves when it changes.
   * @internal
   */
  readonly activeRole = signal<unknown>(null);

  readonly buttonVariant = computed<ButtonVariant>(() => {
    if (this.isSmall() || !this.showLabel()) {
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
    const { showPopover } = this.breakpointInputs();
    if (!this.breakpointService.isAboveBreakpoint(showPopover)()) {
      this.modalOpen.update((prev) => !prev);
    }
  }
}
