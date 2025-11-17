import {
  computed,
  effect,
  inject,
  Injectable,
  isSignal,
  PLATFORM_ID,
  REQUEST,
  signal,
  Signal,
} from "@angular/core";
import {
  translationsMap,
  TranslationMap,
  TediTranslationsMap,
} from "./translations";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../tokens/translation.token";
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from "@angular/common";

export type Language = "en" | "et" | "ru";
export const LANGUAGE_COOKIE_NAME = "tedi-lang";
export const AVAILABLE_LANGUAGES: Language[] = ["et", "en", "ru"];

@Injectable({ providedIn: "root" })
export class TediTranslationService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly defaultLang = inject(TEDI_TRANSLATION_DEFAULT_TOKEN);

  private readonly req = isPlatformServer(this.platformId)
    ? inject(REQUEST)
    : null;

  private getInitialLang(): Language {
    if (isPlatformServer(this.platformId) && this.req) {
      const cookieHeader = this.req.headers.get("cookie") || "";
      const cookie = cookieHeader
        .split("; ")
        .find((c) => c.startsWith(LANGUAGE_COOKIE_NAME + "="))
        ?.split("=")[1] as Language | undefined;

      if (cookie && AVAILABLE_LANGUAGES.includes(cookie)) {
        return cookie;
      }

      return this.defaultLang;
    }

    if (isPlatformBrowser(this.platformId)) {
      const cookie = this.document.cookie
        ?.split("; ")
        .find((c) => c.startsWith(LANGUAGE_COOKIE_NAME + "="))
        ?.split("=")[1] as Language | undefined;

      if (cookie && AVAILABLE_LANGUAGES.includes(cookie)) {
        return cookie;
      }

      return this.defaultLang;
    }

    return this.defaultLang;
  }

  constructor() {
    effect(() => {
      if (isPlatformBrowser(this.platformId)) {
        document.cookie = `${LANGUAGE_COOKIE_NAME}=${this.currentLang()};path=/;max-age=31536000`;
      }
    });
  }

  private readonly currentLang = signal<Language>(this.getInitialLang());
  private translations = signal<TranslationMap>(translationsMap);

  getLanguage = this.currentLang.asReadonly();

  setLanguage(lang: Language) {
    this.currentLang.set(lang);
  }

  translate<
    TLang extends Language,
    TKey extends keyof TediTranslationsMap<TLang> | (string & {}),
    TArgs extends TKey extends keyof TediTranslationsMap<TLang>
      ? TediTranslationsMap<TLang>[TKey] extends (...args: infer P) => string
        ? P
        : []
      : unknown[],
  >(key: TKey, ...args: TArgs): string {
    const lang = this.currentLang();
    const entry = this.translations()[key];

    if (!entry || !(lang in entry)) {
      return key;
    }

    const value = entry[lang];

    if (typeof value === "function") {
      return value(...args);
    }

    return value;
  }

  track<
    TLang extends Language,
    TKey extends keyof TediTranslationsMap<TLang> | (string & {}),
    TArgs extends TKey extends keyof TediTranslationsMap<TLang>
      ? TediTranslationsMap<TLang>[TKey] extends (...args: infer P) => string
        ? P
        : []
      : unknown[],
  >(key: TKey, ...args: (TArgs[number] | Signal<TArgs[number]>)[]) {
    return computed(() => {
      const resolvedArgs = args.map((arg) =>
        isSignal(arg) ? arg() : arg,
      ) as TArgs;

      return this.translate(key, ...resolvedArgs);
    });
  }

  addTranslations(newTranslations: TranslationMap) {
    this.translations.update((prev) => ({ ...prev, ...newTranslations }));
  }
}
