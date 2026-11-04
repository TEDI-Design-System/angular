# Test & Verify TEDI Component

Target: the component path given in the task, or the whole suite.

## Workflow

### 1. Run Tests

For one component:
```bash
npx jest <component-path> --coverage=false
```

`--coverage=false` is required for a narrow run: coverage is on by default and measured against the
whole library, so a single-component run would always trip the 80% global threshold and exit 1.
Call `npx jest` rather than `npm test --`: the npm script adds `--passWithNoTests`, so a mistyped
path exits 0 without running anything.

For the whole suite:
```bash
npm test
```

### 2. Analyze Failures

If tests fail:
- Read the failing test file and the component source.
- Identify the root cause — is it a test issue or a component bug?
- Fix the issue in the appropriate file.
- Re-run the failing test to confirm the fix.

### 3. Run Lint

```bash
npm run lint
```

### 4. Fix Lint Errors

If lint reports errors:
- Fix each reported issue in the source file.
- Re-run lint to confirm all errors are resolved.

### 5. Known Workarounds

#### jsdom CSS `@layer` parse errors

jsdom can't parse the CDK overlay's `@layer` rules and reports "Could not parse CSS stylesheet".
`jest-jsdom-env.ts` filters these at the environment level. Don't try to silence them by patching
`console.error` in `setup-jest.ts` or a spec: that runs too late to catch them.

### 6. Report

Summarize what was run and the outcome:
- Tests: pass/fail count
- Lint: clean or what was fixed
- Any issues that need manual attention

## Patterns

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
- `TediTranslationService` → mock with `TranslationMock`; `TEDI_TRANSLATION_DEFAULT_TOKEN` → `'et'`:
  ```typescript
  class TranslationMock {
    translate(key: string) { return key; }
    track(key: string) { return () => key; }
  }
  ```
- `LiveAnnouncer` or `ToastAnnouncerService` → mock when the component announces to screen readers
- CDK Overlay → mock completely for overlay/toast service tests

### Common Pitfalls
- Services with static state (e.g., ToastService) need reset in `beforeEach`
- Use `fixture.componentRef.setInput()` to set signal inputs, NOT direct property assignment
- Use `fakeAsync`/`tick` for components with setTimeout or animations, clean up in `afterEach`
- Import all child components in TestBed `imports` array
