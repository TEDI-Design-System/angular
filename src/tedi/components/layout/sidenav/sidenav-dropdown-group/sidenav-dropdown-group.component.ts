import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  OnDestroy,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { IconComponent } from "../../../base/icon/icon.component";
import { SideNavService } from "../../../../services/sidenav/sidenav.service";

@Component({
  selector: "li[tedi-sidenav-dropdown-group]",
  standalone: true,
  templateUrl: "./sidenav-dropdown-group.component.html",
  styleUrl: "./sidenav-dropdown-group.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [IconComponent],
  host: {
    "[class]": "hostClass()",
  },
})
export class SideNavDropdownGroupComponent implements AfterViewInit, OnDestroy {
  private readonly host = inject(ElementRef);
  protected readonly sidenavService = inject(SideNavService);

  /** Whether the group is drilled open (3rd-level mobile panel). */
  open = signal(false);
  /** Whether the projected parent is a link (`<a>`) rather than a plain heading. */
  protected readonly isParentLink = signal(false);

  /**
   * A non-link group parent is a drillable heading on mobile — tapping it opens
   * a 3rd-level panel. A link parent stays inline with its children.
   */
  protected readonly isDrillable = computed(
    () => this.sidenavService.isMobile() && !this.isParentLink(),
  );

  /**
   * The parent is an interactive drill trigger only while it's still collapsed.
   * Once drilled open it becomes the panel's static heading — not clickable and
   * with no hover — so navigating back happens via the back buttons.
   */
  protected readonly isDrillTrigger = computed(
    () => this.isDrillable() && !this.open(),
  );

  protected readonly hostClass = computed(() => {
    const classList = [
      "tedi-sidenav-dropdown-group",
      "tedi-sidenav-dropdown-group__parent-wrapper",
    ];

    if (!this.isParentLink()) {
      classList.push("tedi-sidenav-dropdown-group--parent-plain");
    }

    if (this.open()) {
      classList.push("tedi-sidenav-dropdown-group--open");
    }

    return classList.join(" ");
  });

  // Detect whether the projected parent is a link so the group can decide between
  // inline (link) and drillable (non-link) mobile modes.
  ngAfterViewInit(): void {
    const trigger = (this.host.nativeElement as HTMLElement).querySelector(
      ".tedi-sidenav-dropdown-group__parent .tedi-sidenav-dropdown-item__trigger",
    );
    this.isParentLink.set(trigger?.tagName === "A");
  }

  ngOnDestroy(): void {
    this.sidenavService.clearOpenGroup(this);
  }

  toggle(): void {
    const next = !this.open();
    this.open.set(next);

    if (next) {
      this.sidenavService.setOpenGroup(this);
    } else {
      this.sidenavService.clearOpenGroup(this);
    }
  }
}
