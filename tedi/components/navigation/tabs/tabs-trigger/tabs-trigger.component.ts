import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
} from "@angular/core";
import { IconComponent } from "../../../base/icon/icon.component";
import { TabsComponent } from "../tabs.component";
import { navigateTablist } from "../tabs-helpers";

/**
 * A single tab inside `tedi-tabs-list`. Applied to a native `<button>` (in-page
 * tab) or `<a>` (a tab that navigates to a route — add `href`/`routerLink`).
 * The anchor form keeps the same `role="tab"` semantics but is a real link, so
 * it works with keyboard/new-tab/copy-link as WCAG expects for navigation.
 */
@Component({
  selector: "button[tedi-tabs-trigger], a[tedi-tabs-trigger]",
  standalone: true,
  imports: [IconComponent],
  templateUrl: "./tabs-trigger.component.html",
  styleUrl: "./tabs-trigger.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-tabs-trigger",
    role: "tab",
    "[attr.type]": "isAnchor ? null : 'button'",
    "[id]": "id()",
    "[attr.disabled]": "!isAnchor && disabled() ? '' : null",
    "[attr.aria-disabled]": "isAnchor && disabled() ? 'true' : null",
    "[attr.aria-selected]": "isSelected()",
    "[attr.aria-controls]": "id() + '-panel'",
    "[attr.tabindex]": "tabIndex()",
    "[attr.data-name]": "'tabs-trigger'",
    "[class.tedi-tabs-trigger--selected]": "isSelected()",
    "[class.tedi-tabs-trigger--disabled]": "disabled()",
    "(click)": "handleClick($event)",
    "(keydown)": "handleKeydown($event)",
  },
})
export class TabsTriggerComponent {
  private readonly tabs = inject(TabsComponent);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Whether the trigger is rendered as an anchor (`<a>`) rather than a button. */
  readonly isAnchor = this.host.nativeElement.tagName === "A";

  /**
   * Unique identifier for this tab. Used as the element id and to link to the
   * corresponding `tedi-tabs-content` panel (`aria-controls="{id}-panel"`).
   */
  readonly id = input.required<string>();
  /** Icon displayed before the label. */
  readonly icon = input<string>();
  /** Whether the tab is disabled. */
  readonly disabled = input(false);

  readonly isSelected = computed(() => this.tabs.activeTab() === this.id());

  readonly tabIndex = computed(() => {
    if (this.disabled()) return -1;
    return this.isSelected() ? 0 : -1;
  });

  /** Plain-text label, used as the accessible name of the overflow dropdown item. */
  get label(): string {
    return this.host.nativeElement.textContent?.trim() ?? "";
  }

  get contentNodes(): Node[] {
    return Array.from(this.host.nativeElement.childNodes).map((node) =>
      node.cloneNode(true),
    );
  }

  /** Scrolls this trigger into view within a horizontally scrolling tablist. */
  scrollIntoView(): void {
    this.host.nativeElement.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }

  handleClick(event?: Event): void {
    if (this.disabled()) {
      // Buttons are inert via the disabled attribute; a disabled anchor is kept
      // unreachable via `pointer-events: none` + `tabindex="-1"`. preventDefault
      // is a final guard against native href traversal. (A consumer-supplied
      // `routerLink` navigates from its own click handler and can't be blocked
      // here — bind `[routerLink]` to null while disabled, see docs.)
      event?.preventDefault();
      return;
    }

    // An anchor opened in another browsing context — a modifier/middle click or
    // target="_blank" — must not change the active tab in this view. Let the
    // browser (or RouterLink, which also skips modifier clicks) handle it.
    if (this.isAnchor && this.opensInNewBrowsingContext(event)) {
      return;
    }

    this.tabs.select(this.id());
  }

  private opensInNewBrowsingContext(event?: Event): boolean {
    if (
      event instanceof MouseEvent &&
      (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey)
    ) {
      return true;
    }
    const target = (this.host.nativeElement as HTMLAnchorElement).target;
    return target !== "" && target !== "_self";
  }

  handleKeydown(event: KeyboardEvent): void {
    // Anchors don't activate on Space natively; the tab pattern expects it to,
    // so forward it to a click (which drives routerLink/href navigation).
    if (this.isAnchor && event.key === " ") {
      event.preventDefault();
      if (!this.disabled()) {
        this.host.nativeElement.click();
      }
      return;
    }

    const target = navigateTablist(event);
    if (target) {
      // Automatic activation for button tabs — activation just toggles an
      // in-page panel. Anchor tabs navigate, so use manual activation: arrows
      // only move focus and the user presses Enter/Space to follow the link
      // (APG's recommended mode when activation is disruptive).
      if (target.tagName !== "A") {
        this.tabs.select(target.id);
      }
    }
  }
}
