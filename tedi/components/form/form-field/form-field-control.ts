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
  /**
   * Optional method used when the field box itself is clicked. If implemented,
   * clicking the box padding — which is not part of the control's own hit area —
   * moves focus into the control, the way clicking the value does.
   */
  focus?(): void;
  /**
   * Set by controls that render their own clear button — date and time put one in
   * their action row beside the picker button, which cannot leave the control
   * because the overlay anchors to it. The field then skips its generic clear
   * button so a single `clearable` never yields two.
   */
  readonly ownsClearButton?: boolean;
}

/**
 * Injection token used by `tedi-form-field` to obtain
 * the associated control instance.
 */
export const TEDI_FORM_FIELD_CONTROL = new InjectionToken<FormFieldControl>(
  "TEDI_FORM_FIELD_CONTROL",
);
