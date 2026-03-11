import { Injectable, inject, effect } from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { TEDI_THEME_DEFAULT_TOKEN } from "../../tokens/theme.token";
import { cookieSignal } from "../../utils/cookies.util";

export type TEDITheme = "default" | "dark";
export type Theme = TEDITheme | string;
export const THEME_CLASS_PREFIX = "tedi-theme--";
export const THEME_COOKIE_NAME = "tedi-theme";
export const THEME_FALLBACK_VALUE: Theme = "default";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly defaultTheme = inject(TEDI_THEME_DEFAULT_TOKEN);

  readonly theme = cookieSignal<Theme>(
    THEME_COOKIE_NAME,
    this.defaultTheme
  );

  constructor() {
    effect(() => {
      const html = this.document.documentElement;
      const nextTheme = this.theme();

      for (let i = html.classList.length - 1; i >= 0; i--) {
        const className = html.classList.item(i);
        if (className?.startsWith(THEME_CLASS_PREFIX)) {
          html.classList.remove(className);
        }
      }

      html.classList.add(`${THEME_CLASS_PREFIX}${nextTheme}`);
    });
  }
}