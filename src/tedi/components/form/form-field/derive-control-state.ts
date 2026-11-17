import {
  DestroyRef,
  Injector,
  Signal,
  computed,
  inject,
  signal,
} from "@angular/core";
import { AbstractControl, NgControl, Validators } from "@angular/forms";
import { Subscription } from "rxjs";

export interface DerivedControlState {
  invalid: Signal<boolean>;
  touched: Signal<boolean>;
  dirty: Signal<boolean>;
  /** Whether the bound control carries `Validators.required`. */
  required: Signal<boolean>;
  /**
   * Call from `ngOnInit`: a control that is its own `NG_VALUE_ACCESSOR` cannot
   * inject `NgControl` in the constructor, because the accessor is what
   * `NgControl` depends on.
   */
  connect(): void;
  /**
   * Call from `ngDoCheck`: Angular swaps in a new `[formControl]` instance
   * without emitting events, so the state is re-read only when this notices it.
   */
  sync(): void;
}

export function deriveControlState(): DerivedControlState {
  const injector = inject(Injector);
  const destroyRef = inject(DestroyRef);
  const ngControl = signal<NgControl | null>(null);
  const revision = signal(0);

  let current: AbstractControl | null = null;
  let subscription: Subscription | undefined;

  const track = () => {
    const control = ngControl()?.control ?? null;
    if (control === current) return;
    current = control;
    subscription?.unsubscribe();
    subscription = control?.events.subscribe(() =>
      revision.update((value) => value + 1),
    );
    revision.update((value) => value + 1);
  };

  const read = <T>(
    pick: (control: NgControl) => T | null | undefined,
  ): T | undefined => {
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
    required: computed(
      () =>
        read((control) => control.control?.hasValidator(Validators.required)) ??
        false,
    ),
    connect: () => {
      // `self` is what keeps this from becoming a leak: without it the lookup
      // walks the whole element-injector chain and a control picks up the
      // `NgControl` of a composite above it (a `tedi-search`'s own form control,
      // say), reporting an error state for a value it does not hold.
      ngControl.set(
        injector.get(NgControl, null, { optional: true, self: true }),
      );
      destroyRef.onDestroy(() => subscription?.unsubscribe());
      track();
    },
    sync: () => track(),
  };
}
