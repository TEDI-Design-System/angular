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
- `size: IconSize` — 8, 12, 16, 18, 22, 24, 36, 48, or "inherit". When unset, the icon inherits a contextual default from its host (`tedi-button`/`tedi-link` → 18, small `tedi-link` → 16), falling back to 24 standalone. An explicit value always overrides the context.
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
- `variant: ButtonVariant = "primary"` — primary | secondary | neutral | success | danger | danger-neutral | primary-inverted | secondary-inverted | neutral-inverted | primary-button-group | secondary-button-group
- `size: ButtonSize = "default"` — "default" or "small"
**Slots:** default

```html
<button tedi-button variant="primary">Click me</button>
<button tedi-button variant="secondary" size="small">Small</button>
```

### ButtonGroup
**Selector:** `tedi-button-group`
**Inputs:**
- `variant: ButtonVariant = "primary-button-group"` — applied to every item (overridable per item). Any `ButtonVariant` works; only the `*-button-group` variants get the connected/segmented strip geometry, other variants keep their own radius and show their active colors when selected.
- `size: "default" | "small" = "default"`
- `multiple: boolean = false` — allow several values; `value` becomes `string[]`
- `value: string | string[]` — selected value(s); two-way bindable `[(value)]`
- `stretch: boolean = false` — items share horizontal space equally
- `ariaLabel: string` — required when no visible heading labels the group
- `enableMobileDropdown: boolean = false` — collapse to a dropdown below `mobileBreakpoint`
- `mobileBreakpoint: Breakpoint = "md"`
- `dropdownLabel: string` — falls back to the `buttonGroup.menu` translation
- `dropdownLabelMode: "static" | "selected" = "static"`
**Outputs:** `selectionChange: string` (emits the value the user toggled)
**Slots:** `<button tedi-button-group-button>` children

### ButtonGroupButton
**Selector:** `button[tedi-button-group-button]`
Extends `tedi-button` (composes `BaseButtonDirective`); inherits `variant`/`size` from the group.
**Inputs:**
- `value: string` (required) — the item's identity; contributes to the group's selected value
- `label: string` (required) — text used in the mobile dropdown; also the `aria-label` when `icon` is set
- `disabled: boolean = false` — native `disabled` attribute
- `iconLeft: string` — icon name auto-rendered before the content (and in the dropdown item)
- `iconRight: string` — icon name auto-rendered after the content (and in the dropdown item)
- `icon: string` — icon-only mode; auto-rendered into the button and used as the dropdown icon
- `variant: ButtonVariant` — overrides the group's variant for this item
- `size: "default" | "small"` — overrides the group's size for this item
**Outputs:** `clicked: MouseEvent` (suppressed on disabled items)
**ARIA:** `aria-pressed="true|false"` per item (derived from the group value); `role="group"` on the group.

```html
<tedi-button-group ariaLabel="View" variant="primary-button-group" [(value)]="selected">
  <button tedi-button-group-button value="1" label="Details">Details</button>
  <button tedi-button-group-button value="2" label="Updates" iconLeft="refresh">Updates</button>
  <button tedi-button-group-button value="3" label="Settings" [disabled]="true">Settings</button>
</tedi-button-group>
```

### CardButton
**Selector:** `a[tedi-card-button]` or `button[tedi-card-button]`
**Slots:** `tedi-card` only (other content is not projected) — the card may use any of its blocks (content, rows, icon cells)

Interactive wrapper around a `tedi-card`: the host element provides semantics (anchor for href/routerLink navigation, button for actions and the disabled state) and applies hover/active/focus/disabled states to the card inside. On hover/active the whole card — content and icon cells alike — shares the same light hover/active background, and icons turn brand-colored. Do not place other interactive elements inside.

```html
<a tedi-card-button routerLink="/toetused">
  <tedi-card>
    <tedi-card-row>
      <tedi-card-icon><tedi-icon name="euro_symbol" /></tedi-card-icon>
      <tedi-card-content class="flex align-items-center justify-content-between gap-3">
        <div>
          <p tedi-text modifiers="bold">Isiku toetused</p>
          <p tedi-text modifiers="small" color="secondary">Toetused mis on isikule ette nähtud</p>
        </div>
        <tedi-icon name="arrow_right_alt" color="secondary" />
      </tedi-card-content>
    </tedi-card-row>
  </tedi-card>
</a>
```

### ClosingButton
**Selector:** `button[tedi-closing-button]`
**Inputs:**
- `size: ClosingButtonSize = "default"`
- `iconSize: ClosingButtonIconSize = 24` — 18 or 24
- `icon: string = "close"` — Material Symbols icon; override for other closing-like actions such as delete/remove (e.g. `delete`). Provide a matching `ariaLabel` when overriding.
- `ariaLabel: string`
- `showTitle: boolean = true` — set `false` to drop the native `title` attribute (e.g. when wrapped in a `tedi-tooltip`)

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
- `underline: boolean = true` — underline the visible text label (no effect in icon-only mode)
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
- `color: 'primary' | 'inverted' = 'primary'` — use `inverted` on dark or colored backgrounds

## Content

### Accordion
**Selector:** `tedi-accordion`
**Inputs:**
- `allowMultiple: boolean = false` — allow several items expanded simultaneously
- `defaultExpanded: boolean | undefined = undefined` — group-level default for items' initial expanded state. Per-item `defaultExpanded` (including an explicit `false`) takes precedence. Typically combined with `allowMultiple` to start with all items open.
- `itemGap: number | undefined = undefined` — vertical gap between sibling items, in **rem** (matches TEDI's layout-spacing convention; scales with user font-size). Any number is accepted. Forwarded as the `--tedi-accordion-item-gap` CSS variable — consumers needing an exact-pixel override can set that variable directly on a class. Falls back to the `:root` default (`var(--layout-grid-gutters-08)` = 0.5rem) when omitted.

**Breakpoint inputs:** `allowMultiple`, `defaultExpanded`, and `itemGap` can each be overridden per breakpoint via `xs` / `sm` / `md` / `lg` / `xl` / `xxl` inputs, which accept partial `AccordionInputs` objects. Example: `<tedi-accordion [allowMultiple]="false" [lg]="{ allowMultiple: true }">` — single-expand on phone, multi-expand from lg upward. Resolved via `BreakpointService.getBreakpointInputs`; cascades smallest → largest like Bootstrap's grid.

**Slots:** default (AccordionItem children)

### AccordionItem
**Selector:** `tedi-accordion-item`
**Inputs:**
- `defaultExpanded: boolean | undefined = undefined` — initial expanded state. Falls back to the parent Accordion's `defaultExpanded` when omitted; pass `false` explicitly to keep an item collapsed even when the group default is `true`.
- `showIconCard: boolean = false` — enable the icon-card grid column
- `selected: boolean = false` — visual selected state
- `disabled: boolean = false` — header trigger becomes non-interactive; current expanded state is preserved
- `itemId: string | undefined = undefined` — stable id used for hash-based deep-linking (separate from the auto-generated `headerId` / `contentId` for ARIA)
- `openOnHashMatch: boolean = false` — when `itemId` is set and `window.location.hash === '#<itemId>'`, auto-expands the item. Listens to `hashchange` so in-page navigation also opens the matching item. Requires `itemId`; no-op otherwise.
**Model:** `expanded: boolean`
**Slots:** `<tedi-accordion-item-header>`, `<tedi-accordion-item-content>`, `[tedi-accordion-icon-card]` (direct child of the item, occupies its own grid column)

### AccordionItemHeader
**Selector:** `tedi-accordion-item-header`
**Inputs:**
- `headerClickable: boolean = true` — when true, the whole header is the toggle button. Set to false when projecting interactive children (action buttons, checkboxes, links) so the header becomes a div with a separate small toggle button.
- `titleLayout: "hug" | "fill" = "hug"` — `fill` makes the title flex-grow, pushing trailing siblings to the right edge of the start group
- `openText: string | undefined` — text shown when collapsed, rendered literally. When omitted, falls back to the translated `"open"` label from `TediTranslationService`. Pipe through `tediTranslate` at the call site if you need a localised override.
- `closeText: string | undefined` — text shown when expanded, rendered literally. When omitted, falls back to the translated `"close"` label from `TediTranslationService`. Pipe through `tediTranslate` at the call site if you need a localised override.
- `showExpandLabel: boolean = true` — when false, the toggle is icon-only and uses `aria-label` for its accessible name
- `showDefaultExpandAction: boolean = true` — when false, no default toggle button is rendered (consumer provides their own via slots and calls `item.toggle()`)
- `expandActionPosition: "start" | "end" = "end"`
- `expandActionArrowType: "default" | "secondary" = "default"` — chevron style passthrough to the underlying `CollapseButton`. Only effective when `headerClickable` is `false` and `showExpandLabel` is `false` (icon-only mode).
- `expandActionSize: "default" | "small" | undefined` — size passthrough to the underlying `CollapseButton`. Only effective when `headerClickable` is `false`. When omitted, derived from `showExpandLabel` (true → `default`, false → `small`).
- `expandActionInverted: boolean = false` — inverted palette passthrough. Only effective when `headerClickable` is `false`.
- `expandActionUnderline: boolean = false` — underline the default expand action's text. Only effective when `headerClickable` is `false` and `showExpandLabel` is `true`.
- `headerClass: string | null` — extra CSS class on the header element
- `headingLevel: 1 | 2 | 3 | 4 | 5 | 6 | undefined = undefined` — wraps the trigger in a semantic `<h1>`–`<h6>` element per WAI-ARIA Accordion Pattern. Wrapper uses `display: contents` so it doesn't affect layout. Recommended for docs / FAQ pages where the accordion participates in the document outline.
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

**Mobile icon-card layout:** below the `md` breakpoint (`< 768px`), items with `showIconCard` stack the icon-card *above* the header instead of placing it in a left column — phone-sized viewports can't fit both side-by-side without truncating the icon-card text or the header content. Borders and corner radii are redistributed accordingly. No input needed; the rule is applied via `media-breakpoint-down(md)`.

**Print:** the accordion uses a `@media print` rule that forces every item to expand on paper so collapsed content isn't lost. No input needed.

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

Open every item by default — group-level `defaultExpanded` cascades to each child unless the child overrides:

```html
<tedi-accordion [allowMultiple]="true" [defaultExpanded]="true">
  <tedi-accordion-item>
    <tedi-accordion-item-header>
      <span tedi-accordion-title>Section 1</span>
    </tedi-accordion-item-header>
    <tedi-accordion-item-content>Body 1</tedi-accordion-item-content>
  </tedi-accordion-item>
  <!-- Per-item override: this one stays closed -->
  <tedi-accordion-item [defaultExpanded]="false">
    <tedi-accordion-item-header>
      <span tedi-accordion-title>Section 2</span>
    </tedi-accordion-item-header>
    <tedi-accordion-item-content>Body 2</tedi-accordion-item-content>
  </tedi-accordion-item>
</tedi-accordion>
```

### Calendar
**Selector:** `tedi-calendar` | ControlValueAccessor

The standalone date-selection surface used inside DateField, and embeddable directly. Supports `single`, `multiple` and `range` selection modes, three commit levels (`days`, `months`, `years`), available/unavailable day predicates, ISO week numbers, multi-month layouts, dropdown vs. grid month/year selection, custom locales, and a footer projection slot (`tediCalendarFooter`).

**Models (two-way):**
- `value: Date | Date[] | DateRange | null` — shape follows `mode` (`single` → `Date`, `multiple` → `Date[]`, `range` → `{ from, to }`)
- `currentMonth: Date` — the first (left-most) month shown
- `view: CalendarView = "days"` — active view: `"days"`, `"months"`, or `"years"`

**Outputs:**
- `select: { date: CalendarValue; day: Date }` — emitted on commit; `date` is the new full value, `day` is the clicked day/month/year

**Inputs:**
- `mode: DateFieldMode = "single"` — `"single"`, `"multiple"`, or `"range"`
- `selectionLevel: CalendarView = "days"` — lowest level the user can commit to: `"days"`, `"months"`, or `"years"`
- `monthYearSelectType: "dropdown" | "grid" | "static" = "dropdown"` — header month/year picker. `dropdown` (two dropdowns), `grid` (drill into month/year grid), `static` (label only — prev/next chevrons change the month)
- `localeCode: string = "et-EE"` — BCP-47 locale for weekday/month names and the first day of the week
- `showOutsideDays: boolean = true` — render trailing/leading days from adjacent months
- `showWeekNumbers: boolean = false` — render the ISO week-number column
- `showNavigation: boolean = true` — show the previous/next chevrons
- `bordered: boolean = true` — render the calendar's own border and rounded corners. Disable when embedding in a surface that already has a border
- `numberOfMonths: number = 1` — consecutive months rendered side by side (capped to what fits the viewport)
- `required: boolean = false` — in `mode='multiple'`, prevents clearing the last selected date
- `inputDisabled: boolean = false` — disables all interactions (combines with the reactive-forms disabled state)
- `disabledMatchers: Matcher[] = []` — disabled-date matchers (`Date`, `Date[]`, `{ before }`, `{ after }`, `{ before, after }`, `{ from, to? }`, `{ dayOfWeek: number[] }`, or `(date) => boolean`)
- `availableDays: Date[] | ((date: Date) => boolean) | undefined` — whitelist of selectable days; every other day is disabled
- `unavailableDays: Date[] | ((date: Date) => boolean) | undefined` — blacklist; takes precedence over `availableDays`
- `dayStatus: ((date: Date) => DayStatus | null | undefined) | undefined` — overlays a `tedi-status-indicator` dot on days; the returned `label` is surfaced on the day's `aria-label`
- `shouldDisableMonth: ((month: Date) => boolean) | undefined` — disable a whole month
- `shouldDisableYear: ((year: Date) => boolean) | undefined` — disable a whole year
- `minYear: number | null = null` — earliest year offered (defaults to 100 years before the current year)
- `maxYear: number | null = null` — latest year offered (defaults to 20 years after the current year)

```html
<!-- Embedded range picker, two months -->
<tedi-calendar mode="range" [formControl]="rangeControl" [numberOfMonths]="2" />

<!-- With a projected footer legend -->
<tedi-calendar [availableDays]="availableDays">
  <div tediCalendarFooter>Legend…</div>
</tedi-calendar>
```

### Card
**Selector:** `tedi-card`
**Inputs:**
- `background: CardBackground` — default background for child blocks ("primary", "secondary", "tertiary", "accent", "brand-primary"…"brand-quaternary", "danger/success/info/warning/neutral-primary/-secondary")
- `padding: CardPadding` — default padding for child blocks; rem number (0–3) or `{vertical, horizontal}` / `{top, right, bottom, left}` object
- `borderRadius: CardBorderRadius` — `false` removes all radius, or object per side/corner (`{top: false}`, `{topLeft: false}`…)
- `borderless: boolean = false`
- `border: CardBorderType` — background value colors the whole border; `top-`/`left-` prefix draws a 4px accent border on that side (e.g. `"left-danger-primary"`)
- Responsive: `xs, sm, md, lg, xl, xxl: CardInputs`

Composed of sub-components:

```html
<tedi-card border="left-info-primary" [padding]="1.5">
  <tedi-card-header background="brand-primary">Title</tedi-card-header>
  <tedi-alert variant="noSideBorders">Notification</tedi-alert>
  <tedi-card-content>First block</tedi-card-content>
  <tedi-separator />
  <tedi-card-content background="secondary">Second block</tedi-card-content>
</tedi-card>
```

All dividers are plain `tedi-separator` elements: horizontal between blocks/rows, vertical with `size="auto"` between cells inside a `tedi-card-row`. For an in-card notification place a `tedi-alert variant="noSideBorders"` directly inside the card.

The card itself is non-interactive. To make a whole card clickable, wrap it in **CardButton** (`a[tedi-card-button]` / `button[tedi-card-button]`, Buttons section), which adds hover/active/focus/disabled states.

### CardContent
**Selector:** `tedi-card-content`
**Inputs:**
- `background: CardBackground = "primary"` — inherits from card when unset
- `padding: CardPadding = 1` — inherits from card when unset
- `backgroundImage: string` — image url; with `backgroundPosition`, `backgroundSize`, `backgroundRepeat`
- `autoWidth: boolean = false` — takes only content width inside a row (icon/date cells)
- Responsive: `xs, sm, md, lg, xl, xxl: CardContentInputs`

### CardIcon
**Selector:** `tedi-card-icon`
**Inputs:**
- `type: CardIconType = "default"` — "default" (secondary background, secondary icon) or "brand" (brand-primary background, white icon)
- `size: CardIconSize = "default"` — "small" uses 0.75rem padding; pair with a 16px icon
- Plus all CardContent inputs (`background` override, `autoWidth`, …)

Top-aligned icon cell for a card row; the projected `tedi-icon` inherits the cell color:

```html
<tedi-card-row>
  <tedi-card-icon type="brand"><tedi-icon name="monitor_heart" /></tedi-card-icon>
  <tedi-card-content>…</tedi-card-content>
</tedi-card-row>
```

### CardRow
**Selector:** `tedi-card-row`

Lays out `tedi-card-content` / `tedi-card-icon` cells horizontally. No inputs — dividers are plain `tedi-separator` elements:

```html
<tedi-card>
  <tedi-card-row>
    <tedi-card-content [autoWidth]="true">08.12.2024</tedi-card-content>
    <tedi-separator axis="vertical" size="auto" />
    <tedi-card-content>COVID-19</tedi-card-content>
  </tedi-card-row>
  <tedi-separator />
  <tedi-card-row>
    <tedi-card-content>Left</tedi-card-content>
    <tedi-card-content background="secondary">Right</tedi-card-content>
  </tedi-card-row>
</tedi-card>
```

For a card-styled timeline use `tedi-timeline variant="card"` (Helpers section); for a decorative dotted line between cells place a vertical dotted `tedi-separator` between them.

### CardHeader
**Selector:** `tedi-card-header`

Same inputs as CardContent, but `background` defaults to `"brand-primary"` and is not inherited from the card.

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
- `ariaLabel: string` — accessible name for the carousel `region`; falls back to the `carousel` translation ("Karussell")

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
- `interactive: boolean = false` — adds `role="button"`, hover/active styles, and keyboard activation to rows; subscribe to `(rowClick)`. Clicks landing on interactive controls inside a cell (links, buttons, checkboxes, form fields) are ignored by row activation/expansion — no manual `stopPropagation` needed.
- `rowAriaLabel: (row: Row<TData>) => string` — explicit accessible name per interactive row (without it, a `role="button"` row's name is built from all its cell text). Only applied when `interactive` is true
- `enableRowSelection: boolean | ((row) => boolean)` — opt-in selection; auto-renders a selection column
- `selectionMode: "multiple" | "single" = "multiple"` — `multiple` shows checkboxes + select-all; `single` shows radios (no select-all)
- `selectedRowHighlight: boolean = true` — whether selected rows get a background highlight. Set `false` to keep selection state for logic without the visual highlight (e.g. when you render selection feedback yourself in a cell template)
- `renderSubComponent: TemplateRef<{ $implicit: Row<TData> }>` — expanded-row content template; auto-renders an expand column
- `getRowCanExpand: (row) => boolean` — gate which rows expand
- `expandTrigger: "button" | "row" = "button"` — `row` lets a click anywhere on the row toggle expansion. The chevron uses the bordered `secondary` style regardless; change it via `expandButtonVariant`.
- `expandButtonVariant: "default" | "secondary"` — override the expand toggle's arrow style. Defaults to the bordered `secondary` style; set `default` for the neutral (borderless) chevron. Only affects the icon-only button (i.e. when `expandButtonLabel` is unset).
- `expandButtonLabel: string | { open: string; close: string }` — render a visible label next to the chevron instead of an icon-only button. A single string is used for both states; the `{ open, close }` form sets distinct collapsed (`open`) / expanded (`close`) labels. When unset the button stays icon-only with the translated expand/collapse aria-label.
- `getSubRows: (row) => TData[] | undefined` — hierarchical / tree rows
- `groupRowsBy: (row: Row<TData>) => unknown` — table-level row grouping. Consecutive rendered rows with an equal key form a group; the control columns (select / expand / drag) span each group (one checkbox + one chevron per group), row selection works per group (the group's single checkbox toggles all its rows and goes indeterminate when partial), and group boundaries drive `rowGroupDividers`. Data columns opt into spanning the same groups with `groupBy: true`.
- `rowGroupDividers: "all" | "between" | "none" = "all"` — when grouped, controls row dividers: `"between"` draws them only at group boundaries (rows within a group read as one block); `"none"` removes them. No effect without `groupRowsBy`.
- `controlColumnOrder: ("drag" | "select" | "expand")[] = ["drag", "select", "expand"]` — order of the auto-injected control columns. Only enabled controls render; any enabled control omitted from the list is appended. Use it to place the selection checkbox before the expand chevron, etc.
- `enableColumnFilters: boolean = false` — force TanStack's filter machinery (auto-on when any column sets `filterable`)
- `pagination: boolean | TablePaginationOptions` — enables the bottom paginator and is the source of truth for `pageSize`/`pageSizeOptions`. Pass `true` for defaults (`pageSize: 10`, `pageSizeOptions: [10, 25, 50]`) or an options object to tune. `TablePaginationOptions` forwards the `tedi-pagination` visual inputs, including arrow config: `arrowVariant`, `showArrowLabels`, `previousIcon`, `nextIcon` (plus `boundaryCount`, `siblingCount`, `labels`, `background`, `dividerPosition`, the `hide*` toggles, `disableArrowsAtBoundary`, `showModalTitle`). `pageSizeOptions` accepts plain numbers or `{ value, label }` objects — use the object form for a **"Show all"** entry whose `value` is large enough to hold every row: pass the row total when you know it (`data.length`), or `Number.MAX_SAFE_INTEGER` when you don't. Filtering only shrinks the row count, so a large page size always collapses the result to a single page. (Don't use `-1` — TanStack clamps `setPageSize` to `≥ 1`.)
- `paginationTop: boolean | TablePaginationOptions` — opt-in top paginator; shares page / page-size state with bottom but has independent visual config (its own arrow + `hide*` settings). Requires `pagination` to be truthy.
- `manualPagination: boolean = false` — server-side pagination; supply `pageCount` or `rowCount`
- `manualSorting: boolean = false`
- `manualFiltering: boolean = false`
- `pageCount: number` — total pages in manual mode
- `rowCount: number` — total rows in manual mode
- `state: Partial<TableState>` — controlled state. Per-slice: only the slices you pass are controlled (the table renders them verbatim and never changes them itself); write changes back from `(stateChange)` or the UI appears frozen. Other slices stay internal.
- `defaultState: Partial<TableState>` — initial state for uncontrolled slices. Read once; the table owns the state afterwards (later changes to the input are ignored once the user interacts).
- `persist: TablePersistOptions` — `{ key, storage?, include? }` to persist state to `localStorage` (defaults persist user-preference slices: `columnVisibility`, `columnOrder`, `rowOrder`, `columnSizing`; add task-scoped slices like `sorting`/`columnFilters` via `include`)
- `placeholder: TemplateRef | string` — empty-state content (defaults to translated `table.no-data`)
- `placeholderRole: "alert" | "status"`
- `reorderableRows: boolean = false` — reorder rows by **mouse drag and keyboard** (one input). Mouse: drag a row by its handle. Keyboard: Tab to the handle, Space/Enter to pick up, ↑/↓ to move within the current page, Space/Enter to drop, Escape to cancel. Emits `(rowDrop)` with indices normalised to the source `data` array.
- `reorderableColumns: boolean = false` — reorder columns by **mouse drag and keyboard** (one input). Mouse: drag a header cell by its handle. Keyboard: Tab to a header, Space/Enter to pick up, ←/→ to move live, Space/Enter to drop, Escape to cancel. Updates internal `columnOrder` state.

**Outputs:**
- `stateChange: TableState` — emits the full merged `TableState` after every change, regardless of which slice changed
- `rowClick: Row<TData>` — only fires when `interactive` is true
- `rowDrop: CdkDragDrop<TData[]>` — `previousIndex`/`currentIndex` are source-array positions; pass through `moveItemInArray(data, prev, curr)` and rebind `[data]`

**State management (`TableState`):** one object holds every interactive slice — `columnVisibility`, `columnOrder`, `rowOrder`, `columnSizing`, `rowSelection`, `expanded`, `columnFilters`, `sorting`, `pagination` (slice types are TanStack's). Modes mix per slice: uncontrolled (default), seeded via `defaultState`, controlled via `state` + `(stateChange)`, persisted via `persist`. Precedence per slice: `state` (controlled) > persisted storage value > `defaultState` > built-in default. Row-keyed slices (`rowSelection`, `expanded`) use TanStack's default row IDs — the row index as a string, nested sub-rows as dotted paths (`"0.1"`) — so index-keyed state shifts if `data` order changes. `expanded` also accepts `true` for "all rows".

Render expandable rows open on first load (still user-collapsible):

```html
<tedi-table
  [data]="data"
  [columns]="columns"
  [getSubRows]="getSubRows"
  [defaultState]="{ expanded: true }"
/>
<!-- or only specific rows: [defaultState]="{ expanded: { '0': true, '2': true } }" -->
```

**Column definition (`TediColumnDef<TData>`):** extends TanStack's `ColumnDef` with Angular-specific fields:
- `sortable: boolean` — opt the column into the built-in sort affordance (string `header` only). Pair with `sortingFn` to override the comparator. For custom UIs, pass a `TemplateRef` for `header` and call `column.toggleSorting()` yourself.
- `filterable: boolean | { clearOnClose?: boolean }` — opt into the built-in filter popover (icon `filter_alt`). Requires `filterTemplate`.
- `filterTemplate: TemplateRef<TediTableFilterContext>` — UI rendered inside the filter popover. The context exposes `value`, `setValue`, `apply()`, `clear()`, and `column`. Apply/Clear footer buttons are wired automatically.
- `rowSpan: number | ((info: CellContext) => number)` — body-level row spanning. Return `>1` to emit `rowspan="N"`; return `0` to skip the `<td>`. Prefer `groupBy` for key-based grouping; reach for `rowSpan` only for fully custom span logic.
- `groupBy: boolean | ((row: Row<TData>) => unknown)` — merge consecutive rendered rows with an equal key into one spanning cell, computed internally against the live (post-filter/sort/paginate) row model — no manual `groupRowSpan` wiring. A function groups this column by its own key; `true` reuses the table-level `groupRowsBy`. Takes precedence over `rowSpan`.
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

**Helpers:** `groupRowSpan(rows, keyFn)` — produces a `rowSpan` callback that auto-collapses consecutive equal keys. Pass the *currently-rendered* row set (`table.getRowModel().rows`) so spans operate on post-filter/sort rows. **Prefer the column `groupBy` option**, which does this internally against the live row model; use this helper only for a standalone `rowSpan` callback.

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
<tedi-filter text="Service" [options]="options" [(value)]="value" [showClear]="true" />

<!-- Single-select with label preserved (shows "Service: Option A") -->
<tedi-filter text="Service" [options]="options" [(value)]="value" [preserveLabel]="true" />

<!-- Multi-select dropdown -->
<tedi-filter text="Hospital" [allowMultiple]="true" [options]="options" [(value)]="values"
  [showSearch]="true" [showSelectAll]="true" [showClear]="true" />

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

### Search
**Selector:** `tedi-search`
**Model:** `value: string`
**Inputs:**
- `inputId: string` (required)
- `label: string`
- `placeholder: string = ""`
- `size: SearchSize = "default"` — "small" | "default" | "large"
- `clearable: boolean = true`
- `searchIcon: string | FormFieldIcon = "search"` — ignored when `button` is set
- `button: SearchButton` — when set, renders a trailing search button (hides the inline icon). `{ text?, icon?, variant?, ariaLabel? }`; omit `text` for an icon-only button
- `feedbackText: ComponentInputs<FeedbackTextComponent>` — hint / validation message
- `disabled: boolean = false`
- `ariaLabel: string` — accessible name fallback when no visible `label`

**Outputs:**
- `searchEvent: string` — emitted on Enter or search-button click
- `clear: void` — emitted when the clear button is clicked

```html
<tedi-search inputId="q" label="Otsing" [(value)]="query" (searchEvent)="onSearch($event)" />
<tedi-search inputId="q" label="Otsing" [button]="{ text: 'Otsi' }" [formControl]="queryControl" />
```

### Textarea
**Selector:** `textarea[tedi-textarea]` | ControlValueAccessor
**Model:** `value: string`
**Inputs:**
- `resizable: boolean = true` — allow manual (vertical-only) resizing; `false` disables it
- `autoGrow: boolean = false` — grow to fit content via CSS `field-sizing` (disables manual resize)
- `minRows: number = 3`, `maxRows: number = 12` — bounds while `autoGrow` is on
- `height: string | number | undefined = "7.5rem"` — fixed height when `autoGrow` is off; set `undefined` to fall back to the native `rows` attribute
- `maxHeight: string | number | undefined` — cap the height before it scrolls

Compose inside a `tedi-form-field` (which owns `size`, `characterLimit`, `inputClass`, etc.).

```html
<tedi-form-field>
  <label tedi-label for="notes">Notes</label>
  <textarea tedi-textarea id="notes" [(value)]="notes"></textarea>
</tedi-form-field>
```

### Slider
**Selector:** `tedi-slider` | ControlValueAccessor
**Model:** `value: number`
**Inputs:**
- `inputId: string` (required) — id for the range input + label association
- `label: string`, `hideLabel: boolean | "keep-space" = false`
- `min: number = 0`, `max: number = 100`, `step: number = 1`
- `name: string`
- `minLabel: string`, `maxLabel: string` — text flanking the track
- `showCurrentValue: boolean = false` — render the current value on the right instead of `maxLabel`
- `valueFormatter: (value: number) => string` — formats the tooltip + current-value label
- `tooltip: boolean = true` — live-value tooltip above the thumb (while hovered/focused/dragged)
- `disabled: boolean = false`, `required: boolean = false`, `invalid: boolean = false`
- `feedbackText: ComponentInputs<FeedbackTextComponent>` — helper/error below
- `ariaLabel`, `ariaLabelledby`, `ariaValuetext: string`
**Content projection:** `[sliderAddon]` — a right-hand element, typically a `tedi-number-field` editing the same value.

```html
<tedi-slider inputId="volume" label="Volume" [formControl]="volume"
  minLabel="0%" maxLabel="100%" [max]="100" />

<!-- Paired with a number field editing the same value -->
<tedi-slider inputId="pct" label="Percent" [(value)]="pct" minLabel="0%" [showCurrentValue]="true"
  [valueFormatter]="formatPct">
  <tedi-number-field sliderAddon inputId="pct-field" [(value)]="pct" suffix="%" />
</tedi-slider>
```

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
- `disabledMatchers: DatePickerMatcher | DatePickerMatcher[] | null` — disabled dates that cannot be selected (`Date`, `Date[]`, `{ before }`, `{ after }`, `{ from, to? }`, or a `(date: Date) => boolean` predicate). Prefer this over `disabled`, whose name clashes with `FormControlDirective`'s boolean `disabled` when used with `[formControl]`
- `disabled: DatePickerMatcher | DatePickerMatcher[] | null` — **⚠️ DEPRECATED**, use `disabledMatchers` (same shape, merged with it). Binding `[disabled]` together with `[formControl]` raises a template type error (#494)
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

### DateField
**Selector:** `tedi-date-field` | ControlValueAccessor

Form-control wrapper around the Calendar. Exposes a typed text input paired with a popover (or modal) that renders the Calendar. On phones, single-mode fields default to the native OS date picker; an opt-in modal is also available. Supports `single`, `multiple` and `range` modes, custom formatting/parsing, and the same selection-level/header options as Calendar.

**Model:** `value: Date | Date[] | DateRange | null`
**Outputs:**
- `openChange: boolean` — emitted when the picker (popover/modal) open state changes

**Inputs:**
- `inputId: string` (required) — unique ID for label association
- `mode: DateFieldMode = "single"` — "single", "multiple" (tags), or "range" ({ from, to })
- `multiRow: boolean = true` — `multiple` mode tag layout. `true` wraps tags across rows; `false` keeps a single row with a "+N" counter
- `tagEllipsis: TagEllipsis = false` — which end `multiple`-mode tags truncate from when a label doesn't fit. `false`, `end`, or `start`
- `isTagRemovable: boolean = true` — whether `multiple`-mode tags show a remove button
- `placeholder: string = ""` — placeholder in the input when no value
- `disabledMatchers: Matcher | Matcher[]` — disables specific days/dates via matchers. Named `disabledMatchers` (not `disabled`) to avoid clashing with `FormControlDirective`'s boolean `disabled` when used with `[formControl]`. Accepts `{ dayOfWeek: number[] }`, single dates, ranges or predicates
- `inputDisabled: boolean = false` — disables the field entirely (input, icon button, and calendar)
- `readOnly: boolean = false` — blocks typing but leaves the calendar interactive
- `required: boolean = false` — marks input as required; in `multiple` mode prevents clearing the last date
- `size: DateFieldSize = "default"` — "default" or "small"; should match the surrounding `tedi-form-field` size
- `minDate: Date | undefined` — disables all dates before this date
- `maxDate: Date | undefined` — disables all dates after this date
- `disablePast: boolean = false` — disable all dates before today
- `disableFuture: boolean = false` — disable all dates after today
- `shouldDisableMonth: (month: Date) => boolean | undefined` — predicate returning true to disable a month; use `undefined` to leave it enabled
- `shouldDisableYear: (year: Date) => boolean | undefined` — predicate returning true to disable a year; use `undefined` to leave it enabled
- `availableDays: Date[] | ((d: Date) => boolean) | undefined` — days that ARE available (inverse of unavailableDays)
- `unavailableDays: Date[] | ((d: Date) => boolean) | undefined` — days that are NOT available
- `selectionLevel: CalendarView = "days"` — lowest level the user can commit to: "days", "months", or "years"
- `monthYearSelectType: "dropdown" | "grid" = "dropdown"` — how the header exposes month/year picking
- `minYear: number | null = null` — earliest year offered in the calendar's year grid/dropdown. `null` defaults to 100 years before the current year
- `maxYear: number | null = null` — latest year offered in the calendar's year grid/dropdown. `null` defaults to 20 years after the current year
- `initialMonth: Date | undefined` — the month to initially display in the calendar
- `localeCode: string = "et-EE"` — BCP-47 locale for weekday/month names, first day of week, default formatDate/parseDate
- `closeOnSelect: boolean | undefined = undefined` — whether to close picker after selection (defaults to `true` in single mode)
- `showOutsideDays: boolean = true` — render trailing/leading days from adjacent months
- `showWeekNumbers: boolean = false` — render an ISO week-number column on the left of the day grid
- `numberOfMonths: BreakpointInput<number> = { xs: 1 }` — number of months shown side by side. A plain number (e.g. `2`) applies at every breakpoint (phone and modal included); pass a per-breakpoint object (e.g. `{ xs: 1, lg: 2 }`) to narrow it on small screens. The visible count is capped to what fits the viewport
- `enableCalendar: BreakpointObject<boolean> = { xs: true }` — enables the calendar picker UI. `false` hides the icon button and popover/modal — typing only
- `calendarTrigger: BreakpointObject<"input" | "button"> = { xs: "button" }` — what opens the calendar: `"button"` (icon) or `"input"` (the whole input)
- `useNativePicker: boolean | "sm" | "md" | "lg" | "xl" = false` — uses the OS-native date picker instead of the custom popover (single mode only). `true` always, `false` never, a breakpoint name uses native below that breakpoint and the custom popover from it upward
- `hideOnScroll: boolean = false` — closes the calendar popover when the page (or a scrollable ancestor) scrolls. Scrolling inside the calendar or its nested year/month dropdown keeps it open. Only affects the popover, not the modal
- `modal: boolean | "sm" | "md" | "lg" | "xl" = false` — opens the calendar in a centered modal (with explicit Cancel/Confirm) instead of the popover. `true` always, `false` never, a breakpoint name means modal below that breakpoint
- `fullscreen: boolean | "sm" | "md" | "lg" | "xl" = false` — render the calendar modal fullscreen. `true` always, `false` never, a breakpoint name makes it fullscreen below that breakpoint. Only applies when the calendar opens as a modal (see `modal`)
- `formatDate: ((value: DateFieldValue) => string) | undefined` — custom formatter for displaying the date value; callback receives the value and returns a display string
- `parseDate: ((value: string) => DateFieldValue | undefined) | undefined` — custom parser for parsing typed input into a Date, Date array or DateRange; return `undefined` to reject the input

```html
<!-- Single mode -->
<tedi-form-field>
  <label tedi-label for="date">Date</label>
  <tedi-date-field inputId="date" [formControl]="dateControl" />
</tedi-form-field>

<!-- Multiple mode with tags -->
<tedi-form-field>
  <label tedi-label for="dates">Dates</label>
  <tedi-date-field
    inputId="dates"
    mode="multiple"
    [formControl]="datesControl"
    [multiRow]="false"
    tagEllipsis="start"
    [isTagRemovable]="true"
  />
</tedi-form-field>

<!-- Range mode with constraints -->
<tedi-form-field>
  <label tedi-label for="range">Date range</label>
  <tedi-date-field
    inputId="range"
    mode="range"
    [formControl]="rangeControl"
    [minDate]="minDate"
    [maxDate]="maxDate"
    [showWeekNumbers]="true"
  />
</tedi-form-field>

<!-- Custom format/parse (US style MM/dd/yyyy) -->
<tedi-date-field
  inputId="us-date"
  [formControl]="usControl"
  [formatDate]="formatUS"
  [parseDate]="parseUS"
  placeholder="mm/dd/yyyy"
/>

<!-- Typing only — no picker UI -->
<tedi-date-field inputId="typedate" [enableCalendar]="false" />

<!-- Modal picker below md, popover above -->
<tedi-date-field inputId="modal-date" [formControl]="control" modal="md" [useNativePicker]="false" />

<!-- Native picker on phones, custom from md upward -->
<tedi-date-field inputId="native-date" [formControl]="control" />

<!-- Year selection with grid header -->
<tedi-date-field
  inputId="year-date"
  selectionLevel="years"
  monthYearSelectType="grid"
  [formatDate]="(v) => v instanceof Date ? String(v.getFullYear()) : ''"
/>

<!-- Weekends unavailable (predicate) -->
<tedi-date-field inputId="unavail" [formControl]="control" [unavailableDays]="(d) => [0, 6].includes(d.getDay())" />

<!-- Disable past/future -->
<tedi-date-field inputId="future-only" [disablePast]="true" />
<tedi-date-field inputId="past-only" [disableFuture]="true" />

<!-- Multi-month side by side -->
<tedi-date-field inputId="multi-mo" [numberOfMonths]="2" />

<!-- Custom year range in the calendar's year dropdown/grid (default is 100 years back, 20 forward) -->
<tedi-date-field inputId="dob" [formControl]="control" [minYear]="1900" [maxYear]="2010" />
```

### TimeField
**Selector:** `tedi-time-field`
**Model:** `value: string | null` — `HH:mm`
**Inputs:**
- `inputId: string` (required) — unique ID for label association
- `placeholder: string`
- `disabled: boolean = false`
- `invalid: boolean = false` — manually mark the field invalid (combines with reactive-form validity)
- `clearable: boolean = true`
- `pickerVariant: TimeFieldPickerVariant = "scroll"` — `"scroll" | "slots" | "dropdown" | "none"`. `"none"` renders just the input — typed input is still normalized on blur (e.g. `9` → `09:00`, `930` → `09:30`)
- `useNativePicker: TimeFieldUseNativePicker = false` — `true` always uses the OS time picker (`<input type="time">`), `false` never, breakpoint name (`"sm" | "md" | "lg" | "xl"`) means native below that breakpoint. When resolved to `true`, overrides `pickerVariant` and `modal`
- `pickerTrigger: TimeFieldPickerTrigger = "button"` — `"button"` opens via the icon only (popover opens toward the icon/end); `"input"` also opens when the input is clicked (popover opens from the field start/left). The popover always matches the input width
- `closeOnSelect: boolean = false` — close the popover/modal as soon as a value is picked
- `timeSlots: string[] = []` — `HH:mm` strings for `"slots"` and `"dropdown"` variants
- `columns: number = 3` — grid columns for the `"slots"` variant
- `showSlotIndicator: boolean = false` — show the radio indicator dot on each card in the `"slots"` variant
- `minuteStep: number = 1` — minute increment for the `"scroll"` variant
- `modal: TimeFieldModal = "md"` — open the picker in a modal: `true` always, `false` never, breakpoint name (`"sm" | "md" | "lg" | "xl"`) means modal below that breakpoint
- `fullscreen: TimeFieldFullscreen = false` — make the modal fullscreen: `true` always, `false` never, breakpoint name means fullscreen below that breakpoint. Only applies when the picker opens as a modal

Sizing and validation styling come from the wrapping `tedi-form-field` — set them there, not on `tedi-time-field`. Free-typed values are normalized on blur (digits-only → `HH:mm`); invalid input reverts to the previous value.

```html
<tedi-form-field>
  <label tedi-label for="time">Time</label>
  <tedi-time-field inputId="time" [formControl]="timeControl" pickerTrigger="input" />
</tedi-form-field>

<!-- Custom scroll picker on desktop, OS picker below md -->
<tedi-time-field
  inputId="time"
  pickerVariant="scroll"
  useNativePicker="md"
/>

<!-- Modal below md, fullscreen below sm -->
<tedi-time-field inputId="time" modal="md" fullscreen="sm" />
```

### TimePicker
**Selector:** `tedi-time-picker`
**Model:** `value: string | null` — `HH:mm`
**Inputs:**
- `variant: TimePickerVariant = "scroll"` — `"scroll" | "slots" | "dropdown"`
- `timeSlots: string[] = []` — predefined `HH:mm` strings for `"slots"` and `"dropdown"`
- `columns: number = 3` — grid columns for the `"slots"` variant
- `showSlotIndicator: boolean = false` — show the radio indicator dot on each card in the `"slots"` variant
- `minuteStep: number = 1` — minute increment for the `"scroll"` variant
- `disabled: boolean = false`
- `border: boolean = false` — render with a surrounding border, useful when embedded inline (not in a popover/modal)
- `trapFocus: boolean = false` — trap Tab inside the picker (used when embedded in a popover/modal). `scroll` cycles between hour/minute columns; `slots`/`dropdown` emit `closeRequested`

**Outputs:**
- `closeRequested: void` — emitted when the picker requests to be closed (Tab while `trapFocus` is `true`)

**Keyboard:** `scroll` columns respond to `ArrowUp`/`ArrowDown`, `Home`/`End`, `PageUp`/`PageDown` (jump 5); `Enter`/`Space` on the hour column moves focus to minutes. `dropdown` items respond to `ArrowUp`/`ArrowDown`, `Home`/`End`, `Enter`/`Space`.

Standalone time picker. Most consumers should use `tedi-time-field` instead — it bundles the picker, an input, and the popover/modal trigger logic. With no value, the `scroll` wheel parks on `12:00` (display only — nothing is selected until the user picks).

```html
<tedi-time-picker [(value)]="time" variant="scroll" [minuteStep]="5" />

<!-- Inline picker rendered with a border -->
<tedi-time-picker [(value)]="time" variant="slots" [timeSlots]="['09:00','10:00','11:00']" [border]="true" />
```

### Select
**Selector:** `tedi-select`
**Inputs:**
- `inputId: string` (required) — unique ID for label association and accessibility
- `label: string` — label text above the select
- `tooltip: string` — renders an info button next to the label that reveals this text in a tooltip. For formatted content, project a `*tediSelectTooltip` template instead (takes precedence)
- `ariaLabelledby: string` — associate an external visible label by its element id. A native `<label for>` cannot target the combobox (it is a `<div>`), so use this when the label lives outside the component. Ignored when `label` is set
- `ariaLabel: string` — accessible name when there is no visible label to reference. Ignored when `label` or `ariaLabelledby` provides a name
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
- `dropdownAlign: "start" | "end" = "start"` — which trigger edge the dropdown anchors to; use `"end"` for right-aligned selects so the panel expands inward
- `feedbackText: { text, type, position }` — feedback text config
- `maxDropdownHeight: number` — dropdown height in pixels
- `virtualScroll: boolean = false` — render options with virtual scrolling so only visible rows are in the DOM; enable for very large lists. Applies only to `dropdownType="menu"` without `groupBy`
- `virtualItemSize: number` — row height in pixels for the virtual scroll viewport; measured from the first option when unset
- `hideOnScroll: boolean = false` — close the dropdown when the page scrolls
- `compareWith: (a, b) => boolean` — custom equality function
- `tagEllipsis: TagEllipsis = false` — which end a selected tag's label truncates from when it doesn't fit. Only used in multiselect mode with `multiRow="false"`. `false` never truncates; `end` → `label…`; `start` → `…label`
- `ellipsis: "start" | "end" | false = false` — single-select mode: which end the selected value truncates from when it doesn't fit, revealing the full value in a hover/focus tooltip. `false` (default) never truncates
- `searchFn: (term: string, item: T) => boolean` — custom search function for filtering options. Overrides the default label-based search when provided

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

**Formatted label tooltip** via `tediSelectTooltip` directive (overrides the `tooltip` string input):

```html
<tedi-select [options]="items" label="City">
  <ng-template tediSelectTooltip>
    Pick the <b>city</b> where you <i>currently</i> reside.
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

### LabelRow
**Selector:** `tedi-label-row`
Pure inline-row layout for a form-control label plus trailing affixes (e.g. `tedi-info-tooltip`). Project your own `<label tedi-label>` and any affixes — all native label attributes (`for`, `id`, `aria-*`, handlers) keep working, and affixes sit as **siblings** of the `<label>`, never inside it, so they never leak into the control's accessible name. No inputs — composition only.
**Slots:** the real `<label tedi-label>` followed by trailing affixes.

```html
<tedi-label-row>
  <label tedi-label for="city" [required]="true">City</label>
  <tedi-info-tooltip>Enter the city where you currently reside.</tedi-info-tooltip>
</tedi-label-row>
```

### FeedbackText
**Selector:** `tedi-feedback-text`
**Inputs:**
- `text: string` (required)
- `type: FeedbackTextType = "hint"` — "hint", "valid", "error"
- `position: FeedbackTextPosition = "left"`

### InputGroup
**Selector:** `tedi-input-group`
Wraps a form control with leading/trailing addons. Project a `label[tedi-label]`, a control, optional addons via the `[tediInputGroupPrefix]` / `[tediInputGroupSuffix]` directives, and an optional `tedi-feedback-text`. The control slot accepts `tedi-form-field` (which itself wraps a text/date/time field) or `tedi-select` — any single-line bordered control. Addons merge their border with the control; put an interactive addon (e.g. a `tedi-dropdown`) directly in the prefix/suffix slot and its trigger button fills the whole addon.
**Inputs:**
- `addons: boolean = true` — merges addon and control borders into one visual unit; disable for detached addons (e.g. an action button)
- `disabled: boolean = false` — disables the group and propagates to the control
- `invalid: boolean = false` — marks the whole group invalid and propagates to the control; pair with an error `tedi-feedback-text`

```html
<tedi-input-group [invalid]="amountInvalid">
  <label tedi-label [for]="'amount'">Amount</label>
  <tedi-form-field>
    <input tedi-text-field id="amount" [formControl]="amountControl" />
  </tedi-form-field>
  <span tediInputGroupSuffix>EUR</span>
  <tedi-feedback-text type="error" text="This field is required" />
</tedi-input-group>
```

## Helpers

### Attachment
**Selector:** `tedi-attachment`
**Inputs:**
- `name: string` (required) — file name displayed in the card
- `fileSize: string` — pre-formatted file size (e.g. `"0.9 MB"`)
- `icon: string` — leading file-type icon (Material Symbol name, e.g. `"description"`, `"picture_as_pdf"`) shown before the file name
- `error: string` — error feedback. When set, switches the card to its error visual and renders feedback text below. Implies `invalid`.
- `invalid: boolean = false` — switches the card to its error visual (danger background + error icon) without rendering feedback text. Use when the error message is rendered elsewhere (e.g. an aggregate validation message).
- `direction: "horizontal" | "vertical" | undefined` — content layout. `horizontal` keeps name/progress on one row beside the actions; `vertical` stacks them with actions pinned top-right (use in narrow containers/sidebars). When `undefined`, derived from `verticalBelow`.
- `verticalBelow: Breakpoint = "sm"` — viewport breakpoint below which the layout auto-switches to `vertical`
**Slots:**
- project a `<tedi-progress-bar>` to show upload/processing progress. Configure label, hint, and value formatting on the projected progress bar itself.
- project action buttons (download, delete, …) inside a single `<tedi-attachment-actions>` container (`AttachmentActionsComponent`). Action buttons are **not** built in — use neutral `tedi-button`s, wire up `(click)`/`disabled` yourself. For icon-only buttons give each an `aria-label` (and optionally a tooltip). The container owns the layout: add `padded` to it for labeled (text) buttons (adds a 12px gap + 8px inline padding, since neutral text buttons have no horizontal padding); omit it for icon-only buttons, which sit flush.

**`<tedi-attachment-actions>` (`AttachmentActionsComponent`)** — container for the action buttons. Input: `padded: boolean = false`.

```html
<tedi-attachment name="report.pdf" fileSize="0.9 MB">
  <tedi-progress-bar [value]="34" valuePosition="bottom">
    <tedi-feedback-text text="Uploading" type="hint" />
  </tedi-progress-bar>
  <tedi-attachment-actions>
    <button tedi-button variant="neutral" aria-label="Download" (click)="onDownload()">
      <tedi-icon name="download" [size]="18" />
    </button>
    <tedi-tooltip>
      <tedi-tooltip-trigger>
        <button tedi-button variant="neutral" aria-label="Delete" (click)="onRemove()">
          <tedi-icon name="delete" [size]="18" />
        </button>
      </tedi-tooltip-trigger>
      <tedi-tooltip-content>Delete</tedi-tooltip-content>
    </tedi-tooltip>
  </tedi-attachment-actions>
</tedi-attachment>

<!-- labeled (text) buttons → add `padded` -->
<tedi-attachment name="report.pdf">
  <tedi-attachment-actions padded>
    <button tedi-button variant="neutral"><tedi-icon name="download" [size]="18" /> Download</button>
    <button tedi-button variant="neutral"><tedi-icon name="delete" [size]="18" /> Delete</button>
  </tedi-attachment-actions>
</tedi-attachment>
```

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

### Ellipsis
**Selector:** `tedi-ellipsis`
**Inputs:**
- `lineClamp: number = 2` — maximum lines before truncating (end position only)
- `tooltip: boolean = true` — show hover/focus tooltip with full text when truncated
- `position: 'start' | 'end' = 'end'` — `'end'` = trailing multi-line clamp; `'start'` = leading single-line

```html
<tedi-ellipsis style="max-width:200px">Long content that overflows...</tedi-ellipsis>

<!-- Leading ellipsis (single-line) -->
<tedi-ellipsis [position]="'start'" style="max-width:200px">/users/tehiK/tedi/angular/src/lib/components/helpers/ellipsis/ellipsis.component.ts</tedi-ellipsis>
```

### Separator
**Selector:** `tedi-separator`
**Inputs:**
- `axis: "horizontal" | "vertical" = "horizontal"`
- `color: SeparatorColor = "primary"`
- `variant: SeparatorVariant`
- `thickness: number = 1`
- `spacing: SeparatorSpacingValue | SeparatorSpacing` — margins. Horizontal supports y-spacing only (number → top+bottom; object `y`/`top`/`bottom`; x ignored). Vertical supports both x and y (number → left+right; object `x`/`y` shorthands or explicit `top`/`bottom`/`left`/`right`). `x`=left+right, `y`=top+bottom; explicit side overrides the shorthand.
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
- `activeIndex: number` — items before it render as past, after it as future
- `variant: TimelineVariant = "default"` — "card" renders each item as a bordered, padded card row inside a card frame
- `cardPadding: TimelineCardPadding` — item padding in rems for the card variant; same values as Card padding (0 | 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2 | 2.5 | 3; default 1)
- Sub-components: `tedi-timeline-item` (`timings: string[]`), `tedi-timeline-title`, `tedi-timeline-description`
- Content marked with `*tediTimelineTimingsBottom` is pinned to the bottom of the timings column on desktop and rendered after the item content on mobile (e.g. a "Muudetud …" line)

```html
<tedi-timeline variant="card" [activeIndex]="1" [cardPadding]="1">
  <tedi-timeline-item [timings]="['11.01.2024 12:23', 'Kersti Ööviul']">
    <p *tediTimelineTimingsBottom tedi-text modifiers="small" color="tertiary">Muudetud 08.02.2024</p>
    <tedi-timeline-title>Suhtlus isikuga</tedi-timeline-title>
    <tedi-collapse openText="Näita rohkem" closeText="Näita vähem">
      <p tedi-text modifiers="small" color="secondary">Lisainfo</p>
    </tedi-collapse>
  </tedi-timeline-item>
</tedi-timeline>
```

## Layout

### Header
**Selector:** `header[tedi-header]`

Sub-components: `tedi-header-top`, `tedi-header-logo`, `tedi-header-content`, `tedi-header-actions`, `tedi-header-language`, `tedi-header-login`, `tedi-header-logout`, `tedi-header-profile`, `tedi-header-role`, `tedi-header-search`, `tedi-header-bottom`

**tedi-header-top:** secondary bar projected above the main header (language picker, top-level links, dark-mode toggle).
- bp `alignment?: HeaderTopAlignment = 'space-between'` — `justify-content` of the top bar content. `HeaderTopAlignment` = `'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'`. Breakpoint-aware via `[xs]`–`[xxl]`, e.g. `alignment="center" [lg]="{ alignment: 'space-between' }"` to center on mobile and spread on desktop.

**tedi-header-content:** center content area (nav links, search).
- `alignment?: HeaderContentAlignment = 'center'` (`'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly'`)

**tedi-header-bottom:** mobile-only secondary row below the main bar (hidden from `md` up); typically a compact search.

**tedi-header-logo:**
- `href?: string` — wraps logo in an anchor
- `showLogo: boolean = true` — simple boolean for feature flags or custom media queries. For responsive hiding at standard breakpoints, use `*showAt` / `*hideAt` directives instead (e.g. `<tedi-header-logo *showAt="'md'">`).
- Supports dark variant via `tedi-header-logo-dark` directive on projected content.

**tedi-header-role:**
- `representatives: Representative[]` (required) — `Representative` has `id: string`, `name: string`, `description?: string`, `icon?: string | RepresentativeIcon`
- `currentRepresentative: Representative` (required, two-way with `model()`)
- `label?: string` — label text in the title position
- `description?: string` — description text
- `showSearch?: boolean = false` — show search input above representative list
- `searchClearable?: boolean = false` — show clear button on search input
- `clearSearchOnSelect?: boolean = true` — clear search when a representative is selected
- `isOrganization?: boolean = false` — affects search label
- `searchLabel?: string` — custom search input label (falls back to i18n)
- `organizationSearchLabel?: string` — search label when `isOrganization` is true
- `showRoleSwitch?: boolean` — show role selection toggle (defaults to true when multiple representatives)
- `roleSelectionToggle: OutputEmitterRef<boolean>` — emits when role selection opens/closes
- Custom content via `[tedi-header-role-content]` directive replaces default representative list.
- Custom no-results content via `[tedi-header-role-no-results]` directive.
- Custom title via `[tedi-header-role-title]` directive.
- When multiple `tedi-header-role` components are inside a `tedi-header-profile`, opening one accordion automatically closes the others on mobile/tablet.

**tedi-header-language:**
- `languages: HeaderLanguage` (required) — object with `Language` keys and display string values
- `selectLabel?: string` — label for the selector (falls back to the `header.select-lang` translation)
- `labelPosition?: 'top' | 'left' = 'top'` — position of the select label relative to the trigger
- `languageHrefs?: Partial<Record<Language, string>>` — per-language URLs; a language with a URL renders its option as a navigation anchor (`<a href>`) instead of switching client-side
- `languageChange: OutputEmitterRef<Language>` — emits on language selection

**tedi-header-login:** bp — `size?: 'default' | 'small'` (auto `'small'` on mobile), `label?: string`, `onClick?: () => void`, `href?: string`
**tedi-header-logout:** bp — `size?: 'default' | 'small'` (auto `'small'` on mobile), `label?: string`, `onClick?: () => void`, `href?: string`

**tedi-header-profile:** bp — `showPopover?: Breakpoint = 'lg'`, `label?: string`, `showLabel?: boolean = false`, `size?: HeaderProfileSize`, `noStyle?: boolean = false`
- `noStyle` removes default padding, borders, and background from modal children. Does not affect `tedi-header-role`'s own 4px brand bottom border.

**tedi-header-search:** `mobileVariant?: 'modal' | 'inline'`, `mobileLabels?: { button?, modalTitle? }`, `disabled?: boolean`

```html
<header tedi-header>
  <tedi-header-top alignment="center" [lg]="{ alignment: 'space-between' }">
    <tedi-header-language [languages]="languages" (languageChange)="onLangChange($event)" />
  </tedi-header-top>
  <tedi-header-logo href="/">
    <img src="logo.svg" alt="Logo" />
  </tedi-header-logo>
  <tedi-header-actions>
    <tedi-header-language [languages]="languages" (languageChange)="onLangChange($event)" />
    <tedi-header-profile>
      <tedi-header-role [representatives]="reps" [(currentRepresentative)]="currentRep" />
      <tedi-header-logout href="/logout" />
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

### ProgressBar
**Selector:** `tedi-progress-bar`
**Inputs:**
- `value: number = 0` — 0–100, clamped
- `progressId: string` — id for the underlying `<progress>` element
- `size: "default" | "small" = "default"` — `small` renders a 4px bar height instead of 8px
- `label: string` — optional title (top or horizontal)
- `labelPosition: "top" | "horizontal" = "top"`
- `required: boolean = false` — red `*` after the label
- `showValue: boolean = true` — show/hide the percentage value
- `valuePosition: "horizontal" | "bottom" = "horizontal"` — where to place the percentage value
- `valueLabel: string` — override the rendered value text (e.g. `"1/5"`); also exposed via `aria-valuetext`
- `ariaLabel: string` — falls back to `label`
- `xs` / `sm` / `md` / `lg` / `xl` / `xxl: ProgressBarInputs` — per-breakpoint overrides of `size`, `labelPosition`, `showValue`, `valuePosition` and `valueLabel`. Each takes a partial set of inputs that layers on top from that breakpoint and up (mobile-first), e.g. `[md]="{ labelPosition: 'horizontal', valuePosition: 'horizontal' }"`.
**Slots:** project a `<tedi-feedback-text>` to render a hint or error line below the bar.

```html
<tedi-progress-bar [value]="42" label="Uploading" required>
  <tedi-feedback-text text="Uploading" type="hint" />
</tedi-progress-bar>
<tedi-progress-bar [value]="20" valueLabel="1/5" />
```

### Spinner
**Selector:** `tedi-spinner`
**Inputs:**
- `size: SpinnerSize = 16` — 10, 16, or 48
- `color: SpinnerColor = "primary"`
- `label: string` — screen reader label

## Navigation

### Breadcrumbs
**Selector:** `tedi-breadcrumbs`
**Composition:** mark each crumb with the `*tediBreadcrumbItem` structural directive, in order from root to current page. Use `a tedi-link` for navigable crumbs and a plain element (e.g. `span`) for the current page — add `aria-current="page"` to it yourself. Chevron separators are inserted automatically.
**Inputs:**
- `variant: "long" | "short" = "long"` — `long` shows the full trail; `short` shows only the parent crumb as a back-link (mobile)
- `maxItems: number` — collapse the middle of a long trail into an ellipsis dropdown when the crumb count exceeds this. Long variant only
- `itemsBeforeCollapse: number = 1` — crumbs kept at the start when collapsed
- `itemsAfterCollapse: number = 1` — crumbs kept at the end when collapsed
- `separator: string` — text separator (e.g. `"/"`); defaults to a chevron icon
- `ariaLabel: string` — `nav` landmark label; falls back to the `breadcrumbs` translation
- `showMoreLabel: string` — ellipsis button label; falls back to the `breadcrumbs.show-more` translation
- Responsive: `xs, sm, md, lg, xl, xxl: BreadcrumbsInputs` (`variant`, `maxItems`, `itemsBeforeCollapse`, `itemsAfterCollapse`)

**Content projection:**
- `*tediBreadcrumbItem` — one per crumb
- `*tediBreadcrumbSeparator` — optional custom separator template (overrides `separator` and the default icon)

```html
<tedi-breadcrumbs [maxItems]="4" variant="short" [md]="{ variant: 'long' }">
  <a *tediBreadcrumbItem tedi-link href="/">Töölaud</a>
  <a *tediBreadcrumbItem tedi-link href="/apps">Taotlused</a>
  <span *tediBreadcrumbItem aria-current="page">Taotlus nr 506</span>
</tedi-breadcrumbs>
```

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
- `pageSizeOptions: (number | PaginationPageSizeOption)[] = []` — options for the page-size select; empty hides the select. Plain numbers label themselves; pass `{ value, label }` objects when the visible text should differ from the value — most commonly a **"Show all"** entry. The component stays presentational: selecting an option emits its `value` and the consumer recomputes `pageCount` (see the "Show all" example below).
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

"Show all" page size — a labelled option whose value covers every row. The component is dumb; recompute `pageCount` in the change handler so the pager collapses to a single page:

```html
<tedi-pagination
  [pageCount]="pageCount"
  [(page)]="page"
  [totalItems]="totalItems"
  [pageSize]="pageSize"
  [pageSizeOptions]="[10, 25, 50, { value: totalItems, label: 'Show all' }]"
  (pageSizeChange)="onPageSizeChange($event)"
/>
```

```ts
onPageSizeChange(size: number) {
  this.pageSize = size;
  this.pageCount = Math.max(1, Math.ceil(this.totalItems / size)); // → 1 for "Show all"
  this.page = 1;
}
```

Supply the label already translated — there is no built-in `pagination.show-all` translation key.

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
- `ariaLabel: string` — accessible name for the `navigation` landmark
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

### TableOfContents
**Selector:** `tedi-table-of-contents`
**Composition:** compose from `tedi-table-of-contents-item` elements. An item's non-item content (a `tedi-link`, anchor or button) is its label; nested `tedi-table-of-contents-item` children become its sub-items (two levels, distinguished by indent). Renders a `nav` landmark wrapping a `role="list"` list; the active item carries `aria-current="true"`.
**Inputs:**
- `heading: string | null` — heading above the list; defaults to the `table-of-contents.title` translation (`Sisukord` in et). Pass `null` (or empty) to render headless — the `nav` keeps an accessible name via `aria-label`
- `headingLevel: "h1"–"h6" = "h3"` — semantic level of the heading element; the visual style stays H4. Set it to match the surrounding page's heading outline (avoids skipped levels)
- `variant: TableOfContentsVariant = "default"` — `default` renders inside a bordered card; `transparent` drops the card chrome and shows a continuous grey left rail
- `activeId: string` — id of the active item; it gets the accent bar + active colour, and the branch leading to it auto-expands
- `padding: number` — inner padding in rem; defaults to the card medium padding token
- `numbered: boolean = false` — render an auto-generated hierarchical number before each item (`1.`, `2.`, `2.1`)
- `sticky: boolean = true` — stick the container to the viewport while scrolling
- `ariaLabel: string` — accessible name for the `nav` landmark; overrides the default (the heading via `aria-labelledby`, or the localised title when headless)

**Sub-component:** `tedi-table-of-contents-item`
- `itemId: string` — required to mark the item active (via the parent's `activeId`) and to parent nested items (named `itemId`, not `id`, to avoid shadowing the native attribute)
- `separator: boolean = false` — render a separator below the item

```html
<tedi-table-of-contents heading="Sisukord" activeId="methods">
  <tedi-table-of-contents-item itemId="intro">
    <a tedi-link href="#intro" [underline]="false">Sissejuhatus</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="methods">
    <a tedi-link href="#methods" [underline]="false">Meetodid</a>
    <tedi-table-of-contents-item itemId="methods-1">
      <a tedi-link href="#methods-1" [underline]="false">Andmete kogumine</a>
    </tedi-table-of-contents-item>
  </tedi-table-of-contents-item>
</tedi-table-of-contents>
```

**Mobile variant:** `tedi-table-of-contents-collapsible` — a bottom bar that opens the list in a bottom-sheet overlay; takes the same `tedi-table-of-contents-item` children. Render it on small viewports (e.g. behind a `tedi-show-at` / `tedi-hide-at`).
- `heading: string | null` — bar/sheet title; defaults to the `table-of-contents.title` translation
- `activeId: string`, `numbered: boolean = false` — same behavior as the desktop component
- `sticky: boolean = true` — pin the bar to the bottom of the viewport; set `false` to render it inline
- `ariaLabel: string` — accessible name for the sheet's navigation landmark and dialog; defaults to the visible title

```html
<tedi-table-of-contents-collapsible heading="Sisukord" activeId="methods">
  <tedi-table-of-contents-item itemId="intro">
    <a tedi-link href="#intro" [underline]="false">Sissejuhatus</a>
  </tedi-table-of-contents-item>
  <tedi-table-of-contents-item itemId="methods">
    <a tedi-link href="#methods" [underline]="false">Meetodid</a>
  </tedi-table-of-contents-item>
</tedi-table-of-contents-collapsible>
```

### Tabs
**Selector:** `tedi-tabs`
**Inputs:**
- `value: string` — controlled active tab id; bind with `[(value)]` or `[value]` + `(valueChange)`
- `defaultValue: string = ""` — initial active tab id for uncontrolled usage

**Outputs:**
- `valueChange: string` — emitted with the new active tab id when it changes

**Sub-components:**
- `tedi-tabs-list` — the `role="tablist"` container.
  - `aria-label: string` / `aria-labelledby: string` — accessible name for the tablist
  - `overflowMode: "dropdown" | "scroll" = "dropdown"` — when tabs don't fit, either collapse overflowing tabs into a "More" dropdown or enable horizontal scrolling with fade indicators
  - `dropdownLabel: string` — label for the overflow dropdown trigger; falls back to the `more` translation (`Veel` in et)
- `button[tedi-tabs-trigger]`, `a[tedi-tabs-trigger]` — a tab trigger. Use `<button>` for in-page tabs, or `<a>` (with `href`/`routerLink`) for a tab that navigates to a route — the anchor keeps `role="tab"` semantics but is a real link (WCAG-friendly: open-in-new-tab, copy address, keyboard). A disabled `<a>` gets `aria-disabled` instead of the `disabled` attribute. Modifier/middle clicks and `target="_blank"` open the link without changing the active tab in the current view. Note: a disabled anchor stays unreachable via pointer/keyboard, but `routerLink` navigates from its own click handler — bind `[routerLink]="disabled ? null : path"` so a disabled routed tab can't navigate.
  - `id: string` (required) — links to the matching `tedi-tabs-content` panel (`aria-controls="{id}-panel"`)
  - `icon: string` — Material Symbols icon shown before the label
  - `disabled: boolean = false`
- `tedi-tabs-content` — a tab panel (`role="tabpanel"`).
  - `id: string` — when set, shown only while that tab is active; omit to always render (e.g. for a router outlet)

Keyboard: Arrow Left/Right (with wrap), Home/End move focus between enabled tabs; only the active tab is in the tab order. Disabled tabs are skipped. Full WAI-ARIA tab pattern. Activation mode differs by element: `<button>` tabs use **automatic activation** (arrow keys move focus and activate), while `<a>` tabs use **manual activation** (arrows only move focus; Enter/Space follows the link) so arrowing across route-links doesn't navigate on every keypress.

```html
<tedi-tabs defaultValue="tab-1">
  <tedi-tabs-list aria-label="Health tabs">
    <button tedi-tabs-trigger id="tab-1">Health timeline</button>
    <button tedi-tabs-trigger id="tab-2" icon="medication">Medication history</button>
    <button tedi-tabs-trigger id="tab-3" [disabled]="true">Archived</button>
  </tedi-tabs-list>
  <tedi-tabs-content id="tab-1">Timeline content</tedi-tabs-content>
  <tedi-tabs-content id="tab-2">Medication content</tedi-tabs-content>
  <tedi-tabs-content id="tab-3">Archived content</tedi-tabs-content>
</tedi-tabs>
```

Controlled usage:

```html
<tedi-tabs [(value)]="activeTab">
  <tedi-tabs-list aria-label="Controlled tabs" overflowMode="scroll">
    <button tedi-tabs-trigger id="tab-1">First</button>
    <button tedi-tabs-trigger id="tab-2">Second</button>
  </tedi-tabs-list>
  <tedi-tabs-content id="tab-1">First panel</tedi-tabs-content>
  <tedi-tabs-content id="tab-2">Second panel</tedi-tabs-content>
</tedi-tabs>
```

Routed tabs (anchors) — bind `[value]` to the current route and let each link navigate; use an id-less `tedi-tabs-content` to wrap the router outlet:

```html
<tedi-tabs [value]="router.url">
  <tedi-tabs-list aria-label="Section tabs">
    <a tedi-tabs-trigger id="/toimingud" routerLink="/toimingud">Toimingud</a>
    <a tedi-tabs-trigger id="/dokumendid" routerLink="/dokumendid">Dokumendid</a>
  </tedi-tabs-list>
  <tedi-tabs-content><router-outlet /></tedi-tabs-content>
</tedi-tabs>
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
- `size: AlertSize = "default"` — `"default"` or `"small"` (reduced padding and smaller body text)
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
    scrollBehavior: 'content',      // 'content' | 'page'
    closeOnBackdropClick: true,
    closeOnEscape: true,
    showClose: true,
    fullscreen: false,              // true | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
    maxWidth: '60vw',               // optional cap, overrides default 95vw
    ariaLabel: 'Confirm action',
  });

  ref.closed.subscribe(result => console.log(result));
}
```

**ModalConfig inputs:**
- `data: unknown` — injected via `MODAL_DATA` token
- `size: ModalSize = "default"` — `"default"` or `"small"`
- `width: ModalWidth = "sm"` — preset (`"xs" | "sm" | "md" | "lg" | "xl"`) or custom CSS value (`"80%"`, `"600px"`)
- `position: ModalPosition = "center"` — `"center" | "top" | "bottom" | "left" | "right"`. `"bottom"` anchors the modal to the bottom edge with a fixed margin (useful for mobile bottom-sheet patterns)
- `scrollBehavior: ModalScrollBehavior = "content"` — `"content"` scrolls inside the modal, `"page"` scrolls the overlay
- `closeOnBackdropClick: boolean = true`
- `closeOnEscape: boolean = true`
- `showClose: boolean = true` — show the close button in the header
- `fullscreen: ModalFullscreen = false` — `true` always fullscreen, `false` never, breakpoint name (`"sm" | "md" | "lg" | "xl" | "xxl"`) means fullscreen below that breakpoint
- `maxWidth: string` — optional max-width cap (e.g. `"75%"`, `"60vw"`); overrides the default `95vw`
- `ariaLabel: string` — ARIA label for the dialog
- `ariaLabelledBy: string` — ID of the element that labels the dialog

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
- `hideOnScroll: boolean = false` — close the dropdown when the page scrolls

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
- `withBorder: boolean = false` — illustrative prominent border on the arrow side
- `lockScroll: boolean = false`

### Tooltip
**Selector:** `tedi-tooltip`
**Inputs:**
- `position: TooltipPosition = "top"`
- `preventOverflow: boolean = true`
- `openWith: TooltipOpenWith = "both"` — `"hover"`, `"click"`, `"both"`, or `"none"`. Use `"none"` to disable the built-in triggers and control visibility yourself via `open`.
- `timeoutDelay: number = 100` — ms before closing when the pointer leaves the trigger/content
- `offset: number = 4` — extra distance (px) between the tooltip and its trigger, on top of the arrow allowance. Set `0` to sit the tooltip directly against the trigger (e.g. a slider thumb).
- `trackPosition: boolean = false` — while open, follow a moving origin (e.g. a dragging handle) with a `requestAnimationFrame` reposition loop. Enable only while the origin can actually move.
**Models:**
- `open: boolean | undefined` — controlled open state (two-way). Leave unset for the default trigger-driven behavior; typically paired with `openWith="none"`.
**Methods:**
- `updatePosition()` — manually reposition against the origin (the imperative alternative to `trackPosition`).

**`tedi-tooltip-trigger` inputs:**
- `interactive: boolean = true` — when `false`, skips focus/`tabindex`/`aria-describedby` synthesis so the trigger is a pure positioning anchor for a decorative or externally-controlled element (focus/ARIA live elsewhere). The overlay anchors to the trigger's host element.

```html
<tedi-tooltip position="top">
  <tedi-tooltip-trigger>
    <button tedi-button>Hover me</button>
  </tedi-tooltip-trigger>
  <tedi-tooltip-content>Tooltip text</tedi-tooltip-content>
</tedi-tooltip>

<!-- Controlled + following a custom draggable element -->
<tedi-tooltip openWith="none" [open]="isDragging" [trackPosition]="isDragging">
  <tedi-tooltip-trigger [interactive]="false">
    <span class="my-handle" aria-hidden="true"></span>
  </tedi-tooltip-trigger>
  <tedi-tooltip-content>{{ value }}</tedi-tooltip-content>
</tedi-tooltip>
```

### InfoTooltip
**Selector:** `tedi-info-tooltip`
An info button paired with a tooltip — the ready-made `tedi-tooltip` + `tedi-info-button` combo. Projects the tooltip content. Use as a trailing affix in `tedi-label-row`, or standalone for any inline "more information" tooltip.
**Inputs:**
- `position: TooltipPosition = "top"`
- `openWith: TooltipOpenWith = "both"` — hover, click, or both
- `maxWidth: TooltipWidth = "medium"` — "none", "small", "medium", "large"
- `color: "primary" | "inverted" = "primary"` — info-button color; use `inverted` on dark backgrounds
- `ariaLabel: string` — accessible name for the info button (defaults to the translated info-button label)
**Slots:** default — the tooltip content

```html
<tedi-info-tooltip position="right" ariaLabel="More information">
  Enter the city where you currently reside.
</tedi-info-tooltip>
```

## Tags

### Tag
**Selector:** `tedi-tag`
**Inputs:**
- `loading: boolean = false`
- `closable: boolean = false`
- `type: TagType = "primary"`
- `ellipsis: TagEllipsis = false` — `false | "start" | "end"`. When set (and the tag is width-constrained), truncates the label to a single line with an ellipsis at that end and reveals the full label in a tooltip on hover/focus. `false` lets the label wrap.
**Outputs:**
- `closed: Event`
**Slots:** default

```html
<tedi-tag type="primary" [closable]="true" (closed)="onRemove()">Label</tedi-tag>

<!-- Truncate a long label (needs a width constraint, e.g. a max-width parent) -->
<tedi-tag ellipsis="end" [closable]="true">A fairly long tag label</tedi-tag>
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
### Card — **DEPRECATED** (use TEDI-Ready Card)
**Selector:** `tedi-card`
- `borderless: boolean`, `spacing: CardSpacing = "md"`, `accentBorder: CardAccentBorder`, `selected: boolean`
- Sub-components: `tedi-card-header`, `tedi-card-content`, `tedi-card-row`

> The TEDI-Ready Card (Content section above) uses the same `tedi-card` selector but a different API (`padding` in rems instead of named `spacing`, `border` instead of `accentBorder`, plus `tedi-card-icon` and breakpoint inputs; the Community `timeline` input is replaced by `tedi-timeline variant="card"`). Do not mix imports of the two in one component.

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

### Search — **DEPRECATED** (use TEDI-Ready Search)
**⚠️ DEPRECATED** — use the TEDI-Ready `tedi-search` from `@tedi-design-system/angular/tedi`. Same selector; the TEDI-Ready version exposes a trailing `button` (`SearchButton`), a `feedbackText` input for hints/validation, and `searchEvent` / `clear` outputs.
**Selector:** `tedi-search` | ControlValueAccessor
- `inputId: string`, `autocompleteOptions: AutocompleteOption[]`, `size: SearchSize`, `withButton: boolean`

### Textarea — **DEPRECATED** (use TEDI-Ready Textarea)
**Selector:** `[tedi-textarea]` (extends Input)
- `resizeX: boolean = false`, `resizeY: boolean = true`
- Migrate to the TEDI-Ready `textarea[tedi-textarea]`: `resizeX`/`resizeY` become a single `resizable` (vertical only), composed inside `tedi-form-field`.

### FileDropzone
**Selector:** `tedi-file-dropzone` | ControlValueAccessor
- `accept: string`, `maxSize: number`, `multiple: boolean`, `mode: "append" | "replace"`

### FormField / InputGroup
**Selector:** `tedi-form-field`, `tedi-input-group`

## Helpers

### ProgressBar
**⚠️ DEPRECATED** — use the TEDI-Ready `tedi-progress-bar` from `@tedi-design-system/angular/tedi`. Same selector; the TEDI-Ready version is a superset.

## Navigation

### Breadcrumbs
**⚠️ DEPRECATED** — use the TEDI-Ready `tedi-breadcrumbs` from `@tedi-design-system/angular/tedi` (composition API with `*tediBreadcrumbItem`, custom separators and collapse). This community version will be removed in a future release.
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
