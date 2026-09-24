import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  forwardRef,
  input,
  model,
  signal,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";

@Component({
  selector: "tedi-filter-group",
  standalone: true,
  template: `<ng-content />`,
  styleUrl: "./filter-group.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FilterGroupComponent),
      multi: true,
    },
  ],
  host: {
    class: "tedi-filter-group",
    "[attr.role]":
      "isManaged() ? (allowMultiple() ? 'group' : 'radiogroup') : null",
    "[attr.aria-label]": "label()",
  },
})
export class FilterGroupComponent implements ControlValueAccessor {
  /**
   * Multi-select mode allows multiple filters to be selected simultaneously.
   * When false, only one filter can be selected at a time (radio-like behavior).
   * Value is treated as `string[]` when true, `string | null` otherwise.
   * @default false
   */
  readonly allowMultiple = input<boolean>(false);
  /**
   * Selected value (single-select) or values (multi-select). Two-way bound.
   * Use `string | null` when `allowMultiple` is false, `string[]` when true.
   */
  readonly value = model<string | string[] | null>(null);
  /**
   * Accessible label for the group.
   */
  readonly label = input<string>();

  readonly isManaged = signal(false);
  readonly disabled = signal(false);

  private readonly multiValues = computed<string[]>(() => {
    const v = this.value();
    return Array.isArray(v) ? v : [];
  });
  private readonly singleValue = computed<string | null>(() => {
    const v = this.value();
    return typeof v === "string" ? v : null;
  });

  private onChange: (value: string | null | string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null | string[]): void {
    if (this.allowMultiple()) {
      this.value.set(Array.isArray(value) ? value : []);
    } else {
      this.value.set(typeof value === "string" ? value : null);
    }
  }

  registerOnChange(fn: (value: string | null | string[]) => void): void {
    this.onChange = fn;
    this.isManaged.set(true);
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  selectFilter(value: string): void {
    if (this.allowMultiple()) {
      const current = this.multiValues();
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      this.value.set(next);
      this.onChange(next);
    } else {
      const next = this.singleValue() === value ? null : value;
      this.value.set(next);
      this.onChange(next);
    }
    this.onTouched();
  }

  isSelected(value: string): boolean {
    if (this.allowMultiple()) {
      return this.multiValues().includes(value);
    }
    return this.singleValue() === value;
  }
}
