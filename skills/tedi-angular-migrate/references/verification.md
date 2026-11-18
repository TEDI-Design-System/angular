# Verification

Run once all plan items up to the installed target are applied, and at the end. Record each command and
result in the plan.

## Project checks

Find the commands in `package.json` scripts; ask once if it isn't clear which ones to use.

1. Typecheck (`ng build` covers templates; `tsc --noEmit -p tsconfig.app.json` is faster for TS only).
2. Build.
3. Lint.
4. Unit tests. End-to-end tests only if the developer asks; they are slow and may need a running backend.
5. **Render smoke test.** Add a throwaway test that renders the root component once with the app's root
   providers and fails on any thrown error or `console.error`. Standalone app: `AppComponent` with the
   `providers` of `app.config.ts` (or of `bootstrapApplication` in `main.ts`). `NgModule` app: import the
   root module into the testing module (`TestBed.configureTestingModule({ imports: [AppModule] })`) and
   create its bootstrap component. If no root can be identified, record the check as `not run` with the
   reason and list it under **Needs you**. Run it, record the result, then delete it (unless the developer wants
   to keep it). Typecheck, build and the project's tests all pass when a component throws only at
   render time, for example because a provider it needs is missing.

A failure is either a plan item not applied yet, a plan item applied wrongly, or a change the notes
missed. Fix the first two. Add the third to the plan as a new item (`manual` when you can't tell what the
right fix is) with the error text.

Never make a check pass by weakening it: no new `any`, `as unknown as`, `// @ts-ignore`, skipped tests or
lint disables. After the run, the migration's diff must not add any of those: check the lines `git diff`
adds that are not already in `.tedi-migrate/start.diff` (the developer's uncommitted changes from step 0).

## Doctor checks

- **One copy of TEDI and core:** `npm ls @tedi-design-system/angular @tedi-design-system/core` (or the
  `pnpm why` / `yarn why` equivalent). Two versions of core means two sets of CSS variables.
- **Peers satisfied:** the install printed no peer-dependency warnings for TEDI.
- **Styles still resolve:** every TEDI path in `angular.json` `styles` and in SCSS `@use`/`@import` exists in
  `node_modules`.
- **Translation overrides only use existing keys:** each key in `addTranslations` calls is found in the
  installed package bundle.
- **No leftovers:** re-run the search of every `auto` item; the old pattern has no hits.
- **Deprecation warnings:** run the app or tests in dev mode and look for `[TEDI] … is deprecated` in the
  console output; each one is a `deprecated` item.
