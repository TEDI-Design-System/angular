import {
  computed,
  inject,
  Injectable,
  isSignal,
  signal,
  Signal,
} from "@angular/core";
import {
  translationsMap,
  TranslationMap,
  TediTranslationsMap,
} from "./translations";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../../tokens/translation.token";
import { cookieSignal } from "../../utils/cookies.util";

export type Language = "en" | "et" | "ru";
export const LANGUAGE_COOKIE_NAME = "tedi-lang";
export const AVAILABLE_LANGUAGES: Language[] = ["et", "en", "ru"];
export const LANGUAGE_FALLBACK_VALUE: Language = "et";

@Injectable({ providedIn: "root" })
export class TediTranslationService {
  private readonly defaultLang = inject(TEDI_TRANSLATION_DEFAULT_TOKEN);

  private readonly currentLang = cookieSignal(
    LANGUAGE_COOKIE_NAME,
    this.defaultLang,
  );
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
