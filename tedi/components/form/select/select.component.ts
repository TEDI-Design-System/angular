import { CdkOverlayOrigin, ConnectedPosition, OverlayModule } from "@angular/cdk/overlay";
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
import { ClosingButtonComponent } from "../../buttons";
import { TediTranslationPipe } from "../../../services";
import { ComponentInputs } from "../../../types";
import { FeedbackTextComponent } from "../feedback-text/feedback-text.component";
import { LabelComponent } from "../label/label.component";
import { TagComponent } from "../../tags/tag/tag.component";
import { DropdownItemValueComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value-label.component";
import {
  SelectOptionTemplateDirective,
  SelectLabelTemplateDirective,
  SelectValueTemplateDirective,
  SelectOptionContext,
  SelectValueContext,
} from "./select-templates.directive";

export type InputState = "default" | "error" | "valid";
export type InputSize = "default" | "small";

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
  SELECT_ALL = "SELECT_ALL",
  SELECT_GROUP = "SELECT_GROUP_",
}

@Component({
  selector: "tedi-select",
  imports: [
    CommonModule,
    OverlayModule,
    CdkListboxModule,
    ClosingButtonComponent,
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
    "[class.tedi-select--multiselect]": "multiple()",
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
  size = input<InputSize>("default");

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
   * Configuration for the feedback text displayed below the select.
   */
  feedbackText = input<ComponentInputs<FeedbackTextComponent>>();

  /**
   * Array of items to display as options.
   * Can be an array of objects or primitive values.
   * @default []
   */
  items = input<T[]>([]);

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
  multiple = input<boolean>(false);

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
   * Whether selected tags can be individually removed in multiselect mode.
   * @default false
   */
  clearableTags = input<boolean>(false);

  /**
   * Whether selected tags wrap to multiple rows in multiselect mode.
   * When false, overflow tags are hidden and a counter is shown.
   * @default false
   */
  multiRow = input<boolean>(false);

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
  notFoundText = input<string>();

  /**
   * Whether the select has a search input for filtering options.
   * @default false
   */
  searchable = input<boolean>(false);

  readonly SpecialOptionControls = SpecialOptionControls;

  readonly dropdownPositions: ConnectedPosition[] = [
    // Open below, expand downward
    {
      originX: "start",
      originY: "bottom",
      overlayX: "start",
      overlayY: "top",
    },
    // Fallback: open above, expand upward
    {
      originX: "start",
      originY: "top",
      overlayX: "start",
      overlayY: "bottom",
    },
  ];

  listboxId = computed(() => this.inputId() + "-listbox");
  labelId = computed(() => this.inputId() + "-label");

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
  triggerRef = viewChild(CdkOverlayOrigin, { read: ElementRef });
  searchInputRef = viewChild<ElementRef>("searchInput");
  multiselectContainerRef = viewChild<ElementRef>("multiselectContainer");
  tagRefs = viewChildren("tagElement", { read: ElementRef });
  hostRef = inject(ElementRef);
  private ngZone = inject(NgZone);

  // Template queries for custom rendering
  optionTemplate = contentChild(SelectOptionTemplateDirective);
  labelTemplate = contentChild(SelectLabelTemplateDirective);
  valueTemplate = contentChild(SelectValueTemplateDirective);

  normalizedOptions = computed<SelectOption<T>[]>(() => {
    const items = this.items();
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

      const label = (itemRecord[bindLabel] as string) ?? String(item);
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
    const term = this.searchTerm().toLowerCase().trim();

    if (!term) {
      return options;
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

  allOptionsSelected = computed<boolean>(() => {
    const enabledOptions = this.normalizedOptions().filter((o) => !o.disabled);
    const selected = this.selectedValues();
    const compareWith = this.compareWith();

    return (
      enabledOptions.length > 0 &&
      enabledOptions.every((option) =>
        selected.some((val) => compareWith(option.value, val))
      )
    );
  });

  ngAfterContentChecked(): void {
    this.setDropdownWidth();
  }

  ngAfterViewChecked(): void {
    if (this.multiple() && !this.multiRow()) {
      this.calculateVisibleTags();
    }
  }

  @HostListener("window:resize")
  onWindowResize(): void {
    this.setDropdownWidth();
    if (this.multiple() && !this.multiRow()) {
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
      this.isOpen.set(false);
      this.searchTerm.set("");
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
     * Prevent CDK from resetting active item to the first selected option
     * whenever [cdkListboxValue] changes in multiselect mode. CDK calls
     * _setNextFocusToSelectedOption inside _setSelection, which moves focus
     * away from the user's current position after each selection toggle.
     */
    effect(() => {
      const listbox = this.cdkListboxRef();
      if (listbox && this.multiple()) {
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
    if (this.disabled()) return;

    if (close) {
      this.closeDropdown();
      this.focusTrigger();
    } else {
      const willOpen = !this.isOpen();
      if (willOpen) {
        this.openDropdown();
      } else {
        this.dropdownMaxHeight.set(null);
        this.isOpen.set(false);
      }
    }
  }

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);

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
    if (this.searchable()) {
      this.searchInputRef()?.nativeElement.focus();
      if (!this.isOpen()) {
        this.openDropdown();
      }
    } else {
      this.toggleIsOpen();
    }
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
    this.calculateDropdownMaxHeight();
    this.isOpen.set(true);
  }

  private calculateDropdownMaxHeight(): void {
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
    this.isOpen.set(false);
    this.searchTerm.set("");
    this.dropdownMaxHeight.set(null);
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
      return;
    }

    if (selectGroupValue) {
      const groupLabel = (selectGroupValue as string).replace(
        SpecialOptionControls.SELECT_GROUP,
        ""
      );
      this.toggleGroupSelection(groupLabel);
      return;
    }

    if (this.multiple()) {
      this.selectedValues.set([...values]);
      this.onChange([...values]);
      this.searchTerm.set("");
      if (this.searchable()) {
        this.searchInputRef()?.nativeElement.focus();
      }
    } else {
      const selected = values[0] ?? null;
      this.selectedValues.set(selected ? [selected] : []);
      this.onChange(selected);
      this.toggleIsOpen(true);
    }

    this.onTouched();
  }

  clear(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.selectedValues.set([]);
    if (this.multiple()) {
      this.onChange([]);
    } else {
      this.onChange(null);
    }
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
    const items = this.items();
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

  private focusTrigger(): void {
    if (this.searchable()) {
      this.searchInputRef()?.nativeElement.focus();
    } else {
      this.triggerRef()?.nativeElement.focus();
    }
  }

  private calculateVisibleTags(): void {
    const container = this.multiselectContainerRef()?.nativeElement;
    const tags = this.tagRefs();

    if (!container || tags.length === 0) {
      return;
    }

    if (this.visibleTagsCount() !== null) {
      return;
    }

    const containerWidth = container.offsetWidth;

    if (containerWidth === 0) {
      return;
    }

    const gap = 8;
    const counterTagWidth = 40;
    let usedWidth = 0;
    let visibleCount = 0;

    for (let i = 0; i < tags.length; i++) {
      const tagEl = tags[i].nativeElement;
      const tagWidth = tagEl.offsetWidth;

      // Check if this tag fits
      const spaceNeeded = usedWidth + tagWidth + (visibleCount > 0 ? gap : 0);

      // Reserve space for counter tag if there are more items
      const hasMoreItems = i < tags.length - 1;
      const reservedSpace = hasMoreItems ? counterTagWidth + gap : 0;

      if (spaceNeeded + reservedSpace <= containerWidth) {
        usedWidth = spaceNeeded;
        visibleCount++;
      } else {
        break;
      }
    }

    // Ensure at least one tag is shown
    if (visibleCount === 0 && tags.length > 0) {
      visibleCount = 1;
    }

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
    const enabledOptions = this.normalizedOptions().filter((o) => !o.disabled);

    if (this.allOptionsSelected()) {
      this.selectedValues.set([]);
      this.onChange([]);
    } else {
      const allValues = enabledOptions.map((o) => o.value);
      this.selectedValues.set(allValues);
      this.onChange(allValues);
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
      const currentSelected = new Set(this.selectedValues());
      groupValues.forEach((val) => currentSelected.add(val));
      newSelection = Array.from(currentSelected);
    }

    this.selectedValues.set(newSelection);
    this.onChange(newSelection);
  }

  onChange: (value: unknown) => void = () => { };
  onTouched: () => void = () => { };

  writeValue(value: unknown): void {
    if (this.multiple()) {
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
  }
}
