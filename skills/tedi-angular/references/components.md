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
- `title: string = ""`
- `titleLayout: "hug" | "fill" = "hug"`
- `headerClickable: boolean = true` — whether clicking header toggles expand
- `showSeparateTitle: boolean = true`
- `openLabel: string = "open"` — label for expand action
- `closeLabel: string = "close"` — label for collapse action
- `showExpandLabel: boolean = true` — show open/close label text
- `showDefaultExpandAction: boolean = true` — show default expand/collapse button
- `expandActionPosition: "start" | "end" = "end"`
- `defaultExpanded: boolean = false`
- `description: string`
- `descriptionPosition: "start" | "end" | "both" = "start"`
- `showIconCard: boolean = false`
- `selected: boolean = false`
- `headerClass: string | null`
- `bodyClass: string | null`
**Model:** `expanded: boolean`
**Slots:** default, `[tedi-accordion-icon-card]`, `[tedi-accordion-start-action]`, `[tedi-accordion-end-action]`

```html
<tedi-accordion>
  <tedi-accordion-item title="Section 1">Content 1</tedi-accordion-item>
  <tedi-accordion-item title="Section 2">Content 2</tedi-accordion-item>
</tedi-accordion>
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

```html
<input type="checkbox" tedi-checkbox [formControl]="agreeControl" />
```

### Radio
**Selector:** `input[type=radio][tedi-radio]`
**Inputs:**
- `size: RadioSize = "default"` — "default" or "large"
- `invalid: boolean = false`

```html
<label tedi-label color="primary" style="display: inline-flex; align-items: center; gap: 8px;">
  <input type="radio" tedi-radio name="group" value="a" />
  Option A
</label>
```

### RadioCard
**Selector:** `label[tedi-radio-card]`
**Inputs:**
- `variant: RadioCardVariant = "primary"` — "primary" or "secondary"
- `grouped: boolean = false` — join cards in a button-group layout

```html
<!-- Separate cards (default) -->
<div style="display: flex; gap: 8px;">
  <label tedi-radio-card variant="primary">
    <input tedi-radio type="radio" name="cards" />
    Text
  </label>
</div>

<!-- Grouped cards -->
<div style="display: inline-flex;">
  <label tedi-radio-card variant="primary" [grouped]="true">
    <input tedi-radio type="radio" name="cards" />
    Option A
  </label>
  <label tedi-radio-card variant="primary" [grouped]="true">
    <input tedi-radio type="radio" name="cards" />
    Option B
  </label>
</div>
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

### Filter
**Selector:** `tedi-filter`
**Model:** `selected: boolean`, `value: string`, `values: string[]`
**Inputs:**
- `text: string = ""` — filter label text
- `variant: FilterVariant = "primary"` — "primary" or "secondary"
- `size: FilterSize = "default"` — "default" or "large"
- `multiselect: boolean = false` — multiselect dropdown mode
- `options: FilterOption[] = []` — dropdown options `{ label, value, disabled? }`
- `searchable: boolean = false` — show search field in dropdown
- `showSelectAll: boolean = false` — show "Select all" in multiselect
- `showClear: boolean = false` — show clear action in dropdown
- `selectAllLabel: string = "Vali kõik"`
- `clearLabel: string = "Tühjenda valik"`
**Outputs:**
- `cleared: void` — emitted when clear button is clicked in custom content mode
**Slots:**
- `[tediFilterPrepend]` — content before the label (icon, status badge, indicator). Hidden when the filter is selected. In toggle mode (no dropdown), a check icon replaces it; in dropdown modes the prepend is simply removed.
- `[tediFilterContent]` — custom dropdown content (replaces options)

Implements `ControlValueAccessor`. Value type depends on mode: `boolean` (toggle), `string` (single-select), `string[]` (multiselect).

```html
<!-- Boolean toggle -->
<tedi-filter text="Active" variant="secondary" [formControl]="activeControl" />

<!-- Single-select dropdown -->
<tedi-filter text="Service" [options]="options" [(value)]="value" [showClear]="true" />

<!-- Multiselect dropdown -->
<tedi-filter text="Hospital" [multiselect]="true" [options]="options" [(values)]="values"
  [searchable]="true" [showSelectAll]="true" [showClear]="true" />

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
```

### FilterGroup
**Selector:** `tedi-filter-group`
Wrapper that joins filters into a connected button group with collapsed borders and shared border-radius.

```html
<tedi-filter-group>
  <tedi-filter text="All" variant="secondary" [selected]="true" />
  <tedi-filter text="Active" variant="secondary" />
  <tedi-filter text="Closed" variant="secondary" />
</tedi-filter-group>
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
    position: 'center',             // 'center' | 'top' | 'left' | 'right'
    closeOnBackdropClick: true,
    scrollBehavior: 'content',      // 'content' | 'page'
    mobileFullscreen: false,
  });

  ref.closed.subscribe(result => console.log(result));
}
```

**ModalConfig inputs:**
- `data: unknown` — injected via `MODAL_DATA` token
- `width: ModalWidth = "sm"` — preset (`xs`-`xl`) or custom CSS value (`"80%"`, `"600px"`)
- `size: ModalSize = "default"` — `"default"` or `"small"`
- `position: ModalPosition = "center"` — `"center"`, `"top"`, `"left"`, `"right"`
- `closeOnBackdropClick: boolean = true`
- `scrollBehavior: "content" | "page" = "content"`
- `mobileFullscreen: boolean = false`

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
- `tedi-modal-header` — `showClose: boolean = true`
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

### Tooltip
**Selector:** `tedi-tooltip`
**Inputs:**
- `position: TooltipPosition = "top"`
- `preventOverflow: boolean = true`
- `openWith: TooltipOpenWith = "both"` — hover, focus, or both

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
- Models: `page: number = 1`, `pageSize: number = 50`
- `pageSizeOptions: number[]`, `length: number`

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
