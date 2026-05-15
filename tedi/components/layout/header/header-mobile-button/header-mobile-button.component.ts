import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from "@angular/core";
import { NgTemplateOutlet } from "@angular/common";
import { IconComponent } from "../../../base/icon/icon.component";
import { TextComponent } from "../../../base/text/text.component";

/**
 * Compact icon + label button used inside the mobile header row
 * (`<tedi-header-bottom>` or a mobile-specific section of
 * `<tedi-header-actions>`).
 *
 * Renders as an `<a>` when `href` is provided and `disabled` is false,
 * otherwise as a `<button>` — mirroring the React `HeaderMobileButton`.
 *
 * @example
 * <tedi-header-mobile-button icon="menu" label="Menu" />
 * <tedi-header-mobile-button icon="search" label="Search" href="/search" />
 * <tedi-header-mobile-button icon="notifications" label="Alerts" [selected]="true" />
 */
@Component({
  selector: "tedi-header-mobile-button",
  standalone: true,
  imports: [NgTemplateOutlet, IconComponent, TextComponent],
  templateUrl: "./header-mobile-button.component.html",
  styleUrl: "./header-mobile-button.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderMobileButtonComponent {
  /** Material icon name displayed inside the button. */
  icon = input.required<string>();
  /** Label text displayed below the icon. */
  label = input<string>();
  /**
   * If provided (and not disabled), the button renders as an `<a>`
   * navigating to this URL. Otherwise renders as a `<button>`.
   */
  href = input<string>();
  /** Whether the button is in a selected state. */
  selected = input<boolean>(false);
  /** Whether the button is disabled. */
  disabled = input<boolean>(false);
  /**
   * Accessible name override forwarded to the inner `<button>`/`<a>`.
   * Useful when the visible label needs to be augmented for screen readers
   * (e.g. when the button only renders an icon).
   */
  ariaLabel = input<string>();
  /**
   * Forwarded to the inner `<button>`/`<a>` as `aria-haspopup`. Set to
   * `'dialog'` when the button opens a modal dialog, `'menu'` for menus, etc.
   */
  ariaHasPopup = input<
    "true" | "false" | "menu" | "listbox" | "tree" | "grid" | "dialog"
  >();
  /**
   * Forwarded to the inner `<button>`/`<a>` as `aria-expanded`. Pair with
   * `ariaHasPopup` when this button toggles a dialog/menu open.
   */
  ariaExpanded = input<boolean>();

  // Render as `<a>` only when href is set AND not disabled — mirrors React's
  // `if (disabled || !href) { <Button> } else { <Link> }`.
  renderAsLink = computed(() => !!this.href() && !this.disabled());

  classes = computed(() => {
    const list = ["tedi-header-mobile-button"];
    if (this.selected()) {
      list.push("tedi-header-mobile-button--selected");
    }
    if (this.disabled()) {
      list.push("tedi-header-mobile-button--disabled");
    }
    return list.join(" ");
  });
}
