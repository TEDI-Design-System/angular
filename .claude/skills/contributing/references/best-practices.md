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
  render: () => ({
    props: { control: new FormControl('') },
    template: `<tedi-my-control [formControl]="control" />`,
  }),
};
```

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
