import { InjectionToken } from "@angular/core";
import type { Theme } from "../services/theme/theme.service";

export const TEDI_THEME_DEFAULT_TOKEN = new InjectionToken<Theme>(
  "TEDI_THEME_DEFAULT_TOKEN",
  {
    providedIn: "root",
    factory: () => "default",
  },
);
