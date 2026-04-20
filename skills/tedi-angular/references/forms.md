# Form Controls

TEDI form controls implement Angular's `ControlValueAccessor` interface, integrating seamlessly with `ReactiveFormsModule` and `FormsModule`.

## Available Form Controls

| Component | Selector | Value Type |
|-----------|----------|------------|
| TextFieldComponent | `input[tedi-text-field]` | `string` |
| NumberFieldComponent | `tedi-number-field` | `number` |
| CheckboxComponent | `input[tedi-checkbox]` | `boolean` |
| CheckboxGroupComponent | `tedi-checkbox-group` | `string[]` |
| RadioGroupComponent | `tedi-radio-group` | `string \| null` |
| ToggleComponent | `tedi-toggle` | `boolean` |
| DatePickerComponent | `tedi-date-picker` | `Date \| null` |
| DropdownComponent | `tedi-dropdown` | `string` |
| SelectComponent | `tedi-select` | `T \| T[]` |

## Basic Usage with Reactive Forms

```typescript
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  TextFieldComponent,
  FormFieldComponent,
  LabelComponent,
  FeedbackTextComponent,
  CheckboxComponent,
} from '@tedi-design-system/angular/tedi';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TextFieldComponent,
    FormFieldComponent,
    LabelComponent,
    FeedbackTextComponent,
    CheckboxComponent,
  ],
  template: `
    <form [formGroup]="form">
      <tedi-form-field>
        <tedi-label>Full name</tedi-label>
        <input tedi-text-field formControlName="name" />
        <tedi-feedback-text type="error" *ngIf="form.controls.name.invalid">
          Name is required
        </tedi-feedback-text>
      </tedi-form-field>

      <tedi-form-field>
        <tedi-label>Email</tedi-label>
        <input tedi-text-field formControlName="email" type="email" />
      </tedi-form-field>

      <input tedi-checkbox formControlName="agree" />
    </form>
  `,
})
export class MyFormComponent {
  form = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl(''),
    agree: new FormControl(false),
  });
}
```

## Form Field Structure

The recommended structure for a form field:

```html
<tedi-form-field>
  <tedi-label>Field label</tedi-label>
  <input tedi-text-field [formControl]="control" />
  <tedi-feedback-text type="error">Error message</tedi-feedback-text>
  <tedi-feedback-text type="hint">Help text</tedi-feedback-text>
</tedi-form-field>
```

`FormFieldComponent` wraps the input with optional label, icon, clear button, and feedback text. Key inputs:

- `size: 'default' | 'small'` — field size
- `icon: string | FormFieldIcon` — icon name or config
- `clearable: boolean` — show clear button when value exists

## Two-Way Binding (without forms)

TEDI controls also support two-way binding via `model()` signals:

```html
<!-- Template-driven two-way binding -->
<tedi-date-picker [(selected)]="selectedDate" />
<tedi-dropdown [(value)]="selectedOption" />
<tedi-toggle [(value)]="isEnabled" />

<!-- Checkbox / radio groups — children identified by [value] -->
<tedi-checkbox-group [(values)]="selectedTags">
  <input type="checkbox" tedi-checkbox value="a" />
  <input type="checkbox" tedi-checkbox value="b" />
</tedi-checkbox-group>

<tedi-radio-group [(value)]="status">
  <input type="radio" tedi-radio value="active" />
  <input type="radio" tedi-radio value="archived" />
</tedi-radio-group>
```

**Note:** `tedi-checkbox-group` / `tedi-radio-group` activate their form-control behavior only when a `FormControl` is bound or the two-way-bound value is non-null / non-empty. For null/empty initial values, prefer a `FormControl` — `new FormControl<string[]>([])` or `new FormControl<string | null>(null)`. Without any binding, the group is a passive visual wrapper.

## Validation States

Form fields automatically reflect validation state from the `FormControl`:

```typescript
// The form field shows error styling when control is invalid + touched
this.emailControl = new FormControl('', [Validators.required, Validators.email]);
```

You can also set validation state explicitly on date-picker:

```html
<tedi-date-picker [inputState]="'error'" />
```

States: `'default'`, `'error'`, `'valid'`.

## Disabled State

Both programmatic and form-level disable work:

```typescript
// Via FormControl
this.control.disable();

// Via input
<input tedi-text-field [formControl]="control" [disabled]="true" />
```

The component combines native disabled state with form-disabled state internally.

## Date Picker

The date picker has extensive configuration:

```html
<tedi-date-picker
  [formControl]="dateControl"
  [showWeekNumbers]="true"
  [allowManualInput]="true"
  [closeOnSelect]="true"
  [monthMode]="'dropdown'"
  [yearMode]="'dropdown'"
  [inputSize]="'default'"
  [inputState]="'default'"
  [disabled]="disabledDateMatcher"
/>
```

The `disabled` input accepts a `DatePickerMatcher` — a function `(date: Date) => boolean` that returns true for dates that should be disabled.
