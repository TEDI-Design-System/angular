---
name: tedi-angular
description: >
  Build UIs with @tedi-design-system/angular — the official Estonian government Angular component
  library (`@tedi-design-system/angular`). Use whenever the user is integrating, importing, or
  composing TEDI components in a downstream Angular app: `tedi-button`, `tedi-alert`,
  `tedi-text-field`, `tedi-select`, `tedi-card`, `tedi-tooltip`, `tedi-dropdown`, `tedi-tabs`,
  `tedi-toggle`, `tedi-pagination`, `tedi-modal`, `tedi-table`, etc. Triggers on theming with TEDI
  design tokens, switching dark/light theme via `ThemeService`, configuring `provideTedi`,
  translations via `TediTranslationService`, reactive-forms integration through
  `ControlValueAccessor`, responsive breakpoint inputs, and standalone-component imports. Do NOT
  use when contributing to the TEDI library repo itself — use `tedi-angular-contributing` for that.
---

# TEDI Design System — Angular

Angular component library with 40+ accessible, standalone components. Built on Angular 20+ with signal-based APIs (`input()`, `model()`, `output()`), `ViewEncapsulation.None` + BEM styling, and design tokens from `@tedi-design-system/core`.

## Authoritative Sources

This skill teaches the integration idiom and the traps. It is **not** an input reference: the
library ships fast and any input list here would be stale. Read inputs from the installed package.

### Read the installed package, not the internet

The consumer's `node_modules` is the best source available: it is the exact version their code
compiles against, it needs no network, and it is greppable with ordinary tools. Prefer it over
GitHub and Storybook in every case.

```
node_modules/@tedi-design-system/angular/tedi/index.d.ts       # TEDI-Ready: every component
node_modules/@tedi-design-system/angular/community/index.d.ts  # Community
node_modules/@tedi-design-system/core/tokens.json              # every design token, resolved
```

ng-packagr rolls each entry point into **one flattened declaration file** rather than a
per-component tree, so `tedi/index.d.ts` is a single greppable catalog of the whole library. JSDoc
is preserved, and Angular's compiler metadata makes each component's **selector** and **required
inputs** machine-readable. That matters more here than in React: a selector cannot be inferred from
a class name, and getting it wrong renders nothing with no error.
[references/components.md](references/components.md) has the commands.

Confirm the version you are reading, so you can say what your answer applies to:

```bash
npm ls @tedi-design-system/angular @tedi-design-system/core
```

### When there is no install to read

Only when `node_modules` is unavailable (planning before install, or reviewing a diff), fall back to
the public repo, pinned to the **resolved** version from the lockfile. `package.json` holds a semver
range (`^8.0.1`), which is not a tag; the lockfile records the exact version that was installed:

```bash
# npm
grep -A2 '"node_modules/@tedi-design-system/angular"' package-lock.json
# pnpm / yarn: search the lockfile for the @tedi-design-system/angular entry
grep -A2 '@tedi-design-system/angular' pnpm-lock.yaml yarn.lock
```

**Tag format is `angular-<resolved version>`** (e.g. `angular-8.0.1-rc.5`). Every release,
pre-releases included, is tagged, so use the tag rather than `main`.

> **Ignore the legacy `v*` tags.** The repo also carries ~430 old `v<version>` tags, the newest of
> which (`v11.0.0-rc.5`, January 2025) has a *higher* version number than any current release. They
> predate the package as it ships today. Sorting tags by version and taking the highest gets you
> year-old code. Match `angular-*` only.

**Source lives under `src/`**: TEDI-Ready in `src/tedi/components/`, Community in
`src/community/components/`, barrels at `src/tedi/index.ts` and `src/community/index.ts`. Fetch raw
files, not blob pages:

```
https://raw.githubusercontent.com/TEDI-Design-System/angular/angular-8.0.1-rc.5/src/tedi/index.ts
https://raw.githubusercontent.com/TEDI-Design-System/angular/angular-8.0.1-rc.5/src/tedi/components/buttons/button/button.component.ts
```

In source, a component's spec is its `selector`, its `input()` / `model()` / `output()` declarations
with their JSDoc, its exported type aliases, and its `hostDirectives`.

### Canonical references

- **Source & tags**: [github.com/TEDI-Design-System/angular](https://github.com/TEDI-Design-System/angular)
- **Live Storybook (Compodoc args tables + runnable examples)**: [storybook.tedi.ee/angular/main](https://storybook.tedi.ee/angular/main/?path=/docs/documentation-get-started--get-started). It tracks `main`, so the installed bundle wins on any disagreement.
- **Design system wiki** (cross-framework guidelines): [github.com/TEDI-Design-System/general/wiki](https://github.com/TEDI-Design-System/general/wiki)
- **Releases & changelog**: [releases](https://github.com/TEDI-Design-System/angular/releases), [CHANGELOG.md](https://github.com/TEDI-Design-System/angular/blob/main/CHANGELOG.md), [issues](https://github.com/TEDI-Design-System/angular/issues)
- **npm**: [@tedi-design-system/angular](https://www.npmjs.com/package/@tedi-design-system/angular)
- **Sibling packages**: [@tedi-design-system/core](https://www.npmjs.com/package/@tedi-design-system/core) (tokens, SCSS, icons), [@tedi-design-system/react](https://www.npmjs.com/package/@tedi-design-system/react) (useful for behavioural parity questions)

**Never invent an input or a selector.** If you can't find it in the type bundle, it doesn't exist.
Say so instead of guessing a plausible name.

## Installation

```bash
npm install @tedi-design-system/angular @tedi-design-system/core
```

`@tedi-design-system/core` is pulled in transitively as a direct dependency of the Angular package, so installing it explicitly is optional — but listing it keeps token/SCSS imports obvious.

### Peer Dependencies

```
@angular/core:             ^20.0.0 || ^21.0.0 || ^22.0.0
@angular/common:           ^20.0.0 || ^21.0.0 || ^22.0.0
@angular/forms:            ^20.0.0 || ^21.0.0 || ^22.0.0
@angular/cdk:              ^20.0.0 || ^21.0.0 || ^22.0.0
@angular/platform-browser: ^20.0.0 || ^21.0.0 || ^22.0.0
```

## Setup

### 1. Provide TEDI configuration

Add `provideTedi` to your application providers. It sets the default theme and language; all TEDI services (`ThemeService`, `TediTranslationService`, `BreakpointService`, `ToastService`, `ModalService`) are `providedIn: 'root'`, so there is no further wiring.

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideTedi } from '@tedi-design-system/angular/tedi';

export const appConfig: ApplicationConfig = {
  providers: [
    provideTedi({ language: 'et', theme: 'default' }),
  ],
};
```

### 2. Add styles

Add the precompiled stylesheet (fonts, tokens, and component styles bundled) to `angular.json`:

```jsonc
// angular.json → projects.<app>.architect.build.options.styles
"styles": [
  "node_modules/@tedi-design-system/angular/index.css"
]
```

Add the TEDI entry alongside whatever global stylesheet your app already lists (`src/styles.css` or
`src/styles.scss`) — do not replace it, and do not add an entry for a file you have not created.

Or, to consume tokens/mixins in SCSS:

```scss
@use '@tedi-design-system/core/scss' as tedi;
```

### 3. Use components

Components are standalone — import the component class into the consuming component's `imports` array:

```ts
import { Component } from '@angular/core';
import { ButtonComponent, TextFieldComponent, AlertComponent } from '@tedi-design-system/angular/tedi';

@Component({
  standalone: true,
  selector: 'app-my-page',
  imports: [ButtonComponent, TextFieldComponent, AlertComponent],
  template: `
    <tedi-alert type="info" title="Welcome">Getting started with TEDI</tedi-alert>
    <input tedi-text-field [(value)]="name" />
    <button tedi-button variant="primary">Submit</button>
  `,
})
export class MyPageComponent {
  name = '';
}
```

## Component Patterns

### Standalone imports

Every TEDI component is `standalone: true`. Import the component class directly into your standalone component's `imports` (or your `NgModule`'s `imports`) — there is no `TediModule` to register.

### Attribute vs element selectors

TEDI uses two selector styles, and mixing them up is the most common integration mistake:

- **Attribute selectors** enhance a native element — put them on the real HTML tag:
  - `[tedi-button]` → `<button tedi-button variant="primary">Save</button>`
  - `input[tedi-text-field]` → `<input tedi-text-field [(value)]="q" />`
  - `[tedi-label]` → `<label tedi-label>Email</label>` (NOT `<tedi-label>`)
- **Element selectors** are standalone wrappers — use them as their own tag:
  - `tedi-icon`, `tedi-modal`, `tedi-date-picker`, `tedi-form-field`, `tedi-alert`, `tedi-select`, `tedi-card`

Never guess: the selector is machine-readable in the installed type bundle. See
[references/components.md](references/components.md) for the one-line command that prints every
component's real selector.

### Signal-based inputs

Inputs are signals. Bind them like any Angular input; two-way `model()` inputs support the banana-in-a-box syntax:

```html
<!-- one-way input() -->
<button tedi-button [variant]="isPrimary ? 'primary' : 'secondary'">Go</button>

<!-- two-way model() -->
<tedi-modal [(open)]="isOpen">…</tedi-modal>
<input tedi-text-field [(value)]="email" />
<tedi-date-field inputId="date" [(value)]="selectedDate" />
```

Some components accept breakpoint-aware input values (e.g. an object keyed by breakpoint) — verify the input type against the component source.

## Forms

TEDI form controls implement `ControlValueAccessor`, so they plug into reactive forms (`[formControl]` / `formControlName`) or template-driven forms (`[(ngModel)]`) with no adapter.

```ts
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import {
  FormFieldComponent, LabelComponent, TextFieldComponent, FeedbackTextComponent,
} from '@tedi-design-system/angular/tedi';

@Component({
  standalone: true,
  selector: 'app-signup',
  imports: [ReactiveFormsModule, FormFieldComponent, LabelComponent, TextFieldComponent, FeedbackTextComponent],
  template: `
    <form [formGroup]="form">
      <tedi-form-field>
        <label tedi-label>Email</label>
        <input tedi-text-field formControlName="email" />
        <tedi-feedback-text>Enter your work email</tedi-feedback-text>
      </tedi-form-field>
    </form>
  `,
})
export class SignupComponent {
  form = new FormGroup({ email: new FormControl('') });
}
```

Form controls: `TextFieldComponent`, `NumberFieldComponent`, `SearchComponent`, `SliderComponent`,
`CheckboxGroupComponent`, `RadioGroupComponent`, `ToggleComponent`, `SelectComponent`,
`DateFieldComponent`, `TimeFieldComponent`. Note that `CheckboxComponent` styles a native
checkbox rather than implementing `ControlValueAccessor`, and `DropdownComponent` is an overlay,
not a form control. See [references/forms.md](references/forms.md) for the form-field structure,
value shapes, and per-control usage.

## Theming

TEDI uses CSS custom properties (design tokens) from `@tedi-design-system/core`. The active theme is a CSS class on `<html>`: `tedi-theme--default`, `tedi-theme--dark`.

```ts
import { inject } from '@angular/core';
import { ThemeService } from '@tedi-design-system/angular/tedi';

const theme = inject(ThemeService);
theme.theme.set('dark');   // switch at runtime (persisted in the `tedi-theme` cookie)
theme.theme();             // read the current theme signal
```

See [references/theming.md](references/theming.md) for tokens, style overrides, and custom themes.

## Translation

TEDI copy is translated via `TediTranslationService`. The default language comes from `provideTedi({ language })`; supported languages are `et` (default), `en`, `ru`.

```ts
import { inject } from '@angular/core';
import { TediTranslationService } from '@tedi-design-system/angular/tedi';

const t = inject(TediTranslationService);
t.setLanguage('en');                       // switch language (persisted in the `tedi-lang` cookie)
t.getLanguage();                           // readonly signal of the current language
t.translate('close');                      // resolve a key for the current language
t.track('close');                          // reactive Signal<string> that re-resolves on change
t.addTranslations({ /* map */ });          // add or override copy
```

In templates, the `tediTranslate` pipe resolves keys reactively.

## Notifications

```ts
import { inject } from '@angular/core';
import { ToastService } from '@tedi-design-system/angular/tedi';

// Inline alert (element selector):
// <tedi-alert type="success" title="Saved" (close)="show = false">Changes saved.</tedi-alert>

// Toast — ToastService is root-provided and manages its own CDK overlay
const toast = inject(ToastService);
toast.open({ type: 'success', title: 'Done', /* … */ });
```

Verify the exact `ToastService.open` config and `tedi-alert` inputs against the source at the pinned tag.

## Common Pitfalls

A handful of mistakes account for most TEDI integration issues. Avoid them up front:

- **Import from `/tedi` or `/community`, never the package root.** `@tedi-design-system/angular` is not a valid runtime import path — the package has explicit entry points (`@tedi-design-system/angular/tedi`, `@tedi-design-system/angular/community`, `@tedi-design-system/angular/index.css`). Importing from the root will fail.
- **Prefer TEDI-Ready over Community, and always write the entry point explicitly.** In Angular the two namespaces genuinely collide: 24 selectors are declared in *both*, under *identical class names* (`tedi-card`, `tedi-modal`, `tedi-accordion`, `tedi-tabs`, `tedi-dropdown`, `tedi-form-field`, `tedi-pagination`, `tedi-search`, `tedi-tag`, the checkbox/radio groups). `CardComponent` from `/community` and from `/tedi` are different components with different inputs behind the same `<tedi-card>` tag, so nothing at the usage site tells you which you got and it still compiles. An auto-import picks whichever it finds first. See [references/components.md](references/components.md).
- **Match the selector style.** Attribute selectors go on native elements (`<button tedi-button>`, `<input tedi-text-field>`, `<label tedi-label>` — never `<tedi-label>`); element selectors are their own tags (`<tedi-modal>`, `<tedi-icon>`). Getting this wrong yields a silent no-op or a template error.
- **Use design tokens, not hardcoded colors.** Prefer the semantic roles (`var(--general-surface-primary)`, `var(--general-text-secondary)`) and drop to a `--tedi-*` primitive only when no semantic role fits. The legacy `--tedi-color-*` / `--tedi-spacing-*` names are gone: look names up in `node_modules/@tedi-design-system/core/tokens.json`, see [references/theming.md](references/theming.md).
- **Do not add CSS `var()` fallbacks.** Write `var(--tedi-dimensions-04)`, not `var(--tedi-dimensions-04, 16px)`; fallbacks defeat token-driven theming.
- **Override styles via BEM classes, not `::ng-deep`.** Components use `ViewEncapsulation.None`, so their BEM classes (`.tedi-button--primary`, `.tedi-form-field`) are globally targetable — no `::ng-deep` or `:host` piercing needed.
- **Mock `TediTranslationService` (with `TEDI_TRANSLATION_DEFAULT_TOKEN`) and the breakpoint service in tests.** Translated components need the service provided; jsdom won't answer media queries, so breakpoint-driven behavior must be mocked.

## Additional References

Load based on your task, **not all at once**:

- [references/components.md](references/components.md) — Listing every component and its real selector out of the installed type bundle, reading one component's inputs, and the behaviour those types don't tell you (the `/tedi` vs `/community` selector collision, composition constraints, responsive quirks, a11y requirements)
- [references/theming.md](references/theming.md) — Design tokens and how to look them up, `ThemeService`, BEM style overrides, custom themes
- [references/forms.md](references/forms.md) — `ControlValueAccessor` integration, the form-field structure, per-control selectors and value shapes
