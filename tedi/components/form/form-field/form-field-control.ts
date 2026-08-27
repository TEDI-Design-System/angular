import { InjectionToken, Signal } from "@angular/core";

/**
 * Interface implemented by controls that can be used inside `tedi-form-field`.
 * Members are named after Angular's `FormValueControl`
 * so the same control shape works once Signal Forms is available to us.
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
  /**
   * Whether the control is in an error state. Derived by the control from its
   * own reactive-forms state, its `invalid` input and its container.
   */
  invalid: Signal<boolean>;
  touched?: Signal<boolean>;
  dirty?: Signal<boolean>;
  required?: Signal<boolean>;
  maxLength?: Signal<number | undefined>;
  /**
   * Clears the value. Implemented by controls that can be cleared, and called
   * by `tedi-form-field`'s clear button.
   */
  reset?(): void;
  /**
   * Moves focus into the control. Called when the padding around the control is
   * clicked — that area is outside the control's own hit area, so clicking it
   * would otherwise leave the field unfocused.
   */
  focus?(): void;
  /**
   * Receives the ids of the elements describing this control (feedback text,
   * character counter). The control merges them into its own
   * `aria-describedby`; nothing is pushed when the control stands alone.
   */
  setDescribedBy?(ids: string[]): void;
}

/**
 * Injection token used by `tedi-form-field` to obtain
 * the associated control instance.
 */
export const TEDI_FORM_FIELD_CONTROL = new InjectionToken<FormFieldControl>(
  "TEDI_FORM_FIELD_CONTROL",
);
