# Visual regression testing

> How visual regression testing works in this repo, when it runs, what it costs, and how to keep
> that cost down when you add stories.

Visual regression is Chromatic, and only Chromatic. It snapshots every story, compares each one
against the baseline, and gives you a review UI to accept or reject what changed.

## When it runs

|            | Trigger                                                | Purpose                                                       |
| ---------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| Pre-merge  | a pull request is **approved**, or `workflow_dispatch` | the reviewer sees the diff before merging                     |
| Post-merge | push to `rc`                                           | the build of record, and the baseline for the next PR         |
| Release    | push to `main`                                         | re-baselines the release branch (`autoAcceptChanges: "main"`) |

- Pre-merge: `.github/workflows/angular-chromatic.yml`
- Post-merge and release: the `chromatic` job in `.github/workflows/angular-release.yml`

Neither build fails a PR (`exitZeroOnChanges: true`). A visual change is something to look at, not
a broken build. Both builds post a sticky comment on the pull request with the change count and a
link, and write a snapshot-usage table to the job summary.

A PR merged without an approval gets no pre-merge build. It is still covered by the `rc` push
build, which is where the change lands for review.

## Why it is not on every push

Chromatic bills per snapshot, and the TEDI **react and angular projects share one 35,000/month
quota**. An unchanged snapshot is not free: TurboSnap copies it from the baseline instead of
recapturing it, and a copy still bills at 0.2. So the floor for one angular build is roughly

```text
601 snapshots x 0.2 = ~120 billed, even when nothing changed
```

Building on every push to every open PR costs about three builds per PR, for a review nobody reads.
Approval is the point where someone is actually looking.

## Keeping the snapshot count down

The build currently has **709 stories, of which 601 are snapshotted**. The other 108 carry:

```ts
export const Position: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  // ...
};
```

Use `disableSnapshot` when a story adds no **visual** information that another story in the same
file does not already carry:

- a story whose only content is a trigger button, where the thing being demonstrated is the overlay
  that opens when you click it,
- a story that exists to document a code sample or an API shape in `docs.source`,
- a story that differs from its neighbour only in a prop that does not change rendering.

Do **not** use it to prune coverage for its own sake. A story that renders a genuinely different
visual state is exactly what the tool is for, and TurboSnap already makes an unchanged one cheap.
Table has 40 stories and all 40 are distinct table configurations; that is correct.

### Overlays: snapshot the open state, not the trigger

Chromatic captures whatever the story renders after its `play` function. A modal, popover, tooltip,
dropdown, select or date-field calendar that only renders a button is a picture of a button.

The pattern in this repo is a dedicated story that renders the overlay open, hidden from the
sidebar but still indexed, so Chromatic sees it while the docs page does not:

```ts
/**
 * Visual-regression only. Renders the tooltip open from inputs alone
 * (`openWith="none"` + `[open]="true"`), so the snapshot shows the bubble
 * rather than a bare trigger.
 */
export const OpenForVisualTest: Story = {
  // Hidden from the sidebar; still indexed, so Chromatic sees it.
  tags: ["!dev"],
  render: () => ({/* ... */}),
};
```

Where the component has no controlled-open input, open it with a `play` function instead
(`date-field.stories.ts` is the worked example). `tags: ["!dev"]` removes the story from the
sidebar only; it is not a Chromatic exclusion, which is `disableSnapshot` and nothing else.

## TurboSnap

`onlyChanged: true` in `chromatic.config.json`. Chromatic traces the files a PR changed through the
Storybook module graph and only recaptures the stories they can reach. Everything else is inherited
from the baseline at 0.2.

The snapshot-usage table in the job summary is how you tell whether it worked:

| metric                                | meaning                  |
| ------------------------------------- | ------------------------ |
| Captured (billed 1x)                  | actually re-rendered     |
| Inherited via TurboSnap (billed 0.2x) | copied from the baseline |

**Inherited at 0 on a small PR means TurboSnap did not engage.** The build log says why. It falls
back to a full rebuild, by design, when:

- a dependency changed in `package.json`,
- anything under `.storybook/` changed,
- something `preview.tsx` imports changed (today: the theme service and the theme/translation
  tokens),
- a file under `public/` or another `staticDirs` entry changed,
- there is no usable baseline build to compare against.

The last one is the failure mode to watch. It is what made TurboSnap a no-op here for months: with
no recent build on the base branch, Chromatic compared against a months-old baseline, saw ~1,100
changed files, and rebuilt everything. It stays healthy only as long as the `rc` push build keeps
running, which is why that build must never be skipped.

Requirements on our side: `fetch-depth: 0` on every checkout (a shallow clone cannot find the
baseline commit), and a `chromatic` CLI major that matches the Storybook major. The CLI being five
majors behind Storybook 10 was the other half of the same outage.

## Running it locally

```bash
CHROMATIC_PROJECT_TOKEN=<token> npm run chromatic
```

This builds Storybook and uploads, exactly as CI does. It counts against the shared quota, so
prefer the `workflow_dispatch` run on the PR branch.
