import { DOCUMENT } from "@angular/common";
import {
  effect,
  EnvironmentProviders,
  inject,
  provideEnvironmentInitializer,
} from "@angular/core";
import { TediTranslationService } from "../src/tedi/services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../src/tedi/tokens/translation.token";

/**
 * Starts every story in the default language, so a language a previous story
 * left in the `tedi-lang` cookie does not leak, and keeps `<html lang>` in
 * sync with the active TEDI language.
 */
export function provideStorybookLocale(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    const translation = inject(TediTranslationService);
    const document = inject(DOCUMENT);

    translation.setLanguage(inject(TEDI_TRANSLATION_DEFAULT_TOKEN));
    effect(() => {
      document.documentElement.lang = translation.getLanguage();
    });
  });
}
