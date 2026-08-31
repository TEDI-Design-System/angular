import {
  HostAttributeToken,
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
