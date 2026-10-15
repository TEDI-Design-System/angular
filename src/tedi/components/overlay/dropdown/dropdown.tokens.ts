import { InjectionToken, Signal, WritableSignal } from "@angular/core";

/**
 * How the dropdown panel is exposed to assistive technology.
 *
 * - `menu`: a menu of actions. Composite widget, so it is a single tab stop
 *   with arrow-key navigation and its items are `menuitem`s.
 * - `listbox`: a list of options, one of which can be selected. Composite
 *   widget, like `menu`, and its items are `option`s.
 * - `list`: a plain list, not a widget. Items keep their own semantics, so
 *   navigation links stay links and each is its own tab stop. Use this
 *   whenever the panel is a set of links.
 */
export type DropdownRole = "menu" | "listbox" | "list";

export interface DropdownApi {
  /** Current value of the dropdown. Used to track the selected option in listbox mode. */
  value: WritableSignal<string | undefined>;
  /** ID of the overlay container element. Used to link trigger and content for accessibility. */
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
  /** Close the dropdown and move focus to the element before (Shift+Tab) or after (Tab) the trigger in document tab order, so tabbing exits the menu as if it weren't there. */
  tabOutOfDropdown(shiftKey: boolean): void;
  /** Reference to the dropdown trigger directive. `host` is the element the directive sits on (used for positioning and dimensions); `focus()` moves focus to the actual interactive trigger element, which may be a button nested inside a wrapping component; `focusableElement` is that same interactive element. */
  dropdownTrigger():
    | {
        host: { nativeElement: HTMLElement };
        focus(): void;
        focusableElement: HTMLElement;
      }
    | undefined;
}

export const DROPDOWN_API = new InjectionToken<DropdownApi>("DropdownApi");

export interface DropdownContentApi {
  /** The ARIA role of the dropdown content. Determines keyboard interaction and accessibility semantics. */
  dropdownRole: Signal<DropdownRole>;
  /** Whether the content is a composite widget (`menu`, `listbox`) rather than a plain `list`. Widgets own focus management and key handling; a plain list leaves both to the items' own controls. */
  isWidget: Signal<boolean>;
}

export const DROPDOWN_CONTENT_API = new InjectionToken<DropdownContentApi>(
  "DropdownContentApi",
);
