# Form Controls

TEDI form controls implement Angular's `ControlValueAccessor`, so they integrate with `ReactiveFormsModule` (`[formControl]` / `formControlName`) and `FormsModule` (`[(ngModel)]`) with no adapter. Many also expose a two-way `model()` input for use without a form.

> The control names, selectors, value types, and input names in this file are **illustrative**: they
> teach the integration idiom, not the exact current API. Before relying on a specific input or
> selector, verify it against the installed package's type bundle,
> `node_modules/@tedi-design-system/angular/tedi/index.d.ts` (see SKILL.md → Authoritative Sources).
> Selectors especially: several controls are attribute selectors on a native element, and getting
> that wrong produces a template that renders nothing.

## Available Form Controls

Orientation only. Verify the current roster and selectors against the installed type bundle (each
component's `ɵɵComponentDeclaration` carries its real selector; see
[references/components.md](components.md)):

| Component | Selector | Value type |
|-----------|----------|------------|
| TextFieldComponent | `input[tedi-text-field]` | `string` |
| NumberFieldComponent | `tedi-number-field` | `number` |
| SearchComponent | `tedi-search` | `string` |
| SliderComponent | `tedi-slider` | `number` |
| CheckboxGroupComponent | `tedi-checkbox-group` | `string[]` |
| RadioGroupComponent | `tedi-radio-group` | `string \| null` |
| ToggleComponent | `tedi-toggle` | `boolean` |
| DateFieldComponent | `tedi-date-field` | `Date \| Date[] \| DateRange \| null` |
| DateTimeFieldComponent | `tedi-date-time-field` | `Date \| DateRange \| null` (each end carries a time) |
| DatePickerComponent | `tedi-date-picker` | `Date \| null` — **deprecated**, use `DateFieldComponent` |
| TimeFieldComponent | `tedi-time-field` | `string \| null` (HH:mm) |
| TimePickerComponent | `tedi-time-picker` | `string \| null` (HH:mm) |
| SelectComponent | `tedi-select` | `T \| T[]` |

`CheckboxComponent` (`input[type=checkbox][tedi-checkbox]`) is **not** a TEDI value accessor — it styles a native checkbox, so `[formControl]` on it is handled by Angular's built-in `CheckboxControlValueAccessor` and yields a `boolean`. Inside a managed `<tedi-checkbox-group>`, its `value` input is a `string` identity instead. `DropdownComponent` (`tedi-dropdown`) lives in `overlay/` and is not a form control — it exposes `[(value)]` but implements no `ControlValueAccessor`.

## Basic Usage with Reactive Forms

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
    <label tedi-label for="email">Email</label>
    <input tedi-text-field id="email" formControlName="email" />
  </tedi-form-field>

  <input tedi-checkbox type="checkbox" formControlName="agree" />
</form>
```

## Form Field Structure

Wrap a control with `tedi-form-field` to compose the label, control, and feedback text into one accessible field. `tedi-form-field` wires the feedback text to the control's `aria-describedby` for you. It does **not** associate the label: give the label a `for` and the control a matching `id` yourself.

`tedi-feedback-text` takes its message through the required `text` input, not projected content.

```html
<tedi-form-field>
  <label tedi-label for="email">Email</label>
  <input tedi-text-field id="email" formControlName="email" />
  <tedi-feedback-text text="Enter your work email" type="hint" />
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

## Date and Time Selection

Use `DateTimeFieldComponent` (`tedi-date-time-field`) when one value carries both a date and a time
— don't wire a DateField and a TimeField together by hand. It pairs the same typed input with a
popover holding the calendar and a TimePicker, in `single` or `range` mode (a range carries a time
on each end).

```html
<tedi-form-field>
  <label tedi-label for="dt">Kuupäev ja kellaaeg</label>
  <tedi-date-time-field inputId="dt" [formControl]="dateTimeControl" placeholder="pp.kk.aaaa tt:mm" />
</tedi-form-field>
```

`layout` picks how the two halves are arranged: `"side-by-side"` (default) shows the calendar and
the time picker together, `"multi-step"` asks for the date first and then advances to a separate
time step. `range` always renders side by side.

Set `availableTimes` — a `string[]` of `HH:mm` values, or a `(date: Date) => string[]` for
per-date slots — to replace the scroll wheel with a grid of predefined slots; `timeGridVariant`
(`"button" | "radio"`) and `slotColumns` shape that grid. Without it, `minuteStep` sets the wheel's
granularity.

```html
<tedi-date-time-field
  inputId="dt-slots"
  [formControl]="dateTimeControl"
  layout="multi-step"
  [availableTimes]="slotsForDate"
/>
```

It takes the same calendar inputs as DateField (`minDate`/`maxDate`, `disablePast`/`disableFuture`,
`disabledMatchers`, `availableDays`/`unavailableDays`, `selectionLevel`, `monthYearSelectType`,
`showWeekNumbers`, `numberOfMonths`). `useNativePicker` falls back to the OS
`<input type="datetime-local">` (single mode only) and `modal`/`fullscreen` open the picker in a
modal instead of the popover; both accept a breakpoint name (`"sm"`, `"md"`, ...) to switch below
that breakpoint. Like DateField it owns no label — compose it with `tedi-form-field` and
`tedi-label`.

## Value and event conventions

TEDI form controls hand you the **parsed value**, not a raw DOM event:

- Bound to a `FormControl` or `formControlName`, the control writes its typed value straight into the
  form model.
- Bound through a two-way `model()` input, it emits the typed value on change (`[(value)]`,
  `[(checked)]`, and so on).
- Time controls use `"HH:mm"` 24-hour strings. Date controls use `Date`, or a mode-shaped value where
  `multiple` / `range` modes exist.

Two exceptions worth knowing, both easy to get wrong:

- **`CheckboxComponent` is not a TEDI value accessor.** Its selector is
  `input[type=checkbox][tedi-checkbox]`, so it styles a native checkbox and `[formControl]` on it is
  handled by Angular's own `CheckboxControlValueAccessor`, yielding a `boolean`. Inside a managed
  `<tedi-checkbox-group>` its `value` input is a `string` identity instead.
- **`DropdownComponent` is not a form control at all.** It lives in `overlay/` and exposes
  `[(value)]` without implementing `ControlValueAccessor`, so `formControlName` on it throws
  Angular's `NG01203: No value accessor for form control` at runtime.
  Reach for `tedi-select` when you want a form-bound picker.

Confirm the value shape for any other control from its `InputSignal<T>` / `ModelSignal<T>` type in the
installed `index.d.ts`.
