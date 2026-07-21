# Form Controls

TEDI form controls implement Angular's `ControlValueAccessor`, so they integrate with `ReactiveFormsModule` (`[formControl]` / `formControlName`) and `FormsModule` (`[(ngModel)]`) with no adapter. Many also expose a two-way `model()` input for use without a form.

> The control names, selectors, value types, and input names in this file are **illustrative** — they teach the integration idiom, not the exact current API. Verify against the control's `.component.ts` (its `input()`/`model()` signals) or Storybook before relying on a specific input (see SKILL.md → Authoritative Sources).

## Available Form Controls

Orientation only — verify the current roster and selectors against the barrel export (`tedi/index.ts`):

| Component | Selector | Value type |
|-----------|----------|------------|
| TextField | `input[tedi-text-field]` | string |
| NumberField | `input[tedi-number-field]` | number |
| Checkbox | `tedi-checkbox` | boolean |
| CheckboxGroup | `tedi-checkbox-group` | string[] |
| RadioGroup | `tedi-radio-group` | string |
| Toggle | `tedi-toggle` | boolean |
| Select | `tedi-select` | option / option[] |
| DatePicker | `tedi-date-picker` | Date |
| DateField | `tedi-date-field` | Date |
| TimeField | `tedi-time-field` | string (`"HH:mm"`) |
| TimePicker | `tedi-time-picker` | string (`"HH:mm"`) |
| FormField | `tedi-form-field` | — (layout wrapper) |
| Label | `[tedi-label]` | — (on a `<label>`) |
| FeedbackText | `tedi-feedback-text` | — (helper/error text) |
| InputGroup | `tedi-input-group` | — (composes adjacent controls) |

## Reactive Forms (primary idiom)

```ts
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
// import the TEDI control components you use into the component's `imports`

form = new FormGroup({
  email: new FormControl(''),
  agree: new FormControl(false),
});
```

```html
<form [formGroup]="form">
  <tedi-form-field>
    <label tedi-label>Email</label>
    <input tedi-text-field formControlName="email" />
  </tedi-form-field>

  <tedi-checkbox formControlName="agree">I agree to terms</tedi-checkbox>
</form>
```

## Form Field Structure

Wrap a control with `tedi-form-field` to compose the label, control, and feedback text into one accessible field. `tedi-form-field` links the label and messages to the control for you.

```html
<tedi-form-field>
  <label tedi-label>Email</label>
  <input tedi-text-field formControlName="email" />
  <tedi-feedback-text>Enter your work email</tedi-feedback-text>
</tedi-form-field>
```

`tedi-form-field` accepts layout/behavior inputs (conceptually `size`, `icon`, `clearable`, …) — verify the current input names against the source.

## Two-Way Binding (without forms)

Controls that expose a `model()` input can be bound directly, no `FormControl` needed:

```html
<input tedi-text-field [(value)]="email" />
<tedi-toggle [(checked)]="enabled" />
```

Group controls (`tedi-checkbox-group`, `tedi-radio-group`) coordinate their children's selected state; they activate the full `ControlValueAccessor` behavior when bound to a form control, and expose a two-way model otherwise. Verify the exact model input name against the source.

## Validation States

When a control is bound to a `FormControl`, error styling is driven automatically by the control's validity (`invalid` + touched/dirty), so wiring validators on the `FormControl` is enough.

Some controls also expose an explicit state input (e.g. an input that forces `default` / `error` / `valid`) for cases where validity isn't form-driven — check the component source for the input name and enum members.

## Disabled State

Prefer the reactive-forms API — `control.disable()` / `control.enable()` — which keeps the disabled state in the model:

```ts
this.form.controls.email.disable();
```

A `[disabled]` template input also exists on most controls for non-form usage. Do not assume a given `disabled`-style input is or isn't deprecated — verify against the component source at the pinned tag.

## Date Picker

The date picker supports single-date selection with a calendar popover and (optionally) manual text entry. Constrain selectable dates with a matcher-style input (conceptually `disabledMatchers` / a `DatePickerMatcher`) rather than a bare min/max where available.

Treat the specific input names, value shape, and matcher API as **concepts to verify** — read `form/date-picker` (and related `date-field` / `time-field`) source and stories at the pinned tag for the exact current props.

## Event / value conventions

TEDI form controls hand you the **parsed value**, not a raw DOM event:

- Bound to a `FormControl` / `formControlName`, the control writes the typed value into the form model directly.
- Bound via a two-way `model()` input, the control emits the typed value on change (`[(value)]`, `[(checked)]`, etc.).
- Time controls use `"HH:mm"` 24-hour strings; date controls use `Date` (or a mode-shaped value where multiple/range modes exist).

Confirm the exact value shape for any control against its `.component.ts` / Storybook.
