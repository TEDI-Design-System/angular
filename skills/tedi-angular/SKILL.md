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

This skill bundles a snapshot of the API and patterns, but the library is public and ships fast. When a component, input, or default listed below feels stale or absent, treat these as the source of truth and fetch from them.

### Pin to the consumer's installed version

Before fetching source, **determine which version of `@tedi-design-system/angular` the project actually has installed** and browse the matching git tag — not `main`. The repo's release tags follow the pattern `angular-<version>` (e.g. `angular-7.1.0-rc.9`, `angular-7.1.0-rc.4`).

1. Read the resolved version from the project — `package.json`'s `dependencies."@tedi-design-system/angular"`, or `npm ls @tedi-design-system/angular`, or the lockfile entry. Strip any range prefix (`^`, `~`).
2. Construct the tag URL: `https://github.com/TEDI-Design-System/angular/tree/angular-<version>/...`
3. If the resolved version is a pre-release or the tag doesn't exist (rare), fall back to `main` and note the version mismatch when answering.

**Example** for a project on `7.1.0-rc.9`:
- TEDI-Ready components: `https://github.com/TEDI-Design-System/angular/tree/angular-7.1.0-rc.9/tedi/components`
- Barrel export: `https://github.com/TEDI-Design-System/angular/blob/angular-7.1.0-rc.9/tedi/index.ts`
- Specific component: `https://github.com/TEDI-Design-System/angular/blob/angular-7.1.0-rc.9/tedi/components/buttons/button/button.component.ts`

### Canonical references

- **Source code & releases**: [github.com/TEDI-Design-System/angular](https://github.com/TEDI-Design-System/angular) — TEDI-Ready components live under `tedi/components/`, community under `community/components/` (note: no `src/` prefix). The barrel export `tedi/index.ts` is the canonical list of TEDI-Ready exports. Always prefer the version-pinned tag URLs (see above) over `main` when consulting source.
- **Live Storybook (interactive docs + prop tables)**: [storybook.tedi.ee/angular/main](https://storybook.tedi.ee/angular/main/?path=/docs/documentation-get-started--get-started) — has every component's args table, default values, and runnable examples (Compodoc-generated). Note that the public Storybook tracks `main`; if it disagrees with the consumer's installed tag, the tag wins.
- **Design system wiki** (cross-framework guidelines): [github.com/TEDI-Design-System/general/wiki](https://github.com/TEDI-Design-System/general/wiki)
- **Releases & changelog**: [github.com/TEDI-Design-System/angular/releases](https://github.com/TEDI-Design-System/angular/releases), [CHANGELOG.md](https://github.com/TEDI-Design-System/angular/blob/main/CHANGELOG.md), [Issues](https://github.com/TEDI-Design-System/angular/issues)
- **npm**: [@tedi-design-system/angular](https://www.npmjs.com/package/@tedi-design-system/angular)
- **Sibling packages**: [@tedi-design-system/core](https://www.npmjs.com/package/@tedi-design-system/core) (tokens, SCSS, icons), [@tedi-design-system/react](https://www.npmjs.com/package/@tedi-design-system/react) (React counterpart — useful for behavioral parity questions)

**Verification tip**: if the user asks about a recently added component or an input you're unsure of, fetch the relevant `.component.ts` file from the version-pinned tag (e.g. `tedi/components/<category>/<name>/<name>.component.ts`) — the `input()` / `model()` / `output()` declarations and their JSDoc, plus the component's exported type aliases, are the canonical spec.

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
  "node_modules/@tedi-design-system/angular/index.css",
  "src/styles.scss"
]
```

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

When in doubt, check the `selector` in the component's `.component.ts` at the pinned tag.

### Signal-based inputs

Inputs are signals. Bind them like any Angular input; two-way `model()` inputs support the banana-in-a-box syntax:

```html
<!-- one-way input() -->
<button tedi-button [variant]="isPrimary ? 'primary' : 'secondary'">Go</button>

<!-- two-way model() -->
<tedi-modal [(open)]="isOpen">…</tedi-modal>
<input tedi-text-field [(value)]="email" />
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

TEDI ships a full set of form controls (text, number, select, checkbox/radio groups, toggle, date/time, etc.). For the current roster, the form-field structure, and per-control usage, see [references/forms.md](references/forms.md) and the barrel export (`tedi/index.ts`).

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
- **Prefer TEDI-Ready over Community whenever possible.** Several Community components are deprecated in favor of TEDI-Ready equivalents, and the set with no TEDI-Ready alternative yet shifts over time — check the barrel exports / component JSDoc / Storybook for the current deprecation status before reaching into Community. See [references/components.md](references/components.md).
- **Match the selector style.** Attribute selectors go on native elements (`<button tedi-button>`, `<input tedi-text-field>`, `<label tedi-label>` — never `<tedi-label>`); element selectors are their own tags (`<tedi-modal>`, `<tedi-icon>`). Getting this wrong yields a silent no-op or a template error.
- **Use design tokens, not hardcoded colors.** Reach for `var(--tedi-color-*)`, `var(--tedi-spacing-*)`, etc. from `@tedi-design-system/core` instead of hex codes. This is what makes theme switching and brand overrides work.
- **Do not add CSS `var()` fallbacks.** Write `var(--tedi-spacing-4)`, not `var(--tedi-spacing-4, 16px)` — fallbacks defeat token-driven theming.
- **Override styles via BEM classes, not `::ng-deep`.** Components use `ViewEncapsulation.None`, so their BEM classes (`.tedi-button--primary`, `.tedi-form-field`) are globally targetable — no `::ng-deep` or `:host` piercing needed.
- **Mock `TediTranslationService` (with `TEDI_TRANSLATION_DEFAULT_TOKEN`) and the breakpoint service in tests.** Translated components need the service provided; jsdom won't answer media queries, so breakpoint-driven behavior must be mocked.

## Additional References

Load based on your task — **do not load all at once**:

- [references/components.md](references/components.md) — How to discover the current components and read their real inputs from the authoritative sources (barrel exports, source signals/JSDoc, Storybook)
- [references/theming.md](references/theming.md) — Design tokens, SCSS customization, `ThemeService`, style overrides
- [references/forms.md](references/forms.md) — Form controls, reactive forms + two-way binding, validation
