import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  computed,
  contentChild,
  forwardRef,
  inject,
  input,
  model,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { FilterGroupComponent } from "./filter-group.component";
import { _IdGenerator } from "@angular/cdk/a11y";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { NgTemplateOutlet } from "@angular/common";
import { ButtonComponent } from "../buttons";
import { IconComponent } from "../base/icon/icon.component";
import { StatusBadgeComponent } from "../tags/status-badge/status-badge.component";
import { SeparatorComponent } from "../helpers/separator/separator.component";
import { DropdownComponent } from "../overlay/dropdown/dropdown.component";
import { DropdownTriggerDirective } from "../overlay/dropdown/dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "../overlay/dropdown/dropdown-content/dropdown-content.component";
import { DropdownItemValueComponent } from "../overlay/dropdown/dropdown-item-value/dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "../overlay/dropdown/dropdown-item-value/dropdown-item-value-label.component";
import { FormFieldComponent } from "../form/form-field/form-field.component";
import { TextFieldComponent } from "../form/text-field/text-field.component";
import { FilterContentDirective } from "./filter-content.directive";
import { FilterPrependDirective } from "./filter-prepend.directive";
import { TediTranslationService } from "../../services/translation/translation.service";

export type FilterVariant = "primary" | "secondary";
export type FilterSize = "default" | "large";

export interface FilterOption {
  label: string;
  value: string;
  disabled?: boolean;
}

@Component({
  selector: "tedi-filter",
  standalone: true,
  imports: [
    NgTemplateOutlet,
    ButtonComponent,
    IconComponent,
    StatusBadgeComponent,
    SeparatorComponent,
    DropdownComponent,
    DropdownTriggerDirective,
    DropdownContentComponent,
    DropdownItemValueComponent,
    DropdownItemValueLabelComponent,
    FormFieldComponent,
    TextFieldComponent,
    FilterContentDirective,
  ],
  templateUrl: "./filter.component.html",
  styleUrl: "./filter.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterComponent),
      multi: true,
    },
  ],
  host: {
    class: "tedi-filter",
    "[class.tedi-filter--primary]": "variant() === 'primary'",
    "[class.tedi-filter--secondary]": "variant() === 'secondary'",
    "[class.tedi-filter--large]": "size() === 'large'",
    "[class.tedi-filter--selected]": "isSelected()",
    "[class.tedi-filter--disabled]": "isDisabled()",
  },
})
export class FilterComponent implements ControlValueAccessor {
  /**
   * Filter label text.
   */
  readonly text = input<string>("");
  /**
   * Visual variant of the filter.
   * @default primary
   */
  readonly variant = input<FilterVariant>("primary");
  /**
   * Size of the filter.
   * @default default
   */
  readonly size = input<FilterSize>("default");
  /**
   * Whether the filter is selected (boolean toggle mode, used when no options are provided).
   * @default false
   */
  readonly selected = model<boolean>(false);
  /**
   * Enables multi-select mode. When true, value is treated as `string[]`; when false,
   * value is treated as `string`. Has no effect when no options are provided.
   * @default false
   */
  readonly allowMultiple = input<boolean>(false);
  /**
   * Options for the dropdown. Enables single-select mode, or multi-select mode when
   * combined with `allowMultiple`.
   */
  readonly options = input<FilterOption[]>([]);
  /**
   * Selected value (single-select) or values (multi-select). Two-way bound.
   * Use `string` when `allowMultiple` is false, `string[]` when true.
   */
  readonly value = model<string | string[]>("");
  /**
   * Show the search field in the dropdown.
   * @default false
   */
  readonly showSearch = input<boolean>(false);
  /**
   * Whether the dropdown search field has a clear (×) button.
   * Only applies when `showSearch` is true.
   * @default true
   */
  readonly searchClearable = input<boolean>(true);
  /**
   * Whether to clear the search field after an option is selected (or toggled in multi-select).
   * Useful in multi-select flows where the user picks several options consecutively.
   * @default false
   */
  readonly clearSearchOnSelect = input<boolean>(false);
  /**
   * Show "Select all" option in the dropdown.
   * @default false
   */
  readonly showSelectAll = input<boolean>(false);
  /**
   * Show "Clear selection" action in the dropdown.
   * @default false
   */
  readonly showClear = input<boolean>(false);
  /**
   * Override for the "Select all" option label. Defaults to the translated string.
   */
  readonly selectAllLabel = input<string | undefined>(undefined);
  /**
   * Override for the "Clear selection" action label. Defaults to the translated string.
   */
  readonly clearLabel = input<string | undefined>(undefined);
  /**
   * Emitted when the clear button is clicked in a custom content dropdown.
   */
  readonly cleared = output<void>();
  /**
   * When true, the filter label is preserved as a prefix when a value is selected.
   * E.g. "Teenus: Optometristi vastuvõtt" instead of just "Optometristi vastuvõtt".
   * @default false
   */
  readonly preserveLabel = input<boolean>(false);
  /**
   * Whether the filter is disabled. Also set automatically when used with a disabled FormControl
   * or when nested in a disabled FilterGroup.
   * @default false
   */
  readonly disabled = input<boolean>(false);

  readonly dropdown = viewChild<DropdownComponent>("dropdown");
  private readonly dropdownPanel =
    viewChild<ElementRef<HTMLElement>>("dropdownPanel");
  private readonly optionsList =
    viewChild<ElementRef<HTMLElement>>("optionsList");
  private readonly triggerBtn =
    viewChild<ElementRef<HTMLButtonElement>>("triggerBtn");

  private readonly filterGroup = inject(FilterGroupComponent, {
    optional: true,
  });
  private readonly translationService = inject(TediTranslationService);
  private readonly customContent = contentChild(FilterContentDirective);
  private readonly filterPrepend = contentChild(FilterPrependDirective);
  readonly hasCustomContent = computed(() => !!this.customContent());
  readonly hasOptions = computed(() => this.options().length > 0);
  readonly isMultiSelect = computed(
    () => this.hasOptions() && this.allowMultiple(),
  );
  readonly isSingleSelect = computed(
    () => this.hasOptions() && !this.allowMultiple(),
  );
  readonly hasDropdown = computed(
    () => this.hasOptions() || this.hasCustomContent(),
  );

  readonly singleValue = computed<string>(() => {
    const v = this.value();
    return typeof v === "string" ? v : "";
  });
  readonly multiValues = computed<string[]>(() => {
    const v = this.value();
    return Array.isArray(v) ? v : [];
  });

  private readonly defaultSelectAllLabel =
    this.translationService.track("select.select-all");
  private readonly defaultClearLabel = this.translationService.track(
    "filter.clear-selection",
  );
  readonly resolvedSelectAllLabel = computed(
    () => this.selectAllLabel() ?? this.defaultSelectAllLabel(),
  );
  readonly resolvedClearLabel = computed(
    () => this.clearLabel() ?? this.defaultClearLabel(),
  );

  private readonly idGenerator = inject(_IdGenerator);
  private readonly baseId = this.idGenerator.getId("tedi-filter");

  private readonly formDisabled = signal(false);
  readonly isDisabled = computed(
    () =>
      this.disabled() || this.formDisabled() || !!this.filterGroup?.disabled(),
  );
  readonly searchTerm = signal("");
  readonly activeOptionIndex = signal<number>(-1);
  private suppressNextOptionsFocusAutoSelect = false;

  readonly activeDescendantId = computed(() => {
    const idx = this.activeOptionIndex();
    if (idx === -1) return null;
    return idx < this.filteredOptions().length ? this.getOptionId(idx) : null;
  });

  readonly iconSize = computed(() => (this.size() === "large" ? 24 : 18));

  readonly isGrouped = computed(
    () => !!this.filterGroup && this.filterGroup.isManaged(),
  );

  readonly isGroupedRadio = computed(
    () => this.isGrouped() && !this.filterGroup!.allowMultiple(),
  );

  readonly hidePrepend = computed(
    () =>
      this.isSelected() && (this.filterPrepend()?.hideWhenSelected() ?? true),
  );

  readonly isSelected = computed(() => {
    if (this.isGrouped()) {
      return this.filterGroup!.isSelected(this.singleValue());
    }
    if (this.isMultiSelect()) {
      return this.multiValues().length > 0;
    }
    if (this.isSingleSelect()) {
      return this.singleValue() !== "";
    }
    return this.selected();
  });

  readonly selectedCount = computed(() => this.multiValues().length);

  readonly selectedLabel = computed(() => {
    const val = this.singleValue();
    if (!val) return null;
    return this.options().find((opt) => opt.value === val)?.label ?? null;
  });

  readonly displayText = computed(() => {
    if (this.isSingleSelect()) {
      const label = this.selectedLabel();
      if (label && this.preserveLabel()) {
        return this.text() + ": " + label;
      }
      return label ?? this.text();
    }
    return this.text();
  });

  readonly filteredOptions = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.options();
    return this.options().filter((opt) =>
      opt.label.toLowerCase().includes(term),
    );
  });

  readonly allFilteredSelected = computed(() => {
    const filtered = this.filteredOptions().filter((opt) => !opt.disabled);
    if (filtered.length === 0) return false;
    const vals = this.multiValues();
    return filtered.every((opt) => vals.includes(opt.value));
  });

  readonly someFilteredSelected = computed(() => {
    const filtered = this.filteredOptions().filter((opt) => !opt.disabled);
    const vals = this.multiValues();
    const selectedCount = filtered.filter((opt) =>
      vals.includes(opt.value),
    ).length;
    return selectedCount > 0 && selectedCount < filtered.length;
  });

  private onChange: (value: boolean | string | string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: boolean | string | string[]): void {
    if (this.isMultiSelect()) {
      this.value.set(Array.isArray(value) ? value : []);
    } else if (this.isSingleSelect()) {
      this.value.set(typeof value === "string" ? value : "");
    } else {
      this.selected.set(!!value);
    }
  }

  registerOnChange(fn: (value: boolean | string | string[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.formDisabled.set(isDisabled);
  }

  toggle(): void {
    if (this.isGrouped()) {
      this.filterGroup!.selectFilter(this.singleValue());
      return;
    }
    const newValue = !this.selected();
    this.selected.set(newValue);
    this.onChange(newValue);
    this.onTouched();
  }

  getOptionId(index: number): string {
    return `${this.baseId}-option-${index}`;
  }

  isOptionSelected(value: string): boolean {
    if (this.isSingleSelect()) {
      return this.singleValue() === value;
    }
    return this.multiValues().includes(value);
  }

  selectOption(value: string): void {
    const newValue = this.singleValue() === value ? "" : value;
    this.value.set(newValue);
    this.onChange(newValue);
    this.onTouched();
    if (this.clearSearchOnSelect()) {
      this.searchTerm.set("");
    }
    this.dropdown()?.hideDropdown();
    this.triggerBtn()?.nativeElement.focus();
  }

  toggleOption(value: string): void {
    const current = this.multiValues();
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    this.value.set(newValues);
    this.onChange(newValues);
    this.onTouched();
    if (this.clearSearchOnSelect()) {
      this.searchTerm.set("");
    }
  }

  toggleSelectAll(): void {
    const filtered = this.filteredOptions().filter((opt) => !opt.disabled);
    let newValues: string[];
    if (this.allFilteredSelected()) {
      const filteredValues = new Set(filtered.map((opt) => opt.value));
      newValues = this.multiValues().filter((v) => !filteredValues.has(v));
    } else {
      const current = new Set(this.multiValues());
      filtered.forEach((opt) => current.add(opt.value));
      newValues = [...current];
    }
    this.value.set(newValues);
    this.onChange(newValues);
    this.onTouched();
  }

  clearSelection(): void {
    this.value.set([]);
    this.onChange([]);
    this.onTouched();
  }

  clearSingleSelection(): void {
    this.value.set("");
    this.onChange("");
    this.onTouched();
  }

  onCustomClear(): void {
    this.cleared.emit();
  }

  onSearchClear(): void {
    this.searchTerm.set("");
  }

  focusDropdownContent(keyboard = false, focusLast = false): void {
    setTimeout(() => {
      if (!this.dropdown()?.isOpen()) return;
      if (!keyboard) {
        this.suppressNextOptionsFocusAutoSelect = true;
        this.activeOptionIndex.set(-1);
      }
      const focusable = this.getTabStops();
      if (focusLast) {
        focusable[focusable.length - 1]?.focus();
      } else {
        focusable[0]?.focus();
      }
    });
  }

  handleDropdownKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case "Escape":
        event.preventDefault();
        this.dropdown()?.hideDropdown();
        this.triggerBtn()?.nativeElement.focus();
        break;

      case "Tab":
        this.handleTabKey(event);
        break;
    }
  }

  onOptionsFocus(): void {
    if (this.suppressNextOptionsFocusAutoSelect) {
      this.suppressNextOptionsFocusAutoSelect = false;
      return;
    }
    if (this.activeOptionIndex() === -1) {
      this.activeOptionIndex.set(this.findNextEnabledIndex(-1, 1));
    }
  }

  onOptionsBlur(): void {
    this.activeOptionIndex.set(-1);
    this.suppressNextOptionsFocusAutoSelect = false;
  }

  onOptionsMousedown(): void {
    this.suppressNextOptionsFocusAutoSelect = true;
    this.activeOptionIndex.set(-1);
  }

  onOptionsKeydown(event: KeyboardEvent): void {
    const options = this.filteredOptions();

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const next = this.findNextEnabledIndex(this.activeOptionIndex(), 1);
        if (next !== -1) this.setActiveOption(next);
        break;
      }

      case "ArrowUp": {
        event.preventDefault();
        const prev = this.findNextEnabledIndex(this.activeOptionIndex(), -1);
        if (prev !== -1) this.setActiveOption(prev);
        break;
      }

      case "Home":
        event.preventDefault();
        this.setActiveOption(this.findNextEnabledIndex(-1, 1));
        break;

      case "End":
        event.preventDefault();
        this.setActiveOption(this.findNextEnabledIndex(options.length, -1));
        break;

      case "Enter":
      case " ": {
        event.preventDefault();
        const idx = this.activeOptionIndex();
        const option = options[idx];
        if (option && !option.disabled) {
          if (this.isSingleSelect()) {
            this.selectOption(option.value);
          } else {
            this.toggleOption(option.value);
          }
        }
        break;
      }
    }
  }

  private handleTabKey(event: KeyboardEvent): void {
    const tabStops = this.getTabStops();
    if (!tabStops.length) return;

    const currentIndex = tabStops.indexOf(
      document.activeElement as HTMLElement,
    );

    if (event.shiftKey && currentIndex <= 0) {
      event.preventDefault();
      tabStops[tabStops.length - 1].focus();
    } else if (!event.shiftKey && currentIndex === tabStops.length - 1) {
      event.preventDefault();
      tabStops[0].focus();
    }
  }

  private findNextEnabledIndex(from: number, direction: 1 | -1): number {
    const options = this.filteredOptions();
    let index = from + direction;
    while (index >= 0 && index < options.length) {
      if (!options[index].disabled) return index;
      index += direction;
    }
    return -1;
  }

  private setActiveOption(index: number): void {
    this.activeOptionIndex.set(index);
    const container = this.optionsList()?.nativeElement;
    if (!container || index === -1) return;
    const items = container.querySelectorAll<HTMLElement>(
      ".tedi-filter-dropdown__item",
    );
    items[index]?.scrollIntoView({ block: "nearest" });
  }

  private getTabStops(): HTMLElement[] {
    const panel = this.dropdownPanel()?.nativeElement;
    if (!panel) return [];
    return Array.from(
      panel.querySelectorAll<HTMLElement>(
        'input:not([disabled]):not([tabindex="-1"]), button:not([disabled]), [role="option"][tabindex="0"], [role="listbox"][tabindex="0"], [role="checkbox"][tabindex="0"]',
      ),
    );
  }
}
