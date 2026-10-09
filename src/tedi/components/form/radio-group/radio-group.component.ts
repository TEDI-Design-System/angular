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
import type { RadioComponent } from "../radio/radio.component";

export type RadioGroupDirection = "horizontal" | "vertical";

let nextGroupId = 0;

@Component({
  standalone: true,
  imports: [TextComponent],
  selector: "tedi-radio-group",
  templateUrl: "./radio-group.component.html",
  styleUrl: "./radio-group.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupComponent),
      multi: true,
    },
  ],
  host: {
    class: "tedi-radio-group",
    "[attr.role]": "isManaged() ? 'radiogroup' : null",
    "[attr.aria-labelledby]": "managedAriaLabelledby()",
    "[attr.aria-label]": "managedAriaLabel()",
    "[attr.aria-disabled]": "isManaged() && isDisabled() ? 'true' : null",
  },
})
export class RadioGroupComponent implements ControlValueAccessor {
  /**
   * Label text displayed above the radio group.
   */
  readonly label = input<string>();
  /**
   * Layout direction of the radios.
   * @default horizontal
   */
  readonly direction = input<RadioGroupDirection>("horizontal");
  /**
   * Selected value. Bind with `[(value)]` or use a FormControl on the group.
   * When set, the group enters managed mode and coordinates `checked` on every
   * registered child.
   * @default null
   */
  readonly value = model<string | null>(null);
  /**
   * Shared `name` attribute applied to child radios. Auto-generated when
   * omitted. Pass an explicit `name` to avoid SSR hydration mismatches.
   */
  readonly name = input<string>();
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
  private readonly autoName = `tedi-radio-group-${++nextGroupId}`;
  protected readonly labelId = `${this.autoName}-label`;
  private readonly children = signal<readonly RadioComponent[]>([]);
  private readonly cvaDisabled = signal(false);
  private readonly managed = signal(false);

  private onChange: (value: string | null) => void = () => {};
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
      if (this.value() !== null) {
        this.managed.set(true);
      }
      this.syncChildrenChecked();
    });

    effect(() => {
      if (!this.isManaged()) return;
      const groupName = this.name() ?? this.autoName;
      for (const child of this.children()) {
        this.renderer.setAttribute(child.hostElement, "name", groupName);
      }
    });
  }

  writeValue(value: string | null): void {
    this.value.set(value);
    this.managed.set(true);
  }

  registerOnChange(fn: (value: string | null) => void): void {
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

  registerChild(child: RadioComponent): void {
    this.children.update((list) => [...list, child]);
    this.applyCheckedTo(child);
  }

  unregisterChild(child: RadioComponent): void {
    this.children.update((list) => list.filter((c) => c !== child));
  }

  onChildChange(value: string): void {
    if (!this.isManaged()) return;
    if (this.value() === value) return;
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }

  isSelected(value: string | undefined): boolean {
    return value !== undefined && this.value() === value;
  }

  private syncChildrenChecked(): void {
    if (!this.isManaged()) return;
    for (const child of this.children()) {
      this.applyCheckedTo(child);
    }
  }

  private applyCheckedTo(child: RadioComponent): void {
    if (!this.isManaged()) return;
    const childVal = child.value();
    if (childVal === undefined) return;
    const desired = childVal === this.value();
    const el = child.hostElement;
    if (el.checked !== desired) {
      this.renderer.setProperty(el, "checked", desired);
    }
  }

  /** @internal */
  warnMissingValue(): void {
    if (isDevMode()) {
      console.warn(
        "[tedi-radio-group] A radio inside a managed group is missing a [value] input and will be ignored.",
      );
    }
  }
}
