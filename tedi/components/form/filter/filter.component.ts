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
import { ButtonComponent } from "../../buttons";
import { IconComponent } from "../../base/icon/icon.component";
import { StatusBadgeComponent } from "../../tags/status-badge/status-badge.component";
import { SeparatorComponent } from "../../helpers/separator/separator.component";
import { DropdownComponent } from "../../overlay/dropdown/dropdown.component";
import { DropdownTriggerDirective } from "../../overlay/dropdown/dropdown-trigger/dropdown-trigger.directive";
import { DropdownContentComponent } from "../../overlay/dropdown/dropdown-content/dropdown-content.component";
import { DropdownItemValueComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value.component";
import { DropdownItemValueLabelComponent } from "../../overlay/dropdown/dropdown-item-value/dropdown-item-value-label.component";
import { FormFieldComponent } from "../form-field/form-field.component";
import { TextFieldComponent } from "../text-field/text-field.component";
import { FilterContentDirective } from "./filter-content.directive";
import { FilterPrependDirective } from "./filter-prepend.directive";

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
    "[class.tedi-filter--disabled]": "disabled()",
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
   * Whether the filter is selected (boolean mode).
   * @default false
   */
  readonly selected = model<boolean>(false);
  /**
   * Multi-select mode renders checkboxes and allows multiple selections.
   * When false and options are provided, single-select mode is used.
   * @default false
   */
  readonly multiselect = input<boolean>(false);
  /**
   * Options for the dropdown. Enables single-select mode, or multiselect mode when combined with the multiselect input.
   */
  readonly options = input<FilterOption[]>([]);
  /**
   * Selected value in single-select mode. Two-way bound.
   */
  readonly value = model<string>("");
  /**
   * Selected values in multiselect mode. Two-way bound.
   */
  readonly values = model<string[]>([]);
  /**
   * Show search field in the dropdown.
   * @default false
   */
  readonly searchable = input<boolean>(false);
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
   * Label for "Select all" option.
   * @default Vali kõik
   */
  readonly selectAllLabel = input<string>("Vali kõik");
  /**
   * Label for "Clear selection" action.
   * @default Tühjenda valik
   */
  readonly clearLabel = input<string>("Tühjenda valik");
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
   * Append dropdown to given selector.
   * Use 'body' to append at the end of DOM or empty string to append next to trigger.
   * @default ""
   */
  readonly appendTo = input("");

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
  private readonly customContent = contentChild(FilterContentDirective);
  private readonly filterPrepend = contentChild(FilterPrependDirective);
  readonly hasCustomContent = computed(() => !!this.customContent());
  readonly hasOptions = computed(() => this.options().length > 0);
  readonly isSingleSelect = computed(
    () => this.hasOptions() && !this.multiselect(),
  );
  readonly hasDropdown = computed(
    () => this.hasOptions() || this.hasCustomContent(),
  );

  private readonly idGenerator = inject(_IdGenerator);
  private readonly baseId = this.idGenerator.getId("tedi-filter");

  private readonly _disabled = signal(false);
  readonly disabled = computed(
    () => this._disabled() || !!this.filterGroup?.disabled(),
  );
  readonly searchTerm = signal("");
  readonly activeOptionIndex = signal<number>(-1);
  private suppressNextOptionsFocusAutoSelect = false;

  readonly activeDescendantId = computed(() => {
    const idx = this.activeOptionIndex();
    if (idx === -1) return null;
    return idx < this.filteredOptions().length
      ? this.getOptionId(idx)
      : null;
  });

  readonly iconSize = computed(() => (this.size() === "large" ? 24 : 18));

  readonly isGrouped = computed(
    () => !!this.filterGroup && this.filterGroup.isManaged(),
  );

  readonly isGroupedRadio = computed(
    () => this.isGrouped() && !this.filterGroup!.multiselect(),
  );

  readonly hidePrepend = computed(
    () =>
      this.isSelected() &&
      (this.filterPrepend()?.hideWhenSelected() ?? true),
  );

  readonly isSelected = computed(() => {
    if (this.isGrouped()) {
      return this.filterGroup!.isSelected(this.value());
    }
    if (this.multiselect()) {
      return this.values().length > 0;
    }
    if (this.isSingleSelect()) {
      return this.value() !== "";
    }
    return this.selected();
  });

  readonly selectedCount = computed(() => this.values().length);

  readonly selectedLabel = computed(() => {
    const val = this.value();
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
    const vals = this.values();
    return filtered.every((opt) => vals.includes(opt.value));
  });

  readonly someFilteredSelected = computed(() => {
    const filtered = this.filteredOptions().filter((opt) => !opt.disabled);
    const vals = this.values();
    const selectedCount = filtered.filter((opt) =>
      vals.includes(opt.value),
    ).length;
    return selectedCount > 0 && selectedCount < filtered.length;
  });

  private onChange: (value: boolean | string | string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: boolean | string | string[]): void {
    if (this.multiselect()) {
      this.values.set(Array.isArray(value) ? value : []);
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
    this._disabled.set(isDisabled);
  }

  toggle(): void {
    if (this.isGrouped()) {
      this.filterGroup!.selectFilter(this.value());
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
      return this.value() === value;
    }
    return this.values().includes(value);
  }

  selectOption(value: string): void {
    const newValue = this.value() === value ? "" : value;
    this.value.set(newValue);
    this.onChange(newValue);
    this.onTouched();
    this.dropdown()?.hideDropdown();
    this.triggerBtn()?.nativeElement.focus();
  }

  toggleOption(value: string): void {
    const current = this.values();
    const newValues = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    this.values.set(newValues);
    this.onChange(newValues);
    this.onTouched();
  }

  toggleSelectAll(): void {
    const filtered = this.filteredOptions().filter((opt) => !opt.disabled);
    let newValues: string[];
    if (this.allFilteredSelected()) {
      const filteredValues = new Set(filtered.map((opt) => opt.value));
      newValues = this.values().filter((v) => !filteredValues.has(v));
    } else {
      const current = new Set(this.values());
      filtered.forEach((opt) => current.add(opt.value));
      newValues = [...current];
    }
    this.values.set(newValues);
    this.onChange(newValues);
    this.onTouched();
  }

  clearSelection(): void {
    this.values.set([]);
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

  onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  focusDropdownContent(keyboard = false, focusLast = false): void {
    setTimeout(() => {
      if (!this.dropdown()?.floatUiComponent().state) return;
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
        const next = this.findNextEnabledIndex(
          this.activeOptionIndex(),
          1,
        );
        if (next !== -1) this.setActiveOption(next);
        break;
      }

      case "ArrowUp": {
        event.preventDefault();
        const prev = this.findNextEnabledIndex(
          this.activeOptionIndex(),
          -1,
        );
        if (prev !== -1) this.setActiveOption(prev);
        break;
      }

      case "Home":
        event.preventDefault();
        this.setActiveOption(this.findNextEnabledIndex(-1, 1));
        break;

      case "End":
        event.preventDefault();
        this.setActiveOption(
          this.findNextEnabledIndex(options.length, -1),
        );
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
