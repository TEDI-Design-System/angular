import { DOCUMENT, isPlatformBrowser, isPlatformServer } from "@angular/common";
import { effect, inject, PLATFORM_ID, REQUEST, signal } from "@angular/core";

function parseCookies(header: string): Record<string, string> {
  const result: Record<string, string> = {};

  if (!header) return result;

  for (const c of header.split(";")) {
    const [rawKey, ...rest] = c.split("=");
    const key = (rawKey ?? "").trim();
    const rawVal = rest.join("=");

    try {
      result[key] = decodeURIComponent(rawVal).trim();
    } catch {
      result[key] = rawVal.trim();
    }
  }

  return result;
}

function readServerCookie(key: string): string | undefined {
  try {
    const req = inject(REQUEST, { optional: true });
    const cookieHeader = req?.headers.get("cookie");

    if (!cookieHeader) return undefined;

    return parseCookies(cookieHeader)[key];
  } catch {
    return undefined;
  }
}

function readBrowserCookie(key: string): string | undefined {
  const document = inject(DOCUMENT);
  const cookies = parseCookies(document.cookie);
  return cookies[key];
}

function parseCookieValue<T>(raw: string | undefined, initialValue: T): T {
  if (!raw) return initialValue;

  try {
    const parsed =
      typeof initialValue === "string" ? raw : (JSON.parse(raw) as T);
    return parsed as T;
  } catch {
    return initialValue;
  }
}

export function cookieSignal<T>(key: string, initialValue: T) {
  const platformId = inject(PLATFORM_ID);
  const document = inject(DOCUMENT);
  const isBrowser = isPlatformBrowser(platformId);
  const isServer = isPlatformServer(platformId);

  let startValue = initialValue;

  if (isServer) {
    const raw = readServerCookie(key);
    startValue = parseCookieValue(raw, initialValue);
  }

  if (isBrowser) {
    const raw = readBrowserCookie(key);
    startValue = parseCookieValue(raw, initialValue);
  }

  const state = signal<T>(startValue);
  const options = {
    path: "/",
    sameSite: "Lax",
    secure: false,
    maxAge: 60 * 60 * 24 * 30,
  };

  if (isBrowser) {
    effect(() => {
      const value = state();

      if (value === null || value === undefined || value === "") {
        document.cookie = `${key}=; path=${options.path}; max-age=0`;
        return;
      }

      const stored = typeof value === "string" ? value : JSON.stringify(value);
      document.cookie = `${key}=${encodeURIComponent(stored)}; path=${options.path}; max-age=${options.maxAge}; samesite=${options.sameSite};`;
    });
  }

  return state;
}
