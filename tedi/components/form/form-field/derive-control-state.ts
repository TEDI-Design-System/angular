import {
  DestroyRef,
  Injector,
  Signal,
  computed,
  inject,
  signal,
} from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { NgControl } from "@angular/forms";

export interface DerivedControlState {
  invalid: Signal<boolean>;
  touched: Signal<boolean>;
  dirty: Signal<boolean>;
  /**
   * Call from `ngOnInit`: a control that is its own `NG_VALUE_ACCESSOR` cannot
   * inject `NgControl` in the constructor, because the accessor is what
   * `NgControl` depends on.
   */
  connect(): void;
}

export function deriveControlState(): DerivedControlState {
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);
  const ngControl = signal<NgControl | null>(null);
  const revision = signal(0);

  const read = <T>(pick: (control: NgControl) => T | null | undefined): T | undefined => {
    revision();
    const control = ngControl();
    return control ? (pick(control) ?? undefined) : undefined;
  };

  return {
    invalid: computed(() => {
      const invalid = read((control) => control.invalid) ?? false;
      const touched = read((control) => control.touched) ?? false;
      const dirty = read((control) => control.dirty) ?? false;
      return invalid && (touched || dirty);
    }),
    touched: computed(() => read((control) => control.touched) ?? false),
    dirty: computed(() => read((control) => control.dirty) ?? false),
    connect: () => {
      // `self` is what keeps this from becoming a leak: without it the lookup
      // walks the whole element-injector chain and a control picks up the
      // `NgControl` of a composite above it (a `tedi-search`'s own form control,
      // say), reporting an error state for a value it does not hold.
      const control = injector.get(NgControl, null, {
        optional: true,
        self: true,
      });
      ngControl.set(control);
      control?.control?.events
        ?.pipe(takeUntilDestroyed(destroyRef))
        .subscribe(() => revision.update((value) => value + 1));
    },
  };
}
