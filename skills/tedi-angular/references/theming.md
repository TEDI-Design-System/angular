# Theming

TEDI uses design tokens from `@tedi-design-system/core` exposed as CSS custom properties. Components are styled with BEM classes using the `tedi-` prefix and `ViewEncapsulation.None`, so all styles are globally accessible and overridable.

## Setup

Import TEDI core styles in your global stylesheet:

```scss
// styles.scss
@use '@tedi-design-system/core/scss' as tedi;
```

Configure the default theme via `provideTedi()`:

```typescript
provideTedi({
  theme: 'default', // 'default' | 'dark' | custom string
})
```

## Theme Switching

Themes are applied as a CSS class on `<html>`: `tedi-theme--default`, `tedi-theme--dark`.

```typescript
import { ThemeService } from '@tedi-design-system/angular/tedi';

@Component({ ... })
export class MyComponent {
  private themeService = inject(ThemeService);

  setDarkTheme() {
    this.themeService.theme.set('dark');
  }

  getCurrentTheme() {
    return this.themeService.theme(); // reads current theme signal
  }
}
```

The theme is persisted in a cookie (`tedi-theme`) and restored on page load.

## Design Tokens

Tokens follow the naming pattern `--tedi-{category}-{name}`:

| Category | Examples |
|----------|---------|
| Color | `--tedi-color-primary`, `--tedi-color-bg-default`, `--tedi-color-text-secondary` |
| Spacing | `--tedi-spacing-1`, `--tedi-spacing-2`, `--tedi-spacing-4` |
| Typography | `--tedi-font-size-sm`, `--tedi-font-weight-bold`, `--tedi-line-height-default` |
| Border | `--tedi-border-radius-sm`, `--tedi-border-width-default` |
| Shadow | `--tedi-shadow-sm`, `--tedi-shadow-md` |

Use tokens in your own SCSS to stay consistent:

```scss
.my-custom-section {
  padding: var(--tedi-spacing-4);
  background-color: var(--tedi-color-bg-default);
  border-radius: var(--tedi-border-radius-sm);
}
```

**Important:** Do NOT use fallback values in `var()`. Write `var(--tedi-spacing-4)`, not `var(--tedi-spacing-4, 16px)`.

## Overriding Component Styles

All TEDI components use BEM naming with the `tedi-` prefix. You can override styles by targeting BEM classes:

```scss
// Override button primary color
.tedi-button--primary {
  background-color: var(--my-brand-primary);
}

// Override form field spacing
.tedi-form-field {
  margin-bottom: var(--tedi-spacing-4);
}
```

Because components use `ViewEncapsulation.None`, standard CSS specificity rules apply. No `::ng-deep` or `:host` needed.

## Custom Themes

Create a custom theme by defining token values under a theme class:

```scss
.tedi-theme--my-brand {
  --tedi-color-primary: #1a73e8;
  --tedi-color-bg-default: #fafafa;
  // ... override tokens as needed
}
```

Then activate it:

```typescript
this.themeService.theme.set('my-brand');
// Adds class "tedi-theme--my-brand" to <html>
```
