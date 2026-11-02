# TEDI Angular Best Practices

Read before writing any component code.

## Component Architecture

### Class Structure
```typescript
@Component({
  selector: 'tedi-component-name',
  standalone: true,
  imports: [/* only what's needed */],
  templateUrl: './component-name.component.html',
  styleUrl: './component-name.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComponentNameComponent {
  // 1. Injected services (private, readonly)
  // 2. Inputs (input(), model())
  // 3. Outputs (output())
  // 4. Internal signals (signal(), computed())
  // 5. Lifecycle methods
  // 6. Public methods
  // 7. Private methods
}
```

### Signal-Based Inputs
Use Angular signals API exclusively — never use `@Input()` / `@Output()` decorators:
```typescript
readonly variant = input<ButtonVariant>('primary');
readonly disabled = input<boolean>(false);
readonly value = model<string>('');           // two-way binding
readonly clicked = output<MouseEvent>();      // event emitter
```

### Form Controls (ControlValueAccessor)
```typescript
@Component({
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MyControlComponent),
    multi: true,
  }],
})
export class MyControlComponent implements ControlValueAccessor {
  readonly value = model<T>(defaultValue);
  private onChange: (value: T) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: T): void { this.value.set(value); }
  registerOnChange(fn: (value: T) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { /* handle */ }
}
```

### Selector Conventions
- **Element selectors** (`tedi-toggle`, `tedi-date-picker`, `tedi-modal`) — for wrapper components
- **Attribute selectors** (`[tedi-button]`, `[tedi-checkbox]`) — for components that enhance native elements

### Event Listener Cleanup
- Use arrow function properties for event handlers: `handleKeydown = (e: KeyboardEvent) => {}`
- Add listeners in constructor or ngOnInit, remove in ngOnDestroy with same reference
- Check `isPlatformBrowser()` before any DOM access (modal, dropdown patterns)

### Effects
- Effects in constructor auto-clean up — no need for takeUntilDestroyed
- Use effects for syncing derived state (e.g., selected date → input display value)

### Forwarding Slots Through a Wrapper
Don't re-project consumer content through a wrapper's `<ng-content>` into an inner component.
`select` slots are resolved at compile time (with two slots for the same selector, only the first
claims the content, even inside an inactive `@if`), and the inner component's `contentChild()` does
not see re-projected content. Capture the consumer's content as a `TemplateRef` with a structural
directive on the wrapper, then either pass it to a `TemplateRef` input or render it with
`ngTemplateOutlet` into the inner component's own slot.
`tedi-table` does the latter for `tediPaginationResults` → `tedi-pagination`.

## Responsive Inputs (Breakpoint Support)

**Always check the TEDI React equivalent before settling on an API.** If the React component uses `BreakpointSupport<T>` / `useBreakpointProps` on a prop, the Angular component should expose breakpoint support on the equivalent input. Skipping this leaves the Angular library behind on responsive behavior and forces consumers to recreate it manually.

Two patterns exist for this — pick by need:

### Pattern A: Per-input `BreakpointInput<T>` (preferred when one or two inputs need to be responsive)

Use this when a single input (e.g., a flag, count, or variant) should vary by breakpoint without restating sibling inputs. Reference: `src/tedi/components/form/date-field/date-field.component.ts` (`numberOfMonths`, `enableCalendar`), `src/tedi/components/content/carousel/carousel-content/carousel-content.component.ts`.

```typescript
import {
  breakpointInput,
  BreakpointInput,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";

readonly enableCalendar = input(
  { xs: true },
  { transform: (v: BreakpointInput<boolean>) => breakpointInput(v) },
);

private readonly breakpointService = inject(BreakpointService);

readonly enableCalendarResolved = computed(() => {
  const v = this.enableCalendar();
  if (v.xxl !== undefined && this.breakpointService.isAboveBreakpoint("xxl")()) return v.xxl;
  if (v.xl  !== undefined && this.breakpointService.isAboveBreakpoint("xl")())  return v.xl;
  if (v.lg  !== undefined && this.breakpointService.isAboveBreakpoint("lg")())  return v.lg;
  if (v.md  !== undefined && this.breakpointService.isAboveBreakpoint("md")())  return v.md;
  if (v.sm  !== undefined && this.breakpointService.isAboveBreakpoint("sm")())  return v.sm;
  return v.xs;
});
```

Consumer side:

```html
<tedi-date-field [enableCalendar]="{ xs: false, md: true }" />
<tedi-date-field [enableCalendar]="false" />
```

Notes:
- `breakpointInput()` wraps a plain `T` into `{ xs: T }`, so both shapes work.
- Always compare with `!== undefined` (not truthy) — `false` and `0` are valid values that must not be skipped.
- Iterate **largest breakpoint first** to apply mobile-first cascade correctly.

### Pattern B: Per-component breakpoint inputs (preferred when many inputs need to be responsive together)

Use this when several inputs commonly change together at a given breakpoint and consumers benefit from grouping them. Reference: `src/tedi/components/navigation/link/link.component.ts:55-105`.

```typescript
export type LinkInputs = {
  variant: LinkVariant;
  size: LinkSize;
  underline: boolean;
};

export class LinkComponent implements BreakpointInputs<LinkInputs> {
  variant = input<LinkVariant>("default");
  size = input<LinkSize>("default");
  underline = input<boolean>(true);

  xs = input<LinkInputs>();
  sm = input<LinkInputs>();
  md = input<LinkInputs>();
  lg = input<LinkInputs>();
  xl = input<LinkInputs>();
  xxl = input<LinkInputs>();

  private breakpointService = inject(BreakpointService);
  breakpointInputs = computed(() =>
    this.breakpointService.getBreakpointInputs<LinkInputs>({
      variant: this.variant(),
      size: this.size(),
      underline: this.underline(),
      xs: this.xs(), sm: this.sm(), md: this.md(),
      lg: this.lg(), xl: this.xl(), xxl: this.xxl(),
    }),
  );
}
```

Consumer side:

```html
<tedi-link [md]="{ variant: 'inverted', size: 'small' }">Read more</tedi-link>
```

### Choosing between A and B

| Question | Pattern |
|---|---|
| Only one input is responsive? | A |
| Two unrelated inputs are responsive but never change together? | A on each |
| Three or more inputs change as a group per breakpoint? | B |
| React equivalent uses `BreakpointSupport<Props>` on the whole component? | B |
| React equivalent uses `BreakpointInput<T>` on a single prop? | A |

### Storybook

- Add the `breakpointSupport` status badge ([stories.md](stories.md) section 4).
- For pattern A inputs, set the argType `type.summary` to `"BreakpointInput<T>"` with a detail listing both shapes.
- For pattern B, document the per-breakpoint inputs (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`) in argTypes and category them under `"breakpoint inputs"`.
- Add at least one story that demonstrates a responsive case (e.g., `WithResponsiveX`).

### Documenting it for consumers

Breakpoint-aware inputs are documented in the **JSDoc**, not in the consumer skill, because that is
what ships in the type bundle. Mention the breakpoint object in the same sentence:

```ts
/**
 * Shows the calendar picker; accepts a breakpoint object such as `{ xs: false, md: true }`.
 * @default true
 */
readonly enableCalendar = input(
  { xs: true },
  { transform: (v: BreakpointInput<boolean>) => breakpointInput(v) },
);
```

Keep the `breakpointInput()` transform from Pattern A. Declaring the input as a bare
`input<BreakpointInput<boolean>>(true)` skips normalization, so a consumer passing a plain `false`
leaves the value un-normalized and the resolver's `v.xs` lookup reads `undefined`.

The consumer skill covers the *pattern* once (SKILL.md → Component Patterns) and does not repeat it
per component. See **contributing SKILL.md → Consumer-Facing Docs**.

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Component selector | `tedi-kebab-case` | `tedi-date-picker` |
| Attribute selector | `[tedi-kebab-case]` | `[tedi-button]` |
| Component class | PascalCase + Component | `DatePickerComponent` |
| Directive class | PascalCase + Directive | `HideAtDirective` |
| File names | kebab-case | `date-picker.component.ts` |
| CSS classes | BEM with `tedi-` prefix | `.tedi-button__icon--large` |
| Enums/Types | PascalCase | `ButtonVariant` |

## Input API

Check every public `input()` / `model()` / `output()` before it ships. Each one is API that consumers
will depend on, so removing it later is a breaking change.

- **Every input has a consumer who needs it.** If its own JSDoc has to explain that it does nothing
  useful, delete the input.
- **Match sibling controls.** Compare with components in the same category: aliases and spelling
  (`readonly` attribute *and* `[readOnly]`, as on `tedi-text-field`), `size` / `disabled` / `invalid`
  inheritance from `tedi-form-field`, and how feedback is composed. A form control that takes
  `error` / `hint` strings while its siblings take a projected `tedi-feedback-text` needs a reason
  in the PR description.
- **Check parity with TEDI React** (`../react/src/tedi/components/`) for names, units and defaults.
  Read the React source before writing down any claim about how React differs.
- **The documented `@default` is the real default.** An input that defaults to `undefined` so it can
  inherit is documented as inheriting, not with the value it ends up resolving to.

## Comments and JSDoc

Apply the deletion test to every line: *if I delete this, what does the reader get wrong?* No
concrete answer means delete it.

**Input JSDoc** is one sentence, at most three lines not counting block tags (`@default`,
`@deprecated`). A non-obvious default may get one clause of why. Leave out:

- How it works inside ("prepended to the button's accessible name", "rendered in whichever unit
  reads best").
- Advice that applies to every Angular input ("bind a stable reference").
- The same caveat repeated on several inputs. If it applies to more than one, it belongs in the
  consumer skill once.
- Telling the consumer to use something else ("use this instead of projecting a
  `tedi-feedback-text`"). That is composition guidance (`@deprecated` naming the replacement is the exception), so it
  goes in the consumer skill.
- Behaviour that is logically necessary ("counts characters, not markup"), comparisons to other
  components, and restating the member's name (`/** Toggles the value. */` above `toggle()`).

```typescript
// ❌
/**
 * Allowed file types as a comma-separated list of extensions and MIME types
 * (`".pdf,.txt"`, `"image/png"`, `"image/*"`). Forwarded to the input's
 * `accept` attribute and re-checked on selection.
 *
 * Applies to what is picked next. Files already listed keep the verdict they
 * were given, so clear them yourself if you tighten this while they are
 * listed.
 */
readonly accept = input<string>();

// ✅
/** Allowed file types as comma-separated extensions and MIME types (`.pdf`, `image/*`). */
readonly accept = input<string>();
```

**Comments in code, templates and SCSS** explain a *why* the code can't show, in one line where
possible. Don't comment a member whose name already says what it does (`isStacked`,
`clearRejectionWhenResolved`), describe private wiring, or explain why something is private.

## Styling

### SCSS Rules
- Use `tedi-` prefix for all class names (enforced by stylelint).
- Follow BEM: `.tedi-block__element--modifier`
- **Sub-components are separate BEM blocks** with a shared prefix: `tedi-modal-header`, `tedi-modal-content`, `tedi-modal-footer`. Angular components have their own templates and internal structure, making them blocks — not elements. Use `__` elements only for simple DOM nodes inside a single component's template (e.g., `tedi-modal-header__head`).
- Max nesting depth: 4 levels.
- Use design tokens from `@tedi-design-system/core` for colors, spacing, typography.
- Never use hardcoded color values — always reference tokens.
- Never use fallback values in CSS `var()` — write `var(--token-name)`, not `var(--token-name, fallback)`.
- No obvious comments: do not add comments that restate what a selector, class name, or variable already says (e.g., `// Primary variant` above `&--primary`, or `// Disabled state` above `&:disabled`). Only comment when the logic isn't self-evident. See [Comments and JSDoc](#comments-and-jsdoc).
- Use `ViewEncapsulation.None` — scope styles via BEM naming, not Angular encapsulation.

### Style Targeting: Classes Over Element Selectors
- **Always target CSS classes**, not Angular component element selectors.
- Add a CSS class to the component's `host` binding and style that class instead.
- Only style Angular element selectors directly when you cannot add a class to the host (e.g., third-party components like `cdk-dialog-container` where you don't control the host).

**Correct** — sub-component with its own block class on host:
```typescript
// modal-header.component.ts
@Component({
  host: { class: "tedi-modal-header" },
})
```
```scss
.tedi-modal-header { padding: var(--token); }
.tedi-modal-header__head { display: flex; }
```

**Avoid** — styling Angular element selector:
```scss
// Don't do this when you control the component
tedi-modal-header { padding: var(--token); }
```

**Exception** — third-party element you can't add classes to:
```scss
// OK: cdk-dialog-container is from Angular CDK, we can't add classes to its host
cdk-dialog-container { outline: none; }
```

### Component Styles Load Only When the Component Renders
Angular injects a component's stylesheet when the component is first instantiated, and
`src/styles/index.scss` doesn't bundle component styles. So:

- **Don't borrow another component's BEM classes** (`tedi-button tedi-button--neutral` on your
  host). If that component isn't on the page, its rules don't exist. Reuse its look through the same
  core tokens in your own SCSS, or compose the component itself.
- **`.cdk-overlay-container` defaults to `z-index: 1000`**, below every `--z-index-*` token.
  `src/styles/cdk.scss` raises it to `var(--z-index-modal)` globally; don't repeat the rule in
  component SCSS.

### Custom Properties Resolve Where They Are Declared
A `var()` or relative unit inside a custom property is resolved on the element that declares it. A
host binding like `[style.--_min-height]="'calc(' + rows + ' * 1lh + var(--_padding-y))'"` resolves
`--_padding-y` on the host, where it doesn't exist. Bind the raw number from the host
(`[style.--_min-rows]`) and do the `calc()` in the descendant's SCSS, where the other values are in
scope.

### Icon Color Inheritance Inside Parent Components

When a `tedi-icon` is placed inside an interactive component whose text color changes on hover/active/selected states, the icon should:
- **Default state:** respect the user's `color` input (e.g., `color="danger"` shows danger)
- **State changes (hover, selected, active):** inherit the parent's text color

**For component-owned icons** (in the component's own template), use `color="inherit"` so they always follow the parent:
```html
<tedi-icon name="check" [size]="18" color="inherit" />
```

**For projected/consumer icons** (via `ng-content`), the consumer controls the `color` input. The parent component must override icon color only on state changes via CSS:
```scss
.tedi-my-component__button:hover .tedi-icon {
  color: inherit;
}

.tedi-my-component--selected .tedi-icon {
  color: inherit;
}
```

This lets the consumer's chosen color (e.g., `color="brand"`) apply in the default state, while ensuring the icon follows the parent's text color on hover/selected/active. The selector `.tedi-my-component__button:hover .tedi-icon` (specificity 0,2,0+pseudo) beats `.tedi-icon--color-primary` (0,1,0).

**Every component that contains icons and changes text color on state must include these overrides.**

### Example
```scss
.tedi-button {
  display: inline-flex;
  align-items: center;
  gap: var(--layout-grid-gutters-04);

  &__icon {
    flex-shrink: 0;
  }

  &--primary {
    background-color: var(--button-main-primary-background-default);
  }
}
```

## Testing and Storybook

Test patterns and required providers are in [testing.md](testing.md); story structure, argTypes and
composition rules are in [stories.md](stories.md).

## Barrel Exports

### Component-level `index.ts`
```typescript
export { ComponentNameComponent } from './component-name.component';
export { ComponentNameType } from './component-name.types'; // if applicable
```

### Register in Category `index.ts`
Add the new component export to the parent category barrel file (e.g., `src/tedi/components/form/index.ts`).

## Key File Locations

### Services
- Translation: `src/tedi/services/translation/translation.service.ts` (root-provided)
- Theme: `src/tedi/services/theme/theme.service.ts` (root-provided)
- Toast: `src/tedi/services/toast/toast.service.ts` (root-provided, has static state)
- Breakpoint: `src/tedi/services/breakpoint/breakpoint.service.ts`

### Configuration
- App-level provider: `src/tedi/providers/tedi.provider.ts` → `provideTedi(config)`
- Translation token: `src/tedi/tokens/translation.token.ts`
- Theme token: `src/tedi/tokens/theme.token.ts`
- Translations map: `src/tedi/services/translation/translations.ts` (et, en, ru)

### Utilities
- Date formatting: `src/tedi/utils/date.util.ts`
- Cookie signal: `src/tedi/utils/cookies.util.ts`
- DOM helpers: `src/tedi/utils/elements.util.ts`
- UUID generation: `src/tedi/helpers/generate-uuid.ts`

## Known Quirks
- `toggle.component.ts`, `number-field.component.ts` and `footer-bottom.component.ts` still use the `@ViewChild` decorator. Migrate to `viewChild()` when you touch them, don't copy the pattern
- Translations support both simple strings and parameterized functions: `(key: string) => string`
- Do NOT reference `community/` components as examples — they are community-contributed and not always reviewed
