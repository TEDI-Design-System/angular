import { NgFor, NgIf, NgTemplateOutlet } from "@angular/common";
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  Directive,
  effect,
  ElementRef,
  inject,
  input,
  model,
  output,
  signal,
  TemplateRef,
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

/**
 * Structural marker for custom content projected into the role selection
 * popover (desktop) or accordion (tablet/mobile).
 *
 * When present, replaces the default representative list entirely.
 *
 * Usage:
 * ```html
 * <tedi-header-role ...>
 *   <ng-template tedi-header-role-content>
 *     <div>Custom content here</div>
 *   </ng-template>
 * </tedi-header-role>
 * ```
 */
@Directive({
  selector: "[tedi-header-role-content]",
  standalone: true,
})
export class HeaderRoleContentDirective {
  readonly templateRef = inject(TemplateRef);
}

/**
 * Structural marker for custom "no results" content shown when the search
 * filter produces an empty representative list.
 *
 * When absent, the component falls back to a default translated string.
 *
 * Usage:
 * ```html
 * <tedi-header-role ...>
 *   <ng-template tedi-header-role-no-results>
 *     <tedi-empty-state description="No matches found" />
 *   </ng-template>
 * </tedi-header-role>
 * ```
 */
@Directive({
  selector: "[tedi-header-role-no-results]",
  standalone: true,
})
export class HeaderRoleNoResultsDirective {
  readonly templateRef = inject(TemplateRef);
}

let nextHeaderRoleInputId = 0;

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

  /**
   * Projected custom content that replaces the default representative list.
   */
  protected readonly customContent = contentChild(HeaderRoleContentDirective);
  protected readonly hasCustomContent = computed(() => !!this.customContent());
  protected readonly customContentTemplate = computed(
    () => this.customContent()?.templateRef ?? null,
  );

  protected readonly noResultsContent = contentChild(
    HeaderRoleNoResultsDirective,
  );
  protected readonly hasNoResultsContent = computed(
    () => !!this.noResultsContent(),
  );
  protected readonly noResultsTemplate = computed(
    () => this.noResultsContent()?.templateRef ?? null,
  );
  /**
   * Whether to display the search input above the representative list.
   * @default false
   */
  showSearch = input(false);
  /**
   * Whether the search input shows a clear button.
   * @default false
   */
  searchClearable = input(false);
  /**
   * Whether to clear the search input when a representative is selected.
   * @default true
   */
  clearSearchOnSelect = input(true);
  /**
   * Whether the role represents an organization.
   * Affects the search input label.
   */
  isOrganization = input(false);
  /**
   * Label for the search input when selecting a representative.
   * Falls back to i18n labels when not provided.
   */
  searchLabel = input<string | undefined>(undefined);
  /**
   * Label for the search input when selecting an organization representative.
   * Overrides both the default and `searchLabel` when `isOrganization` is true.
   */
  organizationSearchLabel = input<string | undefined>(undefined);
  /**
   * Whether to show the role selection toggle and dropdown.
   * When not set, defaults to showing the selection when there are multiple representatives.
   */
  showRoleSwitch = input<boolean | undefined>(undefined);
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

  protected readonly inputId = `tedi-header-role-input-${nextHeaderRoleInputId++}`;

  readonly breakpointService = inject(BreakpointService);
  readonly isTabletView = computed(() =>
    this.breakpointService.isBelowBreakpoint("lg")(),
  );

  protected readonly hasRoleSelection = computed(
    () => this.showRoleSwitch() ?? this.representatives().length > 1,
  );

  private readonly popover = viewChild(PopoverComponent);

  private readonly searchInput =
    viewChild<ElementRef<HTMLInputElement>>("searchInput");

  private previousPopoverOpen: boolean | undefined;

  private readonly parentProfile = inject(HeaderProfileComponent, {
    optional: true,
  });

  constructor() {
    // `setTimeout` (not `queueMicrotask` / `afterNextRender`) is deliberate:
    // PopoverComponent's `showPopover()` queues its own
    // `setTimeout(() => container.focus(...))` to focus the floating-UI
    // overlay container (popover.component.ts:144). Queuing our input focus
    // via `setTimeout` puts it AFTER the popover's task in the macrotask
    // queue, so we focus the search input last and the popover doesn't steal
    // focus back. Microtask-/render-tier alternatives fire BEFORE the
    // popover's setTimeout and cause focus loss.
    effect(() => {
      if (this.popover()?.isOpen() && this.showSearch()) {
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

      effect(() => {
        const active = this.parentProfile!.activeRole();
        const isOpen = this.mobileOpen();
        this.closeIfOtherRoleActive(active, isOpen);
      });
    }
  }

  translationService = inject(TediTranslationService);
  switchRoleText = this.translationService.track("header.role-switch");
  closeText = this.translationService.track("close");
  private defaultSearchText =
    this.translationService.track("header.role-search");
  private defaultOrgSearchText = this.translationService.track(
    "header.role-search.organization",
  );
  searchText = computed(() =>
    this.isOrganization()
      ? (this.organizationSearchLabel() ?? this.defaultOrgSearchText())
      : (this.searchLabel() ?? this.defaultSearchText()),
  );
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

  closeIfOtherRoleActive(active: unknown, isOpen: boolean): void {
    if (active !== null && active !== this && isOpen) {
      this.mobileOpen.set(false);
      this.inputValue.set("");
    }
  }

  handleMobileOpen() {
    this.mobileOpen.update((prev) => !prev);
    this.roleSelectionToggle.emit(this.mobileOpen());

    if (this.mobileOpen() && this.parentProfile) {
      this.parentProfile.activeRole.set(this);
    }
  }

  handleSelectRepresentative(r: Representative) {
    this.currentRepresentative.set(r);

    if (this.clearSearchOnSelect()) {
      this.inputValue.set("");
    }

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
