import {
  Injectable,
  signal,
  inject,
  effect,
  PLATFORM_ID,
  REQUEST,
} from "@angular/core";
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from "@angular/common";
import { TEDI_THEME_DEFAULT_TOKEN } from "../../tokens/theme.token";

export type Theme = "default" | "dark" | "rit";
export const AVAILABLE_THEMES: Theme[] = ["default", "dark", "rit"];
export const THEME_CLASS_PREFIX = "tedi-theme--";
export const THEME_STORAGE_KEY = "tedi-theme";
export const THEME_COOKIE_NAME = "tedi-theme";

@Injectable({ providedIn: "root" })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly defaultTheme = inject(TEDI_THEME_DEFAULT_TOKEN);

  private readonly req = isPlatformServer(this.platformId)
    ? inject(REQUEST)
    : null;

  private getInitialTheme(): Theme {
    if (isPlatformServer(this.platformId) && this.req) {
      const cookieHeader = this.req.headers.get("cookie") || "";
      const cookie = cookieHeader
        .split("; ")
        .find((c) => c.startsWith(THEME_COOKIE_NAME + "="))
        ?.split("=")[1] as Theme | undefined;

      if (cookie && AVAILABLE_THEMES.includes(cookie)) {
        return cookie;
      }

      return this.defaultTheme;
    }

    if (isPlatformBrowser(this.platformId)) {
      const cookie = this.document.cookie
        ?.split("; ")
        .find((c) => c.startsWith(THEME_COOKIE_NAME + "="))
        ?.split("=")[1] as Theme | undefined;

      if (cookie && AVAILABLE_THEMES.includes(cookie)) {
        return cookie;
      }

      return this.defaultTheme;
    }

    return this.defaultTheme;
  }

  readonly theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const html = this.document.documentElement;

      for (const t of AVAILABLE_THEMES) {
        html.classList.remove(`${THEME_CLASS_PREFIX}${t}`);
      }

      html.classList.add(`tedi-theme--${this.theme()}`);

      if (isPlatformBrowser(this.platformId)) {
        document.cookie = `${THEME_COOKIE_NAME}=${this.theme()};path=/;max-age=31536000`;
      }
    });
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }
}
