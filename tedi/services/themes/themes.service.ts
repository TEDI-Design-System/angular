import { Injectable, Inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';

export type Theme = 'default' | 'dark' | 'rit';
export const AVAILABLE_THEMES: Theme[] = ['default', 'dark', 'rit'];
export const THEME_CLASS_PREFIX = 'tedi-theme--';
export const THEME_STORAGE_KEY = 'tedi-theme';
export const THEME_COOKIE_NAME = 'tedi-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeSubject = new BehaviorSubject<Theme>('default');
  themeChanges$ = this.themeSubject.asObservable();

  readonly currentTheme = signal<Theme>('default');

  private isBrowser: boolean;
  private useCookies = false;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (this.isBrowser) {
      const stored = this.getStoredTheme();
      const initialTheme = stored ?? 'default';
      this.setTheme(initialTheme, false);
    }
  }

  enableCookies(enable: boolean = true): void {
    this.useCookies = enable && this.isBrowser;
  }

  setTheme(theme: Theme, persist = true): void {
    if (!AVAILABLE_THEMES.includes(theme)) {
      console.warn(`Theme ${theme} is not supported. Available:`, AVAILABLE_THEMES);
      return;
    }

    this.themeSubject.next(theme);
    this.currentTheme.set(theme);

    if (this.isBrowser) {
      this.applyGlobalTheme(theme);
      if (persist) {
        this.persistTheme(theme);
      }
    }
  }

  getTheme(): Theme {
    return this.themeSubject.value;
  }

  private applyGlobalTheme(theme: Theme): void {
    const root = document.documentElement;
    const prefix = THEME_CLASS_PREFIX;

    AVAILABLE_THEMES.forEach(t => root.classList.remove(`${prefix}${t}`));
    root.classList.add(`${prefix}${theme}`);
  }

  private persistTheme(theme: Theme): void {
    localStorage.setItem(THEME_STORAGE_KEY, theme);

    if (this.useCookies) {
      this.setThemeCookie(theme);
    }
  }

  private getStoredTheme(): Theme | null {
    const local = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (local && AVAILABLE_THEMES.includes(local)) {
      return local;
    }

    if (this.useCookies) {
      const cookie = this.getThemeCookie();
      if (cookie && AVAILABLE_THEMES.includes(cookie)) {
        localStorage.setItem(THEME_STORAGE_KEY, cookie);
        return cookie;
      }
    }

    return null;
  }

  private setThemeCookie(theme: Theme): void {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${THEME_COOKIE_NAME}=${theme}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

  private getThemeCookie(): Theme | null {
    const match = document.cookie.match(new RegExp(`(?:^|; )${THEME_COOKIE_NAME}=([^;]+)`));
    return match ? (match[1] as Theme) : null;
  }
}