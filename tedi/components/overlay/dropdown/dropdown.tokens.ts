import { InjectionToken, Signal, WritableSignal } from "@angular/core";

export interface DropdownApi {
  /** Current value of the dropdown. Used to track the selected option in listbox mode. */
  value: WritableSignal<string | undefined>;
  /** ID of the float-ui container element. Used to link trigger and content for accessibility. */
  containerId: WritableSignal<string>;
  /** Move focus to the next enabled item after the given element. */
  focusNextItem(fromEl: HTMLLIElement): void;
  /** Move focus to the previous enabled item before the given element. */
  focusPrevItem(fromEl: HTMLLIElement): void;
  /** Move focus to the first enabled item in the dropdown. */
  focusFirstItem(): void;
  /** Move focus to the last enabled item in the dropdown. */
  focusLastItem(): void;
  /** Close the dropdown and reset active item state. */
  hideDropdown(): void;
  /** Reference to the dropdown trigger directive. Used to read trigger dimensions and return focus. */
  dropdownTrigger(): { host: { nativeElement: HTMLElement } } | undefined;
}

export const DROPDOWN_API = new InjectionToken<DropdownApi>("DropdownApi");

export interface DropdownContentApi {
  /** The ARIA role of the dropdown content. Determines keyboard interaction and accessibility semantics. */
  dropdownRole: Signal<"menu" | "listbox">;
}

export const DROPDOWN_CONTENT_API = new InjectionToken<DropdownContentApi>(
  "DropdownContentApi",
);
