# Discovering Components

**This is a discovery guide, not a component snapshot.** The list of components and their exact inputs change on every release, so this file deliberately does **not** enumerate them. Instead it tells you how to read the always-current roster and input specs from the authoritative sources.

> For _where_ to fetch (version-pinned GitHub tags, live Storybook) and _how_ to pin to the consumer's installed version, see **SKILL.md → Authoritative Sources**. Don't guess input names or defaults from memory — fetch them.

## Two namespaces

`@tedi-design-system/angular` ships components under two entry points:

- **`/tedi`** — TEDI-Ready components. Production-grade, stricter rules. **Prefer these.**
- **`/community`** — Community/extended components. Relaxed linting, not a reference for TEDI patterns.

Several Community components are **deprecated** in favor of TEDI-Ready equivalents, and the set that has no TEDI-Ready alternative yet shifts over time. Don't rely on a memorized list — check the barrel export / component JSDoc / Storybook for the current deprecation status and whether a TEDI-Ready alternative exists before reaching into `/community`.

## Category map

TEDI-Ready components are organized by category under `tedi/components/`. Current top-level categories (verify against the repo tree — categories can be added or renamed):

`base` · `buttons` · `content` · `filter` · `form` · `helpers` · `layout` · `loader` · `navigation` · `notifications` · `overlay` · `tags`

This tells you _where_ to look; it does not enumerate what's inside.

## Enumerate the current components

The barrel exports are the authoritative, machine-readable component lists — they double as a source-path index:

- TEDI-Ready: `tedi/index.ts`
- Community: `community/index.ts`

Fetch the barrel **at the consumer's pinned tag** (see SKILL.md → Authoritative Sources) to get the exact roster for their version.

**Resolving a source path from a barrel line** — the Angular file convention is a per-component folder:

- Standard: `export * from './components/<category>/<name>'` → the folder `tedi/components/<category>/<name>/` holds `<name>.component.ts` (class), `.html`, `.scss`, `.spec.ts`, `.stories.ts`, and an `index.ts` barrel.
- Some entries are **directory-index barrels** that re-export a family of sub-components from one folder (e.g. a modal exporting `ModalComponent`, `ModalHeaderComponent`, `ModalFooterComponent`; a table exporting its toolbar/menu pieces). Open the folder's `index.ts` to see what it re-exports.

## Read a component's real inputs

1. **Source signals + JSDoc (canonical).** Open the `<name>.component.ts` and read its `input()` / `model()` / `output()` declarations and the JSDoc above them. The signature tells you the type, default (the argument to `input(default)`), whether it's required (`input.required()`), and whether it's two-way (`model()`). Follow any imported type aliases / union types for enum members (e.g. `ButtonVariant`, `IconSize`). Host directives and shared base directives can add further inputs — check the `hostDirectives` array.
2. **Storybook ArgTypes (rendered).** The live Storybook generates its props tables (via Compodoc) from that same source, with default values and enum members resolved. Good for a quick, readable view of one component.

## Capability patterns

Components commonly opt into shared capabilities — attribute vs element selectors, signal `input()` binding, two-way `model()` binding, and breakpoint-aware input values. See **SKILL.md → Component Patterns** for how each works; the component's selector and input types tell you which a given component supports.

## Data-table accessibility

When building data tables (the TEDI table is TanStack-based), the durable guidance (independent of exact input names):

- Give interactive cells and controls accessible names — don't rely on visual position alone.
- Don't signal errors or state by color only; pair color with text/icon so it survives for screen-reader and low-vision users.
- Provide labels for sorting, pagination, row expansion, and reordering controls (these are translated via `TediTranslationService`).

For the exact inputs, option names, and default label keys that wire this up, read the Table source/story (`content/table`) at the pinned tag — they change across versions.
