import { InjectionToken, Signal } from "@angular/core";

/**
 * Interface implemented by controls that can be used inside `tedi-form-field`.
 * Allows the form field container to interact with the underlying control.
 */
export interface FormFieldControl<T = unknown> {
  /**
   * Current value of the control.
   */
  value: Signal<T>;
  /**
   * Whether the control is disabled.
   */
  disabled: Signal<boolean>;
  /** Reactive invalid state (driven by FormField) */
  invalid: Signal<boolean>;

  /** Called by FormField to update invalid state */
  setInvalidState(isInvalid: boolean): void;
  /**
   * Optional method used by the form field clear button.
   * If implemented, the form field can trigger clearing the value.
   */
  clearField?(): void;
}

/**
 * Injection token used by `tedi-form-field` to obtain
 * the associated control instance.
 */
export const TEDI_FORM_FIELD_CONTROL = new InjectionToken<FormFieldControl>(
  "TEDI_FORM_FIELD_CONTROL",
);
