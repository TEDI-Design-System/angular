import {
  Component,
  input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  contentChild,
  signal,
  computed,
  model,
} from "@angular/core";
import { OverlayModule } from "@angular/cdk/overlay";
import { DropdownTriggerDirective } from "./dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "./dropdown-content/dropdown-content.component";
import { DROPDOWN_API } from "./dropdown.tokens";
import {
  OverlayPosition,
  toConnectedPositions,
} from "../overlay-position.util";

export type DropdownPosition = OverlayPosition;

let dropdownIdCounter = 0;

@Component({
  standalone: true,
  selector: "tedi-dropdown",
  imports: [OverlayModule],
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
export class DropdownComponent {
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

  readonly dropdownTrigger = contentChild.required(DropdownTriggerDirective);
  readonly dropdownContent = contentChild.required(DropdownContentComponent);

  private readonly activeIndex = signal<number | null>(null);
  readonly containerId = signal(`tedi-dropdown-${dropdownIdCounter++}`);
  readonly isOpen = signal(false);
  readonly triggerWidth = signal<number | null>(null);

  readonly overlayOrigin = computed(() => this.dropdownTrigger().overlayOrigin);

  readonly overlayPositions = computed(() =>
    toConnectedPositions(this.position(), this.preventOverflow()),
  );

  readonly triggerWidthVar = computed(() => {
    const w = this.triggerWidth();
    return w ? `${w}px` : null;
  });

  showDropdown() {
    if (this.isOpen()) return;

    const width = this.dropdownTrigger()?.host.nativeElement.offsetWidth;
    if (width) {
      this.triggerWidth.set(width);
    }

    this.isOpen.set(true);
    this.setActiveToSelectedOrFirst();
    setTimeout(() => this.focusActiveItem());
  }

  hideDropdown() {
    if (this.isOpen()) {
      this.isOpen.set(false);
      this.activeIndex.set(null);
      this.updateTabindexes();
    }
  }

  toggleDropdown() {
    if (this.isOpen()) {
      this.hideDropdown();
    } else {
      this.showDropdown();
    }
  }

  onOutsideClick() {
    this.hideDropdown();
    this.dropdownTrigger().host.nativeElement.focus();
  }

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
