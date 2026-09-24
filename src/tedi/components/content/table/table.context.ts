import { inject, InjectionToken } from "@angular/core";
import type { TediTableContextValue } from "./table.types";

export const TEDI_TABLE_CONTEXT = new InjectionToken<TediTableContextValue>(
  "TEDI_TABLE_CONTEXT",
);

export function injectTediTableContext<
  TData = unknown,
>(): TediTableContextValue<TData> {
  const ctx = inject(TEDI_TABLE_CONTEXT, { optional: true });
  if (!ctx) {
    throw new Error(
      "TEDI_TABLE_CONTEXT missing — wrap the component in <tedi-table>.",
    );
  }
  return ctx as TediTableContextValue<TData>;
}
