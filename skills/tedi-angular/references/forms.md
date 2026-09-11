# Form Controls

TEDI form controls implement Angular's `ControlValueAccessor` interface, integrating seamlessly with `ReactiveFormsModule` and `FormsModule`.

## Available Form Controls

| Component | Selector | Value Type |
|-----------|----------|------------|
| TextFieldComponent | `input[tedi-text-field]` | `string` |
| NumberFieldComponent | `tedi-number-field` | `number` |
| SearchComponent | `tedi-search` | `string` |
| SliderComponent | `tedi-slider` | `number` |
| CheckboxGroupComponent | `tedi-checkbox-group` | `string[]` |
| RadioGroupComponent | `tedi-radio-group` | `string \| null` |
| ToggleComponent | `tedi-toggle` | `boolean` |
| DateFieldComponent | `tedi-date-field` | `Date \| Date[] \| DateRange \| null` |
| DatePickerComponent | `tedi-date-picker` | `Date \| null` — **deprecated**, use `DateFieldComponent` |
| TimeFieldComponent | `tedi-time-field` | `string \| null` (HH:mm) |
| TimePickerComponent | `tedi-time-picker` | `string \| null` (HH:mm) |
| SelectComponent | `tedi-select` | `T \| T[]` |

`CheckboxComponent` (`input[type=checkbox][tedi-checkbox]`) is **not** a TEDI value accessor — it styles a native checkbox, so `[formControl]` on it is handled by Angular's built-in `CheckboxControlValueAccessor` and yields a `boolean`. Inside a managed `<tedi-checkbox-group>`, its `value` input is a `string` identity instead. `DropdownComponent` (`tedi-dropdown`) lives in `overlay/` and is not a form control — it exposes `[(value)]` but implements no `ControlValueAccessor`.

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

      <input tedi-checkbox type="checkbox" formControlName="agree" />
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

## Search

`SearchComponent` (`tedi-search`) is a `string` value accessor that renders its own `tedi-form-field` — do not wrap it in one. It requires `inputId`, and takes an optional trailing `button` (`{ text?, icon?, variant?, ariaLabel? }`); `searchEvent` fires on Enter or button click.

```html
<tedi-search inputId="search" label="Otsing" [formControl]="query" (searchEvent)="run($event)" />
```

The host is a `role="search"` landmark whose accessible name falls back to `ariaLabel` → `label` → `placeholder` → the translated "search". **When a page renders more than one `tedi-search`, give each a distinct `ariaLabel`** — identically named landmarks of the same type fail axe's `landmark-unique` rule. The visible `<label>` is unaffected; `ariaLabel` names only the landmark.

If you build a suggestion panel around the field, `aria-expanded` is the attribute to watch: it is not permitted on a plain textbox (`aria-allowed-attr`), so the input needs `role="combobox"`. `aria-controls` and `aria-haspopup` are global attributes and are valid on a plain text input either way. Point `aria-controls` at a `role="listbox"` popup for a list of options, or a `role="dialog"` popup (with `aria-haspopup="dialog"`) when the panel mixes results with other controls. Bind it conditionally — `[attr.aria-controls]="open() ? 'panel-id' : null"` — since a popup rendered with `@if` or a CDK overlay is absent while closed, and a reference to a missing id fails `aria-valid-attr-value`.

## Date Selection

Use `DateFieldComponent` (`tedi-date-field`) — it is the successor to the now-deprecated `DatePickerComponent`. It wraps a typed text input with a popover (or modal) calendar, and supports `single`, `multiple` and `range` modes.

```html
<tedi-form-field>
  <label tedi-label for="date">Kuupäev</label>
  <tedi-date-field
    inputId="date"
    [formControl]="dateControl"
    [showWeekNumbers]="true"
    monthYearSelectType="dropdown"
  />
</tedi-form-field>
```

By default the calendar's year dropdown/grid offers **100 years back and 20 years forward**. Override the range with `minYear`/`maxYear` (e.g. a date-of-birth field):

```html
<tedi-date-field inputId="dob" [formControl]="dobControl" [minYear]="1900" [maxYear]="2010" />
```

Disable specific dates with `disabledMatchers`, which accepts a `Matcher` — a single `Date`, `Date[]`, `{ before }`, `{ after }`, `{ from, to? }`, `{ dayOfWeek: number[] }`, or a `(date: Date) => boolean` predicate. See the DateField section in `references/components.md` for the full input list.

> **Deprecated:** `tedi-date-picker` still works but is deprecated — prefer `tedi-date-field` for new code.

## Time Selection

Use `TimeFieldComponent` (`tedi-time-field`) for picking a time of day. Its value is an `HH:mm` string (or `null`). It wraps a typed input with a popover/modal picker; free-typed values are normalized on blur (`9` → `09:00`, `930` → `09:30`), and invalid input reverts to the previous value.

```html
<tedi-form-field>
  <label tedi-label for="time">Kellaaeg</label>
  <tedi-time-field inputId="time" [formControl]="timeControl" pickerTrigger="input" />
</tedi-form-field>
```

Pick the picker style with `pickerVariant` (`"scroll" | "slots" | "dropdown" | "none"`), set the minute granularity with `minuteStep`, or supply explicit `timeSlots` (a `string[]` of `HH:mm` values) for the `"slots"` variant. Set `useNativePicker` to fall back to the OS `<input type="time">`. Sizing and validation styling come from the wrapping `tedi-form-field`, not from `tedi-time-field`. See the TimeField section in `references/components.md` for the full input list.

`TimePickerComponent` (`tedi-time-picker`) is the standalone picker surface behind TimeField — most consumers should reach for `tedi-time-field` instead.
