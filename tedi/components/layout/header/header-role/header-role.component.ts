import { NgFor, NgIf, NgTemplateOutlet } from "@angular/common";
import { _IdGenerator } from "@angular/cdk/a11y";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  ViewEncapsulation,
  viewChild,
} from "@angular/core";
import { HeaderRoleTitleDirective } from "./header-role-title.directive";
import { IconComponent } from "../../../base/icon/icon.component";
import { TextComponent } from "../../../base/text/text.component";
import { ShowAtDirective } from "../../../../directives/show-at/show-at.directive";
import { HideAtDirective } from "../../../../directives/hide-at/hide-at.directive";
import { ButtonComponent } from "../../../buttons/button/button.component";
import { BreakpointService } from "../../../../services/breakpoint/breakpoint.service";
import { TediTranslationService } from "../../../../services/translation/translation.service";
import { PopoverComponent } from "../../../overlay/popover/popover.component";
import { PopoverTriggerDirective } from "../../../overlay/popover/popover-trigger/popover-trigger.directive";
import { PopoverContentComponent } from "../../../overlay/popover/popover-content/popover-content.component";
import { SeparatorComponent } from "../../../helpers/separator/separator.component";
import { IconSize } from "../../../base/icon/icon.component";
import { HeaderProfileComponent } from "../header-profile/header-profile.component";

export type RepresentativeIcon = {
  /** Material Icon name. */
  name: string;
  /** Size in px. Falls back to `<tedi-icon>`'s default (24) when omitted. */
  size?: IconSize;
};

export type Representative = {
  /**
   * Stable identifier. Required for selection comparison and for re-syncing
   * the current representative when the `representatives` input changes.
   */
  id: string;
  name: string;
  /**
   * Icon shown next to the representative. Accepts either a Material Icon name
   * as a string (`'person'`) for the common case, or a full
   * `RepresentativeIcon` object (`{ name: 'person', size: 18 }`) when an
   * explicit size is needed. The two forms are equivalent when only `name` is
   * relevant.
   */
  icon?: string | RepresentativeIcon;
  description?: string;
};

@Component({
  selector: "tedi-header-role",
  standalone: true,
  imports: [
    NgFor,
    NgIf,
    NgTemplateOutlet,
    PopoverComponent,
    PopoverTriggerDirective,
    PopoverContentComponent,
    IconComponent,
    ButtonComponent,
    TextComponent,
    ShowAtDirective,
    HideAtDirective,
    SeparatorComponent,
  ],
  templateUrl: "./header-role.component.html",
  styleUrl: "./header-role.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-header-role",
  },
})
export class HeaderRoleComponent {
  /**
   * Label text. Rendered as bold text in the title position when no title content is
   * projected via `[tedi-header-role-title]`. Projected content takes precedence and
   * replaces this string.
   */
  label = input("");
  /**
   * Description text
   */
  description = input("");

  /**
   * Whether the consumer projected title content (e.g. `<tedi-tag tedi-header-role-title>`)
   * via the `[tedi-header-role-title]` slot. Used by the template to know whether the
   * title position has content even when `label` is empty.
   */
  protected readonly titleContent = contentChild(HeaderRoleTitleDirective);
  protected readonly hasTitle = computed(() => !!this.titleContent());
  /** Should show input in representative list?
   * @default false
   */
  showInput = input(false);
  /** List of representatives */
  representatives = input.required<Representative[]>();
  /** Current representative */
  currentRepresentative = model.required<Representative>();

  /**
   * Emits when the role selection (mobile collapse on tablet/mobile, popover on
   * desktop) opens or closes.
   */
  readonly roleSelectionToggle = output<boolean>();

  mobileOpen = signal(false);
  inputValue = signal("");

  protected readonly inputId = inject(_IdGenerator).getId(
    "tedi-header-role-input-",
  );

  readonly breakpointService = inject(BreakpointService);
  readonly isTabletView = computed(() =>
    this.breakpointService.isBelowBreakpoint("lg")(),
  );

  protected readonly hasMultipleRepresentatives = computed(
    () => this.representatives().length > 1,
  );

  private readonly popover = viewChild(PopoverComponent);

  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>("searchInput");

  private previousPopoverOpen: boolean | undefined;

  private readonly parentProfile = inject(HeaderProfileComponent, {
    optional: true,
  });

  constructor() {
    effect(() => {
      if (this.popover()?.isOpen() && this.showInput()) {
        setTimeout(() => this.searchInput()?.nativeElement.focus());
      }
    });

    effect(() => {
      const popover = this.popover();
      if (!popover) return;
      const isOpen = popover.isOpen();
      if (
        this.previousPopoverOpen !== undefined &&
        this.previousPopoverOpen !== isOpen
      ) {
        this.roleSelectionToggle.emit(isOpen);
      }
      this.previousPopoverOpen = isOpen;
    });

    if (this.parentProfile) {
      effect(() => {
        if (!this.parentProfile!.modalOpen()) {
          this.mobileOpen.set(false);
          this.inputValue.set("");
        }
      });
    }
  }

  translationService = inject(TediTranslationService);
  switchRoleText = this.translationService.track("header.role-switch");
  closeText = this.translationService.track("close");
  searchText = this.translationService.track("header.role-search");
  noResultsText = this.translationService.track(
    "header.role-no-representatives",
  );
  collapseText = computed(() =>
    this.mobileOpen() ? this.closeText() : this.switchRoleText(),
  );

  filteredRepresentatives = computed(() => {
    return this.representatives().filter((r) => {
      if (!this.inputValue()) {
        return true;
      }

      const nameMatches = r.name
        .toLowerCase()
        .includes(this.inputValue().toLowerCase());
      const descriptionMatches =
        r.description
          ?.toLowerCase()
          .includes(this.inputValue().toLowerCase()) ?? false;

      return nameMatches || descriptionMatches;
    });
  });

  handleMobileOpen() {
    this.mobileOpen.update((prev) => !prev);
    this.roleSelectionToggle.emit(this.mobileOpen());
  }

  handleSelectRepresentative(r: Representative) {
    this.currentRepresentative.set(r);
    this.popover()?.hidePopover();
  }

  handleInputChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.inputValue.set(value);
  }

  trackById = (_: number, r: Representative) => r.id;

  protected resolveIcon(
    icon: string | RepresentativeIcon | undefined,
  ): { name: string; size: IconSize } | null {
    if (!icon) return null;
    if (typeof icon === "string") return { name: icon, size: 24 };
    return { name: icon.name, size: icon.size ?? 24 };
  }
}
