# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TEDI Design System Angular component library (`@tedi-design-system/angular`). Angular 19 standalone component library published via ng-packagr, with Storybook for documentation.

## Commands

```bash
npm start              # Start Storybook dev server (port 6006)
npm test               # Run all tests (Jest)
npm run test:watch     # Run tests in watch mode
npx jest path/to/file  # Run a single test file
npm run lint           # Stylelint (SCSS) + ESLint (TS/HTML) with --fix
npm run build          # Build library to dist/
```

## Architecture

### Directory Layout

- `tedi/components/` — All UI components, organized by category (form, buttons, overlay, etc.)
- `tedi/directives/` — Attribute/structural directives
- `tedi/services/` — Services (translation, theme, breakpoint, toast)
- `tedi/utils/` — Utility functions (date, cookies, elements)
- `tedi/tokens/` — Injection tokens (theme, translation)
- `tedi/providers/` — Angular providers
- `community/` — Community-contributed components (separate entry point, NOT a reference for TEDI patterns)

### Component File Convention

Each component folder contains:
```text
component-name.component.ts       # Component class
component-name.component.html     # Template
component-name.component.scss     # Styles
component-name.component.spec.ts  # Tests
component-name.stories.ts         # Storybook stories
index.ts                           # Barrel export
```

### Component Patterns

All components are:
- **Standalone** (`standalone: true`)
- **OnPush** change detection
- **ViewEncapsulation.None** (styles not encapsulated)
- Using **Angular signals** (`input()`, `model()`, `signal()`, `computed()`)
- Selector prefix: `tedi-` (e.g., `tedi-button`, `tedi-date-picker`)

Form controls implement `ControlValueAccessor` with `NG_VALUE_ACCESSOR` provider for reactive forms integration.

### Export Chain

`public-api.ts` → `tedi/index.ts` → category `index.ts` → component `index.ts`

Path aliases:
- `@tedi-design-system/angular/tedi` → `./tedi/index.ts`
- `@tedi-design-system/angular/community` → `./community/index.ts`

## Styling

- BEM with `tedi-` prefix: `.tedi-component`, `.tedi-component__element`, `.tedi-component--modifier`
- Sub-components that are their own Angular components are **separate BEM blocks** with a shared prefix: `tedi-modal-header`, `tedi-modal-footer` (not `tedi-modal__header`). Use `__` elements only for simple DOM nodes inside a single component's template (e.g., `tedi-modal-header__head`).
- Stylelint enforces the `tedi-` prefix pattern on all class selectors
- Design tokens come from `@tedi-design-system/core`
- Max nesting depth: 4
- **Target CSS classes, not Angular element selectors** — add classes to component hosts and style those. Only style element selectors directly for third-party components where you can't control the host (e.g., `cdk-dialog-container`).

## Testing

- Jest with `jest-preset-angular`, jsdom environment
- Coverage thresholds: 80% on branches/functions/lines/statements
- Test inputs via `fixture.componentRef.setInput('propName', value)`
- Mock `TediTranslationService` in tests that use translated components
- For form controls, use a test host component with `ReactiveFormsModule` and `FormControl`

## Storybook

- Stories at `tedi/**/*.stories.ts`
- Title format: `"TEDI-Ready/Components/<Category>/<ComponentName>"` (e.g. `Buttons`, `Form`, `Navigation`). Top-level groups `Content`, `Layout`, and `Base` skip the `Components` segment — `"TEDI-Ready/Content/<ComponentName>"`, etc. Check sibling stories in the same folder to confirm the prefix.
- Uses `moduleMetadata` decorator for imports
- Status parameters: `partiallyTediReady`, `existsInTediReady`, `devComponent`, etc.
- Compodoc integration enabled for auto-generated docs

## Commits

- Conventional commits enforced by commitlint
- Must reference an issue (e.g., `feat(date-picker): add feature #258`)
- Subject minimum 10 characters
- Pre-commit hook runs lint-staged (stylelint + prettier)

## Related Repositories

- **TEDI React** (`../react/`) — React implementation of the same design system. Useful as behavioral reference.
- **TEDI Core** (`../core/`) — Shared design tokens, SCSS variables, fonts, and icons.

> **Note:** These sibling repositories are available in local development only. They are NOT present in CI/CD environments — do not rely on `../react/` or `../core/` paths in build scripts, tests, or imports that run in CI.

## Branches

- `main` — production releases
- `rc` — pre-releases (base branch for PRs)

## Do NOT

- Use `@Input()`, `@Output()`, or `@ViewChild()` decorators — use `input()`, `model()`, `output()`, `viewChild()` signal APIs
- Use `ViewEncapsulation.Emulated` or `ShadowDom` — always `ViewEncapsulation.None`
- Hardcode color values — always use design tokens from `@tedi-design-system/core`
- Use fallback values in CSS `var()` functions — write `var(--token-name)`, not `var(--token-name, fallback)`
- Use Angular encapsulation for style scoping — use BEM naming with `tedi-` prefix instead
- Forget `multi: true` in `NG_VALUE_ACCESSOR` providers
- Forget `forwardRef()` when a component references itself in its own providers
- Add event listeners without removing them in `ngOnDestroy` — use arrow function properties for correct reference
- Use regular methods for event handlers that need cleanup — use `handleX = (e: Event) => {}` property syntax
- Forget to provide `TediTranslationService` mock and `TEDI_TRANSLATION_DEFAULT_TOKEN` in tests
- Use `fakeAsync`/`tick` without cleaning up in `afterEach`
- Use `community/` components as reference for coding patterns or style — they are community-contributed and not always reviewed
- Forget to add `.parent__button:hover .tedi-icon { color: inherit; }` (and similar for selected/active states) in components that contain icons and change text color on state — without this, the icon's color modifier class wins over the parent's color. Use `color="inherit"` for component-owned icons; for projected icons, the CSS override ensures the consumer's color applies in default state but inherits on hover/selected
- Style Angular element selectors directly (e.g., `tedi-modal-header { ... }`) — add a CSS class to the host and style the class instead. Exception: third-party elements you can't add classes to (e.g., `cdk-dialog-container`)

## Common Test Setup

Tests that use translated components need:
```typescript
class TranslationMock {
  translate(key: string) { return key; }
  track(key: string) { return () => key; }
}

// In TestBed providers:
{ provide: TediTranslationService, useClass: TranslationMock },
{ provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: 'et' },
```

Form control tests need a host component:
```typescript
@Component({
  standalone: true,
  imports: [MyComponent, ReactiveFormsModule],
  template: `<tedi-my-component [formControl]="control" />`
})
class TestHostComponent {
  control = new FormControl<ValueType>(defaultValue);
}
```

## For Code Review Agents (CodeRabbit, etc.)

Read `.claude/skills/contributing/references/best-practices.md` for the full set of coding patterns and rules to enforce during review.

Key things to **not** flag:
- `ViewEncapsulation.None` — intentional, not a security concern.
- Missing CSS `var()` fallback values — intentionally omitted.
- CdkListbox private API access (`_setNextFocusToSelectedOption`, `_handleKeydown`) in the select component — intentional workarounds, no public CDK alternative exists.
- `parameters.status: { type: ["breakpointSupport"] }` on a story — this is a valid, registered status badge (see `.storybook/preview.tsx` and `best-practices.md`). Keep it on components with breakpoint-dependent behavior or inputs that accept breakpoint values. Do not suggest removing it.
