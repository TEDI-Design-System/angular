# Discovering Components

**This is a discovery guide, not a component snapshot.** The roster and the exact inputs change
every release, so this file does not enumerate them. It tells you where to read the always-current
catalog, and then documents the behaviour that reading the types *won't* tell you.

Read in this order:

1. **The installed type bundle**: what exists, its selector, and its real inputs.
2. **[Behaviour the types don't tell you](#behaviour-the-types-dont-tell-you)**: the traps, below.

The type bundle lives in the consumer's own `node_modules`, so it is version-exact by construction
and needs no network. Reach for GitHub or Storybook only when there is no install to read (see
SKILL.md → Authoritative Sources).

## Two namespaces

`@tedi-design-system/angular` ships components under two entry points:

- **`/tedi`**: TEDI-Ready components. Production-grade, stricter rules. **Prefer these.**
- **`/community`**: Community/extended components. Relaxed linting, not a reference for TEDI patterns.

Several Community components are **deprecated** in favour of TEDI-Ready equivalents, and the set
with no TEDI-Ready alternative shifts over time. The component's JSDoc carries the current
deprecation state.

**Read the entry-point warning in the traps section before you import from `/community`.** In
Angular the two namespaces collide in a way they cannot in React: they share class names *and*
selectors.

## The type bundle is the catalog

Angular libraries are rolled up by ng-packagr, so unlike React there is no per-component `.d.ts`
tree. Each entry point ships **one flattened declaration file**:

```
node_modules/@tedi-design-system/angular/tedi/index.d.ts       # TEDI-Ready, ~500 KB
node_modules/@tedi-design-system/angular/community/index.d.ts  # Community
```

One file sounds worse than a tree. It is better: it is a single greppable index, JSDoc is preserved,
and Angular's compiler metadata makes the **selector** machine-readable, which no amount of reading
the class name will give you.

### List every component and its selector

Each component carries a `static ɵcmp: ɵɵComponentDeclaration<Class, "selector", ...>`. That second
type argument is the real selector:

```bash
D=node_modules/@tedi-design-system/angular/tedi/index.d.ts
grep -oE 'ɵɵComponentDeclaration<[A-Za-z0-9_]+, "[^"]+"' $D \
  | sed 's/.*Declaration<//; s/, "/  ->  /; s/"$//'
```

That prints the whole roster, for example:

```
IconComponent        ->  tedi-icon
TextComponent        ->  [tedi-text]
ButtonComponent      ->  [tedi-button]
CardButtonComponent  ->  a[tedi-card-button], button[tedi-card-button]
```

**Never guess a selector from the class name.** `ButtonComponent` is `[tedi-button]`, an attribute
you put on a real `<button>`, not `<tedi-button>`. `TextComponent` is `[tedi-text]`. `CheckboxComponent`
is `input[type=checkbox][tedi-checkbox]`, which means it only matches a native checkbox input. A
component used with the wrong selector shape renders nothing, silently, with no template error.

### Read one component's real inputs

Find the class and read to its `ɵcmp` line. The type aliases sitting just above the class give you
the enum members:

```bash
D=node_modules/@tedi-design-system/angular/tedi/index.d.ts
awk '/^declare class AlertComponent/{f=1} f{print} f&&/static ɵcmp/{exit}' $D
```

What you get back per input:

- **JSDoc** with prose and `@default`.
- **`InputSignal<T>`** for a one-way `input()`, **`ModelSignal<T>`** for a two-way `model()` (bind it
  with `[(name)]`), **`OutputEmitterRef<T>`** for an `output()`.
- The `ɵcmp` line's input map repeats each input with a `"required": true|false` flag, which is the
  quickest way to see what you must pass.
- `hostDirectives` in the `ɵcmp` line, which contribute further inputs from a shared base directive.

Storybook (`storybook.tedi.ee/angular`) renders the same information via Compodoc. Convenient for a
human, but it tracks `main`, so the installed bundle wins on any disagreement.

## Category map

Source categories under `src/tedi/components/`: `base` · `buttons` · `content` · `filter` · `form` ·
`helpers` · `layout` · `loader` · `navigation` · `notifications` · `overlay` · `tags`. Useful for
orientation when reading the repo; for the consumer roster use the selector listing above.

## Capability patterns

Components opt into shared capabilities: attribute versus element selectors, signal `input()`
binding, two-way `model()` binding, content projection slots, and breakpoint-aware input values. See
**SKILL.md → Component Patterns** for how each works; the selector and input types tell you which a
given component supports.

## Behaviour the types don't tell you

Selectors, input names, types and defaults are all in the type bundle, so go read them. What follows
is the opposite: behaviour that is invisible in the declaration, or spread across components. This is
the part of this document worth maintaining by hand.

### The `/tedi` and `/community` entry points collide

This is the highest-value trap in the Angular library and it has no React equivalent. **27 selectors
are declared in both entry points, under identical class names**, including `tedi-card`,
`tedi-modal`, `tedi-accordion`, `tedi-tabs`, `tedi-dropdown`, `tedi-form-field`, `tedi-pagination`,
`tedi-search`, `tedi-tag`, `[tedi-floating-button]`, `tedi-file-dropzone`, and the checkbox/radio
group family.

`CardComponent` from `/community` and `CardComponent` from `/tedi` are different components with
different input APIs behind the same `<tedi-card>` tag. Consequences:

- The template is **identical either way**, so nothing at the usage site reveals which one you got.
  Only the `imports` array does.
- An IDE auto-import or an agent completing from memory picks whichever it finds first, and the
  result still compiles.
- The failure is a runtime one: inputs the other version doesn't declare are silently ignored, or
  Angular reports an unknown property on a tag that clearly exists.

So: **always write the entry point explicitly** when importing, check it when editing an existing
template that misbehaves, and never copy an `imports` line between a `/tedi` and a `/community`
example. Where the same component exists in both, the `/tedi` one is the answer.

The two Card APIs differ concretely: TEDI-Ready takes `padding` in rem and `border`, plus
`tedi-card-icon` and breakpoint inputs; Community takes named `spacing` and `accentBorder`.

### `tedi-text-editor` lives behind its own entry point

The rich text editor is the one component that is **not** in the `/community` barrel. It ships as its
own secondary entry point so the rest of the library stays free of its dependencies:

```ts
import { TextEditorComponent } from "@tedi-design-system/angular/community/text-editor";
```

`ngx-quill` and `quill` are **optional** peer dependencies, declared in `peerDependenciesMeta`, so
installing the library does not pull them in. Install them yourself, and load Quill's `snow` theme
stylesheet globally, or the editor renders unstyled:

```scss
// styles.scss
@forward "quill/dist/quill.core.css";
@forward "quill/dist/quill.snow.css";
```

It is a normal TEDI form control otherwise: a `ControlValueAccessor` that works with
`formControl`, `formControlName` and `ngModel`, and that composes with `tedi-form-field`.

Three things the types won't warn you about:

- **`<label for>` cannot name it.** Quill's editing area is a `contenteditable` div, and `for` only
  resolves to labelable elements. Give the label an `id` and point `ariaLabelledby` at it (or set
  `ariaLabel`). This is the one control where the usual `for`/`id` pairing silently does nothing.
- `modules` **replaces** the default toolbar rather than extending it. Copy
  `TEXT_EDITOR_DEFAULT_MODULES` and edit it if you only want to add a button.
- `tedi-form-field`'s `characterLimit` counts the **visible text**, not the Quill markup behind it,
  so formatting a word bold adds no characters. It is the one control that reports its own count
  (the optional `characterCount` member of `FormFieldControl`) rather than letting the field measure
  its value.
  
Both entry points declare `[tedi-floating-button]`. The Community component is
**deprecated**: it has only `variant` / `size` / `axis`. The TEDI-Ready one adds `position`,
`placement`, `offset` and `zIndex`. Import from `/tedi`.

### Composition constraints

- **`[tedi-card-button]` projects a `tedi-card` and nothing else.** Other content is not projected.
  The host element supplies the semantics: an anchor for `href` / `routerLink`, a button for actions
  and the disabled state.
- **`button[tedi-collapse-button]` goes on a native `<button>`.** The host *is* the button, so don't
  nest another one inside.
- **`tedi-table-columns-menu` must be a descendant of `<tedi-table>`.** It finds the table through
  DI (`TEDI_TABLE_CONTEXT`), so rendering it outside the table gives you nothing useful.
- **`tedi-card` does not clip its content.** Tooltips, popovers, select dropdowns and absolutely
  positioned children escape it by design. Add an `overflow` utility yourself if you need clipping
  or scrolling. Corner rounding is carried by the first and last block, not the card.
- **`tedi-card-row` stacks via its `direction` input**, not a flex-direction utility class, because
  the row uses `direction` to decide which corners it rounds.
- **`tedi-card-icon` does not inherit the card's background.** Its `background` defaults to
  `brand-primary` independently.
- **`[tedi-label-row]` projects your own `<label tedi-label>`** plus trailing affixes as siblings, so
  native label attributes (`for`, `id`, `aria-*`, handlers) keep working.
- **`tedi-inline-edit` needs an `<ng-template tediInlineEditControl>`.** The control goes in that
  template, not as plain content — it is instantiated on entering edit mode and destroyed on
  leaving. Without the template the value never becomes editable. The inline edit does **not** own
  the value: your control keeps its own binding, and `displayValue` has to be bound to the same
  source. `(editCancel)` only reports that Escape was pressed; restoring the previous value is
  yours to do. Give the editor its own accessible label. A projected `tedi-feedback-text` is linked to the
  trigger, and to the control when it is a text field, textarea, select, date field, time field or
  file upload; other controls are not linked automatically. Use `updateOn: "change"` or
  `"blur"` when persisting the bound value in `editCommit`; `"submit"` remains the parent form's
  responsibility.
- **`tedi-attachment` has no built-in action buttons.** Project neutral `tedi-button`s inside a single
  `<tedi-attachment-actions>` and wire `(click)` and `disabled` yourself.
- **`tedi-skeleton-block` belongs inside `tedi-skeleton`.** The wrapper stacks whatever is projected
  into it as a flex column gapped by `--loader-skeleton-inner-spacing-y`, and it owns the loading
  announcement. A block on its own is `aria-hidden` decoration that announces nothing; put a
  `tedi-row`/`tedi-col` grid inside the wrapper when blocks need to sit side by side. Use **one
  wrapper per loading region**, not one per block: the announcement is per wrapper, so several
  wrappers mounting together compete for the same live region.
- **`tedi-skip-links` renders only links marked `*tediSkipLink`.** Anything else projected into it
  is dropped. Without any marked links it renders one default link to `#main-content`, so the page
  needs an element with `id="main-content"`.
- **`tedi-heading-with-icon` projects the heading text and nothing else.** The icon comes from the
  `icon` input, not from projection, so you cannot swap in your own `tedi-icon` or add trailing
  content. It is decorative and `aria-hidden`, which means the projected text is the whole accessible
  name — if the icon carries meaning the text doesn't, compose a heading and an icon yourself.
- **`tedi-sheet` content goes in `<ng-template tediSheetContent>`.** The sheet renders it into an
  overlay only while open, so content placed directly in `<tedi-sheet>` stays on the page. The
  header, body, footer, `tediSheetTrigger` and `tediSheetClose` find the sheet through DI and must be
  inside it.
- **`tedi-file-dropzone`'s `files` has no separate "default" input** — unlike the React version, which
  needs `defaultFiles` alongside `files` to distinguish uncontrolled from controlled. The binding
  picks the mode: `[files]` seeds the list and leaves the dropzone owning it, `[(files)]` keeps the
  parent in sync, `[formControl]` hands it to the form. Bind a stable reference, though: an
  expression that builds a new array on every check — a getter, `[files]="docs.filter(isReady)"` —
  is written back each time and discards whatever the user added.
- **`tedi-file-dropzone` validates itself.** It registers on `NG_VALIDATORS`, so a `formControl` bound
  to it fails with a `rejectedFiles` error (carrying the offending files) while any rejected file is
  still listed — you don't add a validator for that. `Validators.required` alone would pass on a list
  of visibly broken files whenever `keepRejectedFiles` is on and keeps them in the value. Same shape as Angular
  Material's datepicker: the constraint comes from the component's own inputs (`accept`, `maxSize`), so
  the component owns the rule. No `registerOnValidatorChange` is needed — `validate()` is a pure
  function of the control value, which Angular already revalidates on every change.
- **`tedi-file-dropzone` emits `fileRemove` alongside `filesChange`.** `filesChange` gives the new list;
  `fileRemove` gives the single entry the user deleted, so an in-flight upload can be aborted or a blob
  URL revoked without diffing the two arrays.
- **`tedi-file-dropzone` selects files, it does not upload them.** It validates against `accept` and
  `maxSize` and hands you the list; the upload, and setting each file's `isLoading` / `isValid` as it
  progresses, is yours. A `validator` input adds a rule of your own on top, run on every selected file;
  the reason it returns lands on that file's `error` after the built-in ones and joins the summary,
  with the files it rejected named after it. Describe the rule in `hint`, which follows the allowed
  types and size in the one hint. `keepRejectedFiles` decides what happens to a file that fails
  `accept`, `maxSize` or `validator`: off (the default) discards it and summarises every rejection in
  one message under the dropzone, which paints the border red. On keeps it in the list with its
  reason in that file's `error` and writes no summary of its own — so the form value holds it with
  `isValid: false`, and you must drop the files marked `isValid: false` before uploading. Filter on
  that, not on a truthy `isValid`: a preloaded file leaves it unset, and such a file is eligible. The
  dropzone's own border stays neutral, but a bound control fails on that file, so the border turns
  red once the control is touched or dirty. `error` is writable, so a failure the upload came back
  with lands on the file it belongs to.
- **`tedi-file-dropzone` shows at most one hint and one validation message, error first.** Pass your
  own text through `hint`, `error` and `success`, not projected `tedi-feedback-text`. `error` joins
  the dropzone's own rejection summary in one error, and `success` takes the error's place while
  there is none.
- **Selecting a file that is already listed is skipped by default**, matched on name, size and mtime
  — so two different files sharing a name still both land. `duplicates` changes that: `rename` keeps
  both with the newcomer as `scan (1).pdf`, `replace` swaps the listed file for it. Those two match on
  the name alone, since that is the collision the user sees, and only a file that passes displaces its
  namesake. Project an `*tediFileDropzoneFile` template to replace the built-in `tedi-attachment` row
  when a file needs a progress bar, an icon or its own feedback.
- **`accept`, `maxSize` and `validator` apply to what is picked next.** Files already listed keep the
  verdict they were given, so clear them yourself if you tighten a restriction while they are listed.
  For a check that needs a server round trip, put the file back with `isLoading` and then `isValid`
  set — a new array on `files` or the bound control, not an edit in place, which neither the rows nor
  the control's validity would see — instead of reaching for `validator`.
- **`uploadFolder` applies to the file picker only, and turns `multiple` on by itself.** A folder
  arrives as the files inside it, so `multiple` left unset follows `uploadFolder`; set `[multiple]`
  explicitly and your value wins, including `false`. A single-file zone handed several files keeps
  the first that passes and announces that it kept one, whether they came from a folder or a drop.
  Dragging a folder in is up to the browser and generally does not work, so keep the picker path
  usable when you turn it on.
- **`tedi-file-dropzone` is named by a `tedi-label`, not by its own text.** `instructions` is the
  sentence inside the zone; the field's name comes from a `<label tedi-label>` whose `for` matches
  `inputId`, which the zone references with `aria-labelledby` so both are announced, label first. A
  required dropzone is marked in two places: `[required]` on the label draws the asterisk, which is
  `aria-hidden`, and `[required]` on the dropzone adds the word to the zone's accessible name. The
  zone is a button, which ARIA gives no `aria-required`, and the file input behind it is hidden from
  assistive technology, so the name is the only carrier left. Don't wrap it in `tedi-form-field` —
  that would place projected feedback after the file list rather than under the dropzone.
- **The drop zone is a `div[role="button"]`, not a `<label>` or a native `<button>`** — the same shape
  React and react-dropzone use, and the reason is screen readers, not styling. The file input is
  `display: none` and out of the tab order: while it was the focus target, closing the file dialog
  handed focus back to it and VoiceOver discarded the status message every time. A native `<button>`
  behaves differently again and was also unreliable there. Because a `role="button"` div has no native
  activation, Enter and Space are wired by hand in `handleKeydown`, and `disabled` is `aria-disabled`
  plus `tabindex="-1"` with both the click and key paths guarded. Carbon, USWDS, GOV.UK and Polaris all
  avoid making the file input the focus target for the same reason.
- **Selections are announced assertively and on a delay; removals are polite and immediate.** Closing
  the file dialog leaves the screen reader busy for a moment, and a message inserted during it is
  dropped rather than queued. Removal involves no dialog, so it needs neither. Announcements go through
  `ToastAnnouncerService`, whose regions live on `<body>`: a live region inside the component is
  silently dropped when the rows around it re-render, which is what happens on every selection.
- **Footer parts belong inside `<tedi-footer>`.** `tedi-footer-body`, `-side`, `-section` and
  `-bottom` read the footer's `mobileBreakpoint` through DI and fall back to `sm` outside one.
  Template order doesn't position them: sides go where their `placement` says, and
  `tedi-footer-bottom` always renders below the row.

### File upload

- **`tedi-file-upload`'s `inputId` names the hidden file input, but the add button is the control.**
  Bind `<label tedi-label [for]>` to `inputId` as for any other control: clicking the label opens the
  picker, and the field finds the label by its `for`, gives it an id if it has none, and names the add
  button by the label *and* its own text. Nothing else can name the button, so a field without a label
  announces only "Add attachment".
- **`tedi-file-upload` has no separate "default" input, and owns its hint.** `[files]` seeds the
  list, `[(files)]` keeps the parent in sync, `[formControl]` hands it to the form — bind a stable
  reference, as an expression that builds a new array on every check is written back each time. Change a file's `isLoading` or
  `isValid` by setting a new array, as the field does not see an edit in place. The field owns one hint: the allowed
  types and size (from `accept` / `maxSize`, off with `showRestrictions`) followed by your `hint`
  text. Put guidance there rather than projecting a `tedi-feedback-text` hint, which would make a
  second one. It owns one validation message the same way, shown above the hint: pass an error of
  your own, a server error say, through `error`, where it joins the field's rejection message, or a
  confirmation through `success`, shown only while there is no error. `error` paints the field but
  does not change a bound control's validity. A projected error or success
  text would show below the hint as a second message.
- **`tedi-file-upload` validates itself.** It registers on `NG_VALIDATORS`, so a bound control fails
  with a `rejectedFiles` error while any `isValid: false` file is listed. By default a file that
  fails `accept`, `maxSize` or `validator` is discarded and only the summary under the field remains;
  `keepRejectedFiles` keeps it in the list, marked invalid, instead. It shows as a danger tag; only a
  single file in a field without `multiple` shows just its name. Drop the files marked
  `isValid: false` before uploading either way; a preloaded file leaves `isValid` unset and is
  eligible. `accept`, `maxSize` and `validator` apply to the next selection; files already
  listed keep their verdict, so clear them yourself if you tighten a rule.
- **A `tedi-file-upload` `validator` adds a rule but no hint.** It runs on every selected file, and
  every rule a file breaks is reported in the one rejection summary, built-in reasons first. The
  automatic hint cannot describe it, so describe the rule in `hint`.
- **`maxSize` is in bytes**, the unit `File.size` is in — not megabytes as in React. The hint renders
  it in whichever unit reads best.
- **It selects files, it does not upload them.** `fileRemove` emits each file that leaves the list,
  whether removed, cleared or replaced by the next pick in a single-file field, so an in-flight upload can be aborted without diffing
  `filesChange`. Set `isLoading` on a file yourself while it uploads: its tag shows a spinner and
  loses its remove button. The clear button still removes it, so a stuck upload is
  never stranded; clear `isLoading` and set `isValid: false` on failure or timeout.
- **Below `md` it stacks**: files above a full-width button row, and the clear button becomes a text
  button. There is no input for this.
- **`readOnly` renders the files as a list named by the label**, even a single file, which is a list of
  one. Keep the `<label tedi-label [for]>`: the hidden file input stays rendered, disabled, so the label
  still has its target and clicking it opens nothing.
- **The control turns touched when the file dialog closes**, by picking or cancelling, or when focus
  leaves the add button within the page. Opening the dialog moves focus out of the page, and that blur
  is ignored, so a `required` error does not appear behind the open dialog.
- **It works without `tedi-form-field`**: it paints its own surface, clear button and restrictions
  hint, and a sibling label still names the add button. `error`, `success` and `hint` work the same
  either way. For any other
  describing element, put its id in a static `aria-describedby` on the component, but not one ending
  in `-hint`, `-error` or `-success` after `inputId`: the field uses those ids for its own messages.

### Clear buttons

- **`showClearOnInteraction` belongs on the component that renders the clear button.** For a text
  field or textarea wrapped in `<tedi-form-field>`, set it on the form field, not the control.
  `<tedi-search>` owns its form field and exposes the input itself; `<tedi-select>` exposes it for
  its own clear button. In each case, `clearable` must be true and the field must have a value and
  not be disabled or read-only.
- With the option enabled, the clear button appears while the field is hovered, active, or contains
  focus (including keyboard focus). The default is false, which keeps the clear button visible
  whenever the clearable field has a value.

```html
<tedi-form-field [clearable]="true" [showClearOnInteraction]="true">
  <label tedi-label for="query">Query</label>
  <input tedi-text-field id="query" [(value)]="query" />
</tedi-form-field>
```

### Search suggestions

- **`tedi-search` does not filter.** Bind `suggestions` to a list you have already filtered and react
  to `valueChange`; sync and async sources work the same. `minQueryLength` only gates the panel, so
  gate your own fetch on the same number. It is the TEDI-Ready name for Community Search's
  `autocompleteFrom`.
- **The combobox is opt-in through `suggestions` being bound at all**, not through it having items.
  Left unbound, the input stays a plain `role="searchbox"`; bind `[]` to keep combobox behaviour
  while nothing matches.
- **Enter means search, except when an option is highlighted**, where it accepts that suggestion and
  emits `suggestionSelect` instead of `searchEvent`.
- **`<ng-template tediSearchFooter>` also renders in the no-results state**, which is what makes it
  the place for "nothing matched, try this instead" actions. Navigating suggestions never moves focus
  off the input (`aria-activedescendant`), so the footer's own controls are reached with Tab; Tab past
  the last one closes the panel and continues after the field.
- **`Home`/`End` stay with the text cursor.** The combobox input is editable, so those keys must keep
  editing text; WAI-ARIA APG offers first/last-option navigation only as the non-editable
  alternative. `ArrowUp` wraps to the last suggestion, so nothing is unreachable.
- **Object suggestions are read through `bind*` keys, not a fixed shape.** `bindLabel` names the
  display property, `bindDescription` a secondary line under it, and `bindDisabled` (default key
  `disabled`) a row that greys out and is skipped by arrow keys, Enter and clicks.
- **`[tedi-table-card-row]` goes on a `<div>`, as a direct child of `tedi-table-card` or
  `tedi-table-card-group`.** It renders the `<dt>` / `<dd>` of the `<dl>` its parent owns and takes
  its layout and label size from that parent, so it produces nothing useful anywhere else. The host
  has to be a plain `<div>`: a `<dl>` may only group its terms in `<div>`s, and a custom element
  there breaks the description-list semantics for assistive technology.
- **Use `labelFor` or `labelId` to associate a row's label with its form control.**
  Set `labelFor` to the native input's ID: `id` for `input[tedi-text-field]`, or `inputId` for
  `tedi-date-field` and `tedi-time-field`. For `tedi-select`, whose trigger is a
  `div[role="combobox"]`, set the row's `labelId` and reference it through the select's
  `ariaLabelledby`. These inputs apply to the row's `label` text; projected custom labels
  manage their own attributes. Use one visible label per control.
- **`[tediTableCardEndSlot]` is a directive, not just a projection selector.** `tedi-table-card`
  queries for it to decide whether it has a header at all, so import
  `TableCardEndSlotDirective` wherever the attribute is used. Leave it out and a card whose header
  holds only a badge renders no header, dropping the badge silently.
- **`tedi-table-card-actions` reads its footer from where it sits.** Inside a
  `tedi-table-card-group` it joins that group on the muted background; directly under the card it
  becomes the card's own footer. The card and each of its groups can have one each.
- **A `tedi-table-card-group` inherits every layout input it does not set itself.** Set one on the
  group only when it should differ from the card.

### Choosing the right component

- **`tedi-date-field`, not `tedi-date-picker`.** DatePicker is deprecated; DateField wraps a typed
  input with a popover or modal calendar and supports `single`, `multiple` and `range`.
- **`tedi-time-field`, not `tedi-time-picker`.** TimePicker is the bare picker surface behind
  TimeField. On its own, with no value, the `scroll` wheel parks on `12:00` as display only, and
  nothing is selected until the user picks.
- **`tedi-table`, not `tedi-table-styles`.** The Community `tedi-table-styles` only paints a
  hand-rolled `<table>`; the TEDI-Ready `tedi-table` brings TanStack sorting, filtering and
  pagination.
- **`tedi-form-field` adds a label, feedback text, a `characterLimit` counter, an icon, or a clear
  button to controls that support it.** A standalone text field paints its own surface, so wrapping
  it is otherwise redundant. `tedi-search` renders its own form field and must **not** be wrapped.
- **`tedi-heading-with-icon` over a hand-composed `<hN tedi-text>` plus `tedi-icon`** when the heading
  can wrap: it centres the icon on the *first line* rather than the middle of the block. A heading
  value in `modifiers` overrides `element`'s typography and the icon follows it, so
  `element="h2" modifiers="h4"` is an `<h2>` that looks like an `h4` throughout.
- **`tedi-sheet` for mobile bottom sheets, not `ModalService` with `position: 'bottom'`.** The sheet
  adds drag to close, snap points and a collapsed state, and with `showOverlay`, `trapFocus` and
  `lockScroll` off (plus `closeOnBackdropClick` off) it stays docked while the page behind remains
  usable.

### Responsive behaviour that isn't an input

- **Accordion icon-cards restack, not resize.** Below `md` (768px), items with `showIconCard` put the
  icon-card *above* the header instead of in a left column; both won't fit on a phone without
  truncating one.
- **`tedi-header-bottom` is mobile-only.** It is hidden from `md` up, so don't put anything there
  that desktop users need.

### Accessibility that the types won't get right for you

- **`tedi-label`'s `required` is visual only.** It draws an `aria-hidden` asterisk, so screen readers
  hear "required" only from the control. Put `required` on a native `<input tedi-text-field>` or
  `<textarea tedi-textarea>` (or give its form control `Validators.required`, which sets
  `aria-required`), and bind the `required` input of `tedi-number-field`, `tedi-toggle`,
  `tedi-select`, `tedi-date-field` and `tedi-time-field`. The label used to append a hidden
  "Kohustuslik väli", so a field marked required only on its label was announced; it no longer is.
  Don't add hidden text to the label yourself: it becomes part of the control's name and the field
  is announced as required twice. `tedi-slider` is the exception: a range input always has a value,
  and neither HTML `required` nor `aria-required` applies to it, so its `required` is visual only.
  If the user must set the slider deliberately, say so in its hint (`tedi-feedback-text`).
- **Give each `tedi-search` on a page a distinct `ariaLabel`.** The host is a `role="search"`
  landmark, unnamed unless `ariaLabel` is set. Two identically named landmarks of the same type fail
  axe's `landmark-unique`. `ariaLabel` does not name the field; use `label` (with `hideLabel` if it
  must not show).
- **Don't hand-roll a suggestion panel around `tedi-search`.** It owns the combobox wiring itself
  (see Search suggestions above), and a second panel bolted on top fights it. The rules below apply
  when you are building a combobox out of some *other* control: the input needs `role="combobox"`,
  because `aria-expanded` is not permitted on a plain textbox and fails `aria-allowed-attr`; and
  `aria-controls` has to be bound conditionally
  (`[attr.aria-controls]="open() ? 'panel-id' : null"`), because a popup rendered with `@if` or a CDK
  overlay is absent while closed and a dangling idref fails `aria-valid-attr-value`.
- **Tabs activate differently depending on the host element.** `<button>` tabs use automatic
  activation (arrow keys select), anchor tabs use manual. Arrow Left/Right wrap, Home/End jump, only
  the active tab is in the tab order, and disabled tabs are skipped.
- **A dropdown of links belongs in `dropdownRole="list"`, not `menu`.** `menu` and `listbox` are
  composite widget roles, and the `menuitem` / `option` role replaces the role of the control it
  lands on, so a projected link stops being announced as a link. `list` adds no roles and no key
  handling: links stay links, each is its own tab stop, and the trigger drops `aria-haspopup`. Tab
  moves from the trigger into the panel and out past its last link, and Escape closes it. Use
  `[tedi-dropdown-item][interactiveContent]="true"` only inside a `menu` or `listbox`, where the
  projected control is a button and a widget role is the right answer. A `list` panel also renders
  in the dropdown's own place in the DOM rather than in the overlay container at the end of
  `<body>`, so that mobile screen readers, which walk the document and send no `Tab`, reach its
  links between the trigger and whatever follows it. Query it from the trigger's subtree, not from
  `OverlayContainer`; `menu` and `listbox` panels are still in the shared container.
- **A plain `list` item takes exactly one control.** The row is painted as a single target (hover
  background, pointer cursor) but only the projected control navigates, so the item stretches that
  control's click area over the whole row. A second control in the same item would sit under that
  overlay and become unclickable; split it into its own item instead.
- **Name what a `tedi-skeleton` is loading.** `label` and `completedLabel` are optional in the types
  but the generic translated fallbacks ("Laadimine") tell a screen-reader user nothing about what
  they are waiting for. The completion message is only announced if the skeleton outlived
  `labelDelay` (200ms), so a placeholder that flashes by stays silent on purpose.
- **`aria-busy="false"` after loading is the consumer's job.** The skeleton sets `aria-busy="true"`
  on itself and hosts the `role="status"` live region, but it is removed the moment content arrives,
  so it cannot report its own completion. Bind `[attr.aria-busy]="loading()"` on the region that
  swaps skeleton for content; without it a screen reader may announce the region mid-update.
- **Pick the `tedi-alert` `role` by when the alert appears, not by how it looks.** The default
  `alert` is for urgent messages that appear later (an error, something that needs action). Use
  `status` for non-urgent messages that appear later (saved, info). Use `none` for an alert that is
  already on the page when it loads: some screen readers (JAWS, and NVDA in some browsers) read a
  `role="alert"` present at load immediately.
- **Icon-only controls need an accessible name**, and don't signal state by colour alone. Sorting,
  pagination, expansion and reordering controls all need labels; those come from
  `TediTranslationService`, so check the translation keys rather than hardcoding Estonian.

### Table specifics

- **Cell templates receive the TanStack `CellContext`.** A `TemplateRef` cell (commonly
  `let-ctx`) exposes live row state: `ctx.row.getIsSelected()`, `ctx.row.getIsExpanded()`,
  `ctx.row.original`. Use that rather than tracking row state in parallel.
- **`groupRowSpan(rows, keyFn)` needs the currently-rendered rows.** Pass
  `table.getRowModel().rows` so spans are computed after filtering and sorting. Prefer the column's
  `groupBy` where it fits.
- **Set `meta.label` on a column whose header is blank or not plain text** (an actions column, say).
  It names the header for screen readers. Without it a blank header has no name, and the sort,
  filter and column-reorder labels and announcements fall back to the column id, a developer string
  such as `"actions"` (or to `""` when the header is an empty string).
- **Set `meta: { rowHeader: true }` on the column that identifies a row** (a name, say). Its cells
  render as `<th scope="row">`, so screen readers announce that value as row context. Give row
  action buttons the same context, e.g. `Muuda<span class="sr-only"> {{ row.name }}</span>`.
- **`tedi-tabs` `overflowMode`** decides what happens when tabs don't fit: `"dropdown"` (default)
  collapses the overflow into a More menu, `"scroll"` gives horizontal scrolling with fade
  indicators.
