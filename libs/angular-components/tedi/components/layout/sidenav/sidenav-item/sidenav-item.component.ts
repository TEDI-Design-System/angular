import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChild,
  ElementRef,
  inject,
  input,
  Renderer2,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../../base/icon/icon.component";
import { RouterLink } from "@angular/router";
import { NgIf, NgTemplateOutlet } from "@angular/common";
import { SideNavDropdownComponent } from "../sidenav-dropdown/sidenav-dropdown.component";
import { SideNavComponent } from "../sidenav.component";
import { SideNavGroupTitleComponent } from "../sidenav-group-title/sidenav-group-title.component";

@Component({
  selector: "tedi-sidenav-item",
  standalone: true,
  templateUrl: "./sidenav-item.component.html",
  styleUrl: "./sidenav-item.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [
    IconComponent,
    RouterLink,
    NgTemplateOutlet,
    NgIf,
    SideNavGroupTitleComponent,
  ],
  host: {
    "[class]": "classes()",
  },
})
export class SideNavItemComponent implements AfterViewInit {
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
  routerLink = input<string>();

  @ContentChild(SideNavDropdownComponent) dropdown?: SideNavDropdownComponent;

  textContent = signal("");

  private readonly host = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly eventListeners: (() => void)[] = [];
  private sidenav = inject(SideNavComponent, { host: true });

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
        if (this.sidenav.isCollapsed()) {
          const target = event.target as HTMLElement;
          const clickedInsideDropdown = dropdown.element()?.contains(target);
          const clickedInsideTrigger = this.host.nativeElement.contains(target);

          if (!clickedInsideTrigger && !clickedInsideDropdown) {
            dropdown.open.set(false);
          }
        }
      }),
    );
  }

  classes = computed(() => {
    const classList = ["tedi-sidenav-item"];

    if (this.selected()) {
      classList.push("tedi-sidenav-item--selected");
    }

    if (this.sidenav.isMobileMenuOpen() && !this.dropdown?.open()) {
      classList.push("tedi-sidenav-item--hidden");
    }

    return classList.join(" ");
  });

  toggleDropdown() {
    if (!this.dropdown) {
      return;
    }

    this.dropdown.open.update((prev) => !prev);
  }
}
