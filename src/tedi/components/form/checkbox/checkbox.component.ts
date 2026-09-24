import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { CheckboxGroupComponent } from "../checkbox-group/checkbox-group.component";

export type CheckboxSize = "default" | "large";

@Component({
  standalone: true,
  selector: "input[type=checkbox][tedi-checkbox]",
  template: "",
  styleUrl: "./checkbox.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-checkbox--large]": "size() === 'large'",
    "[class.tedi-checkbox--invalid]": "invalid()",
    "[disabled]": "effectiveDisabled()",
    "(change)": "handleChange()",
  },
})
export class CheckboxComponent implements OnInit, OnDestroy {
  /**
   * Size of the checkbox.
   * @default default
   */
  readonly size = input<CheckboxSize>("default");
  /**
   * Is checkbox invalid?
   * @default false
   */
  readonly invalid = input(false);
  /**
   * Identity of this checkbox inside a managed `<tedi-checkbox-group>`.
   * Required when the parent group is managed (has a FormControl or
   * `[(values)]` binding). Ignored otherwise.
   */
  readonly value = input<string>();
  /**
   * Disables this checkbox. An enclosing disabled `<tedi-checkbox-group>`
   * forces disabled regardless of this input.
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly elementRef =
    inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly group = inject(CheckboxGroupComponent, { optional: true });
  private warned = false;

  readonly effectiveDisabled = computed(
    () => this.disabled() || (this.group?.isDisabled() ?? false),
  );

  get hostElement(): HTMLInputElement {
    return this.elementRef.nativeElement;
  }

  ngOnInit(): void {
    this.group?.registerChild(this);
  }

  ngOnDestroy(): void {
    this.group?.unregisterChild(this);
  }

  handleChange(): void {
    if (!this.group || !this.group.isManaged()) return;
    if (this.effectiveDisabled()) return;
    const v = this.value();
    if (v === undefined) {
      if (!this.warned) {
        this.warned = true;
        this.group.warnMissingValue();
      }
      return;
    }
    this.group.onChildChange(v, this.hostElement.checked);
  }
}
