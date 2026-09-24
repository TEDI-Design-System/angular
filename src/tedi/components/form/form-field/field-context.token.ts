import { InjectionToken, Signal } from "@angular/core";

export type InputSize = "small" | "large" | "default";

export interface FieldContext {
  /** The control's own `size` input wins over this. */
  size: Signal<InputSize>;
  /** When true the control must never apply its surface, rather than reset it. */
  ownsSurface: Signal<boolean>;
  /** From an error feedback text, an exceeded character limit or an input group. */
  invalid: Signal<boolean>;
  /** From the projected feedback text — only a wrapper can know this. */
  valid: Signal<boolean>;
  /** From an input group that disables everything inside it. */
  disabled: Signal<boolean>;
}

export const TEDI_FIELD_CONTEXT = new InjectionToken<FieldContext>(
  "TEDI_FIELD_CONTEXT",
);
