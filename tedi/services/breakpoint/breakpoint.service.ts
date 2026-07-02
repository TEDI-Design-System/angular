import {
  computed,
  Injectable,
  InputSignal,
  Signal,
  signal,
  inject,
} from "@angular/core";
import { BreakpointObserver } from "@angular/cdk/layout";

/**
 * Grid breakpoints in `rem`, mirroring `$grid-breakpoints` in
 * `@tedi-design-system/core`. `rem` is used (instead of `px`) so breakpoints
 * resolve against the browser's base font size and scale with the user's font
 * preference — keeping these JS breakpoints aligned with the rem-based CSS
 * tokens at any zoom / font-size setting.
 */
export const BREAKPOINTS = {
  xs: 0,
  sm: 36,
  md: 48,
  lg: 62,
  xl: 75,
  xxl: 87.5,
} as const;

const breakpointsOrder: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "xxl"];

export type Breakpoint = keyof typeof BREAKPOINTS;

export type BreakpointInputs<TInputs> = {
  [K in keyof TInputs]: InputSignal<TInputs[K]>;
} & Partial<Record<Breakpoint, InputSignal<TInputs | undefined>>>;

export type BreakpointInputsWithoutSignals<TInputs> = TInputs &
  Partial<Record<Breakpoint, TInputs>>;

export type BreakpointObject<T> = { xs: T } & Partial<
  Record<Exclude<Breakpoint, "xs">, T>
>;
export type BreakpointInput<T> = T | BreakpointObject<T>;

/**
 * Flag that toggles a feature on/off, optionally only below a breakpoint.
 * `true` — always on. `false` — always off. A breakpoint name — on below that breakpoint.
 *
 * `'xs'` is intentionally excluded: "below xs" has no meaningful viewport and would
 * be a confusing duplicate of `true`. Use `true` for always-on.
 */
export type BreakpointFlag = boolean | Exclude<Breakpoint, "xs">;

@Injectable({
  providedIn: "root",
})
export class BreakpointService {
  private breakpointObserver = inject(BreakpointObserver);

  private readonly _currentBreakpoint = signal<Breakpoint | undefined>(
    undefined,
  );
  constructor() {
    this.breakpointObserver
      .observe(
        Object.values(BREAKPOINTS).map((value) => `(min-width: ${value}rem)`),
      )
      .subscribe((state) => {
        if (state.breakpoints[`(min-width: ${BREAKPOINTS.xxl}rem)`]) {
          this._currentBreakpoint.set("xxl");
        } else if (state.breakpoints[`(min-width: ${BREAKPOINTS.xl}rem)`]) {
          this._currentBreakpoint.set("xl");
        } else if (state.breakpoints[`(min-width: ${BREAKPOINTS.lg}rem)`]) {
          this._currentBreakpoint.set("lg");
        } else if (state.breakpoints[`(min-width: ${BREAKPOINTS.md}rem)`]) {
          this._currentBreakpoint.set("md");
        } else if (state.breakpoints[`(min-width: ${BREAKPOINTS.sm}rem)`]) {
          this._currentBreakpoint.set("sm");
        } else if (state.breakpoints[`(min-width: ${BREAKPOINTS.xs}rem)`]) {
          this._currentBreakpoint.set("xs");
        } else {
          this._currentBreakpoint.set(undefined);
        }
      });
  }

  currentBreakpoint() {
    return computed(() => {
      return this._currentBreakpoint();
    });
  }

  getBreakpointInputs<TInputs>(
    inputs: BreakpointInputsWithoutSignals<TInputs>,
  ): TInputs {
    let resolvedInputs: Partial<TInputs> = {};

    Object.keys(inputs).forEach((key) => {
      if (!breakpointsOrder.includes(key as Breakpoint)) {
        const baseInput = inputs[key as keyof TInputs];
        resolvedInputs[key as keyof TInputs] = baseInput;
      }
    });

    const currentBreakpoint = this._currentBreakpoint();

    if (!currentBreakpoint) {
      return resolvedInputs as TInputs;
    }

    for (let i = 0; i <= breakpointsOrder.indexOf(currentBreakpoint); i++) {
      const breakpoint = breakpointsOrder[i];
      const breakpointInputs = inputs[breakpoint];

      if (breakpointInputs) {
        resolvedInputs = { ...resolvedInputs, ...breakpointInputs };
      }
    }

    return resolvedInputs as TInputs;
  }

  isBelowBreakpoint(breakpoint: Breakpoint | Signal<Breakpoint>) {
    return computed(() => {
      const current = this._currentBreakpoint();

      if (!current) return false;

      const bp = typeof breakpoint === "function" ? breakpoint() : breakpoint;

      const currentIndex = breakpointsOrder.indexOf(current);
      const targetIndex = breakpointsOrder.indexOf(bp);

      return currentIndex < targetIndex;
    });
  }

  isAboveBreakpoint(breakpoint: Breakpoint | Signal<Breakpoint>) {
    return computed(() => {
      const current = this._currentBreakpoint();

      if (!current) return false;

      const bp = typeof breakpoint === "function" ? breakpoint() : breakpoint;

      const currentIndex = breakpointsOrder.indexOf(current);
      const targetIndex = breakpointsOrder.indexOf(bp);

      return currentIndex >= targetIndex;
    });
  }
}

export function breakpointInput<T>(
  input: BreakpointInput<T>,
): BreakpointObject<T> {
  if (typeof input === "object" && input !== null && "xs" in input) {
    return input;
  }

  return { xs: input };
}
