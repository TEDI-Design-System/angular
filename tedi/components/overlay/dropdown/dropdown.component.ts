import {
  Component,
  input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  viewChild,
  contentChild,
  signal,
  AfterContentChecked,
  OnDestroy,
  inject,
  PLATFORM_ID,
  model,
} from "@angular/core";
import {
  NgxFloatUiContentComponent,
  NgxFloatUiModule,
  NgxFloatUiPlacements,
} from "ngx-float-ui";
import { DropdownTriggerDirective } from "./dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "./dropdown-content/dropdown-content.component";
import { isPlatformBrowser } from "@angular/common";
import { DROPDOWN_API } from "./dropdown.tokens";

export type DropdownPosition = `${NgxFloatUiPlacements}`;

@Component({
  standalone: true,
  selector: "tedi-dropdown",
  imports: [NgxFloatUiModule],
  templateUrl: "./dropdown.component.html",
  styleUrl: "./dropdown.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: DROPDOWN_API,
      useExisting: DropdownComponent,
    },
  ],
})
export class DropdownComponent implements AfterContentChecked, OnDestroy {
  /** Current value of dropdown (used with listbox) */
  readonly value = model<string>();

  /**
   * The position of the dropdown relative to the trigger element.
   * @default bottom-start
   */
  readonly position = input<DropdownPosition>("bottom-start");

  /**
   * Should position to opposite direction when overflowing screen?
   * @default true
   */
  readonly preventOverflow = input(true);

  /**
   * Append floating element to given selector.
   * Use 'body' to append at the end of DOM or empty string to append next to trigger element.
   * @default ""
   */
  readonly appendTo = input("");

  readonly dropdownTrigger = contentChild.required(DropdownTriggerDirective);
  readonly dropdownContent = contentChild.required(DropdownContentComponent);
  readonly floatUiComponent = viewChild.required(NgxFloatUiContentComponent);

  private readonly activeIndex = signal<number | null>(null);
  readonly containerId = signal("");
  readonly isContentHovered = signal(false);
  readonly floatUiDisplay = signal<"inline" | "block">("inline");

  private readonly platformId = inject(PLATFORM_ID);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener("pointerdown", this.handleOutsideClick, true);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener(
        "pointerdown",
        this.handleOutsideClick,
        true,
      );
    }
  }

  ngAfterContentChecked(): void {
    const floatUiEl = this.floatUiComponent().elRef
      .nativeElement as HTMLElement;
    const container = floatUiEl.querySelector<HTMLElement>(
      ".float-ui-container",
    );

    if (container) {
      container.setAttribute("tabindex", "-1");
      container.setAttribute("aria-labelledby", container.id + "_trigger");
      this.containerId.set(container.id);
    }
  }

  showDropdown() {
    if (this.floatUiComponent().state) return;

    this.floatUiComponent().show();
    this.floatUiDisplay.set("block");
    this.setActiveToSelectedOrFirst();

    const floatUiEl = this.floatUiComponent().elRef
      .nativeElement as HTMLElement;
    const triggerWidth = this.dropdownTrigger()?.host.nativeElement.offsetWidth;

    if (triggerWidth) {
      floatUiEl.style.setProperty(
        "--_tedi-dropdown-trigger-width",
        `${triggerWidth}px`,
      );
    }

    setTimeout(() => this.focusActiveItem());
  }

  hideDropdown() {
    if (this.floatUiComponent().state) {
      this.floatUiComponent().hide();
      this.floatUiDisplay.set("inline");
      this.activeIndex.set(null);
      this.updateTabindexes();
    }
  }

  toggleDropdown() {
    if (this.floatUiComponent().state) {
      this.hideDropdown();
    } else {
      this.showDropdown();
    }
  }

  handleOutsideClick = (event: Event) => {
    if (!this.floatUiComponent().state) return;

    const target = event.target as HTMLElement;

    const triggerEl = this.dropdownTrigger().host.nativeElement;
    const contentEl = this.floatUiComponent().elRef
      .nativeElement as HTMLElement;

    const clickedInside =
      triggerEl.contains(target) || contentEl.contains(target);

    if (!clickedInside) {
      this.hideDropdown();
      triggerEl.focus();
    }
  };

  focusFirstItem() {
    const items = this.dropdownContent().items();
    const index = items.findIndex((item) => !item.disabled());

    if (index !== -1) {
      this.activeIndex.set(index);
      this.updateTabindexes();
      items[index].focus();
    }
  }

  focusLastItem() {
    const items = this.dropdownContent().items();

    for (let i = items.length - 1; i >= 0; i--) {
      if (!items[i].disabled()) {
        this.activeIndex.set(i);
        this.updateTabindexes();
        items[i].focus();
        return;
      }
    }
  }

  setActiveToSelectedOrFirst() {
    const items = this.dropdownContent().items();
    const selectedIndex = items.findIndex(
      (item) => item.value() === this.value(),
    );

    if (selectedIndex !== -1 && !items[selectedIndex].disabled()) {
      this.activeIndex.set(selectedIndex);
      this.updateTabindexes();
      return;
    }

    const index = items.findIndex((item) => !item.disabled());

    if (index !== -1) {
      this.activeIndex.set(index);
      this.updateTabindexes();
    }
  }

  focusActiveItem() {
    const index = this.activeIndex();
    if (index == null) return;

    const items = this.dropdownContent().items();
    if (!items[index]) return;

    const el = items[index].host.nativeElement;
    el.focus();
    el.scrollIntoView({
      block: "nearest",
      inline: "nearest",
    });
  }

  focusNextItem(fromEl: HTMLLIElement) {
    const fromIndex = this.findIndexByElement(fromEl);
    if (fromIndex === -1) return;

    const nextIndex = this.getNextEnabledIndex(fromIndex);
    if (nextIndex == null) return;

    const items = this.dropdownContent().items();
    this.activeIndex.set(nextIndex);
    this.updateTabindexes();
    items[nextIndex].focus();
  }

  focusPrevItem(fromEl: HTMLLIElement) {
    const fromIndex = this.findIndexByElement(fromEl);
    if (fromIndex === -1) return;

    const prevIndex = this.getPrevEnabledIndex(fromIndex);
    if (prevIndex == null) return;

    const items = this.dropdownContent().items();
    this.activeIndex.set(prevIndex);
    this.updateTabindexes();
    items[prevIndex].focus();
  }

  updateTabindexes() {
    const items = this.dropdownContent().items();
    const role = this.dropdownContent().dropdownRole();
    const active = this.activeIndex();

    items.forEach((item, i) => {
      const el = item.host.nativeElement;

      if (i === active && !item.disabled()) {
        el.setAttribute("tabindex", "0");
      } else {
        if (role === "listbox" && item.disabled()) {
          el.removeAttribute("tabindex");
        } else {
          el.setAttribute("tabindex", "-1");
        }
      }
    });
  }

  private findIndexByElement(el: HTMLLIElement): number {
    return this.dropdownContent()
      .items()
      .findIndex((item) => item.host.nativeElement === el);
  }

  private getNextEnabledIndex(fromIndex: number): number | null {
    const items = this.dropdownContent().items();

    for (let i = fromIndex + 1; i < items.length; i++) {
      if (!items[i].disabled()) return i;
    }

    return null;
  }

  private getPrevEnabledIndex(fromIndex: number): number | null {
    const items = this.dropdownContent().items();

    for (let i = fromIndex - 1; i >= 0; i--) {
      if (!items[i].disabled()) return i;
    }

    return null;
  }
}
