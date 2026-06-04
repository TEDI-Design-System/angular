import { computed, signal, type Signal } from "@angular/core";
import type {
  TablePersistOptions,
  TableState,
  TableStatePatch,
} from "./table.types";

/**
 * State slices persisted by default when `persist` is configured without a
 * custom `include` list. Limited to user-preference slices — task-scoped
 * slices (selection, expanded, filters, sort, pagination) reset between
 * sessions unless added explicitly via `include`.
 */
const DEFAULT_PERSISTED_KEYS: (keyof TableState)[] = [
  "columnVisibility",
  "columnOrder",
  "rowOrder",
  "columnSizing",
];

function getStorage(options?: TablePersistOptions): Storage | null {
  if (!options) return null;
  if (options.storage) return options.storage;
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function readInitialState(
  options: TablePersistOptions | undefined,
  fallback: Partial<TableState>,
): Partial<TableState> {
  const storage = getStorage(options);
  if (!storage || !options) return fallback;
  try {
    const raw = storage.getItem(options.key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<TableState>;
    const include = options.include ?? DEFAULT_PERSISTED_KEYS;
    const filtered: Partial<TableState> = {};
    for (const key of include) {
      if (parsed[key] !== undefined) {
        (filtered as Record<keyof TableState, unknown>)[key] = parsed[key];
      }
    }
    return { ...fallback, ...filtered };
  } catch {
    return fallback;
  }
}

export interface TablePersistenceController {
  /** Merged state signal (internal ∪ controlled). Reactive. */
  state: Signal<TableState>;
  /** Apply a patch — updates internal state, persists, fires onStateChange. */
  patch(next: TableStatePatch): void;
  /** Replace the controlled slice. */
  setControlled(controlled: Partial<TableState> | undefined): void;
  /** Replace persist options. */
  setPersist(persist: TablePersistOptions | undefined): void;
  /** Replace onStateChange callback. */
  setOnStateChange(cb: ((state: TableState) => void) | undefined): void;
}

export function createTablePersistence(options: {
  persist?: TablePersistOptions;
  controlled?: Partial<TableState>;
  defaultState?: Partial<TableState>;
  onStateChange?: (state: TableState) => void;
}): TablePersistenceController {
  let persist = options.persist;
  let onStateChange = options.onStateChange;

  const internal = signal<TableState>(
    readInitialState(persist, options.defaultState ?? {}),
  );
  const controlledSignal = signal<Partial<TableState> | undefined>(
    options.controlled,
  );

  const state = computed<TableState>(() => ({
    ...internal(),
    ...(controlledSignal() ?? {}),
  }));

  return {
    state,
    patch(patchOrFn: TableStatePatch) {
      const previousInternal = internal();
      const currentControlled = controlledSignal() ?? {};
      const mergedPrev: TableState = {
        ...previousInternal,
        ...currentControlled,
      };
      const patch =
        typeof patchOrFn === "function" ? patchOrFn(mergedPrev) : patchOrFn;
      const nextInternal: TableState = { ...previousInternal, ...patch };
      const mergedNext: TableState = {
        ...previousInternal,
        ...currentControlled,
        ...patch,
      };

      internal.set(nextInternal);

      const storage = getStorage(persist);
      if (storage && persist) {
        try {
          const include = persist.include ?? DEFAULT_PERSISTED_KEYS;
          const persisted: Partial<TableState> = {};
          for (const key of include) {
            if (mergedNext[key] !== undefined) {
              (persisted as Record<keyof TableState, unknown>)[key] =
                mergedNext[key];
            }
          }
          storage.setItem(persist.key, JSON.stringify(persisted));
        } catch {
          // silently ignore quota / serialization errors
        }
      }

      onStateChange?.(mergedNext);
    },
    setControlled(next) {
      controlledSignal.set(next);
    },
    setPersist(next) {
      const previous = persist;
      persist = next;
      // When the persistence source changes (key or storage), the internal
      // slices still hold the previous table's state. Rehydrate from the new
      // source so we don't bleed state across tables / persistence keys.
      const sourceChanged =
        previous?.key !== next?.key || previous?.storage !== next?.storage;
      if (sourceChanged) {
        internal.set(readInitialState(next, options.defaultState ?? {}));
      }
    },
    setOnStateChange(cb) {
      onStateChange = cb;
    },
  };
}
