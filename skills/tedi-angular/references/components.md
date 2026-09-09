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

This is the highest-value trap in the Angular library and it has no React equivalent. **24 selectors
are declared in both entry points, under identical class names**, including `tedi-card`,
`tedi-modal`, `tedi-accordion`, `tedi-tabs`, `tedi-dropdown`, `tedi-form-field`, `tedi-pagination`,
`tedi-search`, `tedi-tag`, and the checkbox/radio group family.

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
- **`tedi-attachment` has no built-in action buttons.** Project neutral `tedi-button`s inside a single
  `<tedi-attachment-actions>` and wire `(click)` and `disabled` yourself.

### Choosing the right component

- **`tedi-date-field`, not `tedi-date-picker`.** DatePicker is deprecated; DateField wraps a typed
  input with a popover or modal calendar and supports `single`, `multiple` and `range`.
- **`tedi-time-field`, not `tedi-time-picker`.** TimePicker is the bare picker surface behind
  TimeField. On its own, with no value, the `scroll` wheel parks on `12:00` as display only, and
  nothing is selected until the user picks.
- **`tedi-table`, not `tedi-table-styles`.** The Community `tedi-table-styles` only paints a
  hand-rolled `<table>`; the TEDI-Ready `tedi-table` brings TanStack sorting, filtering and
  pagination.
- **`tedi-form-field` is only needed for a label, feedback text, or a `characterLimit` counter.**
  Controls paint their own field surface, so wrapping is otherwise redundant. `tedi-search` renders
  its own and must **not** be wrapped.

### Responsive behaviour that isn't an input

- **Accordion icon-cards restack, not resize.** Below `md` (768px), items with `showIconCard` put the
  icon-card *above* the header instead of in a left column; both won't fit on a phone without
  truncating one.
- **`tedi-header-bottom` is mobile-only.** It is hidden from `md` up, so don't put anything there
  that desktop users need.

### Accessibility that the types won't get right for you

- **Give each `tedi-search` on a page a distinct `ariaLabel`.** The host is a `role="search"`
  landmark whose name falls back to `ariaLabel`, then `label`, then `placeholder`, then the
  translated default. Two identically named landmarks of the same type fail axe's `landmark-unique`.
- **A suggestion panel needs `role="combobox"` on the input.** `aria-expanded` is not permitted on a
  plain textbox and fails `aria-allowed-attr`. Bind `aria-controls` conditionally
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
  projected control is a button and a widget role is the right answer.
- **A plain `list` item takes exactly one control.** The row is painted as a single target (hover
  background, pointer cursor) but only the projected control navigates, so the item stretches that
  control's click area over the whole row. A second control in the same item would sit under that
  overlay and become unclickable; split it into its own item instead.
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
- **`tedi-tabs` `overflowMode`** decides what happens when tabs don't fit: `"dropdown"` (default)
  collapses the overflow into a More menu, `"scroll"` gives horizontal scrolling with fade
  indicators.
