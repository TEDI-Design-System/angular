# PR Review

Run this before opening a PR, and use it when reviewing someone else's. Review from a fresh context
if your tool allows it (a subagent, a new session): the agent that wrote the code tends to accept its
own reasoning, so it misses the problems that reasoning caused. The review itself doesn't edit
files; whoever ran it fixes the findings afterwards.

## Input

Everything on the branch since `rc`, committed or not. Run `git fetch origin rc` first.

- `git diff $(git merge-base origin/rc HEAD)` for tracked files.
- `git ls-files --others --exclude-standard` for new files. Skip untracked files that won't be in
  the PR; ask if unsure.
- A moved file shows as a deletion plus an untracked file. Diff it against the old version in git,
  not on disk (the old path may be gone or a symlink to the new one):
  `git show $(git merge-base origin/rc HEAD):<old> | git diff --no-index - <new>`.

Read [best-practices.md](best-practices.md) first. Every finding cites `file:line` and the rule it
breaks.

## Checklist

### Input API ([best-practices.md → Input API](best-practices.md#input-api))

- [ ] Each new input has a consumer who needs it. Flag any input whose JSDoc says it has no effect.
- [ ] Names, aliases and inheritance match the sibling components in the same category.
- [ ] Names, units and defaults match TEDI React, and every claim about React matches its source.
- [ ] Each input with a default has an `@default`, and each `@default` and argTypes `defaultValue`
      matches the code.

### Prose ([best-practices.md → Comments and JSDoc](best-practices.md#comments-and-jsdoc))

- [ ] Input JSDoc follows the length and content rules. `@deprecated` naming the replacement is
      expected, not a finding.
- [ ] Code comments explain a *why* in one line. Delete any comment that restates a name.
- [ ] Story argTypes descriptions are one sentence and agree with the JSDoc. Story docblocks are
      usually empty ([stories.md](stories.md) section 8).

### Consumer skill (`skills/tedi-angular/references/`)

- [ ] Each new entry is something JSDoc can't carry
      ([SKILL.md → Consumer-Facing Docs](../SKILL.md#consumer-facing-docs)). Delete bullets that
      repeat input docs.
- [ ] New `/tedi` selectors are checked against `/community` for collisions.

### Reuse and simplicity

- [ ] New code doesn't duplicate an existing component, util, or core token or mixin.
- [ ] No dead code, unused inputs or needless indirection.

### Tests, a11y, stories

- [ ] Tests pass (`npx jest <component-path> --coverage=false`) and lint is clean without fixing
      (`npx stylelint "src/tedi/**/*.scss" && npx ng lint angular-components`).
- [ ] Interactive components or changed ARIA/keyboard behaviour pass [a11y-review.md](a11y-review.md).
- [ ] Changed stories pass the [stories.md](stories.md) checklist (section 6).

### Translations (`src/tedi/services/translation/translations.ts`)

- [ ] Each key's `components` list names only components that use it.
- [ ] New keys are grouped with their component's existing keys.

## Output

Findings ordered by severity. For a prose finding, give the replacement text, not just "too long".
Leave out findings that are speculative or only stylistic preferences against the project's own
conventions.
