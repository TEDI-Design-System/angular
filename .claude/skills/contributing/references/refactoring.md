# Safe Refactor TEDI Component

Target: `$ARGUMENTS`

## Step 1: Understand the Blast Radius

1. Read the component being refactored — all files (`.ts`, `.html`, `.scss`, `.spec.ts`, `.stories.ts`).
2. Find all consumers:
   - Search for imports of the component across `tedi/` and `src/`.
   - Search for the component selector in templates.
   - Check barrel exports (`index.ts` files) that re-export it.
3. List all affected files before making any changes.

## Step 2: Baseline Tests

Run the full test suite and record the result:
```bash
npm test
```

If any tests fail before your changes, note them — they are pre-existing failures, not caused by your refactor.

## Step 3: Plan

Enter plan mode. The plan must cover:

- **What changes** — exact files and what changes in each
- **Consumer impact** — which files need updating and why
- **Public API changes** — any changes to inputs, outputs, selectors, or exported types
- **Migration path** — if the public API changes, how consumers should update
- **Risk assessment** — what could break, ordered by likelihood

## Step 4: Execute

Apply changes in this order:
1. **Internal implementation** — component logic, template, styles
2. **Public API** — inputs, outputs, selector (only if needed)
3. **Barrel exports** — update `index.ts` files if paths or names changed
4. **Consumers** — update all files that import or use the component
5. **Tests** — update spec files to match new API/behavior
6. **Stories** — update Storybook stories to match new API

## Step 5: Code Review

Run `/simplify` — a Claude Code skill available in this repository that reviews the changed code for reuse opportunities, simplification, efficiency, and altitude cleanups, then proposes fixes. Fix all valid findings before proceeding.

A finding is **valid** when it is confirmed against the current code (not stale or already addressed), preserves behavior and the public API, and aligns with `best-practices.md`. Skip findings that are speculative, purely stylistic against project conventions, or would change behavior — note briefly why a finding was skipped.

## Step 6: Verify

1. Run the specific component test: `npm test -- <component-path> --coverage=false`
2. Run the full test suite: `npm test`
3. Run lint: `npm run lint`
4. Compare test results with the baseline from Step 2 — no new failures allowed.

## Step 7: Update Consumer-Facing Docs

Only if the refactor changed anything a consumer can observe — the public API, or behavior that
callers can see but the types cannot express. See **SKILL.md → Consumer-Facing Docs** for the
contract.

1. **Update the JSDoc** on every input you renamed, retyped, or whose default changed. Add
   `@deprecated` with the replacement to anything you deprecated rather than removed.
2. **Renamed a selector?** That is the highest-risk change in this library, because a stale selector
   in a consumer template renders nothing with no error. Check whether the new selector collides with
   a Community one, and grep `skills/tedi-angular/references/` for the old selector string.
3. **Reconcile `references/components.md`.** Its "Behaviour the types don't tell you" entries name
   components, selectors and inputs, so a rename can leave them pointing at nothing. Two cases are
   easy to miss:
   - **You fixed the trap.** If the refactor makes a documented gotcha impossible, or moves the fact
     into JSDoc where it belongs, **delete the entry**. Stale traps are worse than no traps.
   - **You created one.** A behaviour change callers cannot see in the types needs a new entry.
4. **Renamed or removed a token?** Update `references/theming.md`.
5. **Breaking change?** It also needs a consumer migration guide rather than a buried reference edit.

## Step 8: Report

Summarize:
- Files changed (with brief description of each change)
- Public API changes (if any)
- Test results: before vs. after
- Any manual verification needed (e.g., visual review in Storybook)
