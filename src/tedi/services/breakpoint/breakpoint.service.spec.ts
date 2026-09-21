import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { BreakpointObserver, BreakpointState } from "@angular/cdk/layout";
import { BreakpointService } from "./breakpoint.service";

describe("BreakpointService", () => {
  let state$: Subject<BreakpointState>;
  let observedQueries: string[];

  beforeEach(() => {
    state$ = new Subject<BreakpointState>();
    observedQueries = [];

    const observerMock: Pick<BreakpointObserver, "observe"> = {
      observe: (queries: string | readonly string[]) => {
        observedQueries = Array.isArray(queries) ? [...queries] : [queries];
        return state$.asObservable();
      },
    };

    TestBed.configureTestingModule({
      providers: [
        BreakpointService,
        { provide: BreakpointObserver, useValue: observerMock },
      ],
    });
  });

  it("observes rem-based min-width media queries", () => {
    TestBed.inject(BreakpointService);

    expect(observedQueries).toEqual([
      "(min-width: 0rem)",
      "(min-width: 36rem)",
      "(min-width: 48rem)",
      "(min-width: 62rem)",
      "(min-width: 75rem)",
      "(min-width: 87.5rem)",
    ]);
  });

  it("resolves the current breakpoint from the matched rem queries", () => {
    const service = TestBed.inject(BreakpointService);

    state$.next({
      matches: true,
      breakpoints: {
        "(min-width: 0rem)": true,
        "(min-width: 36rem)": true,
        "(min-width: 48rem)": true,
        "(min-width: 62rem)": false,
        "(min-width: 75rem)": false,
        "(min-width: 87.5rem)": false,
      },
    });

    expect(service.currentBreakpoint()()).toBe("md");
    expect(service.isAboveBreakpoint("md")()).toBe(true);
    expect(service.isBelowBreakpoint("lg")()).toBe(true);
    expect(service.isBelowBreakpoint("md")()).toBe(false);
  });
});
