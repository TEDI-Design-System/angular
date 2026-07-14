import {
  Component,
  forwardRef,
  input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  contentChild,
  signal,
  computed,
  OnDestroy,
  inject,
  PLATFORM_ID,
  model,
  Renderer2,
} from "@angular/core";
import { OverlayModule } from "@angular/cdk/overlay";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { DropdownTriggerDirective } from "./dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "./dropdown-content/dropdown-content.component";
import { DROPDOWN_API } from "./dropdown.tokens";
import { getFocusableElements } from "../../../utils/elements.util";
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
      useExisting: forwardRef(() => DropdownComponent),
    },
  ],
})
export class DropdownComponent implements OnDestroy {
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
   * Gap in px between the trigger and the dropdown panel.
   * @default 4
   */
  readonly offset = input(4);

  /**
   * Does the dropdown hide when the page scrolls?
   * @default false
   */
  readonly hideOnScroll = input(false);

  readonly dropdownTrigger = contentChild.required(DropdownTriggerDirective);
  readonly dropdownContent = contentChild.required(DropdownContentComponent);

  private readonly activeIndex = signal<number | null>(null);
  readonly containerId = signal(`tedi-dropdown-${dropdownIdCounter++}`);
  readonly isOpen = signal(false);
  readonly triggerWidth = signal<number | null>(null);

  readonly overlayOrigin = computed(() => this.dropdownTrigger().overlayOrigin);

  readonly overlayPositions = computed(() => {
    const offset = this.offset();
    return toConnectedPositions(this.position(), this.preventOverflow()).map(
      (pos) => ({
        ...pos,
        offsetX: pos.offsetX ? Math.sign(pos.offsetX) * offset : pos.offsetX,
        offsetY: pos.offsetY ? Math.sign(pos.offsetY) * offset : pos.offsetY,
      }),
    );
  });

  readonly triggerWidthVar = computed(() => {
    const w = this.triggerWidth();
    return w ? `${w}px` : null;
  });

  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(Renderer2);
  private scrollListener?: () => void;
  private skipNextGestureOutsideClick = false;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener("focusin", this.handleFocusOut, true);
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener("focusin", this.handleFocusOut, true);
    }
    this.cleanupScrollListener();
  }

  showDropdown(initialFocus: "selected" | "first" | "last" = "selected") {
    if (this.isOpen()) return;

    const width = this.dropdownTrigger()?.host.nativeElement.offsetWidth;
    if (width) {
      this.triggerWidth.set(width);
    }

    this.isOpen.set(true);
    this.skipNextGestureOutsideClick = true;
    this.setActiveToSelectedOrFirst();

    if (this.hideOnScroll()) {
      this.setupScrollListener();
    }

    // Deferred so the overlay content is attached before focusing
    setTimeout(() => {
      if (initialFocus === "first") {
        this.focusFirstItem();
      } else if (initialFocus === "last") {
        this.focusLastItem();
      } else {
        this.focusActiveItem();
      }
    });
  }

  hideDropdown() {
    if (this.isOpen()) {
      this.cleanupScrollListener();
      this.isOpen.set(false);
      this.skipNextGestureOutsideClick = false;
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

  onOutsideClick(event?: MouseEvent) {
    const isGestureEnd = !!event && (event.type !== "click" || event.ctrlKey);
    if (this.skipNextGestureOutsideClick) {
      this.skipNextGestureOutsideClick = false;
      if (isGestureEnd) return;
    }

    this.hideDropdown();
  }

  handleFocusOut = (event: FocusEvent) => {
    if (!this.isOpen()) return;

    const target = event.target as HTMLElement;

    const triggerEl = this.dropdownTrigger().host.nativeElement;
    const contentEl = this.dropdownContent().host.nativeElement;

    const focusedInside =
      triggerEl.contains(target) || contentEl.contains(target);

    if (!focusedInside) {
      this.hideDropdown();
    }
  };

  tabOutOfDropdown(shiftKey: boolean) {
    const triggerEl = this.dropdownTrigger().focusableElement;
    const contentEl = this.dropdownContent().host.nativeElement;

    const focusable = getFocusableElements(this.document.body).filter(
      (el) => !contentEl.contains(el),
    );
    const triggerIndex = focusable.indexOf(triggerEl);
    const next = shiftKey
      ? focusable[triggerIndex - 1]
      : focusable[triggerIndex + 1];

    this.hideDropdown();

    if (next) {
      setTimeout(() => next.focus());
    }
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

  private setupScrollListener() {
    this.cleanupScrollListener();

    this.scrollListener = this.renderer.listen(
      this.document,
      "scroll",
      () => {
        if (this.isOpen()) {
          this.hideDropdown();
        }
      },
      { capture: true, passive: true },
    );
  }

  private cleanupScrollListener() {
    if (this.scrollListener) {
      this.scrollListener();
      this.scrollListener = undefined;
    }
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
