# Deprecating a Component

The procedure comes from [ADR-004](https://github.com/TEDI-Design-System/general/blob/main/ADR/Development/ADR-004-deprecation-process.md).
It applies to a whole component or directive. A single deprecated input only needs `@deprecated` JSDoc with
the replacement.

## The window: 6 + 3 months

Removal from the code comes nine months after deprecation, in three steps. T0 is the **main** release
whose notes announce the deprecation. Dates are month-precise.

| Step | When | Breaking |
|---|---|---|
| 1. Deprecate | T0 | No |
| 2. Remove documentation + last call | T+6 | No |
| 3. Remove from code | T+9 | **Yes** |

Rules that are easy to get wrong:

- **Never do step 3 while step 2 is undone.** If the docs were not removed on time, do step 2 in the next
  release and announce a new code removal month, at least three months after that announcement. Missed
  communication is never made up retroactively.
- **Removal months are only in release notes and announcements.** Never put a month in `@deprecated`
  text, the runtime warning or the Storybook badge. Those copies drift.
- Dates announced before ADR-004 as "targeted for removal in {month}" now mean the **step 2** month. Code
  removal is three months later.

## Step 1: Deprecate (T0)

All in the same PR:

1. **`@deprecated` JSDoc** on the class, naming the replacement and its entry point:
   ```ts
   /**
    * @deprecated Use Tag from TEDI-ready instead. This component will be removed from future versions.
    */
   ```
2. **Runtime warning** as the first statement of the constructor, via `warnDeprecated` from
   `src/tedi/utils/deprecation.util.ts`. It warns in dev mode only (`isDevMode()`) and once per name, so
   do not add your own guards:
   ```ts
   import { warnDeprecated } from "@tedi-design-system/angular/tedi";

   constructor() {
     warnDeprecated("Community tedi-tag", "Use Tag from TEDI-ready instead.");
   }
   ```
   - `name`: the selector as written, prefixed with `Community ` for community components, since
     many selectors exist in both entry points (`Community tedi-tag`, `Community [tedi-input]`).
   - `message`: the replacement sentence from the `@deprecated` text, without the removal boilerplate.
   - **Base classes** that other components extend: start the constructor with
     `if (new.target !== InputComponent) return;` so a subclass only logs its own warning, not its
     parent's as well.
   - **Selectorless directives** that only serve as `hostDirectives` of deprecated components get no
     warning. The host component already warns.
   - **Rendered by other library code?** Its warning then reaches consumers who never used it. Switch
     that code to the replacement where it is a drop-in; otherwise flag it in the PR. The only case
     today is community `tedi-multiselect` rendering community `[tedi-input]`, `tedi-checkbox` and
     `tedi-tag`, which is acceptable because it is deprecated itself.
   - The badge, JSDoc and warning always go together: a story badged `deprecated` without a
     `@deprecated` class and a warning is an incomplete step 1.
3. **Storybook badge**: add `"deprecated"` to the story's status, next to its existing entries:
   ```ts
   parameters: { status: { type: ["existsInTediReady", "deprecated"] } },
   ```
4. **Migration guide**: goes into the rc release description on GitHub (use the `tedi-migration-guide`
   skill).
5. **Release notes** of the main release: a row in the `### Deprecations` table (Deprecated /
   Replacement / Since / Migration guide) with "targeted for removal in {T+6 month}". This is the
   documentation removal month.

A deprecated component stays fully working. Do not change its behaviour or styles.

## Step 2: Remove documentation (T+6)

One issue per release covers every component whose six-month window ends in it (tracked through the
release checklist).

1. **Delete the component's stories file(s).** Nothing else.
2. Grep for leftover documentation references to the story (its title, story id such as
   `community-tags-tag--default`, and file path) in MDX, docs and Storybook config, and remove them.
3. **Keep** the component, template, styles, exports, `@deprecated` JSDoc and runtime warning untouched.
   Consumer code must be unaffected.
4. Release notes and a **separate** Slack post carry the conditional last call, naming the component,
   replacement, code removal month and migration guide link:
   > The components listed above have been removed from the documentation. They are still exported and
   > working. They will be removed from the codebase in the **{T+9 month}** release, unless there is a good
   > reason to postpone.

Postponing: a consumer who needs more time says so within the three months, with a concrete reason. The
team decides at the development meeting and announces any new date. Without a reaction, removal goes
ahead as planned.

## Step 3: Remove from code (T+9)

1. Confirm step 2 happened (see the rule above). If not, stop and do step 2 instead.
2. Delete the component folder and its exports from the category `index.ts` barrels.
3. Remove it from `skills/tedi-angular/references/components.md` (the Community/TEDI selector collision
   list) and any other consumer-skill mentions.
4. Commit as a breaking change and add a BREAKING CHANGE entry to the release notes. Separate Slack post
   as in step 2.
