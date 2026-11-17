import { TestBed } from "@angular/core/testing";
import {
  LANGUAGE_COOKIE_NAME,
  TediTranslationService,
} from "../src/tedi/services/translation/translation.service";
import { TEDI_TRANSLATION_DEFAULT_TOKEN } from "../src/tedi/tokens/translation.token";
import { provideStorybookLocale } from "./locale";

describe("provideStorybookLocale", () => {
  const setup = () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: "et" },
        provideStorybookLocale(),
      ],
    });

    const translation = TestBed.inject(TediTranslationService);
    TestBed.tick();
    return translation;
  };

  beforeEach(() => {
    document.documentElement.lang = "en";
  });

  afterEach(() => {
    document.cookie = `${LANGUAGE_COOKIE_NAME}=; max-age=0; path=/`;
    document.documentElement.removeAttribute("lang");
  });

  it("sets <html lang> to et by default", () => {
    const translation = setup();

    expect(translation.getLanguage()).toBe("et");
    expect(document.documentElement.lang).toBe("et");
  });

  it("ignores a language left in the cookie by a previous story", () => {
    document.cookie = `${LANGUAGE_COOKIE_NAME}=ru; path=/`;
    const translation = setup();

    expect(translation.getLanguage()).toBe("et");
    expect(document.documentElement.lang).toBe("et");
  });

  it("follows language changes made inside a story", () => {
    const translation = setup();

    translation.setLanguage("en");
    TestBed.tick();

    expect(document.documentElement.lang).toBe("en");
  });
});
