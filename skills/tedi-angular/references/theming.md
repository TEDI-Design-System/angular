# Theming

TEDI uses design tokens from `@tedi-design-system/core` exposed as CSS custom properties. Components are styled with BEM naming, the `tedi-` prefix, and `ViewEncapsulation.None` — so all styles are global and overridable without piercing encapsulation.

## Setup

Add the precompiled stylesheet to `angular.json`:

```jsonc
// angular.json → projects.<app>.architect.build.options.styles
"styles": [
  "node_modules/@tedi-design-system/angular/index.css"
]
```

Or import tokens/mixins in SCSS:

```scss
@use '@tedi-design-system/core/scss' as tedi;
```

Set the default theme via `provideTedi`:

```ts
// app.config.ts
provideTedi({ theme: 'default' })
```

## Theme Switching

The active theme is a CSS class on `<html>` (e.g. `tedi-theme--default`, `tedi-theme--dark`). `ThemeService.theme` is a signal — set it to switch, call it to read:

```ts
import { inject } from '@angular/core';
import { ThemeService } from '@tedi-design-system/angular/tedi';

const theme = inject(ThemeService);
theme.theme.set('dark');   // switch
theme.theme();             // read current theme
```

The selection is persisted across reloads in the `tedi-theme` cookie. The available theme names and cookie name are implementation details — verify the current set against the `ThemeService` source / Storybook (see SKILL.md → Authoritative Sources).

## Design Tokens

Tokens come in two tiers: **semantic** role tokens (`--general-*`, `--form-*`) and **primitive**
base tokens (`--tedi-*`, the raw scale). Prefer semantic; reach for a primitive only when no
semantic role fits.

| Category | Examples |
|----------|----------|
| Text | `--general-text-primary`, `--general-text-secondary`, `--general-text-brand` |
| Surface | `--general-surface-primary`, `--general-surface-secondary`, `--general-surface-brand-primary` |
| Border | `--general-border-primary`, `--general-border-secondary`, `--general-border-brand` |
| Status | `--general-status-danger-text`, `--general-status-success-border` |
| Icon | `--general-icon-brand`, `--general-icon-accent` |
| Form | `--form-field-height`, `--form-input-background-default`, `--form-field-radius` |
| Primitives | `--tedi-primary-600`, `--tedi-neutral-900`, `--tedi-green-600` |
| Spacing | `--tedi-dimensions-02`, `--tedi-dimensions-04` |
| Radius | `--tedi-radius-02-default`, `--tedi-radius-08` |
| Typography | `--family-default`, `--heading-h3-size`, `--heading-h3-weight` |

**Look token names up, don't recall them.** The old `--tedi-color-*`, `--tedi-spacing-*` and
`--tedi-border-radius-*` names no longer exist. The authoritative, machine-readable list ships with
the consumer's installed core:

```
node_modules/@tedi-design-system/core/tokens.json
```

It is generated from Figma. `themes.default` holds both tiers; `themes.dark` holds only the semantic
overrides, and `breakpoints.mobile` / `.tablet` the responsive ones. Each entry is
`{ value, resolved }`, giving you both the `var()` chain and the computed value:

```bash
T=node_modules/@tedi-design-system/core/tokens.json
# does a token exist, and what does it resolve to?
python3 -c "import json,sys;print(json.load(open(sys.argv[1]))['themes']['default']['semantic']['general-surface-primary'])" $T
# find every surface token
python3 -c "import json,sys;print([k for k in json.load(open(sys.argv[1]))['themes']['default']['semantic'] if 'surface' in k])" $T
```

Because `themes.dark` overrides only the semantic tier, a default-theme value is not *the* value:
treat every role token as theme-dependent unless you have checked. Never invent a token name, and
never fall back to a hex value because a guessed token didn't work.

Use tokens in your own SCSS:

```scss
.my-custom-section {
  padding: var(--tedi-dimensions-04);
  background-color: var(--general-surface-primary);
  border-radius: var(--tedi-radius-02-default);
}
```

**Important:** Do NOT use fallback values in `var()`. Write `var(--general-surface-primary)`, not
`var(--general-surface-primary, #fff)`.

## Overriding Component Styles

Because components use `ViewEncapsulation.None` and BEM naming, their classes are globally targetable — no `::ng-deep` or `:host` piercing needed. Target the BEM class:

```scss
// Override button primary color
.tedi-button--primary {
  background-color: var(--my-brand-primary);
}
```

## Custom Themes

Create a custom theme by defining token values under a theme class, then activate it via `ThemeService`:

```scss
.tedi-theme--my-brand {
  --general-surface-brand-primary: #1a73e8;
  --general-surface-primary: #fafafa;
  // ... override tokens as needed
}
```

```ts
themeService.theme.set('my-brand');
```

## Responsive Styles

For responsive breakpoints in SCSS (verify the import path against `@tedi-design-system/core`):

```scss
@use '@tedi-design-system/core/bootstrap-utility/breakpoints' as bp;

.my-component {
  padding: var(--tedi-dimensions-02);

  @include bp.media-breakpoint-up(md) {
    padding: var(--tedi-dimensions-04);
  }
}
```

In TypeScript, `BreakpointService` exposes the current breakpoint reactively for components that need to branch on viewport size.
