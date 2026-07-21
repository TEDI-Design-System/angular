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

Tokens follow the naming pattern `--tedi-{category}-{name}`:

| Category | Example (illustrative) |
|----------|------------------------|
| Color | `--tedi-color-primary` |
| Spacing | `--tedi-spacing-4` |
| Typography | `--tedi-font-size-sm` |
| Border | `--tedi-border-radius-sm` |
| Shadow | `--tedi-shadow-sm` |

The examples above illustrate the **pattern** — they are not the full set. The authoritative list of token names lives in `@tedi-design-system/core`; look them up there (or via a browser devtools inspection of the rendered CSS custom properties) rather than assuming a specific token exists.

Use tokens in your own SCSS:

```scss
.my-custom-section {
  padding: var(--tedi-spacing-4);
  background-color: var(--tedi-color-bg-default);
  border-radius: var(--tedi-border-radius-sm);
}
```

**Important:** Do NOT use fallback values in `var()`. Write `var(--tedi-spacing-4)`, not `var(--tedi-spacing-4, 16px)`.

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
  --tedi-color-primary: #1a73e8;
  --tedi-color-bg-default: #fafafa;
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
  padding: var(--tedi-spacing-2);

  @include bp.media-breakpoint-up(md) {
    padding: var(--tedi-spacing-4);
  }
}
```

In TypeScript, `BreakpointService` exposes the current breakpoint reactively for components that need to branch on viewport size.
