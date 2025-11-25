import { Injectable, inject, effect } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TEDI_THEME_DEFAULT_TOKEN } from "../../tokens/theme.token";
import { cookieSignal } from "../../utils/cookies.util";

export type Theme = "default" | "dark" | "rit";
export const AVAILABLE_THEMES: Theme[] = ["default", "dark", "rit"];
export const THEME_CLASS_PREFIX = "tedi-theme--";
export const THEME_COOKIE_NAME = "tedi-theme";
export const THEME_FALLBACK_VALUE: Theme = "default";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly defaultTheme = inject(TEDI_THEME_DEFAULT_TOKEN);

  readonly theme = cookieSignal<Theme>(THEME_COOKIE_NAME, this.defaultTheme);

  constructor() {
    effect(() => {
      const html = this.document.documentElement;

      for (const t of AVAILABLE_THEMES) {
        html.classList.remove(`${THEME_CLASS_PREFIX}${t}`);
      }

      html.classList.add(`${THEME_CLASS_PREFIX}${this.theme()}`);
    });
  }
}
