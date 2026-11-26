---
name: contributing
description: >
  Guide for contributing to TEDI Design System Angular. Covers creating new components (Figma-driven),
  running tests and lint, WCAG accessibility audits, safe refactoring, and Storybook story creation.
  Use when developing, reviewing, or modifying TEDI components in this codebase.
---

# TEDI Angular Contributing

## Before Any Code

1. Read [best-practices](references/best-practices.md) for coding patterns.
2. If creating or modifying a component, check if TEDI React (`../react/src/tedi/components/`) has an equivalent; use it as a behavioural reference.
3. Check the installed TEDI Core (`node_modules/@tedi-design-system/core/`: `variables/`, `tokens.json`, `_mixins.scss`) for available design tokens, mixins, and shared styles. It matches the version the library builds against. Read `../core/src/` only when core is being changed together with the component.
4. Check `package.json` before considering any new dependency.

## Task Router

Load the appropriate reference based on what you're doing:

| If the task involves... | Load reference |
|---|---|
| Creating a new component from scratch | [new-component.md](references/new-component.md) |
| Running tests, fixing test/lint failures | [testing.md](references/testing.md) |
| WCAG audit or accessibility review | [a11y-review.md](references/a11y-review.md) |
| Renaming, restructuring, extracting, merging | [refactoring.md](references/refactoring.md) |
| Creating or updating Storybook stories | [stories.md](references/stories.md) |
| Deprecating a component, removing its docs, or removing it from code | [deprecation.md](references/deprecation.md) |
| Need to check coding patterns | [best-practices.md](references/best-practices.md) |
| Reviewing a PR, or finishing work before opening one | [pr-review.md](references/pr-review.md) |

For **compound tasks** (e.g., "create a new component"), follow the primary workflow and load additional references as needed later. Creating a component will also need testing.md and stories.md at the end.

## Cross-Cutting Rules

### Figma Integration
Use the Figma MCP server (desktop or remote) to fetch design context, screenshots, and metadata from provided Figma links. Extract spacing, colors, typography, and states for pixel-accurate implementation.

### Third-Party Libraries
Always prefer existing dependencies. When a new one is needed, **stop and ask for permission** with: library name, why it's needed, alternatives considered, and bundle size impact.

### Parallel Work
For bulk tasks (e.g., "audit all form components for a11y"), launch parallel agents — one per component — to speed up the work. Collect and summarize results.

### Consumer-Facing Docs

Consumers get their component knowledge from the **published package**, not from a hand-written
list. ng-packagr rolls each entry point into one flattened `index.d.ts` that carries your JSDoc
*and* Angular's compiler metadata, so a component's selector, inputs, required flags and host
directives are all machine-readable at the version the consumer installed.

| Layer | Where | Who maintains it |
|---|---|---|
| Input names, types, defaults | JSDoc on `input()` / `model()` / `output()` | **You, in the source** |
| Selector, required inputs, host directives | `@Component` metadata, emitted into the `.d.ts` | Automatic |
| Behaviour the types can't express | `skills/tedi-angular/references/*.md` | **You, by hand** |

**The rule: what an input does goes in its JSDoc, not in the consumer skill.** A documented input is
documented for every consuming agent, at their exact version. Do not copy input tables into the
consumer skill; that is what made the old catalog rot. There is no regeneration step to run: the
roster is derived from the type bundle at read time.

So when you add, remove, rename, or change a component's API:

1. **Document it in the source.** Every public input gets JSDoc and `@default` where it has one
   (rules: [best-practices.md → Comments and JSDoc](references/best-practices.md#comments-and-jsdoc)).
   Add `@deprecated` with the replacement rather than deleting outright. Deprecating a whole component
   follows [deprecation.md](references/deprecation.md).
2. **Update the consumer skill only for what JSDoc cannot carry** (see below). If there is nothing in
   that category, you are done. A routine new input needs no consumer-skill edit at all.

#### What still belongs in the consumer skill by hand

`skills/tedi-angular/references/components.md` has a "Behaviour the types don't tell you" section.
Add an entry there only when the fact is invisible in, or spread across, the declarations:

- **A new `/tedi` selector that also exists in `/community`.** This is the one Angular-specific case
  you must not miss: the two entry points already share many selectors under identical class names, so
  a template gives no hint which component it resolved. Add the new collision to the list.
- **Composition constraints**: what may be projected into what, which host element a selector needs,
  which components require an ancestor via DI.
- **A caveat shared by several inputs**, written once instead of on each input.
- **Choosing between components**: this one is the low-level primitive, reach for that one instead.
- **Responsive behaviour that isn't an input**: layout that restacks or hides itself at a breakpoint.
- **Accessibility requirements a declaration won't convey**: an input that is optional in the types
  but required in practice, or the only compliant way to wire something up.

Also update, in the same pass:

- `references/forms.md` when you change a control's selector, value shape, or `ControlValueAccessor`
  behaviour. Selectors especially: an attribute-versus-element mistake renders nothing, silently.
- `references/theming.md` when tokens are added, renamed, or removed.
- `SKILL.md`'s pitfalls list when you have found a *new* way for consumers to get it wrong.

**Deleting entries counts.** If you fix the source so a documented trap no longer exists, or make it
expressible in JSDoc, remove its entry in the same PR. That section is only trustworthy if it shrinks
as well as grows.

### Communication
- Be direct and concise.
- **Prose defaults to nothing.** Over-describing is the most common note on this repo's reviews. Rules
  for comments and JSDoc: [best-practices.md → Comments and JSDoc](references/best-practices.md#comments-and-jsdoc).
  For stories: [stories.md](references/stories.md) section 8.
- When explaining decisions, focus on the "why" not the "what".
