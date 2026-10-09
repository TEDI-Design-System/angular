import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  isDevMode,
  model,
  Renderer2,
  signal,
  ViewEncapsulation,
} from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { TextComponent } from "../../base/text/text.component";
import type { CheckboxComponent } from "../checkbox/checkbox.component";

export type CheckboxGroupDirection = "horizontal" | "vertical";

let nextGroupId = 0;

@Component({
  standalone: true,
  imports: [TextComponent],
  selector: "tedi-checkbox-group",
  templateUrl: "./checkbox-group.component.html",
  styleUrl: "./checkbox-group.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxGroupComponent),
      multi: true,
    },
  ],
  host: {
    class: "tedi-checkbox-group",
    "[attr.role]": "isManaged() ? 'group' : null",
    "[attr.aria-labelledby]": "managedAriaLabelledby()",
    "[attr.aria-label]": "managedAriaLabel()",
    "[attr.aria-disabled]": "isManaged() && isDisabled() ? 'true' : null",
  },
})
export class CheckboxGroupComponent implements ControlValueAccessor {
  /**
   * Label text displayed above the checkbox group.
   */
  readonly label = input<string>();
  /**
   * Layout direction of the checkboxes.
   * @default horizontal
   */
  readonly direction = input<CheckboxGroupDirection>("horizontal");
  /**
   * Selected values. Bind with `[(values)]` or use a FormControl on the group.
   * When provided, the group enters managed mode and coordinates `checked`
   * on every registered child.
   * @default []
   */
  readonly values = model<string[]>([]);
  /**
   * Disables the entire group. Propagates to all children.
   * @default false
   */
  readonly disabled = input<boolean>(false);
  /**
   * Accessible name for the group. Use when no visible `label` is rendered.
   * Ignored when `label` or `ariaLabelledby` is provided.
   */
  readonly ariaLabel = input<string>();
  /**
   * ID of an external element that labels the group. Ignored when `label` is
   * provided.
   */
  readonly ariaLabelledby = input<string>();

  private readonly renderer = inject(Renderer2);
  protected readonly labelId = `tedi-checkbox-group-${++nextGroupId}-label`;
  private readonly children = signal<readonly CheckboxComponent[]>([]);
  private readonly cvaDisabled = signal(false);
  private readonly managed = signal(false);

  private onChange: (value: string[]) => void = () => {};
  private onTouched: () => void = () => {};

  readonly isManaged = this.managed.asReadonly();
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly managedAriaLabelledby = computed<string | null>(() => {
    if (!this.isManaged()) return null;
    if (this.label()) return this.labelId;
    return this.ariaLabelledby() ?? null;
  });
  protected readonly managedAriaLabel = computed<string | null>(() => {
    if (!this.isManaged()) return null;
    if (this.label() || this.ariaLabelledby()) return null;
    return this.ariaLabel() ?? null;
  });

  constructor() {
    effect(() => {
      if (this.values().length > 0) {
        this.managed.set(true);
      }
      this.syncChildrenChecked();
    });
  }

  writeValue(values: string[] | null): void {
    this.values.set(values ?? []);
    this.managed.set(true);
  }

  registerOnChange(fn: (values: string[]) => void): void {
    this.onChange = fn;
    this.managed.set(true);
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
    this.managed.set(true);
  }

  registerChild(child: CheckboxComponent): void {
    this.children.update((list) => [...list, child]);
    this.applyCheckedTo(child);
  }

  unregisterChild(child: CheckboxComponent): void {
    this.children.update((list) => list.filter((c) => c !== child));
  }

  onChildChange(value: string, checked: boolean): void {
    if (!this.isManaged()) return;
    const current = this.values();
    const has = current.includes(value);
    if (checked && !has) {
      this.values.set([...current, value]);
    } else if (!checked && has) {
      this.values.set(current.filter((v) => v !== value));
    } else {
      return;
    }
    this.onChange(this.values());
    this.onTouched();
  }

  isSelected(value: string | undefined): boolean {
    return value !== undefined && this.values().includes(value);
  }

  private syncChildrenChecked(): void {
    if (!this.isManaged()) return;
    for (const child of this.children()) {
      this.applyCheckedTo(child);
    }
  }

  private applyCheckedTo(child: CheckboxComponent): void {
    if (!this.isManaged()) return;
    const childVal = child.value();
    if (childVal === undefined) return;
    const desired = this.values().includes(childVal);
    const el = child.hostElement;
    if (el.checked !== desired) {
      this.renderer.setProperty(el, "checked", desired);
    }
  }

  /** @internal */
  warnMissingValue(): void {
    if (isDevMode()) {
      console.warn(
        "[tedi-checkbox-group] A checkbox inside a managed group is missing a [value] input and will be ignored.",
      );
    }
  }
}
