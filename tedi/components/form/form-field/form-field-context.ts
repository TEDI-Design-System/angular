import { InjectionToken, Signal } from "@angular/core";

/**
 * Context exposed by `tedi-form-field` to the control projected into it — the
 * mirror of `TEDI_FORM_FIELD_CONTROL`. The field declares these settings once;
 * controls read them here rather than duplicating them as their own inputs.
 */
export interface FormFieldContext {
  /** Whether the field shows a clear button. Opt-in for every control. */
  clearable: Signal<boolean>;
}

export const TEDI_FORM_FIELD = new InjectionToken<FormFieldContext>(
  "TEDI_FORM_FIELD",
);
