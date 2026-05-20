import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
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
      "isManaged() ? (multiselect() ? 'group' : 'radiogroup') : null",
    "[attr.aria-label]": "label()",
  },
})
export class FilterGroupComponent implements ControlValueAccessor {
  /**
   * Multi-select mode allows multiple filters to be selected simultaneously.
   * When false, only one filter can be selected at a time (radio-like behavior).
   * @default false
   */
  readonly multiselect = input<boolean>(false);
  /**
   * Selected value in single-select mode. Two-way bound.
   */
  readonly value = model<string | null>(null);
  /**
   * Selected values in multi-select mode. Two-way bound.
   */
  readonly values = model<string[]>([]);
  /**
   * Accessible label for the group.
   */
  readonly label = input<string>();

  readonly isManaged = signal(false);
  readonly disabled = signal(false);

  private onChange: (value: string | null | string[]) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null | string[]): void {
    if (this.multiselect()) {
      this.values.set(Array.isArray(value) ? value : []);
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
    if (this.multiselect()) {
      const current = this.values();
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      this.values.set(next);
      this.onChange(next);
    } else {
      const next = this.value() === value ? null : value;
      this.value.set(next);
      this.onChange(next);
    }
    this.onTouched();
  }

  isSelected(value: string): boolean {
    if (this.multiselect()) {
      return this.values().includes(value);
    }
    return this.value() === value;
  }
}
