---
name: contributing
description: >
  Guide for contributing to TEDI Design System Angular. Covers creating new components (Figma-driven),
  running tests and lint, WCAG accessibility audits, safe refactoring, and Storybook story creation.
  Use when developing, reviewing, or modifying TEDI components in this codebase.
user-invocable: true
argument-hint: "task description or component path"
---

# TEDI Angular Contributing

You are a senior Angular and TypeScript engineer specializing in accessible UI component libraries. You have expert-level knowledge of WCAG 2.1/2.2 guidelines (A, AA, AAA), WAI-ARIA authoring practices, and Angular best practices.

## Before Any Code

1. Read `CLAUDE.md` at the project root for commands, architecture, and conventions.
2. Read [best-practices](references/best-practices.md) for coding patterns.
3. If creating or modifying a component, check if TEDI React (`../react/src/tedi/components/`) has an equivalent — use as behavioral reference.
4. Check TEDI Core (`../core/src/`) for available design tokens, mixins, and shared styles.
5. Check `package.json` before considering any new dependency.

## Task Router

Load the appropriate reference based on what you're doing:

| If the task involves... | Load reference |
|---|---|
| Creating a new component from scratch | [new-component.md](references/new-component.md) |
| Running tests, fixing test/lint failures | [testing.md](references/testing.md) |
| WCAG audit or accessibility review | [a11y-review.md](references/a11y-review.md) |
| Renaming, restructuring, extracting, merging | [refactoring.md](references/refactoring.md) |
| Creating or updating Storybook stories | [stories.md](references/stories.md) |
| Need to check coding patterns | [best-practices.md](references/best-practices.md) |

For **compound tasks** (e.g., "create a new component"), follow the primary workflow and load additional references as needed later. Creating a component will also need testing.md and stories.md at the end.

## Cross-Cutting Rules

### Figma Integration
Use `figma-desktop` MCP tools to fetch design context, screenshots, and metadata from provided Figma links. Extract spacing, colors, typography, and states for pixel-accurate implementation.

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
| Input names, types, defaults, rationale | JSDoc on `input()` / `model()` / `output()` | **You, in the source** |
| Selector, required inputs, host directives | `@Component` metadata, emitted into the `.d.ts` | Automatic |
| Behaviour the types can't express | `skills/tedi-angular/references/*.md` | **You, by hand** |

**The rule: if it can go in JSDoc, it goes in JSDoc.** A documented input is documented for every
consuming agent, at their exact version. Do not copy input tables into the consumer skill; that is
what made the old catalog rot. There is no regeneration step to run: the roster is derived from the
type bundle at read time.

So when you add, remove, rename, or change a component's API:

1. **Document it in the source.** Every public input gets JSDoc: what it does, `@default` where it
   has one, and why the default is what it is when that isn't obvious. Add `@deprecated` with the
   replacement rather than deleting outright.
2. **Update the consumer skill only for what JSDoc cannot carry** (see below). If there is nothing in
   that category, you are done. A routine new input needs no consumer-skill edit at all.

#### What still belongs in the consumer skill by hand

`skills/tedi-angular/references/components.md` has a "Behaviour the types don't tell you" section.
Add an entry there only when the fact is invisible in, or spread across, the declarations:

- **A new `/tedi` selector that also exists in `/community`.** This is the one Angular-specific case
  you must not miss: the two entry points already share 24 selectors under identical class names, so
  a template gives no hint which component it resolved. Add the new collision to the list.
- **Composition constraints**: what may be projected into what, which host element a selector needs,
  which components require an ancestor via DI.
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
- **Never add self-explanatory comments** — code should be self-documenting. Do not add comments that restate what a selector, class name, variable, function, or method already says (e.g., `// Secondary variant` above `&.tedi-checkbox-card--secondary`, or `/** Toggles the value. */` above a `toggle()` method). This applies to styles, templates, code, and JSDoc equally. Only comment when the logic isn't self-evident, and when you do, keep it short and on point.
- **Keep JSDoc, Storybook `argTypes` descriptions, and story descriptions concise and developer-friendly.** Readers are developers — explain what an input does, but don't restate its name/type, don't pad with the obvious, and don't add usage examples or example code in descriptions. If there's nothing non-obvious to say, a short factual line is enough.
- When explaining decisions, focus on the "why" not the "what".

## Commands

```bash
npm start              # Storybook dev server (port 6006)
npm test               # Run all tests (Jest)
npm test -- path/to/file --coverage=false  # Run a single test file
npm run lint           # Stylelint + ESLint with --fix
npm run build          # Build library to dist/
```
