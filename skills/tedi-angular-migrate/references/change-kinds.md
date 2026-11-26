# Change kinds: how to find and apply them (Angular)

Release notes say _what_ changed. This file says how to find each kind of change in an Angular project
and how to apply it. Search with `rg` (or `grep -rn`) over the project's source, templates, styles and
tests; exclude `node_modules`, `dist` and `.tedi-migrate`. The commands below search `src`: replace it
with the project's source roots (for example `apps libs` in an Nx workspace) and drop folders that don't
exist.

Import paths: `@tedi-design-system/angular/tedi` (TEDI-ready) and `@tedi-design-system/angular/community`.
Selectors are `tedi-*` elements or attributes (`<button tedi-button>`, `<input tedi-text-field>`).

## Translation keys

TEDI copy is overridden with `TediTranslationService.addTranslations({...})` (or a provider that calls
it) and read with `translate('key')`, `track('key')` or the `tediTranslate` pipe.

- **Find:** `rg -n "addTranslations|tediTranslate|\.translate\(|\.track\(" src`, then the key itself, quoted
  and, for keys that are valid identifiers, unquoted: `rg -n "['\"]toast\.close['\"]" src`,
  `rg -n "\bcarousel\s*:" src`.
- **Removed key:** when the notes give a replacement key, move the override (and any read of the key) to
  it, keeping the project's wording. If the project already overrides the replacement key too, don't
  create a duplicate: when the two values differ, ask which wording to keep (`assisted`), then drop the
  old entry. Delete the override only when no replacement applies. If the mapping is unclear, make it
  `manual`.
- **Reshaped key** (function ↔ string, arguments added or removed): rewrite the override to the new
  signature; keep the project's wording. Extra trailing arguments the library no longer passes are dropped.
  The typecheck does not catch every reshape: an override that still declares a removed optional
  argument stays assignable. Find those by searching, not by compiling.
- **Meaning changed** (same key, new purpose, e.g. `carousel` became the role description): move the
  project's value to the new key the notes name, then set the old key only if the project wants to
  override the new meaning.
- **Tests:** a changed default string breaks tests that assert it. Take the old default from the unpacked
  `from` package (`.tedi-migrate/cache/packages/angular@<from>/fesm2022/*.mjs`) and search tests for it.
  If the project overrides the key, the test sees the project's string, not the default: check which one
  the test setup uses before changing the assertion.
- **Verify:** every overridden key exists in the target package
  (`.tedi-migrate/cache/packages/angular@<to>/fesm2022`, or `node_modules` after the install).

## Inputs, outputs and models

- **Find:** the selector, then the binding: `rg -n "<tedi-search|tedi-search " src` and
  `rg -n "\[?ariaLabel\]?=" <files>`. Also `(output)=` bindings, `[(model)]`, and component class access
  through `viewChild(SearchComponent)`.
- **Renamed:** rename the binding. Keep the bound expression.
- **Removed:** apply the replacement from the notes. No replacement → `manual`.
- **Meaning changed** (same name, different effect, e.g. Search `ariaLabel` names only the landmark now):
  `assisted`. Show what the project relied on and propose the new combination.
- **Type changed:** let the typecheck find the call sites, then fix each one.

## Default value changed

Example: `clearable` now defaults to `true`.

- **Find:** every usage of the component that does **not** set the input.
- `assisted`: ask once per change whether to keep the old behaviour (add the old value explicitly) or take
  the new default. Apply the answer to all usages.

## Component replaced (community → TEDI-ready)

- **Find:** imports from `@tedi-design-system/angular/community` and the old selector in templates.
- Follow the guide's steps in order: import, structure, inputs mapping, behaviour notes.
- Usually `assisted`: structure changes (projected content instead of inputs) need a look at each usage.
  Large templates or custom styling on the old internals → `manual` for that usage.

## Providers and injected services

Example: a component starts injecting a token or service that the app must provide.

- **Find:** where the app composes providers (`app.config.ts` `providers`, `bootstrapApplication`, or
  the root `NgModule`): `rg -n "provide[A-Z]|providers\s*:" src`.
- Add or change the provider as the notes say. A missing provider throws `NullInjectorError` at
  runtime only, so the build passes.
- **Hidden users.** A note may name only the service, while TEDI components inject it internally.
  Searching the project for the service is not enough: search the target bundles
  (`.tedi-migrate/cache/packages/angular@<to>/fesm2022/*.mjs`) for `inject(<Token>)` and cross-check the
  components that use it against the project's templates. Any hit the project uses makes the item
  `auto`, not `n/a`.

## Markup, roles and accessible names

Example: Alert's `role` moved from the host to an inner element; button names changed.

- **Find:** tests and selectors that rely on the old markup: `rg -n "getByRole|getByLabelText|getByText|querySelector|\[role=|aria-label" src e2e cypress playwright`
  plus CSS that targets internal classes of TEDI components.
- Update test queries to the new role, name or element. Update CSS selectors that targeted moved elements.
- Text assertions on announcements (`"Uuendatud. Uus väärtus"`) change with the notes' new strings.

## CSS classes and BEM names

- **Find:** `rg -n "tedi-old-class" src --glob "*.{scss,css,html,ts}"`.
- Rename in styles and templates. Selectors on TEDI internals are fragile: say so in the report.

## Removed or renamed exports

- **Find:** `rg -n "OldName" src`. The typecheck reports the rest.
- Rename the import and usages. No replacement → `manual`.

## Peer dependencies and framework version

- Compare `targetPeerDependencies` from `resolve-target.mjs` with the project's `@angular/*` and other peers.
- A required Angular major upgrade is **not** part of this skill: stop, tell the developer to run
  `ng update @angular/core @angular/cli` first (one major at a time), then continue.

## Core CSS variables (through the library)

Only when core comes in through `@tedi-design-system/angular` (`coreRange` is null in `detect-version`).

- **Find:** the project's custom properties that set or read a removed or renamed core variable:
  `rg -n --glob "*.{scss,css,html,ts}" -e '--old-name([^A-Za-z0-9_-]|$)' src` for each name, and
  `rg -n '\$old-scss-var([^A-Za-z0-9_-]|$)' src` for SCSS variables when the project `@use`s core SCSS.
  (`\b` would also match `--old-name-hover`.)
- Documented rename → `auto`. Value-matched rename candidate from `diff-core-vars.mjs` that the notes don't
  confirm → `assisted`. Removed with no replacement → `manual`.

## Choices that affect other items

Some `assisted` answers change what another item must do: choosing `role="none"` for an alert means a
test can no longer find it by `[role="alert"]`. Write `Depends on: <item>` on the dependent item and apply
it after the choice is made.

## Behaviour changes without code changes

Announcements, focus order, layout. Nothing to edit unless tests assert the old behaviour or the project
worked around the old behaviour (remove the workaround: `assisted`). Otherwise `n/a`, listed in the
report so the developer can check the UI.
