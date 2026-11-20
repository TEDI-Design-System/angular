import {
  HostAttributeToken,
  InjectionToken,
  Signal,
  computed,
  inject,
  signal,
} from "@angular/core";

export interface ControlDescribedBy {
  attribute: Signal<string | null>;
  set(ids: string[]): void;
}

export function controlDescribedBy(): ControlDescribedBy {
  const own = inject(new HostAttributeToken("aria-describedby"), {
    optional: true,
  });
  const ownIds = own?.split(/\s+/).filter(Boolean) ?? [];
  const pushed = signal<string[]>([]);

  return {
    attribute: computed(() => {
      const ids = [...new Set([...ownIds, ...pushed()])];
      return ids.length ? ids.join(" ") : null;
    }),
    set: (ids) => pushed.set(ids),
  };
}

/** A control that accepts ids of elements describing it, such as its error text. */
export interface DescribableControl {
  setDescribedBy(ids: string[]): void;
}

/**
 * Lets a container find the control inside it and link a description to it.
 * Provided by controls that implement `setDescribedBy`.
 */
export const TEDI_DESCRIBABLE_CONTROL = new InjectionToken<DescribableControl>(
  "TEDI_DESCRIBABLE_CONTROL",
);
