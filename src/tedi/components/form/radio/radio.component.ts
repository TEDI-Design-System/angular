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
import { RadioGroupComponent } from "../radio-group/radio-group.component";

export type RadioSize = "default" | "large";

@Component({
  standalone: true,
  selector: "input[type=radio][tedi-radio]",
  template: "",
  styleUrl: "./radio.component.scss",
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "[class.tedi-radio--large]": "size() === 'large'",
    "[class.tedi-radio--invalid]": "invalid()",
    "[disabled]": "effectiveDisabled()",
    "(change)": "handleChange()",
  },
})
export class RadioComponent implements OnInit, OnDestroy {
  /**
   * Size of the radio.
   * @default default
   */
  readonly size = input<RadioSize>("default");
  /**
   * Is radio invalid?
   * @default false
   */
  readonly invalid = input(false);
  /**
   * Identity of this radio inside a managed `<tedi-radio-group>`. Required
   * when the parent group is managed (has a FormControl or `[(value)]`
   * binding). Ignored otherwise.
   */
  readonly value = input<string>();
  /**
   * Disables this radio. An enclosing disabled `<tedi-radio-group>` forces
   * disabled regardless of this input.
   * @default false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly elementRef =
    inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly group = inject(RadioGroupComponent, { optional: true });
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
    if (this.hostElement.checked) {
      this.group.onChildChange(v);
    }
  }
}
