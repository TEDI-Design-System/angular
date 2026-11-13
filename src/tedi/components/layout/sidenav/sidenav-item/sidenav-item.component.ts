import {
  afterNextRender,
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  OnDestroy,
  OnInit,
  Renderer2,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../../base/icon/icon.component";
import { RouterLink } from "@angular/router";
import { NgTemplateOutlet } from "@angular/common";
import { SideNavDropdownComponent } from "../sidenav-dropdown/sidenav-dropdown.component";
import { SideNavService } from "../../../../services/sidenav/sidenav.service";
import { TooltipComponent } from "../../../overlay/tooltip/tooltip.component";
import { TooltipContentComponent } from "../../../overlay/tooltip/tooltip-content/tooltip-content.component";
import { TooltipTriggerComponent } from "../../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TediTranslationPipe } from "../../../../services/translation/translation.pipe";

@Component({
  selector: "li[tedi-sidenav-item]",
  standalone: true,
  templateUrl: "./sidenav-item.component.html",
  styleUrl: "./sidenav-item.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    IconComponent,
    RouterLink,
    NgTemplateOutlet,
    TooltipComponent,
    TooltipTriggerComponent,
    TooltipContentComponent,
    TediTranslationPipe,
  ],
  host: {
    "[class]": "classes()",
  },
})
export class SideNavItemComponent
  implements AfterContentInit, AfterViewInit, OnInit, OnDestroy
{
  /**
   * Is navigation item selected
   * @default false
   */
  selected = input<boolean>(false);
  /**
   * Name of the item icon
   */
  icon = input<string>();
  /**
   * External link
   */
  href = input<string>();
  /**
   * Router link
   */
  route = input<string>();
  /**
   * Whether the item's dropdown is expanded initially (desktop only).
   * @default false
   */
  defaultOpen = input<boolean>(false);
  /**
   * Shorter label shown in place of the full text when the desktop nav is
   * collapsed to the narrow rail. Falls back to the full text when not set;
   * the hover tooltip always shows the full text.
   */
  collapsedText = input<string>();

  @ContentChild(forwardRef(() => SideNavDropdownComponent))
  dropdown?: SideNavDropdownComponent;

  textContent = signal("");

  sidenavService = inject(SideNavService);
  private readonly host = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);
  private readonly eventListeners: (() => void)[] = [];

  ngOnInit() {
    this.sidenavService.registerItem(this);
  }

  ngOnDestroy() {
    this.sidenavService.unregisterItem(this);
    this.eventListeners.forEach((unlisten) => unlisten());
  }

  ngAfterContentInit(): void {
    // Seed the initial expanded state before the first render so the dropdown
    // paints open without changing a just-checked binding.
    if (this.defaultOpen() && this.dropdown) {
      this.dropdown.open.set(true);
    }
  }

  ngAfterViewInit(): void {
    const dropdown = this.dropdown;

    if (this.host.nativeElement) {
      const hostEl = this.host.nativeElement as Element;
      const titleElement = hostEl.querySelector(".tedi-sidenav-item__text");

      if (titleElement?.textContent) {
        this.textContent.set(titleElement.textContent);
      }
    }

    if (!dropdown) {
      return;
    }

    this.eventListeners.push(
      this.renderer.listen("document", "click", (event: MouseEvent) => {
        if (this.sidenavService.isCollapsed()) {
          const target = event.target as HTMLElement;
          const clickedInsideDropdown = dropdown.element()?.contains(target);
          const clickedInsideTrigger = this.host.nativeElement.contains(target);

          if (!clickedInsideTrigger && !clickedInsideDropdown) {
            dropdown.open.set(false);
          }
        }
      }),
    );

    this.eventListeners.push(
      this.renderer.listen("document", "keydown", (event: KeyboardEvent) => {
        if (
          event.key === "Escape" &&
          this.sidenavService.isCollapsed() &&
          dropdown.open()
        ) {
          dropdown.open.set(false);
          setTimeout(() => {
            const hostEl = this.host.nativeElement as HTMLElement;
            const trigger = hostEl.querySelector(
              ".tedi-sidenav-item__title",
            ) as HTMLElement | null;
            trigger?.focus();
          }, 0);
        }
      }),
    );
  }

  classes = computed(() => {
    const classList = ["tedi-sidenav-item"];

    if (this.selected()) {
      classList.push("tedi-sidenav-item--selected");
    }

    if (this.sidenavService.isMobileItemOpen() && !this.dropdown?.open()) {
      classList.push("tedi-sidenav-item--hidden");
    }

    return classList.join(" ");
  });

  toggleDropdown() {
    if (!this.dropdown) {
      return;
    }

    const wasOpen = this.dropdown.open();
    const dropdown = this.dropdown;

    this.dropdown.open.update((prev) => !prev);

    if (this.sidenavService.isCollapsed() || this.sidenavService.isMobile()) {
      afterNextRender(
        () => {
          if (!wasOpen) {
            // Opening - focus first item in the dropdown `<ul>`.
            const openDropdown = dropdown.element();
            const allTriggers = openDropdown?.querySelectorAll(
              ".tedi-sidenav-dropdown-item__trigger",
            );
            const firstFocusable = Array.from(allTriggers ?? []).find(
              (el) => (el as HTMLElement).offsetParent !== null,
            ) as HTMLElement | null;
            firstFocusable?.focus();
          } else {
            // Closing - focus on parent item
            const hostEl = this.host.nativeElement as HTMLElement;
            const trigger = hostEl.querySelector(
              ".tedi-sidenav-item__title",
            ) as HTMLElement | null;
            trigger?.focus();
          }
        },
        { injector: this.injector },
      );
    }
  }
}
