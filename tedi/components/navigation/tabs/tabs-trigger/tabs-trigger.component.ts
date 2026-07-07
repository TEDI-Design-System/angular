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
 * A single tab button inside `tedi-tabs-list`. Applied to a native `<button>`
 * so it inherits native focus, disabled and activation behaviour.
 */
@Component({
  selector: "button[tedi-tabs-trigger]",
  standalone: true,
  imports: [IconComponent],
  templateUrl: "./tabs-trigger.component.html",
  styleUrl: "./tabs-trigger.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-tabs-trigger",
    type: "button",
    role: "tab",
    "[id]": "id()",
    "[disabled]": "disabled()",
    "[attr.aria-selected]": "isSelected()",
    "[attr.aria-controls]": "id() + '-panel'",
    "[attr.tabindex]": "isSelected() ? 0 : -1",
    "[attr.data-name]": "'tabs-trigger'",
    "[class.tedi-tabs-trigger--selected]": "isSelected()",
    "(click)": "handleClick()",
    "(keydown)": "handleKeydown($event)",
  },
})
export class TabsTriggerComponent {
  private readonly tabs = inject(TabsComponent);
  private readonly host =
    inject<ElementRef<HTMLButtonElement>>(ElementRef);

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

  handleClick(): void {
    if (!this.disabled()) {
      this.tabs.select(this.id());
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    const target = navigateTablist(event);
    if (target) {
      this.tabs.select(target.id);
    }
  }
}
