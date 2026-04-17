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
    "[attr.aria-labelledby]": "isManaged() && label() ? labelId : null",
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
   * Shared `name` attribute applied to every child radio. Auto-generated when
   * omitted. Under SSR, pass an explicit `name` to avoid hydration mismatches.
   */
  readonly name = input<string>();
  /**
   * Disables the entire group. Propagates to all children.
   * @default false
   */
  readonly disabled = input<boolean>(false);

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

  constructor() {
    effect(() => {
      const v = this.value();
      if (v !== null) {
        this.managed.set(true);
      }
      this.syncChildrenChecked();
    });

    effect(() => {
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
  }

  registerChild(child: RadioComponent): void {
    this.children.update((list) => [...list, child]);
    this.renderer.setAttribute(
      child.hostElement,
      "name",
      this.name() ?? this.autoName,
    );
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
    const v = child.value();
    if (v === undefined) return;
    const desired = v === this.value();
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
