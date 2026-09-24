import { InjectionToken } from "@angular/core";
import { Language } from "../services/translation/translation.service";

export const TEDI_TRANSLATION_DEFAULT_TOKEN = new InjectionToken<Language>(
  "TEDI_TRANSLATION_DEFAULT_TOKEN",
);
