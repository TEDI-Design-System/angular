import { InputSignal } from "@angular/core";

type InputKeys<TComponent> = keyof {
  [K in keyof TComponent as TComponent[K] extends InputSignal<infer _>
    ? K
    : never]: TComponent[K];
};

type InputValue<TComponent, K extends keyof TComponent> =
  TComponent[K] extends InputSignal<infer U> ? U : never;

/**
 * The inputs of a component as a plain object type. Inputs that accept
 * `undefined` come out optional, so a caller only has to name the ones that
 * matter.
 */
export type ComponentInputs<TComponent> = {
  [K in InputKeys<TComponent> as undefined extends InputValue<TComponent, K>
    ? K
    : never]?: InputValue<TComponent, K>;
} & {
  [K in InputKeys<TComponent> as undefined extends InputValue<TComponent, K>
    ? never
    : K]: InputValue<TComponent, K>;
};
