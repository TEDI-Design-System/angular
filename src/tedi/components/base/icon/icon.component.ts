import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  ViewEncapsulation,
} from "@angular/core";

const ICON_WITH_BACKGROUND = [16, 24];

const ICON_SIZE_TOKENS: Record<number, string> = {
  8: "icon-00",
  12: "icon-01",
  16: "icon-02",
  18: "icon-03",
  22: "icon-04",
  24: "icon-05",
  36: "icon-06",
  48: "icon-07",
};

export type IconSize = 8 | 12 | 16 | 18 | 22 | 24 | 36 | 48 | "inherit";
export type IconVariant = "filled" | "outlined";
export type IconType = "outlined" | "sharp" | "rounded";
export type IconColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "brand"
  | "brand-dark"
  | "success"
  | "warning"
  | "warning-dark"
  | "danger"
  | "white"
  | "inherit";
export type IconBackgroundColor =
  "primary" | "secondary" | "brand-primary" | "brand-secondary";

@Component({
  selector: "tedi-icon",
  standalone: true,
  templateUrl: "./icon.component.html",
  styleUrl: "./icon.component.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    "[class]": "classes()",
    "[style.--_tedi-icon-size]": "iconSizeVar()",
    "[style.--_tedi-icon-bg-padding]": "iconBgPadding()",
    role: "img",
    "[attr.aria-label]": "label()",
    "[attr.aria-hidden]": "!label()",
  },
})
export class IconComponent {
  /**
   * Name of the Material Icon
   * https://fonts.google.com/icons
   */
  name = input.required<string>();
  /**
   * Size of the icon in pixels. When unset, the icon uses the contextual
   * default of its host (e.g. `tedi-button`/`tedi-link`), falling back to 24.
   * An explicit value always takes precedence over the contextual default.
   * @default 24
   */
  size = input<IconSize>();
  /**
   * Color of the icon.
   * @default primary
   */
  color = input<IconColor>("primary");
  /**
   * Background color for the icon (adds a circular background).
   */
  background = input<IconBackgroundColor>();
  /**
   * Whether the icon should be filled or outlined.
   * @default outlined
   */
  variant = input<IconVariant>("outlined");
  /**
   * Type of Material Symbols icon style.
   * It is recommended to only use one type throughout your app.
   * @default outlined
   */
  type = input<IconType>("outlined");
  /**
   * Accessible label for screen readers.
   * If omitted then the icon is hidden for screen-readers.
   */
  label = input<string>();

  iconSizeVar = computed<string | null>(() => {
    const size = this.size();

    if (this.background()) {
      const bgSize =
        size !== undefined &&
        size !== "inherit" &&
        ICON_WITH_BACKGROUND.includes(size)
          ? size
          : 24;
      return `var(--${ICON_SIZE_TOKENS[bgSize]})`;
    }

    if (size === undefined || size === "inherit") {
      return null;
    }

    return `var(--${ICON_SIZE_TOKENS[size]})`;
  });

  iconBgPadding = computed<string | null>(() => {
    if (!this.background()) {
      return null;
    }

    const size = this.size();
    const bgSize =
      size !== undefined &&
      size !== "inherit" &&
      ICON_WITH_BACKGROUND.includes(size)
        ? size
        : 24;

    return bgSize === 16
      ? "var(--icon-background-padding-sm)"
      : "var(--icon-background-padding-lg)";
  });

  classes = computed(() => {
    const classes: string[] = [
      "notranslate",
      "material-symbols",
      `material-symbols--${this.type()}`,
      "tedi-icon",
      `tedi-icon--color-${this.color()}`,
    ];

    if (this.background()) {
      classes.push("tedi-icon--bg", `tedi-icon--bg-${this.background()}`);
    } else if (this.size() === "inherit") {
      classes.push("tedi-icon--size-inherit");
    }

    if (this.variant() === "filled") {
      classes.push("tedi-icon--filled");
    }

    return classes.join(" ");
  });
}
