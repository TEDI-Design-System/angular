import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from "@angular/core";
import { TEDI_THEME_DEFAULT_TOKEN } from "../tokens/theme.token";
import {
  AVAILABLE_THEMES,
  Theme,
  THEME_CLASS_PREFIX,
  THEME_FALLBACK_VALUE,
} from "../services/theme/theme.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../tokens/translation.token";
import { Language } from "../services/translation/translation.service";
import { DOCUMENT } from "@angular/common";

export interface TediConfig {
  theme?: Theme;
  language?: Language;
}

function applyInitialTheme() {
  return () => {
    const document = inject(DOCUMENT);
    const defaultTheme = inject(TEDI_THEME_DEFAULT_TOKEN);
    const html = document.documentElement;

    for (const t of AVAILABLE_THEMES) {
      html.classList.remove(`${THEME_CLASS_PREFIX}${t}`);
    }

    html.classList.add(`${THEME_CLASS_PREFIX}${defaultTheme}`);
  };
}

export function provideTedi(config: TediConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: TEDI_THEME_DEFAULT_TOKEN,
      useValue: config.theme ?? THEME_FALLBACK_VALUE,
    },
    {
      provide: TEDI_TRANSLATION_DEFAULT_TOKEN,
      useValue: config.language ?? "et",
    },
    provideAppInitializer(applyInitialTheme()),
  ]);
}
