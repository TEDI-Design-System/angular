import { EnvironmentProviders, makeEnvironmentProviders } from "@angular/core";
import { TEDI_THEME_DEFAULT_TOKEN } from "../tokens/theme.token";
import { Theme, THEME_FALLBACK_VALUE } from "../services/theme/theme.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../tokens/translation.token";
import { Language } from "../services/translation/translation.service";

export interface TediConfig {
  theme?: Theme;
  language?: Language;
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
  ]);
}
