import { CdkConnectedOverlay, ConnectedPosition, OverlayModule } from "@angular/cdk/overlay";
import { CdkListbox, CdkListboxModule } from "@angular/cdk/listbox";
import { CdkVirtualScrollViewport, ScrollingModule } from "@angular/cdk/scrolling";
import {
  AfterContentChecked,
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  DestroyRef,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  NgZone,
  output,
  Renderer2,
  signal,
  viewChild,
  viewChildren,
  ViewEncapsulation,
  forwardRef,
  computed,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { CommonModule, DOCUMENT } from "@angular/common";
import { IconComponent, TextComponent } from "../../base";
import { ClosingButtonComponent } from "../../buttons";
import { InfoTooltipComponent } from "../../overlay/info-tooltip/info-tooltip.component";
import { TediTranslationPipe } from "../../../services";
import { ComponentInputs } from "../../../types";
import { calculateVisibleTagCount } from "../../../utils/tag-overflow.util";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { LabelComponent } from "../label/label.component";
import { LabelRowComponent } from "../label-row/label-row.component";
import { TagComponent, TagEllipsis } from "../../tags/tag/tag.component";
import { EllipsisComponent, EllipsisPosition } from "../../helpers/ellipsis";
import { DropdownItemValueComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value-label.component";
import {
  SelectOptionTemplateDirective,
  SelectValueTemplateDirective,
  SelectTooltipTemplateDirective,
  SelectOptionContext,
  SelectValueContext,
} from "./select-templates.directive";
import { InputSize, InputState } from "../form-field/form-field.component";
export type SelectInputSize = Exclude<InputSize, "large">;

export interface SelectOption<T = unknown> {
  value: T;
  label: string;
  disabled?: boolean;
  group?: string;
  [key: string]: unknown;
}

export interface SelectOptionGroup<T = unknown> {
  label: string;
  options: SelectOption<T>[];
}

/** A navigable row in the virtual-scroll listbox: the pinned select-all row or an option. */
export type VirtualRow<T = unknown> =
  | { kind: "select-all" }
  | { kind: "option"; option: SelectOption<T> };

export type GroupByFn<T = unknown> = (item: T) => string | undefined;
export type CompareWithFn<T = unknown> = (a: T, b: T) => boolean;

/**
 * Default value comparator. Kept as a stable module-level reference so the
 * component can detect when the identity comparison is in use and take O(1)
 * Set/Map lookup paths instead of O(n) scans (see issue #552).
 */
const defaultCompareWith: CompareWithFn = (a, b) => a === b;

export enum SpecialOptionControls {
  SELECT_ALL = "\0SELECT_ALL",
  SELECT_GROUP = "\0SELECT_GROUP_",
}

@Component({
  selector: "tedi-select",
  imports: [
    CommonModule,
    OverlayModule,
    CdkListboxModule,
    ScrollingModule,
    ClosingButtonComponent,
    IconComponent,
    LabelComponent,
    LabelRowComponent,
    InfoTooltipComponent,
    FeedbackTextComponent,
    TextComponent,
    TagComponent,
    TediTranslationPipe,
    DropdownItemValueComponent,
    DropdownItemValueLabelComponent,
    EllipsisComponent,
  ],
  templateUrl: "./select.component.html",
  styleUrl: "./select.component.scss",
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "tedi-select",
    "[class.tedi-select--multiselect]": "allowMultiple()",
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent<T = unknown> implements AfterContentChecked, AfterViewChecked, ControlValueAccessor {
  /**
   * Unique identifier for the select input element.
   * Used for label association and accessibility.
   */
  inputId = input.required<string>();

  /**
   * Label text displayed above the select.
   */
  label = input<string>();

  /**
   * When set, renders an info button next to the label that reveals this text
   * in a tooltip on hover/focus. For formatted content, project a
   * `*tediSelectTooltip` template instead, which takes precedence over this.
   */
  tooltip = input<string>();

  /**
   * Associates the select with an external visible label by its element id.
   * Use this when the label lives outside the component — a native
   * `<label for>` cannot target the combobox because it is a `<div>`, not a
   * labelable element. Ignored when the built-in `label` input is set.
   */
  ariaLabelledby = input<string | undefined>(undefined);

  /**
   * Accessible name for the select when there is no visible label to reference.
   * Ignored when `label` or `ariaLabelledby` provides a name.
   */
  ariaLabel = input<string | undefined>(undefined);

  /**
   * Whether the field is required.
   * @default false
   */
  required = input<boolean>(false);

  /**
   * Placeholder text shown when no value is selected.
   * @default ""
   */
  placeholder = input<string>("");

  /**
   * Visual state of the input.
   * @default "default"
   */
  state = input<InputState>("default");

  /**
   * Size variant of the select.
   * @default "default"
   */
  size = input<SelectInputSize>("default");

  /**
   * Whether to show a clear button when a value is selected.
   * @default false
   */
  clearable = input<boolean>(false);

  /**
   * Element reference used to determine dropdown width.
   * When null, dropdown width matches the host element.
   */
  dropdownWidthRef = input<ElementRef | null>();

  /**
   * Which edge of the trigger the dropdown is anchored to. Use `"end"` when the
   * select sits against the right edge of its container so the panel expands
   * inward instead of overflowing.
   * @default "start"
   */
  dropdownAlign = input<"start" | "end">("start");

  /**
   * Configuration for the feedback text displayed below the select.
   */
  feedbackText = input<ComponentInputs<FeedbackTextComponent>>();

  /**
   * Array of options to display in the dropdown.
   * Can be an array of objects or primitive values.
   * @default []
   */
  options = input<T[]>([]);

  /**
   * Property name to use as the display label for object items.
   * @default "label"
   */
  bindLabel = input<string>("label");

  /**
   * Property name to use as the value for object items.
   * When undefined, the entire object is used as the value.
   */
  bindValue = input<string | undefined>(undefined);

  /**
   * Whether multiple items can be selected.
   * @default false
   */
  allowMultiple = input<boolean>(false);

  /**
   * Property name or function used to group options.
   * When a string, uses that property from the item.
   * When a function, calls it with each item to determine the group.
   */
  groupBy = input<string | GroupByFn<T> | undefined>(undefined);

  /**
   * Whether to show a "Select All" option in multiselect mode.
   * @default false
   */
  showSelectAll = input<boolean>(false);

  /**
   * Whether group headers are selectable in multiselect mode.
   * Clicking a group header selects/deselects all options in that group.
   * @default false
   */
  selectableGroups = input<boolean>(false);

  /**
   * Whether selected tags are individually removable in multiselect mode.
   * @default false
   */
  isTagRemovable = input<boolean>(false);

  /**
   * Whether selected tags wrap to multiple rows in multiselect mode.
   * When false, overflow tags are hidden and a counter is shown.
   * @default false
   */
  multiRow = input<boolean>(false);

  /**
   * Which end a selected tag's label truncates from when it doesn't fit.
   * `false` (default) never truncates; `end` → `label…`; `start` → `…label`.
   * @default false
   */
  tagEllipsis = input<TagEllipsis>(false);

  /**
   * Which end the single selected value truncates from when it doesn't fit.
   * The full value is revealed in a tooltip on hover/focus. `false` (default)
   * never truncates. Applies to single-select mode; multiselect tags use
   * `tagEllipsis`.
   * @default false
   */
  ellipsis = input<EllipsisPosition | false>(false);

  /**
   * Function used to compare option values for equality.
   * Used to determine which options are selected.
   * @default (a, b) => a === b
   */
  compareWith = input<CompareWithFn>(defaultCompareWith);

  /**
   * Property name to check for disabled state on items.
   * @default "disabled"
   */
  disabledKey = input<string>("disabled");

  /**
   * Text displayed when no options match the search term.
   */
  noOptionsMessage = input<string>();

  /**
   * Maximum height of the dropdown menu in pixels.
   * When not set, the dropdown height is calculated based on available viewport space.
   */
  maxDropdownHeight = input<number | undefined>();

  /**
   * Does the dropdown close when the page scrolls?
   * @default false
   */
  hideOnScroll = input(false);

  /**
   * Layout type for the dropdown options.
   * - `"menu"` (default): vertical list of options.
   * - `"grid"`: swatch grid layout for use with custom option templates
   *   (e.g. color or icon pickers). Customizable via `--tedi-swatch-size`,
   *   `--tedi-swatch-gap`, and `--tedi-swatch-columns` CSS properties.
   * @default "menu"
   */
  dropdownType = input<'menu' | 'grid'>('menu');

  /**
   * Renders options with virtual scrolling so only the rows in view exist in the
   * DOM. Enable for very large option lists (hundreds or more) to keep opening
   * and scrolling fast. Takes effect only for the default `menu` dropdown type
   * without `groupBy`; grid and grouped lists fall back to full rendering.
   * @default false
   */
  virtualScroll = input<boolean>(false);

  /**
   * Row height in pixels used by the virtual scroll viewport. Only relevant when
   * `virtualScroll` is enabled. When not set, the height is measured from the
   * first rendered option, which covers taller custom option templates.
   */
  virtualItemSize = input<number | undefined>();

  /**
   * Whether the select has a search input for filtering options.
   * @default false
   */
  searchable = input<boolean>(false);

  /**
   * Custom search function for filtering options.
   * When provided, overrides the default label-based search.
   * Receives the search term and the option item (with all original properties), returns true to include the option.
   */
  searchFn = input<((term: string, item: T) => boolean) | undefined>();

  /**
   * Whether to clear the search input after an option is selected.
   * Only has a visible effect in multi-select mode — in single-select mode
   * the dropdown closes on selection, which already clears the search term.
   * @default false
   */
  clearSearchOnSelect = input<boolean>(false);

  /**
   * Emits whenever the selection changes from any source: option click,
   * tag removal, clear button, select-all, or group toggle.
   * Payload is the array of selected values in multi-select mode, or the
   * single selected value (or `null`) in single-select mode.
   */
  readonly selectionChange = output<T | T[] | null>();

  /**
   * Emits the current search term whenever the user types in the search input.
   * Only fires when `searchable` is `true`.
   */
  readonly searchChange = output<string>();

  /**
   * Emits when the dropdown panel opens.
   */
  readonly opened = output<void>();

  /**
   * Emits when the dropdown panel closes.
   */
  readonly closed = output<void>();

  /**
   * Emits when the user clicks the clear button.
   * Fires alongside `selectionChange`, which carries the new (empty) value.
   */
  readonly cleared = output<void>();

  readonly SpecialOptionControls = SpecialOptionControls;

  readonly dropdownPositions = computed<ConnectedPosition[]>(() => {
    const x = this.dropdownAlign();
    return [
      // Open below, expand downward
      { originX: x, originY: "bottom", overlayX: x, overlayY: "top" },
      // Fallback: open above, expand upward
      { originX: x, originY: "top", overlayX: x, overlayY: "bottom" },
    ];
  });

  listboxId = computed(() => this.inputId() + "-listbox");
  labelId = computed(() => this.inputId() + "-label");

  /**
   * The id(s) to expose via `aria-labelledby`: the built-in label takes
   * precedence, falling back to a consumer-provided external label id.
   */
  resolvedAriaLabelledby = computed(() =>
    this.label() ? this.labelId() : (this.ariaLabelledby() ?? null)
  );

  /** `aria-label` is only used when no labelledby reference is available. */
  resolvedAriaLabel = computed(() =>
    this.resolvedAriaLabelledby() ? null : (this.ariaLabel() ?? null)
  );

  isOpen = signal(false);
  selectedValues = signal<unknown[]>([]);
  disabled = signal(false);
  dropdownWidth = signal<number | null>(null);
  dropdownMaxHeight = signal<number | null>(null);
  visibleTagsCount = signal<number | null>(null);
  searchTerm = signal<string>("");
  searchFocused = signal<boolean>(false);

  /** Index into `virtualRows()` of the keyboard-active row (-1 when none). */
  activeIndex = signal<number>(-1);
  /** Measured row height for the virtual scroll viewport. */
  measuredRowHeight = signal<number | null>(null);

  private static readonly DEFAULT_ROW_HEIGHT = 40;
  private static readonly SMALL_ROW_HEIGHT = 36;

  hiddenTagsCount = computed(() => {
    const visible = this.visibleTagsCount();
    const total = this.selectedValues().length;
    if (visible === null || visible >= total) return 0;
    return total - visible;
  });

  /**
   * Whether the default identity comparator is in use. When true, selection and
   * item lookups can use O(1) Set/Map paths instead of O(n) scans with the
   * user-supplied comparator. See issue #552.
   */
  private readonly usesDefaultCompare = computed(
    () => this.compareWith() === defaultCompareWith
  );

  /** O(1) membership set of selected values for the identity-comparison path. */
  private readonly selectedValueSet = computed(() => new Set(this.selectedValues()));

  /** value → normalized option, for O(1) label lookups. */
  private readonly optionByValue = computed(() => {
    const map = new Map<unknown, SelectOption<T>>();
    for (const option of this.normalizedOptions()) {
      if (!map.has(option.value)) map.set(option.value, option);
    }
    return map;
  });

  /** value → original item, for O(1) custom-template context lookups. */
  private readonly itemByValue = computed(() => {
    const map = new Map<unknown, T>();
    const bindValue = this.bindValue();
    if (!bindValue) return map;
    for (const item of this.options()) {
      const value = (item as Record<string, unknown>)[bindValue];
      if (!map.has(value)) map.set(value, item);
    }
    return map;
  });

  listboxRef = viewChild(CdkListbox, { read: ElementRef });
  cdkListboxRef = viewChild(CdkListbox);
  viewport = viewChild(CdkVirtualScrollViewport);
  virtualListboxRef = viewChild<ElementRef>("virtualListbox");
  connectedOverlay = viewChild(CdkConnectedOverlay);
  triggerRef = viewChild("trigger", { read: ElementRef });
  searchInputRef = viewChild<ElementRef>("searchInput");
  multiselectContainerRef = viewChild<ElementRef>("multiselectContainer");
  tagRefs = viewChildren("tagElement", { read: ElementRef });
  hostRef = inject(ElementRef);
  private ngZone = inject(NgZone);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);
  private scrollListener?: () => void;

  // Template queries for custom rendering
  optionTemplate = contentChild(SelectOptionTemplateDirective);
  valueTemplate = contentChild(SelectValueTemplateDirective);
  tooltipTemplate = contentChild(SelectTooltipTemplateDirective);

  normalizedOptions = computed<SelectOption<T>[]>(() => {
    const items = this.options();
    if (!items || items.length === 0) return [];

    return items.map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return {
          value: item as unknown,
          label: String(item),
          disabled: false,
          group: undefined,
        } as SelectOption<T>;
      }

      const itemRecord = item as Record<string, unknown>;
      const bindLabel = this.bindLabel();
      const bindValue = this.bindValue();
      const disabledKey = this.disabledKey();
      const groupBy = this.groupBy();

      const label = String(itemRecord[bindLabel] ?? item);
      const value = bindValue ? itemRecord[bindValue] : item;
      const disabled = !!itemRecord[disabledKey];
      let group: string | undefined;

      if (typeof groupBy === "string") {
        group = itemRecord[groupBy] as string | undefined;
      } else if (typeof groupBy === "function") {
        group = groupBy(item);
      }

      return { ...itemRecord, value, label, disabled, group } as SelectOption<T>;
    });
  });

  filteredOptions = computed<SelectOption<T>[]>(() => {
    const options = this.normalizedOptions();
    const trimmed = this.searchTerm().trim();

    if (!trimmed) {
      return options;
    }

    const term = trimmed.toLowerCase();
    const searchFn = this.searchFn();

    if (searchFn) {
      return options.filter((option) => searchFn(term, option as unknown as T));
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(term)
    );
  });

  optionGroups = computed<SelectOptionGroup<T>[]>(() => {
    const options = this.filteredOptions();
    const groups: SelectOptionGroup<T>[] = [];

    options.forEach((option) => {
      const groupLabel = option.group ?? "";
      const existingGroup = groups.find((g) => g.label === groupLabel);

      if (existingGroup) {
        existingGroup.options.push(option);
      } else {
        groups.push({ label: groupLabel, options: [option] });
      }
    });

    return groups;
  });

  selectedOptions = computed<SelectOption<T>[]>(() => {
    const values = this.selectedValues();
    const options = this.normalizedOptions();

    if (this.usesDefaultCompare()) {
      const set = this.selectedValueSet();
      return options.filter((option) => set.has(option.value));
    }

    const compareWith = this.compareWith();
    return options.filter((option) =>
      values.some((val) => compareWith(option.value, val))
    );
  });

  visibleSelectedValues = computed<unknown[]>(() => {
    const selected = this.selectedValues();
    const filtered = this.filteredOptions();

    if (this.usesDefaultCompare()) {
      const filteredSet = new Set<unknown>(filtered.map((opt) => opt.value));
      return selected.filter((val) => filteredSet.has(val));
    }

    const compareWith = this.compareWith();
    return selected.filter((val) =>
      filtered.some((opt) => compareWith(opt.value, val))
    );
  });

  selectedLabels = computed<string[]>(() => {
    return this.selectedOptions().map((option) => option.label);
  });

  showSingleSelectedValue = computed<boolean>(() => {
    return !this.searchTerm() && !!this.selectedValues().length && !this.allowMultiple();
  });

  allOptionsSelected = computed<boolean>(() => {
    const options = this.searchTerm().trim()
      ? this.filteredOptions()
      : this.normalizedOptions();
    const enabledOptions = options.filter((o) => !o.disabled);
    if (enabledOptions.length === 0) return false;

    if (this.usesDefaultCompare()) {
      const set = this.selectedValueSet();
      return enabledOptions.every((option) => set.has(option.value));
    }

    const selected = this.selectedValues();
    const compareWith = this.compareWith();
    return enabledOptions.every((option) =>
      selected.some((val) => compareWith(option.value, val))
    );
  });

  someOptionsSelected = computed<boolean>(() => {
    const options = this.searchTerm().trim()
      ? this.filteredOptions()
      : this.normalizedOptions();
    const enabledOptions = options.filter((o) => !o.disabled);
    if (enabledOptions.length === 0) return false;

    let selectedCount: number;
    if (this.usesDefaultCompare()) {
      const set = this.selectedValueSet();
      selectedCount = enabledOptions.filter((option) => set.has(option.value)).length;
    } else {
      const selected = this.selectedValues();
      const compareWith = this.compareWith();
      selectedCount = enabledOptions.filter((option) =>
        selected.some((val) => compareWith(option.value, val))
      ).length;
    }

    return selectedCount > 0 && selectedCount < enabledOptions.length;
  });

  /** Whether virtual scrolling is active: opt-in, flat `menu` lists only. */
  readonly virtualize = computed(
    () =>
      this.virtualScroll() &&
      this.dropdownType() === "menu" &&
      !this.groupBy()
  );

  /** Whether the pinned select-all row is shown above the virtual viewport. */
  readonly showSelectAllRow = computed(
    () => this.allowMultiple() && this.showSelectAll()
  );

  /** Ordered navigable rows for the virtual listbox (pinned select-all + options). */
  readonly virtualRows = computed<VirtualRow<T>[]>(() => {
    const rows: VirtualRow<T>[] = [];
    const options = this.filteredOptions();
    // Mirror the template: the select-all row is only rendered when at least
    // one option is visible, so it must not appear in the navigable row model
    // when the filtered list is empty.
    if (this.showSelectAllRow() && options.length) rows.push({ kind: "select-all" });
    for (const option of options) {
      rows.push({ kind: "option", option });
    }
    return rows;
  });

  /** Effective row height for the viewport: explicit input, measured, or size default. */
  readonly virtualRowHeight = computed(() => {
    const explicit = this.virtualItemSize();
    if (explicit != null) return explicit;
    const measured = this.measuredRowHeight();
    if (measured != null) return measured;
    return this.size() === "small"
      ? SelectComponent.SMALL_ROW_HEIGHT
      : SelectComponent.DEFAULT_ROW_HEIGHT;
  });

  /** Height of the scrolling viewport: content-sized, capped at available space. */
  readonly virtualViewportHeight = computed(() => {
    const rowHeight = this.virtualRowHeight();
    const contentHeight = this.filteredOptions().length * rowHeight;
    const selectAllHeight = this.showSelectAllRow() ? rowHeight : 0;
    const available = (this.dropdownMaxHeight() ?? rowHeight * 10) - selectAllHeight;
    return Math.max(rowHeight, Math.min(contentHeight, available));
  });

  trackByOptionValue = (_: number, option: SelectOption<T>): unknown => option.value;

  /** id of the active row, exposed via aria-activedescendant on the listbox. */
  readonly activeDescendantId = computed<string | null>(() => {
    const rows = this.virtualRows();
    const index = this.activeIndex();
    const row = rows[index];
    if (!row) return null;
    if (row.kind === "select-all") return this.listboxId() + "-select-all";
    return this.virtualOptionId(index - (this.showSelectAllRow() ? 1 : 0));
  });

  ngAfterContentChecked(): void {
    this.setDropdownWidth();
  }

  ngAfterViewChecked(): void {
    if (this.allowMultiple() && !this.multiRow()) {
      this.calculateVisibleTags();
    }
    if (this.isOpen()) {
      this.connectedOverlay()?.overlayRef?.updatePosition();
    }
  }

  @HostListener("window:resize")
  onWindowResize(): void {
    this.setDropdownWidth();
    if (this.allowMultiple() && !this.multiRow()) {
      this.visibleTagsCount.set(null);
    }
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;

    const target = event.target as HTMLElement;
    const hostElement = this.hostRef.nativeElement;
    const listboxElement = this.listboxRef()?.nativeElement;
    const overlayElement = this.connectedOverlay()?.overlayRef?.overlayElement;

    const clickedInside =
      hostElement.contains(target) ||
      listboxElement?.contains(target) ||
      overlayElement?.contains(target);

    if (!clickedInside) {
      this.closeDropdown();
    }
  }

  focusListboxWhenVisible = effect(() => {
    if (!this.isOpen()) return;
    if (this.searchable()) {
      this.searchInputRef()?.nativeElement.focus();
    } else if (this.virtualize()) {
      this.virtualListboxRef()?.nativeElement.focus();
    } else {
      this.listboxRef()?.nativeElement.focus();
    }
  });

  /**
   * Make an external label clickable to behave like the built-in one: clicking the
   * element referenced via `ariaLabelledby` opens the dropdown. Skipped
   * when the built-in `label` is used.
   */
  bindExternalLabelClick = effect((onCleanup) => {
    const ids = this.ariaLabelledby();
    if (this.label() || !ids) return;

    // `aria-labelledby` is a space-separated IDREF list, so resolve each id.
    const labelEls = ids
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (labelEls.length === 0) return;

    const open = (event: Event) => {
      event.stopPropagation();
      this.onTriggerClick();
    };
    labelEls.forEach((el) => el.addEventListener("click", open));
    onCleanup(() =>
      labelEls.forEach((el) => el.removeEventListener("click", open))
    );
  });

  constructor() {
    /**
     * Workaround: Prevent CDK from resetting active item to the first selected
     * option whenever [cdkListboxValue] changes in multiselect mode. CDK calls
     * _setNextFocusToSelectedOption inside _setSelection, which moves focus
     * away from the user's current position after each selection toggle.
     * Tested against @angular/cdk 19. Revisit when CDK exposes a public API
     * to control this behavior.
     */
    effect(() => {
      const listbox = this.cdkListboxRef();
      if (listbox && this.allowMultiple()) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (listbox as any)._setNextFocusToSelectedOption = () => { };
      }
    });

    inject(DestroyRef).onDestroy(() => this.cleanupScrollListener());
  }

  resetVisibleTagsOnSelectionChange = effect(() => {
    this.selectedValues();
    this.visibleTagsCount.set(null);
  });

  toggleIsOpen(close?: boolean): void {
    if (this.disabled() && !close) return;

    if (close) {
      this.closeDropdown();
      this.focusTrigger();
    } else {
      const willOpen = !this.isOpen();
      if (willOpen) {
        this.openDropdown();
      } else {
        this.closeDropdown();
      }
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.searchChange.emit(input.value);

    if (!this.isOpen()) {
      this.openDropdown();
    }

    if (this.virtualize()) {
      this.initVirtualActive();
    }
  }

  onSearchFocus(): void {
    this.searchFocused.set(true);
  }

  onSearchBlur(): void {
    this.searchFocused.set(false);
    this.onTouched();
  }

  onTriggerClick(): void {
    if (this.disabled()) return;

    if (this.searchable()) {
      this.searchInputRef()?.nativeElement.focus();
      if (!this.isOpen()) {
        this.openDropdown();
      }
    } else {
      this.toggleIsOpen();
    }
  }

  onArrowClick(event: Event): void {
    event.stopPropagation();
    this.toggleIsOpen();
  }

  onTriggerEnter(): void {
    if (!this.isOpen()) {
      this.openDropdown();
    }
  }

  onSearchKeydown(event: KeyboardEvent): void {
    event.stopPropagation();

    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "Home":
      case "End":
        event.preventDefault();
        this.navigateOrOpen(event.key);
        break;
      case "Enter":
        event.preventDefault();
        this.confirmActiveOrOpen();
        break;
      case " ":
        if (!this.isOpen()) {
          event.preventDefault();
          this.openDropdown();
        }
        break;
      case "Escape":
      case "Tab":
        if (this.isOpen()) {
          this.closeDropdown();
        }
        break;
    }
  }

  /** Navigate the open list (virtual or CDK), or open the dropdown when closed. */
  private navigateOrOpen(key: string): void {
    if (!this.isOpen()) {
      this.openDropdown();
      return;
    }
    if (this.virtualize()) {
      this.handleVirtualNavKey(key);
    } else {
      this.forwardToCdkListbox(key);
    }
  }

  /** Activate the active option (virtual or CDK), or open the dropdown when closed. */
  private confirmActiveOrOpen(): void {
    if (!this.isOpen()) {
      this.openDropdown();
      return;
    }
    if (this.virtualize()) {
      this.activateActiveRow();
    } else {
      this.forwardToCdkListbox("Enter");
    }
  }

  private static readonly KEY_CODES: Record<string, number> = {
    ArrowDown: 40,
    ArrowUp: 38,
    Home: 36,
    End: 35,
    Enter: 13,
    " ": 32,
  };

  private forwardToCdkListbox(key: string): void {
    const listbox = this.cdkListboxRef();
    if (listbox) {
      const keyCode = SelectComponent.KEY_CODES[key] ?? 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (listbox as any)._handleKeydown(new KeyboardEvent("keydown", { key, keyCode, bubbles: true }));
    }
  }

  // ---- Virtual scroll listbox (opt-in, replaces cdkListbox for flat menus) ----

  virtualOptionId(index: number): string {
    return this.listboxId() + "-option-" + index;
  }

  /** Keyboard handler for the non-searchable virtual listbox element. */
  onVirtualListboxKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
      case "Home":
      case "End":
        event.preventDefault();
        this.handleVirtualNavKey(event.key);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        this.activateActiveRow();
        break;
      case "Escape":
      case "Tab":
        this.toggleIsOpen(true);
        break;
    }
  }

  private handleVirtualNavKey(key: string): void {
    switch (key) {
      case "ArrowDown":
        this.moveActive(1);
        break;
      case "ArrowUp":
        this.moveActive(-1);
        break;
      case "Home":
        this.moveActiveToEdge("first");
        break;
      case "End":
        this.moveActiveToEdge("last");
        break;
    }
  }

  private moveActive(delta: 1 | -1): void {
    const rows = this.virtualRows();
    const n = rows.length;
    if (n === 0) {
      this.activeIndex.set(-1);
      return;
    }
    let i = this.activeIndex();
    for (let step = 0; step < n; step++) {
      i = i < 0 ? (delta > 0 ? 0 : n - 1) : (i + delta + n) % n;
      if (this.isRowNavigable(rows[i])) {
        this.setActiveIndex(i);
        return;
      }
    }
    this.activeIndex.set(-1);
  }

  private moveActiveToEdge(edge: "first" | "last"): void {
    const rows = this.virtualRows();
    const n = rows.length;
    for (let step = 0; step < n; step++) {
      const i = edge === "first" ? step : n - 1 - step;
      if (this.isRowNavigable(rows[i])) {
        this.setActiveIndex(i);
        return;
      }
    }
    this.activeIndex.set(-1);
  }

  private isRowNavigable(row: VirtualRow<T> | undefined): boolean {
    if (!row) return false;
    if (row.kind === "select-all") return true;
    return !row.option.disabled;
  }

  private setActiveIndex(index: number): void {
    this.activeIndex.set(index);
    this.scrollActiveIntoView();
  }

  private scrollActiveIntoView(): void {
    const index = this.activeIndex();
    const row = this.virtualRows()[index];
    if (row?.kind === "option") {
      const optionIndex = index - (this.showSelectAllRow() ? 1 : 0);
      this.viewport()?.scrollToIndex(optionIndex);
    }
  }

  /**
   * Scroll the initially-active option into view once the overlay has attached.
   * Driven by the overlay's `(attach)` event because the virtual viewport (a
   * viewChild inside the overlay portal) only resolves after attachment.
   *
   * The scroll is deferred one macrotask: at attach time the CDK viewport has not
   * yet established its scrollable content size, so `scrollToIndex` would clamp to
   * 0. By the next macrotask the content size is set and the measured row height
   * (for taller custom templates) has been applied to `itemSize`.
   */
  onOverlayAttached(): void {
    if (!this.virtualize()) return;
    setTimeout(() => {
      this.measureVirtualRowHeight();
      this.viewport()?.checkViewportSize();
      this.scrollActiveIntoView();
    });
  }

  /** Set the active row on open: the first selected option, else the first navigable row. */
  private initVirtualActive(): void {
    const rows = this.virtualRows();
    const selectedIndex = rows.findIndex(
      (row) =>
        row.kind === "option" &&
        !row.option.disabled &&
        this.isOptionSelected(row.option.value)
    );
    this.activeIndex.set(
      selectedIndex >= 0
        ? selectedIndex
        : rows.findIndex((row) => this.isRowNavigable(row))
    );
  }

  activateActiveRow(): void {
    const row = this.virtualRows()[this.activeIndex()];
    if (row) this.activateRow(row);
  }

  private activateRow(row: VirtualRow<T>): void {
    if (row.kind === "select-all") {
      this.toggleSelectAll();
      this.onTouched();
      return;
    }
    if (row.option.disabled) return;
    if (this.allowMultiple()) {
      this.toggleOptionValue(row.option.value);
    } else {
      this.selectSingleValue(row.option.value);
    }
  }

  onVirtualOptionClick(option: SelectOption<T>): void {
    if (this.disabled() || option.disabled) return;
    if (this.allowMultiple()) {
      this.toggleOptionValue(option.value);
      // Selection may clear the search and rebuild the rows, so re-resolve the
      // active index against the current rows to keep the clicked option (not a
      // stale row) as the target of a subsequent Enter/Space.
      this.syncActiveToOptionValue(option.value);
    } else {
      this.selectSingleValue(option.value);
    }
  }

  private syncActiveToOptionValue(value: unknown): void {
    const compareWith = this.compareWith();
    const index = this.virtualRows().findIndex(
      (row) => row.kind === "option" && compareWith(row.option.value, value)
    );
    if (index >= 0) this.setActiveIndex(index);
  }

  onVirtualSelectAllClick(): void {
    if (this.disabled()) return;
    this.toggleSelectAll();
    this.onTouched();
  }

  private toggleOptionValue(value: unknown): void {
    const compareWith = this.compareWith();
    const selected = this.selectedValues();
    const isSelected = selected.some((v) => compareWith(v, value));
    const newSelection = isSelected
      ? selected.filter((v) => !compareWith(v, value))
      : [...selected, value];

    this.selectedValues.set(newSelection);
    this.onChange(newSelection);
    this.selectionChange.emit(newSelection as T[]);
    if (this.clearSearchOnSelect()) this.searchTerm.set("");
    if (this.searchable()) this.searchInputRef()?.nativeElement.focus();
    this.onTouched();
  }

  private selectSingleValue(value: unknown): void {
    this.selectedValues.set([value]);
    this.onChange(value);
    this.selectionChange.emit(value as T);
    if (this.clearSearchOnSelect()) this.searchTerm.set("");
    this.toggleIsOpen(true);
    this.onTouched();
  }

  private measureVirtualRowHeight(): void {
    if (this.virtualItemSize() != null) return;
    const viewportEl = this.viewport()?.elementRef.nativeElement;
    const row = viewportEl?.querySelector<HTMLElement>(".tedi-dropdown-item");
    const height = row?.offsetHeight;
    if (height && height !== this.measuredRowHeight()) {
      this.measuredRowHeight.set(height);
    }
  }

  private openDropdown(): void {
    if (this.isOpen()) return;
    this.calculateDropdownMaxHeight();
    this.isOpen.set(true);
    if (this.virtualize()) {
      this.initVirtualActive();
    }
    if (this.hideOnScroll()) {
      this.setupScrollListener();
    }
    this.opened.emit();
  }

  private calculateDropdownMaxHeight(): void {
    const inputMaxHeight = this.maxDropdownHeight();

    if (inputMaxHeight != null) {
      this.dropdownMaxHeight.set(inputMaxHeight);
      return;
    }

    const trigger = this.triggerRef()?.nativeElement;
    if (!trigger) {
      this.dropdownMaxHeight.set(null);
      return;
    }

    const triggerRect = trigger.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const margin = 16; // Margin from viewport edges

    // Calculate space below and above the trigger
    const spaceBelow = viewportHeight - triggerRect.bottom - margin;
    const spaceAbove = triggerRect.top - margin;

    // Use the larger available space
    const maxHeight = Math.max(spaceBelow, spaceAbove);

    this.dropdownMaxHeight.set(maxHeight);
  }

  private closeDropdown(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.searchTerm.set("");
    this.dropdownMaxHeight.set(null);
    this.activeIndex.set(-1);
    this.cleanupScrollListener();
    this.closed.emit();
  }

  private setupScrollListener(): void {
    this.cleanupScrollListener();

    this.scrollListener = this.renderer.listen(
      this.document,
      "scroll",
      (event: Event) => {
        if (!this.isOpen()) return;

        // Scrolling inside the select is not the page moving away from it: the
        // option list scrolls its own items, and a search input whose text no
        // longer fits scrolls its own content.
        const target = event.target as Node | null;
        const overlayEl = this.connectedOverlay()?.overlayRef?.overlayElement;
        const insideSelect =
          !!target &&
          (this.hostRef.nativeElement.contains(target) || !!overlayEl?.contains(target));
        if (insideSelect) return;

        this.closeDropdown();
      },
      { capture: true, passive: true },
    );
  }

  private cleanupScrollListener(): void {
    if (this.scrollListener) {
      this.scrollListener();
      this.scrollListener = undefined;
    }
  }

  handleValueChange(event: { value: readonly unknown[] }): void {
    const values = event.value;

    const selectAllIndex = values.findIndex(
      (v) => v === SpecialOptionControls.SELECT_ALL
    );
    const selectGroupValue = values.find(
      (v) =>
        typeof v === "string" &&
        v.startsWith(SpecialOptionControls.SELECT_GROUP)
    );

    if (selectAllIndex !== -1) {
      this.toggleSelectAll();
      this.onTouched();
      return;
    }

    if (selectGroupValue) {
      const groupLabel = (selectGroupValue as string).replace(
        SpecialOptionControls.SELECT_GROUP,
        ""
      );
      this.toggleGroupSelection(groupLabel);
      this.onTouched();
      return;
    }

    if (this.allowMultiple()) {
      let newSelection: unknown[];
      if (this.searchable() && this.searchTerm().trim()) {
        const filtered = this.filteredOptions();
        const compareWith = this.compareWith();
        const hiddenSelected = this.selectedValues().filter(
          (val) => !filtered.some((opt) => compareWith(opt.value, val))
        );
        newSelection = [...hiddenSelected, ...values];
      } else {
        newSelection = [...values];
      }
      this.selectedValues.set(newSelection);
      this.onChange(newSelection);
      this.selectionChange.emit(newSelection as T[]);
      if (this.clearSearchOnSelect()) {
        this.searchTerm.set("");
      }
      if (this.searchable()) {
        this.searchInputRef()?.nativeElement.focus();
      }
    } else {
      const selected = values[0] ?? null;
      this.selectedValues.set(selected != null ? [selected] : []);
      this.onChange(selected);
      this.selectionChange.emit(selected as T | null);
      if (this.clearSearchOnSelect()) {
        this.searchTerm.set("");
      }
      this.toggleIsOpen(true);
    }

    this.onTouched();
  }

  clear(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.selectedValues.set([]);
    if (this.allowMultiple()) {
      this.onChange([]);
      this.selectionChange.emit([] as T[]);
    } else {
      this.onChange(null);
      this.selectionChange.emit(null);
    }
    this.cleared.emit();
    this.onTouched();
    this.focusTrigger();
  }

  deselect(event: Event, value: unknown): void {
    event.stopPropagation();
    event.preventDefault();

    if (this.disabled()) return;

    const compareWith = this.compareWith();
    const newSelection = this.selectedValues().filter(
      (v) => !compareWith(v, value)
    );

    this.selectedValues.set(newSelection);
    this.onChange(newSelection);
    this.selectionChange.emit(newSelection as T[]);
    this.onTouched();
  }

  isOptionSelected(optionValue: unknown): boolean {
    if (this.usesDefaultCompare()) {
      return this.selectedValueSet().has(optionValue);
    }
    const compareWith = this.compareWith();
    return this.selectedValues().some((val) => compareWith(val, optionValue));
  }

  getLabel(value: unknown): string {
    if (this.usesDefaultCompare()) {
      return this.optionByValue().get(value)?.label ?? String(value);
    }
    const compareWith = this.compareWith();
    const option = this.normalizedOptions().find((o) =>
      compareWith(o.value, value)
    );
    return option?.label ?? String(value);
  }

  /**
   * Get the original item from the items array for a given option.
   * Used for custom templates that need access to the full item data.
   */
  getOriginalItem(option: SelectOption<T>): T {
    const bindValue = this.bindValue();

    if (!bindValue) {
      return option.value as T;
    }

    if (this.usesDefaultCompare()) {
      return this.itemByValue().get(option.value) ?? (option as unknown as T);
    }

    // Find the original item by matching the value
    const compareWith = this.compareWith();
    const found = this.options().find((item) => {
      const itemRecord = item as Record<string, unknown>;
      return compareWith(itemRecord[bindValue], option.value);
    });

    return found ?? (option as unknown as T);
  }

  /** Create context object for custom option templates. */
  getOptionContext(option: SelectOption<T>, index: number): SelectOptionContext<T> {
    const item = this.getOriginalItem(option);
    return {
      $implicit: item,
      item,
      index,
      selected: this.isOptionSelected(option.value),
      disabled: option.disabled ?? false,
    };
  }

  /** Create context object for custom value templates. */
  getValueContext(option: SelectOption<T>): SelectValueContext<T> {
    const item = this.getOriginalItem(option);
    return { $implicit: item, item, label: option.label };
  }

  isGroupSelected(groupLabel: string): boolean {
    const group = this.optionGroups().find((g) => g.label === groupLabel);
    if (!group) return false;

    const enabledGroupOptions = group.options.filter((o) => !o.disabled);
    if (enabledGroupOptions.length === 0) return false;

    const compareWith = this.compareWith();
    const selected = this.selectedValues();

    return enabledGroupOptions.every((option) =>
      selected.some((val) => compareWith(option.value, val))
    );
  }

  isGroupIndeterminate(groupLabel: string): boolean {
    const group = this.optionGroups().find((g) => g.label === groupLabel);
    if (!group) return false;

    const enabledGroupOptions = group.options.filter((o) => !o.disabled);
    if (enabledGroupOptions.length === 0) return false;

    const compareWith = this.compareWith();
    const selected = this.selectedValues();

    const selectedCount = enabledGroupOptions.filter((option) =>
      selected.some((val) => compareWith(option.value, val))
    ).length;

    return selectedCount > 0 && selectedCount < enabledGroupOptions.length;
  }

  private focusTrigger(): void {
    if (this.searchable()) {
      this.searchInputRef()?.nativeElement.focus();
    } else {
      this.triggerRef()?.nativeElement.focus();
    }
  }

  private getAvailableTagWidth(): number {
    const trigger = this.triggerRef()?.nativeElement;
    if (!trigger) return 0;

    const triggerWidth = trigger.clientWidth;
    if (triggerWidth === 0) return 0;

    const triggerStyle = getComputedStyle(trigger);
    const padding = (parseFloat(triggerStyle.paddingLeft) || 0) + (parseFloat(triggerStyle.paddingRight) || 0);

    let nonTagWidth = 0;
    const arrow: HTMLElement | null = trigger.querySelector(".tedi-select__arrow");
    const clear: HTMLElement | null = trigger.querySelector(".tedi-select__clear");
    const searchInput: HTMLElement | null = trigger.querySelector(".tedi-select__search-input");
    if (arrow) nonTagWidth += arrow.offsetWidth + (parseFloat(getComputedStyle(arrow).marginLeft) || 0) + (parseFloat(getComputedStyle(arrow).paddingLeft) || 0);
    if (clear) nonTagWidth += clear.offsetWidth;
    if (searchInput) nonTagWidth += parseFloat(getComputedStyle(searchInput).flexBasis) || 0;

    return triggerWidth - padding - nonTagWidth;
  }

  private calculateVisibleTags(): void {
    const tags = this.tagRefs();
    if (tags.length === 0 || this.visibleTagsCount() !== null) return;

    const availableWidth = this.getAvailableTagWidth();
    if (availableWidth <= 0) return;

    const widths = tags.map((tag) => tag.nativeElement.offsetWidth);
    const visibleCount = calculateVisibleTagCount(widths, availableWidth);

    this.ngZone.run(() => {
      this.visibleTagsCount.set(visibleCount);
    });
  }

  private setDropdownWidth(): void {
    const widthRef = this.dropdownWidthRef();
    if (widthRef === null) {
      this.dropdownWidth.set(null);
      return;
    }

    const element = widthRef?.nativeElement ?? this.hostRef?.nativeElement;
    const computedWidth = element?.getBoundingClientRect()?.width ?? 0;
    this.dropdownWidth.set(computedWidth);
  }

  private toggleSelectAll(): void {
    const isSearching = !!this.searchTerm().trim();
    const options = isSearching
      ? this.filteredOptions()
      : this.normalizedOptions();
    const enabledOptions = options.filter((o) => !o.disabled);
    const deselecting = this.allOptionsSelected();

    let newSelection: unknown[];
    if (this.usesDefaultCompare()) {
      // Identity comparison lets bulk operations stay linear in the row count.
      if (deselecting) {
        const enabledSet = new Set<unknown>(enabledOptions.map((o) => o.value));
        newSelection = this.selectedValues().filter((val) => !enabledSet.has(val));
      } else {
        const seen = new Set<unknown>(this.selectedValues());
        newSelection = [...this.selectedValues()];
        for (const option of enabledOptions) {
          if (!seen.has(option.value)) {
            seen.add(option.value);
            newSelection.push(option.value);
          }
        }
      }
    } else {
      const compareWith = this.compareWith();
      if (deselecting) {
        // Deselect: remove only the visible enabled options, keep the rest
        newSelection = this.selectedValues().filter(
          (val) => !enabledOptions.some((o) => compareWith(val, o.value))
        );
      } else {
        // Select: add visible enabled options to current selection
        newSelection = [...this.selectedValues()];
        for (const option of enabledOptions) {
          if (!newSelection.some((val) => compareWith(val, option.value))) {
            newSelection.push(option.value);
          }
        }
      }
    }

    this.selectedValues.set(newSelection);
    this.onChange(newSelection);
    this.selectionChange.emit(newSelection as T[]);
  }

  private toggleGroupSelection(groupLabel: string): void {
    const group = this.optionGroups().find((g) => g.label === groupLabel);
    if (!group) return;

    const enabledGroupOptions = group.options.filter((o) => !o.disabled);
    const groupValues = enabledGroupOptions.map((o) => o.value);
    const isGroupSelected = this.isGroupSelected(groupLabel);
    const compareWith = this.compareWith();

    let newSelection: unknown[];

    if (isGroupSelected) {
      newSelection = this.selectedValues().filter(
        (val) => !groupValues.some((gv) => compareWith(val, gv))
      );
    } else {
      newSelection = [...this.selectedValues()];
      for (const gv of groupValues) {
        if (!newSelection.some((val) => compareWith(val, gv))) {
          newSelection.push(gv);
        }
      }
    }

    this.selectedValues.set(newSelection);
    this.onChange(newSelection);
    this.selectionChange.emit(newSelection as T[]);
  }

  onChange: (value: unknown) => void = () => { };
  onTouched: () => void = () => { };

  writeValue(value: unknown): void {
    if (this.allowMultiple()) {
      this.selectedValues.set(Array.isArray(value) ? value : []);
    } else {
      this.selectedValues.set(value != null ? [value] : []);
    }
  }

  registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
    if (isDisabled) {
      this.closeDropdown();
    }
  }
}
