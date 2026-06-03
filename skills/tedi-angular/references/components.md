# Component Reference

Two component namespaces are available. **Always prefer TEDI-Ready** components — they are production-grade, follow stricter conventions, and are actively maintained. Use Community components only when no TEDI-Ready equivalent exists.

- `@tedi-design-system/angular/tedi` — TEDI-Ready (preferred)
- `@tedi-design-system/angular/community` — Community/extended

---

# TEDI-Ready Components

All components are standalone (`standalone: true`), use `ChangeDetectionStrategy.OnPush`, and `ViewEncapsulation.None`. Import from `@tedi-design-system/angular/tedi`.

## Base

### Icon
**Selector:** `tedi-icon`
**Inputs:**
- `name: string` — Material Icon name (required)
- `size: IconSize = 24` — 8, 12, 16, 18, 24, 36, 48, or "inherit"
- `color: IconColor = "primary"`
- `background: IconBackgroundColor` — circular background color
- `variant: IconVariant = "outlined"` — "filled" or "outlined"
- `type: IconType = "outlined"` — Material Symbols style
- `label: string` — accessible label

### Text
**Selector:** `[tedi-text]`
**Inputs:**
- `modifiers: TextModifiers[] | TextModifiers` — h1-h6, bold, italic, uppercase, etc.
- `color: TextColor = "primary"`
**Slots:** default

## Buttons

### Button
**Selector:** `[tedi-button]`
**Inputs:**
- `variant: ButtonVariant = "primary"`
- `size: ButtonSize = "default"` — "default" or "small"
**Slots:** default

```html
<button tedi-button variant="primary">Click me</button>
<button tedi-button variant="secondary" size="small">Small</button>
```

### ClosingButton
**Selector:** `button[tedi-closing-button]`
**Inputs:**
- `size: ClosingButtonSize = "default"`
- `iconSize: ClosingButtonIconSize = 24` — 18 or 24
- `ariaLabel: string`

### Collapse
**Selector:** `tedi-collapse`
**Inputs:**
- `openText: string` — text when collapsed
- `closeText: string` — text when expanded
- `defaultOpen: boolean = false`
- `hideCollapseText: boolean = false`
- `arrowType: ArrowType = "default"`
**Slots:** default

### CollapseButton
**Selector:** `button[tedi-collapse-button]` — apply to a native `<button>` (the button *is* the host; do not nest a button).

Headless chevron toggle extracted from `Collapse` for cases where you only need the toggle affordance (e.g. inside a table row, accordion, or custom disclosure). Emits `(openChange)` and renders a chevron that animates with `open`.

**Inputs:**
- `open: boolean = false` — current open state; pair with `(openChange)`
- `openText: string` — label when collapsed (falls back to translated `"open"`)
- `closeText: string` — label when expanded (falls back to translated `"close"`)
- `hideText: boolean = false` — icon-only mode; `ariaLabel` becomes the accessible name
- `arrowType: "default" | "secondary" = "default"` — `"secondary"` paints the bordered style (only effective in icon-only mode)
- `size: "default" | "small" = "default"`
- `inverted: boolean = false` — light text/icon for dark backgrounds (ignored when `arrowType="secondary"`)
- `ariaControls: string` — id of the disclosed region
- `ariaLabel: string` — required when `hideText` is true
- `id: string`
**Outputs:**
- `openChange: boolean`

```html
<button tedi-collapse-button [(open)]="expanded" ariaControls="panel-1"></button>
<button tedi-collapse-button [open]="expanded" [hideText]="true" arrowType="secondary"
  ariaLabel="Toggle row" (openChange)="expanded = $event"></button>
```

### InfoButton
**Selector:** `button[tedi-info-button]`
**Inputs:**
- `ariaLabel: string`

## Cards

### Accordion
**Selector:** `tedi-accordion`
**Inputs:**
- `allowMultiple: boolean = false`
**Slots:** default (AccordionItem children)

### AccordionItem
**Selector:** `tedi-accordion-item`
**Inputs:**
- `defaultExpanded: boolean = false` — initial expanded state
- `showIconCard: boolean = false` — enable the icon-card grid column
- `selected: boolean = false` — visual selected state
**Model:** `expanded: boolean`
**Slots:** `<tedi-accordion-item-header>`, `<tedi-accordion-item-content>`, `[tedi-accordion-icon-card]` (direct child of the item, occupies its own grid column)

### AccordionItemHeader
**Selector:** `tedi-accordion-item-header`
**Inputs:**
- `headerClickable: boolean = true` — when true, the whole header is the toggle button. Set to false when projecting interactive children (action buttons, checkboxes, links) so the header becomes a div with a separate small toggle button.
- `titleLayout: "hug" | "fill" = "hug"` — `fill` makes the title flex-grow, pushing trailing siblings to the right edge of the start group
- `openLabel: string = "open"` — label shown when collapsed (passed through `tediTranslate`)
- `closeLabel: string = "close"` — label shown when expanded (passed through `tediTranslate`)
- `showExpandLabel: boolean = true` — when false, the toggle is icon-only and uses `aria-label` for its accessible name
- `showDefaultExpandAction: boolean = true` — when false, no default toggle button is rendered (consumer provides their own via slots and calls `item.toggle()`)
- `expandActionPosition: "start" | "end" = "end"`
- `headerClass: string | null` — extra CSS class on the header element
**Slots:**
- `[tedi-accordion-title]` — the accordion title content (rendered in the title position)
- `[tedi-accordion-start-action]` — actions at the start of the header (e.g., before the title group)
- `[tedi-accordion-before-title]` — element rendered immediately before the title (e.g., a small icon)
- `[tedi-accordion-after-title]` — element rendered immediately after the title, inside the start group
- `[tedi-accordion-start-description]` — description below the title (triggers a column-flex layout for title + description)
- `[tedi-accordion-end-description]` — description rendered at the right side of the header
- `[tedi-accordion-end-action]` — actions at the end of the header (e.g., custom toggle button or status indicator)

### AccordionItemContent
**Selector:** `tedi-accordion-item-content`
**Inputs:**
- `contentClass: string | null` — extra CSS class on the content element
**Slots:** default (the collapsible content)

The content panel is automatically given `role="region"`, `aria-labelledby` pointing to the header, and `inert` + `aria-hidden` when collapsed.

```html
<tedi-accordion>
  <tedi-accordion-item>
    <tedi-accordion-item-header>
      <span tedi-accordion-title>Section 1</span>
    </tedi-accordion-item-header>
    <tedi-accordion-item-content>Content 1</tedi-accordion-item-content>
  </tedi-accordion-item>
  <tedi-accordion-item>
    <tedi-accordion-item-header>
      <span tedi-accordion-title>Section 2</span>
      <tedi-status-badge tedi-accordion-end-description color="success" text="Approved" />
    </tedi-accordion-item-header>
    <tedi-accordion-item-content>Content 2</tedi-accordion-item-content>
  </tedi-accordion-item>
</tedi-accordion>
```

For non-clickable headers with custom actions (the toggle stays visible at the start, the action button sits at the end):

```html
<tedi-accordion-item [selected]="isSelected">
  <tedi-accordion-item-header [headerClickable]="false" expandActionPosition="start">
    <span tedi-accordion-title>Title</span>
    <button tedi-button tedi-accordion-end-action (click)="$event.stopPropagation(); toggleSelected()">
      Select
    </button>
  </tedi-accordion-item-header>
  <tedi-accordion-item-content>Body</tedi-accordion-item-content>
</tedi-accordion-item>
```

## Content

### Carousel
**Selector:** `tedi-carousel`

Composed of sub-components:

```html
<tedi-carousel>
  <tedi-carousel-header>Title</tedi-carousel-header>
  <tedi-carousel-content [slidesPerView]="{xs: 1, md: 3}" [gap]="{xs: 16}">
    <div *tediCarouselSlide>Slide 1</div>
    <div *tediCarouselSlide>Slide 2</div>
  </tedi-carousel-content>
  <tedi-carousel-footer>
    <tedi-carousel-indicators />
    <tedi-carousel-navigation />
  </tedi-carousel-footer>
</tedi-carousel>
```

### CarouselContent
**Selector:** `tedi-carousel-content`
**Inputs:**
- `slidesPerView: BreakpointInput<number> = {xs: 1}`
- `gap: BreakpointInput<number> = {xs: 16}`
- `fade: boolean = false`
- `transitionMs: number = 400`

### CarouselIndicators
**Selector:** `tedi-carousel-indicators`
**Inputs:**
- `withArrows: boolean = false`
- `variant: CarouselIndicatorsVariant = "dots"` — "dots" or "numbers"

### List
**Selector:** `ul[tedi-list]` or `ol[tedi-list]`
**Inputs:**
- `styled: boolean = true`
- `color: BulletColor = "brand"`
**Slots:** default

```html
<ul tedi-list>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

### TextGroup
**Selector:** `tedi-text-group`
**Inputs:**
- `type: TextGroupType = "horizontal"` — "vertical" or "horizontal"
- `labelWidth: string` — e.g., "200px", "30%"
- Responsive: `xs, sm, md, lg, xl, xxl: TextGroupInputs`

```html
<tedi-text-group type="horizontal" labelWidth="200px">
  <tedi-text-group-label>Name</tedi-text-group-label>
  <tedi-text-group-value>John Doe</tedi-text-group-value>
</tedi-text-group>
```

### Table
**Selector:** `tedi-table` (generic `<TData>`)

Generic data table built on top of [`@tanstack/angular-table`](https://tanstack.com/table). Columns are configured via `TediColumnDef<TData>[]` objects (no `*tediCellDef` directives). Owns sorting, filtering, pagination, row selection, expansion, column visibility/order, and row/column drag-and-drop. State is uncontrolled by default; opt into controlled mode via `state` + `(stateChange)`, defaulted via `defaultState`, or persisted to storage via `persist`.

**Peer dependency:** add `@tanstack/angular-table` to your app (it is a runtime dependency of `@tedi-design-system/angular`).

**Inputs:**
- `data: TData[]` (required)
- `columns: TediColumnDef<TData>[]` (required)
- `id: string` — stable id used to prefix synthetic ids; auto-generated when omitted
- `size: "medium" | "small" = "medium"`
- `caption: TemplateRef | string` — caption above the table
- `striped: boolean = false`
- `verticalBorders: boolean = false`
- `borderless: boolean = false`
- `stickyFirstColumn: boolean = false`
- `stickyHeader: boolean = false`
- `fixedLayout: boolean = false` — `table-layout: fixed`; makes column `size`/`minSize`/`maxSize` authoritative (content wraps instead of stretching the column). Required for column width caps to hold.
- `maxHeight: number | string` — wraps the table in a scrollable container (pair with `stickyHeader`)
- `activeRowId: string` — highlights one row
- `rowHover: boolean` — force hover styling on/off (default tracks `interactive`)
- `interactive: boolean = false` — adds `role="button"`, hover/active styles, and keyboard activation to rows; subscribe to `(rowClick)`
- `enableRowSelection: boolean | ((row) => boolean)` — opt-in selection; auto-renders a selection column
- `selectionMode: "multiple" | "single" = "multiple"` — `multiple` shows checkboxes + select-all; `single` shows radios (no select-all)
- `renderSubComponent: TemplateRef<{ $implicit: Row<TData> }>` — expanded-row content template; auto-renders an expand column
- `getRowCanExpand: (row) => boolean` — gate which rows expand
- `expandTrigger: "button" | "row" = "button"` — `row` lets a click anywhere on the row toggle expansion. The chevron uses the bordered `secondary` style regardless; change it via `expandButtonVariant`.
- `expandButtonVariant: "default" | "secondary"` — override the expand toggle's arrow style. Defaults to the bordered `secondary` style; set `default` for the neutral (borderless) chevron. Only affects the icon-only button (i.e. when `expandButtonLabel` is unset).
- `expandButtonLabel: string | { open: string; close: string }` — render a visible label next to the chevron instead of an icon-only button. A single string is used for both states; the `{ open, close }` form sets distinct collapsed (`open`) / expanded (`close`) labels. When unset the button stays icon-only with the translated expand/collapse aria-label.
- `getSubRows: (row) => TData[] | undefined` — hierarchical / tree rows
- `enableColumnFilters: boolean = false` — force TanStack's filter machinery (auto-on when any column sets `filterable`)
- `pagination: boolean | TablePaginationOptions` — enables the bottom paginator and is the source of truth for `pageSize`/`pageSizeOptions`. Pass `true` for defaults (`pageSize: 10`, `pageSizeOptions: [10, 25, 50]`) or an options object to tune. `TablePaginationOptions` forwards the `tedi-pagination` visual inputs, including arrow config: `arrowVariant`, `showArrowLabels`, `previousIcon`, `nextIcon` (plus `boundaryCount`, `siblingCount`, `labels`, `background`, `dividerPosition`, the `hide*` toggles, `disableArrowsAtBoundary`, `showModalTitle`).
- `paginationTop: boolean | TablePaginationOptions` — opt-in top paginator; shares page / page-size state with bottom but has independent visual config (its own arrow + `hide*` settings). Requires `pagination` to be truthy.
- `manualPagination: boolean = false` — server-side pagination; supply `pageCount` or `rowCount`
- `manualSorting: boolean = false`
- `manualFiltering: boolean = false`
- `pageCount: number` — total pages in manual mode
- `rowCount: number` — total rows in manual mode
- `state: Partial<TableState>` — controlled state
- `defaultState: Partial<TableState>` — initial uncontrolled state
- `persist: TablePersistOptions` — `{ key, storage?, include? }` to persist state to `localStorage` (defaults persist user-preference slices: `columnVisibility`, `columnOrder`, `rowOrder`, `columnSizing`)
- `placeholder: TemplateRef | string` — empty-state content (defaults to translated `table.no-data`)
- `placeholderRole: "alert" | "status"`
- `draggableRows: boolean = false` — reorder rows via CDK drag-drop; emits `(rowDrop)` with indices normalised to the source `data` array
- `draggableColumns: boolean = false` — reorder columns via header drag; updates internal `columnOrder` state

**Outputs:**
- `stateChange: TableState`
- `rowClick: Row<TData>` — only fires when `interactive` is true
- `rowDrop: CdkDragDrop<TData[]>` — `previousIndex`/`currentIndex` are source-array positions; pass through `moveItemInArray(data, prev, curr)` and rebind `[data]`

**Column definition (`TediColumnDef<TData>`):** extends TanStack's `ColumnDef` with Angular-specific fields:
- `sortable: boolean` — opt the column into the built-in sort affordance (string `header` only). Pair with `sortingFn` to override the comparator. For custom UIs, pass a `TemplateRef` for `header` and call `column.toggleSorting()` yourself.
- `filterable: boolean | { clearOnClose?: boolean }` — opt into the built-in filter popover (icon `filter_alt`). Requires `filterTemplate`.
- `filterTemplate: TemplateRef<TediTableFilterContext>` — UI rendered inside the filter popover. The context exposes `value`, `setValue`, `apply()`, `clear()`, and `column`. Apply/Clear footer buttons are wired automatically.
- `rowSpan: number | ((info: CellContext) => number)` — body-level row spanning. Return `>1` to emit `rowspan="N"`; return `0` to skip the `<td>`.
- `size` / `minSize` / `maxSize` (TanStack) — rendered as `width` / `min-width` / `max-width` (px) on the column's cells, applied only when set. **Authoritative only under `[fixedLayout]="true"`** — with the default auto layout they're hints and content can stretch the column past them. Under fixed layout, leave **at least one column unsized** so it absorbs the leftover space; if every column is sized, `table-layout: fixed` scales them all up to fill the table's width.
- `meta: TableColumnMeta` — `{ label?, align?, vAlign? }` for accessible label + cell alignment.

**Per-column sorting (`sortingFn`)** — inherited from TanStack `ColumnDef`:
- Built-ins: `'alphanumeric'`, `'alphanumericCaseSensitive'`, `'text'`, `'textCaseSensitive'`, `'datetime'`, `'basic'`, `'auto'` (default).
- Custom: `(rowA, rowB, columnId) => number`. Use `row.getValue(columnId)` to read cell values.

**Cell rendering:** `cell` accepts a string property key, a `(info) => value` accessor, a `TemplateRef`, or a `ComponentType` — all rendered via TanStack's `FlexRenderDirective`.

**Reacting to row state in cell templates:** a `TemplateRef` cell receives the TanStack `CellContext` (commonly aliased `let-ctx`), so `ctx.row` exposes the row's live state — `ctx.row.getIsSelected()`, `ctx.row.getIsExpanded()`, `ctx.row.original`, `ctx.row.id` — and the cell re-renders when that state changes. Use it to restyle cell content per row, e.g. border a status badge while its row is selected (compare against `activeRowId` for interactive/clickable rows):

```html
<ng-template #statusCell let-ctx>
  <tedi-status-badge
    [color]="statusColor[ctx.row.original.status]"
    [text]="ctx.row.original.status"
    [variant]="ctx.row.getIsSelected() ? 'filled-bordered' : 'filled'"
  />
</ng-template>
```

**Helpers:** `groupRowSpan(rows, keyFn)` — produces a `rowSpan` callback that auto-collapses consecutive equal keys. Pass the *currently-rendered* row set (`table.getRowModel().rows`) so spans operate on post-filter/sort rows.

```typescript
import {
  TediTableComponent,
  type TediColumnDef,
  groupRowSpan,
} from '@tedi-design-system/angular/tedi';

interface Person { id: string; name: string; role: string; salary: number; }

columns: TediColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name', sortable: true },
  { accessorKey: 'role', header: 'Role', meta: { align: 'left' } },
  {
    accessorKey: 'salary',
    header: 'Salary',
    meta: { align: 'right' },
    cell: ({ getValue }) => `${getValue<number>()} €`,
  },
];
```

```html
<tedi-table
  [data]="people()"
  [columns]="columns"
  [pagination]="{ pageSize: 25, pageSizeOptions: [10, 25, 50] }"
  [enableRowSelection]="true"
  [interactive]="true"
  (rowClick)="open($event.original)"
>
  <tedi-table-toolbar>
    <tedi-table-columns-menu />
  </tedi-table-toolbar>
</tedi-table>
```

Server-side pagination + persisted view preferences:

```html
<tedi-table
  [data]="rows()"
  [columns]="columns"
  [manualPagination]="true"
  [manualSorting]="true"
  [pageCount]="pageCount()"
  [pagination]="true"
  [state]="{ pagination: page(), sorting: sorting() }"
  (stateChange)="onStateChange($event)"
  [persist]="{ key: 'tedi.tables.invoices' }"
/>
```

Expandable rows + custom filter template:

```html
<ng-template #expanded let-row>
  <tedi-text-group type="horizontal" labelWidth="160px">
    <tedi-text-group-label>Email</tedi-text-group-label>
    <tedi-text-group-value>{{ row.original.email }}</tedi-text-group-value>
  </tedi-text-group>
</ng-template>

<ng-template #roleFilter let-ctx>
  <tedi-form-field>
    <input tedi-text-field [ngModel]="ctx.value ?? ''"
      (ngModelChange)="ctx.setValue($event)" (keydown.enter)="ctx.apply()" />
  </tedi-form-field>
</ng-template>

<tedi-table
  [data]="rows()"
  [columns]="columns"
  [renderSubComponent]="expanded"
  expandTrigger="row"
/>
```

### TableToolbar
**Selector:** `tedi-table-toolbar`

Layout wrapper that sits above a `<tedi-table>` for filter chips, search inputs, and action buttons. No inputs — pure CSS container.

```html
<tedi-table-toolbar>
  <input tedi-text-field placeholder="Search" [(value)]="query" />
  <tedi-filter text="Status" [options]="statusOptions" [(value)]="status" />
  <tedi-table-columns-menu />
</tedi-table-toolbar>
<tedi-table [data]="rows()" [columns]="columns" />
```

### TableColumnsMenu
**Selector:** `tedi-table-columns-menu`

Dropdown that lets the user toggle column visibility for the nearest ancestor `<tedi-table>` (uses `TEDI_TABLE_CONTEXT`). Must render as a descendant of `<tedi-table>` — picks up the table via DI.

**Inputs:**
- `triggerLabel: string` — overrides the translated `table.columns` label

### TableHeaderButton
**Selector:** `button[tedi-table-header-button]`

Icon button used inside custom column header templates (e.g., combined sort + filter triggers). Picks up the column's selected/active state visually.

**Inputs:**
- `icon: string` (required) — Material Symbols icon name
- `filled: boolean = false` — render the icon's filled variant
- `selected: boolean = false` — brand-coloured active state
- `disabled: boolean = false`
- `iconSize: IconSize = 18`
- `ariaLabel: string` — required for icon-only usage

```html
<ng-template #header let-ctx>
  <button tedi-table-header-button icon="filter_alt"
    [selected]="ctx.column.getIsFiltered()" ariaLabel="Filter">
  </button>
</ng-template>
```

## Filter

### Filter
**Selector:** `tedi-filter`
**Model:** `selected: boolean`, `value: string | string[]`
**Inputs:**
- `text: string = ""` — filter label text
- `variant: FilterVariant = "primary"` — "primary" or "secondary"
- `size: FilterSize = "default"` — "default" or "large"
- `allowMultiple: boolean = false` — multi-select mode; `value` is treated as `string[]` when true
- `options: FilterOption[] = []` — dropdown options `{ label, value, disabled? }`
- `preserveLabel: boolean = false` — when true, single-select shows "Text: SelectedLabel" instead of replacing text
- `showSearch: boolean = false` — show the search field in the dropdown
- `searchClearable: boolean = true` — show clear (×) button in the search field (only when `showSearch` is true)
- `clearSearchOnSelect: boolean = false` — clear the search field after an option is selected or toggled
- `showSelectAll: boolean = false` — show "Select all" in multi-select
- `showClear: boolean = false` — show clear action in dropdown
- `selectAllLabel?: string` — override for "Select all" label (defaults to translated string)
- `clearLabel?: string` — override for "Clear selection" label (defaults to translated string)
- `appendTo: string = ""` — append dropdown to selector (e.g., "body")
- `disabled: boolean = false` — also set automatically by a disabled `FormControl` or a disabled parent `FilterGroup`
**Outputs:**
- `cleared: void` — emitted when clear button is clicked in custom content mode
**Slots:**
- `[tediFilterPrepend]` — content before the label (icon, status badge, indicator). Hidden when the filter is selected. In toggle mode (no dropdown), a check icon replaces it; in dropdown modes the prepend is simply removed. Use `color="inherit"` on `<tedi-icon>` to match the filter's text color.
- `[tediFilterContent]` — custom dropdown content (replaces options)

Implements `ControlValueAccessor`. Value type depends on mode: `boolean` (toggle), `string` (single-select), `string[]` (multi-select).

```html
<!-- Boolean toggle -->
<tedi-filter text="Active" variant="secondary" [formControl]="activeControl" />

<!-- Single-select dropdown -->
<tedi-filter text="Service" [options]="options" [(value)]="value" [showClear]="true" appendTo="body" />

<!-- Single-select with label preserved (shows "Service: Option A") -->
<tedi-filter text="Service" [options]="options" [(value)]="value" [preserveLabel]="true" appendTo="body" />

<!-- Multi-select dropdown -->
<tedi-filter text="Hospital" [allowMultiple]="true" [options]="options" [(value)]="values"
  [showSearch]="true" [showSelectAll]="true" [showClear]="true" appendTo="body" />

<!-- With prepend content -->
<tedi-filter text="Submitted" variant="secondary" size="large">
  <tedi-status-badge tediFilterPrepend text="5" color="brand" />
</tedi-filter>

<!-- Custom dropdown content -->
<tedi-filter [text]="selectedLabel" [selected]="!!selectedValue" [showClear]="true" (cleared)="clear()">
  <div tediFilterContent>
    <!-- custom content here -->
  </div>
</tedi-filter>

<!-- Disabled -->
<tedi-filter text="Service" [options]="options" [(value)]="value" [disabled]="true" />
```

### FilterGroup
**Selector:** `tedi-filter-group`
Wrapper that joins filters into a connected button group with collapsed borders and shared border-radius. Supports `allowMultiple` and a shared `formControl`/`disabled` state that propagates to children.

```html
<tedi-filter-group>
  <tedi-filter text="All" variant="secondary" [selected]="true" />
  <tedi-filter text="Active" variant="secondary" />
  <tedi-filter text="Closed" variant="secondary" />
</tedi-filter-group>

<!-- Radio-like single-select via shared FormControl -->
<tedi-filter-group label="Type" [formControl]="typeControl">
  <tedi-filter text="All" value="all" />
  <tedi-filter text="Active" value="active" />
  <tedi-filter text="Closed" value="done" />
</tedi-filter-group>

<!-- Multi-select via shared FormControl -->
<tedi-filter-group label="Tags" [allowMultiple]="true" [formControl]="tagsControl">
  <tedi-filter text="Urgent" value="urgent" />
  <tedi-filter text="Review" value="review" />
</tedi-filter-group>
```

## Form

### TextField
**Selector:** `input[tedi-text-field]`
**Model:** `value: string`
**Inputs:**
- `arrowsHidden: boolean = true`
**Outputs:**
- `clear: void`

```html
<input tedi-text-field [(value)]="name" />
<input tedi-text-field [formControl]="nameControl" />
```

### NumberField
**Selector:** `tedi-number-field`
**Model:** `value: number`
**Inputs:**
- `inputId: string` (required)
- `label: string`
- `min: number`, `max: number`, `step: number = 1`
- `size: NumberFieldSize = "default"`
- `suffix: string` — unit text
- `fullWidth: boolean = false`
- `disabled: boolean = false`
- `required: boolean = false`
- `invalid: boolean = false`

### Checkbox
**Selector:** `input[type=checkbox][tedi-checkbox]`
**Inputs:**
- `size: CheckboxSize = "default"` — "default" or "large"
- `invalid: boolean = false`
- `value: string` — identity within a `<tedi-checkbox-group>` (required when the group is form-bound)
- `disabled: boolean = false`

```html
<!-- Standalone checkbox -->
<input type="checkbox" tedi-checkbox [formControl]="agreeControl" />

<!-- Inside a form-bound group — [value] identifies the option -->
<tedi-checkbox-group [formControl]="tagsControl">
  <input type="checkbox" tedi-checkbox value="urgent" />
  <input type="checkbox" tedi-checkbox value="review" />
</tedi-checkbox-group>
```

### CheckboxGroup
**Selector:** `tedi-checkbox-group` | ControlValueAccessor
**Value type:** `string[]`
**Inputs:**
- `label: string` — visible label above the group
- `direction: CheckboxGroupDirection = "horizontal"` — "horizontal" or "vertical"
- `disabled: boolean = false` — propagates to all children
- `ariaLabel: string` — accessible name when no visible `label` is rendered
- `ariaLabelledby: string` — ID of an external element that labels the group
**Models:** `values: string[]`

Coordinates `checked` state across child `input[tedi-checkbox]` elements via their `[value]`. The group renders as a passive visual wrapper until a `FormControl` binds or `[(values)]` / `[values]` is bound with a non-empty array — at that point it applies `role="group"`, ARIA wiring, and takes over child `checked` state. For a null/empty initial value, use a `FormControl`:

```typescript
tagsControl = new FormControl<string[]>([]);
```

```html
<tedi-checkbox-group [formControl]="tagsControl" label="Tags">
  <input type="checkbox" tedi-checkbox value="urgent" />
  <input type="checkbox" tedi-checkbox value="review" />
  <input type="checkbox" tedi-checkbox value="draft" />
</tedi-checkbox-group>

<!-- Two-way binding with a preselected value -->
<tedi-checkbox-group [(values)]="selected" label="Tags">
  <input type="checkbox" tedi-checkbox value="a" />
  <input type="checkbox" tedi-checkbox value="b" />
</tedi-checkbox-group>
```

### Radio
**Selector:** `input[type=radio][tedi-radio]`
**Inputs:**
- `size: RadioSize = "default"` — "default" or "large"
- `invalid: boolean = false`
- `value: string` — identity within a `<tedi-radio-group>` (required when the group is form-bound)
- `disabled: boolean = false`

```html
<!-- Standalone radio (consumer-managed name) -->
<label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
  <input type="radio" tedi-radio name="group" value="a" />
  Option A
</label>

<!-- Inside a form-bound group -->
<tedi-radio-group [formControl]="statusControl">
  <input type="radio" tedi-radio value="all" />
  <input type="radio" tedi-radio value="active" />
</tedi-radio-group>
```

### RadioGroup
**Selector:** `tedi-radio-group` | ControlValueAccessor
**Value type:** `string | null`
**Inputs:**
- `label: string` — visible label above the group
- `direction: RadioGroupDirection = "horizontal"` — "horizontal" or "vertical"
- `name: string` — shared `name` attribute for child radios (auto-generated when omitted). Pass explicitly to avoid SSR hydration mismatches.
- `disabled: boolean = false` — propagates to all children
- `ariaLabel: string` — accessible name when no visible `label` is rendered
- `ariaLabelledby: string` — ID of an external element that labels the group
**Models:** `value: string | null`

Coordinates `checked` state across child `input[tedi-radio]` elements via their `[value]`. Passive visual wrapper until a `FormControl` binds or `[(value)]` / `[value]` is bound with a non-null value. For a null initial value, use a `FormControl`:

```typescript
statusControl = new FormControl<string | null>(null);
```

```html
<tedi-radio-group [formControl]="statusControl" label="Status">
  <input type="radio" tedi-radio value="all" />
  <input type="radio" tedi-radio value="active" />
  <input type="radio" tedi-radio value="done" />
</tedi-radio-group>

<!-- Two-way binding with a preselected value -->
<tedi-radio-group [(value)]="status" label="Status">
  <input type="radio" tedi-radio value="all" />
  <input type="radio" tedi-radio value="active" />
</tedi-radio-group>
```

### RadioCard
**Selector:** `label[tedi-radio-card]`
**Inputs:**
- `variant: RadioCardVariant = "primary"` — "primary" or "secondary"
- `grouped: boolean = false` — join cards in a button-group layout
- `showIndicator: boolean = true` — show/hide the radio indicator visually

```html
<!-- Separate cards (default) -->
<div style="display: flex; gap: 8px;">
  <label tedi-radio-card variant="primary">
    <input tedi-radio type="radio" name="cards" />
    Text
  </label>
</div>

<!-- Grouped cards inside a form-bound RadioGroup -->
<tedi-radio-group [formControl]="planControl">
  <label tedi-radio-card variant="primary" [grouped]="true">
    <input tedi-radio type="radio" value="basic" />
    Basic
  </label>
  <label tedi-radio-card variant="primary" [grouped]="true">
    <input tedi-radio type="radio" value="pro" />
    Pro
  </label>
</tedi-radio-group>
```

### Toggle
**Selector:** `tedi-toggle`
**Model:** `checked: boolean`
**Inputs:**
- `inputId: string` (required)
- `variant: ToggleVariant = "primary"` — "primary" or "colored"
- `type: ToggleType = "filled"` — "filled" or "outlined"
- `size: ToggleSize = "default"` — "default" or "large"
- `icon: boolean = false`
- `disabled: boolean = false`
- `required: boolean = false`

### DatePicker
**Selector:** `tedi-date-picker`
**Model:** `selected: Date | null`, `month: Date`
**Inputs:**
- `disabled: DatePickerMatcher | DatePickerMatcher[] | null` — function or array of functions `(date: Date) => boolean`
- `showNavigation: boolean = true` — show month/year navigation
- `monthMode: DatePickerSelectorMode = "dropdown"`
- `yearMode: DatePickerSelectorMode = "dropdown"`
- `startYear: number | null = null` — earliest selectable year
- `endYear: number | null = null` — latest selectable year
- `allowManualInput: boolean = true`
- `showWeekNumbers: boolean = false`
- `closeOnSelect: boolean = true`
- `inputState: "default" | "error" | "valid" = "default"`
- `inputSize: "default" | "small" = "default"`
- `inputDisabled: boolean = false`
- `inputId: string`, `inputPlaceholder: string`

```html
<tedi-date-picker [formControl]="dateControl" [showWeekNumbers]="true" />
```

### Select
**Selector:** `tedi-select`
**Inputs:**
- `inputId: string` (required) — unique ID for label association and accessibility
- `label: string` — label text above the select
- `required: boolean = false`
- `placeholder: string = ""`
- `state: InputState = "default"` — "default", "error", "valid"
- `size: SelectInputSize = "default"` — "default" or "small"
- `clearable: boolean = false` — show clear button
- `allowMultiple: boolean = false` — enable multiselect
- `showSelectAll: boolean = false` — show "Select All" in multiselect
- `selectableGroups: boolean = false` — make group headers selectable in multiselect
- `searchable: boolean = false` — enable search input
- `options: T[] = []` — array of options (objects or primitives)
- `bindLabel: string = "label"` — property name for display label
- `bindValue: string | undefined` — property name for value (whole object when undefined)
- `groupBy: string | ((item: T) => string)` — group options by property or function
- `isTagRemovable: boolean = false` — allow removing tags in multiselect
- `multiRow: boolean = false` — wrap tags to multiple rows
- `disabledKey: string = "disabled"` — property name for disabled state on option objects
- `noOptionsMessage: string` — custom text when no options match search
- `dropdownType: "menu" | "grid" = "menu"` — "grid" for swatch-type selects
- `dropdownWidthRef: ElementRef | null` — element to match dropdown width to
- `feedbackText: { text, type, position }` — feedback text config
- `maxDropdownHeight: number` — dropdown height in pixels
- `compareWith: (a, b) => boolean` — custom equality function

Implements `ControlValueAccessor`. Value type is `T` (single) or `T[]` (multiselect).

```html
<!-- Single select -->
<tedi-select
  inputId="city"
  label="City"
  [options]="cities"
  bindLabel="name"
  bindValue="id"
  [formControl]="cityControl"
/>

<!-- Multiselect with search -->
<tedi-select
  inputId="tags"
  label="Tags"
  [options]="tags"
  [allowMultiple]="true"
  [searchable]="true"
  [clearable]="true"
  [formControl]="tagsControl"
/>
```

**Custom option templates** via `tediSelectOption` and `tediSelectValue` directives:

```html
<tedi-select [options]="items" bindLabel="name" bindValue="id">
  <ng-template tediSelectOption let-item let-selected="selected">
    <tedi-dropdown-item-value type="checkbox" [selected]="selected">
      <tedi-dropdown-item-value-label>{{ item.name }}</tedi-dropdown-item-value-label>
      <tedi-dropdown-item-value-meta>{{ item.description }}</tedi-dropdown-item-value-meta>
    </tedi-dropdown-item-value>
  </ng-template>
</tedi-select>
```

### FormField
**Selector:** `tedi-form-field`
**Inputs:**
- `size: InputSize = "default"`
- `icon: string | FormFieldIcon`
- `clearable: boolean = false`
- `inputClass: string | null`

```html
<tedi-form-field [clearable]="true" icon="search">
  <tedi-label>Search</tedi-label>
  <input tedi-text-field [formControl]="searchControl" />
  <tedi-feedback-text type="hint" text="Type to search" />
</tedi-form-field>
```

### Label
**Selector:** `[tedi-label]`
**Inputs:**
- `size: LabelSize = "default"`
- `required: boolean = false`
- `color: LabelColor = "secondary"`

### FeedbackText
**Selector:** `tedi-feedback-text`
**Inputs:**
- `text: string` (required)
- `type: FeedbackTextType = "hint"` — "hint", "valid", "error"
- `position: FeedbackTextPosition = "left"`

## Helpers

### Row / Col (Grid)
**Selectors:** `tedi-row`, `tedi-col`

```html
<tedi-row [cols]="3" gap="md">
  <tedi-col [width]="2">Wide column</tedi-col>
  <tedi-col [width]="1">Narrow column</tedi-col>
</tedi-row>
```

**Row inputs:** `cols`, `minColWidth`, `justifyItems`, `alignItems`, `gap`, `gapX`, `gapY` + responsive breakpoints
**Col inputs:** `width` (1-12), `justifySelf`, `alignSelf` + responsive breakpoints

### Separator
**Selector:** `tedi-separator`
**Inputs:**
- `axis: "horizontal" | "vertical" = "horizontal"`
- `color: SeparatorColor = "primary"`
- `variant: SeparatorVariant`
- `thickness: number = 1`
- `spacing: SeparatorSpacingValue | SeparatorSpacing`
- `size: string = "100%"`

### EmptyState
**Selector:** `tedi-empty-state`
**Inputs:**
- `type: "separate" | "attached" | "inside" = "separate"` — container variant
- `size: "default" | "small" = "default"`
- `icon: string | null = "spa"` — Material icon name; pass `null` to hide
- `iconColor: IconColor = "brand"`, `iconSize: IconSize = 36`
- `heading: string` — optional `<h3>` rendered in brand color

Description is projected via `<ng-content>`. Actions slot is projected via `<ng-content select="[tedi-empty-state-actions]">`.

```html
<tedi-empty-state heading="Choose new time" icon="event_busy">
  You have no data to display
  <button tedi-button tedi-empty-state-actions type="button">Choose time</button>
</tedi-empty-state>
```

### ScrollFade
**Selector:** `tedi-scroll-fade`
**Inputs:**
- `fadeSize: ScrollFadeSize = 20` — gradient size in percent (0, 10, 20)
- `fadePosition: ScrollFadePosition = "both"` — `"top"`, `"bottom"`, or `"both"`
- `scrollBar: ScrollFadeScrollbar = "custom"` — `"default"` or `"custom"`
**Outputs:**
- `scrolledToTop: void`
- `scrolledToBottom: void`

```html
<tedi-scroll-fade fadePosition="both" [fadeSize]="10">
  <!-- Scrollable content -->
</tedi-scroll-fade>
```

### Timeline
**Selector:** `tedi-timeline`
**Inputs:**
- `activeIndex: number`

```html
<tedi-timeline [activeIndex]="1">
  <tedi-timeline-item [timings]="['10:00']">
    <tedi-timeline-title>Step 1</tedi-timeline-title>
    <tedi-timeline-description>Description</tedi-timeline-description>
  </tedi-timeline-item>
</tedi-timeline>
```

## Layout

### Header
**Selector:** `header[tedi-header]`

```html
<header tedi-header>
  <tedi-header-content>
    <img src="logo.svg" alt="Logo" />
  </tedi-header-content>
  <tedi-header-actions>
    <tedi-header-language [languages]="languages" (languageChange)="onLangChange($event)" />
    <tedi-header-profile [name]="userName">
      <tedi-header-role [role]="role" [representatives]="reps" [(currentRepresentative)]="currentRep" />
      <tedi-header-logout />
    </tedi-header-profile>
  </tedi-header-actions>
</header>
```

### SideNav
**Selector:** `nav[tedi-sidenav]`
**Inputs:**
- `dividers: boolean = true`
- `size: SideNavItemSize = "large"`
- `collapsible: boolean = false`
- `desktopBreakpoint: Breakpoint = "lg"`

```html
<nav tedi-sidenav [collapsible]="true">
  <tedi-sidenav-item icon="home" route="/home" [selected]="true">Home</tedi-sidenav-item>
  <tedi-sidenav-item icon="settings" route="/settings">Settings</tedi-sidenav-item>
  <tedi-sidenav-dropdown>
    <tedi-sidenav-item icon="folder">Documents</tedi-sidenav-item>
    <tedi-sidenav-dropdown-group>
      <tedi-sidenav-dropdown-item route="/docs/recent">Recent</tedi-sidenav-dropdown-item>
      <tedi-sidenav-dropdown-item route="/docs/shared">Shared</tedi-sidenav-dropdown-item>
    </tedi-sidenav-dropdown-group>
  </tedi-sidenav-dropdown>
</nav>
```

### Footer
**Selector:** `tedi-footer`

```html
<tedi-footer>
  <tedi-footer-body>
    <tedi-footer-section icon="phone" heading="Contact">
      <p>+372 123 4567</p>
    </tedi-footer-section>
  </tedi-footer-body>
  <tedi-footer-bottom>
    <tedi-footer-side position="center">© 2024</tedi-footer-side>
  </tedi-footer-bottom>
</tedi-footer>
```

## Loader

### Spinner
**Selector:** `tedi-spinner`
**Inputs:**
- `size: SpinnerSize = 16` — 10, 16, or 48
- `color: SpinnerColor = "primary"`
- `label: string` — screen reader label

## Navigation

### Link
**Selector:** `[tedi-link]`
**Inputs:**
- `variant: LinkVariant = "default"`
- `size: LinkSize = "default"`
- `underline: boolean = true`
- `target: string`
- Responsive: `xs, sm, md, lg, xl, xxl: LinkInputs`
**Slots:** default

```html
<a tedi-link href="/page" variant="default">Go to page</a>
```

### Pagination
**Selector:** `tedi-pagination`
**Inputs:**
- `pageCount: number` (required) — total number of pages
- `totalItems: number` — when set, renders the `"{count} results"` label
- `pageSizeOptions: number[] = []` — options for the page-size select; empty hides the select
- `boundaryCount: number = 1` — pages always shown at the start and end
- `siblingCount: number = 1` — pages shown on either side of the current page
- `labels: Partial<PaginationLabels>` — override any of the default text/aria labels
- `background: "white" | "transparent" = "white"` — `transparent` removes the surface fill + divider for use on non-white containers
- `dividerPosition: "top" | "bottom" | "none" = "top"` — where the divider line sits (or removed entirely)
- `disableArrowsAtBoundary: boolean = false` — keep the prev/next button **rendered** (as a disabled `tedi-button`) at the first/last page instead of removing it from the DOM. By default the boundary arrow is removed entirely so the pager looks balanced.
- `arrowVariant: ButtonVariant = "neutral"` — variant for the prev/next buttons; accepts any `tedi-button` variant (`primary`, `secondary`, `danger`, `success`, `neutral-inverted`, etc.). The arrows are rendered as actual `tedi-button`s under the hood, so all variant styling/states come for free.
- `showArrowLabels: boolean = false` — render the `previous` / `next` translated labels as visible button text next to the icon. When `false` (default) the buttons are icon-only and the labels are exposed only via `aria-label`. Use the `labels` input to override the wording (e.g. shorter `"Previous"` instead of `"Previous page"`).
- `previousIcon: string = "arrow_back"` — Material Symbols icon name for the previous-page arrow.
- `nextIcon: string = "arrow_forward"` — Material Symbols icon name for the next-page arrow. Pair with `previousIcon` to swap in chevrons (`chevron_left` / `chevron_right`) or any other arrow style.
- `showModalTitle: boolean = true` — show a heading inside the mobile picker modals; set `false` to hide
- `hideResults: PaginationVisibility = false` — `true`/`false` or a breakpoint name (`"sm"`–`"xxl"`) to hide below that breakpoint
- `hidePageSize: PaginationVisibility = false`
- `hidePager: PaginationVisibility = false`
- `hideArrows: PaginationVisibility = false` — hide just the prev/next arrows; pager itself stays

**Models:**
- `page: number = 1` — current page (1-based), two-way bindable with `[(page)]`
- `pageSize: number | undefined` — current page size, two-way bindable with `[(pageSize)]`

**Outputs:**
- `pageChange: number` — new 1-based page
- `pageSizeChange: number` — new page size

**Content projection:**
- `[tediPaginationResults]` — projected content fully replaces the default "X results" left block. Useful for approximations (`1000+ tulemust`) or richer DOM. Import the `TediPaginationResultsDirective`.

Below `md` the pager collapses to a `{current} / {total}` trigger and the page-size dropdown becomes a trigger button — both open a bottom-aligned modal picker that scrolls the active option into view on open. Status changes are announced via a polite `aria-live` region.

```html
<tedi-pagination
  [pageCount]="10"
  [(page)]="page"
  [totalItems]="97"
  [(pageSize)]="pageSize"
  [pageSizeOptions]="[10, 25, 50, 100]"
/>
```

Use the per-slot hide toggles to render different parts above and below a table:

```html
<tedi-pagination [pageCount]="pageCount" [(page)]="page" [totalItems]="total"
                 [(pageSize)]="pageSize" [pageSizeOptions]="[10, 25, 50]"
                 [hidePager]="true" dividerPosition="bottom" />
<!-- table content -->
<tedi-pagination [pageCount]="pageCount" [(page)]="page"
                 [hideResults]="true" [hidePageSize]="true" />
```

Custom results slot:

```html
<tedi-pagination [pageCount]="10" [(page)]="page" [totalItems]="1000">
  <span tediPaginationResults>1000+ tulemust</span>
</tedi-pagination>
```

Render the prev/next arrows as labelled primary buttons with custom icons:

```html
<tedi-pagination
  [pageCount]="10"
  [(page)]="page"
  arrowVariant="primary"
  [showArrowLabels]="true"
  previousIcon="chevron_left"
  nextIcon="chevron_right"
/>
```

### HorizontalStepper
**Selector:** `tedi-horizontal-stepper`
**Inputs:**
- `ariaLabel: string`
- `background: "default" | "transparent" = "default"`
- `compact: boolean | "sm" | "md" | "lg" | "xl" | "xxl" = "sm"` — collapse labels to show only indicators plus the selected step's label. `true` = always collapsed; a breakpoint = collapsed below that breakpoint.

**Sub-component:** `tedi-horizontal-stepper-item`
- `label: string` (required), `description: string`
- `completed`, `error`, `selected` (booleanAttribute inputs)
- `(stepSelect)` — emitted on click

```html
<tedi-horizontal-stepper ariaLabel="Form progress" compact="md">
  <tedi-horizontal-stepper-item label="Request" completed />
  <tedi-horizontal-stepper-item label="Application" selected />
  <tedi-horizontal-stepper-item label="Response" />
</tedi-horizontal-stepper>
```

## Notifications

### Alert
**Selector:** `tedi-alert`
**Model:** `open: boolean = true`
**Inputs:**
- `title: string`
- `type: AlertType = "info"`
- `icon: string = ""`
- `showClose: boolean = false`
- `role: AlertRole = "alert"`
- `variant: AlertVariant = "default"`
- `titleElement: AlertTitleType = "h2"` — HTML tag for the title
- `closeDelay: number = 0`
**Outputs:**
- `closeClick: void`
**Slots:** default

```html
<tedi-alert type="success" title="Saved!" [showClose]="true">
  Your changes have been saved.
</tedi-alert>
```

### Toast (via ToastService)

```typescript
import { ToastService } from '@tedi-design-system/angular/tedi';

export class MyComponent {
  private toastService = inject(ToastService);

  showToast() {
    this.toastService.open({
      title: 'Success',
      type: 'success',
      duration: 6000,
    });
  }
}
```

Add `<tedi-toast-container />` to your root template.

## Overlay

### Modal (via ModalService)

Open modals programmatically via `ModalService.open()`. Uses Angular CDK Dialog for overlay, backdrop, focus trapping, scroll blocking, and keyboard events.

```typescript
import { ModalService, ModalRef, MODAL_DATA } from '@tedi-design-system/angular/tedi';

// Opening a modal
private modalService = inject(ModalService);

openModal() {
  const ref = this.modalService.open<string>(MyModalContent, {
    data: { title: 'Hello' },
    width: 'md',                    // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | custom CSS value
    size: 'default',                // 'default' | 'small'
    position: 'center',             // 'center' | 'top' | 'bottom' | 'left' | 'right'
    closeOnBackdropClick: true,
    closeOnEscape: true,
    scrollBehavior: 'content',      // 'content' | 'page'
    fullscreen: false,              // true | 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | false
  });

  ref.closed.subscribe(result => console.log(result));
}
```

**ModalConfig inputs:**
- `data: unknown` — injected via `MODAL_DATA` token
- `width: ModalWidth = "sm"` — preset (`xs`-`xl`) or custom CSS value (`"80%"`, `"600px"`)
- `maxWidth: string` — max-width cap (e.g. `"75%"`, `"60vw"`). Overrides the default 95vw limit.
- `size: ModalSize = "default"` — `"default"` or `"small"`
- `position: ModalPosition = "center"` — `"center"`, `"top"`, `"bottom"`, `"left"`, `"right"`. `"bottom"` anchors the modal to the bottom edge with a fixed margin (useful for mobile bottom-sheet patterns).
- `closeOnBackdropClick: boolean = true`
- `closeOnEscape: boolean = true`
- `scrollBehavior: "content" | "page" = "content"`
- `fullscreen: boolean | "sm" | "md" | "lg" | "xl" | "xxl" = false` — `true` = always fullscreen; a breakpoint = fullscreen below that breakpoint.
- `ariaLabel: string` — ARIA label for the dialog.
- `ariaLabelledBy: string` — ID of the element that labels the dialog.

**ModalRef methods/properties:**
- `close(result?: R)` — close with optional result
- `closed: Observable<R | undefined>` — emits on close
- `backdropClick(): Observable<MouseEvent>`
- `keydownEvents(): Observable<KeyboardEvent>`
- `updateSize(width: string, height: string)`

**Content component pattern:**

```typescript
@Component({
  imports: [ModalComponent, ModalHeaderComponent, ModalContentComponent, ModalFooterComponent, ButtonComponent],
  template: `
    <tedi-modal>
      <tedi-modal-header [showClose]="true">
        <h1>{{ data.title }}</h1>
        <p tedi-modal-description>Optional description</p>
      </tedi-modal-header>
      <tedi-modal-content>
        <!-- Content here -->
      </tedi-modal-content>
      <tedi-modal-footer>
        <button tedi-button variant="secondary" (click)="ref.close('cancel')">Cancel</button>
        <button tedi-button (click)="ref.close('confirm')">Confirm</button>
      </tedi-modal-footer>
    </tedi-modal>
  `,
})
class MyModalContent {
  data = inject(MODAL_DATA);
  ref = inject(ModalRef);
}
```

**Sub-components:**
- `tedi-modal-header`
  - `showClose: boolean = true` — toggle the close button
  - `closeButtonSize: ClosingButtonSize` (optional) — overrides the close button size. When unset, the close button auto-tracks the modal `size` variant (default → standard, small → compact).
- `tedi-modal-content` — scrollable body
- `tedi-modal-footer` — action buttons

### Modal (template-based, deprecated)

The `[(open)]` binding approach is deprecated. Use `ModalService.open()` for new code.

```html
<tedi-modal [(open)]="isOpen" width="sm" position="center">
  <tedi-modal-header><h1>Title</h1></tedi-modal-header>
  <tedi-modal-content>Body</tedi-modal-content>
  <tedi-modal-footer>
    <button tedi-button (click)="isOpen = false">Close</button>
  </tedi-modal-footer>
</tedi-modal>
```

### Dropdown
**Selector:** `tedi-dropdown`
**Model:** `value: string`
**Inputs:**
- `position: DropdownPosition = "bottom-start"`
- `preventOverflow: boolean = true`
- `appendTo: string`

```html
<tedi-dropdown [(value)]="selected">
  <button tedi-button>Select option</button>
  <tedi-dropdown-content dropdownRole="listbox">
    <li tedi-dropdown-item value="a">Option A</li>
    <li tedi-dropdown-item value="b">Option B</li>
  </tedi-dropdown-content>
</tedi-dropdown>
```

### Popover
**Selector:** `tedi-popover`
**Inputs:**
- `position: PopoverPosition = "top"`
- `dismissible: boolean = true`
- `withArrow: boolean = true`
- `lockScroll: boolean = false`
- `appendTo: string = "body"`

### Tooltip
**Selector:** `tedi-tooltip`
**Inputs:**
- `position: TooltipPosition = "top"`
- `preventOverflow: boolean = true`
- `openWith: TooltipOpenWith = "both"` — hover, focus, or both
- `appendTo: string = "body"`

```html
<tedi-tooltip position="top">
  <tedi-tooltip-trigger>
    <button tedi-button>Hover me</button>
  </tedi-tooltip-trigger>
  <tedi-tooltip-content>Tooltip text</tedi-tooltip-content>
</tedi-tooltip>
```

## Tags

### Tag
**Selector:** `tedi-tag`
**Inputs:**
- `loading: boolean = false`
- `closable: boolean = false`
- `type: TagType = "primary"`
**Outputs:**
- `closed: Event`
**Slots:** default

```html
<tedi-tag type="primary" [closable]="true" (closed)="onRemove()">Label</tedi-tag>
```

### StatusBadge
**Selector:** `tedi-status-badge`
**Inputs:**
- `text: string = ""`
- `color: StatusBadgeColor = "neutral"`
- `variant: StatusBadgeVariant = "filled"`
- `size: StatusBadgeSize = "default"`
- `status: StatusBadgeStatus` — renders a `tedi-status-indicator` in top-right position
- `icon: string = ""`
- `class: string` — custom CSS class
- `title: string` — tooltip/abbreviation title
- `role: string` — ARIA role

```html
<tedi-status-badge text="Active" color="success" status="success" />
```

### StatusIndicator
**Selector:** `tedi-status-indicator`
**Inputs:**
- `type: StatusIndicatorType = "success"` — "success", "danger", "warning", "inactive"
- `size: StatusIndicatorSize = "sm"` — "sm" or "lg"
- `hasBorder: boolean = false` — white border ring
- `position: StatusIndicatorPosition = "default"` — "default" (inline) or "top-right" (absolute)

Standalone colored dot indicator. Used internally by `StatusBadge` and can be used standalone (e.g., as a prepend in filters).

```html
<tedi-status-indicator type="danger" />
<tedi-status-indicator type="success" size="lg" [hasBorder]="true" />

<!-- Absolute positioned on parent -->
<span style="position: relative">
  Lugemata teated
  <tedi-status-indicator type="danger" position="top-right" />
</span>
```

---

# Community Components

Import from `@tedi-design-system/angular/community`. These are community-contributed, have relaxed review standards, and are **not recommended** when a TEDI-Ready equivalent exists.

## Buttons

### FloatingButton
**Selector:** `[tedi-floating-button]`
- `variant: FloatingButtonVariant = "primary"`
- `size: FloatingButtonSize = "default"`
- `axis: FloatingButtonAxis = "horizontal"`

## Cards

### Accordion — **DEPRECATED** (use TEDI-Ready Accordion)
### Card
**Selector:** `tedi-card`
- `borderless: boolean`, `spacing: CardSpacing = "md"`, `accentBorder: CardAccentBorder`, `selected: boolean`
- Sub-components: `tedi-card-header`, `tedi-card-content`, `tedi-card-row`

## Form

### Checkbox
**Selector:** `tedi-checkbox` | ControlValueAccessor
- `inputId: string`, `value: string`, `size: CheckboxSize`, `hasError: boolean`
- Models: `checked: boolean | null`, `indeterminate: boolean`, `disabled: boolean`

### CheckboxCard
**Selector:** `label[tedi-checkbox-card]`
- `variant: CheckboxCardVariant = "primary"`, `showIndicator: boolean = true`

### CheckboxGroup / CheckboxCardGroup
**Selector:** `tedi-checkbox-group`, `tedi-checkbox-card-group`

### Input — **DEPRECATED** (use TEDI-Ready TextField)

### Radio / RadioGroup / RadioCardGroup
**Selector:** `tedi-radio`, `tedi-radio-group`, `tedi-radio-card-group`

### Select / Multiselect
**Selector:** `tedi-select`, `tedi-multiselect` | ControlValueAccessor
- `inputId: string`, `label: string`, `clearable: boolean = true`, `state: InputState`, `size: InputSize`

### Search
**Selector:** `tedi-search` | ControlValueAccessor
- `inputId: string`, `autocompleteOptions: AutocompleteOption[]`, `size: SearchSize`, `withButton: boolean`

### Textarea
**Selector:** `[tedi-textarea]` (extends Input)
- `resizeX: boolean = false`, `resizeY: boolean = true`

### FileDropzone
**Selector:** `tedi-file-dropzone` | ControlValueAccessor
- `accept: string`, `maxSize: number`, `multiple: boolean`, `mode: "append" | "replace"`

### FormField / InputGroup
**Selector:** `tedi-form-field`, `tedi-input-group`

## Helpers

### ProgressBar
**Selector:** `tedi-progress-bar`
- `value: number = 0`, `direction: "horizontal" | "vertical"`, `small: boolean`

## Navigation

### Breadcrumbs
**Selector:** `tedi-breadcrumbs`
- `crumbs: Breadcrumb[]`, `shortCrumbs: boolean` | Breakpoint support

### Pagination
**Selector:** `tedi-pagination`
- Models: `page: number = 1`, `pageSize: number | undefined`
- Required: `pageCount: number`
- `pageSizeOptions: number[]`, `totalItems: number`, `boundaryCount`, `siblingCount`
- Arrows: `arrowVariant: ButtonVariant`, `showArrowLabels: boolean`, `previousIcon`/`nextIcon: string`, `disableArrowsAtBoundary: boolean`

### Tabs
**Selector:** `tedi-tabs`
- Sub-components: `[tedi-tab]` (`tabId: string`), `tedi-tab-content` (`tabId: string`)

### TableOfContents
**Selector:** `tedi-table-of-contents`
- `heading: string`, `position: "default" | "fixed" | "sticky"`, `scrollAware: boolean`

### VerticalStepper
**Selector:** `tedi-vertical-stepper`
- `compact: boolean`, `enumerated: boolean`
- Sub-component: `tedi-vertical-stepper-item` (`title: string`, `completed`, `error`, `selected`, `disabled`)

## Overlay

### Dropdown
**Selector:** `tedi-dropdown`
- `dropdownId: string`, `dropdownRole: "menu" | "listbox"`
- Sub-component: `[tedi-dropdown-item]`

### Modal
**Selector:** `tedi-modal`
- Models: `maxWidth: ModalBreakpoint = "sm"`, `variant: "default" | "small"`
- Sub-components: `tedi-modal-header`, `tedi-modal-footer`

## Tags

### Tag — **DEPRECATED** (use TEDI-Ready Tag)
### StatusBadge — **DEPRECATED** (use TEDI-Ready StatusBadge)

## Table

### TableStyles
**Selector:** `tedi-table-styles`
- `size: "default" | "small"`, `verticalBorders: boolean`, `striped: boolean`, `clickable: boolean`

Visual-only wrapper that applies TEDI table styles to a hand-rolled `<table>`. Prefer the TEDI-Ready `<tedi-table>` (with TanStack-powered sorting / filtering / pagination) for new code; reach for `tedi-table-styles` only when you specifically need to drive the markup yourself.
