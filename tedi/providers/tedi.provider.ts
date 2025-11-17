import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  PLATFORM_ID,
  REQUEST,
} from "@angular/core";
import { TEDI_THEME_DEFAULT_TOKEN } from "../tokens/theme.token";
import {
  AVAILABLE_THEMES,
  Theme,
  THEME_COOKIE_NAME,
} from "../services/theme/theme.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../tokens/translation.token";
import {
  AVAILABLE_LANGUAGES,
  Language,
  LANGUAGE_COOKIE_NAME,
} from "../services/translation/translation.service";
import { DOCUMENT, isPlatformServer } from "@angular/common";

export interface TediConfig {
  theme?: Theme | (() => Theme);
  language?: Language | (() => Language);
}

function readCookie(name: string) {
  const platformId = inject(PLATFORM_ID);

  if (isPlatformServer(platformId)) {
    const req = inject(REQUEST, { optional: true });
    const cookieHeader = req?.headers.get("cookie") || "";
    return cookieHeader
      .split("; ")
      .find((c) => c.startsWith(name + "="))
      ?.split("=")[1];
  }

  const document = inject(DOCUMENT);
  return document.cookie
    ?.split("; ")
    .find((c) => c.startsWith(name + "="))
    ?.split("=")[1];
}

function resolveValue<T extends string>(
  value: T | (() => T) | undefined,
  cookie: T | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  if (value !== undefined) {
    return typeof value === "function" ? value() : value;
  }

  if (cookie && allowed.includes(cookie)) {
    return cookie;
  }

  return fallback;
}

export function provideTedi(config: TediConfig = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: TEDI_THEME_DEFAULT_TOKEN,
      useFactory: () => {
        const cookie = readCookie(THEME_COOKIE_NAME) as Theme | undefined;
        return resolveValue(config.theme, cookie, AVAILABLE_THEMES, "default");
      },
    },
    {
      provide: TEDI_TRANSLATION_DEFAULT_TOKEN,
      useFactory: () => {
        const cookie = readCookie(LANGUAGE_COOKIE_NAME) as Language | undefined;
        return resolveValue(config.language, cookie, AVAILABLE_LANGUAGES, "et");
      },
    },
  ]);
}
