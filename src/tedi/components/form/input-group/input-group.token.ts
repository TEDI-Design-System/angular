import { InjectionToken, Signal } from "@angular/core";

/**
 * Context exposed by `tedi-input-group` to the controls and addons rendered
 * inside it. Consumed via optional DI so a control can merge the group's
 * `disabled` / `invalid` state into its own.
 */
export interface InputGroupContext {
  disabled: Signal<boolean>;
  invalid: Signal<boolean>;
}

export const TEDI_INPUT_GROUP = new InjectionToken<InputGroupContext>(
  "TEDI_INPUT_GROUP",
);
