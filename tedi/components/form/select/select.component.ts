import { CdkConnectedOverlay, ConnectedPosition, OverlayModule } from "@angular/cdk/overlay";
import { CdkListbox, CdkListboxModule } from "@angular/cdk/listbox";
import {
  AfterContentChecked,
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  NgZone,
  output,
  signal,
  viewChild,
  viewChildren,
  ViewEncapsulation,
  forwardRef,
  computed,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { IconComponent, TextComponent } from "../../base";
import { ClosingButtonComponent, InfoButtonComponent } from "../../buttons";
import { TooltipComponent } from "../../overlay/tooltip/tooltip.component";
import { TooltipTriggerComponent } from "../../overlay/tooltip/tooltip-trigger/tooltip-trigger.component";
import { TooltipContentComponent } from "../../overlay/tooltip/tooltip-content/tooltip-content.component";
import { TediTranslationPipe } from "../../../services";
import { ComponentInputs } from "../../../types";
import { calculateVisibleTagCount } from "../../../utils/tag-overflow.util";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { LabelComponent } from "../label/label.component";
import { TagComponent, TagEllipsis } from "../../tags/tag/tag.component";
import { DropdownItemValueComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value-label.component";
import {
  SelectOptionTemplateDirective,
  SelectValueTemplateDirective,
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

export type GroupByFn<T = unknown> = (item: T) => string | undefined;
export type CompareWithFn<T = unknown> = (a: T, b: T) => boolean;

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
    ClosingButtonComponent,
    InfoButtonComponent,
    TooltipComponent,
    TooltipTriggerComponent,
    TooltipContentComponent,
    IconComponent,
    LabelComponent,
    FeedbackTextComponent,
    TextComponent,
    TagComponent,
    TediTranslationPipe,
    DropdownItemValueComponent,
    DropdownItemValueLabelComponent,
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
   * in a tooltip on hover/focus.
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
   * Function used to compare option values for equality.
   * Used to determine which options are selected.
   * @default (a, b) => a === b
   */
  compareWith = input<CompareWithFn>((a, b) => a === b);

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
   * Layout type for the dropdown options.
   * - `"menu"` (default): vertical list of options.
   * - `"grid"`: swatch grid layout for use with custom option templates
   *   (e.g. color or icon pickers). Customizable via `--tedi-swatch-size`,
   *   `--tedi-swatch-gap`, and `--tedi-swatch-columns` CSS properties.
   * @default "menu"
   */
  dropdownType = input<'menu' | 'grid'>('menu');

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

  hiddenTagsCount = computed(() => {
    const visible = this.visibleTagsCount();
    const total = this.selectedValues().length;
    if (visible === null || visible >= total) return 0;
    return total - visible;
  });

  listboxRef = viewChild(CdkListbox, { read: ElementRef });
  cdkListboxRef = viewChild(CdkListbox);
  connectedOverlay = viewChild(CdkConnectedOverlay);
  triggerRef = viewChild("trigger", { read: ElementRef });
  searchInputRef = viewChild<ElementRef>("searchInput");
  multiselectContainerRef = viewChild<ElementRef>("multiselectContainer");
  tagRefs = viewChildren("tagElement", { read: ElementRef });
  hostRef = inject(ElementRef);
  private ngZone = inject(NgZone);

  // Template queries for custom rendering
  optionTemplate = contentChild(SelectOptionTemplateDirective);
  valueTemplate = contentChild(SelectValueTemplateDirective);

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
    const compareWith = this.compareWith();

    return options.filter((option) =>
      values.some((val) => compareWith(option.value, val))
    );
  });

  visibleSelectedValues = computed<unknown[]>(() => {
    const selected = this.selectedValues();
    const filtered = this.filteredOptions();
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
    const selected = this.selectedValues();
    const compareWith = this.compareWith();

    return (
      enabledOptions.length > 0 &&
      enabledOptions.every((option) =>
        selected.some((val) => compareWith(option.value, val))
      )
    );
  });

  someOptionsSelected = computed<boolean>(() => {
    const options = this.searchTerm().trim()
      ? this.filteredOptions()
      : this.normalizedOptions();
    const enabledOptions = options.filter((o) => !o.disabled);
    const selected = this.selectedValues();
    const compareWith = this.compareWith();

    const selectedCount = enabledOptions.filter((option) =>
      selected.some((val) => compareWith(option.value, val))
    ).length;

    return selectedCount > 0 && selectedCount < enabledOptions.length;
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

    const clickedInside = hostElement.contains(target) || listboxElement?.contains(target);

    if (!clickedInside) {
      this.closeDropdown();
    }
  }

  focusListboxWhenVisible = effect(() => {
    if (this.isOpen() && this.searchable() && this.searchInputRef()) {
      this.searchInputRef()?.nativeElement.focus();
    } else if (this.isOpen() && this.listboxRef() && !this.searchable()) {
      this.listboxRef()?.nativeElement.focus();
    }
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
        if (this.isOpen()) {
          this.forwardToCdkListbox(event.key);
        } else {
          this.openDropdown();
        }
        break;
      case "Enter":
        event.preventDefault();
        if (this.isOpen()) {
          this.forwardToCdkListbox(event.key);
        } else {
          this.openDropdown();
        }
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

  private openDropdown(): void {
    if (this.isOpen()) return;
    this.calculateDropdownMaxHeight();
    this.isOpen.set(true);
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
    this.closed.emit();
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
    const compareWith = this.compareWith();
    return this.selectedValues().some((val) => compareWith(val, optionValue));
  }

  getLabel(value: unknown): string {
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
    const compareWith = this.compareWith();
    const bindValue = this.bindValue();

    if (!bindValue) {
      return option.value as T;
    }

    // Find the original item by matching the value
    const items = this.options();
    const found = items.find((item) => {
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
    if (searchInput) nonTagWidth += parseFloat(getComputedStyle(searchInput).minWidth) || 0;

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
    const compareWith = this.compareWith();

    if (this.allOptionsSelected()) {
      // Deselect: remove only the visible enabled options, keep the rest
      const newSelection = this.selectedValues().filter(
        (val) => !enabledOptions.some((o) => compareWith(val, o.value))
      );
      this.selectedValues.set(newSelection);
      this.onChange(newSelection);
      this.selectionChange.emit(newSelection as T[]);
    } else {
      // Select: add visible enabled options to current selection
      const newSelection = [...this.selectedValues()];
      for (const option of enabledOptions) {
        if (!newSelection.some((val) => compareWith(val, option.value))) {
          newSelection.push(option.value);
        }
      }
      this.selectedValues.set(newSelection);
      this.onChange(newSelection);
      this.selectionChange.emit(newSelection as T[]);
    }
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
