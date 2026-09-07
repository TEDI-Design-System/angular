# Create New TEDI Component

## Prerequisites

A Figma link MUST be provided: `$ARGUMENTS`

If no Figma link was provided, stop immediately and ask the user for one. Do not proceed without design reference.

## Step 1: Gather Context

1. Use `figma-desktop` MCP to fetch design context, screenshots, and metadata from the Figma link.
2. Check if TEDI React (`../react/src/tedi/components/`) has an equivalent component — use as behavioral reference.
3. Check TEDI Core (`../core/src/`) for available design tokens and shared styles.

## Step 2: Plan

Enter plan mode and create a detailed plan covering:

- **Component name** and selector (`tedi-` prefix)
- **Category** — which folder under `src/tedi/components/` it belongs to
- **API design** — all inputs (with types and defaults), outputs, content projection slots
- **Responsive inputs** — for each input, check if the React equivalent uses `BreakpointSupport<T>` or `BreakpointInput<T>`. If yes, plan the Angular equivalent (see "Responsive Inputs (Breakpoint Support)" in best-practices.md for pattern A vs B). Even without a React reference, ask: would consumers reasonably need to vary this input per breakpoint? If so, add breakpoint support up front — retrofitting later is a breaking change.
- **Accessibility** — ARIA roles, keyboard interactions, screen reader behavior, focus management
- **Dependencies** — existing TEDI components to reuse, third-party libraries if needed
- **File list** — every file to create
- **Test plan** — what to test (inputs, outputs, states, keyboard, a11y, form integration if applicable)
- **Stories plan** — which stories to create (match all Figma variants); include a responsive-case story for any breakpoint-aware input

If a new dependency is needed, stop and ask the user for permission.

## Step 3: Scaffold Files

Create the following files in `src/tedi/components/<category>/<component-name>/`:

```text
component-name.component.ts
component-name.component.html
component-name.component.scss
component-name.component.spec.ts
component-name.stories.ts
index.ts
```

## Step 4: Implement

Follow all patterns from best-practices:
- Standalone, OnPush, ViewEncapsulation.None
- Signal-based inputs (`input()`, `model()`, `output()`)
- BEM SCSS with `tedi-` prefix, using design tokens
- Form controls MUST implement `ControlValueAccessor` with `NG_VALUE_ACCESSOR` provider (using `forwardRef()` and `multi: true`) for reactive forms integration. Test with a host component using `ReactiveFormsModule` and `FormControl`.
- Full WCAG compliance (roles, keyboard nav, focus, aria attributes)

## Step 5: Export

1. Create barrel export in `index.ts`
2. Add export to the parent category `index.ts` (e.g., `src/tedi/components/form/index.ts`)

## Step 6: Code Review

Run `/simplify` — a Claude Code skill available in this repository that reviews the changed code for reuse opportunities, simplification, efficiency, and altitude cleanups, then proposes fixes. Fix all valid findings before proceeding.

A finding is **valid** when it is confirmed against the current code (not stale or already addressed), preserves behavior and the public API, and aligns with `best-practices.md`. Skip findings that are speculative, purely stylistic against project conventions, or would change behavior — note briefly why a finding was skipped.

## Step 7: Verify

1. Run tests: `npx jest src/tedi/components/<category>/<component-name>/`
2. Fix any failures.
3. Run lint: `npm run lint`
4. Fix any lint errors.

## Step 8: Publish It to Consumers

Consumers read the component out of the published type bundle, so most of the work here is making
sure that bundle says the right thing. See **SKILL.md → Consumer-Facing Docs** for the full contract.

1. **Check the JSDoc is complete** before anything else. Every public `input()` / `model()` /
   `output()` needs a one-line description and an `@default` where it has a default. This JSDoc is
   what a consuming agent reads to write correct code, so an undocumented input is an invisible one.
2. **Check the selector for a collision with `/community`.** If a Community component already uses
   the same selector, you have created an ambiguity that no template reveals; add it to the collision
   list in `skills/tedi-angular/references/components.md`.
3. **Add a hand-written entry to `references/components.md` only if** the component has behaviour the
   types cannot express: a projection constraint, a required ancestor, layout that restacks at a
   breakpoint, an accessible name that is optional in the types but required in practice. A
   well-documented component with no surprises needs **no** entry. Do not add an input table.
4. **If it is a form control**, add its selector and value shape to `references/forms.md`, and say
   whether it implements `ControlValueAccessor` itself.
