import { InjectionToken, Signal, WritableSignal } from "@angular/core";

export interface DropdownApi {
  value: WritableSignal<string | undefined>;
  containerId: WritableSignal<string>;
  focusNextItem(fromEl: HTMLLIElement): void;
  focusPrevItem(fromEl: HTMLLIElement): void;
  focusFirstItem(): void;
  focusLastItem(): void;
  hideDropdown(): void;
  dropdownTrigger(): { host: { nativeElement: HTMLElement } } | undefined;
}

export const DROPDOWN_API = new InjectionToken<DropdownApi>("DropdownApi");

export interface DropdownContentApi {
  dropdownRole: Signal<"menu" | "listbox">;
}

export const DROPDOWN_CONTENT_API = new InjectionToken<DropdownContentApi>(
  "DropdownContentApi",
);
