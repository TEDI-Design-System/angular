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

## Responsive Inputs (Breakpoint Support)

**Always check the TEDI React equivalent before settling on an API.** If the React component uses `BreakpointSupport<T>` / `useBreakpointProps` on a prop, the Angular component should expose breakpoint support on the equivalent input. Skipping this leaves the Angular library behind on responsive behavior and forces consumers to recreate it manually.

Two patterns exist for this — pick by need:

### Pattern A: Per-input `BreakpointInput<T>` (preferred when one or two inputs need to be responsive)

Use this when a single input (e.g., a flag, count, or variant) should vary by breakpoint without restating sibling inputs. Reference: `tedi/components/content/carousel/carousel-content/carousel-content.component.ts:46-55`, `tedi/components/form/time-field/time-field.component.ts` (`useNativePicker`).

```typescript
import {
  breakpointInput,
  BreakpointInput,
  BreakpointService,
} from "../../../services/breakpoint/breakpoint.service";

readonly useNativePicker = input(
  { xs: false },
  { transform: (v: BreakpointInput<boolean>) => breakpointInput(v) },
);

private readonly breakpointService = inject(BreakpointService);

readonly useNativePickerResolved = computed(() => {
  const v = this.useNativePicker();
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
<tedi-time-field [useNativePicker]="{ xs: true, md: false }" />
<tedi-time-field [useNativePicker]="true" />
```

Notes:
- `breakpointInput()` wraps a plain `T` into `{ xs: T }`, so both shapes work.
- Always compare with `!== undefined` (not truthy) — `false` and `0` are valid values that must not be skipped.
- Iterate **largest breakpoint first** to apply mobile-first cascade correctly.

### Pattern B: Per-component breakpoint inputs (preferred when many inputs need to be responsive together)

Use this when several inputs commonly change together at a given breakpoint and consumers benefit from grouping them. Reference: `tedi/components/navigation/link/link.component.ts:55-105`.

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

- Add `parameters.status: { type: ["breakpointSupport"] }` to the meta so the badge shows up.
- For pattern A inputs, set the argType `type.summary` to `"BreakpointInput<T>"` with a detail listing both shapes.
- For pattern B, document the per-breakpoint inputs (`xs`, `sm`, `md`, `lg`, `xl`, `xxl`) in argTypes and category them under `"breakpoint inputs"`.
- Add at least one story that demonstrates a responsive case (e.g., `WithResponsiveX`).

### Consumer catalog

In `skills/tedi-angular/references/components.md`, write breakpoint-aware inputs as:

```
- `useNativePicker: BreakpointInput<boolean> = false` — ... Accepts a breakpoint object, e.g. `{ xs: true, md: false }`
```

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

## Styling

### SCSS Rules
- Use `tedi-` prefix for all class names (enforced by stylelint).
- Follow BEM: `.tedi-block__element--modifier`
- **Sub-components are separate BEM blocks** with a shared prefix: `tedi-modal-header`, `tedi-modal-content`, `tedi-modal-footer`. Angular components have their own templates and internal structure, making them blocks — not elements. Use `__` elements only for simple DOM nodes inside a single component's template (e.g., `tedi-modal-header__head`).
- Max nesting depth: 4 levels.
- Use design tokens from `@tedi-design-system/core` for colors, spacing, typography.
- Never use hardcoded color values — always reference tokens.
- Never use fallback values in CSS `var()` — write `var(--token-name)`, not `var(--token-name, fallback)`.
- No obvious comments — do not add comments that restate what a selector, class name, or variable already says (e.g., `// Primary variant` above `&--primary`, or `// Disabled state` above `&:disabled`). Only comment when the logic isn't self-evident.
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
  gap: var(--tedi-spacing-2);

  &__icon {
    flex-shrink: 0;
  }

  &--primary {
    background-color: var(--tedi-color-primary);
  }
}
```

## Testing Patterns

### Basic Component Test
```typescript
describe('ComponentNameComponent', () => {
  let fixture: ComponentFixture<ComponentNameComponent>;
  let component: ComponentNameComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ComponentNameComponent],
      providers: [
        { provide: TediTranslationService, useClass: TranslationMock },
        { provide: TEDI_TRANSLATION_DEFAULT_TOKEN, useValue: 'et' },
      ],
    });
    fixture = TestBed.createComponent(ComponentNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

### Testing Inputs
```typescript
fixture.componentRef.setInput('variant', 'secondary');
fixture.detectChanges();
```

### Testing Form Controls
Use a test host component:
```typescript
@Component({
  standalone: true,
  imports: [MyControlComponent, ReactiveFormsModule],
  template: `<tedi-my-control [formControl]="control" />`
})
class TestHostComponent {
  control = new FormControl<string>('');
}
```

### Testing Keyboard Navigation
```typescript
const el = fixture.debugElement.query(By.css('.tedi-component'));
el.triggerEventHandler('keydown', new KeyboardEvent('keydown', { key: 'ArrowDown' }));
fixture.detectChanges();
```

### Testing Accessibility
- Verify ARIA attributes are set correctly.
- Verify role attributes on interactive elements.
- Verify focus moves correctly on keyboard events.
- Verify `aria-live` regions update on state changes.

### Required Providers
- `TediTranslationService` → mock with `TranslationMock` class (translate returns key, track returns () => key)
- `TEDI_TRANSLATION_DEFAULT_TOKEN` → provide `'et'` as value
- `LiveAnnouncer` → mock when component uses screen reader announcements (e.g., number-field)
- CDK Overlay → mock completely for overlay/toast service tests

### Common Pitfalls
- Services with static state (e.g., ToastService) need reset in `beforeEach`
- Use `fixture.componentRef.setInput()` to set signal inputs, NOT direct property assignment
- Use `fakeAsync`/`tick` for components with setTimeout or animations, clean up in `afterEach`
- Import all child components in TestBed `imports` array

## Storybook Stories

### Structure
```typescript
export default {
  title: 'TEDI-Ready/Components/Category/ComponentName',
  component: ComponentNameComponent,
  decorators: [
    moduleMetadata({
      imports: [ComponentNameComponent, /* dependencies */],
    }),
  ],
  parameters: {},
  argTypes: {
    // Every public input/model must have an entry
    inputName: {
      description: 'What this input does',
      control: { type: 'radio' },
      options: ['option1', 'option2'],
      table: {
        category: 'inputs',
        type: { summary: 'TypeName' },
        defaultValue: { summary: 'option1' },
      },
    },
  },
} as Meta<ComponentNameComponent>;

export const Default: StoryObj<ComponentNameComponent> = {
  args: { inputName: 'option1' },
};

export const WithReactiveForms: StoryObj<ComponentNameComponent> = {
  render: () => {
    const control = new FormControl('');

    return {
      props: { control },
      template: `
        <tedi-row cols="1" [gapY]="3">
          <tedi-col>
            <tedi-my-control [formControl]="control" />
          </tedi-col>
          <tedi-col>
            <tedi-alert type="info" [showClose]="false">
              <pre tedi-text modifiers="small">{{ {
  value: control.value,
  touched: control.touched,
  dirty: control.dirty
} | json }}</pre>
            </tedi-alert>
          </tedi-col>
        </tedi-row>
      `,
    };
  },
};
```

> **Note:** Always display reactive form state using `tedi-row`/`tedi-col` for layout, a `<tedi-alert type="info">` with a `<pre tedi-text modifiers="small">` block and the `json` pipe. This provides a consistent, scannable debug output across all form component stories. Import `RowComponent`, `ColComponent`, `AlertComponent`, and `TextComponent` in the story's `moduleMetadata`.

### Story Coverage
Every story file must include:
- **Default** — component with default props
- One story **per visual variant** (e.g., primary, secondary, ghost)
- One story **per significant state** (disabled, loading, error, empty)
- **Interactive examples** — form controls with reactive forms
- Stories matching **all variants visible in Figma**

## Barrel Exports

### Component-level `index.ts`
```typescript
export { ComponentNameComponent } from './component-name.component';
export { ComponentNameType } from './component-name.types'; // if applicable
```

### Register in Category `index.ts`
Add the new component export to the parent category barrel file (e.g., `tedi/components/form/index.ts`).

## Key File Locations

### Services
- Translation: `tedi/services/translation/translation.service.ts` (root-provided)
- Theme: `tedi/services/theme/theme.service.ts` (root-provided)
- Toast: `tedi/services/toast/toast.service.ts` (root-provided, has static state)
- Breakpoint: `tedi/services/breakpoint/breakpoint.service.ts`

### Configuration
- App-level provider: `tedi/providers/tedi.provider.ts` → `provideTedi(config)`
- Translation token: `tedi/tokens/translation.token.ts`
- Theme token: `tedi/tokens/theme.token.ts`
- Translations map: `tedi/services/translation/translations.ts` (et, en, ru)

### Utilities
- Date formatting: `tedi/utils/date.util.ts`
- Cookie signal: `tedi/utils/cookies.util.ts`
- DOM helpers: `tedi/utils/elements.util.ts`
- UUID generation: `tedi/helpers/generate-uuid.ts`

## Known Quirks
- `toggle.component.ts` still uses old `@ViewChild` decorator — should be migrated to `viewChild()` signal
- Translations support both simple strings and parameterized functions: `(key: string) => string`
- Do NOT reference `community/` components as examples — they are community-contributed and not always reviewed
